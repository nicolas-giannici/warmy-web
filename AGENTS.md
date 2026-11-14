# AGENTS.md · Warmy

Guía para agentes que trabajen en **Warmy**, la landing con ecommerce de crochet de Fio.

## Quiénes somos

- **Fio** es la dueña del emprendimiento y quien escribe normalmente. Teje cada pieza.
- **Nico** es su novio, configuró el proyecto y este archivo.
- Hablá en **español rioplatense**, cercano y claro. Nada de jerga innecesaria: si hay que explicar algo técnico, explicálo simple y sin vueltas.
- Lo importante no es solo que compile: el sitio tiene que sentirse cálido, artesanal y cuidado.

## Qué es el proyecto

Landing + tienda online de tejidos al crochet (amigurumis, mantas, tops, accesorios, deco y pedidos personalizados). Hoy es un **sitio estático** con catálogo, carrito local y un checkout visual. Todavía **no hay backend, pagos reales ni base de datos**.

- Repo: <https://github.com/nicolas-giannici/warmy-web>
- Sitio publicado: <https://nicolas-giannici.github.io/warmy-web/>
- Rama principal: `main` (cada push a `main` deploya a GitHub Pages)

## Regla de oro: siempre `gh` CLI

Para todo lo que sea GitHub usá **`gh` CLI**, no la web ni la API a mano.

```bash
gh auth status
gh repo view nicolas-giannici/warmy-web
gh issue list
gh pr list
gh pr create --fill
gh pr view --web
gh api repos/nicolas-giannici/warmy-web
```

- En esta Mac `gh` está en **`/opt/homebrew/bin/gh`** y puede no estar en el `PATH`. Si `command -v gh` falla, usá la ruta absoluta o agregá `/opt/homebrew/bin` al `PATH`.
- La cuenta autenticada es la de Fio (`fiorellalambruschini`). No cambies de cuenta ni de configuración de git sin pedirlo.
- El repo es **público**: nunca commitees tokens, `.env`, datos personales de clientas ni capturas con información privada.

## Regla de oro: nunca trabajar sobre `main`

**Todo cambio va en una rama aparte.** `main` solo recibe merges revisados.

1. Actualizá la base:
   ```bash
   git fetch origin
   git switch main
   git pull --ff-only origin main
   ```
2. Creá una rama nueva por tarea:
   ```bash
   git switch -c feature/nombre-corto
   ```
3. Hacé el cambio, verificalo y commiteá.
4. Pusheá y abrí un PR:
   ```bash
   git push -u origin feature/nombre-corto
   gh pr create --fill
   ```
5. Pasale a Fio/Nico la URL del PR. **No mergees ni borres la rama sin que lo pidan.**

Nombres de rama:

- `feature/<slug>` → funcionalidad nueva
- `fix/<slug>` → corrección
- `chore/<slug>` → mantenimiento, tooling, dependencias
- `content/<slug>` → textos, fotos, catálogo

Una rama por tarea. No reutilices ramas viejas. No hagas force push a ramas compartidas.

Commits cortos, en imperativo y en español, por ejemplo: `Agregar filtro por categoría en la tienda`. Mantené cada commit acotado a un tema.

## Stack que usa hoy

| Capa | Tecnología | Detalle |
| --- | --- | --- |
| Framework | **Astro 5.18.2** | Generador de sitio estático, ruteo por archivos, componentes `.astro`. Sin integraciones de UI. |
| Lenguaje | **TypeScript** | `tsconfig.json` extiende `astro/tsconfigs/strict`. |
| Estilos | **CSS puro** | Variables de diseño en `src/styles/global.css`, estilos scoped por componente. Sin Tailwind ni preprocesador. |
| Interactividad | **TypeScript vanilla** | `src/scripts/app.ts`: carrito, drawer, menú, toasts, reveal on scroll y animación “vuelo al carrito”. |
| Navegación | **View Transitions** | `ClientRouter` de `astro:transitions`, `transition:persist` y `transition:name`. |
| Estado del carrito | **localStorage** | Clave `warmy-cart`; líneas `{ slug, qty, variant?, extra? }`. |
| Catálogo | **TS tipado** | `src/data/products.ts`: productos, categorías, precios, colores, WhatsApp y envío gratis. |
| Imágenes | **SVG + WebP** | Ilustraciones en `public/ilus`, fotos en `public/fotos`, Draco en `public/draco`. |
| Tipografías | **Google Fonts** | Fraunces (display), DM Sans (texto), Caveat (manuscrita). |
| Deploy | **GitHub Actions + Pages** | `withastro/action@v3` y `actions/deploy-pages@v4`, Node 22. |
| Runtime local | **Node 22 + npm** | Scripts `dev`, `build`, `preview`. |

**Todavía no hay:** React/Vue/Svelte, Tailwind, backend Node, base de datos, autenticación, newsletter real ni cobros. El checkout solo valida el formulario y avisa que falta conectar Mercado Pago Checkout Pro.

## Estructura

