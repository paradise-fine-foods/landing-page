import { CmsDataError, CmsUnavailableError } from './directus/errors';

interface MutablePageResponse {
  status?: number;
  statusText?: string;
}

export type CmsPageData<T> =
  | { ok: true; data: T }
  | { ok: false };

export const markNotFound = (response: MutablePageResponse): void => {
  response.status = 404;
  response.statusText = 'Not Found';
};

export const loadCmsPageData = async <T>(
  load: () => Promise<T>,
): Promise<CmsPageData<T>> => {
  try {
    return { ok: true, data: await load() };
  } catch (error) {
    if (error instanceof CmsUnavailableError || error instanceof CmsDataError) {
      return { ok: false };
    }
    throw error;
  }
};
