import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = join(import.meta.dir, '..');
const dist = join(root, 'dist');
const forbidden = /(?:three(?:\.module)?|webgl|\.glb|model-src|product-stage)/i;
const canonicalRoutes = [
  '/en/products/',
  '/vi/products/',
  '/en/brands/',
  '/vi/brands/',
  '/en/contact/',
  '/vi/contact/',
] as const;

const filesBelow = (directory: string): string[] => readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  });
const normalizedRoute = (value: string): string => {
  const pathname = new URL(value, 'https://build.test').pathname.replace(/\/+$/, '');
  return pathname || '/';
};
const requireTag = (html: string, pattern: RegExp, message: string): string => {
  const tag = html.match(pattern)?.[0];
  if (!tag) throw new Error(message);
  return tag;
};

if (!existsSync(dist)) throw new Error('dist is missing; run the production build first');

const files = filesBelow(dist);
for (const file of files.filter((path) => /\.(?:html|css|js|json)$/.test(path))) {
  const content = readFileSync(file, 'utf8');
  if (forbidden.test(content)) throw new Error(`3D residue in ${relative(dist, file)}`);
}

for (const route of canonicalRoutes) {
  const file = join(dist, route.slice(1), 'index.html');
  if (!existsSync(file)) throw new Error(`Missing canonical route ${route}`);
}

const carouselCopy = {
  en: {
    label: 'Featured products',
    previous: 'Previous product',
    next: 'Next product',
    status: 'Product {current} of {total}',
  },
  vi: {
    label: 'Sản phẩm nổi bật',
    previous: 'Sản phẩm trước',
    next: 'Sản phẩm tiếp theo',
    status: 'Sản phẩm {current} trên {total}',
  },
} as const;

for (const locale of ['en', 'vi'] as const) {
  const html = readFileSync(join(dist, locale, 'index.html'), 'utf8');
  const logoUrl = html.match(/(?:src|srcset)="([^"]*paradise-fine-foods-logo[^" ,]*)/)?.[1];
  if (!logoUrl) throw new Error(`${locale}: self-hosted Paradise logo missing`);
  if (!logoUrl.startsWith('/') || logoUrl.startsWith('//')) {
    throw new Error(`${locale}: Paradise logo must use a same-origin root-relative URL`);
  }
  const logoFile = join(dist, decodeURIComponent(new URL(logoUrl, 'https://build.test').pathname).replace(/^\/+/, ''));
  if (!existsSync(logoFile)) throw new Error(`${locale}: emitted Paradise logo missing: ${logoUrl}`);

  const copy = carouselCopy[locale];
  requireTag(
    html,
    new RegExp(`<section\\b[^>]*aria-roledescription="carousel"[^>]*aria-label="${copy.label}"[^>]*data-carousel[^>]*>`),
    `${locale}: labeled carousel region missing`,
  );
  const previous = requireTag(html, /<button\b[^>]*data-carousel-previous[^>]*>/, `${locale}: previous button missing`);
  const next = requireTag(html, /<button\b[^>]*data-carousel-next[^>]*>/, `${locale}: next button missing`);
  if (!previous.includes(`aria-label="${copy.previous}"`)) throw new Error(`${locale}: previous label missing`);
  if (!next.includes(`aria-label="${copy.next}"`)) throw new Error(`${locale}: next label missing`);
  const viewport = requireTag(html, /<div\b[^>]*data-carousel-viewport[^>]*>/, `${locale}: carousel viewport missing`);
  if (!viewport.includes('tabindex="0"')) throw new Error(`${locale}: carousel viewport must be focusable`);
  const status = requireTag(html, /<p\b[^>]*data-carousel-status[^>]*>/, `${locale}: carousel live status missing`);
  if (!status.includes('aria-live="polite"') || !status.includes('aria-atomic="true"')) {
    throw new Error(`${locale}: carousel status must be an atomic polite live region`);
  }
  if (!status.includes(`data-carousel-status-template="${copy.status}"`)) {
    throw new Error(`${locale}: localized carousel status template missing`);
  }
  if ([...html.matchAll(/\bdata-carousel-item(?:\s|>)/g)].length < 2) {
    throw new Error(`${locale}: carousel must expose all featured items`);
  }
}

for (const [legacy, target] of [
  ['vi/san-pham/index.html', '/vi/products/'],
  ['vi/san-pham/bo-lat-mau/index.html', '/vi/products/bo-lat-mau/'],
  ['vi/thuong-hieu/index.html', '/vi/brands/'],
  ['vi/thuong-hieu/nha-sua-maison/index.html', '/vi/brands/nha-sua-maison/'],
  ['vi/lien-he/index.html', '/vi/contact/'],
] as const) {
  const redirectFile = join(dist, legacy);
  if (!existsSync(redirectFile)) throw new Error(`${legacy}: redirect output missing`);
  const html = readFileSync(redirectFile, 'utf8');
  const refreshTag = requireTag(
    html,
    /<meta\b[^>]*http-equiv="refresh"[^>]*>/i,
    `${legacy}: meta refresh missing`,
  );
  const refreshTarget = refreshTag.match(/\bcontent="[^";]+;\s*url=([^"]+)"/i)?.[1];
  if (!refreshTarget || normalizedRoute(refreshTarget) !== normalizedRoute(target)) {
    throw new Error(`${legacy}: meta-refresh target must be ${target}`);
  }
  const canonicalTarget = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1];
  const bodyLinkTarget = html.match(/<a\b[^>]*href="([^"]+)"/i)?.[1];
  for (const [label, value] of [['canonical', canonicalTarget], ['body link', bodyLinkTarget]] as const) {
    if (!value || normalizedRoute(value) !== normalizedRoute(target)) {
      throw new Error(`${legacy}: ${label} target must be ${target}`);
    }
  }
}

const enhancementFiles = files.filter((path) =>
  /(?:LivingHero\.astro_astro_type_script[^/\\]*|living-canvas|carousel|controller|reveal)\.[^/\\]+\.js$/.test(path),
);
for (const module of ['LivingHero.astro_astro_type_script', 'living-canvas', 'controller', 'reveal']) {
  if (!enhancementFiles.some((path) => relative(dist, path).includes(module))) {
    throw new Error(`Missing emitted ${module} enhancement module`);
  }
}
const enhancementGzip = enhancementFiles.reduce(
  (total, file) => total + gzipSync(readFileSync(file)).byteLength,
  0,
);
if (enhancementGzip > 35_000) throw new Error(`Enhancements are ${enhancementGzip} gzip bytes`);

console.log(
  `Living design verified: ${canonicalRoutes.length} canonical routes, ${enhancementFiles.length} enhancement files, ${enhancementGzip} gzip bytes.`,
);
