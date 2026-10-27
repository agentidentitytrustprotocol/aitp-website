import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadMatrix, columns, countCell } from './reports';
import { badgeClaim, badgeSvg, badgeText, earnedClaims } from './badge';

const fixtures = (name: string) => join(__dirname, '__fixtures__', name);

describe('loadMatrix', () => {
  it('loads the committed reports', () => {
    const rows = loadMatrix();
    expect(rows.map((r) => r.impl.id)).toEqual(['aitp-rs', 'aitp-verifier-py', 'aitp-verifier-ts', 'aitp-verifier-go']);
    for (const row of rows) expect(row.report).not.toBeNull();
  });

  it('gives an implementation with no report a row with no report', () => {
    const absent = loadMatrix(fixtures('valid')).find((r) => r.impl.id === 'absent');
    expect(absent?.report).toBeNull();
  });

  it('throws on a report that fails the schema', () => {
    expect(() => loadMatrix(fixtures('invalid'))).toThrow(/not a valid conformance report/);
  });
});

describe('badges', () => {
  const valid = loadMatrix(fixtures('valid'))[0].report!;
  const failing = loadMatrix(fixtures('failing-gate'))[0].report!;

  it('earns every claim whose gate passed', () => {
    expect(earnedClaims(valid)).toEqual(['AITP v0.3', 'AITP v0.3 pinned-admission', 'AITP v0.3 self-attestation']);
    expect(badgeClaim(valid)).toBe('AITP v0.3');
  });

  it('gives no core claim when gate.passed is false', () => {
    expect(earnedClaims(failing)).not.toContain('AITP v0.3');
    expect(badgeClaim(failing)).toBe('AITP v0.3 pinned-admission');
  });

  it('ignores a passed gate that is not an RFC-AITP-0001 §10 claim', () => {
    const r = { ...failing, gates: [...failing.gates, { name: 'AITP v0.3 gold', passed: true, criteria: 'x' }] };
    expect(earnedClaims(r)).not.toContain('AITP v0.3 gold');
  });

  it('earns nothing when no gate passed', () => {
    const r = { ...valid, gates: valid.gates.map((g) => ({ ...g, passed: false })) };
    expect(badgeClaim(r)).toBeNull();
  });

  it('shows the claim, implementation, spec version and commit, and date', () => {
    const { name, version } = valid.implementation;
    expect(badgeText(valid, 'AITP v0.3')).toBe(
      `AITP v0.3 · ${name} ${version} · spec ${valid.spec.version} (${valid.spec.commit.slice(0, 7)}) · ${valid.generated_at.slice(0, 10)}`,
    );
    expect(badgeSvg(valid, 'AITP v0.3')).toContain('<title>AITP v0.3 · ');
  });
});

describe('matrix cells', () => {
  it('counts each column from results, matching the report totals', () => {
    const rows = loadMatrix(fixtures('failing-gate'));
    const report = rows[0].report!;
    const cols = columns(rows);
    expect(cols[0].key).toBe('core');
    expect(cols.at(-1)!.key).toBe('draft');
    expect(countCell(report, cols[0])).toEqual(report.totals.core);
    const ext = cols.slice(1, -1).map((c) => countCell(report, c));
    expect(ext.reduce((n, c) => n + c.pass, 0)).toBe(report.totals.extension.pass);
  });
});
