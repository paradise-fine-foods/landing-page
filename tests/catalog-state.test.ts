import { describe, expect, test } from 'bun:test';

import { deriveCatalogState } from '../src/lib/catalog/catalog-state';

const records = [
  {
    id: 'butter',
    search: 'Bơ lát Maison Laitière cán lớp',
    categories: ['butter'],
    brand: 'maison-laitiere',
    applications: ['lamination', 'viennoiserie'],
  },
  {
    id: 'cream',
    search: 'Whipping cream Atelier Crème desserts',
    categories: ['cream'],
    brand: 'atelier-creme',
    applications: ['whipping', 'desserts'],
  },
] as const;

describe('catalog DOM state', () => {
  test('normalizes diacritics and combines populated controls with AND semantics', () => {
    expect(
      deriveCatalogState(records, {
        search: 'bo',
        category: 'butter',
        brand: 'maison-laitiere',
        application: 'lamination',
      }),
    ).toEqual({ visibleIds: ['butter'], count: 1, empty: false });
  });

  test('reports an empty state for incompatible controls', () => {
    expect(
      deriveCatalogState(records, { search: 'cream', category: 'butter' }),
    ).toEqual({ visibleIds: [], count: 0, empty: true });
  });

  test('an empty query restores the full server-rendered catalog', () => {
    expect(deriveCatalogState(records, {})).toEqual({
      visibleIds: ['butter', 'cream'],
      count: 2,
      empty: false,
    });
  });
});
