import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assertValidReport } from './validate';
import type { ConformanceReport } from './types';

export interface Implementation {
  id: string;
  name: string;
  description: string;
  repository: string;
}

export interface MatrixRow {
  impl: Implementation;
  /** null: no report has been published for this implementation yet. */
  report: ConformanceReport | null;
  ciRunUrl?: string;
}

export const DATA_DIR = join(process.cwd(), 'data', 'conformance');

/**
 * One row per implementation in implementations.json. Every report present is
 * validated against the report schema; an invalid one throws, which fails the
 * build rather than publishing a badge it does not back.
 */
export function loadMatrix(dir: string = DATA_DIR): MatrixRow[] {
  const impls: Implementation[] = JSON.parse(readFileSync(join(dir, 'implementations.json'), 'utf8'));
  const sourcesPath = join(dir, 'sources.json');
  const sources: Record<string, { ci_run_url?: string }> = existsSync(sourcesPath)
    ? JSON.parse(readFileSync(sourcesPath, 'utf8'))
    : {};
  return impls.map((impl) => {
    const path = join(dir, `${impl.id}.json`);
    if (!existsSync(path)) return { impl, report: null };
    const data: unknown = JSON.parse(readFileSync(path, 'utf8'));
    assertValidReport(data, `data/conformance/${impl.id}.json`);
    if (data.implementation.name !== impl.name) {
      throw new Error(`data/conformance/${impl.id}.json reports implementation ${data.implementation.name}, not ${impl.name}`);
    }
    return {
      impl,
      report: data,
      ciRunUrl: data.provenance?.ci_run_url ?? sources[impl.id]?.ci_run_url,
    };
  });
}

export interface Column {
  key: string;
  label: string;
  match: (r: ConformanceReport['results'][number]) => boolean;
}

/** Core, then one column per extension feature seen in any report, then draft. */
export function columns(rows: MatrixRow[]): Column[] {
  const features = new Set<string>();
  for (const { report } of rows) {
    for (const r of report?.results ?? []) if (r.status === 'extension' && r.feature) features.add(r.feature);
  }
  return [
    { key: 'core', label: 'Core', match: (r) => r.status === 'core' },
    ...[...features].sort().map((f) => ({
      key: f,
      label: f,
      match: (r: ConformanceReport['results'][number]) => r.status === 'extension' && r.feature === f,
    })),
    { key: 'draft', label: 'Draft', match: (r) => r.status === 'draft' },
  ];
}

export interface Counts {
  pass: number;
  fail: number;
  skip: number;
  excluded_by_role: number;
}

export function countCell(report: ConformanceReport, col: Column): Counts {
  const c: Counts = { pass: 0, fail: 0, skip: 0, excluded_by_role: 0 };
  for (const r of report.results) if (col.match(r)) c[r.outcome]++;
  return c;
}
