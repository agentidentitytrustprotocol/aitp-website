import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { DocsShell } from '@/components/docs/docs-shell';
import { sdksSource } from '@/lib/source';

export const metadata: Metadata = {
  title: { default: 'SDKs', template: '%s | AITP SDKs' },
  description:
    'AITP language bindings — Python (aitp-py) and Node.js (aitp-node) SDKs built on the Rust reference implementation, exposing envelope signing, manifests, and the handshake.',
  openGraph: {
    title: 'AITP SDKs',
    description:
      'Python and Node.js bindings for the Agent Identity & Trust Protocol.',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <DocsShell tree={sdksSource.pageTree}>{children}</DocsShell>;
}
