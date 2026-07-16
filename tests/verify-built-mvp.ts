export {};

const file = 'dist/404.html';
const html = await Bun.file(file).text();

const required = [
  '<html lang="en"',
  '<main id="main-content"',
  'id="not-found-en"',
  'This page could not be found</h1>',
  'Không tìm thấy trang này',
  'rel="canonical" href="https://demo.paradisefinefoods.com/404.html"',
  'name="robots" content="noindex"',
  '<title>Page not found | Paradise Fine Foods Demo</title>',
  'href="/en/"',
  'href="/en/products/"',
  'href="/vi/"',
  'href="/vi/products/"',
];

for (const value of required) {
  if (!html.includes(value)) throw new Error(`${file}: missing ${value}`);
}

if (/<title>[^<]*[À-ỹĐđ]/u.test(html)) throw new Error(`${file}: title must remain monolingual English`);
for (const phrase of ['Chuyển đến nội dung', 'Bản duyệt khách hàng', 'Nội dung hư cấu chỉ dùng để duyệt']) {
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

console.log('Verified generated bilingual 404 metadata, landmarks, direct locale links, and no-JavaScript contract.');
