import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { CmsDataError } from '../src/lib/cms/directus/errors';
import { CmsUnavailableError } from '../src/lib/cms/directus/errors';
import { createCmsQueries } from '../src/lib/cms/queries';
import {
  mapAudienceChannel,
  mapApplication,
  mapBlogPost,
  mapBrand,
  mapCategory,
  mapFeaturedContent,
  mapGlobalSettings,
  mapPartner,
  mapProduct,
} from '../src/lib/cms/directus/mappers';
import {
  createCmsRepository,
  type CmsRequest,
} from '../src/lib/cms/directus/repository';
import {
  fixtureAudienceChannel,
  fixtureBlogPost,
  fixtureBrand,
  fixtureCategory,
  fixtureHomePage,
  fixturePartner,
  fixtureProduct,
  fixtureSiteSettings,
} from './fixtures/directus';

const directusUrl = 'https://cms.example.com';
const root = join(import.meta.dir, '..');

const createRequestHarness = (...responses: unknown[]) => {
  const requests: Array<{
    path: string;
    params?: Record<string, unknown>;
    method: string;
  }> = [];
  const request: CmsRequest = async (command) => {
    requests.push(command() as never);
    const response = responses.shift();
    if (response instanceof Error) throw response;
    return response as never;
  };
  return { request, requests };
};

