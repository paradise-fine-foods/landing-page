export type Locale = 'en' | 'vi';

export type RouteKey = 'home' | 'products' | 'brands' | 'contact';

export const locales = ['en', 'vi'] as const;

export const isLocale = (value: string): value is Locale =>
  locales.includes(value as Locale);
