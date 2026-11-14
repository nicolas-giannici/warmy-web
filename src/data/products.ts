import { u } from '../lib/url';
// Catálogo de Warmy. Precios = placeholders (pedir la lista real a Fio).
export type Product = {
  slug: string;
  name: string;
  price: number;
  from?: boolean; // "desde $X" (a pedido)
  cat: Category;
  sub?: Subcategory; // subcolección dentro de la categoría (ej.: Princesas)
  bg: string;
  img: string; // ilustración /ilus/*.svg (fallback)
  photo?: string; // foto real /fotos/*.webp (de Instagram @warmy_acrochet)
  gallery?: string[]; // fotos extra para la ficha
  hours: number;
  tag?: string;
  size: string;
  desc: string;
  colors: { name: string; hex: string }[];
};

export type Category = 'Amigurumis' | 'Mantas' | 'Tops' | 'Accesorios' | 'Deco' | 'Personalizados';

export type Subcategory = 'Princesas';

/** Subcolecciones: se muestran como segundo nivel de filtro dentro de su categoría. */
export const SUBCATEGORIES: { name: Subcategory; cat: Category; blurb: string }[] = [
  { name: 'Princesas', cat: 'Amigurumis', blurb: 'Vestido de gala y coronita' },
];

export const subsOf = (cat: Category) => SUBCATEGORIES.filter((s) => s.cat === cat);

/**
 * Fotos prolijas: viven en `/fotos/recorte/` (ver `tools/fotos/prolijar.py`).
 * - `cutout`: pieza recortada sobre fondo transparente → se muestra entera, sobre blanco.
 * - `enmarcado-*`: foto entera con marco blanco → se muestra como una foto normal.
 */
export const photoInfo = (src: string) => {
  const prolija = src.includes('/fotos/recorte/');
  return { prolija, cutout: prolija && !src.includes('/enmarcado-') };
};

export const CATEGORIES: { name: Category; blurb: string; img: string; bg: string }[] = [
  { name: 'Amigurumis', blurb: 'Muñecos para abrazar', img: u('/ilus/conejita.svg'), bg: '#F6CADB' },
  { name: 'Mantas', blurb: 'Para siestas largas', img: u('/ilus/manta.svg'), bg: '#BCD9F2' },
  { name: 'Tops', blurb: 'Tejidos para usar', img: u('/ilus/top.svg'), bg: '#BFDCC6' },
  { name: 'Accesorios', blurb: 'Abrigo con onda', img: u('/ilus/mitones.svg'), bg: '#FBEFE6' },
  { name: 'Deco', blurb: 'Casa con alma', img: u('/ilus/corazon.svg'), bg: '#CDB9EC' },
  { name: 'Personalizados', blurb: 'Lo tejemos a medida', img: u('/ilus/muneca_pedido.svg'), bg: '#F7E3A6' },
];

const pastel = {
  lila: { name: 'Lila lavanda', hex: '#CDB9EC' },
  rosa: { name: 'Rosa chicle', hex: '#F6CADB' },
  celeste: { name: 'Celeste cielo', hex: '#BCD9F2' },
  salvia: { name: 'Verde salvia', hex: '#BFDCC6' },
  manteca: { name: 'Manteca', hex: '#F7E3A6' },
  crudo: { name: 'Crudo', hex: '#FFF8F1' },
};

