import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';
import {
  handleRevalidate,
  type RevalidateRuntimeEnv,
} from '../src/pages/api/revalidate';

const runtimeEnv: RevalidateRuntimeEnv = {
  CMS_REVALIDATE_SECRET: 'correct-secret',
  CLOUDFLARE_ZONE_ID: 'zone-id',
  CLOUDFLARE_PURGE_TOKEN: 'purge-token',
  DIRECTUS_URL: 'https://cms.example.com',
  FORM_SUBMISSION_SECRET: 'form-secret',
};

const request = (method: string, authorization?: string) =>
  new Request('https://paradisefinefoods.com/api/revalidate', {
    method,
    headers: authorization ? { Authorization: authorization } : undefined,
  });

describe('CMS revalidation endpoint', () => {
  test('declares runtime contracts and CMS dependencies without secret defaults', async () => {
    const packageJson = JSON.parse(
      await readFile(new URL('../package.json', import.meta.url), 'utf8'),
    ) as { dependencies?: Record<string, string> };
    const envTypes = await readFile(new URL('../src/env.d.ts', import.meta.url), 'utf8');

    expect(packageJson.dependencies).toHaveProperty('@directus/sdk');
    expect(packageJson.dependencies).toHaveProperty('sanitize-html');
    for (const name of [
      'DIRECTUS_URL',
      'CMS_REVALIDATE_SECRET',
      'CLOUDFLARE_ZONE_ID',
      'CLOUDFLARE_PURGE_TOKEN',
    ]) {
      expect(envTypes).toContain(`readonly ${name}: string;`);
      expect(envTypes).not.toMatch(new RegExp(`${name}\\s*=`));
    }
  });

  test('rejects non-POST methods without making a purge request', async () => {
    const calls: unknown[] = [];

    const response = await handleRevalidate(
      request('GET', 'Bearer correct-secret'),
      runtimeEnv,
      async (...args) => {
        calls.push(args);
        return new Response();
      },
    );

    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
    expect(calls).toEqual([]);
  });

  test('rejects a missing or incorrect bearer secret without leaking it', async () => {
    for (const authorization of [undefined, 'Bearer wrong-secret']) {
      const response = await handleRevalidate(
        request('POST', authorization),
        runtimeEnv,
        async () => {
          throw new Error('purge must not run');
        },
      );
      const body = await response.text();

      expect(response.status).toBe(401);
      expect(body).not.toContain(runtimeEnv.CMS_REVALIDATE_SECRET);
      expect(body).not.toContain(runtimeEnv.CLOUDFLARE_PURGE_TOKEN);
    }
  });

  test('purges the Cloudflare zone for an authenticated POST', async () => {
    const calls: Array<{ input: string; init?: RequestInit }> = [];

    const response = await handleRevalidate(
      request('POST', 'Bearer correct-secret'),
      runtimeEnv,
      async (input, init) => {
        calls.push({ input: String(input), init });
        return Response.json({ success: true });
      },
    );

    expect(response.status).toBe(204);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.input).toBe(
      'https://api.cloudflare.com/client/v4/zones/zone-id/purge_cache',
    );
    expect(new Headers(calls[0]?.init?.headers).get('Authorization')).toBe(
      'Bearer purge-token',
    );
    expect(new Headers(calls[0]?.init?.headers).get('Content-Type')).toBe(
      'application/json',
    );
    expect(calls[0]?.init?.method).toBe('POST');
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({
      purge_everything: true,
    });
  });

  test('fails closed when runtime configuration or Cloudflare purge fails', async () => {
    const missing = await handleRevalidate(
      request('POST', 'Bearer correct-secret'),
      { ...runtimeEnv, CLOUDFLARE_ZONE_ID: '' },
      async () => Response.json({ success: true }),
    );
    const failedPurge = await handleRevalidate(
      request('POST', 'Bearer correct-secret'),
      runtimeEnv,
      async () => Response.json({ success: false }, { status: 500 }),
    );
    const unavailablePurge = await handleRevalidate(
      request('POST', 'Bearer correct-secret'),
      runtimeEnv,
      async () => {
        throw new Error('network unavailable');
      },
    );

    expect(missing.status).toBe(503);
    expect(await missing.text()).not.toContain(runtimeEnv.CMS_REVALIDATE_SECRET);
    expect(failedPurge.status).toBe(502);
    expect(await failedPurge.text()).not.toContain(runtimeEnv.CLOUDFLARE_PURGE_TOKEN);
    expect(unavailablePurge.status).toBe(502);
    expect(await unavailablePurge.text()).not.toContain(runtimeEnv.CLOUDFLARE_PURGE_TOKEN);
  });
});
