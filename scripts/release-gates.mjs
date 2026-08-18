export const RELEASE_GATE_IDS = Object.freeze([
  'directus-static',
  'directus-clean-docker',
  'directus-schema-convergence',
  'directus-licensed-anonymous-read',
  'astro-tests',
  'astro-check',
  'astro-build-once',
  'worker-publish-after-build',
  'worker-errors-and-seo',
  'astro-revalidation-purge',
  'directus-revalidation-flow',
  'browser-matrix',
  'lighthouse',
]);

export function classifyCapabilities(capabilities) {
  const result = [];
  result.push(capabilities.docker
    ? { id: 'directus-clean-docker', status: 'ready' }
    : { id: 'directus-clean-docker', status: 'blocked', reason: 'Docker CLI or daemon unavailable' });
  result.push(capabilities.licensedAnonymousReads
    ? { id: 'directus-licensed-anonymous-read', status: 'ready' }
    : { id: 'directus-licensed-anonymous-read', status: 'blocked', reason: 'Directus filtered public permissions unavailable in this runtime' });
  result.push(capabilities.astroRevalidationPurge
    ? { id: 'astro-revalidation-purge', status: 'ready' }
    : { id: 'astro-revalidation-purge', status: 'blocked', reason: 'Astro revalidation endpoint or Cloudflare purge credentials unavailable' });
  result.push({
    id: 'directus-revalidation-flow',
    status: 'blocked',
    reason: 'Requires canonical Directus Docker integration or licensed deployment publication-trigger evidence',
  });
  result.push(capabilities.playwright
    ? { id: 'browser-matrix', status: 'ready' }
    : { id: 'browser-matrix', status: 'blocked', reason: 'Python Playwright or Chromium unavailable' });
  result.push(capabilities.lighthouse
    ? { id: 'lighthouse', status: 'ready' }
    : { id: 'lighthouse', status: 'blocked', reason: 'Lighthouse CLI unavailable' });
  return result;
}

export function redactEvidence(value, secrets) {
  return secrets
    .filter((secret) => typeof secret === 'string' && secret.length > 0)
    .sort((left, right) => right.length - left.length)
    .reduce((evidence, secret) => evidence.split(secret).join('[REDACTED]'), String(value));
}

const includesAttribute = (html, name, value) => {
  const pattern = new RegExp(`${name}\\s*=\\s*["']${value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}["']`, 'i');
  return pattern.test(html);
};

export async function verifyHtmlResponse(response, expected = {}) {
  const failures = [];
  const html = await response.clone().text();
  const expectedStatus = expected.expectedStatus ?? 200;
  if (response.status !== expectedStatus) failures.push(`expected status ${expectedStatus}, received ${response.status}`);
  if (!response.headers.get('content-type')?.toLowerCase().includes('text/html')) failures.push('response is not HTML');
  if (expected.lang && !includesAttribute(html, 'lang', expected.lang)) failures.push(`missing html lang ${expected.lang}`);
  if (expected.primaryText && !html.includes(expected.primaryText)) failures.push(`missing primary text ${expected.primaryText}`);
  if (expected.footerText && !html.includes(expected.footerText)) failures.push(`missing footer text ${expected.footerText}`);
  if (expected.canonical && !html.includes(`rel="canonical" href="${expected.canonical}"`) && !html.includes(`rel='canonical' href='${expected.canonical}'`)) failures.push(`missing canonical ${expected.canonical}`);
  if (expected.requireIslandFallback && (!includesAttribute(html, 'role', 'status') || !includesAttribute(html, 'aria-busy', 'true'))) failures.push('missing stable server-island fallback');
  if (expected.noindex && !/name\s*=\s*["']robots["'][^>]*content\s*=\s*["'][^"']*noindex/i.test(html)) failures.push('missing noindex robots metadata');
  if (expected.noindex && response.headers.get('cache-control')?.toLowerCase() !== 'no-store') failures.push('noindex error response is not no-store');
  return failures;
}

const alternate = (html, locale, href) => (
  html.includes(`rel="alternate" hreflang="${locale}" href="${href}"`)
  || html.includes(`rel='alternate' hreflang='${locale}' href='${href}'`)
);

export function verifyReciprocalSeo(englishHtml, vietnameseHtml, urls) {
  const failures = [];
  if (!englishHtml.includes(`rel="canonical" href="${urls.en}"`) && !englishHtml.includes(`rel='canonical' href='${urls.en}'`)) failures.push('English canonical is missing');
  if (!vietnameseHtml.includes(`rel="canonical" href="${urls.vi}"`) && !vietnameseHtml.includes(`rel='canonical' href='${urls.vi}'`)) failures.push('Vietnamese canonical is missing');
  if (!alternate(englishHtml, 'en', urls.en) || !alternate(englishHtml, 'vi', urls.vi)) failures.push('English alternates are not reciprocal');
  if (!alternate(vietnameseHtml, 'vi', urls.vi) || !alternate(vietnameseHtml, 'en', urls.en)) failures.push('Vietnamese alternates are not reciprocal');
  return failures;
}
