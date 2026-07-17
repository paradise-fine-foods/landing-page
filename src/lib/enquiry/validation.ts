import { ui } from '../i18n/ui';
import type { EnquiryInput, EnquiryValidationResult } from './types';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const trimInput = (input: EnquiryInput): EnquiryInput => ({
  locale: input.locale,
  ...(input.mode ? { mode: input.mode } : {}),
  name: input.name.trim(),
  company: input.company.trim(),
  email: input.email.trim(),
  phone: input.phone.trim(),
  interest: input.interest.trim(),
  message: input.message.trim(),
  consent: input.consent,
  ...(input.productId === undefined ? {} : { productId: input.productId.trim() }),
});

export const validateEnquiry = (input: EnquiryInput): EnquiryValidationResult => {
  const value = trimInput(input);
  const copy = ui[value.locale].validation;
  const errors: Record<string, string> = {};

  if (!value.name) errors.name = copy.nameRequired;
  if (!value.email) errors.email = copy.emailRequired;
  else if (!emailPattern.test(value.email)) errors.email = copy.emailInvalid;
  if (value.mode !== 'general' && !value.interest) errors.interest = copy.interestRequired;
  if (!value.message) errors.message = copy.messageRequired;
  if (!value.consent) errors.consent = copy.consentRequired;

  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, value };
};
