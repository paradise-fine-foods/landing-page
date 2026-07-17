import type { Locale } from '../i18n/types';
import type { EnquiryMode } from '../i18n/ui';

export interface EnquiryInput {
  locale: Locale;
  mode?: EnquiryMode;
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
