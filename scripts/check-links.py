#!/usr/bin/env python3
"""Fail if any internal Markdown link in content/ has no page to land on.

The synced content is written for the source repos, not for the site, so a
link that is perfectly valid upstream can 404 here. scripts/rewrite-links.py
resolves those during the sync; this checks that it actually worked, on every
PR, so a broken link is caught before it is published rather than by a reader.

Only site-internal targets are checked. Absolute URLs are the source repos'
business, not ours.
"""

import os
import re
import sys

CONTENT = "content"
# Standalone pages that are React, not MDX, so they have no file under content/.
EXTRA_ROUTES = {"/", "/community", "/e2e-flow", "/news", "/schema/v0.3", "/conformance", "/quickstart", "/ext/a2a/v1"}
LINK = re.compile(r'!?\[[^\]]*\]\(([^)\s]+?)(?:\s+"[^"]*")?\)')
FENCE = re.compile(r'^\s*(```|~~~)')


def routes():
    found = set(EXTRA_ROUTES)
    for dirpath, _, files in os.walk(CONTENT):
        for f in files:
            if not f.endswith(".mdx"):
                continue
            parts = os.path.relpath(os.path.join(dirpath, f), CONTENT)[:-4].split(os.sep)
            if parts[-1] == "index":
                parts = parts[:-1]
            found.add("/" + "/".join(parts))
    return found


def main():
    valid = routes()
    broken = []
    for dirpath, _, files in os.walk(CONTENT):
        for f in sorted(files):
            if not f.endswith(".mdx"):
                continue
            path = os.path.join(dirpath, f)
            in_fence = False
            for n, line in enumerate(open(path, encoding="utf-8"), 1):
                if FENCE.match(line):
                    in_fence = not in_fence
                    continue
                if in_fence:
                    continue
                for m in LINK.finditer(line):
                    t = m.group(1)
                    if re.match(r'^[a-z][a-z0-9+.-]*:', t) or t.startswith(("//", "#")):
                        continue
                    if not t.startswith("/"):
                        broken.append((path, n, t, "relative link — must be a site route"))
                        continue
                    if (t.split("#")[0].rstrip("/") or "/") not in valid:
                        broken.append((path, n, t, "no such route"))

    if broken:
        print(f"{len(broken)} broken internal link(s):\n", file=sys.stderr)
        for path, n, t, why in broken:
            print(f"  {path}:{n}  {t}  — {why}", file=sys.stderr)
        print("\nRe-run ./scripts/sync-content.sh; if that does not fix it, "
              "scripts/rewrite-links.py needs to learn the case.", file=sys.stderr)
        return 1
    print(f"All internal links resolve ({len(valid)} routes).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
