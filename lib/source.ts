import {
  docs,
  spec,
  registry,
  implementation,
  sdks,
  controlPlane,
  playground,
  consoleDocs,
} from '@/.source';
import { resolveFiles } from 'fumadocs-mdx';
import { loader } from 'fumadocs-core/source';
import type { ReactElement } from 'react';
import type { TableOfContents } from 'fumadocs-core/server';

export interface MdxPageData {
  title: string;
  description?: string;
  icon?: string;
  full?: boolean;
  body: (props: Record<string, unknown>) => ReactElement;
  toc: TableOfContents;
  structuredData: unknown;
}

export const docsSource = loader({
  baseUrl: '/docs',
  source: { files: resolveFiles({ docs: docs.docs, meta: docs.meta }) },
});

export const specSource = loader({
  baseUrl: '/spec',
  source: { files: resolveFiles({ docs: spec.docs, meta: spec.meta }) },
});

export const registrySource = loader({
  baseUrl: '/registry',
  source: { files: resolveFiles({ docs: registry.docs, meta: registry.meta }) },
});

export const implementationSource = loader({
  baseUrl: '/implementation',
  source: {
    files: resolveFiles({ docs: implementation.docs, meta: implementation.meta }),
  },
});

export const sdksSource = loader({
  baseUrl: '/sdks',
  source: { files: resolveFiles({ docs: sdks.docs, meta: sdks.meta }) },
});

export const controlPlaneSource = loader({
  baseUrl: '/control-plane',
  source: { files: resolveFiles({ docs: controlPlane.docs, meta: controlPlane.meta }) },
});

export const playgroundSource = loader({
  baseUrl: '/playground',
  source: { files: resolveFiles({ docs: playground.docs, meta: playground.meta }) },
});

export const consoleSource = loader({
  baseUrl: '/console',
  source: { files: resolveFiles({ docs: consoleDocs.docs, meta: consoleDocs.meta }) },
});
