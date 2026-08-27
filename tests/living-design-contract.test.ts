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
const baseCssRule = (css: string, selector: string) => [...(css.includes('<style>') ? css.slice(css.lastIndexOf('<style>') + '<style>'.length) : css).matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter(([, selectors]) => selectors.split(',').some((item) => item.trim() === selector))
  .at(0)?.[2] ?? '';

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
  test('defines the approved product-led minimal type, spacing, and geometry tokens', () => {
    const tokens = source('src/styles/tokens.css');
    const typography = source('src/styles/typography.css');
    const global = source('src/styles/global.css');

    for (const declaration of [
      '--text-h1: clamp(2.25rem, 5vw, 4.25rem)',
      '--text-h2: clamp(1.75rem, 3vw, 2.75rem)',
      '--text-h3: clamp(1.125rem, 1.5vw, 1.35rem)',
      '--text-hero: var(--text-h1)',
      '--text-2xl: var(--text-h2)',
      '--text-xl: var(--text-h3)',
      '--radius-sm: 0.875rem',
      '--radius-md: 1.25rem',
      '--radius-lg: 1.75rem',
      '--color-glass-surface: rgba(255, 255, 255, 0.68)',
      '--color-glass-border: rgba(255, 255, 255, 0.78)',
      '--shadow-glass: 0 1rem 2.5rem rgba(10, 44, 29, 0.08)',
    ]) expect(tokens).toContain(declaration);

    expect(cssRule(typography, 'h1')).toContain('font-size: var(--text-h1)');
    expect(cssRule(typography, 'h2')).toContain('font-size: var(--text-h2)');
    expect(cssRule(typography, 'h3')).toContain('font-size: var(--text-h3)');
    expect(cssRule(global, '.section-space')).toContain('padding-block: clamp(2.5rem, 5vw, 4rem)');
  });

  test('keeps shared chrome compact, rounded, and free of decorative effects', () => {
    const header = source('src/components/global/Header.astro');
    const footer = source('src/components/global/Footer.astro');
    const button = source('src/components/global/ButtonLink.astro');
    const switcher = source('src/components/global/LanguageSwitcher.astro');

    expect(cssRule(header, '.site-header__bar')).toContain('min-block-size: 4.5rem');
    expect(cssRule(footer, '.site-footer')).toContain('padding-block: var(--space-7) var(--space-5)');

    for (const component of [button, switcher]) {
      expect(component).toContain('min-block-size: 2.75rem');
      expect(component).toContain('border-radius: var(--radius-sm)');
    }

    for (const file of [
      'src/styles/global.css',
      'src/components/global/Header.astro',
      'src/components/global/Footer.astro',
      'src/components/global/ButtonLink.astro',
      'src/components/global/LanguageSwitcher.astro',
      'src/components/global/FloatingFormRail.astro',
    ]) {
      const component = source(file);
      expect(component, file).not.toMatch(/radial-gradient|color-mix\(/);
    }
  });

  test('uses deep-herb selection text with contrast-safe Paradise orange', () => {
    expect(contrastRatio('#0a2c1d', '#e46f2c')).toBeGreaterThanOrEqual(4.5);
    const selection = cssRule(source('src/styles/global.css'), '::selection');
    expect(selection).toContain('background: var(--color-paradise-orange)');
    expect(selection).toContain('color: var(--color-graphite)');
  });

  test('keeps the credibility heading on the approved local H2 display role', () => {
    const credibility = source('src/components/sections/CredibilityStrip.astro');
    const heading = baseCssRule(credibility, '.credibility h2');
    expect(baseCssRule(credibility, '.credibility')).toContain('padding-block: var(--space-6) var(--space-5)');
    expect(heading).toContain('font-family: var(--font-display)');
    expect(heading).toContain('font-size: var(--text-h2)');
  });

  test('keeps the credibility display heading at the approved medium weight', () => {
    expect(baseCssRule(source('src/components/sections/CredibilityStrip.astro'), '.credibility h2'))
      .toContain('font-weight: 500');
  });

  test('keeps every featured-brand heading on the approved local H3 scale', () => {
    const brands = source('src/components/sections/FeaturedBrands.astro');
    expect(cssRule(brands, '.featured-brands__copy h3')).toContain('font-size: var(--text-h3)');
    expect(cssRule(brands, '.featured-brands__secondary h3')).toContain('font-size: var(--text-h3)');
  });

  test('keeps the final CTA heading on the approved local H2 scale', () => {
    expect(cssRule(source('src/components/sections/FinalCta.astro'), '.final-cta h2'))
      .toContain('font-size: var(--text-h2)');
  });

  test('caps latest-blog Nunito utility weights at semibold', () => {
    const component = source('src/components/blogs/LatestBlogs.astro');
    const weights = [...component.matchAll(/font-weight:\s*(\d+)/g)].map(([, weight]) => Number(weight));
    expect(weights.length).toBeGreaterThan(0);
    expect(Math.max(...weights)).toBeLessThanOrEqual(600);
  });

  test('caps featured-brand Nunito utility weights at semibold', () => {
    const component = source('src/components/sections/FeaturedBrands.astro');
    const weights = [...component.matchAll(/font-weight:\s*(\d+)/g)].map(([, weight]) => Number(weight));
    expect(weights.length).toBeGreaterThan(0);
    expect(Math.max(...weights)).toBeLessThanOrEqual(600);
  });

  test('gives credibility fact labels an explicit semibold ceiling', () => {
    expect(cssRule(source('src/components/sections/CredibilityStrip.astro'), '.credibility strong'))
      .toContain('font-weight: 600');
  });

  test('gives service-proof labels explicit weights no heavier than semibold', () => {
    const service = source('src/components/sections/ServiceProof.astro');
    expect(cssRule(service, '.service-proof__editorial strong')).toContain('font-weight: 500');
    expect(cssRule(service, '.service-proof__pillars strong')).toContain('font-weight: 600');
  });

  test('uses only a neutral boundary on the non-fact final CTA surface', () => {
    const finalCta = source('src/components/sections/FinalCta.astro');
    const shape = baseCssRule(finalCta, '.final-cta__shape');
    expect(shape).toContain('border: 1px solid var(--color-brushed-steel)');
    expect(shape).not.toContain('var(--color-paradise-orange)');
    expect(finalCta).not.toMatch(/\.final-cta[^{}]*\{[^}]*color-paradise-orange/);
  });

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
      '--color-cold-paper: #f7f4ee',
      '--color-brushed-steel: #d8ded4',
      '--color-deep-herb: #0a2c1d',
      '--color-graphite: var(--color-deep-herb)',
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
    expect(tokens).toContain('--color-graphite: var(--color-deep-herb)');
    expect(tokens).toContain('--shape-drop: var(--radius-sm)');
  });

  test('uses an opaque Paradise-orange focus ring that contrasts with graphite', () => {
    expect(contrastRatio('#e46f2c', '#0a2c1d')).toBeGreaterThanOrEqual(3);

    const tokens = source('src/styles/tokens.css');
    expect(tokens).toContain('--focus-ring: 0 0 0 3px var(--color-paradise-orange)');
    expect(tokens).not.toMatch(/--focus-ring:[^;]*color-mix\(/);

    const global = source('src/styles/global.css');
    expect(cssRule(global, ':focus-visible')).toContain('box-shadow: var(--focus-ring)');
    expect(cssRule(global, ':focus-visible')).toContain('outline: 2px solid var(--color-graphite)');

    const plan = source('docs/superpowers/plans/2026-07-22-industrial-styling.md');
    expect(plan).toContain('--focus-ring: 0 0 0 3px var(--color-paradise-orange);');
    expect(plan).not.toMatch(/--focus-ring:[^;]*color-mix\(/);
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
    expect(contrastRatio('#0a2c1d', '#ffffff')).toBeGreaterThanOrEqual(4.5);
    expect(cssRule(source('src/components/sections/CategoryDiscovery.astro'), '.category-discovery__copy span')).toContain('color: var(--color-graphite)');
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

    for (const [file, selector] of [
      ['src/components/sections/CategoryDiscovery.astro', '.category-discovery__copy strong'],
      ['src/components/sections/ChannelPathways.astro', '.channel-pathways__links strong'],
      ['src/components/sections/ServiceProof.astro', '.service-proof__editorial strong'],
      ['src/components/blogs/BlogArticle.astro', '.blog-article__standfirst'],
      ['src/components/blogs/BlogArticle.astro', '.blog-article__body :global(p:first-child)'],
      ['src/pages/404.astro', '.not-found__art strong'],
    ] as const) {
      const declarations = cssRule(source(file), selector);
      expect(declarations, `${file} ${selector} must use body type`).toContain('font-family: var(--font-body)');
      expect(declarations, `${file} ${selector} must not use display type`).not.toContain('var(--font-display)');
    }
  });

  test('keeps small button and link text at WCAG AA contrast', () => {
    expect(contrastRatio('#ffffff', '#0a2c1d')).toBeGreaterThanOrEqual(4.5);

    const button = source('src/components/global/ButtonLink.astro');
    const primary = cssRule(button, '.button-link--primary');
    const primaryHover = cssRule(button, '.button-link--primary:hover');
    expect(primary).toContain('background: var(--color-deep-herb)');
    expect(primary).toContain('color: var(--color-process-white)');
    expect(primary).toContain('border-color: var(--color-deep-herb)');
    expect(primaryHover).toContain('background: var(--color-deep-herb)');
    expect(primaryHover).toContain('border-color: var(--color-paradise-orange)');

    const global = source('src/styles/global.css');
    expect(cssRule(global, 'a')).toContain('color: var(--color-graphite)');
    expect(cssRule(global, 'a:hover')).toContain('text-decoration-color: var(--color-paradise-orange)');

    const header = source('src/components/global/Header.astro');
    const navHover = cssRule(header, '.primary-nav a:hover');
    expect(navHover).toContain('color: var(--color-graphite)');
    expect(navHover).toContain('text-decoration-color: var(--color-paradise-orange)');

    expect(source('src/components/global/OrganicMark.astro')).toContain('display: none');
    expect(cssRule(button, '.button-link--primary')).toContain('background: var(--color-deep-herb)');
    expect(cssRule(button, '.button-link--primary')).toContain('border-color: var(--color-deep-herb)');
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

  test('uses industrial presentation across catalog, brand, and blog templates', () => {
    const files = [
      'src/components/catalog/CatalogFilters.astro',
      'src/components/catalog/ProductGrid.astro',
      'src/components/catalog/ProductDetail.astro',
      'src/components/catalog/ProductMetadata.astro',
      'src/components/brands/BrandDetail.astro',
      'src/components/blogs/BlogArticle.astro',
      'src/pages/[locale]/products/index.astro',
      'src/pages/[locale]/brands/index.astro',
      'src/pages/[locale]/blogs/index.astro',
    ];
    for (const file of files) {
      const component = source(file);
      expect(component).not.toMatch(/var\(--color-paradise-(?:blue|green|coral|tangerine)\)|var\(--color-mist-blue\)|var\(--shape-drop\)|drop-shadow|box-shadow/);
    }
    expect(cssRule(source('src/components/catalog/CatalogFilters.astro'), '.catalog-filters')).toContain('border-block: 1px solid var(--color-brushed-steel)');
    expect(cssRule(source('src/components/catalog/ProductMetadata.astro'), '.product-metadata')).toContain('border-inline-start: 2px solid var(--color-paradise-orange)');
  });

  test('keeps industrial inner-page styling free of retired presentation tokens', () => {
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

  test('keeps hero editorial copy at the CMS boundary rather than in UI controls', () => {
    expect(ui.en.hero).not.toHaveProperty('eyebrow');
    expect(ui.en.hero).not.toHaveProperty('title');
    expect(ui.en.hero).not.toHaveProperty('description');
    expect(ui.vi.hero).not.toHaveProperty('eyebrow');
    expect(ui.vi.hero).not.toHaveProperty('title');
    expect(ui.vi.hero).not.toHaveProperty('description');
  });

  test('places the localized floating enquiry rail after the shared footer', () => {
    const layout = source('src/layouts/SiteLayout.astro');
    const footer = '<Footer {locale} {siteName} store={settings.store} />';
    const rail = '<FloatingFormRail locale={locale} contactPath={localizedPath(locale, \'contact\')} customerPath={localizedPath(locale, \'customerContact\')} supplierPath={localizedPath(locale, \'supplierContact\')} copy={ui[locale].floatingRail} />';

    expect(layout).toContain("import { localizedPath } from '@/lib/i18n/routes';");
    expect(layout).toContain("import FloatingFormRail from '@/components/global/FloatingFormRail.astro';");
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

    expect(page).toContain("import { ui } from '@/lib/i18n/ui';");
    expect(page).toContain("import FloatingFormRail from '@/components/global/FloatingFormRail.astro';");
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
    const headerLink = cssRule(source('src/components/global/Header.astro'), '.primary-nav a');
    expect(headerLink).toContain('align-items: center');
    expect(headerLink).toContain('display: inline-flex');
    expect(headerLink).toContain('min-block-size: 2.75rem');

    const footerLink = cssRule(source('src/components/global/Footer.astro'), '.site-footer a');
    expect(footerLink).toContain('align-items: center');
    expect(footerLink).toContain('display: inline-flex');
    expect(footerLink).toContain('min-block-size: 2.75rem');

    for (const selector of ['.blog-card h2 a', '.blog-card h3 a']) {
      const headlineLink = cssRule(source('src/components/blogs/BlogCard.astro'), selector);
      expect(headlineLink, selector).toContain('align-items: center');
      expect(headlineLink, selector).toContain('display: flex');
      expect(headlineLink, selector).toContain('min-block-size: 2.75rem');
    }

    expect(source('src/components/catalog/ProductCard.astro')).toMatch(/\.product-card :is\(h2, h3\) a\s*\{[^}]*min-block-size:\s*2\.75rem/);
    expect(cssRule(source('src/components/sections/FeaturedBrands.astro'), '.featured-brands__products a')).toContain('min-block-size: 2.75rem');
    expect(cssRule(source('src/components/global/Breadcrumbs.astro'), '.breadcrumbs a')).toContain('min-block-size: 2.75rem');
    expect(cssRule(source('src/components/forms/EnquiryForm.astro'), '.field--consent label')).toContain('min-block-size: 2.75rem');
  });

  test('uses a borderless, fading hero image and glass product stages', () => {
    const hero = source('src/components/sections/LivingHero.astro');
    expect(hero).not.toContain('<p class="eyebrow">{content.eyebrow}</p>');
    expect(hero).not.toContain('<figcaption>{product.name}</figcaption>');
    expect(cssRule(hero, '.living-hero__art')).not.toContain('border-inline');
    expect(hero).toMatch(/\.living-hero__image-frame\s*\{[^}]*position: relative/);
    expect(hero).toContain('linear-gradient');
    expect(hero).toContain('grid-template-columns: auto 1fr');
    expect(hero).not.toMatch(/data-living-canvas|<canvas/);

    const card = source('src/components/catalog/ProductCard.astro');
    expect(cssRule(card, '.product-card__media')).toContain('border-radius: var(--radius-sm)');
    expect(cssRule(card, '.product-card')).toContain('background: var(--color-glass-surface)');
    expect(cssRule(card, '.product-card')).toContain('backdrop-filter: blur(var(--blur-glass))');
  });

  test('keeps contained desktop imagery and covered mobile crop', () => {
    const hero = source('src/components/sections/LivingHero.astro');
    const image = baseCssRule(hero, '.living-hero__image-frame > img');
    expect(image).toContain('object-fit: contain');
    expect(image).toContain('-webkit-mask-image: linear-gradient');
    expect(image).toContain('mask-image: linear-gradient');
    expect(hero).toContain('grid-template-columns: minmax(0, 1.2fr) minmax(8rem, 0.8fr)');
    expect(hero).toContain('grid-template-columns: minmax(0, 1fr);');
    expect(baseCssRule(hero, '.living-hero__art')).toContain('position: absolute');
    expect(hero).toContain('.living-hero__image-frame > img { object-fit: cover; object-position: center right; }');
  });

  test('keeps hero facts below copy at mobile-wide width instead of squeezing them beside it', () => {
    const hero = source('src/components/sections/LivingHero.astro');
    expect(hero.indexOf('<dl class="living-hero__metadata">')).toBeGreaterThan(hero.indexOf('<figure class="living-hero__art">'));
    expect(baseCssRule(hero, '.living-hero__metadata')).toContain('grid-column: 1');
    expect(baseCssRule(hero, '.living-hero__metadata')).toContain('grid-row: 2');
    expect(hero).toContain('.living-hero__metadata { grid-column: 1; grid-row: 2;');
  });

  test('keeps hero image behind content with full-width mobile fade stage', () => {
    const hero = source('src/components/sections/LivingHero.astro');
    expect(baseCssRule(hero, '.living-hero__content')).toContain('position: relative');
    expect(baseCssRule(hero, '.living-hero__content')).toContain('z-index: 1');
    expect(baseCssRule(hero, '.living-hero__content')).toContain('padding-block-end: var(--space-6)');
    expect(baseCssRule(hero, '.living-hero__art')).toContain('inset: 0');
    expect(baseCssRule(hero, '.living-hero__art')).toContain('position: absolute');
    expect(baseCssRule(hero, '.living-hero__art')).toContain('z-index: 0');
    expect(baseCssRule(hero, '.living-hero__image-frame')).toContain('inline-size: 65%');
    expect(hero).toContain('.living-hero__image-frame::before {');
    expect(hero).toContain('linear-gradient(90deg, var(--color-cold-paper)');
    expect(hero).toContain('grid-template-columns: minmax(0, 1fr);');
    expect(hero).toContain('.living-hero__art { inset: 0; margin: 0;');
    expect(hero).toContain('.living-hero__image-frame { inline-size: 100%; min-block-size: 30rem; }');
    expect(hero).toContain('.living-hero__image-frame > img { object-fit: cover; object-position: center right; }');
  });

  test('stacks mobile hero actions and fact tags at matching widths', () => {
    const hero = source('src/components/sections/LivingHero.astro');
    expect(baseCssRule(hero, '.living-hero__actions')).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
    expect(hero).toContain('.living-hero__actions :global(.button-link) { gap: var(--space-2); inline-size: 100%; min-inline-size: 0; padding-inline: var(--space-3); white-space: nowrap; }');
    expect(hero).toContain('@media (max-width: 36rem) { .living-hero__content');
    expect(hero).toContain('.living-hero__actions { gap: var(--space-2); grid-template-columns: minmax(0, 1fr); }');
    expect(baseCssRule(hero, '.living-hero__metadata')).toContain('padding-inline-end: clamp(var(--space-6), 4vw, var(--space-8))');
    expect(hero).toContain('.living-hero__copy { padding-inline-end: var(--container-inline); }');
    expect(hero).not.toContain('padding-inline: var(--container-inline); padding-inline-end: 0;');
    expect(hero).toContain('@media (max-width: 64rem) { .living-hero__content');
    expect(hero).toContain('.living-hero__actions { grid-template-columns: minmax(0, 1fr); }');
    expect(hero).toContain('.living-hero__metadata { grid-column: 1; grid-row: 2; grid-template-columns: minmax(0, 1fr);');
    expect(hero).toContain('.living-hero__metadata { gap: var(--space-2); grid-column: 1; grid-row: 2; grid-template-columns: minmax(0, 1fr); padding-inline: var(--container-inline);');
  });

  test('keeps hero fact tags compact enough to align with buttons', () => {
    const hero = source('src/components/sections/LivingHero.astro');
    expect(baseCssRule(hero, '.living-hero__fact')).toContain('gap: var(--space-2)');
    expect(baseCssRule(hero, '.living-hero__fact')).toContain('min-block-size: 3rem');
    expect(baseCssRule(hero, '.living-hero__fact')).toContain('padding: var(--space-2)');
    expect(baseCssRule(hero, '.living-hero__fact-icon')).toContain('flex: 0 0 2rem');
    expect(baseCssRule(hero, '.living-hero__fact-icon')).toContain('block-size: 2rem');
    expect(baseCssRule(hero, '.living-hero__fact-icon')).toContain('inline-size: 2rem');
  });

  test('gives brand lists row gap and stretches product cards to equal grid height', () => {
    const brands = source('src/pages/[locale]/brands/index.astro');
    const productGrid = source('src/components/catalog/ProductGrid.astro');
    const productCard = source('src/components/catalog/ProductCard.astro');
    expect(cssRule(brands, '.brands-page__grid')).toContain('gap: var(--space-5)');
    expect(baseCssRule(productGrid, '.product-grid')).toContain('grid-auto-rows: minmax(0, 1fr)');
    expect(cssRule(productGrid, '.product-grid > [data-product-card]')).toContain('display: flex');
    expect(cssRule(productCard, '.product-card')).toContain('block-size: 100%');
  });

  test('keeps card and discovery images free of scale and transform motion', () => {
    for (const [file, imageSelector, interactionSelector] of [
      ['src/components/catalog/ProductCard.astro', '.product-card__media img', '.product-card:hover .product-card__media img'],
      ['src/components/sections/CategoryDiscovery.astro', '.category-discovery__media img'],
      ['src/components/blogs/BlogCard.astro', '.blog-card__image img'],
    ] as const) {
      const component = source(file);
      const imageRule = cssRule(component, imageSelector);
      expect(imageRule, `${file} ${imageSelector} must exist`).not.toBe('');
      expect(imageRule, `${file} ${imageSelector}`).not.toMatch(/transition\s*:[^;]*(?:transform|scale)/);
      expect(imageRule, `${file} ${imageSelector}`).not.toMatch(/(?:transform|scale)\s*:/);
      if (interactionSelector) {
        const interactionRule = cssRule(component, interactionSelector);
        expect(interactionRule, `${file} ${interactionSelector} must exist`).not.toBe('');
        expect(interactionRule, `${file} ${interactionSelector}`).not.toMatch(/(?:transform|scale)\s*:/);
      }
      expect(component, `${file} must not scale scoped imagery`).not.toMatch(/scale\s*\(/);
    }
  });

  test('keeps remaining homepage sections restrained while allowing shared glass cards', () => {
    const files = [
      'src/components/sections/FeaturedBrands.astro',
      'src/components/blogs/LatestBlogs.astro',
      'src/components/blogs/BlogCard.astro',
      'src/components/brands/BrandCard.astro',
      'src/components/sections/PartnerStrip.astro',
      'src/components/sections/ServiceProof.astro',
      'src/components/sections/ChannelPathways.astro',
      'src/components/sections/FinalCta.astro',
    ];
    for (const file of files) {
      const component = source(file);
      expect(component).not.toMatch(/var\(--color-paradise-(?:blue|green|coral|tangerine)\)|var\(--color-mist-blue\)|var\(--shape-drop\)|drop-shadow/);
    }
    expect(source('src/components/sections/FinalCta.astro')).toContain('background: var(--color-graphite)');
    expect(source('src/components/sections/FinalCta.astro')).toContain('color: var(--color-cold-paper)');
  });

  test('keeps the homepage free of reveal and ambient canvas contracts', () => {
    const files = [
      'src/components/sections/LivingHero.astro',
      'src/components/sections/CredibilityStrip.astro',
      'src/components/sections/CategoryDiscovery.astro',
      'src/components/sections/FeaturedProducts.astro',
      'src/components/sections/FeaturedBrands.astro',
      'src/components/blogs/LatestBlogs.astro',
      'src/components/sections/PartnerStrip.astro',
      'src/components/sections/ServiceProof.astro',
      'src/components/sections/ChannelPathways.astro',
      'src/components/sections/FinalCta.astro',
    ];
    for (const file of files) {
      const component = source(file);
      expect(component, file).not.toMatch(/data-reveal|data-revealed|data-motion-enhanced|data-living-canvas|<canvas/);
      expect(component, file).not.toMatch(/motion\/(?:reveal|living-canvas|preferences)/);
    }
    for (const file of ['src/lib/motion/reveal.ts', 'src/lib/motion/living-canvas.ts', 'src/lib/motion/preferences.ts']) {
      expect(existsSync(join(root, file)), file).toBe(false);
    }
  });

  test('keeps product detail media unmasked and square', () => {
    const detail = source('src/components/catalog/ProductDetail.astro');
    expect(baseCssRule(detail, '.product-detail__stage')).toContain('aspect-ratio: 1 / 1');
    expect(detail).not.toMatch(/product-detail__organic-stage|product-detail__stage::before|product-detail__stage > span/);
  });

  test('keeps retired decorative presentation tokens out of active styled surfaces', () => {
    const styledFiles = filesBelow('src/components')
      .filter((path) => path.endsWith('.astro') && path !== 'src/components/global/OrganicMark.astro');
    const pageFiles = filesBelow('src/pages').filter((path) => path.endsWith('.astro'));

    for (const file of [...styledFiles, ...pageFiles]) {
      const component = source(file);
      expect(component, file).not.toMatch(/var\(--color-paradise-(?:blue|green|coral|tangerine)\)|var\(--color-mist-blue\)|var\(--shape-drop\)|drop-shadow|color-mix\(|clip-path/);
      expect(component, file).not.toMatch(/(?:[2-9]\d\d|[1-9]\d{3,})ms/);
    }

    expect(source('src/components/global/OrganicMark.astro')).toContain('display: none');
    expect(source('src/components/sections/LivingHero.astro')).not.toMatch(/data-living-canvas|<canvas/);
  });

  test('preserves the exact homepage section order', () => {
    const page = source('src/pages/[locale]/index.astro');
    const sections = [
      '<LivingHero', '<CredibilityStrip', '<CategoryDiscovery', '<FeaturedProducts',
      '<FeaturedBrands', '<LatestBlogs', '<PartnerStrip', '<ServiceProof',
      '<ChannelPathways', '<FinalCta',
    ];
    const positions = sections.map((section) => page.indexOf(section));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  test('keeps editorial, enquiry, and 404 surfaces free of decorative masks', () => {
    for (const file of [
      'src/components/blogs/BlogArticle.astro',
      'src/components/forms/EnquiryForm.astro',
      'src/pages/404.astro',
    ]) {
      const component = source(file);
      expect(component, file).not.toMatch(/clip-path|mask-image|OrganicMark|var\(--color-paradise-orange\)/);
    }

    expect(cssRule(source('src/components/forms/EnquiryForm.astro'), '.enquiry-form__actions button'))
      .toContain('min-block-size: 2.75rem');
  });

  test('defines the soft glass card contract for every reusable content card', () => {
    for (const file of [
      'src/components/catalog/ProductCard.astro',
      'src/components/brands/BrandCard.astro',
      'src/components/blogs/BlogCard.astro',
      'src/components/recipes/RecipeCard.astro',
    ]) {
      const component = source(file);
      expect(component, file).toContain('background: var(--color-glass-surface)');
      expect(component, file).toContain('border: 1px solid var(--color-glass-border)');
      expect(component, file).toContain('box-shadow: var(--shadow-glass)');
      expect(component, file).toContain('backdrop-filter: blur(var(--blur-glass))');
    }
  });

  test('keeps deep-herb and orange accents contrast-safe', () => {
    expect(contrastRatio('#ffffff', '#0a2c1d')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#0a2c1d', '#e46f2c')).toBeGreaterThanOrEqual(4.5);
    expect(source('src/components/global/ButtonLink.astro')).toContain('color: var(--color-paradise-orange)');
  });
});