describe('Directus presentation mappers', () => {
  test('maps a product strictly in the requested locale with stable counterpart identity', () => {
    const product = mapProduct(structuredClone(fixtureProduct), 'vi', directusUrl);

    expect(product).toMatchObject({
      id: 'cultured-butter-sheet',
      slug: 'bo-lat-len-men',
      name: 'Bơ lát lên men',
      applications: ['lamination'],
      audienceChannels: ['bakery'],
      applicationOptions: [
        { id: 'lamination', slug: 'can-lop', name: 'Cán lớp' },
      ],
      audienceChannelOptions: [
        { id: 'bakery', slug: 'tiem-banh', name: 'Tiệm bánh' },
      ],
      counterpart: {
        id: 'cultured-butter-sheet',
        locale: 'en',
        slug: 'cultured-butter-sheet',
      },
    });
    expect(product.benefits).toEqual(['Lợi ích thứ nhất', 'Lợi ích thứ hai']);
    expect(product.image).toEqual({
      src: 'https://cms.example.com/assets/file-product?width=1200&height=900&fit=cover&format=webp',
      width: 1200,
      height: 900,
      alt: 'Bơ lát lên men',
    });
  });

  test('never falls back when the requested translation is absent', () => {
    const product = {
      ...structuredClone(fixtureProduct),
      translations: fixtureProduct.translations.filter(
        ({ languages_code }) => languages_code === 'en',
      ),
    };

    expect(() => mapProduct(product, 'vi', directusUrl)).toThrow(CmsDataError);
    expect(() => mapProduct(product, 'vi', directusUrl)).toThrow(
      'products:cultured-butter-sheet',
    );
  });

  test('maps category, brand, application, audience, and partner collections', () => {
    expect(mapCategory(structuredClone(fixtureCategory), 'vi', directusUrl)).toMatchObject({
      id: 'butter',
      slug: 'bo',
      name: 'Bơ',
      counterpart: { id: 'butter', locale: 'en', slug: 'butter' },
    });
    expect(mapBrand(structuredClone(fixtureBrand), 'en', directusUrl)).toMatchObject({
      id: 'maison-laitiere',
      accent: 'bordeaux',
      origin: 'Europe',
    });
    expect(mapAudienceChannel(structuredClone(fixtureAudienceChannel), 'vi')).toEqual({
      id: 'bakery',
      slug: 'tiem-banh',
      name: 'Tiệm bánh',
      description: 'Các tiệm bánh chuyên nghiệp.',
    });
    expect(mapApplication(structuredClone(fixtureProduct.applications[0]!.applications_id), 'en'))
      .toMatchObject({ id: 'lamination', slug: 'lamination', name: 'Lamination' });
    expect(mapPartner(structuredClone(fixturePartner), 'vi', directusUrl)).toMatchObject({
      id: 'mega-mart',
      alt: 'Logo đối tác Mega Market',
      group: 'retail',
      width: 512,
      height: 207,
    });
  });

  test('maps localized store settings and complete home-page content', () => {
    const settings = mapGlobalSettings(
      structuredClone(fixtureSiteSettings),
      [structuredClone(fixturePartner)],
      'vi',
      directusUrl,
    );
    expect(settings).toMatchObject({
      siteName: 'Thực Phẩm Paradise',
      siteDescription: 'Nguyên liệu dịch vụ ăn uống chuyên nghiệp.',
      store: {
        address: 'Thành phố Hồ Chí Minh',
        email: 'hello@example.com',
        phone: '+84 900 000 000',
        footerCopy: 'Được chăm chút cẩn thận.',
      },
    });
    expect(settings.partners[0]?.alt).toBe('Logo đối tác Mega Market');

    const home = mapFeaturedContent(
      structuredClone(fixtureHomePage),
      'en',
      directusUrl,
    );
    expect(home.hero.product.id).toBe('cultured-butter-sheet');
    expect(home.hero.image).toMatchObject({
      width: 1600,
      height: 1100,
      alt: 'Featured butter presentation',
    });
    expect(home.editorial.title).toBe('Built around the professional table');
  });

  test('maps sanitized semantic blog HTML and removes unsafe markup', () => {
    const post = mapBlogPost(structuredClone(fixtureBlogPost), 'en', directusUrl);

    expect(post.bodyHtml).toContain('<h2>Safe heading</h2>');
    expect(post.bodyHtml).toContain(
      '<p>Keep <strong>cold</strong> and <em>steady</em>.</p>',
    );
    expect(post.bodyHtml).toContain('<ul><li>Cold storage</li></ul>');
    expect(post.bodyHtml).toContain('<ol><li>Check temperature</li></ol>');
    expect(post.bodyHtml).toContain('<blockquote>Handle with care.</blockquote>');
    expect(post.bodyHtml).toContain('<pre><code>2–6 °C</code></pre>');
    expect(post.bodyHtml).toContain(
      '<a href="https://example.com" title="Read" target="_blank" rel="noopener noreferrer">safe</a>',
    );
    expect(post.bodyHtml).toContain('<a href="https://example.com">popup</a>');
    expect(post.bodyHtml).not.toMatch(/script|onclick|javascript:|<img/i);
    expect(post.counterpart).toEqual({
      id: 'temperature-discipline',
      locale: 'vi',
      slug: 'ky-luat-nhiet-do-banh-ngot',
    });
  });

  test('rejects missing asset dimensions and localized alt text as invalid CMS data', () => {
    const missingDimensions = {
      ...structuredClone(fixtureProduct),
      image: { ...fixtureProduct.image, width: null },
    };
    const missingAlt = {
      ...structuredClone(fixtureProduct),
      translations: fixtureProduct.translations.map((translation, index) =>
        index === 0 ? { ...translation, image_alt: '' } : translation),
    };

    expect(() => mapProduct(missingDimensions, 'en', directusUrl)).toThrow(CmsDataError);
    expect(() => mapProduct(missingAlt, 'en', directusUrl)).toThrow(CmsDataError);
  });
});

