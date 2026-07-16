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
    const [english, vietnamese] = await Promise.all([
      read('../src/pages/en/contact.astro'),
      read('../src/pages/vi/lien-he.astro'),
    ]);
    for (const source of [english, vietnamese]) {
      expect(source).toContain('getProducts');
      expect(source).toContain('<EnquiryForm');
      expect(source).not.toContain('demo-data');
    }
  });
});
