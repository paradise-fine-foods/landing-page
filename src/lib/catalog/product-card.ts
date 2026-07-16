import type { Product } from '../cms/types';

export const getProductCardMetadata = (
  product: Pick<Product, 'categories' | 'applications'>,
  applicationNames: Readonly<Record<string, string>>,
) =>
  [
    product.categories[0]?.name,
    product.applications[0] ? applicationNames[product.applications[0]] : undefined,
  ].filter((value): value is string => Boolean(value?.trim()));
