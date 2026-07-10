import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Root } from 'fumadocs-core/page-tree';
import { findNeighbour } from 'fumadocs-core/page-tree';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PageNavProps {
  tree: Root;
  currentUrl: string;
}

function renderName(name: ReactNode): string {
  if (typeof name === 'string') return name;
  if (typeof name === 'number') return String(name);
  return '';
}

export function PageNav({ tree, currentUrl }: PageNavProps) {
  const { previous, next } = findNeighbour(tree, currentUrl);
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Page navigation"
      className="mt-16 grid grid-cols-1 gap-4 border-t border-fd-border pt-8 sm:grid-cols-2"
    >
      {previous ? (
        <Link
          href={previous.url}
          className="group flex flex-col rounded-lg border border-fd-border bg-fd-card/40 p-4 transition-colors hover:border-fd-primary/40 hover:bg-fd-card/70"
        >
          <span className="flex items-center gap-1.5 text-xs font-medium text-fd-muted-foreground">
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            Previous
          </span>
          <span className="mt-1 text-sm font-semibold text-fd-foreground">
            {renderName(previous.name)}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={next.url}
          className="group flex flex-col items-end rounded-lg border border-fd-border bg-fd-card/40 p-4 text-right transition-colors hover:border-fd-primary/40 hover:bg-fd-card/70"
        >
          <span className="flex items-center gap-1.5 text-xs font-medium text-fd-muted-foreground">
            Next
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="mt-1 text-sm font-semibold text-fd-foreground">
            {renderName(next.name)}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
