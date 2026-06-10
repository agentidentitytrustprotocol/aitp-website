import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { DocsShell } from '@/components/docs/docs-shell';
import { playgroundSource } from '@/lib/source';

export const metadata: Metadata = {
  title: { default: 'Playground', template: '%s | AITP Playground' },
  description:
    'The AITP Playground runs scenario demonstrations end-to-end with real LLM-powered agents — intra-org, cross-org, and cross-cloud handshakes with live event streams.',
  openGraph: {
    title: 'AITP Playground',
    description:
      'Run AITP scenarios end-to-end with real LLM-powered agents and live event streams.',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <DocsShell tree={playgroundSource.pageTree}>{children}</DocsShell>;
}
