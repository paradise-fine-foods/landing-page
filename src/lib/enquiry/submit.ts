import { ui } from '../i18n/ui';
import { EnquiryValidationError, type EnquiryInput, type EnquirySuccess } from './types';
import { validateEnquiry } from './validation';

interface EnquiryDependencies {
  now: () => Date;
  createId: () => string;
  delay: (milliseconds: number) => Promise<void>;
}

const wait = (milliseconds: number) => new Promise<void>((resolve) => {
  globalThis.setTimeout(resolve, milliseconds);
});

/** Internal factory kept injectable so the demo-only boundary is deterministic under test. */
export const createEnquirySubmitter = ({ now, createId, delay }: EnquiryDependencies) =>
  async (input: EnquiryInput): Promise<EnquirySuccess> => {
    await delay(350);

    const validation = validateEnquiry(input);
    if (!validation.ok) throw new EnquiryValidationError(validation.errors);

    return {
      ok: true,
      reference: `PFF-${createId().toUpperCase()}`,
      message: ui[validation.value.locale].status.successMessage,
      receivedAt: now().toISOString(),
      demo: true,
    };
  };

export const submitEnquiry = createEnquirySubmitter({
  now: () => new Date(),
  createId: () => crypto.randomUUID(),
  delay: wait,
});
