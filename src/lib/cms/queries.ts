import type { Locale } from '@/lib/i18n/types';
import { filterProducts } from '@/lib/catalog/filter-products';
import { getProductionCmsConnection } from '@/lib/cms/directus/client';
import {
  mapBlogPost,
  mapBrand,
  mapCategory,
  mapFeaturedContent,
  mapGlobalSettings,
  mapProduct,
} from '@/lib/cms/directus/mappers';
import type { CmsRepository } from '@/lib/cms/directus/repository';
import type {
  BlogPost,
  Brand,
  Category,
  FeaturedContent,
  GlobalSettings,
  Product,
  ProductQuery,
} from '@/lib/cms/types';

export { normalizeBrandAccent } from '@/lib/cms/directus/mappers';
export { CmsDataError, CmsUnavailableError } from '@/lib/cms/directus/errors';
export { submitEnquiry } from '@/lib/enquiry/submit';
export { EnquiryValidationError } from '@/lib/enquiry/types';
export type { EnquiryErrors, EnquiryInput, EnquirySuccess } from '@/lib/enquiry/types';

export interface CmsQueries {
  getGlobalSettings(locale: Locale): Promise<GlobalSettings>;
  getCategories(locale: Locale): Promise<Category[]>;
  getProducts(locale: Locale, query?: ProductQuery): Promise<Product[]>;
  getProductBySlug(locale: Locale, slug: string): Promise<Product | undefined>;
  getBlogPosts(locale: Locale): Promise<BlogPost[]>;
  getLatestBlogPosts(
    locale: Locale,
    limit: number,
    excludeId?: string,
  ): Promise<BlogPost[]>;
  getBlogPostBySlug(locale: Locale, slug: string): Promise<BlogPost | undefined>;
  getBrands(locale: Locale): Promise<Brand[]>;
  getBrandBySlug(locale: Locale, slug: string): Promise<Brand | undefined>;
  getFeaturedContent(locale: Locale): Promise<FeaturedContent>;
}

export const createCmsQueries = (
  repository: CmsRepository,
  directusUrl: string,
): CmsQueries => ({
  getGlobalSettings: async (locale) => {
    const [settings, partners] = await Promise.all([
      repository.getSiteSettings(locale),
      repository.getPartners(locale),
    ]);
    return mapGlobalSettings(settings, partners, locale, directusUrl);
  },
  getCategories: async (locale) =>
    (await repository.getCategories(locale))
      .map((category) => mapCategory(category, locale, directusUrl)),
  getProducts: async (locale, query = {}) =>
    filterProducts(
      (await repository.getProducts(locale))
        .map((product) => mapProduct(product, locale, directusUrl)),
      query,
    ),
  getProductBySlug: async (locale, slug) => {
    const product = await repository.getProductBySlug(locale, slug);
    return product ? mapProduct(product, locale, directusUrl) : undefined;
  },
  getBlogPosts: async (locale) =>
    (await repository.getBlogPosts(locale))
      .map((post) => mapBlogPost(post, locale, directusUrl)),
  getLatestBlogPosts: async (locale, limit, excludeId) =>
    (await repository.getLatestBlogPosts(locale, limit, excludeId))
      .map((post) => mapBlogPost(post, locale, directusUrl)),
  getBlogPostBySlug: async (locale, slug) => {
    const post = await repository.getBlogPostBySlug(locale, slug);
    return post ? mapBlogPost(post, locale, directusUrl) : undefined;
  },
  getBrands: async (locale) =>
    (await repository.getBrands(locale))
      .map((brand) => mapBrand(brand, locale, directusUrl)),
  getBrandBySlug: async (locale, slug) => {
    const brand = await repository.getBrandBySlug(locale, slug);
    return brand ? mapBrand(brand, locale, directusUrl) : undefined;
  },
  getFeaturedContent: async (locale) =>
    mapFeaturedContent(await repository.getHomePage(locale), locale, directusUrl),
});

let productionQueriesPromise: Promise<CmsQueries> | undefined;

const productionQueries = (): Promise<CmsQueries> => {
  productionQueriesPromise ??= getProductionCmsConnection()
    .then(({ repository, directusUrl }) => createCmsQueries(repository, directusUrl));
  return productionQueriesPromise;
};

export const getGlobalSettings = async (locale: Locale): Promise<GlobalSettings> =>
  (await productionQueries()).getGlobalSettings(locale);

export const getCategories = async (locale: Locale): Promise<Category[]> =>
  (await productionQueries()).getCategories(locale);

export const getProducts = async (
  locale: Locale,
  query: ProductQuery = {},
): Promise<Product[]> => (await productionQueries()).getProducts(locale, query);

export const getProductBySlug = async (
  locale: Locale,
  slug: string,
): Promise<Product | undefined> =>
  (await productionQueries()).getProductBySlug(locale, slug);

export const getBlogPosts = async (locale: Locale): Promise<BlogPost[]> =>
  (await productionQueries()).getBlogPosts(locale);

export const getLatestBlogPosts = async (
  locale: Locale,
  limit: number,
  excludeId?: string,
): Promise<BlogPost[]> =>
  (await productionQueries()).getLatestBlogPosts(locale, limit, excludeId);

export const getBlogPostBySlug = async (
  locale: Locale,
  slug: string,
): Promise<BlogPost | undefined> =>
  (await productionQueries()).getBlogPostBySlug(locale, slug);

export const getBrands = async (locale: Locale): Promise<Brand[]> =>
  (await productionQueries()).getBrands(locale);

export const getBrandBySlug = async (
  locale: Locale,
  slug: string,
): Promise<Brand | undefined> =>
  (await productionQueries()).getBrandBySlug(locale, slug);

export const getFeaturedContent = async (
  locale: Locale,
): Promise<FeaturedContent> =>
  (await productionQueries()).getFeaturedContent(locale);
