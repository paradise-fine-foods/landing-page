import { ui } from '@/lib/i18n/ui';
import { EnquiryValidationError, type EnquiryInput, type EnquirySuccess } from '@/lib/enquiry/types';
import { validateEnquiry } from '@/lib/enquiry/validation';

interface EnquiryDependencies {
  now: () => Date;
  fetch: (input: string, init?: RequestInit) => Promise<Response>;
}

/** Internal factory kept injectable so submission behavior is deterministic under test. */
export const createEnquirySubmitter = ({ now, fetch }: EnquiryDependencies) =>
  async (input: EnquiryInput): Promise<EnquirySuccess> => {
    const validation = validateEnquiry(input);
    if (!validation.ok) throw new EnquiryValidationError(validation.errors);

    let response: Response;
    try {
      response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.value),
      });
    } catch {
      throw new Error('Submission failed');
    }

    if (!response.ok) throw new Error('Submission failed');

    const payload = (await response.json()) as { reference?: string };
    if (!payload.reference) throw new Error('Submission failed');

    return {
      ok: true,
      reference: payload.reference,
      message: ui[validation.value.locale].status.successMessage,
      receivedAt: now().toISOString(),
    };
  };

export const submitEnquiry = createEnquirySubmitter({
  now: () => new Date(),
  fetch: (...args) => globalThis.fetch(...args),
});
