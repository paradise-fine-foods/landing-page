import { getProducts } from '../cms/queries';
import type { Product } from '../cms/types';
import type { Locale } from '../i18n/types';

export interface RelatedProductCriteria {
  productId: string;
  brandId: string;
  categoryIds: readonly string[];
}

export type ProductListQuery = (locale: Locale) => Promise<Product[]>;

export const selectRelatedProducts = (
  products: readonly Product[],
  criteria: RelatedProductCriteria,
  limit = 3,
): Product[] => {
  const categoryIds = new Set(criteria.categoryIds);
  return products
    .filter((candidate) => candidate.id !== criteria.productId && (
      candidate.brand.id === criteria.brandId
      || candidate.categories.some(({ id }) => categoryIds.has(id))
    ))
    .slice(0, Math.max(0, Math.floor(limit)));
};

export const loadRelatedProducts = async (
  locale: Locale,
  criteria: RelatedProductCriteria,
  query: ProductListQuery = getProducts,
): Promise<Product[]> => selectRelatedProducts(await query(locale), criteria);
