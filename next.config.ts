import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // The spec's JSON Schemas, served at their `$id` (public/schema/).
        // A day of caching, then ETag revalidation: a later 0.3.x tag
        // replaces these files in place.
        source: '/schema/:version/:name.json',
        headers: [
          { key: 'Content-Type', value: 'application/schema+json' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        // The A2A extension URI of RFC-AITP-0014 (app/ext/a2a/v1). It serves
        // the RFC in place; the spec page is the canonical copy.
        source: '/ext/a2a/v1',
        headers: [
          { key: 'Link', value: '<https://agentidentitytrustprotocol.io/spec/a2a-agent-card>; rel="canonical"' },
        ],
      },
    ];
  },
};

export default withMDX(config);
