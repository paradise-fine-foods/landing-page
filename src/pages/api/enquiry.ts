import type { APIRoute } from 'astro';
import { getRuntimeEnv, type RuntimeEnv } from '@/lib/runtime/env';
import type { EnquiryInput } from '@/lib/enquiry/types';
import { validateEnquiry } from '@/lib/enquiry/validation';

export type EnquiryRuntimeEnv = RuntimeEnv & {
  FORM_SUBMISSION_SECRET: string;
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;
  GOOGLE_SHEET_ID: string;
};

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;
type TokenProvider = (env: EnquiryRuntimeEnv, fetcher: Fetcher) => Promise<string>;

const sheetsScope = 'https://www.googleapis.com/auth/spreadsheets';
const sheetRanges = {
  general: 'General Enquiries!A:L',
  customer: 'Customer Enquiries!A:L',
  supplier: 'Supplier Enquiries!A:M',
} satisfies Record<NonNullable<EnquiryInput['mode']>, string>;

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

function base64Url(input: string | ArrayBuffer) {
  const bytes = typeof input === 'string'
    ? new TextEncoder().encode(input)
    : new Uint8Array(input);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToArrayBuffer(pem: string) {
  const normalized = pem.replace(/\\n/g, '\n');
  const body = normalized
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

async function signJwt(env: EnquiryRuntimeEnv) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: sheetsScope,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(env.GOOGLE_PRIVATE_KEY),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned),
  );
  return `${unsigned}.${base64Url(signature)}`;
}

async function getGoogleAccessToken(env: EnquiryRuntimeEnv, fetcher: Fetcher) {
  const assertion = await signJwt(env);
  const response = await fetcher('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }).toString(),
  });

  if (!response.ok) throw new Error('Google token request failed');
  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error('Google token missing');
  return payload.access_token;
}

function createReference() {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let value = '';
  for (const byte of bytes) value += alphabet[byte % alphabet.length];
  return `PFF-${value.padEnd(8, '0').slice(0, 8)}`;
}

function enquiryRow(input: EnquiryInput, reference: string) {
  const submittedAt = new Date().toISOString();
  if (input.mode === 'supplier') {
    return [
      reference,
      input.locale,
      input.mode,
      input.name,
      input.company,
      input.email,
      input.phone,
      input.interest,
      input.message,
      input.productRange ?? '',
      input.temperature ?? '',
      input.consent ? 'TRUE' : 'FALSE',
      submittedAt,
    ];
  }

  return [
    reference,
    input.locale,
    input.mode ?? 'general',
    input.name,
    input.company,
    input.email,
    input.phone,
    input.interest,
    input.message,
    input.productId ?? '',
    input.consent ? 'TRUE' : 'FALSE',
    submittedAt,
  ];
}

export async function handleEnquiry(
  request: Request,
  env: EnquiryRuntimeEnv,
  fetcher: Fetcher,
  tokenProvider: TokenProvider = getGoogleAccessToken,
) {
  if (request.method !== 'POST') return methodNotAllowed();

  if (
    !configured(env.GOOGLE_SERVICE_ACCOUNT_EMAIL)
    || !configured(env.GOOGLE_PRIVATE_KEY)
    || !configured(env.GOOGLE_SHEET_ID)
  ) {
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

  const reference = createReference();
  let response: Response;
  try {
    const accessToken = await tokenProvider(env, fetcher);
    const mode = validation.value.mode ?? 'general';
    const range = encodeURIComponent(sheetRanges[mode]);
    response = await fetcher(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(env.GOOGLE_SHEET_ID)}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [enquiryRow(validation.value, reference)] }),
    });
  } catch {
    return unavailable();
  }

  if (!response.ok) {
    if (response.status === 400) return invalid('Invalid submission.');
    return upstreamFailed();
  }

  return Response.json(
    { ok: true, reference },
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
