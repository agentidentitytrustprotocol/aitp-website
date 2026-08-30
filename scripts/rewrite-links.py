#!/usr/bin/env python3
"""Rewrite Markdown links in synced MDX so they resolve on the website.

The synced content is copied verbatim out of five source repos, so its links
are written for the repo they came from: relative paths like
`../schemas/foo.json`, `RFC-AITP-0001-core.md`, or `crates/aitp-cli/README.md`.
Only a subset of each repo becomes a site route; the rest has no page to link
to.

This pass resolves every relative link against the *origin* of the file it
appears in — the repo and path the sync script copied it from, recorded in the
sync manifest — and then rewrites it one of two ways:

  * the target is itself synced  -> the site route for it  (/spec/core#anchor)
  * the target is not synced     -> its canonical GitHub URL

Doing it from the origin path is what makes both cases correct. A pure textual
pass cannot tell `docs/sdk-python.md` (a page, at /sdks/python) from
`docs/design/foo.md` (not synced) without knowing where the link is written.
"""

import os
import re
import sys

ORG = "agentidentitytrustprotocol"
BRANCH = "main"

# Markdown links and images, excluding anchors already pointing at a URL.
LINK = re.compile(r'(!?\[[^\]]*\]\()([^)\s]+?)((?:\s+"[^"]*")?\))')
FENCE = re.compile(r'^\s*(```|~~~)')


def load_manifest(path):
    """target_mdx -> (repo, path within repo), plus the reverse index."""
    origin = {}
    route_of = {}
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.rstrip("\n")
            if not line:
                continue
            target, repo, repo_path = line.split("\t")
            origin[os.path.normpath(target)] = (repo, repo_path)
            route_of[(repo, repo_path)] = None  # filled in by build_routes
    return origin, route_of


def route_for(content_dir, target_mdx):
    """content/spec/core.mdx -> /spec/core ; content/docs/index.mdx -> /docs"""
    rel = os.path.relpath(target_mdx, content_dir)
    assert rel.endswith(".mdx")
    parts = rel[:-4].split(os.sep)
    if parts[-1] == "index":
        parts = parts[:-1]
    return "/" + "/".join(parts)


def github_url(repo, repo_path):
    kind = "tree" if repo_path.endswith("/") else "blob"
    return f"https://github.com/{ORG}/{repo}/{kind}/{BRANCH}/{repo_path.rstrip('/')}"


def split_anchor(target):
    if "#" in target:
        base, _, anchor = target.partition("#")
        return base, "#" + anchor
    return target, ""


def rewrite_target(target, repo, repo_dir, route_of):
    if re.match(r'^[a-z][a-z0-9+.-]*:', target) or target.startswith(("//", "#", "/")):
        return None  # absolute URL, mailto:, bare anchor, or already a site route

    base, anchor = split_anchor(target)
    if not base:
        return None

    is_dir = base.endswith("/")
    resolved = os.path.normpath(os.path.join(repo_dir, base))
    if resolved.startswith(".."):
        return None  # escapes the repo root; nothing sensible to point at
    if is_dir:
        resolved += "/"

    route = route_of.get((repo, resolved))
    if route is None and not is_dir:
        # Source repos link to Markdown with and without the extension.
        route = route_of.get((repo, resolved + ".md"))
    if route:
        return route + anchor
    return github_url(repo, resolved) + anchor


def process(path, repo, repo_path, route_of):
    repo_dir = os.path.dirname(repo_path)
    out = []
    in_fence = False
    changed = False
    for line in open(path, encoding="utf-8").read().splitlines(keepends=True):
        if FENCE.match(line):
            in_fence = not in_fence
            out.append(line)
            continue
        if in_fence:
            out.append(line)
            continue

        def sub(m):
            nonlocal changed
            new = rewrite_target(m.group(2), repo, repo_dir, route_of)
            if new is None or new == m.group(2):
                return m.group(0)
            changed = True
            return m.group(1) + new + m.group(3)

        out.append(LINK.sub(sub, line))

    if changed:
        with open(path, "w", encoding="utf-8") as fh:
            fh.write("".join(out))
    return changed


def main():
    content_dir, manifest_path = sys.argv[1], sys.argv[2]
    origin, route_of = load_manifest(manifest_path)

    for target_mdx, key in ((t, k) for t, k in origin.items()):
        route_of[key] = route_for(content_dir, target_mdx)

    n = 0
    for target_mdx, (repo, repo_path) in sorted(origin.items()):
        if os.path.exists(target_mdx) and process(target_mdx, repo, repo_path, route_of):
            n += 1
    print(f"  rewrote links in {n} files")


if __name__ == "__main__":
    main()
