import type { Locale } from '@/lib/i18n/types';

export const brandAccentTokens = ['butter', 'bordeaux', 'cold-chain'] as const;
export type BrandAccent = (typeof brandAccentTokens)[number];

export type LocalizedText = Record<Locale, string>;
export type LocalizedSlug = Record<Locale, string>;

export interface ImageAsset {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface BrandingAsset {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  sourceUrl: string;
  group: 'retail' | 'horeca' | 'ecommerce';
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: ImageAsset;
  counterpart?: LocalizedCounterpart;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  description: string;
  origin: string;
  image: ImageAsset;
  accent: BrandAccent;
  counterpart?: LocalizedCounterpart;
}

export interface LocalizedCounterpart {
  id: string;
  locale: Locale;
  slug: string;
}

export interface LocalizedTaxonomyOption {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export interface ProductStorage {
  label: string;
  temperature: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: ImageAsset;
  brand: Brand;
  categories: Category[];
  origin: string;
  applications: string[];
  audienceChannels: string[];
  applicationOptions: LocalizedTaxonomyOption[];
  audienceChannelOptions: LocalizedTaxonomyOption[];
  packFormat: string;
  storage: ProductStorage;
  benefits: string[];
  featured: boolean;
  counterpart?: LocalizedCounterpart;
}

export interface StoreInformation {
  address: string;
  email: string;
  phone: string;
  footerCopy: string;
}

export interface GlobalSettings {
  siteName: string;
  siteDescription: string;
  store: StoreInformation;
  partners: BrandingAsset[];
}

export interface FeaturedContent {
  hero: {
    eyebrow: string;
    title: string;
    body: string;
    product: Product;
    image: ImageAsset;
  };
  editorial: {
    title: string;
    body: string;
    image: ImageAsset;
  };
}

export interface ProductQuery {
  search?: string;
  category?: string[];
  brand?: string[];
  application?: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readingMinutes: number;
  category: string;
  image: ImageAsset;
  bodyHtml: string;
  counterpart?: LocalizedCounterpart;
}

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readingMinutes: number;
  category: string;
  image: ImageAsset;
  bodyHtml: string;
  counterpart?: LocalizedCounterpart;
}
