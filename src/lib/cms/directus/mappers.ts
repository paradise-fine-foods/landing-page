import type { Locale } from '@/lib/i18n/types';
import {
  brandAccentTokens,
  type Brand,
  type BrandAccent,
  type BlogPost,
  type BrandingAsset,
  type Category,
  type FeaturedContent,
  type GlobalSettings,
  type LocalizedCounterpart,
  type LocalizedTaxonomyOption,
  type Product,
  type Recipe,
} from '@/lib/cms/types';
import { mapImageAsset } from '@/lib/cms/directus/assets';
import { CmsDataError } from '@/lib/cms/directus/errors';
import { sanitizeBlogHtml } from '@/lib/cms/directus/rich-text';

type UnknownRecord = Record<string, unknown>;

const defaultBrandAccent: BrandAccent = 'butter';

export const normalizeBrandAccent = (value: unknown): BrandAccent =>
  typeof value === 'string' && brandAccentTokens.includes(value as BrandAccent)
    ? value as BrandAccent
    : defaultBrandAccent;

const record = (value: unknown, context: string): UnknownRecord => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new CmsDataError(context, 'record must be an object');
  }
  return value as UnknownRecord;
};

const array = (value: unknown, context: string): unknown[] => {
  if (!Array.isArray(value)) throw new CmsDataError(context, 'must be an array');
  return value;
};

const requiredString = (value: unknown, context: string, field: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new CmsDataError(context, `${field} is required`);
  }
  return value.trim();
};

const optionalString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const requiredNumber = (value: unknown, context: string, field: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new CmsDataError(context, `${field} must be finite`);
  }
  return value;
};

const itemContext = (collection: string, item: UnknownRecord): string =>
  `${collection}:${typeof item.id === 'string' ? item.id : 'unknown'}`;

const translation = (
  item: UnknownRecord,
  locale: Locale,
  context: string,
): UnknownRecord => {
  const row = array(item.translations, `${context}.translations`)
    .map((value) => record(value, `${context}.translations`))
    .find((candidate) => candidate.languages_code === locale);
  if (!row) throw new CmsDataError(context, `missing ${locale} translation`);
  return row;
};

const counterpart = (
  item: UnknownRecord,
  locale: Locale,
  context: string,
): LocalizedCounterpart | undefined => {
  const otherLocale: Locale = locale === 'en' ? 'vi' : 'en';
  const row = array(item.translations, `${context}.translations`)
    .map((value) => record(value, `${context}.translations`))
    .find((candidate) => candidate.languages_code === otherLocale);
  if (!row) return undefined;
  const id = requiredString(item.id, context, 'id');
  return {
    id,
    locale: otherLocale,
    slug: requiredString(row.slug, context, `${otherLocale} slug`),
  };
};

const expandedRelation = (
  value: unknown,
  context: string,
  field: string,
): UnknownRecord => {
  if (typeof value === 'string') {
    throw new CmsDataError(context, `${field} relation must be expanded`);
  }
  return record(value, `${context}.${field}`);
};

export const mapCategory = (
  value: unknown,
  locale: Locale,
  directusUrl: string,
): Category => {
  const item = record(value, 'categories');
  const context = itemContext('categories', item);
  const localized = translation(item, locale, context);
  return {
    id: requiredString(item.id, context, 'id'),
    slug: requiredString(localized.slug, context, 'slug'),
    name: requiredString(localized.name, context, 'name'),
    description: optionalString(localized.description),
    image: mapImageAsset(item.image, localized.image_alt, directusUrl, context),
    counterpart: counterpart(item, locale, context),
  };
};

export const mapBrand = (
  value: unknown,
  locale: Locale,
  directusUrl: string,
): Brand => {
  const item = record(value, 'brands');
  const context = itemContext('brands', item);
  const localized = translation(item, locale, context);
  return {
    id: requiredString(item.id, context, 'id'),
    slug: requiredString(localized.slug, context, 'slug'),
    name: requiredString(localized.name, context, 'name'),
    description: optionalString(localized.description),
    origin: optionalString(localized.origin),
    image: mapImageAsset(item.image, localized.image_alt, directusUrl, context),
    accent: normalizeBrandAccent(item.accent),
    counterpart: counterpart(item, locale, context),
  };
};

const mapTaxonomyOption = (
  value: unknown,
  locale: Locale,
  collection: 'applications' | 'audience_channels',
): LocalizedTaxonomyOption => {
  const item = record(value, collection);
  const context = itemContext(collection, item);
  const localized = translation(item, locale, context);
  return {
    id: requiredString(item.id, context, 'id'),
    slug: requiredString(localized.slug, context, 'slug'),
    name: requiredString(localized.name, context, 'name'),
    description: optionalString(localized.description),
  };
};

export const mapApplication = (
  value: unknown,
  locale: Locale,
): LocalizedTaxonomyOption => mapTaxonomyOption(value, locale, 'applications');

export const mapAudienceChannel = (
  value: unknown,
  locale: Locale,
): LocalizedTaxonomyOption => mapTaxonomyOption(value, locale, 'audience_channels');

const mappedJunctions = <T>(
  value: unknown,
  context: string,
  relationField: string,
  mapper: (related: unknown) => T,
): T[] => array(value, `${context}.${relationField}`).map((junctionValue) => {
  const junction = record(junctionValue, `${context}.${relationField}`);
  return mapper(expandedRelation(junction[relationField], context, relationField));
});

const orderedBenefits = (value: unknown, context: string): string[] => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new CmsDataError(context, 'benefits must be a non-empty ordered string array');
  }
  return value.map((benefit, index) =>
    requiredString(benefit, context, `benefits[${index}]`));
};

