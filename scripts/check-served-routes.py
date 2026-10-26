#!/usr/bin/env python3
"""Serve the built site with `next start` and check the routes other software
fetches, whose responses are part of a contract rather than just a page.

- Each public/schema/v0.3/<name>.json must answer 200 with the schema media
  type, CORS `*` and a Cache-Control, and its body's `$id` must be the
  production URL of the path it was served from.
- /ext/a2a/v1, the A2A extension URI of RFC-AITP-0014, must answer 200 (not a
  redirect) with text/html, a canonical Link to the spec page, and a body that
  names RFC-AITP-0014 and carries the stage banner from the RFC header.

Run after `npm run build`.
"""
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORT = int(os.environ.get('PORT', '3107'))
BASE = f'http://127.0.0.1:{PORT}'
PROD = 'https://agentidentitytrustprotocol.io'


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


OPENER = urllib.request.build_opener(NoRedirect)


def get(path: str):
    try:
        with OPENER.open(BASE + path, timeout=10) as r:
            return r.status, r.headers, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.headers, e.read()


def main() -> None:
    names = sorted(p.name for p in (ROOT / 'public/schema/v0.3').glob('*.json'))
    if not names:
        sys.exit('no schemas in public/schema/v0.3/')
    server = subprocess.Popen(['npx', 'next', 'start', '-p', str(PORT)], cwd=ROOT,
                              stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
    errors = []
    try:
        for _ in range(60):
            try:
                urllib.request.urlopen(BASE + '/', timeout=2)
                break
            except (urllib.error.URLError, ConnectionError):
                time.sleep(1)
        else:
            sys.exit('next start did not come up')

        for name in names:
            path = f'/schema/v0.3/{name}'
            status, h, body = get(path)
            if status != 200:
                errors.append(f'{path}: HTTP {status}')
                continue
            if h.get('Content-Type', '').split(';')[0] != 'application/schema+json':
                errors.append(f'{path}: Content-Type {h.get("Content-Type")!r}')
            if h.get('Access-Control-Allow-Origin') != '*':
                errors.append(f'{path}: Access-Control-Allow-Origin {h.get("Access-Control-Allow-Origin")!r}')
            if 'max-age' not in h.get('Cache-Control', ''):
                errors.append(f'{path}: Cache-Control {h.get("Cache-Control")!r}')
            if json.loads(body).get('$id') != PROD + path:
                errors.append(f'{path}: $id is not {PROD + path}')
            if body != (ROOT / 'public/schema/v0.3' / name).read_bytes():
                errors.append(f'{path}: served bytes differ from the file')
        status, _, _ = get('/schema/v0.3')
        if status != 200:
            errors.append(f'/schema/v0.3 (index): HTTP {status}')
        errors += check_ext_a2a()
    finally:
        server.terminate()
        server.wait()

    for e in errors:
        print(e, file=sys.stderr)
    if errors:
        sys.exit(1)
    print(f'{len(names)} schemas served with the right headers and $id; /ext/a2a/v1 serves RFC-AITP-0014.')


def check_ext_a2a() -> list:
    path = '/ext/a2a/v1'
    status, h, body = get(path)
    if status != 200:
        return [f'{path}: HTTP {status} (must be 200, never a redirect)']
    errors = []
    if h.get('Content-Type', '').split(';')[0] != 'text/html':
        errors.append(f'{path}: Content-Type {h.get("Content-Type")!r}')
    want = f'<{PROD}/spec/a2a-agent-card>; rel="canonical"'
    if want not in h.get('Link', ''):
        errors.append(f'{path}: Link {h.get("Link")!r}, want {want!r}')
    html = body.decode('utf-8')
    if 'RFC-AITP-0014' not in html:
        errors.append(f'{path}: body does not name RFC-AITP-0014')
    src = (ROOT / 'content/spec/a2a-agent-card.mdx').read_text(encoding='utf-8')
    m = re.search(r'^\*\*Status:\*\*\s*(.+?)\s*$', src, re.M)
    # Same rule as lib/rfc-header.ts: the parenthesised part of Status, or all of it.
    paren = re.search(r'\(([^)]+)\)\s*$', m.group(1)) if m else None
    stage = paren.group(1) if paren else (m.group(1) if m else None)
    if not stage or f'data-rfc-stage="{stage}"' not in html:
        errors.append(f'{path}: no stage banner for stage {stage!r}')
    return errors


if __name__ == '__main__':
    main()
