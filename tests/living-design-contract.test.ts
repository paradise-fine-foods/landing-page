import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

describe('Living Ingredients identity', () => {
  test('self-hosts and renders the authentic Paradise logo', () => {
    expect(existsSync(join(root, 'src/assets/brand/paradise-fine-foods-logo.png'))).toBe(true);
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
    expect(header).not.toMatch(/\.primary-nav[^}]*font-family:\s*var\(--font-display\)/s);
  });
});
