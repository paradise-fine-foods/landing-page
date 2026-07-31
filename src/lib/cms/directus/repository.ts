import {
  readItems,
  type Query,
  type RegularCollections,
  type RestCommand,
} from '@directus/sdk';

import type { Locale } from '../../i18n/types';
import { CmsDataError, CmsUnavailableError } from './errors';
import type {
  BlogPostRecord,
  BrandRecord,
  CategoryRecord,
  DirectusSchema,
  HomePageRecord,
  PartnerRecord,
  ProductRecord,
  SiteSettingsRecord,
} from './schema';

export type CmsRequest = <Output>(
  command: RestCommand<Output, DirectusSchema>,
) => Promise<Output>;

export interface CmsRepository {
  getSiteSettings(locale: Locale): Promise<SiteSettingsRecord>;
  getHomePage(locale: Locale): Promise<HomePageRecord>;
  getCategories(locale: Locale): Promise<CategoryRecord[]>;
  getProducts(locale: Locale): Promise<ProductRecord[]>;
  getProductBySlug(locale: Locale, slug: string): Promise<ProductRecord | undefined>;
  getBrands(locale: Locale): Promise<BrandRecord[]>;
  getBrandBySlug(locale: Locale, slug: string): Promise<BrandRecord | undefined>;
  getPartners(locale: Locale): Promise<PartnerRecord[]>;
  getBlogPosts(locale: Locale): Promise<BlogPostRecord[]>;
  getLatestBlogPosts(
    locale: Locale,
    limit: number,
    excludeId?: string,
  ): Promise<BlogPostRecord[]>;
  getBlogPostBySlug(locale: Locale, slug: string): Promise<BlogPostRecord | undefined>;
}

const fileFields = ['id', 'width', 'height', 'filename_download', 'type'] as const;

const categoryTranslationFields = [
  'id',
  'languages_code',
  'name',
  'slug',
  'description',
  'image_alt',
] as const;

const categoryFields = [
  'id',
  'status',
  'sort',
  { image: fileFields },
  { translations: categoryTranslationFields },
] as const;

const brandTranslationFields = [
  'id',
  'languages_code',
  'name',
  'slug',
  'description',
  'origin',
  'image_alt',
] as const;

const brandFields = [
  'id',
  'status',
  'accent',
  'sort',
  { image: fileFields },
  { translations: brandTranslationFields },
] as const;

const taxonomyTranslationFields = [
  'id',
  'languages_code',
  'name',
  'slug',
  'description',
] as const;

const applicationFields = [
  'id',
  'status',
  'sort',
  { translations: taxonomyTranslationFields },
] as const;

const audienceChannelFields = [
  'id',
  'status',
  'sort',
  { translations: taxonomyTranslationFields },
] as const;

const productTranslationFields = [
  'id',
  'languages_code',
  'name',
  'slug',
  'description',
  'origin',
  'pack_format',
  'storage_label',
  'storage_temperature',
  'benefits',
  'image_alt',
] as const;

const productFields = [
  'id',
  'status',
  'featured',
  'sort',
  { image: fileFields },
  { translations: productTranslationFields },
  { brand: brandFields },
  { categories: ['id', { categories_id: categoryFields }] },
  { applications: ['id', { applications_id: applicationFields }] },
  {
    audience_channels: [
      'id',
      { audience_channels_id: audienceChannelFields },
    ],
  },
] as const;

const partnerTranslationFields = [
  'id',
  'languages_code',
  'name',
  'logo_alt',
] as const;

const partnerFields = [
  'id',
  'status',
  'group',
  'source_url',
  'sort',
  { logo: fileFields },
  { translations: partnerTranslationFields },
] as const;

const blogTranslationFields = [
  'id',
  'languages_code',
  'title',
  'slug',
  'excerpt',
  'category',
  'body',
  'image_alt',
] as const;

const blogFields = [
  'id',
  'status',
  'published_at',
  'reading_minutes',
  { image: fileFields },
  { translations: blogTranslationFields },
] as const;

