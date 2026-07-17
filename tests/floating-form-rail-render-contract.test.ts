import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';

const read = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

describe('floating form rail rendering contract', () => {
  test('renders a label-free accessible server-side rail', async () => {
    const source = await read('../src/components/global/FloatingFormRail.astro');
    for (const value of [
      'data-floating-rail',
      'data-floating-rail-toggle',
      'data-floating-rail-icon',
      'lucide:plus',
      'lucide:minus',
      'aria-controls="floating-rail-panel"',
      'aria-expanded="false"',
      'customerPath: string',
      'supplierPath: string',
      'href={customerPath}',
      'href={supplierPath}',
      'flex-direction: row',
      "[data-expanded='false'] {",
      'translate: calc(100% - 3.25rem) 0',
      'transition: translate 360ms cubic-bezier(0.22, 1, 0.36, 1)',
      'initializeFloatingRail',
      'staticOnly?: boolean',
      "!staticOnly && <script>",
      "[data-ready='true'] .floating-form-rail__toggle",
      ".floating-form-rail__panel[inert]",
      'drop-shadow',
      'inline-size: min(17rem',
      'min-block-size: 2.75rem',
    ]) expect(source).toContain(value);

    expect(source).not.toContain("[data-expanded='false'] .floating-form-rail__panel");

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
