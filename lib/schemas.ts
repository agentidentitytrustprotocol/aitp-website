import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import pin from '@/data/schema-pin.json';

export const SCHEMA_NAMESPACE = 'https://agentidentitytrustprotocol.io/schema/v0.3/';
export const SCHEMA_REF: string = pin.ref;

export interface ServedSchema {
  file: string;
  id: string;
  title: string;
  description: string;
}

/** The schemas under public/schema/v0.3/, as written by scripts/sync-schemas.py. */
export function servedSchemas(): ServedSchema[] {
  const dir = join(process.cwd(), 'public', 'schema', 'v0.3');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((file) => {
      const s = JSON.parse(readFileSync(join(dir, file), 'utf8'));
      return { file, id: s.$id, title: s.title ?? file, description: s.description ?? '' };
    });
}