describe('Directus request repository', () => {
  test('builds SDK commands from collection-specific typed query boundaries', () => {
    const source = readFileSync(
      join(root, 'src/lib/cms/directus/repository.ts'),
      'utf8',
    );

    for (const collection of [
      'siteSettings',
      'homePage',
      'categories',
      'products',
      'brands',
      'partners',
      'blogPosts',
    ]) {
      expect(source).toContain(`const read${collection[0]!.toUpperCase()}${collection.slice(1)} =`);
    }
    expect(source).toMatch(/readSingleton<DirectusSchema, 'site_settings'/);
    expect(source).toMatch(/readSingleton<DirectusSchema, 'home_page'/);
    expect(source).not.toMatch(/readItems\(collection, query\)/);
  });

  test('reads published singleton objects and requests only published records', async () => {
    const harness = createRequestHarness(fixtureSiteSettings, fixtureHomePage);
    const repository = createCmsRepository(harness.request);

    expect((await repository.getSiteSettings('en')).id).toBe('settings');
    expect((await repository.getHomePage('vi')).id).toBe('home');
    expect(harness.requests.map(({ path }) => path)).toEqual([
      '/items/site_settings',
      '/items/home_page',
    ]);
    expect(harness.requests.every(({ params }) =>
      JSON.stringify(params?.filter) === JSON.stringify({ status: { _eq: 'published' } }),
    )).toBe(true);
  });

  test('requests only published products with explicit localized relational fields', async () => {
    const harness = createRequestHarness([fixtureProduct]);
    const repository = createCmsRepository(harness.request);

    expect((await repository.getProducts('vi')).map(({ id }) => id)).toEqual([
      'cultured-butter-sheet',
    ]);
    const request = harness.requests[0]!;
    expect(request.path).toBe('/items/products');
    expect(request.params).toMatchObject({
      filter: { status: { _eq: 'published' } },
      sort: ['sort', 'id'],
      deep: {
        translations: {
          _filter: { languages_code: { _eq: 'vi' } },
          _limit: 1,
        },
        brand: {
          translations: {
            _filter: { languages_code: { _eq: 'vi' } },
            _limit: 1,
          },
        },
        categories: {
          categories_id: {
            translations: {
              _filter: { languages_code: { _eq: 'vi' } },
              _limit: 1,
            },
          },
        },
        applications: {
          applications_id: {
            translations: {
              _filter: { languages_code: { _eq: 'vi' } },
              _limit: 1,
            },
          },
        },
        audience_channels: {
          audience_channels_id: {
            translations: {
              _filter: { languages_code: { _eq: 'vi' } },
              _limit: 1,
            },
          },
        },
      },
    });
    const fields = JSON.stringify(request.params?.fields);
    expect(fields).toContain('"id"');
    expect(fields).toContain('"translations"');
    expect(fields).toContain('"width"');
    expect(fields).toContain('"height"');
    expect(fields).not.toContain('"*"');
  });

  test('requests both translations for a published detail and returns undefined only when absent', async () => {
    const found = createRequestHarness([fixtureProduct]);
    const repository = createCmsRepository(found.request);

    expect((await repository.getProductBySlug('vi', 'bo-lat-len-men'))?.id).toBe(
      'cultured-butter-sheet',
    );
    expect(found.requests[0]?.params).toMatchObject({
      filter: {
        status: { _eq: 'published' },
        translations: {
          languages_code: { _eq: 'vi' },
          slug: { _eq: 'bo-lat-len-men' },
        },
      },
      deep: {
        translations: {
          _filter: { languages_code: { _in: ['en', 'vi'] } },
          _limit: 2,
        },
      },
      limit: 1,
    });

    const missing = createRequestHarness([]);
    expect(
      await createCmsRepository(missing.request).getProductBySlug('en', 'unknown'),
    ).toBeUndefined();
  });

  test('applies ordering, limits, and stable-ID exclusions to latest blog requests', async () => {
    const harness = createRequestHarness([fixtureBlogPost]);
    const repository = createCmsRepository(harness.request);

    expect(
      (await repository.getLatestBlogPosts('en', 3, 'temperature-discipline'))
        .map(({ id }) => id),
    ).toEqual(['temperature-discipline']);
    expect(harness.requests[0]?.params).toMatchObject({
      filter: {
        status: { _eq: 'published' },
        id: { _neq: 'temperature-discipline' },
      },
      sort: ['-published_at', 'id'],
      limit: 3,
      deep: {
        translations: {
          _filter: { languages_code: { _eq: 'en' } },
          _limit: 1,
        },
      },
    });
  });

  test('uses published filters and deterministic ordering for every collection', async () => {
    const harness = createRequestHarness(
      [fixtureCategory],
      [fixtureBrand],
      [fixturePartner],
      [fixtureBlogPost],
    );
    const repository = createCmsRepository(harness.request);

    await repository.getCategories('en');
    await repository.getBrands('en');
    await repository.getPartners('en');
    await repository.getBlogPosts('en');

    expect(harness.requests.map(({ path }) => path)).toEqual([
      '/items/categories',
      '/items/brands',
      '/items/partners',
      '/items/blog_posts',
    ]);
    expect(
      harness.requests.every(
        ({ params }) =>
          JSON.stringify(params?.filter) ===
          JSON.stringify({ status: { _eq: 'published' } }),
      ),
    ).toBe(true);
    expect(harness.requests.map(({ params }) => params?.sort)).toEqual([
      ['sort', 'id'],
      ['sort', 'id'],
      ['sort', 'id'],
      ['-published_at', 'id'],
    ]);
  });

  test('rejects malformed, missing, and unpublished singleton records as invalid data', async () => {
    const malformed = createRequestHarness(null);
    const missing = createRequestHarness(undefined);
    const draftSettings = createRequestHarness({
      ...fixtureSiteSettings,
      status: 'draft',
    });
    const archivedHome = createRequestHarness({
      ...fixtureHomePage,
      status: 'archived',
    });

    expect(
      createCmsRepository(malformed.request).getSiteSettings('en'),
    ).rejects.toThrow('Directus singleton response must be a record');
    expect(
      createCmsRepository(missing.request).getHomePage('vi'),
    ).rejects.toThrow('published singleton is missing');
    expect(
      createCmsRepository(draftSettings.request).getSiteSettings('en'),
    ).rejects.toThrow('singleton must be published');
    expect(
      createCmsRepository(archivedHome.request).getHomePage('vi'),
    ).rejects.toThrow('singleton must be published');
  });

  test('converts transport failures without hiding CMS data errors', async () => {
    const transport = createRequestHarness(new Error('socket failed'));
    expect(
      createCmsRepository(transport.request).getProducts('en'),
    ).rejects.toBeInstanceOf(CmsUnavailableError);

    const dataFailure = new CmsDataError('products:item', 'bad relation');
    const invalid = createRequestHarness(dataFailure);
    expect(createCmsRepository(invalid.request).getProducts('en')).rejects.toBe(
      dataFailure,
    );

    const malformedDetail = createRequestHarness([null]);
    expect(
      createCmsRepository(malformedDetail.request)
        .getProductBySlug('en', 'broken-product'),
    ).rejects.toBeInstanceOf(CmsDataError);
  });
});

