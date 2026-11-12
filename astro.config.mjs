import { defineConfig } from 'astro/config';

export default defineConfig({
  // GitHub Pages (sitio de proyecto): https://nicolas-giannici.github.io/warmy-web/
  site: 'https://nicolas-giannici.github.io',
  base: '/warmy-web',
  prefetch: { prefetchAll: true },
});
