import type { MiddlewareHandler } from 'astro';
import { withRuntimeCache } from '@/lib/runtime/cache';
import { defaultLocale } from '@/lib/i18n/types';
import {
  localizedRedirectLocation,
  shouldRedirectToLocale,
} from '@/lib/i18n/request-locale';

export const onRequest: MiddlewareHandler = async ({ request }, next) => {
  if (shouldRedirectToLocale(request)) {
    const location = localizedRedirectLocation(new URL(request.url), defaultLocale);

    return new Response(null, {
      status: 302,
      headers: {
        'Location': location,
        'Cache-Control': 'no-store',
      },
    });
  }

  return withRuntimeCache(request, next);
};
