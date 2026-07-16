import {
  matchesCatalogFilters,
  type CatalogFilterInput,
  type CatalogFilterProjection,
} from './filter-products';

export interface CatalogFilterRecord extends CatalogFilterProjection {
  id: string;
}

export type CatalogFilterValues = CatalogFilterInput;

export interface CatalogState {
  visibleIds: string[];
  count: number;
  empty: boolean;
}

export interface CatalogCategoryOption {
  id: string;
  slug: string;
}

export interface CatalogCategoryQueryView {
  selectCategory(id: string): void;
  update(): void;
}

export const resolveRequestedCategory = (
  candidate: string | null,
  options: readonly CatalogCategoryOption[],
): string | undefined => candidate === null
  ? undefined
  : options.find(({ slug }) => slug === candidate)?.id;

export const initializeCatalogCategory = (
  view: CatalogCategoryQueryView,
  candidate: string | null,
  options: readonly CatalogCategoryOption[],
): boolean => {
  const categoryId = resolveRequestedCategory(candidate, options);
  if (!categoryId) return false;
  view.selectCategory(categoryId);
  view.update();
  return true;
};

export const deriveCatalogState = (
  records: readonly CatalogFilterRecord[],
  values: CatalogFilterValues,
): CatalogState => {
  const visibleIds = records
    .filter((record) => matchesCatalogFilters(record, values))
    .map(({ id }) => id);

  return { visibleIds, count: visibleIds.length, empty: visibleIds.length === 0 };
};
