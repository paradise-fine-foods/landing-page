import type { APIRoute } from 'astro';
import { getRuntimeEnv, type RuntimeEnv } from '@/lib/runtime/env';
import type { EnquiryInput } from '@/lib/enquiry/types';
import { validateEnquiry } from '@/lib/enquiry/validation';

export type EnquiryRuntimeEnv = RuntimeEnv & {
  FORM_SUBMISSION_SECRET: string;
};

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

function methodNotAllowed() {
  return new Response('Method not allowed', {
    status: 405,
    headers: { 'Allow': 'POST', 'Cache-Control': 'no-store' },
  });
}

function invalid(message: string) {
  return new Response(message, {
    status: 400,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function unavailable() {
  return new Response('Submission unavailable', {
    status: 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function upstreamFailed() {
  return new Response('Submission failed', {
    status: 502,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function configured(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function handleEnquiry(
  request: Request,
  env: EnquiryRuntimeEnv,
  fetcher: Fetcher,
) {
  if (request.method !== 'POST') return methodNotAllowed();

  if (!configured(env.FORM_SUBMISSION_SECRET) || !configured(env.DIRECTUS_URL)) {
    return unavailable();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalid('Invalid request body.');
  }

  const validation = validateEnquiry(body as EnquiryInput);
  if (!validation.ok) return invalid('Invalid submission.');

  let response: Response;
  try {
    response = await fetcher(`${env.DIRECTUS_URL.replace(/\/$/, '')}/form-submissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.FORM_SUBMISSION_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validation.value),
    });
  } catch {
    return unavailable();
  }

  if (!response.ok) {
    if (response.status === 400) return invalid('Invalid submission.');
    return upstreamFailed();
  }

  let payload: { reference?: string };
  try {
    payload = await response.json() as { reference?: string };
  } catch {
    return upstreamFailed();
  }

  if (!payload.reference) return upstreamFailed();

  return Response.json(
    { ok: true, reference: payload.reference },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export const POST: APIRoute = async ({ request }) => {
  try {
    return await handleEnquiry(request, await getRuntimeEnv() as EnquiryRuntimeEnv, fetch);
  } catch {
    return unavailable();
  }
};

export const ALL: APIRoute = async () => methodNotAllowed();
