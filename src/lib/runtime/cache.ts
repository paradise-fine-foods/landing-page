export const CACHE_TTL_SECONDS = 3_600;
export const CACHE_STALE_SECONDS = 86_400;
export const BROWSER_CACHE_CONTROL = 'public, max-age=0';
export const EDGE_CACHE_CONTROL =
  `public, max-age=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_STALE_SECONDS}`;

export interface RuntimeCache {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
}

type RenderNext = () => Promise<Response>;

const previewParameters = ['preview', 'draft', '__preview'];

function isPagePath(pathname: string) {
  if (pathname === '/') {
    return true;
  }

  const lastSegment = pathname.split('/').filter(Boolean).at(-1);
  return !lastSegment?.includes('.');
}

function isServerIsland(pathname: string) {
  return pathname.startsWith('/_server-islands/');
}

function hasPreviewParameter(url: URL) {
  return previewParameters.some((parameter) => url.searchParams.has(parameter));
}

function cacheKey(request: Request) {
  return new Request(request.url, {
    method: 'GET',
    headers: request.headers,
  });
}

function withBrowserCacheHeaders(response: Response) {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', BROWSER_CACHE_CONTROL);
  headers.delete('CDN-Cache-Control');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function withStoredCacheHeaders(response: Response) {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', EDGE_CACHE_CONTROL);
  headers.delete('CDN-Cache-Control');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function withNoStore(response: Response) {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-store');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function withoutBody(response: Response) {
  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export function getDefaultCache(): RuntimeCache | undefined {
  const cacheStorage = Reflect.get(globalThis, 'caches') as
    | { default?: RuntimeCache }
    | undefined;
  return cacheStorage?.default;
}

export function isCacheEligibleRequest(request: Request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return false;
  }

  if (request.headers.has('Authorization') || request.headers.has('Cookie')) {
    return false;
  }

  const url = new URL(request.url);
  if (
    url.pathname.startsWith('/api/')
    || (url.pathname.startsWith('/_') && !isServerIsland(url.pathname))
    || hasPreviewParameter(url)
  ) {
    return false;
  }

  return isServerIsland(url.pathname) || isPagePath(url.pathname);
}

export function isCacheableResponse(request: Request, response: Response) {
  if (!isCacheEligibleRequest(request) || response.status !== 200) {
    return false;
  }

  if (response.headers.has('Set-Cookie')) {
    return false;
  }

  return response.headers.get('Content-Type')?.toLowerCase().includes('text/html') === true;
}

export async function withRuntimeCache(
  request: Request,
  next: RenderNext,
  cache = getDefaultCache(),
) {
  if (!isCacheEligibleRequest(request)) {
    return next();
  }

  const key = cacheKey(request);
  const cached = await cache?.match(key);
  if (cached) {
    const browserResponse = withBrowserCacheHeaders(cached);
    return request.method === 'HEAD' ? withoutBody(browserResponse) : browserResponse;
  }

  const response = await next();
  if (!isCacheableResponse(request, response)) {
    return response.status >= 400 ? withNoStore(response) : response;
  }

  const browserResponse = withBrowserCacheHeaders(response);
  if (request.method === 'GET') {
    await cache?.put(key, withStoredCacheHeaders(browserResponse.clone()));
  }

  return browserResponse;
}
