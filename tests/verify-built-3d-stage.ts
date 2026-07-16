import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const distDir = resolve(import.meta.dir, '../dist');

for (const locale of ['en', 'vi'] as const) {
  const html = readFileSync(join(distDir, locale, 'index.html'), 'utf8');
  const viewerTag = html.match(/<model-viewer\b[^>]*>/)?.[0];

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
  if (!viewerTag) {
    throw new Error(`${locale}: model-viewer host is missing from initial HTML`);
  }
  if (/\ssrc=/.test(viewerTag)) {
    throw new Error(`${locale}: model-viewer eagerly includes src: ${viewerTag}`);
  }

  console.log(`PASS ${locale}: poster/status present and model-viewer src deferred`);
}
