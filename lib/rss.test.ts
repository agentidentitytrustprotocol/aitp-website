import { describe, expect, it } from 'vitest';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { buildRss, type Post } from './rss';

const posts: Post[] = [
  { slug: 'b', url: '/news/b', title: 'Freeze & review <0.3>', description: 'It is "frozen".', date: '2026-10-25' },
  { slug: 'a', url: '/news/a', title: 'Older', description: '', date: '2026-09-01' },
];

describe('buildRss', () => {
  const feed = buildRss(posts);

  it('is well-formed XML', () => {
    expect(XMLValidator.validate(feed)).toBe(true);
  });

  it('has the RSS 2.0 channel and item elements', () => {
    const doc = new XMLParser({ ignoreAttributes: false }).parse(feed);
    expect(doc.rss['@_version']).toBe('2.0');
    const ch = doc.rss.channel;
    expect(ch.title).toBe('AITP News');
    expect(ch.link).toBe('https://agentidentitytrustprotocol.io/news');
    expect(ch['atom:link']['@_href']).toBe('https://agentidentitytrustprotocol.io/news/rss.xml');
    expect(ch.item).toHaveLength(2);
    expect(ch.item[0].title).toBe('Freeze & review <0.3>');
    expect(ch.item[0].link).toBe('https://agentidentitytrustprotocol.io/news/b');
    expect(ch.item[0].pubDate).toBe('Sun, 25 Oct 2026 00:00:00 GMT');
  });

  it('is still valid with no posts', () => {
    expect(XMLValidator.validate(buildRss([]))).toBe(true);
  });
});
