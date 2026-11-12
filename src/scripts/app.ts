// Interacciones globales de Warmy: carrito, reveal, nav, menú, toasts y "vuelo" al carrito.
type Line = { slug: string; qty: number; variant?: string; extra?: number };
type Cat = Record<string, { name: string; price: number; img: string; bg: string; cover?: boolean }>;

const KEY = 'warmy-cart';
const FREE = 60000;
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const money = (n: number) => '$' + n.toLocaleString('es-AR');
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T | null;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];

function catalog(): Cat {
  try { return JSON.parse($('#catalog-data')?.textContent || '{}'); } catch { return {}; }
}
export function readCart(): Line[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function writeCart(c: Line[]) {
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* modo privado */ }
  renderCart();
  document.dispatchEvent(new CustomEvent('cart:change'));
}
export function addToCart(slug: string, qty = 1, variant?: string, extra = 0) {
  const c = readCart();
  const hit = c.find((l) => l.slug === slug && l.variant === variant);
  if (hit) hit.qty += qty; else c.push({ slug, qty, variant, extra: extra || undefined });
  writeCart(c);
}
export function cartTotal(): number {
  const cat = catalog();
  return readCart().reduce((s, l) => s + ((cat[l.slug]?.price || 0) + (l.extra || 0)) * l.qty, 0);
}

const ICON = {
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5v14"/></svg>',
};

function renderCart() {
  const cat = catalog();
  const c = readCart().filter((l) => cat[l.slug]);
  const count = c.reduce((s, l) => s + l.qty, 0);
  const total = c.reduce((s, l) => s + (cat[l.slug].price + (l.extra || 0)) * l.qty, 0);
  $$('[data-cart-count]').forEach((el) => (el.textContent = String(count)));
  const drawer = $('[data-drawer]');
  if (!drawer) return;
  drawer.classList.toggle('is-empty', c.length === 0);
  const list = $('[data-cart-items]', drawer)!;
  list.innerHTML = c.map((l, i) => {
    const p = cat[l.slug];
    return `<li class="line" data-i="${i}">
      <a href="/producto/${l.slug}" class="line__img" style="background:${p.bg}"><img src="${p.img}" alt="" width="60" height="80"${p.cover ? ' class="is-cover"' : ''}></a>
      <div><p class="line__name">${p.name}</p><p class="line__var">${l.variant || 'Como en la foto'}</p>
        <div class="line__ctrl"><div class="qty"><button data-q="-1" aria-label="Restar uno">${ICON.minus}</button><output>${l.qty}</output><button data-q="1" aria-label="Sumar uno">${ICON.plus}</button></div>
        <button class="line__rm" data-rm>Quitar</button></div></div>
      <span class="line__price">${money((p.price + (l.extra || 0)) * l.qty)}</span></li>`;
  }).join('');
  $('[data-cart-total]', drawer)!.textContent = money(total);
  const left = Math.max(0, FREE - total);
  const pct = Math.min(1, total / FREE);
  $('[data-ship-text]', drawer)!.innerHTML = left > 0 ? `Te faltan <b>${money(left)}</b> para el envío gratis` : '¡Tenés <b>envío gratis</b>! 🎉';
  ($('[data-ship-bar]', drawer) as HTMLElement).style.width = pct * 100 + '%';
  const ball = $('[data-ship-ball]', drawer) as HTMLElement;
  ball.style.left = `calc(${pct * 100}% - ${pct * 34}px)`;
  ball.style.transform = `rotate(${pct * 720}deg)`;
}

let lastFocus: Element | null = null;
function openCart() {
  const d = $('[data-drawer]');
  if (!d) return;
  lastFocus = document.activeElement;
  renderCart();
  d.classList.add('is-open');
  d.setAttribute('aria-hidden', 'false');
  document.documentElement.style.overflow = 'hidden';
  setTimeout(() => ($('.drawer__panel', d) as HTMLElement)?.focus(), 50);
}
function closeCart() {
  const d = $('[data-drawer]');
  if (!d?.classList.contains('is-open')) return;
  d.classList.remove('is-open');
  d.setAttribute('aria-hidden', 'true');
  document.documentElement.style.overflow = '';
  (lastFocus as HTMLElement | null)?.focus?.();
}

