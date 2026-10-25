import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { newsSource, type MdxPageData } from '@/lib/source';
import { allPosts, formatDate } from '@/lib/news';

export default async function NewsPostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const page = newsSource.getPage([slug]);
  const post = allPosts().find((p) => p.slug === slug);
  if (!page || !post) notFound();
  const MDX = (page.data as unknown as MdxPageData).body;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
          <Link href="/news" className="text-sm text-fd-muted-foreground hover:text-fd-foreground">
            &larr; News
          </Link>
          <header className="mb-8 mt-6 border-b border-fd-border pb-6">
            <time dateTime={post.date} className="text-xs font-medium uppercase tracking-wider text-fd-primary">
              {formatDate(post.date)}
            </time>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-fd-foreground sm:text-4xl">
              {post.title}
            </h1>
            {post.description && (
              <p className="mt-3 text-lg leading-relaxed text-fd-muted-foreground">{post.description}</p>
            )}
          </header>

          {post.review && (
            <aside className="mb-8 rounded-xl border border-fd-primary/25 bg-fd-primary/5 p-5 text-sm">
              <p className="font-semibold text-fd-foreground">Public review window</p>
              <p className="mt-1 text-fd-muted-foreground">
                Opens <time dateTime={post.review.opens}>{formatDate(post.review.opens)}</time>. Closes{' '}
                <time dateTime={post.review.closes}>{formatDate(post.review.closes)}</time>, no earlier.
              </p>
              <a href={post.review.discussion} className="mt-2 inline-block font-medium text-fd-primary hover:underline">
                Comment in the review Discussion &rarr;
              </a>
            </aside>
          )}

          <div className="prose prose-neutral max-w-none dark:prose-invert">
            <MDX components={defaultMdxComponents} />
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

export function generateStaticParams() {
  return allPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const post = allPosts().find((p) => p.slug === slug);
  if (!post) notFound();
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: post.url, types: { 'application/rss+xml': '/news/rss.xml' } },
    openGraph: { type: 'article', publishedTime: post.date, title: post.title, description: post.description },
  };
}
