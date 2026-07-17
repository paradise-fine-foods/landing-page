import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';

const read = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

describe('floating form rail rendering contract', () => {
  test('renders the accessible server-side rail contract', async () => {
    const source = await read('../src/components/global/FloatingFormRail.astro');

    for (const value of [
      'data-floating-rail',
      'data-floating-rail-toggle',
      'aria-controls="floating-rail-panel"',
      'aria-expanded="false"',
      '?interest=retail',
      '?interest=other',
      'initializeFloatingRail',
      'staticOnly?: boolean',
      "!staticOnly && <script>",
      "[data-ready='true'] .floating-form-rail__toggle",
      "[data-ready='true'][data-expanded='false'] .floating-form-rail__panel",
      'data-floating-rail-label',
      'data-floating-rail-title',
      'aria-hidden="true"',
    ]) {
      expect(source).toContain(value);
    }
  });

  test('defines localized floating rail copy', async () => {
    const source = await read('../src/lib/i18n/ui.ts');
    expect(source).toContain('floatingRail:');
    expect(source).toContain("label: 'Enquire'");
    expect(source).toContain("panelTitle: 'Start a conversation'");
    expect(source).toContain("label: 'Trao đổi'");
    expect(source).toContain("panelTitle: 'Bắt đầu trao đổi'");
  });
});
