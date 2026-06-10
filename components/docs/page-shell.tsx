import type { ReactNode } from 'react';
import type { TableOfContents } from 'fumadocs-core/server';
import type { Root } from 'fumadocs-core/page-tree';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { TocPanel } from './toc-panel';
import { PageNav } from './page-nav';

interface PageShellProps {
  title: string;
  description?: string;
  toc: TableOfContents;
  editUrl?: string;
  tree?: Root;
  currentUrl?: string;
  children: ReactNode;
}

export function PageShell({
  title,
  description,
  toc,
  editUrl,
  tree,
  currentUrl,
  children,
}: PageShellProps) {
  return (
    <div className="grid grid-cols-1 gap-10 min-[960px]:grid-cols-[minmax(0,1fr)_250px] min-[960px]:gap-12">
      <article className="min-w-0">
        <header className="mb-8 border-b border-fd-border pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-fd-foreground sm:text-[2.15rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-base leading-relaxed text-fd-muted-foreground sm:text-lg">
              {description}
            </p>
          )}
        </header>

        <div className="prose prose-neutral max-w-none dark:prose-invert">
          {children}
        </div>

        {tree && currentUrl && <PageNav tree={tree} currentUrl={currentUrl} />}

        {editUrl && (
          <div className="mt-16 border-t border-fd-border pt-6">
            <Link
              href={editUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
            >
              <Pencil className="size-3.5" />
              Edit this page on GitHub
            </Link>
          </div>
        )}
      </article>

      <aside className="hidden min-[960px]:block">
        <TocPanel toc={toc} />
      </aside>
    </div>
  );
}
