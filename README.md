# Warmy · web (Astro)

Tienda de tejidos de Warmy, armada a partir del diseño `design/warmy.pen` (v2 "Punto por punto", con Draco).

## Correr
```bash
cd web
npm install
npm run dev      # http://localhost:4321
npm run build    # genera dist/ (sitio estático)
```

## Publicación
Cada push a `main` publica el sitio en GitHub Pages (workflow `.github/workflows/deploy.yml`):
https://nicolas-giannici.github.io/warmy-web/ — por eso `astro.config.mjs` tiene `base: '/warmy-web'`.
Usá `u('/ruta')` (`src/lib/url.ts`) para cualquier link o imagen interna; en scripts del navegador, `import.meta.env.BASE_URL`.

## Estructura
- `src/data/products.ts`: catálogo, categorías y subcategorías, precios (placeholders), WhatsApp e Instagram (`INSTAGRAM` / `INSTAGRAM_HANDLE`: @warmy_acrochet, la cuenta donde Fio publica las piezas nuevas) y umbral de envío gratis.
- `src/layouts/Base.astro`: `<head>`, fuentes, nav, footer, drawer del carrito, toast, View Transitions.
- `src/components/`: Hero, Featured (carrusel), Categories (índice con preview), Custom (configurador a medida), ProductCard, CartDrawer, Nav (con menú móvil), Footer, Icon.
- `src/pages/`: `index`, `tienda`, `producto/[slug]`, `checkout`, `404`.
- `src/scripts/app.ts`: carrito (localStorage `warmy-cart`), drawer, menú, reveal on scroll, toast y "vuelo" al carrito.
- `public/ilus/*.svg`: ilustraciones de productos (placeholders), exportadas con `design/generador/export_web.py`.
- `public/fotos/princesas/*.jpg`: fotos de la subcolección Princesas, bajadas de las publicaciones de @warmy_acrochet y achicadas a 1100 px de ancho. Precios, medidas y horas de esas fichas son provisorios hasta que Fio pase la lista real.
- `public/draco/*.webp`: Draco (generado con Codex a partir de su foto).

## Pendiente
- Fotos reales: reemplazar `img` de cada producto en `products.ts` (PNG/WebP recortados sobre fondo transparente).
- Precios reales, número de WhatsApp (`WHATSAPP`) y reseñas reales.
- Backend Node: pedidos, Mercado Pago Checkout Pro (el botón de pago hoy solo valida el formulario) y newsletter.
