import { describe, expect, test } from 'bun:test';
import { EnquiryValidationError, type EnquiryInput } from '../src/lib/enquiry/types';
import { selectKnownProductId, transitionEnquiryState } from '../src/lib/enquiry/form-state';
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

describe('enquiry form state', () => {
  test('preselects only an exact known product ID', () => {
    const known = ['butter-sheet-pro', 'whipping-cream'];
    expect(selectKnownProductId('butter-sheet-pro', known)).toBe('butter-sheet-pro');
    expect(selectKnownProductId('BUTTER-SHEET-PRO', known)).toBeUndefined();
    expect(selectKnownProductId(null, known)).toBeUndefined();
  });

  test('models idle, submitting, error, and success transitions', () => {
    const idle = { phase: 'idle' as const };
    expect(transitionEnquiryState(idle, { type: 'submit' })).toEqual({ phase: 'submitting' });
    expect(transitionEnquiryState({ phase: 'submitting' }, { type: 'invalid', errors: { email: 'Bad email' } })).toEqual({ phase: 'error', errors: { email: 'Bad email' } });
    expect(transitionEnquiryState({ phase: 'submitting' }, { type: 'succeed', reference: 'PFF-1' })).toEqual({ phase: 'success', reference: 'PFF-1' });
  });
});
