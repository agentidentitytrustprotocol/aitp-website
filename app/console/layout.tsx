import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { DocsShell } from '@/components/docs/docs-shell';
import { consoleSource } from '@/lib/source';

export const metadata: Metadata = {
  title: { default: 'Console', template: '%s | AITP Console' },
  description:
    'Documentation for the AITP Console — the monitoring and control panel for AITP deployments.',
  // The console docs are operational reference; keep them out of the search index.
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <DocsShell tree={consoleSource.pageTree}>{children}</DocsShell>;
}
