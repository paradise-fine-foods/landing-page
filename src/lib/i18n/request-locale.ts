import { isLocale, type Locale } from '@/lib/i18n/types';

export function shouldRedirectToLocale(request: Request): boolean {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;

  const { pathname } = new URL(request.url);
  const firstSegment = pathname.split('/').filter(Boolean)[0] ?? '';
  if (isLocale(firstSegment)) return false;
  if (/^[a-z]{2}(?:-[a-z]{2})?$/i.test(firstSegment)) return false;

  if (
    pathname === '/_astro'
    || pathname.startsWith('/_astro/')
    || pathname === '/_server-islands'
    || pathname.startsWith('/_server-islands/')
    || pathname === '/_image'
    || pathname.startsWith('/_image/')
    || pathname === '/api'
    || pathname.startsWith('/api/')
    || pathname === '/404'
    || pathname === '/404/'
    || pathname === '/503'
    || pathname === '/503/'
  ) return false;

  const lastSegment = pathname.split('/').filter(Boolean).at(-1) ?? '';
  return !lastSegment.includes('.');
}

export function localizedRedirectLocation(url: URL, locale: Locale): string {
  return `/${locale}${url.pathname}${url.search}`;
}
