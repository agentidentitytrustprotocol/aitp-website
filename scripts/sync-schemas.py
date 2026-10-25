#!/usr/bin/env python3
"""Copy the spec's JSON Schemas to public/schema/v0.3/, named by their $id.

Usage:
  sync-schemas.py SPEC_DIR           write the files
  sync-schemas.py SPEC_DIR --check   fail if any served byte differs

The schemas are read from git objects at the ref in data/schema-pin.json, not
from the spec's working tree, so the served bytes always equal a tag (or
commit) and a dirty or differently-checked-out spec repo cannot leak in. Each
file is served at the path its `$id` names, which is what a validator fetches;
a schema whose `$id` is outside the namespace fails the sync.
"""
import json
import subprocess
import sys
from pathlib import Path

NAMESPACE = 'https://agentidentitytrustprotocol.io/schema/v0.3/'
REPO_ROOT = Path(__file__).resolve().parent.parent
PIN_FILE = REPO_ROOT / 'data' / 'schema-pin.json'
OUT_DIR = REPO_ROOT / 'public' / 'schema' / 'v0.3'


def git(spec: Path, *args: str) -> bytes:
    return subprocess.run(['git', '-C', str(spec), *args], check=True,
                          capture_output=True).stdout


def resolve(spec: Path, ref: str) -> str:
    """Commit SHA for ref, fetching it when a shallow CI clone lacks it."""
    for cand in (f'origin/{ref}', f'refs/tags/{ref}', ref):
        try:
            return git(spec, 'rev-parse', '--verify', '-q', f'{cand}^{{commit}}').decode().strip()
        except subprocess.CalledProcessError:
            pass
    git(spec, 'fetch', '-q', '--depth=1', 'origin', ref)
    return git(spec, 'rev-parse', 'FETCH_HEAD^{commit}').decode().strip()


def pinned_schemas(spec: Path, commit: str) -> dict[str, bytes]:
    names = git(spec, 'ls-tree', '--name-only', commit, 'schemas/json/').decode().split()
    out: dict[str, bytes] = {}
    for path in names:
        if not path.endswith('.schema.json'):
            continue
        body = git(spec, 'show', f'{commit}:{path}')
        sid = json.loads(body).get('$id', '')
        if not sid.startswith(NAMESPACE) or '/' in sid[len(NAMESPACE):]:
            sys.exit(f'{path}: $id {sid!r} is not directly under {NAMESPACE}')
        name = sid[len(NAMESPACE):]
        if name in out:
            sys.exit(f'{path}: $id {sid!r} is claimed by two schemas')
        out[name] = body
    if not out:
        sys.exit(f'no schemas under schemas/json/ at {commit}')
    return out


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    spec = Path(sys.argv[1])
    check = '--check' in sys.argv[2:]
    ref = json.loads(PIN_FILE.read_text())['ref']
    commit = resolve(spec, ref)
    want = pinned_schemas(spec, commit)
    have = {p.name: p.read_bytes() for p in OUT_DIR.glob('*.json')} if OUT_DIR.is_dir() else {}

    if check:
        bad = sorted(n for n in want.keys() | have.keys() if want.get(n) != have.get(n))
        for n in bad:
            state = 'missing' if n not in have else 'not in spec' if n not in want else 'differs'
            print(f'public/schema/v0.3/{n}: {state} (spec {ref} @ {commit[:7]})', file=sys.stderr)
        if bad:
            sys.exit('Served schemas do not match the pinned spec. Run ./scripts/sync-content.sh.')
        print(f'{len(want)} schemas match spec {ref} @ {commit[:7]}.')
        return

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for n in have.keys() - want.keys():
        (OUT_DIR / n).unlink()
    for n, body in want.items():
        (OUT_DIR / n).write_bytes(body)
    print(f'Wrote {len(want)} schemas from spec {ref} @ {commit[:7]}.')


if __name__ == '__main__':
    main()
