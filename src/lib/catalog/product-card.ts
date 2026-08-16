import type { Product } from '../cms/types';

export const getProductCardMetadata = (
  product: Pick<Product, 'categories' | 'applications' | 'applicationOptions'>,
) =>
  [
    product.categories[0]?.name,
    product.applicationOptions.find(({ id }) => id === product.applications[0])?.name,
  ].filter((value): value is string => Boolean(value?.trim()));
