import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const distDir = resolve(import.meta.dir, '../dist');
const locales = ['en', 'vi'] as const;

for (const locale of locales) {
  const htmlPath = join(distDir, locale, 'index.html');
  const html = readFileSync(htmlPath, 'utf8');
  const assetUrls = [
    ...html.matchAll(
      /(?:src|content)="([^"]*(?:product-stage|editorial-table)[^"]*)"/g,
    ),
  ].map((match) => match[1]);

  if (assetUrls.length === 0) {
    throw new Error(`${locale}: no CMS demo asset URLs found in generated homepage`);
  }

  for (const assetUrl of new Set(assetUrls)) {
    if (assetUrl.startsWith('file:') || assetUrl.startsWith('/src/')) {
      throw new Error(`${locale}: non-deployable CMS asset URL: ${assetUrl}`);
    }

    const pathname = new URL(assetUrl, 'https://build.test').pathname;
    const emittedPath = join(distDir, decodeURIComponent(pathname).replace(/^\/+/, ''));

    if (!existsSync(emittedPath)) {
      throw new Error(`${locale}: CMS asset was not emitted: ${assetUrl} -> ${emittedPath}`);
    }

    console.log(`PASS ${locale}: ${assetUrl} -> ${emittedPath}`);
  }
}
