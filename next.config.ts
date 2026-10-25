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
    ];
  },
};

export default withMDX(config);
