import { existsSync } from 'node:fs';
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
    'src/pages/api/revalidate.ts',
    'src/pages/index.astro',
    'src/pages/sitemap.xml.ts',
  ];
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
  console.log(`Verified exact ${expectedRuntimeRouteFiles().length}-file runtime route manifest.`);
}
