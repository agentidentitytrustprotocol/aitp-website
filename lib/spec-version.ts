import tags from '@/data/spec-tags.json';

// A spec release tag: vMAJOR.MINOR.PATCH with an optional pre-release suffix
// (v0.3.2-draft). The schema-v* tags version the schema files, not the spec.
const RELEASE = /^v(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;

/** Newest spec release tag by SemVer precedence, or null if there is none. */
export function latestSpecVersion(all: readonly string[]): string | null {
  let best: { tag: string; key: number[]; pre?: string } | null = null;
  for (const tag of all) {
    const m = RELEASE.exec(tag);
    if (!m) continue;
    const cand = { tag, key: [+m[1], +m[2], +m[3]], pre: m[4] };
    if (!best || compare(cand, best) > 0) best = cand;
  }
  return best?.tag ?? null;
}

function compare(a: { key: number[]; pre?: string }, b: { key: number[]; pre?: string }): number {
  for (let i = 0; i < 3; i++) if (a.key[i] !== b.key[i]) return a.key[i] - b.key[i];
  // A release outranks its own pre-releases (0.3.3 > 0.3.3-draft).
  if (a.pre === b.pre) return 0;
  if (a.pre === undefined) return 1;
  if (b.pre === undefined) return -1;
  return a.pre < b.pre ? -1 : 1;
}

/** The spec's latest release, from data/spec-tags.json (written by the sync). */
export const SPEC_VERSION = latestSpecVersion(tags) ?? 'draft';
