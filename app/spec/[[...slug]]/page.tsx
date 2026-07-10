import { specSource, type MdxPageData } from '@/lib/source';
import { PageShell } from '@/components/docs/page-shell';
import { notFound } from 'next/navigation';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Mermaid } from '@/components/mermaid';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = specSource.getPage(params.slug);
  if (!page) notFound();

  const data = page.data as unknown as MdxPageData;
  const MDX = data.body;
  const editUrl = `https://github.com/agentidentitytrustprotocol/aitp-website/edit/main/content/spec/${page.path}`;

  return (
    <PageShell
      title={data.title}
      description={data.description}
      toc={data.toc}
      editUrl={editUrl}
      tree={specSource.pageTree}
      currentUrl={page.url}
    >
      <MDX components={{ ...defaultMdxComponents, Mermaid }} />
    </PageShell>
  );
}

export function generateStaticParams() {
  return specSource.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = specSource.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
