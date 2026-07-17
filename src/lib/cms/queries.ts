import type { Locale } from '../i18n/types';
import { filterProducts } from '../catalog/filter-products';
import {
  demoBrands,
  demoBrandingAssets,
  demoCategories,
  demoFeaturedContent,
  demoGlobalSettings,
  demoProducts,
  type DemoBrand,
  type DemoCategory,
  type DemoProduct,
} from './demo-data';
import type {
  Brand,
  BrandAccent,
  Category,
  FeaturedContent,
  GlobalSettings,
  BrandingAsset,
  ImageAsset,
  Product,
  ProductQuery,
} from './types';
import { brandAccentTokens } from './types';
export { submitEnquiry } from '../enquiry/submit';
export { EnquiryValidationError } from '../enquiry/types';
export type { EnquiryErrors, EnquiryInput, EnquirySuccess } from '../enquiry/types';

type DemoImage = DemoProduct['image'];

const defaultBrandAccent: BrandAccent = 'butter';

export const normalizeBrandAccent = (value: unknown): BrandAccent =>
  typeof value === 'string' && brandAccentTokens.includes(value as BrandAccent)
    ? value as BrandAccent
    : defaultBrandAccent;

const localizeImage = (image: DemoImage, locale: Locale): ImageAsset => ({
  src: image.src,
  width: image.width,
  height: image.height,
  alt: image.alt[locale],
});

const localizeCategory = (category: DemoCategory, locale: Locale): Category => ({
  id: category.id,
  slug: category.slug[locale],
  name: category.name[locale],
  description: category.description[locale],
  image: localizeImage(category.image, locale),
});

const localizeBrand = (brand: DemoBrand, locale: Locale): Brand => ({
  id: brand.id,
  slug: brand.slug[locale],
  name: brand.name[locale],
  description: brand.description[locale],
  origin: brand.origin[locale],
  image: localizeImage(brand.image, locale),
  accent: normalizeBrandAccent(brand.accent),
});

const localizeProduct = (product: DemoProduct, locale: Locale): Product => {
  const brand = demoBrands.find((item) => item.id === product.brandId);
  const categories = product.categoryIds.map((categoryId) =>
    demoCategories.find((item) => item.id === categoryId),
  );

  if (!brand || categories.some((category) => !category)) {
    throw new Error(`Invalid demo catalog references for product: ${product.id}`);
  }

  return {
    id: product.id,
    slug: product.slug[locale],
    name: product.name[locale],
    description: product.description[locale],
    image: localizeImage(product.image, locale),
    brand: localizeBrand(brand, locale),
    categories: categories.map((category) => localizeCategory(category!, locale)),
    origin: product.origin[locale],
    applications: [...product.applications],
    audienceChannels: [...product.audienceChannels],
    packFormat: product.packFormat[locale],
    storage: {
      label: product.storage.label[locale],
      temperature: product.storage.temperature,
    },
    benefits: [...product.benefits[locale]],
    featured: product.featured,
    demo: true,
  };
};

export const getGlobalSettings = async (locale: Locale): Promise<GlobalSettings> => ({
  siteName: demoGlobalSettings.siteName[locale],
  siteDescription: demoGlobalSettings.siteDescription[locale],
  demoNotice: demoGlobalSettings.demoNotice[locale],
  partners: demoBrandingAssets.map((asset): BrandingAsset => ({
    id: asset.id,
    src: asset.src,
    width: asset.width,
    height: asset.height,
    alt: asset.alt[locale],
    sourceUrl: asset.sourceUrl,
    group: asset.group,
  })),
});

export const getCategories = async (locale: Locale): Promise<Category[]> =>
  demoCategories.map((category) => localizeCategory(category, locale));

export const getProducts = async (
  locale: Locale,
  query: ProductQuery = {},
): Promise<Product[]> =>
  filterProducts(
    demoProducts.map((product) => localizeProduct(product, locale)),
    query,
  );

export const getProductBySlug = async (
  locale: Locale,
  slug: string,
): Promise<Product | undefined> => {
  const product = demoProducts.find((item) => item.slug[locale] === slug);
  return product ? localizeProduct(product, locale) : undefined;
};

export const getBrands = async (locale: Locale): Promise<Brand[]> =>
  demoBrands.map((brand) => localizeBrand(brand, locale));

export const getBrandBySlug = async (
  locale: Locale,
  slug: string,
): Promise<Brand | undefined> => {
  const brand = demoBrands.find((item) => item.slug[locale] === slug);
  return brand ? localizeBrand(brand, locale) : undefined;
};

export const getFeaturedContent = async (locale: Locale): Promise<FeaturedContent> => {
  const heroProduct = demoProducts.find(
    (product) => product.id === demoFeaturedContent.hero.productId,
  );

  if (!heroProduct) {
    throw new Error('Invalid featured product reference');
  }

  const heroImage = localizeImage(demoFeaturedContent.hero.image, locale);
  const featuredProduct = localizeProduct(heroProduct, locale);
  featuredProduct.image = heroImage;

  return {
    hero: {
      eyebrow: demoFeaturedContent.hero.eyebrow[locale],
      title: demoFeaturedContent.hero.title[locale],
      body: demoFeaturedContent.hero.body[locale],
      product: featuredProduct,
      image: heroImage,
    },
    editorial: {
      title: demoFeaturedContent.editorial.title[locale],
      body: demoFeaturedContent.editorial.body[locale],
      image: localizeImage(demoFeaturedContent.editorial.image, locale),
    },
  };
};
