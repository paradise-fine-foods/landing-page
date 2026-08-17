import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';
import {
  handleEnquiry,
  type EnquiryRuntimeEnv,
} from '../src/pages/api/enquiry';

const runtimeEnv: EnquiryRuntimeEnv = {
  DIRECTUS_URL: 'https://cms.example.com/',
  FORM_SUBMISSION_SECRET: 'correct-secret',
  CMS_REVALIDATE_SECRET: 'revalidate-secret',
  CLOUDFLARE_ZONE_ID: 'zone-id',
  CLOUDFLARE_PURGE_TOKEN: 'purge-token',
};

const validInput = {
  locale: 'en',
  mode: 'general',
  name: 'Linh Nguyen',
  company: 'Atelier',
  email: 'linh@example.com',
  phone: '0900',
  interest: 'retail',
  message: 'Details please',
  consent: true,
};

const request = (method: string, body?: unknown) =>
  new Request('https://paradisefinefoods.com/api/enquiry', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

describe('enquiry proxy endpoint', () => {
  test('declares runtime contracts without secret defaults', async () => {
    const envTypes = await readFile(new URL('../src/env.d.ts', import.meta.url), 'utf8');
    for (const name of ['FORM_SUBMISSION_SECRET']) {
      expect(envTypes).toContain(`readonly ${name}: string;`);
      expect(envTypes).not.toMatch(new RegExp(`${name}\\s*=`));
    }
  });

  test('rejects non-POST methods without forwarding', async () => {
    const calls: unknown[] = [];
    const response = await handleEnquiry(
      request('GET'),
      runtimeEnv,
      async (...args) => { calls.push(args); return new Response(); },
    );
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
    expect(calls).toEqual([]);
  });

  test('forwards a valid submission to the Directus endpoint with the secret', async () => {
    const calls: Array<{ input: string; init?: RequestInit }> = [];
    const response = await handleEnquiry(
      request('POST', validInput),
      runtimeEnv,
      async (input, init) => {
        calls.push({ input: String(input), init });
        return Response.json({ ok: true, reference: 'PFF-ABC123' });
      },
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, reference: 'PFF-ABC123' });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.input).toBe('https://cms.example.com/form-submissions');
    expect(new Headers(calls[0]?.init?.headers).get('Authorization')).toBe('Bearer correct-secret');
    expect(calls[0]?.init?.method).toBe('POST');
    expect(JSON.parse(String(calls[0]?.init?.body))).toMatchObject({ email: 'linh@example.com' });
  });

  test('returns 400 when validation fails without forwarding', async () => {
    const calls: unknown[] = [];
    const response = await handleEnquiry(
      request('POST', { ...validInput, email: 'bad' }),
      runtimeEnv,
      async (...args) => { calls.push(args); return new Response(); },
    );
    expect(response.status).toBe(400);
    expect(calls).toEqual([]);
  });

  test('fails closed when configuration is missing or upstream fails', async () => {
    const missing = await handleEnquiry(
      request('POST', validInput),
      { ...runtimeEnv, FORM_SUBMISSION_SECRET: '' },
      async () => Response.json({ ok: true, reference: 'PFF-1' }),
    );
    expect(missing.status).toBe(503);

    const upstreamDown = await handleEnquiry(
      request('POST', validInput),
      runtimeEnv,
      async () => new Response(null, { status: 502 }),
    );
    expect(upstreamDown.status).toBe(502);

    const networkError = await handleEnquiry(
      request('POST', validInput),
      runtimeEnv,
      async () => { throw new Error('unreachable'); },
    );
    expect(networkError.status).toBe(503);
  });
});
