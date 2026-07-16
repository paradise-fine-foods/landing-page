import { readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const distDir = resolve(import.meta.dir, '../dist');
const assetDir = join(distDir, '_astro');
const runtimeAssets = new Set<string>();

for (const locale of ['en', 'vi'] as const) {
  const html = readFileSync(join(distDir, locale, 'index.html'), 'utf8');
  const canvasTag = html.match(/<canvas\b[^>]*class="product-stage__canvas"[^>]*>/)?.[0];

  if (!html.includes('<product-stage')) {
    throw new Error(`${locale}: product stage is missing from generated homepage`);
  }
  if (!html.includes('class="product-stage__poster"')) {
    throw new Error(`${locale}: authored poster is missing from initial HTML`);
  }
  if (!html.includes('role="status"')) {
    throw new Error(`${locale}: stage status is missing from initial HTML`);
  }
  if (!html.includes('class="hero__actions"')) {
    throw new Error(`${locale}: hero CTAs are missing from initial HTML`);
  }
  if (!html.includes('class="hero__rail"')) {
    throw new Error(`${locale}: hero metadata is missing from initial HTML`);
  }
  if (!html.includes('data-model-src="/models/demo-package.glb"')) {
    throw new Error(`${locale}: lazy model URL is missing from the stage dataset`);
  }
  if (!canvasTag || !canvasTag.includes('role="img"') || !canvasTag.includes('aria-label=')) {
    throw new Error(`${locale}: accessible 3D presentation canvas is missing from initial HTML`);
  }
  if (/<(?:script|link)\b[^>]*(?:three|viewer|demo-package\.glb)/i.test(html)) {
    throw new Error(`${locale}: initial HTML eagerly references the 3D runtime or model`);
  }

  const stageScript = html.match(/<script\s+type="module"\s+src="([^"]*ProductStage[^"]+)"/)?.[1];
  if (!stageScript) throw new Error(`${locale}: stage activation script is missing`);
  const activationSource = readFileSync(join(distDir, stageScript.replace(/^\//, '')), 'utf8');
  const lazyRuntime = activationSource.match(/import\([`'"]\.\/(viewer\.[^`'"]+\.js)[`'"]\)/)?.[1];
  if (!lazyRuntime) throw new Error(`${locale}: stage script has no lazy viewer import`);
  runtimeAssets.add(lazyRuntime);

  console.log(`PASS ${locale}: poster/status/canvas present and runtime/model remain deferred`);
}

if (runtimeAssets.size !== 1) {
  throw new Error(`Expected one shared lazy 3D runtime, found: ${[...runtimeAssets].join(', ')}`);
}

const runtimeName = [...runtimeAssets][0]!;
const runtimeBytes = readFileSync(join(assetDir, runtimeName));
const gzipBytes = gzipSync(runtimeBytes, { level: 9 }).byteLength;
const budgetBytes = 180_000;
if (gzipBytes > budgetBytes) {
  throw new Error(`${basename(runtimeName)} is ${gzipBytes} gzip bytes; budget is ${budgetBytes}`);
}

console.log(`PASS ${runtimeName}: ${runtimeBytes.byteLength} raw / ${gzipBytes} gzip bytes (<= ${budgetBytes})`);
