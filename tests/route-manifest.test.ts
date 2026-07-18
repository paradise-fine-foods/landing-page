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
  test('accepts exactly the closed canonical and legacy route set', () => {
    const dist = fixture();

    expect(expectedGeneratedHtmlRoutes()).toContain('index.html');
    expect(expectedGeneratedHtmlRoutes()).toContain('404.html');
    expect(() => assertExactRouteManifest(dist)).not.toThrow();
  });

  test.each([
    ['an unsupported locale', 'fr/index.html'],
    ['an unsupported contact mode', 'en/contact/partner/index.html'],
    ['an unknown product slug', 'vi/products/khong-ton-tai/index.html'],
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
