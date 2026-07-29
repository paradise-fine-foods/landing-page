export class CmsDataError extends Error {
  constructor(context: string, detail: string, options?: ErrorOptions) {
    super(`Invalid CMS data at ${context}: ${detail}`, options);
    this.name = 'CmsDataError';
  }
}

export class CmsUnavailableError extends Error {
  constructor(options?: ErrorOptions) {
    super('The CMS is currently unavailable.', options);
    this.name = 'CmsUnavailableError';
  }
}
