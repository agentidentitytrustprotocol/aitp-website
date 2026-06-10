import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { DocsShell } from '@/components/docs/docs-shell';
import { specSource } from '@/lib/source';

export const metadata: Metadata = {
  title: { default: 'Specification', template: '%s | AITP Spec' },
  description:
    'The AITP specification — RFC-AITP-0001 through 0013 covering core, identity, manifest, mutual handshake, Trust Context Tokens, delegation, key resolution, revocation, and security.',
  openGraph: {
    title: 'AITP Specification',
    description:
      'RFC-driven specification for the Agent Identity & Trust Protocol.',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <DocsShell tree={specSource.pageTree}>{children}</DocsShell>;
}