export const mapProduct = (
  value: unknown,
  locale: Locale,
  directusUrl: string,
): Product => {
  const item = record(value, 'products');
  const context = itemContext('products', item);
  const localized = translation(item, locale, context);
  const applicationOptions = mappedJunctions(
    item.applications,
    context,
    'applications_id',
    (related) => mapApplication(related, locale),
  );
  const audienceChannelOptions = mappedJunctions(
    item.audience_channels,
    context,
    'audience_channels_id',
    (related) => mapAudienceChannel(related, locale),
  );
  return {
    id: requiredString(item.id, context, 'id'),
    slug: requiredString(localized.slug, context, 'slug'),
    name: requiredString(localized.name, context, 'name'),
    description: optionalString(localized.description),
    image: mapImageAsset(item.image, localized.image_alt, directusUrl, context),
    brand: mapBrand(expandedRelation(item.brand, context, 'brand'), locale, directusUrl),
    categories: mappedJunctions(
      item.categories,
      context,
      'categories_id',
      (related) => mapCategory(related, locale, directusUrl),
    ),
    origin: optionalString(localized.origin),
    applications: applicationOptions.map(({ id }) => id),
    audienceChannels: audienceChannelOptions.map(({ id }) => id),
    applicationOptions,
    audienceChannelOptions,
    packFormat: optionalString(localized.pack_format),
    storage: {
      label: optionalString(localized.storage_label),
      temperature: optionalString(localized.storage_temperature),
    },
    benefits: orderedBenefits(localized.benefits, context),
    featured: item.featured === true,
    counterpart: counterpart(item, locale, context),
  };
};

export const mapPartner = (
  value: unknown,
  locale: Locale,
  directusUrl: string,
): BrandingAsset => {
  const item = record(value, 'partners');
  const context = itemContext('partners', item);
  const localized = translation(item, locale, context);
  const group = requiredString(item.group, context, 'group');
  if (!['retail', 'horeca', 'ecommerce'].includes(group)) {
    throw new CmsDataError(context, 'group is not public');
  }
  const image = mapImageAsset(item.logo, localized.logo_alt, directusUrl, context);
  return {
    id: requiredString(item.id, context, 'id'),
    ...image,
    sourceUrl: optionalString(item.source_url),
    group: group as BrandingAsset['group'],
  };
};

export const mapGlobalSettings = (
  value: unknown,
  partners: readonly unknown[],
  locale: Locale,
  directusUrl: string,
): GlobalSettings => {
  const item = record(value, 'site_settings');
  const context = itemContext('site_settings', item);
  const localized = translation(item, locale, context);
  return {
    siteName: requiredString(localized.site_name, context, 'site_name'),
    siteDescription: requiredString(
      localized.site_description,
      context,
      'site_description',
    ),
    store: {
      address: optionalString(localized.address),
      email: optionalString(item.email),
      phone: optionalString(item.phone),
      footerCopy: optionalString(localized.footer_copy),
    },
    partners: partners.map((partner) => mapPartner(partner, locale, directusUrl)),
  };
};

export const mapFeaturedContent = (
  value: unknown,
  locale: Locale,
  directusUrl: string,
): FeaturedContent => {
  const item = record(value, 'home_page');
  const context = itemContext('home_page', item);
  const localized = translation(item, locale, context);
  return {
    hero: {
      eyebrow: optionalString(localized.hero_eyebrow),
      title: optionalString(localized.hero_title),
      body: optionalString(localized.hero_body),
      product: mapProduct(
        expandedRelation(item.featured_product, context, 'featured_product'),
        locale,
        directusUrl,
      ),
      image: mapImageAsset(
        item.hero_image,
        localized.hero_image_alt,
        directusUrl,
        `${context}.hero_image`,
      ),
    },
    editorial: {
      title: optionalString(localized.editorial_title),
      body: optionalString(localized.editorial_body),
      image: mapImageAsset(
        item.editorial_image,
        localized.editorial_image_alt,
        directusUrl,
        `${context}.editorial_image`,
      ),
    },
  };
};

export const mapBlogPost = (
  value: unknown,
  locale: Locale,
  directusUrl: string,
): BlogPost => {
  const item = record(value, 'blog_posts');
  const context = itemContext('blog_posts', item);
  const localized = translation(item, locale, context);
  return {
    id: requiredString(item.id, context, 'id'),
    slug: requiredString(localized.slug, context, 'slug'),
    title: requiredString(localized.title, context, 'title'),
    excerpt: requiredString(localized.excerpt, context, 'excerpt'),
    publishedAt: requiredString(item.published_at, context, 'published_at'),
    readingMinutes: requiredNumber(item.reading_minutes, context, 'reading_minutes'),
    category: optionalString(localized.category),
    image: mapImageAsset(item.image, localized.image_alt, directusUrl, context),
    bodyHtml: sanitizeBlogHtml(requiredString(localized.body, context, 'body')),
    counterpart: counterpart(item, locale, context),
  };
};

export const mapRecipe = (
  value: unknown,
  locale: Locale,
  directusUrl: string,
): Recipe => {
  const item = record(value, 'recipes');
  const context = itemContext('recipes', item);
  const localized = translation(item, locale, context);
  return {
    id: requiredString(item.id, context, 'id'),
    slug: requiredString(localized.slug, context, 'slug'),
    title: requiredString(localized.title, context, 'title'),
    excerpt: requiredString(localized.excerpt, context, 'excerpt'),
    publishedAt: requiredString(item.published_at, context, 'published_at'),
    readingMinutes: requiredNumber(item.reading_minutes, context, 'reading_minutes'),
    category: optionalString(localized.category),
    image: mapImageAsset(item.image, localized.image_alt, directusUrl, context),
    bodyHtml: sanitizeBlogHtml(requiredString(localized.body, context, 'body')),
    counterpart: counterpart(item, locale, context),
  };
};
