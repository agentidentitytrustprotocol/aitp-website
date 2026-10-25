import { defineDocs, defineConfig, frontmatterSchema } from 'fumadocs-mdx/config';
import { z } from 'zod';
import { remarkMdxMermaid } from 'fumadocs-core/mdx-plugins';

export const docs = defineDocs({
  dir: 'content/docs',
});

export const spec = defineDocs({
  dir: 'content/spec',
});

export const registry = defineDocs({
  dir: 'content/registry',
});

export const implementation = defineDocs({
  dir: 'content/implementation',
});

export const sdks = defineDocs({
  dir: 'content/sdks',
});

export const controlPlane = defineDocs({
  dir: 'content/control-plane',
});

export const playground = defineDocs({
  dir: 'content/playground',
});

export const consoleDocs = defineDocs({
  dir: 'content/console',
});

// Hand-written posts, not synced. A post that announces a review window carries
// its dates once, in `review`; the page renders them from there and CI checks
// them against the Discussion (scripts/check-review-dates.py).
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const news = defineDocs({
  dir: 'content/news',
  docs: {
    schema: frontmatterSchema.extend({
      date: isoDate,
      review: z
        .object({ opens: isoDate, closes: isoDate, discussion: z.url() })
        .optional(),
    }),
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMdxMermaid],
  },
});
