"""Tests for escape-mdx.py (run by `npm test`)."""
import subprocess
import sys
import unittest
from pathlib import Path

ESCAPER = Path(__file__).with_name('escape-mdx.py')


def esc(text: str) -> str:
    return subprocess.run([sys.executable, str(ESCAPER)], input=text,
                          capture_output=True, text=True, check=True).stdout


class MultiWordPlaceholder(unittest.TestCase):
    def test_in_emphasis(self):
        # aitp-ui-console docs/FEATURES.md broke the sync build (issue #124).
        self.assertEqual(esc('*reached (resets <local time>)*\n'),
                         '*reached (resets &lt;local time&gt;)*\n')

    def test_mixed_case_and_punctuation(self):
        self.assertEqual(esc('send <own AID> and <expected vs. actual>\n'),
                         'send &lt;own AID&gt; and &lt;expected vs. actual&gt;\n')

    def test_html_element_with_boolean_attribute_kept(self):
        self.assertEqual(esc('<details open>\n'), '<details open>\n')

    def test_tag_with_valued_attribute_kept(self):
        self.assertEqual(esc('<a href="x">y</a>\n'), '<a href="x">y</a>\n')

    def test_code_untouched(self):
        self.assertEqual(esc('`<local time>`\n'), '`<local time>`\n')
        self.assertEqual(esc('```\n<local time>\n```\n'), '```\n<local time>\n```\n')

    def test_single_word_still_escaped(self):
        self.assertEqual(esc('<identifier>\n'), '&lt;identifier&gt;\n')


if __name__ == '__main__':
    unittest.main()
