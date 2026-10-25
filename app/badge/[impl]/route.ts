import { loadMatrix } from '@/lib/conformance/reports';
import { badgeClaim, badgeSvg } from '@/lib/conformance/badge';

// /badge/<impl>.svg, generated at build time for each implementation whose
// report earns a claim. Anything else is a 404: there is no badge without a
// report behind it.
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return loadMatrix()
    .filter((row) => row.report && badgeClaim(row.report))
    .map((row) => ({ impl: `${row.impl.id}.svg` }));
}

export async function GET(_req: Request, ctx: { params: Promise<{ impl: string }> }) {
  const { impl } = await ctx.params;
  const row = loadMatrix().find((r) => `${r.impl.id}.svg` === impl);
  const claim = row?.report && badgeClaim(row.report);
  if (!row?.report || !claim) return new Response('Not found', { status: 404 });
  return new Response(badgeSvg(row.report, claim), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
