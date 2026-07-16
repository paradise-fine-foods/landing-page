import { existsSync, readFileSync } from 'node:fs';
import { join, posix, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const distDir = resolve(import.meta.dir, '../dist');
const assetDir = join(distDir, '_astro');
const lazyEntries = new Set<string>();
const initialHtml = new Map<string, string>();

function attribute(tag: string, name: string) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
}

for (const locale of ['en', 'vi'] as const) {
  const html = readFileSync(join(distDir, locale, 'index.html'), 'utf8');
  initialHtml.set(locale, html);
  const stageTag = html.match(/<product-stage\b[^>]*>/)?.[0];
  const picture = html.match(/<picture\b[^>]*class="product-stage__poster"[^>]*>([\s\S]*?)<\/picture>/)?.[0];
  const sourceTag = picture?.match(/<source\b[^>]*>/)?.[0];
  const posterTag = picture?.match(/<img\b[^>]*>/)?.[0];
  const canvasTag = html.match(/<canvas\b[^>]*class="product-stage__canvas"[^>]*>/)?.[0];

  if (!stageTag) throw new Error(`${locale}: product stage is missing`);
  for (const deadFallbackAttribute of ['role', 'aria-label', 'aria-describedby', 'tabindex', 'aria-busy']) {
    if (attribute(stageTag, deadFallbackAttribute) !== undefined) {
      throw new Error(`${locale}: SSR fallback has dead interactive attribute ${deadFallbackAttribute}`);
    }
  }
  if (!attribute(stageTag, 'data-accessible-label') || !attribute(stageTag, 'data-interaction-prompt')) {
    throw new Error(`${locale}: localized eligible-state copy is not available to progressive enhancement`);
  }
  const statusMatch = html.match(/<span\b[^>]*role="status"[^>]*>([^<]*)<\/span>/);
  if (!statusMatch
    || statusMatch[1] !== attribute(stageTag, 'data-error-status')
    || statusMatch[1] === attribute(stageTag, 'data-interaction-prompt')) {
    throw new Error(`${locale}: SSR status must describe the static fallback, not unavailable interaction`);
  }
  if (!picture || !sourceTag || !posterTag) {
    throw new Error(`${locale}: responsive authored poster picture is missing`);
  }
  if (attribute(sourceTag, 'media') !== '(max-width: 36rem)'
    || attribute(sourceTag, 'width') !== '800'
    || attribute(sourceTag, 'height') !== '1000') {
    throw new Error(`${locale}: mobile poster does not reserve the authored 4:5 source`);
  }
  if (attribute(posterTag, 'width') !== '1600'
    || attribute(posterTag, 'height') !== '1000'
    || attribute(posterTag, 'loading') !== 'eager'
    || attribute(posterTag, 'decoding') !== 'sync'
    || attribute(posterTag, 'fetchpriority') !== 'high'
    || !attribute(posterTag, 'alt')) {
    throw new Error(`${locale}: desktop 16:10 poster is not the prioritized sole image alternative`);
  }
  if (!canvasTag
    || attribute(canvasTag, 'role') !== 'presentation'
    || attribute(canvasTag, 'aria-hidden') !== 'true'
    || attribute(canvasTag, 'aria-label')) {
    throw new Error(`${locale}: 3D canvas must remain presentational without duplicate image semantics`);
  }
  if (!html.includes('role="status"') || !html.includes('class="hero__actions"') || !html.includes('class="hero__rail"')) {
    throw new Error(`${locale}: poster-backed status, hero CTAs, or metadata is missing`);
  }
  if (!html.includes('data-model-src="/models/demo-package.glb"')) {
    throw new Error(`${locale}: lazy model URL is missing from the stage dataset`);
  }
  if (/<(?:script|link)\b[^>]*(?:three|viewer|demo-package\.glb)/i.test(html)) {
    throw new Error(`${locale}: initial HTML eagerly references the 3D runtime or model`);
  }

  const mobilePoster = attribute(sourceTag, 'srcset');
  const desktopPoster = attribute(posterTag, 'src');
  const preloadTags = [...html.matchAll(/<link\b[^>]*rel="preload"[^>]*>/g)].map(([tag]) => tag);
  for (const [href, media] of [
    [mobilePoster, '(max-width: 36rem)'],
    [desktopPoster, '(min-width: 36.001rem)'],
  ] as const) {
    const preload = preloadTags.find((tag) => attribute(tag, 'href') === href);
    if (!preload || attribute(preload, 'as') !== 'image' || attribute(preload, 'media') !== media || attribute(preload, 'fetchpriority') !== 'high') {
      throw new Error(`${locale}: responsive LCP source ${href} lacks its matching high-priority preload`);
    }
    const emittedPath = join(distDir, new URL(href!, 'https://build.test').pathname.replace(/^\/+/, ''));
    if (!existsSync(emittedPath)) throw new Error(`${locale}: responsive poster was not emitted: ${href}`);
  }

  const stageScript = html.match(/<script\s+type="module"\s+src="([^"]*ProductStage[^"]+)"/)?.[1];
  if (!stageScript) throw new Error(`${locale}: stage activation script is missing`);
  const activationSource = readFileSync(join(distDir, stageScript.replace(/^\//, '')), 'utf8');
  const lazyRuntime = activationSource.match(/import\([`'"]\.\/(viewer\.[^`'"]+\.js)[`'"]\)/)?.[1];
  if (!lazyRuntime) throw new Error(`${locale}: stage script has no lazy viewer import`);
  lazyEntries.add(lazyRuntime);

  console.log(`PASS ${locale}: responsive LCP poster, accessible fallback, and deferred 3D contract`);
}

if (lazyEntries.size !== 1) {
  throw new Error(`Expected one shared lazy 3D entry, found: ${[...lazyEntries].join(', ')}`);
}

function staticImports(source: string) {
  const imports = new Set<string>();
  for (const match of source.matchAll(/\bimport\s*(?:[^"'()]*?\bfrom\s*)?["']([^"']+\.js)["']/g)) {
    const specifier = match[1]!;
    if (specifier.startsWith('.') || specifier.startsWith('/_astro/')) imports.add(specifier);
  }
  return imports;
}

const runtimeGraph = new Set<string>();
function visitRuntimeAsset(assetName: string) {
  if (runtimeGraph.has(assetName)) return;
  const assetPath = join(assetDir, assetName);
  if (!existsSync(assetPath)) throw new Error(`Lazy 3D static import is missing: ${assetName}`);
  runtimeGraph.add(assetName);
  const source = readFileSync(assetPath, 'utf8');
  for (const specifier of staticImports(source)) {
    const importedAsset = specifier.startsWith('/_astro/')
      ? specifier.slice('/_astro/'.length)
      : posix.normalize(posix.join(posix.dirname(assetName), specifier));
    visitRuntimeAsset(importedAsset);
  }
}
visitRuntimeAsset([...lazyEntries][0]!);

for (const [locale, html] of initialHtml) {
  for (const assetName of runtimeGraph) {
    if (html.includes(assetName)) {
      throw new Error(`${locale}: lazy runtime asset is referenced by initial HTML/modulepreload: ${assetName}`);
    }
  }
}

let rawBytes = 0;
let gzipBytes = 0;
for (const assetName of runtimeGraph) {
  const bytes = readFileSync(join(assetDir, assetName));
  rawBytes += bytes.byteLength;
  gzipBytes += gzipSync(bytes, { level: 9 }).byteLength;
}
const budgetBytes = 180_000;
if (gzipBytes > budgetBytes) {
  throw new Error(`Lazy 3D graph (${[...runtimeGraph].join(', ')}) is ${gzipBytes} gzip bytes; budget is ${budgetBytes}`);
}

console.log(`PASS lazy 3D graph (${[...runtimeGraph].join(', ')}): ${rawBytes} raw / ${gzipBytes} gzip bytes (<= ${budgetBytes})`);
