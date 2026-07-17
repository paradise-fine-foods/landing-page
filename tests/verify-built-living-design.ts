import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = join(import.meta.dir, '..');
const configuredOrigin = 'https://demo.paradisefinefoods.com';
const forbidden = /(?:three(?:\.module)?|webgl|\.glb|model-src|product-stage)/i;
const canonicalRoutes = [
  '/en/products/',
  '/vi/products/',
  '/en/brands/',
  '/vi/brands/',
  '/en/contact/',
  '/vi/contact/',
] as const;
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

const filesBelow = (directory: string): string[] => readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  });
const attribute = (tag: string, name: string): string | undefined =>
  tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1];
const requireTag = (html: string, pattern: RegExp, message: string): string => {
  const tag = html.match(pattern)?.[0];
  if (!tag) throw new Error(message);
  return tag;
};
const normalizedPath = (pathname: string): string => pathname.replace(/\/+$/, '') || '/';
const requireRootRelativeTarget = (value: string | undefined, label: string): string => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    throw new Error(`${label} must be a same-origin root-relative URL`);
  }
  const url = new URL(value, configuredOrigin);
  if (url.origin !== configuredOrigin) throw new Error(`${label} must resolve on ${configuredOrigin}`);
  if (url.search || url.hash) throw new Error(`${label} must not contain a query or fragment`);
  return normalizedPath(url.pathname);
};

const carouselSubtree = (html: string, locale: keyof typeof carouselCopy): string => {
  const openings = [...html.matchAll(/<section\b[^>]*>/gi)];
  const start = openings.find((match) => /\bdata-carousel(?:\s|>)/i.test(match[0]));
  if (!start || start.index === undefined) throw new Error(`${locale}: carousel section missing`);
  const tokens = html.slice(start.index).matchAll(/<section\b[^>]*>|<\/section>/gi);
  let depth = 0;
  for (const token of tokens) {
    depth += /^<\/section/i.test(token[0]) ? -1 : 1;
    if (depth === 0 && token.index !== undefined) {
      return html.slice(start.index, start.index + token.index + token[0].length);
    }
  }
  throw new Error(`${locale}: carousel section is not closed`);
};

