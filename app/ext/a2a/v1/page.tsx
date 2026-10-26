import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { specSource, type MdxPageData } from '@/lib/source';
import { specRfcHeader } from '@/lib/rfc-header';
import { PageShell } from '@/components/docs/page-shell';
import { Mermaid } from '@/components/mermaid';

// The A2A extension URI that RFC-AITP-0014 publishes. A2A clients fetch it and
// compare the URI, so it serves the RFC in place (200, never a redirect) and
// names the spec page as canonical in a Link header (next.config.ts).
// The URI is permanent: a breaking RFC-0014 change takes /ext/a2a/v2.
const SLUG = 'a2a-agent-card';
const CANONICAL = `https://agentidentitytrustprotocol.io/spec/${SLUG}`;

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'RFC-AITP-0014: A2A extension v1',
  description:
    'The AITP extension for the Agent2Agent protocol (A2A extension URI v1), specified by RFC-AITP-0014.',
  alternates: { canonical: CANONICAL },
};

export default function Page() {
  const page = specSource.getPage([SLUG]);
  if (!page) notFound();
  const data = page.data as unknown as MdxPageData;
  const MDX = data.body;
  const rfc = specRfcHeader(SLUG);
  const draft = /draft/i.test(rfc.stage);

  const banner = (
    <div
      role="note"
      data-rfc-stage={rfc.stage}
      className="mb-8 rounded-lg border border-fd-primary/30 bg-fd-primary/5 px-4 py-3 text-sm text-fd-foreground"
    >
      <p>
        <strong>A2A extension URI v1.</strong> This page is {rfc.document}, version{' '}
        <code>{rfc.version}</code>, stage: <strong>{rfc.stage}</strong>.{' '}
        {draft && 'While the RFC is a draft, the extension may change. '}
        A breaking change takes <code>/ext/a2a/v2</code>; this URI is never repurposed.
      </p>
    </div>
  );

  return (
    <PageShell
      title={data.title}
      description={data.description}
      toc={data.toc}
      tree={specSource.pageTree}
      currentUrl={page.url}
      banner={banner}
    >
      <MDX components={{ ...defaultMdxComponents, Mermaid }} />
    </PageShell>
  );
}
