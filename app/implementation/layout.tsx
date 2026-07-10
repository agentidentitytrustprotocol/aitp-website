import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { DocsShell } from '@/components/docs/docs-shell';
import { implementationSource } from '@/lib/source';

export const metadata: Metadata = {
  title: { default: 'Implementation', template: '%s | AITP Implementation' },
  description:
    'aitp-rs — the Rust reference implementation of AITP. Core types, JCS canonicalization, Ed25519 and P-256 envelopes, manifest builder/verifier, HTTP transport, and a full v0.2 conformance suite.',
  openGraph: {
    title: 'AITP Reference Implementation',
    description:
      'Rust reference implementation of the Agent Identity & Trust Protocol with full conformance coverage and language bindings.',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <DocsShell tree={implementationSource.pageTree}>{children}</DocsShell>;
}
