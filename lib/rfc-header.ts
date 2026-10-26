import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** The `**Document:**` / `**Version:**` / `**Status:**` block every RFC opens with. */
export interface RfcHeader {
  document: string;
  version: string;
  status: string;
  /** The maturity stage: the parenthesised part of Status, or all of it. */
  stage: string;
}

function field(source: string, name: string): string | null {
  const m = new RegExp(`^\\*\\*${name}:\\*\\*\\s*(.+?)\\s*$`, 'm').exec(source);
  return m ? m[1] : null;
}

/** Parse an RFC's header block. Throws if a field is missing, so a header
 *  change upstream breaks the build instead of shipping a blank banner. */
export function parseRfcHeader(source: string): RfcHeader {
  const document = field(source, 'Document');
  const version = field(source, 'Version');
  const status = field(source, 'Status');
  if (!document || !version || !status) {
    throw new Error('RFC header is missing Document, Version or Status');
  }
  const stage = /\(([^)]+)\)\s*$/.exec(status)?.[1] ?? status;
  return { document, version, status, stage };
}

/** Header of a synced spec page, read from content/spec/<slug>.mdx. */
export function specRfcHeader(slug: string): RfcHeader {
  return parseRfcHeader(readFileSync(join(process.cwd(), 'content', 'spec', `${slug}.mdx`), 'utf8'));
}
