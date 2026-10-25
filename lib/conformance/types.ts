// The parts of a conformance report (schema conformance-report.json,
// report_version "1") that the matrix and badges read.

export type Outcome = 'pass' | 'fail' | 'skip' | 'excluded_by_role';
export type Tier = 'core' | 'extension' | 'draft';

export interface ConformanceReport {
  report_version: '1';
  implementation: { name: string; version: string; repository: string; commit?: string };
  spec: { commit: string; version: string; protocol: 'aitp/0.3' };
  features_enabled: string[];
  results: {
    id: string;
    status: Tier;
    feature: string | null;
    required_for_core: boolean;
    outcome: Outcome;
  }[];
  totals: Record<Tier, Record<Outcome, number>>;
  gates: { name: string; passed: boolean; criteria: string; blocking?: string[] }[];
  generated_at: string;
  provenance?: { ci_run_url?: string };
}
