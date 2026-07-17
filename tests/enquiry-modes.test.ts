import { describe, expect, test } from 'bun:test';
import { getEnquiryModeCopy } from '../src/lib/enquiry/modes';
import { localizedPath } from '../src/lib/i18n/routes';
import { validateEnquiry } from '../src/lib/enquiry/validation';

describe('local enquiry modes', () => {
  test('exposes reciprocal customer and supplier routes', () => {
    expect(localizedPath('en', 'customerContact')).toBe('/en/contact/customer/');
    expect(localizedPath('vi', 'customerContact')).toBe('/vi/contact/customer/');
    expect(localizedPath('en', 'supplierContact')).toBe('/en/contact/supplier/');
    expect(localizedPath('vi', 'supplierContact')).toBe('/vi/contact/supplier/');
  });

  test('keeps distinct localized mode copy and option sets', () => {
    expect(getEnquiryModeCopy('en', 'customer').interestOptions).toHaveProperty('retail');
    expect(getEnquiryModeCopy('en', 'supplier').interestOptions).toHaveProperty('dairy');
    expect(getEnquiryModeCopy('en', 'general').interestOptions).toHaveProperty('other');
    expect(getEnquiryModeCopy('vi', 'customer').title).not.toBe(getEnquiryModeCopy('en', 'customer').title);
  });

  test('general enquiries do not require a mode-specific interest', () => {
    const result = validateEnquiry({ locale: 'en', mode: 'general', name: 'Lin', company: '', email: 'lin@example.com', phone: '', interest: '', message: 'Hello', consent: true });
    expect(result.ok).toBe(true);
  });
});
