#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

import { classifyCapabilities, redactEvidence } from './release-gates.mjs';

const live = process.argv.includes('--live');
const json = process.argv.includes('--json');
const secrets = [process.env.CMS_REVALIDATE_SECRET, process.env.CLOUDFLARE_PURGE_TOKEN]
  .filter(Boolean);

const commandAvailable = (command, args) => {
  const result = spawnSync(command, args, { encoding: 'utf8', windowsHide: true });
  return result.status === 0;
};

const anonymousProbe = async () => {
  if (!live) return false;
  const publishedUrl = process.env.DIRECTUS_PUBLIC_PROBE_URL;
  const draftUrl = process.env.DIRECTUS_DRAFT_PROBE_URL;
  const writeUrl = process.env.DIRECTUS_WRITE_PROBE_URL;
  if (!publishedUrl || !draftUrl || !writeUrl) return false;

  const published = await fetch(publishedUrl, { headers: { Accept: 'application/json' } });
  const draft = await fetch(draftUrl, { headers: { Accept: 'application/json' } });
  const deniedWrite = await fetch(writeUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  const publishedBody = published.ok ? await published.json() : null;
  const draftBody = draft.ok ? await draft.json() : null;
  return published.status === 200
    && Array.isArray(publishedBody?.data)
    && publishedBody.data.length > 0
    && draft.status === 200
    && Array.isArray(draftBody?.data)
    && draftBody.data.length === 0
    && [401, 403].includes(deniedWrite.status);
};

const astroRevalidationPurgeProbe = async () => {
  if (!live) return false;
  const endpoint = process.env.ASTRO_REVALIDATE_URL;
  const secret = process.env.CMS_REVALIDATE_SECRET;
  if (!endpoint || !secret || !process.env.CLOUDFLARE_ZONE_ID || !process.env.CLOUDFLARE_PURGE_TOKEN) return false;
  const bad = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: 'Bearer deliberately-invalid-release-probe' },
  });
  const good = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}` },
  });
  return bad.status === 401 && good.status === 204;
};

try {
  const capabilities = {
    docker: commandAvailable('docker', ['version', '--format', '{{.Server.Version}}']),
    licensedAnonymousReads: await anonymousProbe(),
    astroRevalidationPurge: await astroRevalidationPurgeProbe(),
    playwright: commandAvailable('py', ['-3', '-c', 'import playwright']),
    lighthouse: commandAvailable('lighthouse', ['--version']),
  };
  const gates = classifyCapabilities(capabilities);
  const result = { mode: live ? 'live' : 'capability-only', gates };
  if (json) console.log(JSON.stringify(result, null, 2));
  else for (const gate of gates) console.log(`${gate.status.toUpperCase()} ${gate.id}${gate.reason ? `: ${gate.reason}` : ''}`);
  process.exitCode = gates.some(({ status }) => status === 'blocked') ? 2 : 0;
} catch (error) {
  const message = redactEvidence(error instanceof Error ? error.message : String(error), secrets);
  if (json) console.log(JSON.stringify({ mode: live ? 'live' : 'capability-only', error: message }, null, 2));
  else console.error(`FAILED deployment probes: ${message}`);
  process.exitCode = 1;
}
