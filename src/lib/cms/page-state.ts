import { CmsDataError, CmsUnavailableError } from './directus/errors';

interface MutablePageResponse {
  status?: number;
  statusText?: string;
}

export type CmsPageData<T> =
  | { ok: true; data: T }
  | { ok: false };

type CmsLoader<T = unknown> = () => Promise<T>;
type LoaderValues<TLoaders extends readonly CmsLoader[]> = {
  -readonly [Index in keyof TLoaders]: Awaited<ReturnType<TLoaders[Index]>>;
};

export const markNotFound = (response: MutablePageResponse): void => {
  response.status = 404;
  response.statusText = 'Not Found';
};

export const loadCmsPageData = async <
  const TLoaders extends readonly CmsLoader[],
>(...loaders: TLoaders): Promise<CmsPageData<LoaderValues<TLoaders>>> => {
  const results = await Promise.allSettled(
    loaders.map((loader) => Promise.resolve().then(loader)),
  );
  const rejected = results.filter(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  );
  const programmingFailure = rejected.find(({ reason }) => !(
    reason instanceof CmsUnavailableError || reason instanceof CmsDataError
  ));

  if (programmingFailure) throw programmingFailure.reason;
  if (rejected.length > 0) return { ok: false };

  return {
    ok: true,
    data: results.map((result) => (result as PromiseFulfilledResult<unknown>).value) as LoaderValues<TLoaders>,
  };
};
