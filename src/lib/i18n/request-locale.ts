import { defaultLocale, isLocale, type Locale } from './types';

export function preferredLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const preferences = acceptLanguage
    .split(',')
    .map((entry, index) => {
      const [languageRange = '', ...parameters] = entry.trim().split(';');
      const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith('q='));
      const parsedQuality = qualityParameter
        ? Number.parseFloat(qualityParameter.trim().slice(2))
        : 1;
      const quality = Number.isFinite(parsedQuality) ? parsedQuality : 0;
      const language = languageRange.toLowerCase().split('-')[0] ?? '';

      return { index, language, quality };
    })
    .filter(({ language, quality }) => quality > 0 && isLocale(language))
    .sort((left, right) => right.quality - left.quality || left.index - right.index);

  return (preferences[0]?.language as Locale | undefined) ?? defaultLocale;
}

export function shouldRedirectToLocale(request: Request): boolean {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;

  const { pathname } = new URL(request.url);
  const firstSegment = pathname.split('/').filter(Boolean)[0] ?? '';
  if (isLocale(firstSegment)) return false;

  if (
    pathname === '/_astro'
    || pathname.startsWith('/_astro/')
    || pathname === '/_image'
    || pathname.startsWith('/_image/')
    || pathname === '/api'
    || pathname.startsWith('/api/')
  ) return false;

  const lastSegment = pathname.split('/').filter(Boolean).at(-1) ?? '';
  return !lastSegment.includes('.');
}

export function localizedRedirectLocation(url: URL, locale: Locale): string {
  return `/${locale}${url.pathname}${url.search}`;
}
