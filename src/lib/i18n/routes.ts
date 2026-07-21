import type { Locale, RouteKey } from './types';

export const routeSegments: Record<Locale, Record<RouteKey, string>> = {
  en: { home: '', products: 'products', brands: 'brands', blogs: 'blogs', contact: 'contact', customerContact: 'contact/customer', supplierContact: 'contact/supplier' },
  vi: { home: '', products: 'products', brands: 'brands', blogs: 'blogs', contact: 'contact', customerContact: 'contact/customer', supplierContact: 'contact/supplier' },
};

export type CounterpartMap = Record<Locale, string>;

export const localizedPath = (locale: Locale, route: RouteKey): string => {
  const segment = routeSegments[locale][route];
  return `/${locale}/${segment ? `${segment}/` : ''}`;
};

export const counterpartPath = (
  pathname: string,
  targetLocale: Locale,
  maps: readonly CounterpartMap[],
): string => maps.find((map) => Object.values(map).includes(pathname))?.[targetLocale]
  ?? localizedPath(targetLocale, 'home');
