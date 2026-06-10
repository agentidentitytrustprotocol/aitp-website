import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { DocsShell } from '@/components/docs/docs-shell';
import { controlPlaneSource } from '@/lib/source';

export const metadata: Metadata = {
  title: { default: 'Control Plane', template: '%s | AITP Control Plane' },
  description:
    'AITP Control Plane — a coordination surface that hosts the agent registry, audit log, revocation list, and webhook fan-out. It observes and audits without sitting in the trust path.',
  openGraph: {
    title: 'AITP Control Plane',
    description:
      'Agent registry, audit event store, revocation serving, and webhook outbox for the Agent Identity & Trust Protocol.',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <DocsShell tree={controlPlaneSource.pageTree}>{children}</DocsShell>;
}
