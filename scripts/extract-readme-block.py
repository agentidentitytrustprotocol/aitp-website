#!/usr/bin/env python3
"""Print the body of the first code fence in a README whose info string matches.

Usage:
  extract-readme-block.py README INFO            print the block
  extract-readme-block.py README INFO --check F  fail unless F equals the block

The block is copied byte for byte. The fence rule is the one aitp-rs's
scripts/extract-readme-block.sh uses for its `bash readme-smoke` block: the
opening line is exactly ```INFO (trailing spaces allowed), and the block ends
at the next line starting with ```.
"""
import re
import sys
from pathlib import Path


def extract(readme: bytes, info: str) -> bytes:
    opening = re.compile(rb'^```' + re.escape(info.encode()) + rb'[ \t]*$')
    out, on = [], False
    for line in readme.splitlines(keepends=True):
        bare = line.rstrip(b'\r\n')
        if not on and opening.match(bare):
            on = True
        elif on and bare.startswith(b'```'):
            return b''.join(out)
        elif on:
            out.append(line)
    sys.exit(f'no closed ```{info} fence found')


def main() -> None:
    if len(sys.argv) not in (3, 5) or (len(sys.argv) == 5 and sys.argv[3] != '--check'):
        sys.exit(__doc__)
    block = extract(Path(sys.argv[1]).read_bytes(), sys.argv[2])
    if len(sys.argv) == 3:
        sys.stdout.buffer.write(block)
        return
    target = Path(sys.argv[4])
    if not target.exists() or target.read_bytes() != block:
        sys.exit(f'{target} differs from the ```{sys.argv[2]} block of {sys.argv[1]}. Run ./scripts/sync-content.sh.')
    print(f'{target} equals the ```{sys.argv[2]} block of {sys.argv[1]}.')


if __name__ == '__main__':
    main()
