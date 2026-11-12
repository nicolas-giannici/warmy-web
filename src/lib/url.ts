// Prefija rutas internas con el "base" de Astro (en GitHub Pages el sitio vive en /warmy-web/).
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const u = (p: string) => (p.startsWith('/') && !p.startsWith('//') ? BASE + p : p);
