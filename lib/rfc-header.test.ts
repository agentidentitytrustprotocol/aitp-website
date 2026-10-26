import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseRfcHeader, specRfcHeader } from './rfc-header';

describe('parseRfcHeader', () => {
  const src = [
    '# A2A Agent Card Security Scheme',
    '',
    '**Document:** RFC-AITP-0014',
    '**Version:** 0.3.1-draft',
    '**Status:** Community Standards Track (Draft)',
  ].join('\n');

  it('reads document, version, status and the stage in parentheses', () => {
    expect(parseRfcHeader(src)).toEqual({
      document: 'RFC-AITP-0014',
      version: '0.3.1-draft',
      status: 'Community Standards Track (Draft)',
      stage: 'Draft',
    });
  });

  it('uses the whole status as the stage when there are no parentheses', () => {
    expect(parseRfcHeader(src.replace('Community Standards Track (Draft)', 'Final')).stage).toBe('Final');
  });

  it('throws when a field is missing', () => {
    expect(() => parseRfcHeader(src.replace(/\*\*Version:.*\n/, ''))).toThrow();
  });
});

// /ext/a2a/v1 is the A2A extension URI RFC-AITP-0014 publishes. It must keep
// serving RFC-0014; scripts/check-served-routes.py checks the live response.
describe('/ext/a2a/v1', () => {
  it('has a route', () => {
    expect(existsSync('app/ext/a2a/v1/page.tsx')).toBe(true);
  });

  it('serves the synced RFC-AITP-0014', () => {
    expect(specRfcHeader('a2a-agent-card').document).toBe('RFC-AITP-0014');
  });
});
