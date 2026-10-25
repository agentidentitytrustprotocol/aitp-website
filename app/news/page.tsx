import Link from 'next/link';
import type { Metadata } from 'next';
import { Rss } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { allPosts, formatDate } from '@/lib/news';

export const metadata: Metadata = {
  title: 'News',
  description: 'Releases, freezes and review windows of the Agent Identity & Trust Protocol.',
  alternates: { types: { 'application/rss+xml': '/news/rss.xml' } },
};

export default function NewsIndexPage() {
  const posts = allPosts();
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
          <div className="mb-12 flex items-end justify-between gap-4">
            <div>
              <h1 className="mb-4 text-3xl font-bold tracking-tight text-fd-foreground sm:text-4xl">
                News
              </h1>
              <p className="text-lg text-fd-muted-foreground">
                Releases, freezes and review windows, each with a date you can cite.
              </p>
            </div>
            <a
              href="/news/rss.xml"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-fd-primary/20 px-3 py-1.5 text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
            >
              <Rss className="size-3.5" /> RSS
            </a>
          </div>

          <ol className="space-y-6">
            {posts.map((p) => (
              <li key={p.url}>
                <Link
                  href={p.url}
                  className="group block rounded-xl border border-fd-primary/15 bg-fd-card/40 p-6 transition-all duration-300 hover:border-fd-primary/40"
                >
                  <time dateTime={p.date} className="text-xs font-medium uppercase tracking-wider text-fd-primary">
                    {formatDate(p.date)}
                  </time>
                  <h2 className="mt-2 text-xl font-semibold text-fd-foreground group-hover:underline">
                    {p.title}
                  </h2>
                  {p.description && (
                    <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">{p.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <Footer />
    </>
  );
}
