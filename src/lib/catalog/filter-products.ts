import type { Product, ProductQuery } from '../cms/types';

export const normalizeCatalogText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[Đđ]/g, (letter) => (letter === 'Đ' ? 'D' : 'd'))
    .toLocaleLowerCase();

export type CatalogFilterValue = string | readonly string[];

export interface CatalogFilterInput {
  search?: string;
  category?: CatalogFilterValue;
  brand?: CatalogFilterValue;
  application?: CatalogFilterValue;
}

export interface CatalogFilterProjection {
  search: string;
  categories: readonly string[];
  brand: string;
  applications: readonly string[];
}

const selectedValues = (selected?: CatalogFilterValue) =>
  (Array.isArray(selected) ? selected : selected ? [selected] : []).filter(Boolean);

const hasAny = (values: readonly string[], selected?: CatalogFilterValue) => {
  const selections = selectedValues(selected);
  return selections.length === 0 || selections.some((selection) => values.includes(selection));
};

export const matchesCatalogFilters = (
  record: CatalogFilterProjection,
  query: CatalogFilterInput = {},
) => {
  const search = query.search?.trim();
  return (
    (!search || normalizeCatalogText(record.search).includes(normalizeCatalogText(search))) &&
    hasAny(record.categories, query.category) &&
    hasAny([record.brand], query.brand) &&
    hasAny(record.applications, query.application)
  );
};

export const buildProductSearchText = (
  product: Product,
  applicationNames: Readonly<Record<string, string>> = {},
) =>
  [
    product.name,
    product.description,
    product.brand.name,
    product.origin,
    ...product.categories.map((category) => category.name),
    ...product.applications,
    ...product.applications.map((application) => applicationNames[application]).filter(Boolean),
    ...product.benefits,
  ].join(' ');

export const filterProducts = (products: Product[], query: ProductQuery = {}): Product[] =>
  products.filter((product) =>
    matchesCatalogFilters(
      {
        search: buildProductSearchText(product),
        categories: product.categories.map((category) => category.id),
        brand: product.brand.id,
        applications: product.applications,
      },
      query,
    ),
  );
