import { describe, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  assertExactRouteManifest,
  expectedGeneratedHtmlRoutes,
} from './verify-built-route-manifest';

const fixture = () => {
  const dist = mkdtempSync(join(tmpdir(), 'route-manifest-'));
  for (const route of expectedGeneratedHtmlRoutes()) {
    const file = join(dist, route);
    mkdirSync(join(file, '..'), { recursive: true });
    writeFileSync(file, '<!doctype html>');
  }
  return dist;
};

const addRoute = (dist: string, route: string) => {
  const file = join(dist, route);
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, '<!doctype html>');
};

describe('generated HTML route manifest', () => {
  test('accepts exactly the closed canonical route set', () => {
    const dist = fixture();
    const routes = expectedGeneratedHtmlRoutes();

    expect(routes).toHaveLength(42);
    expect(routes).toContain('index.html');
    expect(routes).toContain('404.html');
    expect(routes.some((route) => /vi\/(?:san-pham|thuong-hieu|lien-he)(?:\/|$)/.test(route))).toBe(false);
    expect(() => assertExactRouteManifest(dist)).not.toThrow();
  });

  test.each([
    ['an unsupported locale', 'fr/index.html'],
    ['an unsupported contact mode', 'en/contact/partner/index.html'],
    ['an unknown product slug', 'vi/products/khong-ton-tai/index.html'],
    ['an unknown blog slug', 'en/blogs/not-a-post/index.html'],
  ])('rejects %s', (_label, route) => {
    const dist = fixture();
    addRoute(dist, route);

    expect(() => assertExactRouteManifest(dist)).toThrow(`Unexpected: ${route}`);
  });

  test('rejects a missing expected route', () => {
    const dist = fixture();
    const missing = 'en/contact/supplier/index.html';
    rmSync(join(dist, missing));

    expect(() => assertExactRouteManifest(dist)).toThrow(`Missing: ${missing}`);
  });
});
