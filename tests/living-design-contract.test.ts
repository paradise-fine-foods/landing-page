import { describe, expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ui } from '../src/lib/i18n/ui';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');
const filesBelow = (directory: string): string[] => readdirSync(join(root, directory), { withFileTypes: true })
  .flatMap((entry) => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? filesBelow(path) : [path];
  });
const cssRule = (css: string, selector: string) => [...(css.includes('<style>') ? css.slice(css.lastIndexOf('<style>') + '<style>'.length) : css).matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter(([, selectors]) => selectors.split(',').some((item) => item.trim() === selector))
  .at(-1)?.[2] ?? '';

const primaryNavRules = (css: string) => [...css.matchAll(/([^{}]*\.primary-nav[^{}]*)\{([^{}]*)\}/g)]
  .map(([, selector, declarations]) => ({ selector: selector.trim(), declarations }));

const relativeLuminance = (hex: string) => {
  const channels = hex.match(/[a-f\d]{2}/gi)?.map((value) => Number.parseInt(value, 16) / 255) ?? [];
  const [red, green, blue] = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
};

const contrastRatio = (foreground: string, background: string) => {
  const values = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};

describe('Precision Supply System identity', () => {
  test('contains no 3D runtime, model, or stage contract', () => {
    const packageJson = JSON.parse(source('package.json'));
    expect(packageJson.dependencies?.three).toBeUndefined();
    expect(packageJson.devDependencies?.['@types/three']).toBeUndefined();
    for (const path of ['src/components/three', 'src/lib/three', 'public/models']) {
      expect(existsSync(join(root, path))).toBe(false);
    }
    const textFiles = filesBelow('src').filter((path) => /\.(?:astro|css|js|ts)$/.test(path));
    expect(textFiles.filter((path) => /three|webgl|\.glb|model-src|product-stage/i.test(source(path)))).toEqual([]);
  });

  test('self-hosts and renders the authentic Paradise logo', () => {
    const logoPath = join(root, 'src/assets/brand/paradise-fine-foods-logo.png');
    expect(existsSync(logoPath)).toBe(true);
    const logo = readFileSync(logoPath);
    expect(logo.subarray(0, 8).toString('hex').toUpperCase()).toBe('89504E470D0A1A0A');
    expect(logo.subarray(12, 16).toString('ascii')).toBe('IHDR');
    expect(logo.readUInt32BE(16)).toBe(158);
    expect(logo.readUInt32BE(20)).toBe(130);
    expect(createHash('sha256').update(logo).digest('hex').toUpperCase()).toBe(
      '74927386123C4ECBC4118B583F77F465A7E72C79548289CC7F9A9DFE531D2F0A',
    );
    for (const file of ['src/components/global/Header.astro', 'src/components/global/Footer.astro']) {
      const component = source(file);
      expect(component).toContain('paradise-fine-foods-logo.png');
      expect(component).toContain('<Image');
    }
    expect(source('src/components/global/Header.astro')).not.toContain('<span>Paradise</span>');
  });

  test('defines the approved industrial palette and neutral compatibility mappings', () => {
    const tokens = source('src/styles/tokens.css').toLowerCase();
    for (const declaration of [
      '--color-process-white: #ffffff',
      '--color-cold-paper: #f5f6f2',
      '--color-brushed-steel: #d9dcd7',
      '--color-graphite: #202522',
      '--color-utility-grey: #68706a',
      '--color-paradise-orange: #e46f2c',
      '--color-success: #356146',
      '--color-error: #9a3f38',
    ]) expect(tokens).toContain(declaration);

    for (const retiredHex of ['#fa6c47', '#0796d2', '#94c11f', '#d94d55', '#fbfaf5', '#28342b', '#e8f6fa']) {
      expect(tokens).not.toContain(retiredHex);
    }

    expect(tokens).toContain('--color-paper-white: var(--color-process-white)');
    expect(tokens).toContain('--color-rice-paper: var(--color-cold-paper)');
    expect(tokens).toContain('--color-mist-blue: var(--color-cold-paper)');
    expect(tokens).toContain('--color-deep-herb: var(--color-graphite)');
    expect(tokens).toContain('--shape-drop: var(--radius-sm)');
  });

  test('keeps the active palette free of retired compatibility aliases', () => {
    const tokens = source('src/styles/tokens.css').toLowerCase();
    expect(tokens).not.toContain('--color-cold-chain-blue');
    for (const alias of ['--color-milk-paper', '--color-carbon', '--color-stainless', '--color-cultured-butter', '--color-bordeaux']) {
      expect(tokens).not.toContain(alias);
    }
    expect(tokens).toContain('--color-success: #356146');
    expect(tokens).toContain('--color-error: #9a3f38');
    expect(source('src/styles/global.css')).not.toContain('--color-carbon');
    expect(source('src/components/sections/LivingHero.astro')).not.toContain('--color-stainless');
  });

  test('keeps retired cold-chain palette aliases out of active source consumers', () => {
    const activeFiles = filesBelow('src').filter((path) => /\.(?:astro|css|js|ts)$/.test(path));
    expect(activeFiles.filter((path) => source(path).includes('--color-cold-chain-blue'))).toEqual([]);
  });

  test('keeps small category and brand metadata text at contrast-safe graphite', () => {
    expect(contrastRatio('#202522', '#ffffff')).toBeGreaterThanOrEqual(4.5);
    expect(cssRule(source('src/components/sections/CategoryDiscovery.astro'), '.category-discovery__copy span')).toContain('color: var(--color-deep-herb)');
    const brands = source('src/components/sections/FeaturedBrands.astro');
    expect(cssRule(brands, '.featured-brands__origin')).toContain('color: var(--color-deep-herb)');
    expect(cssRule(brands, '.featured-brands__secondary article > p:first-child')).toContain('color: var(--color-deep-herb)');
  });

  test('uses Nunito for body and navigation while reserving Newsreader for display type', () => {
    const packageJson = source('package.json');
    expect(packageJson).toContain('@fontsource/nunito');
    expect(packageJson).not.toContain('@fontsource/be-vietnam-pro');
    for (const file of ['src/layouts/SiteLayout.astro', 'src/pages/404.astro']) {
      expect(source(file)).not.toContain('@fontsource/be-vietnam-pro');
    }

    const tokens = source('src/styles/tokens.css');
    expect(tokens).toContain("--font-body: 'Nunito', system-ui, sans-serif");

    const header = source('src/components/global/Header.astro');
    const navRules = primaryNavRules(header);
    expect(navRules.length).toBeGreaterThan(0);
    for (const { selector, declarations } of navRules) {
      expect(declarations, `${selector} must reserve Newsreader for display text`).not.toContain('var(--font-display)');
    }
  });

  test('keeps small button and link text at WCAG AA contrast', () => {
    expect(contrastRatio('#ffffff', '#202522')).toBeGreaterThanOrEqual(4.5);

    const button = source('src/components/global/ButtonLink.astro');
    const primary = cssRule(button, '.button-link--primary');
    const primaryHover = cssRule(button, '.button-link--primary:hover');
    expect(primary).toContain('background: var(--color-graphite)');
    expect(primary).toContain('color: var(--color-process-white)');
    expect(primary).toContain('border-color: var(--color-paradise-orange)');
    expect(primaryHover).toContain('background: var(--color-graphite)');
    expect(primaryHover).toContain('border-color: var(--color-paradise-orange)');

    const global = source('src/styles/global.css');
    expect(cssRule(global, 'a')).toContain('color: var(--color-graphite)');
    expect(cssRule(global, 'a:hover')).toContain('text-decoration-color: var(--color-paradise-orange)');

    const header = source('src/components/global/Header.astro');
    const navHover = cssRule(header, '.primary-nav a:hover');
    expect(navHover).toContain('color: var(--color-graphite)');
    expect(navHover).toContain('text-decoration-color: var(--color-paradise-orange)');

    expect(source('src/components/global/OrganicMark.astro')).toContain('display: none');
    expect(cssRule(button, '.button-link--primary')).toContain('background: var(--color-graphite)');
    expect(cssRule(button, '.button-link--primary')).toContain('border-color: var(--color-paradise-orange)');
    expect(cssRule(header, '.site-header')).toContain('border-bottom: 1px solid var(--color-brushed-steel)');
  });

  test('keeps every global eyebrow text rule at safe contrast', () => {
    const typography = source('src/styles/typography.css');
    const eyebrowRules = [...typography.matchAll(/([^{}]*\.eyebrow[^{}]*)\{([^{}]*)\}/g)]
      .map(([, selector, declarations]) => ({ selector: selector.trim(), declarations }));
    expect(eyebrowRules.length).toBeGreaterThan(0);
    for (const { selector, declarations } of eyebrowRules) {
      expect(declarations, `${selector} must use the contrast-safe text token`).toContain('color: var(--color-utility-grey)');
      for (const brightToken of [
        '--color-paradise-orange',
        '--color-paradise-tangerine',
        '--color-paradise-blue',
        '--color-paradise-green',
        '--color-paradise-coral',
      ]) expect(declarations, `${selector} must not use bright brand text`).not.toContain(brightToken);
    }
  });

  test('keeps homepage product, category, brand, and channel content CMS-derived', () => {
    const page = source('src/pages/[locale]/index.astro');
    expect(page).toContain('products.filter((product) => product.featured)');
    expect(page).toContain('{categories}');
    expect(page).toContain('{remainingBrands}');
    expect(page).toContain('{channels}');
  });

  test('carries organic presentation through every inner-page family', () => {
    for (const file of [
      'src/components/catalog/ProductCard.astro',
      'src/components/catalog/ProductDetail.astro',
      'src/components/brands/BrandCard.astro',
      'src/components/brands/BrandDetail.astro',
      'src/components/forms/EnquiryForm.astro',
      'src/pages/404.astro',
    ]) {
      const component = source(file);
      expect(component).toMatch(/organic|living|shape|petal|drop/);
      expect(component).not.toMatch(/color-cold-chain-blue|color-stainless/);
    }

    expect(source('src/components/forms/EnquiryForm.astro')).toContain('aria-invalid');
    expect(source('src/components/catalog/CatalogFilters.astro')).toContain('aria-live');
  });

  test('keeps inner-page accents organic and removes industrial presentation tokens', () => {
    for (const file of [
      'src/components/catalog/CatalogFilters.astro',
      'src/components/catalog/ProductCard.astro',
      'src/components/catalog/ProductGrid.astro',
      'src/components/catalog/ProductDetail.astro',
      'src/components/catalog/ProductMetadata.astro',
      'src/components/brands/BrandCard.astro',
      'src/components/brands/BrandDetail.astro',
      'src/components/forms/EnquiryForm.astro',
      'src/components/global/Breadcrumbs.astro',
      'src/pages/[locale]/products/index.astro',
      'src/pages/[locale]/brands/index.astro',
      'src/pages/404.astro',
    ]) {
      expect(source(file)).not.toMatch(/color-cold-chain-blue|color-stainless/);
    }
  });

  test('keeps the product facts reading order and removes the mobile connector', () => {
    const metadata = source('src/components/catalog/ProductMetadata.astro');
    expect(metadata.indexOf('{copy.origin}')).toBeLessThan(metadata.indexOf('{copy.category}'));
    expect(metadata.indexOf('{copy.category}')).toBeLessThan(metadata.indexOf('{copy.packFormat}'));
    expect(metadata.indexOf('{copy.packFormat}')).toBeLessThan(metadata.indexOf('{copy.storage}'));

    const detail = source('src/components/catalog/ProductDetail.astro');
    expect(detail).toContain('.product-detail__facts');
    expect(detail).toMatch(/@media \(max-width: 48rem\)[\s\S]*?\.product-detail__facts\s*\{[^}]*border-inline-start:\s*0/);
  });

  test('derives organic brand-card fields from the CMS accent', () => {
    const card = source('src/components/brands/BrandCard.astro');
    expect(card).toContain('brand.accent');
    expect(card).toContain('--brand-accent');
    expect(card).toContain('color-mix(in srgb, var(--brand-accent)');
  });

  test('uses the Living Ingredients thesis in both hero locales', () => {
    expect(ui.en.hero.eyebrow).toBe('Living ingredients');
    expect(ui.vi.hero.eyebrow).toBe('Nguyên liệu sống động');
  });

  test('places the localized floating enquiry rail after the shared footer', () => {
    const layout = source('src/layouts/SiteLayout.astro');
    const footer = '<Footer {locale} {siteName} />';
    const rail = '<FloatingFormRail locale={locale} contactPath={localizedPath(locale, \'contact\')} customerPath={localizedPath(locale, \'customerContact\')} supplierPath={localizedPath(locale, \'supplierContact\')} copy={ui[locale].floatingRail} />';

    expect(layout).toContain("import { localizedPath } from '../lib/i18n/routes';");
    expect(layout).toContain("import FloatingFormRail from '../components/global/FloatingFormRail.astro';");
    expect(layout).toContain(rail);
    expect(layout.indexOf('</main>')).toBeLessThan(layout.indexOf(footer));
    expect(layout.indexOf(footer)).toBeLessThan(layout.indexOf(rail));

    for (const locale of ['en', 'vi'] as const) {
      expect(ui[locale].floatingRail.buy).toBeTruthy();
      expect(ui[locale].floatingRail.sell).toBeTruthy();
      expect(ui[locale].floatingRail.contact).toBeTruthy();
    }
  });

  test('keeps the 404 rail static and outside its main landmark', () => {
    const page = source('src/pages/404.astro');
    const rail = '<FloatingFormRail locale="en" contactPath="/en/contact/" customerPath="/en/contact/customer/" supplierPath="/en/contact/supplier/" copy={ui.en.floatingRail} staticOnly />';

    expect(page).toContain("import { ui } from '../lib/i18n/ui';");
    expect(page).toContain("import FloatingFormRail from '../components/global/FloatingFormRail.astro';");
    expect(page).toContain(rail);
    expect(page.indexOf('</main>')).toBeLessThan(page.indexOf(rail));
    expect(page.indexOf('</footer>')).toBeLessThan(page.indexOf(rail));
  });

  test('styles the floating rail as a neutral industrial action panel', () => {
    const rail = source('src/components/global/FloatingFormRail.astro');
    for (const value of [
      'var(--color-cold-paper)',
      'var(--color-process-white)',
      'var(--color-graphite)',
      'var(--color-brushed-steel)',
      'var(--color-paradise-orange)',
      'inline-size: 2.75rem',
      'block-size: 2.75rem',
      'inline-size: min(12rem, calc(100vw - 2.75rem))',
      '@media (prefers-reduced-motion: reduce)',
    ]) expect(rail).toContain(value);

    for (const removed of ['clip-path', 'drop-shadow', '@keyframes floating-rail-enter', '360ms cubic-bezier']) {
      expect(rail).not.toContain(removed);
    }

    expect(rail).toContain('transition: translate var(--transition-base)');
    expect(rail).toContain('transition: background-color var(--transition-fast)');

    expect(rail).not.toContain('linear-gradient');
    expect(rail).not.toContain('font-family: var(--font-display)');
    expect(rail).not.toContain('floating-form-rail__heading');
    expect(rail).not.toContain('floating-form-rail__marker');
  });

  test('removes empty catalog and brand intro decorations from every locale page', () => {
    for (const file of [
      'src/pages/[locale]/products/index.astro',
      'src/pages/[locale]/brands/index.astro',
    ]) {
      const page = source(file);
      expect(page).not.toContain('catalog-page__organic-drop');
      expect(page).not.toContain('brands-page__organic-petal');
    }
  });

  test('keeps standalone navigation targets and enquiry consent at 44px', () => {
    expect(source('src/components/catalog/ProductCard.astro')).toMatch(/\.product-card :is\(h2, h3\) a\s*\{[^}]*min-block-size:\s*2\.75rem/);
    expect(cssRule(source('src/components/sections/FeaturedBrands.astro'), '.featured-brands__products a')).toContain('min-block-size: 2.75rem');
    expect(cssRule(source('src/components/global/Breadcrumbs.astro'), '.breadcrumbs a')).toContain('min-block-size: 2.75rem');
    expect(cssRule(source('src/components/forms/EnquiryForm.astro'), '.field--consent label')).toContain('min-block-size: 2.75rem');
  });

  test('uses the defined mist-blue token for the Living Hero art backplate', () => {
    const hero = source('src/components/sections/LivingHero.astro');
    expect(hero).toContain('background: var(--color-mist-blue)');
    expect(hero).not.toContain('--color-morning-mist');
  });

  test('isolates the product stage and orders the brand label above image layers', () => {
    const detail = source('src/components/catalog/ProductDetail.astro');
    expect(cssRule(detail, '.product-detail__organic-stage')).toContain('isolation: isolate');
    expect(cssRule(detail, '.product-detail__stage::before')).toContain('z-index: 0');
    expect(cssRule(detail, '.product-detail__stage img')).toContain('position: relative');
    expect(cssRule(detail, '.product-detail__stage img')).toContain('z-index: 1');
    expect(cssRule(detail, '.product-detail__stage > span')).toContain('z-index: 2');
  });

  test('keeps the product-stage brand label inside the organic mask safe area', () => {
    const label = cssRule(source('src/components/catalog/ProductDetail.astro'), '.product-detail__stage > span');
    expect(label).toContain('inset-block-start: 16%');
    expect(label).toContain('inset-inline-start: 36%');
  });
});
