import { demoBlogPosts, demoBrands, demoProducts } from '../src/lib/cms/demo-data';
import { contactModes } from '../src/lib/enquiry/modes';
import { locales } from '../src/lib/i18n/types';

const htmlRoute = (...segments: string[]) => `${segments.join('/')}/index.html`;

export function expectedGeneratedHtmlRoutes(): string[] {
  const routes = new Set<string>(['index.html', '404.html']);

  for (const locale of locales) {
    routes.add(htmlRoute(locale));
    routes.add(htmlRoute(locale, 'products'));
    routes.add(htmlRoute(locale, 'brands'));
    routes.add(htmlRoute(locale, 'blogs'));
    routes.add(htmlRoute(locale, 'contact'));

    for (const mode of contactModes) routes.add(htmlRoute(locale, 'contact', mode));
    for (const product of demoProducts) routes.add(htmlRoute(locale, 'products', product.slug[locale]));
    for (const brand of demoBrands) routes.add(htmlRoute(locale, 'brands', brand.slug[locale]));
    for (const post of demoBlogPosts) routes.add(htmlRoute(locale, 'blogs', post.slug[locale]));
  }

  return [...routes].sort();
}

export function generatedHtmlRoutes(distDir: string): string[] {
  return Array.from(new Bun.Glob('**/*.html').scanSync({ cwd: distDir, onlyFiles: true }))
    .map((route) => route.replaceAll('\\', '/'))
    .sort();
}

export function assertExactRouteManifest(distDir: string): void {
  const expected = new Set(expectedGeneratedHtmlRoutes());
  const actual = new Set(generatedHtmlRoutes(distDir));
  const missing = [...expected].filter((route) => !actual.has(route));
  const unexpected = [...actual].filter((route) => !expected.has(route));

  if (missing.length === 0 && unexpected.length === 0) return;

  const details = [
    ...missing.map((route) => `Missing: ${route}`),
    ...unexpected.map((route) => `Unexpected: ${route}`),
  ];
  throw new Error(`Generated HTML route manifest mismatch.\n${details.join('\n')}`);
}

if (import.meta.main) {
  assertExactRouteManifest('dist');
  console.log(`Verified exact ${expectedGeneratedHtmlRoutes().length}-page generated HTML route manifest.`);
}
