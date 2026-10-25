import {
  docs,
  spec,
  registry,
  implementation,
  sdks,
  controlPlane,
  playground,
  consoleDocs,
  news,
} from '@/.source/server';
import { loader } from 'fumadocs-core/source';
import type { ReactElement } from 'react';
import type { TableOfContents } from 'fumadocs-core/toc';

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
  source: docs.toFumadocsSource(),
});

export const specSource = loader({
  baseUrl: '/spec',
  source: spec.toFumadocsSource(),
});

export const registrySource = loader({
  baseUrl: '/registry',
  source: registry.toFumadocsSource(),
});

export const implementationSource = loader({
  baseUrl: '/implementation',
  source: implementation.toFumadocsSource(),
});

export const sdksSource = loader({
  baseUrl: '/sdks',
  source: sdks.toFumadocsSource(),
});

export const controlPlaneSource = loader({
  baseUrl: '/control-plane',
  source: controlPlane.toFumadocsSource(),
});

export const playgroundSource = loader({
  baseUrl: '/playground',
  source: playground.toFumadocsSource(),
});

export const consoleSource = loader({
  baseUrl: '/console',
  source: consoleDocs.toFumadocsSource(),
});

export const newsSource = loader({
  baseUrl: '/news',
  source: news.toFumadocsSource(),
});
