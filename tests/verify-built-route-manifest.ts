import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function expectedRuntimeRouteFiles(): string[] {
  return [
    'src/pages/404.astro',
    'src/pages/503.astro',
    'src/pages/[locale]/blogs/[slug].astro',
    'src/pages/[locale]/blogs/index.astro',
    'src/pages/[locale]/brands/[slug].astro',
    'src/pages/[locale]/brands/index.astro',
    'src/pages/[locale]/contact/[mode].astro',
    'src/pages/[locale]/contact.astro',
    'src/pages/[locale]/index.astro',
    'src/pages/[locale]/products/[slug].astro',
    'src/pages/[locale]/products/index.astro',
    'src/pages/[locale]/recipes/[slug].astro',
    'src/pages/[locale]/recipes/index.astro',
    'src/pages/api/enquiry.ts',
    'src/pages/api/revalidate.ts',
    'src/pages/index.astro',
    'src/pages/sitemap.xml.ts',
  ];
}

export function expectedBuiltWorkerRoutes(): string[] {
  return [
    '/',
    '/404',
    '/503',
    '/[locale]',
    '/[locale]/blogs',
    '/[locale]/blogs/[slug]',
    '/[locale]/brands',
    '/[locale]/brands/[slug]',
    '/[locale]/contact',
    '/[locale]/contact/[mode]',
    '/[locale]/products',
    '/[locale]/products/[slug]',
    '/[locale]/recipes',
    '/[locale]/recipes/[slug]',
    '/api/enquiry',
    '/api/revalidate',
    '/sitemap.xml',
    '/_server-islands/[name]',
  ];
}

export function builtWorkerRoutes(workerSource: string): string[] {
  return [...workerSource.matchAll(/"route":"([^"]+)"/g)]
    .map((match) => JSON.parse(`"${match[1]}"`) as string);
}

export function assertBuiltWorkerRoutesText(workerSource: string): void {
  const actual = new Set(builtWorkerRoutes(workerSource));
  const missing = expectedBuiltWorkerRoutes().filter((route) => !actual.has(route));
  if (missing.length === 0) return;

  throw new Error(missing.map((route) => `Missing built Worker route: ${route}`).join('\n'));
}

export function assertBuiltWorkerRoutes(distDir: string): void {
  const entry = join(distDir, 'server', 'entry.mjs');
  if (!existsSync(entry)) throw new Error(`Missing built Worker entry: ${entry}`);
  assertBuiltWorkerRoutesText(readFileSync(entry, 'utf8'));
}

export function runtimeRouteFiles(projectRoot: string): string[] {
  return Array.from(new Bun.Glob('src/pages/**/*').scanSync({
    cwd: projectRoot,
    onlyFiles: true,
  }))
    .map((route) => route.replaceAll('\\', '/'))
    .filter((route) => route.endsWith('.astro') || route.endsWith('.ts'))
    .sort();
}

export function assertRuntimeRouteManifest(projectRoot: string): void {
  const expected = new Set(expectedRuntimeRouteFiles());
  const actual = new Set(runtimeRouteFiles(projectRoot));
  const missing = [...expected].filter((route) => !actual.has(route));
  const unexpected = [...actual].filter((route) => !expected.has(route));

  if (missing.length === 0 && unexpected.length === 0) return;

  const details = [
    ...missing.map((route) => `Missing: ${route}`),
    ...unexpected.map((route) => `Unexpected: ${route}`),
  ];
  throw new Error(`Runtime route manifest mismatch.\n${details.join('\n')}`);
}

if (import.meta.main) {
  const projectRoot = join(import.meta.dir, '..');
  if (!existsSync(join(projectRoot, 'src/pages'))) throw new Error('Missing src/pages.');
  assertRuntimeRouteManifest(projectRoot);
  assertBuiltWorkerRoutes(join(projectRoot, 'dist'));
  console.log(
    `Verified ${expectedRuntimeRouteFiles().length} source route files and ${expectedBuiltWorkerRoutes().length} emitted Worker routes.`,
  );
}
