import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
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

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMdxMermaid],
  },
});
