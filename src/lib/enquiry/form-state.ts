import type { EnquiryErrors } from './types';

export type EnquiryFormState =
  | { phase: 'idle' }
  | { phase: 'submitting' }
  | { phase: 'error'; errors: EnquiryErrors }
  | { phase: 'success'; reference: string };

export type EnquiryFormEvent =
  | { type: 'submit' }
  | { type: 'invalid'; errors: EnquiryErrors }
  | { type: 'succeed'; reference: string }
  | { type: 'reset' };

export const selectKnownProductId = (
  candidate: string | null,
  knownProductIds: readonly string[],
): string | undefined => candidate !== null && knownProductIds.includes(candidate)
  ? candidate
  : undefined;

export const transitionEnquiryState = (
  _state: EnquiryFormState,
  event: EnquiryFormEvent,
): EnquiryFormState => {
  switch (event.type) {
    case 'submit': return { phase: 'submitting' };
    case 'invalid': return { phase: 'error', errors: { ...event.errors } };
    case 'succeed': return { phase: 'success', reference: event.reference };
    case 'reset': return { phase: 'idle' };
  }
};
