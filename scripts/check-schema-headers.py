#!/usr/bin/env python3
"""Serve the built site with `next start` and check every schema response.

Each public/schema/v0.3/<name>.json must answer 200 with the schema media type,
CORS `*` and a Cache-Control, and its body's `$id` must be the production URL
of the path it was served from. Run after `npm run build`.
"""
import json
import os
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


def get(path: str):
    try:
        with urllib.request.urlopen(BASE + path, timeout=10) as r:
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
    finally:
        server.terminate()
        server.wait()

    for e in errors:
        print(e, file=sys.stderr)
    if errors:
        sys.exit(1)
    print(f'{len(names)} schemas served with the right headers and $id.')


if __name__ == '__main__':
    main()
