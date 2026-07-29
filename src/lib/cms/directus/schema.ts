import type { Locale } from '../../i18n/types';

export type CmsStatus = 'draft' | 'published' | 'archived';

export interface DirectusFile {
  id: string;
  width: number | null;
  height: number | null;
  filename_download?: string | null;
  type?: string | null;
}

interface TranslationBase {
  id: string;
  languages_code: Locale;
}

interface EditorialParent {
  id: string;
  status: CmsStatus;
}

export interface SiteSettingsTranslation extends TranslationBase {
  site_name: string;
  site_description: string;
  address: string | null;
  footer_copy: string | null;
}

export interface SiteSettingsRecord extends EditorialParent {
  logo: DirectusFile | null;
  email: string | null;
  phone: string | null;
  translations: SiteSettingsTranslation[] | null;
}

export interface HomePageTranslation extends TranslationBase {
  hero_eyebrow: string | null;
  hero_title: string | null;
  hero_body: string | null;
  hero_image_alt: string | null;
  editorial_title: string | null;
  editorial_body: string | null;
  editorial_image_alt: string | null;
}

export interface HomePageRecord extends EditorialParent {
  featured_product: ProductRecord | null;
  hero_image: DirectusFile | null;
  editorial_image: DirectusFile | null;
  translations: HomePageTranslation[] | null;
}

export interface CategoryTranslation extends TranslationBase {
  name: string;
  slug: string;
  description: string | null;
  image_alt: string | null;
}

export interface CategoryRecord extends EditorialParent {
  image: DirectusFile | null;
  sort: number | null;
  translations: CategoryTranslation[] | null;
}

export interface BrandTranslation extends TranslationBase {
  name: string;
  slug: string;
  description: string | null;
  origin: string | null;
  image_alt: string | null;
}

export interface BrandRecord extends EditorialParent {
  image: DirectusFile | null;
  accent: string | null;
  sort: number | null;
  translations: BrandTranslation[] | null;
}

export interface TaxonomyTranslation extends TranslationBase {
  name: string;
  slug: string;
  description: string | null;
}

export interface ApplicationRecord extends EditorialParent {
  sort: number | null;
  translations: TaxonomyTranslation[] | null;
}

export interface AudienceChannelRecord extends EditorialParent {
  sort: number | null;
  translations: TaxonomyTranslation[] | null;
}

export interface ProductTranslation extends TranslationBase {
  name: string;
  slug: string;
  description: string | null;
  origin: string | null;
  pack_format: string | null;
  storage_label: string | null;
  storage_temperature: string | null;
  benefits: unknown;
  image_alt: string | null;
}

export interface ProductCategoryJunction {
  id: string;
  categories_id: CategoryRecord;
}

export interface ProductApplicationJunction {
  id: string;
  applications_id: ApplicationRecord;
}

export interface ProductAudienceChannelJunction {
  id: string;
  audience_channels_id: AudienceChannelRecord;
}

export interface ProductRecord extends EditorialParent {
  brand: BrandRecord;
  image: DirectusFile | null;
  featured: boolean | null;
  sort: number | null;
  translations: ProductTranslation[] | null;
  categories: ProductCategoryJunction[] | null;
  applications: ProductApplicationJunction[] | null;
  audience_channels: ProductAudienceChannelJunction[] | null;
}

export interface BlogPostTranslation extends TranslationBase {
  title: string;
  slug: string;
  excerpt: string;
  category: string | null;
  body: string;
  image_alt: string | null;
}

export interface BlogPostRecord extends EditorialParent {
  image: DirectusFile | null;
  published_at: string | null;
  reading_minutes: number | null;
  translations: BlogPostTranslation[] | null;
}

export interface PartnerTranslation extends TranslationBase {
  name: string;
  logo_alt: string;
}

export interface PartnerRecord extends EditorialParent {
  logo: DirectusFile | null;
  group: string | null;
  source_url: string | null;
  sort: number | null;
  translations: PartnerTranslation[] | null;
}

export interface DirectusSchema {
  directus_files: DirectusFile[];
  site_settings: SiteSettingsRecord[];
  site_settings_translations: SiteSettingsTranslation[];
  home_page: HomePageRecord[];
  home_page_translations: HomePageTranslation[];
  categories: CategoryRecord[];
  categories_translations: CategoryTranslation[];
  brands: BrandRecord[];
  brands_translations: BrandTranslation[];
  products: ProductRecord[];
  products_translations: ProductTranslation[];
  applications: ApplicationRecord[];
  applications_translations: TaxonomyTranslation[];
  audience_channels: AudienceChannelRecord[];
  audience_channels_translations: TaxonomyTranslation[];
  blog_posts: BlogPostRecord[];
  blog_posts_translations: BlogPostTranslation[];
  partners: PartnerRecord[];
  partners_translations: PartnerTranslation[];
  products_categories: ProductCategoryJunction[];
  products_applications: ProductApplicationJunction[];
  products_audience_channels: ProductAudienceChannelJunction[];
}