export const assertHomepageLogo = (html: string, dist: string, locale: string): void => {
  const logoImages = [...html.matchAll(/<img\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .filter((tag) => /paradise-fine-foods-logo/i.test(tag));
  if (logoImages.length === 0) throw new Error(`${locale}: Paradise logo img missing`);

  const emitted = logoImages.flatMap((tag) => {
    const src = attribute(tag, 'src');
    const srcset = attribute(tag, 'srcset')?.split(',').map((candidate) => candidate.trim().split(/\s+/)[0]) ?? [];
    return [src, ...srcset].filter((value): value is string => Boolean(value));
  }).filter((value) => /paradise-fine-foods-logo/i.test(value));
  if (emitted.length === 0) throw new Error(`${locale}: Paradise logo image source missing`);
  for (const logoUrl of emitted) {
    const pathname = requireRootRelativeTarget(logoUrl, `${locale}: Paradise logo`);
    const logoFile = join(dist, decodeURIComponent(pathname).replace(/^\/+/, ''));
    if (!existsSync(logoFile)) throw new Error(`${locale}: emitted Paradise logo missing: ${logoUrl}`);
  }
};

export const assertCarousel = (html: string, locale: keyof typeof carouselCopy): void => {
  const subtree = carouselSubtree(html, locale);
  const opening = requireTag(subtree, /<section\b[^>]*>/i, `${locale}: carousel opening missing`);
  const copy = carouselCopy[locale];
  if (attribute(opening, 'aria-roledescription') !== 'carousel' || attribute(opening, 'aria-label') !== copy.label) {
    throw new Error(`${locale}: labeled carousel region missing`);
  }
  const previous = requireTag(subtree, /<button\b[^>]*data-carousel-previous[^>]*>/i, `${locale}: previous button missing`);
  const next = requireTag(subtree, /<button\b[^>]*data-carousel-next[^>]*>/i, `${locale}: next button missing`);
  if (attribute(previous, 'aria-label') !== copy.previous) throw new Error(`${locale}: previous label missing`);
  if (attribute(next, 'aria-label') !== copy.next) throw new Error(`${locale}: next label missing`);
  const viewport = requireTag(subtree, /<[^>]+\bdata-carousel-viewport\b[^>]*>/i, `${locale}: carousel viewport missing`);
  if (attribute(viewport, 'tabindex') !== '0') throw new Error(`${locale}: carousel viewport must be focusable`);
  const status = requireTag(subtree, /<[^>]+\bdata-carousel-status\b[^>]*>/i, `${locale}: carousel live status missing`);
  if (attribute(status, 'aria-live') !== 'polite' || attribute(status, 'aria-atomic') !== 'true') {
    throw new Error(`${locale}: carousel status must be an atomic polite live region`);
  }
  if (attribute(status, 'data-carousel-status-template') !== copy.status) {
    throw new Error(`${locale}: localized carousel status template missing`);
  }
  if ([...subtree.matchAll(/\bdata-carousel-item(?:\s|>)/gi)].length < 2) {
    throw new Error(`${locale}: carousel must expose all featured items`);
  }
};

export const assertRedirect = (html: string, target: string, legacy: string): void => {
  const expected = normalizedPath(target);
  const refreshTag = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .find((tag) => attribute(tag, 'http-equiv')?.toLowerCase() === 'refresh');
  const refreshTarget = refreshTag ? attribute(refreshTag, 'content')?.match(/^[^;]+;\s*url=(.+)$/i)?.[1] : undefined;
  if (requireRootRelativeTarget(refreshTarget, `${legacy}: meta refresh`) !== expected) {
    throw new Error(`${legacy}: meta-refresh target must be ${target}`);
  }

  const canonicalTag = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .find((tag) => attribute(tag, 'rel')?.toLowerCase() === 'canonical');
  const canonicalValue = canonicalTag ? attribute(canonicalTag, 'href') : undefined;
  if (!canonicalValue) throw new Error(`${legacy}: canonical target missing`);
  const canonical = new URL(canonicalValue);
  if (canonical.origin !== configuredOrigin || normalizedPath(canonical.pathname) !== expected || canonical.search || canonical.hash) {
    throw new Error(`${legacy}: canonical target must use ${configuredOrigin}${target}`);
  }

  const bodyTarget = attribute(requireTag(html, /<a\b[^>]*>/i, `${legacy}: body link missing`), 'href');
  if (requireRootRelativeTarget(bodyTarget, `${legacy}: body link`) !== expected) {
    throw new Error(`${legacy}: body link target must be ${target}`);
  }
};

const importedJs = (content: string, includeDynamic = true): string[] => {
  const imports = new Set<string>();
  for (const pattern of [
    /\bimport\s*["'`](\.{1,2}\/[^"'`]+\.js)["'`]/g,
    /\bfrom\s*["'`](\.{1,2}\/[^"'`]+\.js)["'`]/g,
    ...(includeDynamic ? [/\bimport\s*\(\s*["'`](\.{1,2}\/[^"'`]+\.js)["'`]\s*\)/g] : []),
  ]) {
    for (const match of content.matchAll(pattern)) imports.add(match[1]);
  }
  return [...imports];
};

export const collectReachableJs = (dist: string, entryUrl: string, includeDynamic = true): Set<string> => {
  const entryPath = join(dist, requireRootRelativeTarget(entryUrl, 'Living Hero entry').replace(/^\/+/, ''));
  const reachable = new Set<string>();
  const visit = (file: string): void => {
    const absolute = resolve(file);
    const fromDist = relative(resolve(dist), absolute);
    if (fromDist.startsWith('..') || fromDist === '') throw new Error(`Enhancement import escapes dist: ${file}`);
    if (reachable.has(absolute)) return;
    if (!existsSync(absolute)) throw new Error(`Missing emitted enhancement import: ${fromDist}`);
    reachable.add(absolute);
    for (const specifier of importedJs(readFileSync(absolute, 'utf8'), includeDynamic)) visit(resolve(dirname(absolute), specifier));
  };
  visit(entryPath);
  return reachable;
};

const emittedHomepageFile = (dist: string, value: string | undefined): string | undefined => {
  if (!value || value.startsWith('data:') || !value.startsWith('/') || value.startsWith('//')) return undefined;
  const rawPath = value.split(/[?#]/, 1)[0];
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(rawPath);
  } catch {
    return undefined;
  }
  if (decodedPath.split('/').includes('..')) return undefined;
  const url = new URL(value, configuredOrigin);
  if (url.origin !== configuredOrigin) return undefined;
  const file = resolve(dist, `.${url.pathname}`);
  const fromDist = relative(resolve(dist), file);
  if (!fromDist || fromDist.startsWith('..') || !existsSync(file)) return undefined;
  return file;
};

const homepageTags = (html: string): string[] => [...html.matchAll(/<(?:img|source|link|script)\b[^>]*>/gi)].map(([tag]) => tag);
const srcsetUrls = (value: string | undefined): string[] => value?.split(',')
  .map((candidate) => candidate.trim().split(/\s+/)[0])
  .filter(Boolean) ?? [];

export const collectHomepageInitialJs = (dist: string, html: string): Set<string> => {
  const files = new Set<string>();
  for (const tag of homepageTags(html).filter((tag) => /^<script\b/i.test(tag))) {
    const src = attribute(tag, 'src');
    if (!src?.endsWith('.js') || !emittedHomepageFile(dist, src)) continue;
    for (const file of collectReachableJs(dist, src, false)) files.add(file);
  }
  return files;
};

export const collectHomepageAuthoredSvgs = (dist: string, html: string): Set<string> => {
  const files = new Set<string>();
  for (const tag of homepageTags(html)) {
    const isImageLink = /^<link\b/i.test(tag)
      && attribute(tag, 'rel')?.toLowerCase() === 'preload'
      && attribute(tag, 'as')?.toLowerCase() === 'image';
    if (/^<link\b/i.test(tag) && !isImageLink) continue;
    for (const value of [attribute(tag, 'src'), attribute(tag, 'href'), ...srcsetUrls(attribute(tag, 'srcset'))]) {
      const file = emittedHomepageFile(dist, value);
      if (file?.toLowerCase().endsWith('.svg')) files.add(file);
    }
  }
  return files;
};

const gzipBytes = (files: Iterable<string>): number => [...files].reduce(
  (total, file) => total + gzipSync(readFileSync(file)).byteLength,
  0,
);

export const assertGzipBudget = (files: Iterable<string>, budget: number, label: string): number => {
  const bytes = gzipBytes(files);
  if (bytes > budget) throw new Error(`${label} are ${bytes} gzip bytes (budget ${budget})`);
  return bytes;
};

const homepageEntry = (html: string, locale: string): string => {
  const scripts = [...html.matchAll(/<script\b[^>]*>/gi)].map(([tag]) => tag);
  const entry = scripts.map((tag) => attribute(tag, 'src'))
    .find((src) => src?.includes('LivingHero.astro_astro_type_script'));
  if (!entry) throw new Error(`${locale}: Living Hero enhancement entry missing`);
  return entry;
};

export const verifyBuiltLivingDesign = (dist: string): number => {
  if (!existsSync(dist)) throw new Error('dist is missing; run the production build first');
  const files = filesBelow(dist);
  for (const file of files.filter((path) => /\.(?:html|css|js|json)$/.test(path))) {
    if (forbidden.test(readFileSync(file, 'utf8'))) throw new Error(`3D residue in ${relative(dist, file)}`);
  }
  for (const route of canonicalRoutes) {
    if (!existsSync(join(dist, route.slice(1), 'index.html'))) throw new Error(`Missing canonical route ${route}`);
  }

  const enhancementFiles = new Set<string>();
  const criticalInitialFiles = new Set<string>();
  const authoredSvgFiles = new Set<string>();
  for (const locale of ['en', 'vi'] as const) {
    const html = readFileSync(join(dist, locale, 'index.html'), 'utf8');
    assertHomepageLogo(html, dist, locale);
    assertCarousel(html, locale);
    for (const file of collectReachableJs(dist, homepageEntry(html, locale))) enhancementFiles.add(file);
    for (const file of collectHomepageInitialJs(dist, html)) criticalInitialFiles.add(file);
    for (const file of collectHomepageAuthoredSvgs(dist, html)) authoredSvgFiles.add(file);
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
    assertRedirect(readFileSync(redirectFile, 'utf8'), target, legacy);
  }

  const criticalInitialGzip = assertGzipBudget(criticalInitialFiles, 120_000, 'Critical initial JavaScript');
  const authoredSvgGzip = assertGzipBudget(authoredSvgFiles, 80_000, 'Homepage authored SVG graphics');
  const enhancementGzip = assertGzipBudget(enhancementFiles, 35_000, 'Enhancements');
  console.log(
    `Living design verified: ${canonicalRoutes.length} canonical routes, ${criticalInitialFiles.size} initial JS files (${criticalInitialGzip} gzip bytes), ${authoredSvgFiles.size} homepage SVG files (${authoredSvgGzip} gzip bytes), ${enhancementFiles.size} reachable enhancement files (${enhancementGzip} gzip bytes).`,
  );
  return enhancementGzip;
};

if (resolve(process.argv[1] ?? '') === resolve(import.meta.path)) verifyBuiltLivingDesign(join(root, 'dist'));
