import { describe, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  assertRuntimeRouteManifest,
  expectedRuntimeRouteFiles,
} from './verify-built-route-manifest';

const fixture = () => {
  const projectRoot = mkdtempSync(join(tmpdir(), 'runtime-route-manifest-'));
  for (const route of expectedRuntimeRouteFiles()) {
    const file = join(projectRoot, route);
    mkdirSync(join(file, '..'), { recursive: true });
    writeFileSync(file, '');
  }
  return projectRoot;
};

describe('Astro runtime route manifest', () => {
  test('accepts exactly the server route shapes and runtime sitemap endpoint', () => {
    const projectRoot = join(import.meta.dir, '..');
    const routes = expectedRuntimeRouteFiles();

    expect(routes).toHaveLength(14);
    expect(routes).toContain('src/pages/sitemap.xml.ts');
    expect(routes).toContain('src/pages/[locale]/products/[slug].astro');
    expect(routes).toContain('src/pages/[locale]/blogs/[slug].astro');
    expect(routes.some((route) => /src\/pages\/(?:en|vi)\//.test(route))).toBe(false);
    expect(() => assertRuntimeRouteManifest(projectRoot)).not.toThrow();
  });

  test('rejects an unsupported runtime route file', () => {
    const projectRoot = fixture();
    const extra = join(projectRoot, 'src/pages/[locale]/products/preview.astro');
    mkdirSync(join(extra, '..'), { recursive: true });
    writeFileSync(extra, '');

    expect(() => assertRuntimeRouteManifest(projectRoot))
      .toThrow('Unexpected: src/pages/[locale]/products/preview.astro');
  });

  test('rejects a missing runtime route file', () => {
    const projectRoot = fixture();
    const missing = 'src/pages/[locale]/contact/[mode].astro';
    rmSync(join(projectRoot, missing));

    expect(() => assertRuntimeRouteManifest(projectRoot)).toThrow(`Missing: ${missing}`);
  });
});
