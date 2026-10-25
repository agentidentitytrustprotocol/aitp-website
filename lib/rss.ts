export const SITE_URL = 'https://agentidentitytrustprotocol.io';

export interface Post {
  slug: string;
  url: string;
  title: string;
  description: string;
  date: string;
  review?: { opens: string; closes: string; discussion: string };
}

function xml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** RSS 2.0 feed for the given posts (newest first). */
export function buildRss(posts: Post[]): string {
  const feed = `${SITE_URL}/news/rss.xml`;
  const items = posts
    .map((p) => {
      const link = `${SITE_URL}${p.url}`;
      return [
        '    <item>',
        `      <title>${xml(p.title)}</title>`,
        `      <link>${xml(link)}</link>`,
        `      <guid isPermaLink="true">${xml(link)}</guid>`,
        `      <pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate>`,
        `      <description>${xml(p.description)}</description>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');
  const updated = posts[0] ? new Date(`${posts[0].date}T00:00:00Z`).toUTCString() : undefined;
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>AITP News</title>',
    `    <link>${SITE_URL}/news</link>`,
    '    <description>Releases, freezes and review windows of the Agent Identity &amp; Trust Protocol.</description>',
    '    <language>en</language>',
    `    <atom:link href="${feed}" rel="self" type="application/rss+xml"/>`,
    ...(updated ? [`    <lastBuildDate>${updated}</lastBuildDate>`] : []),
    ...(items ? [items] : []),
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}
