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
  'href="/en/"',
  'href="/en/products/"',
  'href="/vi/"',
  'href="/vi/san-pham/"',
];

for (const value of required) {
  if (!html.includes(value)) throw new Error(`${file}: missing ${value}`);
}

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

console.log('Verified generated bilingual 404 metadata, landmarks, direct locale links, and no-JavaScript contract.');
