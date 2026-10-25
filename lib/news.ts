import { newsSource, type MdxPageData } from '@/lib/source';
import type { Post } from '@/lib/rss';

export { buildRss, SITE_URL, type Post } from '@/lib/rss';

type NewsData = MdxPageData & Omit<Post, 'slug' | 'url'>;

/** Every post, newest first. */
export function allPosts(): Post[] {
  return newsSource
    .getPages()
    .map((page) => {
      const d = page.data as unknown as NewsData;
      return {
        slug: page.slugs.join('/'),
        url: page.url,
        title: d.title,
        description: d.description ?? '',
        date: d.date,
        review: d.review,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** "2026-10-25" -> "October 25, 2026", without the server's time zone moving it. */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
