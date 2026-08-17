import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

describe('homepage composition', () => {
  test('keeps the root page redirect-free while Astro middleware owns locale negotiation', () => {
    const rootPage = source('src/pages/index.astro');

    expect(existsSync(join(root, 'src/pages/index.astro'))).toBe(true);
    expect(rootPage).not.toContain('Astro.redirect');
    expect(existsSync(join(root, 'src/middleware.ts'))).toBe(true);
  });

  test('site layout composes the shared shell around one main landmark', () => {
    const layout = source('src/layouts/SiteLayout.astro');

    expect(layout).not.toMatch(/DemoNotice|demoNotice/);
    expect(layout).toContain("import Header from '@/components/global/Header.astro'");
    expect(layout).toContain("import Footer from '@/components/global/Footer.astro'");
    expect(layout).toContain('<main id="main-content">');
  });

  test('living hero server-renders one image-forward product stage and compact facts', () => {
    const hero = source('src/components/sections/LivingHero.astro');

    expect(hero).toContain('interface Props');
    expect(hero).toContain('content.image.alt');
    expect(hero).toContain('width={content.image.width}');
    expect(hero).toContain('height={content.image.height}');
    expect(hero).toContain('living-hero__actions');
    expect(hero).toContain('<figcaption>{product.name}</figcaption>');
    expect(hero).toContain('living-hero__metadata');
    expect(hero).toContain('loading="eager"');
    expect(hero).toContain('fetchpriority="high"');
    expect(hero).not.toMatch(/data-living-canvas|<canvas|OrganicMark/);
    expect(hero).not.toMatch(/slot name="stage"|ProductStage|modelSrc/);
    expect(hero).toContain("import('@/lib/carousel/controller')");
    expect(hero).not.toMatch(/motion\/|shouldEnhanceMotion|data-motion-enhanced/);
    expect(hero).not.toMatch(/addEventListener\('pagehide',[\s\S]{0,240}\{ once: true \}/);
  });

  test('the localized homepage consumes CMS queries and a central locale counterpart', () => {
    const page = source('src/pages/[locale]/index.astro');

    expect(page).toContain('getGlobalSettings');
    expect(page).toContain('getFeaturedContent');
    expect(page).toContain('getCategories');
    expect(page).toContain('getProducts');
    expect(page).toContain('getBrands');
    expect(page).toContain('getLatestBlogPosts');
    expect(page).toContain('counterpartLocale');
    expect(page).toContain("import LivingHero from '@/components/sections/LivingHero.astro'");
    expect(page).toContain('<LivingHero');
    expect(page).toContain('<LatestBlogs');
    expect(page).not.toMatch(/ProductStage|modelSrc|slot="stage"/);
    expect(page).not.toMatch(/locale\s*===|locale\s*!==/);
    expect(page).toContain('carousel={copy.home.carousel}');
    const hero = source('src/components/sections/LivingHero.astro');
    expect(hero).toContain("import('@/lib/carousel/controller')");
    expect(hero).not.toContain("import('@/lib/motion/reveal')");
    expect(hero).not.toContain("import('@/lib/motion/living-canvas')");
  });

  test('derives hero preloads from the same CMS image rendered by the hero', () => {
    const page = source('src/pages/[locale]/index.astro');
    expect(page).not.toMatch(/import\s+livingHeroProductSrc\s+from/);
    expect(page).not.toContain('assets/demo/living-hero-product.svg');
    expect(page).toContain("const preloadImages = [{ href: featured.hero.image.src");
    expect(page).toContain('{preloadImages}');
    expect(page).toContain('image={featured.hero.image.src}');
  });

  test('keeps all ten homepage sections near-static and free of decorative motion hooks', () => {
    const files = [
      'sections/LivingHero.astro', 'sections/CredibilityStrip.astro',
      'sections/CategoryDiscovery.astro', 'sections/FeaturedProducts.astro',
      'sections/FeaturedBrands.astro', 'blogs/LatestBlogs.astro',
      'sections/PartnerStrip.astro', 'sections/ServiceProof.astro',
      'sections/ChannelPathways.astro', 'sections/FinalCta.astro',
    ];
    const components = files.map((file) => source(`src/components/${file}`)).join('\n');
    expect(components).not.toMatch(/data-reveal|data-revealed|data-motion-enhanced|data-living-canvas|<canvas/);
    expect(components).not.toMatch(/motion\/(?:reveal|living-canvas|preferences)/);
    expect(components).not.toMatch(/IntersectionObserver|requestAnimationFrame/);
  });
});
