'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Root, Item, Node } from 'fumadocs-core/page-tree';
import { Navbar } from '@/components/navbar';

interface Group {
  title: string;
  slug: string;
  items: Item[];
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function renderName(name: ReactNode): string {
  if (typeof name === 'string') return name;
  if (typeof name === 'number') return String(name);
  return '';
}

function flattenPages(nodes: readonly Node[]): Item[] {
  const out: Item[] = [];
  for (const node of nodes) {
    if (node.type === 'page') {
      out.push(node);
    } else if (node.type === 'folder') {
      if (node.index) out.push(node.index);
      out.push(...flattenPages(node.children));
    }
  }
  return out;
}

function groupPageTree(tree: Root): Group[] {
  const groups: Group[] = [];
  let current: Group = { title: 'Overview', slug: 'overview', items: [] };

  for (const node of tree.children) {
    if (node.type === 'separator') {
      if (current.items.length > 0) groups.push(current);
      const title = renderName(node.name) || 'Section';
      current = { title, slug: slugify(title) || 'section', items: [] };
    } else {
      current.items.push(...flattenPages([node]));
    }
  }
  if (current.items.length > 0) groups.push(current);
  return groups;
}

interface DocsShellProps {
  tree: Root;
  children: ReactNode;
}

export function DocsShell({ tree, children }: DocsShellProps) {
  const pathname = usePathname();
  const groups = useMemo(() => groupPageTree(tree), [tree]);

  const activeGroup = useMemo(() => {
    const match = groups.find((g) =>
      g.items.some((i) => i.url === pathname),
    );
    return match ?? groups[0];
  }, [groups, pathname]);

  return (
    <>
      <Navbar />

      {/* Section tabs (groups) */}
      {activeGroup && groups.length > 1 && (
        <div className="sticky top-14 z-40 border-b border-fd-border bg-fd-background/85 backdrop-blur-md">
          <div className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-8">
            <div className="flex items-stretch gap-0 overflow-x-auto">
              {groups.map((g) => {
                const isActive = g.slug === activeGroup.slug;
                const href = g.items[0]?.url ?? '#';
                return (
                  <Link
                    key={g.slug}
                    href={href}
                    className={`whitespace-nowrap px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? 'font-semibold text-fd-primary'
                        : 'text-fd-muted-foreground hover:text-fd-foreground'
                    }`}
                  >
                    {g.title}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="mx-auto w-full max-w-[80rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {children}
      </main>
    </>
  );
}
