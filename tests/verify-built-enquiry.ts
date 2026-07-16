import { getProducts } from '../src/lib/cms/queries';

const pages = [
  { locale: 'en' as const, file: 'dist/en/contact/index.html', path: '/en/contact/' },
  { locale: 'vi' as const, file: 'dist/vi/lien-he/index.html', path: '/vi/lien-he/' },
];

for (const page of pages) {
  const html = await Bun.file(page.file).text();
  const productIds = (await getProducts(page.locale)).map(({ id }) => id);

  if (!html.includes(`<html lang="${page.locale}">`)) throw new Error(`${page.file}: missing locale lang`);
  if (!html.includes(`rel="canonical" href="https://demo.paradisefinefoods.com${page.path}"`)) throw new Error(`${page.file}: missing canonical`);
  if (!html.includes('hreflang="en"') || !html.includes('hreflang="vi"')) throw new Error(`${page.file}: missing reciprocal alternates`);
  if (!html.includes('data-enquiry-form') || !html.includes('novalidate')) throw new Error(`${page.file}: missing enhanced form contract`);
  if (!html.includes('role="status"') || !html.includes('aria-live="polite"')) throw new Error(`${page.file}: missing live status`);

  for (const field of ['name', 'email', 'interest', 'message', 'consent']) {
    if (!html.includes(`id="enquiry-${field}"`)) throw new Error(`${page.file}: missing ${field} control`);
    if (!html.includes(`id="enquiry-${field}-error"`)) throw new Error(`${page.file}: missing ${field} error`);
    if (!html.includes(`enquiry-${field}-error`)) throw new Error(`${page.file}: missing ${field} error relationship`);
  }
  for (const productId of productIds) {
    if (!html.includes(`value="${productId}"`)) throw new Error(`${page.file}: missing product ${productId}`);
  }

  const formTag = html.match(/<form\b[^>]*data-enquiry-form[^>]*>/i)?.[0];
  if (!formTag) throw new Error(`${page.file}: missing enquiry form`);
  if (/\baction\s*=/i.test(formTag)) throw new Error(`${page.file}: must not expose an explicit delivery endpoint`);
  const submitTags = [...html.matchAll(/<button\b[^>]*type="submit"[^>]*>/gi)].map(([tag]) => tag);
  if (submitTags.length !== 1 || submitTags.some((tag) => !/\bdisabled(?:\s|>|=)/i.test(tag))) {
    throw new Error(`${page.file}: server-rendered submission must remain inert until enhancement initializes`);
  }
  if (/\b(?:undefined|file:\/\/\/)|(?:src|href)="[^"]*src\/assets/i.test(html)) throw new Error(`${page.file}: contains invalid generated output`);
  if (/demo-data|mailto:|fetch\s*\(/i.test(html)) throw new Error(`${page.file}: leaks fixtures or an external delivery mechanism`);
}

console.log('Verified bilingual built enquiry pages, accessibility relationships, product options, and demo-only delivery.');
