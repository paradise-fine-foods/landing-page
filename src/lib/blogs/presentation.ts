import type { Locale } from '../i18n/types';

const dateLocales: Record<Locale, string> = { en: 'en-GB', vi: 'vi-VN' };
export const formatBlogDate = (locale: Locale, value: string): string =>
  new Intl.DateTimeFormat(dateLocales[locale], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${value}T00:00:00Z`));
export const formatReadingTime = (template: string, minutes: number): string =>
  template.replace('{minutes}', String(minutes));