// Delegación global (una sola vez: el drawer persiste entre páginas)
document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  if (t.closest('[data-cart-open]')) { e.preventDefault(); openCart(); return; }
  if (t.closest('[data-cart-close]')) { closeCart(); return; }
  const line = t.closest('.line') as HTMLElement | null;
  if (line) {
    const c = readCart().filter((l) => catalog()[l.slug]);
    const i = Number(line.dataset.i);
    const q = t.closest('[data-q]') as HTMLElement | null;
    if (q) { c[i].qty += Number(q.dataset.q); if (c[i].qty <= 0) c.splice(i, 1); writeCart(c); }
    else if (t.closest('[data-rm]')) { c.splice(i, 1); writeCart(c); }
    return;
  }
  const add = t.closest('[data-add]') as HTMLElement | null;
  if (add) {
    e.preventDefault();
    const slug = add.dataset.add!;
    const scope = add.closest('[data-product]') || add.closest('.card');
    const qtyEl = scope?.querySelector('[data-qty]') as HTMLOutputElement | null;
    const variant = (scope?.querySelector('[data-variant]') as HTMLElement | null)?.dataset.variant;
    const extra = Number((scope as HTMLElement | null)?.dataset?.extra || 0);
    addToCart(slug, qtyEl ? Number(qtyEl.value || qtyEl.textContent) : 1, variant, extra);
    const img = scope?.querySelector('[data-fly]') as HTMLImageElement | null;
    fly(img);
    const name = catalog()[slug]?.name || 'Producto';
    toast(`${name} está en tu bolsa`, catalog()[slug]?.img);
    return;
  }
  const fav = t.closest('.card__fav') as HTMLElement | null;
  if (fav) { e.preventDefault(); fav.setAttribute('aria-pressed', fav.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeCart(); closeMenu(); }
});

function fly(img: HTMLImageElement | null) {
  const bag = $('.nav__bag');
  if (!bag) return;
  const bump = () => { bag.classList.remove('bump'); void (bag as HTMLElement).offsetWidth; bag.classList.add('bump'); };
  if (!img || reduce()) { bump(); return; }
  const a = img.getBoundingClientRect();
  const b = bag.getBoundingClientRect();
  const f = img.cloneNode() as HTMLImageElement;
  f.className = 'flyer';
  // el clon hereda el view-transition-name de la foto: si se navega durante el vuelo habría nombres duplicados
  f.removeAttribute('data-astro-transition-scope');
  f.style.viewTransitionName = 'none';
  f.removeAttribute('srcset'); f.removeAttribute('sizes'); f.loading = 'eager';
  f.style.left = a.left + a.width / 2 - 40 + 'px';
  f.style.top = a.top + a.height / 2 - 40 + 'px';
  document.body.appendChild(f);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  f.animate([
    { transform: 'translate(0,0) scale(1.4)', opacity: 1 },
    { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 120}px) scale(1) rotate(-20deg)`, opacity: 1, offset: 0.55 },
    { transform: `translate(${dx}px, ${dy}px) scale(.25) rotate(-40deg)`, opacity: 0.4 },
  ], { duration: 850, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = () => { f.remove(); bump(); };
}

let toastT = 0;
export function toast(msg: string, img?: string) {
  const el = $('[data-toast]');
  if (!el) return;
  el.innerHTML = `<img src="${img || '/draco/draco-sentado.webp'}" alt="">${msg}`;
  el.classList.add('is-on');
  clearTimeout(toastT);
  toastT = window.setTimeout(() => el.classList.remove('is-on'), 2600);
}

// ---------- Menú móvil ----------
function openMenu() {
  const m = $('[data-menu]');
  if (!m) return;
  m.hidden = false;
  document.documentElement.style.overflow = 'hidden';
  $('[data-menu-open]')?.setAttribute('aria-expanded', 'true');
  ($('[data-menu-close]', m) as HTMLElement)?.focus();
}
function closeMenu() {
  const m = $('[data-menu]');
  if (!m || m.hidden) return;
  const hadFocus = m.contains(document.activeElement);
  m.hidden = true;
  document.documentElement.style.overflow = '';
  const btn = $('[data-menu-open]');
  btn?.setAttribute('aria-expanded', 'false');
  if (hadFocus) btn?.focus();
}

// ---------- Init por página ----------
let io: IntersectionObserver | null = null;
function initPage() {
  renderCart();
  closeMenu();
  document.documentElement.style.overflow = '';

  $('[data-menu-open]')?.addEventListener('click', openMenu);
  $('[data-menu-close]')?.addEventListener('click', closeMenu);
  $$('[data-menu-link]').forEach((a) => a.addEventListener('click', closeMenu));

  // Reveal on scroll
  io?.disconnect();
  const els = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce()) {
    io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io!.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    els.forEach((el) => io!.observe(el));
  } else els.forEach((el) => el.classList.add('is-in'));

  // Nav: fondo al scrollear y se oculta al bajar
  const nav = $('[data-nav]');
  let lastY = scrollY;
  const onScroll = () => {
    if (!nav) return;
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    nav.classList.toggle('is-hidden', y > 400 && y > lastY && !document.querySelector('.drawer.is-open'));
    lastY = y;
  };
  window.removeEventListener('scroll', (window as any).__warmyScroll);
  (window as any).__warmyScroll = onScroll;
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Newsletter (sin backend todavía)
  $('[data-news]')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget as HTMLFormElement;
    ($('[data-news-ok]', f) as HTMLElement).hidden = false;
    f.reset();
  });
}

document.addEventListener('astro:page-load', initPage);
document.addEventListener('astro:before-swap', () => { closeCart(); });
