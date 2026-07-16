import type { Locale } from '../i18n/types';
import { EnquiryValidationError, type EnquiryErrors, type EnquiryInput, type EnquirySuccess } from './types';

export interface EnquiryFormView {
  installSubmitHandler(handler: () => Promise<void>): void;
  enableSubmit(): void;
  setBusy(isBusy: boolean): void;
  readFormData(): FormData;
  clearErrors(): void;
  showFieldErrors(errors: EnquiryErrors): void;
  focusFirstInvalid(): void;
  showStatus(message: string): void;
  showSuccess(result: EnquirySuccess): void;
  selectProduct(productId: string): void;
}

interface EnquiryControllerOptions {
  locale: Locale;
  knownProductIds: readonly string[];
  requestedProductId: string | null;
  submitting: string;
  formError: string;
  unexpectedError: string;
}

type SubmitEnquiry = (input: EnquiryInput) => Promise<EnquirySuccess>;

const stringValue = (data: FormData, name: string): string => {
  const value = data.get(name);
  return typeof value === 'string' ? value : '';
};

export const collectEnquiryInput = (locale: Locale, data: FormData): EnquiryInput => {
  const productId = stringValue(data, 'productId');
  return {
    locale,
    name: stringValue(data, 'name'),
    company: stringValue(data, 'company'),
    email: stringValue(data, 'email'),
    phone: stringValue(data, 'phone'),
    interest: stringValue(data, 'interest'),
    message: stringValue(data, 'message'),
    consent: data.get('consent') === 'on',
    ...(productId ? { productId } : {}),
  };
};

export const selectKnownProductId = (
  candidate: string | null,
  knownProductIds: readonly string[],
): string | undefined => candidate !== null && knownProductIds.includes(candidate)
  ? candidate
  : undefined;

export const initializeEnquiryForm = (
  view: EnquiryFormView,
  submitEnquiry: SubmitEnquiry,
  options: EnquiryControllerOptions,
): void => {
  let inFlight = false;

  view.installSubmitHandler(async () => {
    if (inFlight) return;
    inFlight = true;
    view.clearErrors();
    view.setBusy(true);
    view.showStatus(options.submitting);

    try {
      const result = await submitEnquiry(collectEnquiryInput(options.locale, view.readFormData()));
      view.showSuccess(result);
    } catch (error) {
      if (error instanceof EnquiryValidationError) {
        view.showFieldErrors(error.errors);
        view.showStatus(options.formError);
        view.focusFirstInvalid();
      } else {
        view.showStatus(options.unexpectedError);
      }
    } finally {
      inFlight = false;
      view.setBusy(false);
    }
  });

  const selectedProduct = selectKnownProductId(options.requestedProductId, options.knownProductIds);
  if (selectedProduct) view.selectProduct(selectedProduct);
  view.enableSubmit();
};
