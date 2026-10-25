import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import type { ConformanceReport } from './types';

// The report schema as this site serves it (public/schema/v0.3/), which CI
// keeps byte-identical to the pinned spec tag.
const SCHEMA_PATH = join(process.cwd(), 'public', 'schema', 'v0.3', 'conformance-report.json');

let validator: ReturnType<Ajv2020['compile']> | undefined;

/** Throws, naming every violation, unless `data` is a valid report. */
export function assertValidReport(data: unknown, label: string): asserts data is ConformanceReport {
  if (!validator) {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajv);
    validator = ajv.compile(JSON.parse(readFileSync(SCHEMA_PATH, 'utf8')));
  }
  if (!validator(data)) {
    const errs = (validator.errors ?? []).map((e) => `  ${e.instancePath || '/'} ${e.message}`);
    throw new Error(`${label} is not a valid conformance report:\n${errs.join('\n')}`);
  }
}
