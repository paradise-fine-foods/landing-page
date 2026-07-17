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

for (const locale of ['en', 'vi'] as const) {
  const html = readFileSync(join(dist, locale, 'index.html'), 'utf8');
  const logoUrl = html.match(/(?:src|srcset)="([^"]*paradise-fine-foods-logo[^" ,]*)/)?.[1];
  if (!logoUrl) throw new Error(`${locale}: self-hosted Paradise logo missing`);
  const logoFile = join(dist, decodeURIComponent(new URL(logoUrl, 'https://build.test').pathname).replace(/^\/+/, ''));
  if (!existsSync(logoFile)) throw new Error(`${locale}: emitted Paradise logo missing: ${logoUrl}`);
  if (!/aria-roledescription="carousel"/.test(html) || !/data-carousel-status/.test(html)) {
    throw new Error(`${locale}: accessible carousel contract missing`);
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
  const normalizedHtml = html.replaceAll(`${target.slice(0, -1)}"`, `${target}"`);
  if (!normalizedHtml.includes(target)) throw new Error(`${legacy}: redirect target ${target} missing`);
}

const enhancementFiles = files.filter((path) =>
  /(?:living-canvas|carousel|controller|reveal)\.[^/\\]+\.js$/.test(path),
);
for (const module of ['living-canvas', 'controller', 'reveal']) {
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
