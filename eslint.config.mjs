import next from 'eslint-config-next';

// Next.js 16 removed `next lint`; eslint-config-next 16 ships a native flat
// config array (core-web-vitals + typescript), so spread it directly instead
// of the old FlatCompat wrapper.
const eslintConfig = [
  {
    ignores: ['.source/**', '.next/**', 'node_modules/**'],
  },
  ...next,
];

export default eslintConfig;
