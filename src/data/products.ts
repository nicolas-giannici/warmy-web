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
    slug: 'conejita-lila', photo: u('/fotos/conejita-lila.webp'), name: 'Conejita Lila', price: 32000, cat: 'Amigurumis', bg: '#F6CADB', img: u('/ilus/conejita.svg'),
    hours: 12, tag: 'La más pedida', size: '30 cm (con orejas)',
    desc: 'Tejida en espiral con algodón peinado, vestido lila con flores y coronita tejida. Orejas largas para dormir abrazada.',
    colors: [{ name: 'Crudo', hex: '#F3E6D3' }, pastel.lila, pastel.rosa, pastel.celeste],
  },
  {
    slug: 'almohadon-corazon', photo: u('/fotos/almohadon-corazon.webp'), name: 'Almohadón Corazón', price: 18500, cat: 'Deco', bg: '#BCD9F2', img: u('/ilus/corazon.svg'),
    hours: 7, tag: 'Nuevo', size: '35 × 32 cm',
    desc: 'Un corazón mullidito para el sillón, la cama o la silla gamer. Relleno siliconado y funda tejida en punto bajo.',
    colors: [{ name: 'Crudo', hex: '#F3E6D3' }, { name: 'Rosa fuerte', hex: '#E07A9E' }, pastel.rosa],
  },
  {
    slug: 'muneca-a-pedido', photo: u('/fotos/muneca-a-pedido.webp'), gallery: [u('/fotos/muneca-a-pedido-2.webp')], name: 'Muñeca a pedido', price: 45000, from: true, cat: 'Personalizados', bg: '#F7E3A6',
    img: u('/ilus/muneca_pedido.svg'), hours: 20, tag: 'A medida', size: '35 cm aprox.',
    desc: 'Contanos cómo es la persona (pelo, ropa, detalles) y Fio teje una muñeca única inspirada en ella.',
    colors: [pastel.manteca, pastel.lila, pastel.rosa],
  },
  {
    slug: 'unicornio-arcoiris', photo: u('/fotos/unicornio-arcoiris.webp'), gallery: [u('/fotos/unicornio-nena.webp')], name: 'Unicornio Arcoíris', price: 29000, cat: 'Amigurumis', bg: '#CDB9EC', img: u('/ilus/unicornio.svg'),
    hours: 14, tag: 'Pieza única', size: '28 cm',
    desc: 'Melena de cinco colores, cuerno dorado y ojitos cerrados de felicidad. Seguro para bebés.',
    colors: [pastel.crudo, pastel.rosa],
  },
  {
    slug: 'muneca-trenzas', photo: u('/fotos/muneca-trenzas.webp'), name: 'Muñeca Trenzas', price: 38000, cat: 'Amigurumis', bg: '#BFDCC6', img: u('/ilus/muneca_trenzas.svg'),
    hours: 16, size: '32 cm',
    desc: 'Trenzas largas con moñitos, vestido coral y zapatitos chocolate. Para jugar durante años.',
    colors: [{ name: 'Coral', hex: '#EF8D7E' }, pastel.lila, pastel.celeste],
  },
  {
    slug: 'polainas-pompon', photo: u('/fotos/polainas.webp'), name: 'Polainas Pochoclo', price: 14000, cat: 'Accesorios', bg: '#FBD9CF', img: u('/ilus/polainas.svg'),
    hours: 6, size: 'Talle único',
    desc: 'Polainas en punto pochoclo, gruesas y suaves. Abrigan un montón y quedan divinas con zapatillas o borcegos.',
    colors: [{ name: 'Negro', hex: '#2B2626' }, pastel.rosa, pastel.crudo],
  },
  {
    slug: 'mitones-trenzados', photo: u('/fotos/mitones.webp'), name: 'Mitones Trenzados', price: 16500, cat: 'Accesorios', bg: '#FBEFE6', img: u('/ilus/mitones.svg'),
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
