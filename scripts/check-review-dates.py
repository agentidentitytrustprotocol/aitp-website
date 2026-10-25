#!/usr/bin/env python3
"""Fail if a post's review window disagrees with its GitHub Discussion.

A post that announces a review carries `review.opens`, `review.closes` and
`review.discussion` in its frontmatter. The Discussion states the same window
as "**Opens:** YYYY-MM-DD" and "**Closes:** YYYY-MM-DD". The two are one
statement made in two places, so CI keeps them equal. Needs `gh` (GH_TOKEN).
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

NEWS = Path(__file__).resolve().parent.parent / 'content' / 'news'
DISCUSSION = re.compile(r'^https://github\.com/([^/]+)/([^/]+)/discussions/(\d+)$')


def frontmatter_review(text: str) -> dict[str, str] | None:
    m = re.match(r'^---\n(.*?)\n---\n', text, re.S)
    if not m or not re.search(r'^review:\s*$', m.group(1), re.M):
        return None
    block = m.group(1).split('review:', 1)[1]
    return {k: v for k, v in re.findall(r'^\s+(opens|closes|discussion):\s*"?([^"\n]+)"?\s*$', block, re.M)}


def discussion_body(url: str) -> str:
    owner, repo, num = DISCUSSION.match(url).groups()
    q = ('query($o:String!,$r:String!,$n:Int!){repository(owner:$o,name:$r)'
         '{discussion(number:$n){body}}}')
    out = subprocess.run(['gh', 'api', 'graphql', '-f', f'query={q}', '-f', f'o={owner}',
                          '-f', f'r={repo}', '-F', f'n={num}'],
                         check=True, capture_output=True, text=True).stdout
    return json.loads(out)['data']['repository']['discussion']['body']


def main() -> None:
    errors, checked = [], 0
    for post in sorted(NEWS.glob('*.mdx')):
        review = frontmatter_review(post.read_text())
        if review is None:
            continue
        if not DISCUSSION.match(review.get('discussion', '')):
            errors.append(f'{post.name}: review.discussion is not a GitHub Discussion URL')
            continue
        body = discussion_body(review['discussion'])
        for key in ('opens', 'closes'):
            m = re.search(rf'\*\*{key.capitalize()}:\*\*\s*(\d{{4}}-\d{{2}}-\d{{2}})', body)
            if not m:
                errors.append(f'{post.name}: the Discussion states no {key.capitalize()} date')
            elif m.group(1) != review.get(key):
                errors.append(f'{post.name}: review.{key} is {review.get(key)}, the Discussion says {m.group(1)}')
        checked += 1
    for e in errors:
        print(e, file=sys.stderr)
    if errors:
        sys.exit(1)
    print(f'{checked} review window(s) match their Discussion.')


if __name__ == '__main__':
    main()