const siteSettingsFields = [
  'id',
  'status',
  'email',
  'phone',
  {
    translations: [
      'id',
      'languages_code',
      'site_name',
      'site_description',
      'address',
      'footer_copy',
    ],
  },
] as const;

const homePageFields = [
  'id',
  'status',
  { featured_product: productFields },
  { hero_image: fileFields },
  { editorial_image: fileFields },
  {
    translations: [
      'id',
      'languages_code',
      'hero_eyebrow',
      'hero_title',
      'hero_body',
      'hero_image_alt',
      'editorial_title',
      'editorial_body',
      'editorial_image_alt',
    ],
  },
] as const;

const localizedDeep = (locale: Locale) => ({
  translations: {
    _filter: { languages_code: { _eq: locale } },
    _limit: 1,
  },
});

const productRelationsDeep = (locale: Locale) => ({
  brand: localizedDeep(locale),
  categories: { categories_id: localizedDeep(locale) },
  applications: { applications_id: localizedDeep(locale) },
  audience_channels: { audience_channels_id: localizedDeep(locale) },
});

const productDeep = (locale: Locale, detail: boolean) => ({
  translations: detail
    ? {
        _filter: { languages_code: { _in: ['en', 'vi'] as Locale[] } },
        _limit: 2,
      }
    : localizedDeep(locale).translations,
  ...productRelationsDeep(locale),
});

const homeDeep = (locale: Locale) => ({
  ...localizedDeep(locale),
  featured_product: productDeep(locale, false),
});

type Collection = RegularCollections<DirectusSchema>;

const published = { status: { _eq: 'published' } } as const;

const readSiteSettings = <
  const TQuery extends Query<DirectusSchema, SiteSettingsRecord>,
>(query: TQuery) => readItems<DirectusSchema, 'site_settings', TQuery>('site_settings', query);

const readHomePage = <
  const TQuery extends Query<DirectusSchema, HomePageRecord>,
>(query: TQuery) => readItems<DirectusSchema, 'home_page', TQuery>('home_page', query);

const readCategories = <
  const TQuery extends Query<DirectusSchema, CategoryRecord>,
>(query: TQuery) => readItems<DirectusSchema, 'categories', TQuery>('categories', query);

const readProducts = <
  const TQuery extends Query<DirectusSchema, ProductRecord>,
>(query: TQuery) => readItems<DirectusSchema, 'products', TQuery>('products', query);

const readBrands = <
  const TQuery extends Query<DirectusSchema, BrandRecord>,
>(query: TQuery) => readItems<DirectusSchema, 'brands', TQuery>('brands', query);

const readPartners = <
  const TQuery extends Query<DirectusSchema, PartnerRecord>,
>(query: TQuery) => readItems<DirectusSchema, 'partners', TQuery>('partners', query);

const readBlogPosts = <
  const TQuery extends Query<DirectusSchema, BlogPostRecord>,
>(query: TQuery) => readItems<DirectusSchema, 'blog_posts', TQuery>('blog_posts', query);