export const PRODUCTS: Product[] = [
  {
    slug: 'conejita-lila', photo: u('/fotos/recorte/conejita-lila.webp'), name: 'Conejita Lila', price: 32000, cat: 'Amigurumis', bg: '#F6CADB', img: u('/ilus/conejita.svg'),
    hours: 12, tag: 'La más pedida', size: '30 cm (con orejas)',
    desc: 'Tejida en espiral con algodón peinado, vestido lila con flores y coronita tejida. Orejas largas para dormir abrazada.',
    colors: [{ name: 'Crudo', hex: '#F3E6D3' }, pastel.lila, pastel.rosa, pastel.celeste],
  },
  {
    slug: 'almohadon-corazon', photo: u('/fotos/recorte/almohadon-corazon.webp'), name: 'Almohadón Corazón', price: 18500, cat: 'Deco', bg: '#BCD9F2', img: u('/ilus/corazon.svg'),
    hours: 7, tag: 'Nuevo', size: '35 × 32 cm',
    desc: 'Un corazón mullidito para el sillón, la cama o la silla gamer. Relleno siliconado y funda tejida en punto bajo.',
    colors: [{ name: 'Crudo', hex: '#F3E6D3' }, { name: 'Rosa fuerte', hex: '#E07A9E' }, pastel.rosa],
  },
  {
    slug: 'muneca-a-pedido', photo: u('/fotos/recorte/muneca-a-pedido.webp'), gallery: [u('/fotos/recorte/muneca-a-pedido-2.webp')], name: 'Muñeca a pedido', price: 45000, from: true, cat: 'Personalizados', bg: '#F7E3A6',
    img: u('/ilus/muneca_pedido.svg'), hours: 20, tag: 'A medida', size: '35 cm aprox.',
    desc: 'Contanos cómo es la persona (pelo, ropa, detalles) y Fio teje una muñeca única inspirada en ella.',
    colors: [pastel.manteca, pastel.lila, pastel.rosa],
  },
  {
    slug: 'unicornio-arcoiris', photo: u('/fotos/recorte/unicornio-arcoiris.webp'), gallery: [u('/fotos/unicornio-nena.webp')], name: 'Unicornio Arcoíris', price: 29000, cat: 'Amigurumis', bg: '#CDB9EC', img: u('/ilus/unicornio.svg'),
    hours: 14, tag: 'Pieza única', size: '28 cm',
    desc: 'Melena de cinco colores, cuerno dorado y ojitos cerrados de felicidad. Seguro para bebés.',
    colors: [pastel.crudo, pastel.rosa],
  },
  {
    slug: 'muneca-trenzas', photo: u('/fotos/recorte/muneca-trenzas.webp'), name: 'Muñeca Trenzas', price: 38000, cat: 'Amigurumis', bg: '#BFDCC6', img: u('/ilus/muneca_trenzas.svg'),
    hours: 16, size: '32 cm',
    desc: 'Trenzas largas con moñitos, vestido coral y zapatitos chocolate. Para jugar durante años.',
    colors: [{ name: 'Coral', hex: '#EF8D7E' }, pastel.lila, pastel.celeste],
  },
  // ── Princesas (subcolección de Amigurumis) ────────────────────────────────
  // Fotos: publicaciones de @warmy_acrochet (2020–2025), recortadas y achicadas.
  // TODO Fio: precios, medidas y horas de trabajo son provisorios (placeholders).
  {
    slug: 'moana', photo: u('/fotos/recorte/princesas-moana.webp'), name: 'Moana', price: 48000, from: true, cat: 'Amigurumis', sub: 'Princesas',
    bg: '#F6CADB', img: u('/ilus/muneca_trenzas.svg'), hours: 24, tag: 'La más nueva', size: '35 cm aprox.',
    desc: 'La más nueva de la colección. Tres capas de pelo y una falda de tres capas tejidas con muchísimo detalle, para que se mueva como en la película.',
    colors: [{ name: 'Coral', hex: '#E0705F' }, { name: 'Verde palmera', hex: '#7FA98A' }, pastel.crudo],
  },
  {
    slug: 'merida', photo: u('/fotos/recorte/princesas-merida.webp'), name: 'Mérida', price: 48000, from: true, cat: 'Amigurumis', sub: 'Princesas',
    bg: '#CDB9EC', img: u('/ilus/muneca_trenzas.svg'), hours: 26, tag: 'A pedido', size: '35 cm aprox.',
    desc: 'La valiente de pelo de fuego. Es de las que más tiempo llevan: la melena rizada y el vestido con detalles se tejen puntada por puntada.',
    colors: [{ name: 'Naranja fuego', hex: '#D9763F' }, { name: 'Verde musgo', hex: '#6E8B6B' }, pastel.celeste],
  },
  {
    slug: 'tiana', photo: u('/fotos/recorte/princesas-tiana.webp'), name: 'Tiana', price: 48000, from: true, cat: 'Amigurumis', sub: 'Princesas',
    bg: '#BFDCC6', img: u('/ilus/muneca_trenzas.svg'), hours: 26, tag: 'Pieza especial', size: '35 cm aprox.',
    desc: 'Vestido verde agua con capas, corona y una flor tejida en la mano. En palabras de Fio, el trabajo que más tiempo y cariño le llevó.',
    colors: [{ name: 'Verde agua', hex: '#8FCFC4' }, { name: 'Negro', hex: '#2B2626' }, pastel.crudo],
  },
  {
    slug: 'rapunzel-baby', photo: u('/fotos/recorte/enmarcado-princesas-rapunzel.webp'), name: 'Rapunzel Baby', price: 36000, from: true, cat: 'Amigurumis', sub: 'Princesas',
    bg: '#F7E3A6', img: u('/ilus/muneca_trenzas.svg'), hours: 18, tag: 'Tamaño mini', size: '25 cm aprox.',
    desc: 'La versión más chiquita de la colección, con la trenza larga y el vestido rosa lila. Ideal para una nena que la lleve a todos lados.',
    colors: [pastel.rosa, pastel.lila, { name: 'Marrón claro', hex: '#B08050' }],
  },
  {
    slug: 'jasmine', photo: u('/fotos/recorte/princesas-jasmine.webp'), name: 'Jasmine', price: 46000, from: true, cat: 'Amigurumis', sub: 'Princesas',
    bg: '#BCD9F2', img: u('/ilus/muneca_trenzas.svg'), hours: 22, tag: 'A pedido', size: '35 cm aprox.',
    desc: 'Melena negra al viento, la vincha con la joya azul y el conjunto turquesa. Volvió a la colección porque quedó preciosa.',
    colors: [{ name: 'Turquesa', hex: '#5FBFC6' }, { name: 'Azul joya', hex: '#2F5BA8' }, pastel.crudo],
  },
  {
    slug: 'anna', photo: u('/fotos/recorte/princesas-anna.webp'), name: 'Anna de Frozen', price: 46000, from: true, cat: 'Amigurumis', sub: 'Princesas',
    bg: '#BCD9F2', img: u('/ilus/muneca_trenzas.svg'), hours: 22, tag: 'A pedido', size: '35 cm aprox.',
    desc: 'Las trenzas color zanahoria y el vestido de invierno de Arendelle. Una de las favoritas de las fans de Frozen.',
    colors: [{ name: 'Azul noche', hex: '#3E5C8A' }, pastel.celeste, { name: 'Naranja zanahoria', hex: '#D97B4F' }],
  },
  {
    slug: 'ariel', photo: u('/fotos/recorte/princesas-ariel.webp'), gallery: [u('/fotos/recorte/princesas-ariel-2.webp')], name: 'Ariel (La Sirenita)', price: 46000, from: true, cat: 'Amigurumis', sub: 'Princesas',
    bg: '#BFDCC6', img: u('/ilus/muneca_trenzas.svg'), hours: 22, tag: 'Pieza única', size: '35 cm aprox.',
    desc: 'La sirenita con la cola verde y el pelo rojo al viento. Tiene dos fotos en la ficha porque cada pose le cambia la cara.',
    colors: [{ name: 'Verde agua', hex: '#5FB59B' }, { name: 'Pelirrojo', hex: '#C4573C' }, pastel.lila],
  },
  {
    slug: 'cenicienta-mini', photo: u('/fotos/recorte/enmarcado-princesas-cenicienta.webp'), name: 'Mini Cenicienta', price: 34000, from: true, cat: 'Amigurumis', sub: 'Princesas',
    bg: '#F6CADB', img: u('/ilus/muneca_trenzas.svg'), hours: 16, tag: 'Tamaño mini', size: '20 cm aprox.',
    desc: 'Chiquita y prolija: vestido celeste con mangas blancas y carita dormilona. Perfecta para una primera princesa.',
    colors: [pastel.celeste, pastel.crudo, { name: 'Amarillo suave', hex: '#F2D97A' }],
  },
  {
    slug: 'malefica', photo: u('/fotos/recorte/princesas-malefica.webp'), name: 'Maléfica', price: 50000, from: true, cat: 'Amigurumis',
    bg: '#CDB9EC', img: u('/ilus/muneca_pedido.svg'), hours: 26, tag: 'Team villanos', size: '35 cm aprox.',
    desc: 'La villana icónica: cuernos, capa con alas y ojos verdes. Todavía no tiene subcolección propia; si querés, armamos “Villanas”.',
    colors: [{ name: 'Negro', hex: '#2B2626' }, { name: 'Verde veneno', hex: '#6E8B4F' }, { name: 'Dorado', hex: '#E8C46A' }],
  },
  {
    slug: 'polainas-pompon', photo: u('/fotos/recorte/enmarcado-polainas.webp'), name: 'Polainas Pochoclo', price: 14000, cat: 'Accesorios', bg: '#FBD9CF', img: u('/ilus/polainas.svg'),
    hours: 6, size: 'Talle único',
    desc: 'Polainas en punto pochoclo, gruesas y suaves. Abrigan un montón y quedan divinas con zapatillas o borcegos.',
    colors: [{ name: 'Negro', hex: '#2B2626' }, pastel.rosa, pastel.crudo],
  },
  {
    slug: 'mitones-trenzados', photo: u('/fotos/recorte/enmarcado-mitones.webp'), name: 'Mitones Trenzados', price: 16500, cat: 'Accesorios', bg: '#FBEFE6', img: u('/ilus/mitones.svg'),
    hours: 8, tag: 'Invierno', size: 'Talle único',
    desc: 'Mitones sin dedos en punto texturado: abrigan las manos y te dejan agarrar el mate. Lana suave que no pica.',
    colors: [{ name: 'Negro', hex: '#2B2626' }, pastel.celeste, pastel.crudo],
  },
  {
    slug: 'manta-nube', name: 'Manta Nube', price: 54000, cat: 'Mantas', bg: '#CDB9EC', img: u('/ilus/manta.svg'),
    hours: 30, tag: 'Para bebés', size: '80 × 100 cm',
    desc: 'Una nube tejida para cochecitos y siestas. Algodón hipoalergénico, lavable a mano.',
    colors: [pastel.crudo, pastel.celeste, pastel.lila],
  },
  {
    slug: 'top-margarita', name: 'Top Margarita', price: 27000, cat: 'Tops', bg: '#BFDCC6', img: u('/ilus/top.svg'),
    hours: 10, size: 'S · M · L',
    desc: 'Top de verano con margarita aplicada y punto ondas. Liviano, fresco y hecho a tu medida.',
    colors: [pastel.manteca, pastel.salvia, pastel.crudo],
  },
];

export const bySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

/** Imagen principal: foto real si hay, si no la ilustración. */
export const mainImg = (p: Product) => p.photo ?? p.img;

export const money = (n: number) => '$' + n.toLocaleString('es-AR');

export const priceLabel = (p: Product) => (p.from ? 'desde ' : '') + money(p.price);

export const WHATSAPP = '5491100000000'; // TODO: número real de Fio
export const FREE_SHIPPING = 60000;

/** Instagram de Warmy: ahí Fio publica las piezas nuevas, es la fuente del catálogo. */
export const INSTAGRAM = 'https://www.instagram.com/warmy_acrochet/';
export const INSTAGRAM_HANDLE = '@warmy_acrochet';
