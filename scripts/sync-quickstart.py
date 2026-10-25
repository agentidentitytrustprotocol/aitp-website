#!/usr/bin/env python3
"""Copy the quickstart's code blocks out of source-repo READMEs, never retyped.

Usage:
  sync-quickstart.py            write data/quickstart/<file> from local checkouts
  sync-quickstart.py --check    fail unless each file equals its block on main

data/quickstart/blocks.json maps each file to a repo and a fence info string
(scripts/extract-readme-block.py). Writing reads each README from the CI
checkout (<repo>-repo/) or the sibling checkout (../<repo>), like
sync-content.sh. --check reads each README from the repo's main branch on
GitHub, so CI notices when a source README moves on.
"""
import json
import sys
import urllib.request
from pathlib import Path

# Import the sibling extractor without leaving __pycache__/ in scripts/.
sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from importlib import import_module

extract = import_module('extract-readme-block').extract

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'data' / 'quickstart'
ORG = 'agentidentitytrustprotocol'


def local_readme(repo: str) -> bytes:
    for d in (ROOT / f'{repo}-repo', ROOT.parent / repo):
        if (d / 'README.md').is_file():
            return (d / 'README.md').read_bytes()
    sys.exit(f'{repo}: no README.md in {repo}-repo/ or ../{repo}')


def main_readme(repo: str) -> bytes:
    url = f'https://raw.githubusercontent.com/{ORG}/{repo}/main/README.md'
    with urllib.request.urlopen(url, timeout=30) as r:
        return r.read()


def main() -> None:
    check = '--check' in sys.argv[1:]
    blocks = json.loads((DATA / 'blocks.json').read_text())
    cache: dict[str, bytes] = {}
    bad = []
    for b in blocks:
        repo = b['repo']
        if repo not in cache:
            cache[repo] = main_readme(repo) if check else local_readme(repo)
        block = extract(cache[repo], b['info'])
        target = DATA / b['file']
        if check:
            if not target.is_file() or target.read_bytes() != block:
                bad.append(f'data/quickstart/{b["file"]} differs from the ```{b["info"]} block of {repo} README on main')
        else:
            target.write_bytes(block)
    for e in bad:
        print(e, file=sys.stderr)
    if bad:
        sys.exit('Run ./scripts/sync-content.sh to resync the quickstart.')
    print(f'{"Checked" if check else "Wrote"} {len(blocks)} quickstart blocks.')


if __name__ == '__main__':
    main()
