import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * A code block copied verbatim out of a source README by
 * scripts/sync-quickstart.py (see data/quickstart/blocks.json). Never edit
 * the files by hand: CI fails when one differs from its README on main.
 */
export function quickstartBlock(file: string): string {
  return readFileSync(join(process.cwd(), 'data', 'quickstart', file), 'utf8');
}
