import { normalizeCatalogText } from './filter-products';

export interface CatalogFilterRecord {
  id: string;
  search: string;
  categories: readonly string[];
  brand: string;
  applications: readonly string[];
}

export interface CatalogFilterValues {
  search?: string;
  category?: string;
  brand?: string;
  application?: string;
}

export interface CatalogState {
  visibleIds: string[];
  count: number;
  empty: boolean;
}

export const deriveCatalogState = (
  records: readonly CatalogFilterRecord[],
  values: CatalogFilterValues,
): CatalogState => {
  const search = normalizeCatalogText(values.search?.trim() ?? '');
  const visibleIds = records
    .filter((record) => {
      const matchesSearch = !search || normalizeCatalogText(record.search).includes(search);
      const matchesCategory = !values.category || record.categories.includes(values.category);
      const matchesBrand = !values.brand || record.brand === values.brand;
      const matchesApplication = !values.application || record.applications.includes(values.application);

      return matchesSearch && matchesCategory && matchesBrand && matchesApplication;
    })
    .map(({ id }) => id);

  return { visibleIds, count: visibleIds.length, empty: visibleIds.length === 0 };
};
