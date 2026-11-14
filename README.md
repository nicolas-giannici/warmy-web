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
- `public/fotos/*`: fotos originales, tal como salieron de @warmy_acrochet (Instagram). Son la fuente: no se tocan.
- `public/fotos/recorte/*.webp`: las fotos prolijas que muestra la tienda. Ver [Fotos](#fotos).
- `public/fotos/princesas/*.jpg`: fotos de la subcolección Princesas, bajadas de las publicaciones de @warmy_acrochet y achicadas a 1100 px de ancho. Precios, medidas y horas de esas fichas son provisorios hasta que Fio pase la lista real.
- `public/draco/*.webp`: Draco (generado con Codex a partir de su foto).

## Fotos

Las fotos originales tienen fondos de madera, manos, sillas y stickers de precio. Para que se
vean parejas en la tienda, `tools/fotos/` las pasa a `public/fotos/recorte/`:

- **Recorte** (`<slug>.webp`): la pieza sola, sin fondo (WebP con transparencia), dentro de un
  lienzo 4:5. En las tarjetas se muestra entera sobre blanco.
- **Enmarcado** (`enmarcado-<slug>.webp`): la foto completa con marco blanco y esquinas
  redondeadas. Se usa cuando recortar no tiene sentido: la pieza puesta (mitones, polainas) o
  cuando el fondo está pegado a la pieza (la sombra del árbol de Rapunzel, el pasto de Cenicienta).

Para rehacerlas después de sumar o cambiar fotos:

```bash
python3 tools/fotos/prolijar.py
```

Necesita macOS (usa el framework Vision para separar la pieza del fondo, vía
`tools/fotos/warmycut.swift`) y Pillow para escribir WebP (`python3 -m pip install --user pillow`).
El primer paso compila el binario solo. Para sumar una foto nueva, agregala a la lista `RECORTES`
(o a `ENMARCADAS`) al principio de `prolijar.py`; si la foto tiene algo que no querés que entre
(un sticker, una silla), pasale un `crop` con las coordenadas en píxeles.

## Pendiente
- Fotos nuevas: las que hay son de Instagram y de baja resolución (sobre todo las princesas). Conviene una sesión de fotos de cada pieza sola, con luz pareja, para que los recortes salgan nítidos.
- Mitones, polainas, Rapunzel y Cenicienta quedaron enmarcadas porque no se pueden recortar bien: se pueden reemplazar en cuanto haya una toma nueva.
- Precios reales, número de WhatsApp (`WHATSAPP`) y reseñas reales.
- Backend Node: pedidos, Mercado Pago Checkout Pro (el botón de pago hoy solo valida el formulario) y newsletter.
