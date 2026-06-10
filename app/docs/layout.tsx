import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { DocsShell } from '@/components/docs/docs-shell';
import { docsSource } from '@/lib/source';

export const metadata: Metadata = {
  title: { default: 'Documentation', template: '%s | AITP Docs' },
  description:
    'Learn how to establish bilateral trust between autonomous agents with AITP. Architecture, discovery, the mutual handshake, Trust Context Tokens, threat model, and integration guides.',
  openGraph: {
    title: 'AITP Documentation',
    description:
      'Guides for the Agent Identity & Trust Protocol — architecture, discovery, handshake, TCTs, security, and integration.',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <DocsShell tree={docsSource.pageTree}>{children}</DocsShell>;
}
