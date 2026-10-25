import { allPosts, buildRss } from '@/lib/news';

export const dynamic = 'force-static';

export function GET() {
  return new Response(buildRss(allPosts()), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
