import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';

import {
  RELEASE_GATE_IDS,
  classifyCapabilities,
  redactEvidence,
  verifyHtmlResponse,
  verifyReciprocalSeo,
} from '../scripts/release-gates.mjs';

describe('Task 9 release gate contract', () => {
  test('enumerates every cross-repository and browser release gate', () => {
    expect(RELEASE_GATE_IDS).toEqual([
      'directus-static',
      'directus-clean-docker',
      'directus-schema-convergence',
      'directus-licensed-anonymous-read',
      'astro-tests',
      'astro-check',
      'astro-build-once',
      'worker-publish-after-build',
      'worker-errors-and-seo',
      'directus-revalidation-flow',
      'browser-matrix',
      'lighthouse',
    ]);
  });

  test('reports deployment dependencies as blocked without converting them to passes', () => {
    expect(classifyCapabilities({
      docker: false,
      licensedAnonymousReads: false,
      cloudflarePurgeCredentials: false,
      playwright: true,
      lighthouse: false,
    })).toEqual([
      { id: 'directus-clean-docker', status: 'blocked', reason: 'Docker CLI or daemon unavailable' },
      { id: 'directus-licensed-anonymous-read', status: 'blocked', reason: 'Directus filtered public permissions unavailable in this runtime' },
      { id: 'directus-revalidation-flow', status: 'blocked', reason: 'Cloudflare purge credentials unavailable' },
      { id: 'browser-matrix', status: 'ready' },
      { id: 'lighthouse', status: 'blocked', reason: 'Lighthouse CLI unavailable' },
    ]);
  });

  test('redacts every configured secret value from durable evidence', () => {
    const source = 'Authorization: Bearer one-secret; token=second-secret';
    expect(redactEvidence(source, ['one-secret', 'second-secret']))
      .toBe('Authorization: Bearer [REDACTED]; token=[REDACTED]');
  });

  test('checks primary HTML, localized footer, island fallback, and noindex 503', async () => {
    const page = new Response(`<!doctype html><html lang="vi"><head>
      <link rel="canonical" href="https://paradisefinefoods.com/vi/products/new-product/">
    </head><body><main><h1>Sản phẩm mới</h1></main>
      <footer>Thành phố Hồ Chí Minh</footer>
      <section role="status" aria-busy="true">Đang tải đề xuất</section>
    </body></html>`, { status: 200, headers: { 'content-type': 'text/html' } });

    expect(await verifyHtmlResponse(page, {
      lang: 'vi',
      primaryText: 'Sản phẩm mới',
      footerText: 'Thành phố Hồ Chí Minh',
      canonical: 'https://paradisefinefoods.com/vi/products/new-product/',
      requireIslandFallback: true,
    })).toEqual([]);

    const unavailable = new Response('<meta name="robots" content="noindex">', {
      status: 503,
      headers: { 'content-type': 'text/html', 'cache-control': 'no-store' },
    });
    expect(await verifyHtmlResponse(unavailable, { expectedStatus: 503, noindex: true })).toEqual([]);
  });

  test('checks reciprocal canonical and hreflang output in HTML', () => {
    const en = '<link rel="canonical" href="https://paradisefinefoods.com/en/blogs/story/"><link rel="alternate" hreflang="en" href="https://paradisefinefoods.com/en/blogs/story/"><link rel="alternate" hreflang="vi" href="https://paradisefinefoods.com/vi/blogs/cau-chuyen/">';
    const vi = '<link rel="canonical" href="https://paradisefinefoods.com/vi/blogs/cau-chuyen/"><link rel="alternate" hreflang="vi" href="https://paradisefinefoods.com/vi/blogs/cau-chuyen/"><link rel="alternate" hreflang="en" href="https://paradisefinefoods.com/en/blogs/story/">';
    expect(verifyReciprocalSeo(en, vi, {
      en: 'https://paradisefinefoods.com/en/blogs/story/',
      vi: 'https://paradisefinefoods.com/vi/blogs/cau-chuyen/',
    })).toEqual([]);
  });

  test('ships exact raw/DOM SEO assertions and collision-proof route screenshot names', async () => {
    const source = await readFile(new URL('../scripts/browser-release-smoke.py', import.meta.url), 'utf8');
    for (const contract of [
      'sync_playwright',
      'chromium.launch(headless=True)',
      "wait_for_load_state(\"networkidle\")",
      'java_script_enabled=False',
      'reduced_motion="reduce"',
      'viewport={"width": 390, "height": 844}',
      'page.keyboard.press("Tab")',
      'document.documentElement.scrollWidth',
      'link[rel="canonical"]',
      'link[rel="alternate"][hreflang="en"]',
      'link[rel="alternate"][hreflang="vi"]',
      'assert_initial_metadata(html, route, url)',
      'screenshot_name(route, \'desktop\')',
      'class MetadataParser(HTMLParser)',
      'path_digest = hashlib.sha256(path.encode("utf-8")).hexdigest()\n    return',
      'return f"{readable_path}-{path_digest}--{route[\'lang\']}--{viewport}.png"',
    ]) expect(source).toContain(contract);
  });
});
