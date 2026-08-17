import type { MiddlewareHandler } from 'astro';
import { withRuntimeCache } from '@/lib/runtime/cache';
import {
  localizedRedirectLocation,
  preferredLocale,
  shouldRedirectToLocale,
} from '@/lib/i18n/request-locale';

export const onRequest: MiddlewareHandler = async ({ request }, next) => {
  if (shouldRedirectToLocale(request)) {
    const locale = preferredLocale(request.headers.get('Accept-Language'));
    const location = localizedRedirectLocation(new URL(request.url), locale);

    return new Response(null, {
      status: 302,
      headers: {
        'Location': location,
        'Vary': 'Accept-Language',
        'Cache-Control': 'no-store',
      },
    });
  }

  return withRuntimeCache(request, next);
};
