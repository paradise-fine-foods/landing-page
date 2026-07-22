import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';

const read = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

describe('floating form rail rendering contract', () => {
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
      'align-items: flex-start',
      "[data-expanded='false'] {",
      'translate: calc(100% - 2.75rem) 0',
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
      'inline-size: min(16.75rem, calc(100vw - 2rem))',
      'min-block-size: 2.75rem',
    ]) expect(source).toContain(value);

    expect(source).not.toContain('lucide:plus');
    expect(source).not.toContain('lucide:minus');
    expect(source).not.toContain('align-items: flex-end');
    expect(source).not.toContain('3.25rem');
    expect(source).not.toContain('inline-size: min(17rem');
    expect(source).not.toContain('inline-size: min(20rem');
    expect(source).not.toContain("[data-expanded='false'] .floating-form-rail__panel");
    expect(source).not.toContain('animation: floating-rail-enter 360ms cubic-bezier(0.22, 1, 0.36, 1) both');
    expect(source).not.toContain('translate: 1rem 0');
    expect(source).not.toContain('clip-path');
    expect(source).not.toContain('drop-shadow');
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
