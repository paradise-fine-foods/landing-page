import { describe, expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');
const cssRule = (css: string, selector: string) => [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
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

describe('Living Ingredients identity', () => {
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

  test('defines the approved palette and organic mark primitive', () => {
    const tokens = source('src/styles/tokens.css').toLowerCase();
    for (const value of ['#e46f2c', '#fa6c47', '#0796d2', '#94c11f', '#d94d55', '#fbfaf5', '#28342b', '#e8f6fa']) {
      expect(tokens).toContain(value);
    }
    const mark = source('src/components/global/OrganicMark.astro');
    expect(mark).toContain('aria-hidden="true"');
    expect(mark).toContain('focusable="false"');
    expect(mark).toContain("'drop' | 'seed' | 'petal'");
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
    expect(contrastRatio('#ffffff', '#28342b')).toBeGreaterThanOrEqual(4.5);

    const button = source('src/components/global/ButtonLink.astro');
    const primary = cssRule(button, '.button-link--primary');
    const primaryHover = cssRule(button, '.button-link--primary:hover');
    expect(primary).toContain('background: var(--color-deep-herb)');
    expect(primary).toContain('color: var(--color-paper-white)');
    expect(primary).toContain('border-color: var(--color-paradise-orange)');
    expect(primaryHover).toContain('background: var(--color-deep-herb)');
    expect(primaryHover).toContain('border-color: var(--color-paradise-tangerine)');

    const global = source('src/styles/global.css');
    expect(cssRule(global, 'a')).toContain('color: var(--color-deep-herb)');
    expect(cssRule(global, 'a:hover')).toContain('text-decoration-color: var(--color-paradise-blue)');

    const header = source('src/components/global/Header.astro');
    const navHover = cssRule(header, '.primary-nav a:hover');
    expect(navHover).toContain('color: var(--color-deep-herb)');
    expect(navHover).toContain('text-decoration-color: var(--color-paradise-blue)');
  });
});