export const createCmsRepository = (request: CmsRequest): CmsRepository => {
  const run = async <T>(operation: () => Promise<T>): Promise<T> => {
    try {
      return await operation();
    } catch (cause) {
      if (cause instanceof CmsDataError || cause instanceof CmsUnavailableError) {
        throw cause;
      }
      throw new CmsUnavailableError({ cause });
    }
  };

  const list = async <T extends object>(
    collection: Collection,
    command: RestCommand<T[], DirectusSchema>,
  ): Promise<T[]> => run(async () => {
    const response = await request(command);
    if (!Array.isArray(response)) {
      throw new CmsDataError(collection, 'Directus list response must be an array');
    }
    if (response.some(
      (item) => typeof item !== 'object' || item === null || Array.isArray(item),
    )) {
      throw new CmsDataError(collection, 'Directus list items must be records');
    }
    return response;
  });

  const detail = async <T extends object>(
    collection: Collection,
    command: RestCommand<T[], DirectusSchema>,
  ): Promise<T | undefined> => (await list(collection, command))[0];

  const requiredSingleton = async <T extends object>(
    collection: 'site_settings' | 'home_page',
    command: RestCommand<T[], DirectusSchema>,
  ): Promise<T> => {
    const item = await detail(collection, command);
    if (!item) throw new CmsDataError(collection, 'published singleton is missing');
    return item;
  };

  return {
    getSiteSettings: async (locale): Promise<SiteSettingsRecord> => requiredSingleton('site_settings', readSiteSettings({
      fields: siteSettingsFields,
      filter: published,
      deep: localizedDeep(locale),
      limit: 1,
    })),
    getHomePage: async (locale): Promise<HomePageRecord> => requiredSingleton('home_page', readHomePage({
      fields: homePageFields,
      filter: published,
      deep: homeDeep(locale),
      limit: 1,
    })),
    getCategories: async (locale): Promise<CategoryRecord[]> => list('categories', readCategories({
      fields: categoryFields,
      filter: published,
      deep: localizedDeep(locale),
      sort: ['sort', 'id'],
    })),
    getProducts: async (locale): Promise<ProductRecord[]> => list('products', readProducts({
      fields: productFields,
      filter: published,
      deep: productDeep(locale, false),
      sort: ['sort', 'id'],
    })),
    getProductBySlug: async (locale, slug): Promise<ProductRecord | undefined> => detail('products', readProducts({
      fields: productFields,
      filter: {
        ...published,
        translations: {
          languages_code: { _eq: locale },
          slug: { _eq: slug },
        },
      },
      deep: productDeep(locale, true),
      limit: 1,
    })),
    getBrands: async (locale): Promise<BrandRecord[]> => list('brands', readBrands({
      fields: brandFields,
      filter: published,
      deep: localizedDeep(locale),
      sort: ['sort', 'id'],
    })),
    getBrandBySlug: async (locale, slug): Promise<BrandRecord | undefined> => detail('brands', readBrands({
      fields: brandFields,
      filter: {
        ...published,
        translations: {
          languages_code: { _eq: locale },
          slug: { _eq: slug },
        },
      },
      deep: {
        translations: {
          _filter: { languages_code: { _in: ['en', 'vi'] as Locale[] } },
          _limit: 2,
        },
      },
      limit: 1,
    })),
    getPartners: async (locale): Promise<PartnerRecord[]> => list('partners', readPartners({
      fields: partnerFields,
      filter: published,
      deep: localizedDeep(locale),
      sort: ['sort', 'id'],
    })),
    getBlogPosts: async (locale): Promise<BlogPostRecord[]> => list('blog_posts', readBlogPosts({
      fields: blogFields,
      filter: published,
      deep: localizedDeep(locale),
      sort: ['-published_at', 'id'],
    })),
    getLatestBlogPosts: async (locale, limit, excludeId): Promise<BlogPostRecord[]> => {
      const safeLimit = Math.max(0, Math.floor(limit));
      if (safeLimit === 0) return Promise.resolve([]);
      return list('blog_posts', readBlogPosts({
        fields: blogFields,
        filter: {
          ...published,
          ...(excludeId ? { id: { _neq: excludeId } } : {}),
        },
        deep: localizedDeep(locale),
        sort: ['-published_at', 'id'],
        limit: safeLimit,
      }));
    },
    getBlogPostBySlug: async (locale, slug): Promise<BlogPostRecord | undefined> => detail('blog_posts', readBlogPosts({
      fields: blogFields,
      filter: {
        ...published,
        translations: {
          languages_code: { _eq: locale },
          slug: { _eq: slug },
        },
      },
      deep: {
        translations: {
          _filter: { languages_code: { _in: ['en', 'vi'] as Locale[] } },
          _limit: 2,
        },
      },
      limit: 1,
    })),
  };
};
