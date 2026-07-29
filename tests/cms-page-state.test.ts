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

  test('preserves tuple ordering and valid empty collection results', async () => {
    const result = await loadCmsPageData(
      async () => { await Bun.sleep(5); return 'settings'; },
      async () => 42,
      async () => [] as string[],
    );

    expect(result).toEqual({ ok: true, data: ['settings', 42, []] });
  });

  test('does not hide programming failures behind a 503', async () => {
    const error = new TypeError('broken page code');

    expect(loadCmsPageData(async () => { throw error; })).rejects.toBe(error);
  });

  test('settles every loader and rethrows a delayed programming failure over an earlier CMS failure', async () => {
    const programmingError = new TypeError('delayed broken page code');
    const settled: string[] = [];

    const result = loadCmsPageData(
      async () => {
        settled.push('cms');
        throw new CmsUnavailableError();
      },
      async () => {
        await Bun.sleep(10);
        settled.push('programming');
        throw programmingError;
      },
    );

    let rejection: unknown;
    try {
      await result;
    } catch (error) {
      rejection = error;
    }
    expect(rejection).toBe(programmingError);
    expect(settled).toEqual(['cms', 'programming']);
  });

  test('returns service unavailable only when every rejection is a CMS failure', async () => {
    const result = await loadCmsPageData(
      async () => 'completed sibling',
      async () => { throw new CmsUnavailableError(); },
      async () => { throw new CmsDataError('home_page', 'invalid singleton'); },
    );

    expect(result).toEqual({ ok: false });
  });
});
