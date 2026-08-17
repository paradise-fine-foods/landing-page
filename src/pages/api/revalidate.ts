import type { APIRoute } from 'astro';
import { getRuntimeEnv, type RuntimeEnv } from '@/lib/runtime/env';

export type RevalidateRuntimeEnv = RuntimeEnv;

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

const textEncoder = new TextEncoder();

function methodNotAllowed() {
  return new Response('Method not allowed', {
    status: 405,
    headers: {
      'Allow': 'POST',
      'Cache-Control': 'no-store',
    },
  });
}

function unavailable() {
  return new Response('Revalidation unavailable', {
    status: 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function unauthorized() {
  return new Response('Unauthorized', {
    status: 401,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function purgeFailed() {
  return new Response('Cache purge failed', {
    status: 502,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function bearerSecret(request: Request) {
  const authorization = request.headers.get('Authorization');
  return authorization?.match(/^Bearer (.+)$/i)?.[1] ?? '';
}

export function secretsMatch(actual: string, expected: string) {
  const actualBytes = textEncoder.encode(actual);
  const expectedBytes = textEncoder.encode(expected);
  const length = Math.max(actualBytes.length, expectedBytes.length);
  let difference = actualBytes.length ^ expectedBytes.length;

  for (let index = 0; index < length; index += 1) {
    difference |= (actualBytes[index] ?? 0) ^ (expectedBytes[index] ?? 0);
  }

  return difference === 0;
}

function configured(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

async function cloudflareAccepted(response: Response) {
  if (!response.ok) {
    return false;
  }

  try {
    const payload = await response.json() as { success?: unknown };
    return payload.success === true;
  } catch {
    return false;
  }
}

export async function handleRevalidate(
  request: Request,
  env: RevalidateRuntimeEnv,
  fetcher: Fetcher,
) {
  if (request.method !== 'POST') {
    return methodNotAllowed();
  }

  if (!configured(env.CMS_REVALIDATE_SECRET)) {
    return unavailable();
  }

  if (!secretsMatch(bearerSecret(request), env.CMS_REVALIDATE_SECRET)) {
    return unauthorized();
  }

  if (
    !configured(env.CLOUDFLARE_ZONE_ID)
    || !configured(env.CLOUDFLARE_PURGE_TOKEN)
  ) {
    return unavailable();
  }

  let response: Response;
  try {
    response = await fetcher(
      `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(env.CLOUDFLARE_ZONE_ID)}/purge_cache`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.CLOUDFLARE_PURGE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ purge_everything: true }),
      },
    );
  } catch {
    return purgeFailed();
  }

  if (!await cloudflareAccepted(response)) {
    return purgeFailed();
  }

  return new Response(null, {
    status: 204,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export const POST: APIRoute = async ({ request }) =>
  handleRevalidate(request, await getRuntimeEnv(), fetch);

export const ALL: APIRoute = async () => methodNotAllowed();
