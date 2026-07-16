import { describe, expect, test } from 'bun:test';
import { EnquiryValidationError, type EnquiryInput } from '../src/lib/enquiry/types';
import {
  collectEnquiryInput,
  initializeEnquiryForm,
  type EnquiryFormView,
} from '../src/lib/enquiry/controller';
import { createEnquirySubmitter } from '../src/lib/enquiry/submit';
import { validateEnquiry } from '../src/lib/enquiry/validation';

const validInput = (locale: 'en' | 'vi' = 'en'): EnquiryInput => ({
  locale,
  name: '  Linh Nguyen  ',
  company: '  Atelier Demo  ',
  email: '  linh@example.com  ',
  phone: '  +84 900 000 000  ',
  interest: '  horeca  ',
  message: '  Please share the professional formats.  ',
  consent: true,
  productId: '  butter-sheet-pro  ',
});

describe('validateEnquiry', () => {
  test('returns localized errors for every required English field', () => {
    const result = validateEnquiry({
      locale: 'en', name: ' ', company: '', email: '', phone: '', interest: '', message: '', consent: false,
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('Expected invalid input');
    expect(result.errors).toEqual({
      name: 'Enter your name.',
      email: 'Enter your email address.',
      interest: 'Choose an area of interest.',
      message: 'Tell us how we can help.',
      consent: 'Confirm your consent to continue.',
    });
  });

  test('returns Vietnamese field errors and rejects malformed email', () => {
    const result = validateEnquiry({ ...validInput('vi'), email: 'linh@invalid' });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('Expected invalid input');
    expect(result.errors.email).toBe('Vui lòng nhập địa chỉ email hợp lệ.');
  });

  test('trims every string without mutating valid input', () => {
    const input = validInput();
    const before = structuredClone(input);
    const result = validateEnquiry(input);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected valid input');
    expect(result.value).toEqual({
      locale: 'en',
      name: 'Linh Nguyen',
      company: 'Atelier Demo',
      email: 'linh@example.com',
      phone: '+84 900 000 000',
      interest: 'horeca',
      message: 'Please share the professional formats.',
      consent: true,
      productId: 'butter-sheet-pro',
    });
    expect(input).toEqual(before);
  });
});

describe('demo enquiry submission', () => {
  test.each(['en', 'vi'] as const)('returns deterministic demo success for %s', async (locale) => {
    const delays: number[] = [];
    const submit = createEnquirySubmitter({
      now: () => new Date('2026-07-16T08:30:00.000Z'),
      createId: () => 'fixed-id',
      delay: async (milliseconds) => { delays.push(milliseconds); },
    });

    const result = await submit(validInput(locale));
    expect(delays).toEqual([350]);
    expect(result).toEqual({
      ok: true,
      reference: 'PFF-FIXED-ID',
      message: locale === 'en'
        ? 'Your demo enquiry has been recorded for this review session.'
        : 'Yêu cầu demo đã được ghi nhận cho phiên duyệt này.',
      receivedAt: '2026-07-16T08:30:00.000Z',
      demo: true,
    });
  });

  test('waits, revalidates, and throws a typed field error without creating a receipt', async () => {
    const delays: number[] = [];
    let createdReceipt = false;
    const submit = createEnquirySubmitter({
      now: () => { createdReceipt = true; return new Date(); },
      createId: () => { createdReceipt = true; return 'unused'; },
      delay: async (milliseconds) => { delays.push(milliseconds); },
    });

    try {
      await submit({ ...validInput(), email: 'bad' });
      throw new Error('Expected submission to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(EnquiryValidationError);
      expect((error as EnquiryValidationError).errors.email).toBe('Enter a valid email address.');
      expect(delays).toEqual([350]);
      expect(createdReceipt).toBe(false);
    }
  });
});

class FakeView implements EnquiryFormView {
  events: string[] = [];
  handler?: () => Promise<void>;
  enabled = false;
  values = new FormData();
  fieldErrors: Record<string, string> = {};
  statuses: string[] = [];
  successReference?: string;
  selectedProduct?: string;
  selectedInterest?: string;

  installSubmitHandler(handler: () => Promise<void>) { this.events.push('listen'); this.handler = handler; }
  enableSubmit() { this.events.push('enable'); this.enabled = true; }
  setBusy(value: boolean) { this.events.push(value ? 'busy' : 'ready'); this.enabled = !value; }
  readFormData() { return this.values; }
  clearErrors() { this.events.push('clear'); this.fieldErrors = {}; }
  showFieldErrors(errors: Record<string, string>) { this.events.push('errors'); this.fieldErrors = { ...errors }; }
  focusFirstInvalid() { this.events.push('focus-invalid'); }
  showStatus(message: string) { this.statuses.push(message); }
  showSuccess(result: { reference: string }) { this.events.push('success'); this.successReference = result.reference; }
  selectProduct(productId: string) { this.events.push(`select:${productId}`); this.selectedProduct = productId; }
  selectInterest(interest: string) { this.events.push(`interest:${interest}`); this.selectedInterest = interest; }
}

const fillFormData = (consent: boolean, productId = '') => {
  const data = new FormData();
  data.set('name', ' Linh ');
  data.set('company', ' Atelier ');
  data.set('email', ' linh@example.com ');
  data.set('phone', ' 0900 ');
  data.set('interest', ' horeca ');
  data.set('message', ' Details please ');
  if (consent) data.set('consent', 'on');
  if (productId) data.set('productId', productId);
  return data;
};

describe('enquiry form controller', () => {
  test('strictly selects only an exact rendered interest option', async () => {
    const controller = await import('../src/lib/enquiry/controller');
    expect(controller.selectKnownInterest('horeca', ['retail', 'horeca'])).toBe('horeca');
    expect(controller.selectKnownInterest('HORECA', ['retail', 'horeca'])).toBeUndefined();
    expect(controller.selectKnownInterest(null, ['retail', 'horeca'])).toBeUndefined();
  });

  test('collects FormData including unchecked/checked consent and optional product', () => {
    const unchecked = collectEnquiryInput('en', fillFormData(false));
    expect(unchecked.consent).toBe(false);
    expect('productId' in unchecked).toBe(false);
    expect(collectEnquiryInput('vi', fillFormData(true, 'butter-sheet-pro'))).toMatchObject({ locale: 'vi', consent: true, productId: 'butter-sheet-pro' });
  });

  test('installs prevention listener before enabling and strictly preselects known product', () => {
    const view = new FakeView();
    initializeEnquiryForm(view, async () => ({ ok: true, reference: 'PFF-1', message: '', receivedAt: '', demo: true }), {
      locale: 'en', knownProductIds: ['butter-sheet-pro'], requestedProductId: 'butter-sheet-pro', knownInterestValues: ['retail', 'horeca'], requestedInterest: 'horeca', submitting: 'Sending', formError: 'Fix fields', unexpectedError: 'Try again',
    });
    expect(view.events).toEqual(['listen', 'select:butter-sheet-pro', 'interest:horeca', 'enable']);

    const unknown = new FakeView();
    initializeEnquiryForm(unknown, async () => ({ ok: true, reference: 'PFF-1', message: '', receivedAt: '', demo: true }), {
      locale: 'en', knownProductIds: ['butter-sheet-pro'], requestedProductId: 'BUTTER-SHEET-PRO', knownInterestValues: ['retail', 'horeca'], requestedInterest: 'HORECA', submitting: 'Sending', formError: 'Fix fields', unexpectedError: 'Try again',
    });
    expect(unknown.selectedProduct).toBeUndefined();
    expect(unknown.selectedInterest).toBeUndefined();
  });

  test('keeps submission disabled if initialization fails after listener installation', () => {
    const view = new FakeView();
    view.selectProduct = () => { view.events.push('select-failed'); throw new Error('broken select'); };
    expect(() => initializeEnquiryForm(view, async () => ({ ok: true, reference: 'PFF-1', message: '', receivedAt: '', demo: true }), {
      locale: 'en', knownProductIds: ['butter-sheet-pro'], requestedProductId: 'butter-sheet-pro', submitting: 'Sending', formError: 'Fix fields', unexpectedError: 'Try again',
    })).toThrow('broken select');
    expect(view.events).toEqual(['listen', 'select-failed']);
    expect(view.enabled).toBe(false);
  });

  test('synchronously guards duplicate in-flight submissions and safely renders success', async () => {
    const view = new FakeView();
    view.values = fillFormData(true, 'butter-sheet-pro');
    let resolve!: (value: { ok: true; reference: string; message: string; receivedAt: string; demo: true }) => void;
    let calls = 0;
    const pending = new Promise<{ ok: true; reference: string; message: string; receivedAt: string; demo: true }>((done) => { resolve = done; });
    initializeEnquiryForm(view, async () => { calls += 1; return pending; }, {
      locale: 'en', knownProductIds: [], requestedProductId: null, submitting: 'Sending', formError: 'Fix fields', unexpectedError: 'Try again',
    });

    const first = view.handler!();
    const duplicate = view.handler!();
    expect(calls).toBe(1);
    resolve({ ok: true, reference: '<img src=x>', message: '', receivedAt: '', demo: true });
    await Promise.all([first, duplicate]);
    expect(view.successReference).toBe('<img src=x>');
    expect(view.events).toContain('success');
    expect(view.events.at(-1)).toBe('ready');
  });

  test('clears old errors, shows keyed validation errors, focuses, preserves values, and recovers', async () => {
    const view = new FakeView();
    view.values = fillFormData(false);
    const before = [...view.values.entries()];
    initializeEnquiryForm(view, async () => { throw new EnquiryValidationError({ email: 'Bad email', consent: 'Consent required' }); }, {
      locale: 'en', knownProductIds: [], requestedProductId: null, submitting: 'Sending', formError: 'Fix fields', unexpectedError: 'Try again',
    });
    await view.handler!();
    expect(view.events).toEqual(['listen', 'enable', 'clear', 'busy', 'errors', 'focus-invalid', 'ready']);
    expect(view.fieldErrors).toEqual({ email: 'Bad email', consent: 'Consent required' });
    expect(view.statuses).toEqual(['Sending', 'Fix fields']);
    expect([...view.values.entries()]).toEqual(before);
    expect(view.enabled).toBe(true);
  });

  test('uses only localized generic copy, preserves values, and allows retry', async () => {
    const view = new FakeView();
    view.values = fillFormData(true);
    const before = [...view.values.entries()];
    let calls = 0;
    initializeEnquiryForm(view, async () => {
      calls += 1;
      if (calls === 1) throw new Error('PII linh@example.com');
      return { ok: true, reference: 'PFF-SAFE', message: '', receivedAt: '', demo: true };
    }, {
      locale: 'en', knownProductIds: [], requestedProductId: null, submitting: 'Sending', formError: 'Fix fields', unexpectedError: 'Safe generic message',
    });
    await view.handler!();
    expect(view.statuses).toEqual(['Sending', 'Safe generic message']);
    expect(JSON.stringify(view.statuses)).not.toContain('linh@example.com');
    expect([...view.values.entries()]).toEqual(before);
    expect(view.enabled).toBe(true);
    await view.handler!();
    expect(calls).toBe(2);
    expect(view.successReference).toBe('PFF-SAFE');
  });
});
