import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';

const read = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

describe('floating form rail rendering contract', () => {
  test('keeps the footer link groups in scoped column flow', async () => {
    const source = await read('../src/components/global/Footer.astro');
    const footerColumns = source.match(/\.site-footer__column\s*\{([^}]*)\}/)?.[1] ?? '';

    for (const declaration of [
      'display: flex',
      'flex-direction: column',
      'align-items: flex-start',
    ]) expect(footerColumns).toContain(declaration);

    expect(source).toContain('class="site-footer__column"');
  });

  test('anchors the enhanced rail above the lower-right safe edge at every viewport', async () => {
    const source = await read('../src/components/global/FloatingFormRail.astro');
    const sharedRail = source.match(/\.floating-form-rail\s*\{([^}]*)\}/)?.[1] ?? '';

    for (const declaration of [
      'align-items: flex-end',
      'inset-block-end: calc(1rem + env(safe-area-inset-bottom, 0px))',
      'inset-inline-end: calc(1rem + env(safe-area-inset-right, 0px))',
      'top: auto',
      'transform: none',
    ]) expect(sharedRail).toContain(declaration);

    expect(sharedRail).not.toContain('top: calc(5rem + var(--space-6))');
  });

  test('keeps a non-ready rail in normal flow without horizontal overflow', async () => {
    const source = await read('../src/components/global/FloatingFormRail.astro');
    const staticRail = source.match(/\.floating-form-rail:not\(\[data-ready\]\)\s*\{([^}]*)\}/)?.[1] ?? '';
    const staticToggle = source.match(/\.floating-form-rail:not\(\[data-ready\]\) \.floating-form-rail__toggle\s*\{([^}]*)\}/)?.[1] ?? '';
    const staticPanel = source.match(/\.floating-form-rail:not\(\[data-ready\]\) \.floating-form-rail__panel\s*\{([^}]*)\}/)?.[1] ?? '';

    for (const declaration of [
      'position: static',
      'transform: none',
      'translate: none',
      'inset: auto',
      'inline-size: 100%',
      'max-inline-size: var(--container-max)',
      'margin-inline: auto',
      'background: var(--color-cold-paper)',
    ]) expect(staticRail).toContain(declaration);

    expect(staticToggle).toContain('display: none');
    expect(staticPanel).toContain('inline-size: 100%');
    expect(staticPanel).toContain('max-inline-size: none');
  });

  test('keeps only compact sizing in the mobile rail override', async () => {
    const source = await read('../src/components/global/FloatingFormRail.astro');
    const mobileRail = source.match(/@media \(max-width: 48rem\)\s*\{\s*\.floating-form-rail\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(mobileRail).toContain('inline-size: min(14.75rem, 100vw)');
    for (const duplicate of ['align-items:', 'inset-block-end:', 'inset-inline-end:', 'top:', 'transform:']) {
      expect(mobileRail).not.toContain(duplicate);
    }
  });

  test('leaves only the 44px toggle exposed when a 390px rail is collapsed', async () => {
    const source = await read('../src/components/global/FloatingFormRail.astro');
    const sharedRail = source.match(/\.floating-form-rail\s*\{([^}]*)\}/)?.[1] ?? '';
    const expandedPanel = source.match(/\n  \.floating-form-rail__panel \{([\s\S]*?)\n  \.floating-form-rail__panel\[inert\]/)?.[1] ?? '';
    const collapsedRail = source.match(/\.floating-form-rail\[data-ready='true'\]\[data-expanded='false'\]\s*\{([^}]*)\}/)?.[1] ?? '';
    const collapsedPanel = source.match(/\.floating-form-rail\[data-ready='true'\]\[data-expanded='false'\] \.floating-form-rail__panel\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(sharedRail).toMatch(/flex-direction:\s*row\s*;/);
    expect(collapsedRail).toContain('inline-size: 2.75rem');
    expect(collapsedRail).toContain('translate: 0 0');
    expect(expandedPanel).toContain('transition: opacity var(--transition-base), translate var(--transition-base), visibility 0s linear 0s');
    expect(expandedPanel).not.toContain('visibility 0s linear var(--transition-base)');
    for (const declaration of ['visibility: hidden', 'opacity: 0', 'translate: 0 0.5rem']) {
      expect(collapsedPanel).toContain(declaration);
    }
    expect(collapsedPanel).toContain('transition: opacity var(--transition-base), translate var(--transition-base), visibility 0s linear var(--transition-base)');
    expect(collapsedPanel).not.toContain('display: none');
    expect(source.match(/\n  \.floating-form-rail__toggle\s*\{([^}]*)\}/)?.[1]).toContain('inline-size: 2.75rem');
    expect(source).toContain('.floating-form-rail__panel[inert]');
  });

  test('keeps the expanded mobile rail vertically stacked without grid columns', async () => {
    const source = await read('../src/components/global/FloatingFormRail.astro');
    const mobilePanel = source.match(/\.floating-form-rail\[data-ready='true'\]\[data-expanded='true'\] \.floating-form-rail__panel\s*\{([^}]*)\}/)?.[1] ?? '';

    for (const value of [
      'display: flex',
      'flex-direction: column',
      'inline-size: 100%',
      'max-block-size: none',
    ]) expect(mobilePanel).toContain(value);

    expect(source).toContain('@media (max-width: 48rem)');
    expect(mobilePanel).not.toContain('grid-template-columns: repeat(3, minmax(0, 1fr))');
    expect(source).not.toContain(":global(html:has([data-floating-rail][data-ready='true'][data-expanded='true'])) body { padding-block-start: 3rem; }");
  });

  test('renders a label-free accessible server-side rail', async () => {
    const source = await read('../src/components/global/FloatingFormRail.astro');
    for (const value of [
      'data-floating-rail',
      'data-floating-rail-toggle',
      'data-floating-rail-icon',
      'lucide:chevron-left',
      'lucide:chevron-right',
      'aria-controls="floating-rail-panel"',
      'aria-expanded="false"',
      'customerPath: string',
      'supplierPath: string',
      'href={customerPath}',
      'href={supplierPath}',
      'flex-direction: row',
      'align-items: flex-end',
      "[data-expanded='false'] {",
      'translate: 0 0',
      'transition: translate var(--transition-base)',
      'transition: background-color var(--transition-fast)',
      'initializeFloatingRail',
      'staticOnly?: boolean',
      "!staticOnly && <script>",
      "[data-ready='true'] .floating-form-rail__toggle",
      ".floating-form-rail__panel[inert]",
      'inline-size: 2.75rem',
      'block-size: 2.75rem',
      'inline-size: min(12rem, calc(100vw - 2.75rem))',
      'min-block-size: 2.75rem',
      'font-weight: 600',
      'border-radius: var(--radius-sm)',
    ]) expect(source).toContain(value);

    expect(source).not.toContain('lucide:plus');
    expect(source).not.toContain('lucide:minus');
    expect(source).not.toContain('3.25rem');
    expect(source).not.toContain('inline-size: min(17rem');
    expect(source).not.toContain('inline-size: min(20rem');
    expect(source).not.toContain('animation: floating-rail-enter 360ms cubic-bezier(0.22, 1, 0.36, 1) both');
    expect(source).not.toContain('translate: 1rem 0');
    expect(source).not.toContain('clip-path');
    expect(source).not.toContain('drop-shadow');
    expect(source).not.toMatch(/linear-gradient|radial-gradient|box-shadow/);
    expect(source).not.toContain('@keyframes floating-rail-enter');
    expect(source).not.toContain('360ms cubic-bezier');

    for (const obsolete of [
      'data-floating-rail-label',
      'data-floating-rail-title',
      'floating-form-rail__marker',
      'copy.label',
      'copy.panelTitle',
      'Start a conversation',
      'Enquire',
      'LET’S TALK',
      'floating-form-rail__heading',
    ]) expect(source).not.toContain(obsolete);
  });

  test('keeps localized accessibility and action copy without visible utility labels', async () => {
    const source = await read('../src/lib/i18n/ui.ts');
    expect(source).toContain("toggleOpen: 'Open enquiry options'");
    expect(source).toContain("toggleClose: 'Close enquiry options'");
    expect(source).toContain("toggleOpen: 'Mở lựa chọn yêu cầu'");
    expect(source).toContain("toggleClose: 'Đóng lựa chọn yêu cầu'");
    expect(source).not.toContain("label: 'Enquire'");
    expect(source).not.toContain("panelTitle: 'Start a conversation'");
    expect(source).not.toContain("label: 'Trao đổi'");
    expect(source).not.toContain("panelTitle: 'Bắt đầu trao đổi'");
  });
});
