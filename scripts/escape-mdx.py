#!/usr/bin/env python3
"""Escape MDX-hostile angle brackets in prose while leaving code untouched.

Reads stdin, writes stdout. Skips fenced code blocks (``` / ~~~) and inline
code spans (backtick runs) entirely, so placeholder tokens like <identifier>,
<uuid-v4>, <base64url> and numeric comparisons like <43 are escaped only where
MDX would actually try to parse them as JSX.
"""
import sys
import re

PLACEHOLDER = re.compile(r'<([A-Za-z][A-Za-z0-9_./:-]*)>')


def escape_prose(text: str) -> str:
    # <placeholder> style tokens -> &lt;placeholder&gt;  (skips <https://...>: the
    # ':' is allowed inside but a bare URL has no trailing '>' immediately, and real
    # autolinks are preserved because they don't match the closing '>' pattern here).
    def repl(m: 're.Match') -> str:
        inner = m.group(1)
        if inner.startswith(('http://', 'https://', 'mailto:')):
            return m.group(0)  # keep autolinks intact
        return f'&lt;{inner}&gt;'

    text = PLACEHOLDER.sub(repl, text)
    # '<' immediately followed by a digit (e.g. <43, <1s) -> escape the bracket only
    text = re.sub(r'<(?=[0-9])', '&lt;', text)
    # Bare braces in prose are parsed by MDX as JS expressions; escape to entities.
    text = text.replace('{', '&#123;').replace('}', '&#125;')
    return text


def escape_code_span(span: str, in_table: bool) -> str:
    # Inside a table cell, an unescaped '|' (even within a code span) is treated as a
    # column delimiter by remark-gfm, which splits the cell and breaks the span. GFM
    # allows a backslash-escaped '\|' inside code spans, so escape them on table rows.
    if in_table:
        return re.sub(r'(?<!\\)\|', r'\\|', span)
    return span


def process_line(line: str) -> str:
    in_table = line.lstrip().startswith('|')
    out = []
    i, n = 0, len(line)
    while i < n:
        if line[i] == '`':
            j = i
            while j < n and line[j] == '`':
                j += 1
            fence = line[i:j]
            close = line.find(fence, j)
            if close == -1:
                out.append(escape_prose(line[i:]))
                i = n
            else:
                out.append(escape_code_span(line[i:close + len(fence)], in_table))
                i = close + len(fence)
        else:
            k = line.find('`', i)
            if k == -1:
                out.append(escape_prose(line[i:]))
                i = n
            else:
                out.append(escape_prose(line[i:k]))
                i = k
    return ''.join(out)


def main() -> None:
    in_fence = False
    fence_char = ''
    for line in sys.stdin:
        stripped = line.lstrip()
        m = re.match(r'^(`{3,}|~{3,})', stripped)
        if m:
            ch = m.group(1)[0]
            if not in_fence:
                in_fence, fence_char = True, ch
            elif ch == fence_char:
                in_fence = False
            sys.stdout.write(line)
            continue
        sys.stdout.write(line if in_fence else process_line(line))


if __name__ == '__main__':
    main()
