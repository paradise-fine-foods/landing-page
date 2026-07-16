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

export const deriveCatalogState = (
  records: readonly CatalogFilterRecord[],
  values: CatalogFilterValues,
): CatalogState => {
  const visibleIds = records
    .filter((record) => matchesCatalogFilters(record, values))
    .map(({ id }) => id);

  return { visibleIds, count: visibleIds.length, empty: visibleIds.length === 0 };
};
