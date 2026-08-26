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
  GOOGLE_SERVICE_ACCOUNT_EMAIL: 'sheet-service-account@example.iam.gserviceaccount.com',
  GOOGLE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----',
  GOOGLE_SHEET_ID: 'spreadsheet-id',
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
    for (const name of ['FORM_SUBMISSION_SECRET', 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_SHEET_ID']) {
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
      async () => 'unused-token',
    );
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
    expect(calls).toEqual([]);
  });

  test('appends a valid submission to Google Sheets', async () => {
    const calls: Array<{ input: string; init?: RequestInit }> = [];
    const response = await handleEnquiry(
      request('POST', validInput),
      runtimeEnv,
      async (input, init) => {
        calls.push({ input: String(input), init });
        return Response.json({ spreadsheetId: 'spreadsheet-id', updates: { updatedRows: 1 } });
      },
      async () => 'google-access-token',
    );
    expect(response.status).toBe(200);
    const payload = await response.json() as { ok: true; reference: string };
    expect(payload.ok).toBe(true);
    expect(payload.reference).toMatch(/^PFF-[A-Z0-9]{8}$/);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.input).toBe('https://sheets.googleapis.com/v4/spreadsheets/spreadsheet-id/values/General%20Enquiries!A%3AL:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS');
    expect(new Headers(calls[0]?.init?.headers).get('Authorization')).toBe('Bearer google-access-token');
    expect(calls[0]?.init?.method).toBe('POST');
    const body = JSON.parse(String(calls[0]?.init?.body)) as { values: string[][] };
    expect(body.values[0]).toEqual([
      payload.reference,
      'en',
      'general',
      'Linh Nguyen',
      'Atelier',
      'linh@example.com',
      '0900',
      'retail',
      'Details please',
      '',
      'TRUE',
      expect.any(String),
    ]);
  });

  test('routes customer and supplier submissions to their own sheets', async () => {
    const calls: Array<{ input: string; init?: RequestInit }> = [];
    const customer = await handleEnquiry(
      request('POST', { ...validInput, mode: 'customer', productId: 'cream-1l' }),
      runtimeEnv,
      async (input, init) => {
        calls.push({ input: String(input), init });
        return Response.json({ updates: { updatedRows: 1 } });
      },
      async () => 'google-access-token',
    );
    const supplier = await handleEnquiry(
      request('POST', {
        ...validInput,
        mode: 'supplier',
        interest: 'dairy',
        productRange: 'Cream and butter',
        temperature: '2-6 C',
      }),
      runtimeEnv,
      async (input, init) => {
        calls.push({ input: String(input), init });
        return Response.json({ updates: { updatedRows: 1 } });
      },
      async () => 'google-access-token',
    );

    expect(customer.status).toBe(200);
    expect(supplier.status).toBe(200);
    expect(calls.map(({ input }) => input)).toEqual([
      'https://sheets.googleapis.com/v4/spreadsheets/spreadsheet-id/values/Customer%20Enquiries!A%3AL:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS',
      'https://sheets.googleapis.com/v4/spreadsheets/spreadsheet-id/values/Supplier%20Enquiries!A%3AM:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS',
    ]);
    const supplierBody = JSON.parse(String(calls[1]?.init?.body)) as { values: string[][] };
    expect(supplierBody.values[0]?.slice(8, 12)).toEqual([
      'Details please',
      'Cream and butter',
      '2-6 C',
      'TRUE',
    ]);
  });

  test('returns 400 when validation fails without forwarding', async () => {
    const calls: unknown[] = [];
    const response = await handleEnquiry(
      request('POST', { ...validInput, email: 'bad' }),
      runtimeEnv,
      async (...args) => { calls.push(args); return new Response(); },
      async () => 'unused-token',
    );
    expect(response.status).toBe(400);
    expect(calls).toEqual([]);
  });

  test('fails closed when configuration is missing or upstream fails', async () => {
    const missing = await handleEnquiry(
      request('POST', validInput),
      { ...runtimeEnv, GOOGLE_SHEET_ID: '' },
      async () => Response.json({ ok: true, reference: 'PFF-1' }),
      async () => 'unused-token',
    );
    expect(missing.status).toBe(503);

    const upstreamDown = await handleEnquiry(
      request('POST', validInput),
      runtimeEnv,
      async () => new Response(null, { status: 502 }),
      async () => 'google-access-token',
    );
    expect(upstreamDown.status).toBe(502);

    const networkError = await handleEnquiry(
      request('POST', validInput),
      runtimeEnv,
      async () => { throw new Error('unreachable'); },
      async () => 'google-access-token',
    );
    expect(networkError.status).toBe(503);
  });
});
