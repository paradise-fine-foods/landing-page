import type { Product, ProductQuery } from '../cms/types';

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();

const hasAny = (values: string[], selected?: string[]) =>
  !selected?.length || selected.some((selection) => values.includes(selection));

export const filterProducts = (products: Product[], query: ProductQuery = {}): Product[] => {
  const search = query.search?.trim();

  return products.filter((product) => {
    const searchable = [
      product.name,
      product.description,
      product.brand.name,
      product.origin,
      ...product.categories.map((category) => category.name),
      ...product.applications,
      ...product.benefits,
    ];

    const matchesSearch =
      !search || normalize(searchable.join(' ')).includes(normalize(search));
    const matchesCategory = hasAny(
      product.categories.map((category) => category.id),
      query.category,
    );
    const matchesBrand = hasAny([product.brand.id], query.brand);
    const matchesApplication = hasAny(product.applications, query.application);

    return matchesSearch && matchesCategory && matchesBrand && matchesApplication;
  });
};
