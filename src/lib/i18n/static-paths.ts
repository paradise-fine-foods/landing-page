import { locales, type Locale } from '@/lib/i18n/types';

export const getLocaleStaticPaths = (): Array<{
  params: { locale: Locale };
  props: { locale: Locale };
}> => locales.map((locale) => ({
  params: { locale },
  props: { locale },
}));

export const counterpartLocale = (locale: Locale): Locale =>
  locale === 'en' ? 'vi' : 'en';