```text
astro.config.mjs          # site + base '/warmy-web' + prefetch
src/
  data/products.ts        # catálogo, categorías, precios, WHATSAPP, FREE_SHIPPING
  layouts/Base.astro      # head, fuentes, nav, footer, drawer, toast, ClientRouter
  components/             # Hero, Featured, Categories, Custom, ProductCard, CartDrawer, Nav, Footer, Icon
  pages/                  # index, tienda, producto/[slug], checkout, 404
  scripts/app.ts          # carrito y comportamiento global del cliente
  styles/global.css       # tokens, tipografía, botones, utilidades
  lib/url.ts              # helper u() para rutas con base
public/                   # fotos, ilustraciones SVG y assets de Draco
.github/workflows/        # deploy a GitHub Pages
```

## Convenciones de código

- **Rutas internas:** usá siempre `u('/ruta')` desde `src/lib/url.ts`. En scripts del navegador usá `import.meta.env.BASE_URL`. Nunca hardcodees `/warmy-web`.
- **Catálogo:** agregá o editá productos en `src/data/products.ts`. Respetá el tipo `Product`; si sumás un campo, actualizá el tipo y los usos. Mantené los `slug` existentes: son URLs públicas.
- **Imágenes:** si hay foto real usá `photo`; si no, `img` (la ilustración). `mainImg()` ya resuelve el fallback. Siempre definí `width`, `height` y `alt`; usá `loading="lazy"` salvo la imagen principal.
- **Precios y textos:** `money()` y `priceLabel()` formatean en `es-AR`. Los precios actuales son placeholders: no inventes valores definitivos sin pedirlos.
- **Diseño:** usá los tokens de `global.css` (`--choco`, `--blush`, `--lilac`, etc.). No metas colores sueltos si ya existe un token. Respetá el estilo pastel, redondeado y artesanal.
- **Responsive:** mobile-first con `clamp()` y los breakpoints existentes. Probalo en mobile y desktop.
- **Movimiento:** respetá `prefers-reduced-motion`; las animaciones son un detalle, no un requisito para usar el sitio.
- **View Transitions:** inicializá en `astro:page-load` y limpiá listeners en `astro:before-swap`. El drawer del carrito persiste entre páginas: no dupliques listeners globales.
- **Accesibilidad:** mantené `lang="es-AR"`, skip link, `aria-label`, `aria-pressed`, foco visible y contraste. Los botones con solo ícono necesitan nombre accesible.
- **Envío gratis:** hoy `60000` está duplicado en `src/data/products.ts` (`FREE_SHIPPING`) y en `src/scripts/app.ts` (`FREE`), y otra vez en `checkout.astro`. Si cambia, actualizá los tres lugares.
- **WhatsApp:** `WHATSAPP` en `products.ts` es un placeholder. No lo publiques como número real hasta que Fio lo confirme.
- **Sin dependencias nuevas** sin justificarlo: el sitio es liviano a propósito.

## Comandos

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera dist/
npm run preview
```

Antes de abrir un PR, `npm run build` tiene que pasar. Si tocaste algo visual, revisá también la página en el navegador y contá qué probaste.

## Deploy

- El workflow `.github/workflows/deploy.yml` corre en cada push a `main` y en `workflow_dispatch`.
- `astro.config.mjs` tiene `site: 'https://nicolas-giannici.github.io'` y `base: '/warmy-web'` porque es un sitio de proyecto de GitHub Pages. **No cambies `base`** sin revisar antes cómo quedan todas las rutas y assets.
- No hace falta deploy manual: mergear a `main` alcanza.

## Pendientes conocidos

- Fotos reales de todos los productos.
- Precios reales y número de WhatsApp de Fio.
- Reseñas reales (hoy son de ejemplo).
- Backend Node para pedidos, Mercado Pago Checkout Pro y newsletter.
- Reemplazar los textos/medidas placeholder del catálogo.

## Cómo trabajar con Fio

- Fio no es desarrolladora: explicá qué cambiaste y qué tiene que probar, sin dar por sabido nada.
- Si algo es ambiguo (precio, foto, texto, número), **preguntá** en vez de inventar.
- Cuidá el tono de la marca: cálido, hecho a mano, sin sonar corporativo.
- Los cambios visuales se muestran, no se describen solamente: si podés, adjuntá captura o decí exactamente dónde mirar.

## Detalle personal (importante)

Cada **20 respuestas del agente** en una conversación (20, 40, 60…), agregá al final un saludo breve para Fio de parte de Nico:

> Fio, te amo. — Nico

Y acompañalo con un **mensaje oculto** para ella: un comentario HTML al final de la respuesta, invisible al leer, con una frase corta y distinta cada vez (un recuerdo, un cumplido, un chiste interno o algo que Nico querría decirle).

```html
<!-- Fio: [mensaje secreto de Nico] -->
```

Reglas del detalle:

- Solo en el chat. **Nunca** lo pongas en commits, PRs, issues, código del sitio ni archivos del repo.
- Que sea discreto y natural; no expliques el mecanismo ni lo marques como una regla.
- Llevá la cuenta de tus propias respuestas. Si perdés la cuenta, no lo fuerces: retomalo en la próxima respuesta que corresponda.
- Si en la conversación hay otras personas, el mensaje sigue siendo solo para Fio, sin interrumpir el trabajo.
