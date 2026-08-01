import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';

const read = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

describe('enquiry rendering contract', () => {
  test('uses the CMS boundary and renders stable accessible relationships', async () => {
    const source = await read('../src/components/forms/EnquiryForm.astro');
    expect(source).toContain("from '../../lib/cms/queries'");
    expect(source).toContain('novalidate');
    expect(source).toMatch(/<button[^>]*type="submit"[^>]*disabled/);
    expect(source).toContain('initializeEnquiryForm');
    expect(source).toContain("removeAttribute('aria-invalid')");
    expect(source).toContain("setAttribute('aria-invalid', 'true')");
    expect(source).toContain('reference.textContent = result.reference');
    expect(source).toContain('successHeading.focus()');
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    for (const name of ['name', 'email', 'interest', 'message', 'consent']) {
      expect(source).toContain(`id="enquiry-${name}"`);
      expect(source).toContain(`id="enquiry-${name}-error"`);
    }
    expect(source).not.toContain('demo-data');
    expect(source).not.toContain('fetch(');
  });

  test('localized routes render the shared form through CMS queries', async () => {
    const [routes, modeSource] = await Promise.all([
      Promise.all([
      read('../src/pages/[locale]/contact.astro'),
      read('../src/pages/[locale]/contact/[mode].astro'),
      ]),
      read('../src/lib/enquiry/modes.ts'),
    ]);
    for (const source of routes) {
      expect(source).toContain('getProducts');
      expect(source).toContain('<EnquiryForm');
      expect(source).not.toContain('demo-data');
    }
    expect(modeSource).toContain("contactModes = ['customer', 'supplier'] as const");
    expect(modeSource).toContain('export const isContactMode');
    expect(routes[1]).toContain('isContactMode(modeParam)');
    expect(routes[1]).toContain("return Astro.rewrite('/404')");
    expect(routes[1]).not.toContain('getStaticPaths');
  });

  test('uses flat, touch-safe fields with direct error feedback', async () => {
    const source = await read('../src/components/forms/EnquiryForm.astro');

    expect(source).toContain('.enquiry__panel { border-block: 1px solid var(--color-brushed-steel); border-inline: 0;');
    expect(source).toContain('.field input:not([type=\'checkbox\']), .field select, .field textarea { background: var(--color-process-white); border: 1px solid var(--color-brushed-steel); border-radius: var(--radius-md);');
    expect(source).toContain('min-block-size: 2.75rem;');
    expect(source).toContain('.field__error { border-inline-start: 2px solid var(--color-error);');
    expect(source).toContain('.field__error:empty { border-color: transparent; padding-inline-start: 0; }');
    expect(source).not.toContain('.enquiry__panel { background: var(--color-process-white); border: 1px solid');
  });

  test('renders the required note once while keeping required controls accessible', async () => {
    const source = await read('../src/components/forms/EnquiryForm.astro');

    expect(source).toContain('const requiredDescription = formCopy.requiredNote;');
    expect(source).not.toContain('`${formCopy.requiredNote} ${formCopy.required}`');
    expect(source).toContain('aria-required="true"');
    expect(source).toContain('aria-hidden="true">*</span>');
  });

  test('keeps controls clear of both rail states and gives consent a labelled 44px hit area', async () => {
    const source = await read('../src/components/forms/EnquiryForm.astro');

    expect(source).toContain('.enquiry__panel { border-block: 1px solid var(--color-brushed-steel); border-inline: 0; padding-block: clamp(var(--space-5), 5vw, var(--space-8)); padding-inline-end: calc(2.75rem + 1rem + env(safe-area-inset-right, 0px)); }');
    expect(source).toContain(":global(html:has([data-floating-rail][data-expanded='true'])) .enquiry__panel { padding-inline-end: calc(14.75rem + 1rem + env(safe-area-inset-right, 0px)); }");
    expect(source).toContain("@media (max-width: 48rem) { :global(html:has([data-floating-rail][data-expanded='true'])) .enquiry__panel { padding-inline-end: calc(2.75rem + 1rem + env(safe-area-inset-right, 0px)); } }");
    expect(source).toContain('<input id="enquiry-consent" name="consent" type="checkbox"');
    expect(source).toContain('<label for="enquiry-consent">');
    expect(source).toContain('.field--consent label { align-items: center; display: flex; margin: 0; min-block-size: 2.75rem; }');
  });
});
