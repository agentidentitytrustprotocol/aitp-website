import type { MetadataRoute } from 'next';
import {
  docsSource,
  specSource,
  registrySource,
  implementationSource,
  sdksSource,
  controlPlaneSource,
  playgroundSource,
} from '@/lib/source';

const BASE_URL = 'https://agentidentitytrustprotocol.io';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/community`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  // The console docs section is intentionally excluded (noindex operational reference).
  const sources = [
    { source: docsSource, priority: 0.9 },
    { source: specSource, priority: 0.9 },
    { source: sdksSource, priority: 0.8 },
    { source: implementationSource, priority: 0.7 },
    { source: controlPlaneSource, priority: 0.7 },
    { source: playgroundSource, priority: 0.7 },
    { source: registrySource, priority: 0.6 },
  ];

  const contentPages: MetadataRoute.Sitemap = sources.flatMap(
    ({ source, priority }) =>
      source.getPages().map((page) => ({
        url: `${BASE_URL}${page.url}`,
        changeFrequency: 'weekly' as const,
        priority,
      })),
  );

  return [...staticPages, ...contentPages];
}
