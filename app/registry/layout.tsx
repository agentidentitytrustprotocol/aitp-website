import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { DocsShell } from '@/components/docs/docs-shell';
import { registrySource } from '@/lib/source';

export const metadata: Metadata = {
  title: { default: 'Registry', template: '%s | AITP Registry' },
  description:
    'AITP registries — the authoritative lists of identity types, capabilities, media types, error codes, and extension keys that interoperating agents share.',
  openGraph: {
    title: 'AITP Registry',
    description:
      'Identity types, capabilities, media types, error codes, and extension keys for the Agent Identity & Trust Protocol.',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <DocsShell tree={registrySource.pageTree}>{children}</DocsShell>;
}