describe('CMS query boundary', () => {
  test('maps repository records through the preserved public query names', async () => {
    const harness = createRequestHarness(
      [fixtureProduct],
      [fixtureProduct],
      [fixtureCategory],
      [fixtureBrand],
      [fixtureBlogPost],
      [fixtureBlogPost],
      fixtureSiteSettings,
      [fixturePartner],
      fixtureHomePage,
    );
    const queries = createCmsQueries(
      createCmsRepository(harness.request),
      directusUrl,
    );

    expect((await queries.getProducts('vi')).map(({ id }) => id)).toEqual([
      'cultured-butter-sheet',
    ]);
    expect((await queries.getProductBySlug('en', 'cultured-butter-sheet'))?.counterpart)
      .toMatchObject({ locale: 'vi', slug: 'bo-lat-len-men' });
    expect((await queries.getCategories('en'))[0]?.name).toBe('Butter');
    expect((await queries.getBrands('vi'))[0]?.name).toBe('Nhà Sữa Maison');
    expect((await queries.getBlogPosts('en'))[0]?.bodyHtml).toContain(
      '<h2>Safe heading</h2>',
    );
    expect((await queries.getLatestBlogPosts('vi', 3))[0]?.id).toBe(
      'temperature-discipline',
    );
    expect((await queries.getGlobalSettings('vi')).store.address).toBe(
      'Thành phố Hồ Chí Minh',
    );
    expect((await queries.getFeaturedContent('en')).hero.product.id).toBe(
      'cultured-butter-sheet',
    );
  });

  test('keeps production queries fixture-free and exposes no mutable test override', () => {
    const source = readFileSync(join(root, 'src/lib/cms/queries.ts'), 'utf8');

    expect(source).not.toMatch(/demo-data|tests\/fixtures|setCms|resetCms|override/i);
    for (const name of [
      'getGlobalSettings',
      'getCategories',
      'getProducts',
      'getProductBySlug',
      'getBlogPosts',
      'getLatestBlogPosts',
      'getBlogPostBySlug',
      'getBrands',
      'getBrandBySlug',
      'getFeaturedContent',
    ]) {
      expect(source).toContain(`export const ${name}`);
    }
  });
});
