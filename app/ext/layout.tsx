import type { ReactNode } from 'react';
import { DocsShell } from '@/components/docs/docs-shell';
import { specSource } from '@/lib/source';

// Extension URIs serve spec pages in place, so they share the spec's shell.
export default function Layout({ children }: { children: ReactNode }) {
  return <DocsShell tree={specSource.pageTree}>{children}</DocsShell>;
}
