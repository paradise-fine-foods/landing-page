import {
  localizedRedirectLocation,
  preferredLocale,
  shouldRedirectToLocale,
} from './lib/i18n/request-locale';

interface AssetsEnv {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

export default {
  async fetch(
    request: Request,
    env: AssetsEnv,
  ) {
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

    return env.ASSETS.fetch(request);
  },
};
