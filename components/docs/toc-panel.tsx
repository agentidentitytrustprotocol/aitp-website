'use client';

import { AnchorProvider, TOCItem } from 'fumadocs-core/toc';
import type { TableOfContents } from 'fumadocs-core/server';

interface TocPanelProps {
  toc: TableOfContents;
}

export function TocPanel({ toc }: TocPanelProps) {
  const topLevel = toc?.filter((item) => item.depth <= 2) ?? [];
  if (topLevel.length === 0) return null;

  return (
    <AnchorProvider toc={topLevel}>
      <nav
        aria-label="Table of Contents"
        className="sticky top-[6.5rem] max-h-[calc(100vh-6.5rem)] overflow-y-auto pt-10"
      >
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-fd-muted-foreground">
          On this page
        </p>
        <ul className="space-y-1.5 border-l border-fd-border">
          {topLevel.map((item) => (
            <li key={item.url}>
              <TOCItem
                href={item.url}
                className="block border-l-2 border-transparent pl-3 text-[13px] leading-snug text-fd-muted-foreground transition-colors hover:text-fd-foreground data-[active=true]:border-fd-primary data-[active=true]:font-medium data-[active=true]:text-fd-primary"
              >
                {item.title}
              </TOCItem>
            </li>
          ))}
        </ul>
      </nav>
    </AnchorProvider>
  );
}
