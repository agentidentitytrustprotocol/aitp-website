import type { ConformanceReport } from './types';

/**
 * The RFC-AITP-0001 §10 claim strings, and no others (spec
 * docs/conformance-badge.md). The core claim comes first.
 */
export const CLAIMS = ['AITP v0.3', 'AITP v0.3 pinned-admission', 'AITP v0.3 self-attestation'] as const;
export type Claim = (typeof CLAIMS)[number];

/**
 * The claims a report earns: those whose gate says `passed: true`. Nothing is
 * inferred from results or totals. A gate that is missing, failed, or names
 * anything but a §10 claim earns nothing.
 */
export function earnedClaims(report: ConformanceReport): Claim[] {
  const passed = new Set(report.gates.filter((g) => g.passed === true).map((g) => g.name));
  return CLAIMS.filter((c) => passed.has(c));
}

/** The claim a row's badge shows: the core claim if earned, else the first extension claim. */
export function badgeClaim(report: ConformanceReport): Claim | null {
  return earnedClaims(report)[0] ?? null;
}

/** e.g. "AITP v0.3 · aitp-rs 0.23.0 · spec v0.3.2-draft (8dc2a5c) · 2026-10-25" */
export function badgeText(report: ConformanceReport, claim: Claim): string {
  const { name, version } = report.implementation;
  const { version: spec, commit } = report.spec;
  return `${claim} · ${name} ${version} · spec ${spec} (${commit.slice(0, 7)}) · ${report.generated_at.slice(0, 10)}`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Verdana 11px averages ~6.5px a glyph; close enough for a flat badge.
const width = (s: string) => Math.round(s.length * 6.5) + 20;

/** A flat two-part badge: the claim, then implementation, spec and date. */
export function badgeSvg(report: ConformanceReport, claim: Claim): string {
  const left = claim;
  const right = badgeText(report, claim).slice(claim.length + 3);
  const lw = width(left);
  const rw = width(right);
  const w = lw + rw;
  const label = esc(badgeText(report, claim));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="20" role="img" aria-label="${label}">
<title>${label}</title>
<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
<clipPath id="r"><rect width="${w}" height="20" rx="3" fill="#fff"/></clipPath>
<g clip-path="url(#r)"><rect width="${lw}" height="20" fill="#1e3a8a"/><rect x="${lw}" width="${rw}" height="20" fill="#2563eb"/><rect width="${w}" height="20" fill="url(#s)"/></g>
<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
<text x="${lw / 2}" y="14">${esc(left)}</text>
<text x="${lw + rw / 2}" y="14">${esc(right)}</text>
</g>
</svg>
`;
}
