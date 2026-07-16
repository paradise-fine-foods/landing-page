import type { Locale } from '../i18n/types';

export interface EnquiryInput {
  locale: Locale;
  name: string;
  company: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  consent: boolean;
  productId?: string;
}

export type EnquiryErrors = Partial<Record<keyof EnquiryInput, string>>;

export interface EnquirySuccess {
  ok: true;
  reference: string;
  message: string;
  receivedAt: string;
  demo: true;
}

export class EnquiryValidationError extends Error {
  readonly errors: EnquiryErrors;

  constructor(errors: EnquiryErrors) {
    super('Enquiry validation failed');
    this.name = 'EnquiryValidationError';
    this.errors = { ...errors };
  }
}

export type EnquiryValidationResult =
  | { ok: true; value: EnquiryInput }
  | { ok: false; errors: EnquiryErrors };
