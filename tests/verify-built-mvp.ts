export {};

const generatedHtml = Array.from(
  new Bun.Glob('**/*.html').scanSync({ cwd: 'dist', onlyFiles: true }),
);
if (generatedHtml.length < 28) {
  throw new Error(`dist: expected at least 28 generated pages, found ${generatedHtml.length}`);
}

const file = 'dist/404.html';
const html = await Bun.file(file).text();

const required = [
  '<html lang="en"',
  '<main id="main-content"',
  'id="not-found-en"',
  'This page could not be found</h1>',
  'Không tìm thấy trang này',
  'rel="canonical" href="https://paradisefinefoods.com/404.html"',
  'name="robots" content="noindex"',
  '<title>Page not found | Paradise Fine Foods</title>',
  'href="/en/"',
  'href="/en/products/"',
  'href="/vi/"',
  'href="/vi/products/"',
  'data-floating-rail',
  'href="/en/contact/customer/"',
  'href="/en/contact/supplier/"',
  'href="/en/contact/"',
];

for (const value of required) {
  if (!html.includes(value)) throw new Error(`${file}: missing ${value}`);
}

if (/<title>[^<]*[À-ỹĐđ]/u.test(html)) throw new Error(`${file}: title must remain monolingual English`);
for (const phrase of ['Chuyển đến nội dung', 'Tiếng Việt', 'Nguyên liệu tuyển chọn']) {
  if (!new RegExp(`<span lang="vi"[^>]*>${phrase}</span>`).test(html)) {
    throw new Error(`${file}: missing Vietnamese language annotation for ${phrase}`);
  }
}
const vietnameseSection = html.match(/<section lang="vi"[\s\S]*?<\/section>/)?.[0] ?? '';
for (const phrase of ['Không tìm thấy trang này', 'Địa chỉ có thể đã thay đổi', 'Trang chủ tiếng Việt', 'Xem sản phẩm tiếng Việt']) {
  if (!vietnameseSection.includes(phrase)) throw new Error(`${file}: Vietnamese section does not contain ${phrase}`);
}
const recoveryLinks = [...html.matchAll(/<a\b[^>]*class="[^"]*not-found__link[^"]*"[^>]*>/g)];
if (recoveryLinks.length !== 5) throw new Error(`${file}: expected five consistently sized recovery links`);

if (/<script\b/i.test(html)) throw new Error(`${file}: must not depend on JavaScript`);
if (/\b(?:undefined|null|file:\/\/\/)|(?:src|href)="[^"]*src\/assets/i.test(html)) {
  throw new Error(`${file}: contains invalid generated output`);
}
if (/(?:href|src)=""|href="#"/i.test(html)) throw new Error(`${file}: contains an empty or placeholder link`);

const internalUrls = [...html.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)].map(([, path]) => path);
for (const url of internalUrls) {
  const outputPath = url.endsWith('/') ? `dist${url}index.html` : `dist${url}`;
  if (!(await Bun.file(outputPath).exists())) throw new Error(`${file}: broken generated link ${url}`);
}

const stylesheetUrls = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(([, url]) => url);
const css = (await Promise.all(stylesheetUrls.map((url) => Bun.file(`dist${url}`).text()))).join('\n');
if (!/\.not-found__link[^}]*min-block-size:2\.75rem/.test(css)) {
  throw new Error(`${file}: generated recovery-link CSS does not preserve the 44px target floor`);
}
for (const decoration of ['drop', 'petal']) {
  if (!new RegExp(`<svg\\b[^>]*class="[^"]*not-found__${decoration}[^"]*"`).test(html)) {
    throw new Error(`${file}: generated ${decoration} decoration is missing its HTML class`);
  }
  if (!css.includes(`.not-found__${decoration}{`)) {
    throw new Error(`${file}: generated ${decoration} decoration CSS is not global across the OrganicMark boundary`);
  }
}

const canonicalLocalizedPages = generatedHtml
  .map((path) => ({ path, normalizedPath: path.replaceAll('\\', '/') }))
  .filter(({ normalizedPath }) => /^(?:en|vi)\//.test(normalizedPath));
if (canonicalLocalizedPages.length < 20) {
  throw new Error(`dist: expected at least 20 canonical localized pages, found ${canonicalLocalizedPages.length}`);
}

for (const { path, normalizedPath } of canonicalLocalizedPages) {
  const localizedFile = `dist/${path}`;
  const localizedHtml = await Bun.file(localizedFile).text();
  const locale = normalizedPath.startsWith('en/') ? 'en' : 'vi';
  if (localizedHtml.includes('/_image?')) {
    throw new Error(`${localizedFile}: contains a runtime image transform URL`);
  }
  for (const marker of [
    'data-floating-rail',
    'aria-controls="floating-rail-panel"',
    `href="/${locale}/contact/customer/"`,
    `href="/${locale}/contact/supplier/"`,
    `href="/${locale}/contact/"`,
  ]) {
    if (!localizedHtml.includes(marker)) throw new Error(`${localizedFile}: missing ${marker}`);
  }
}

console.log(`Verified ${generatedHtml.length} generated pages plus bilingual 404 metadata, landmarks, direct locale links, and no-JavaScript contract.`);
console.log(`Verified floating rail on ${canonicalLocalizedPages.length} canonical localized pages.`);
