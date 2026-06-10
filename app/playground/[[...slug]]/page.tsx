import { playgroundSource, type MdxPageData } from '@/lib/source';
import { PageShell } from '@/components/docs/page-shell';
import { notFound } from 'next/navigation';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Mermaid } from '@/components/mermaid';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = playgroundSource.getPage(params.slug);
  if (!page) notFound();

  const data = page.data as unknown as MdxPageData;
  const MDX = data.body;
  const editUrl = `https://github.com/agentidentitytrustprotocol/aitp-website/edit/main/content/playground/${page.file.path}`;

  return (
    <PageShell
      title={data.title}
      description={data.description}
      toc={data.toc}
      editUrl={editUrl}
      tree={playgroundSource.pageTree}
      currentUrl={page.url}
    >
      <MDX components={{ ...defaultMdxComponents, Mermaid }} />
    </PageShell>
  );
}

export function generateStaticParams() {
  return playgroundSource.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = playgroundSource.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
