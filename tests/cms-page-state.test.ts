import { describe, expect, test } from 'bun:test';

import { CmsDataError, CmsUnavailableError } from '../src/lib/cms/queries';
import {
  loadCmsPageData,
  markNotFound,
} from '../src/lib/cms/page-state';

describe('CMS page response state', () => {
  test('marks invalid runtime route params as a real 404 response', () => {
    const response = { status: 200, statusText: 'OK' };

    markNotFound(response);

    expect(response).toEqual({ status: 404, statusText: 'Not Found' });
  });

  test.each([
    new CmsUnavailableError(),
    new CmsDataError('site_settings', 'missing singleton'),
  ])('maps a known CMS failure to a service-unavailable page state', async (error) => {
    const result = await loadCmsPageData(async () => { throw error; });

    expect(result).toEqual({ ok: false });
  });

  test('preserves valid empty collection results', async () => {
    const result = await loadCmsPageData(async () => ({ products: [], brands: [] }));

    expect(result).toEqual({ ok: true, data: { products: [], brands: [] } });
  });

  test('does not hide programming failures behind a 503', async () => {
    const error = new TypeError('broken page code');

    expect(loadCmsPageData(async () => { throw error; })).rejects.toBe(error);
  });
});
