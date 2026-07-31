#!/usr/bin/env node
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { deflateSync } from 'node:zlib';

const crc32 = (data) => {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const pngChunk = (type, data) => {
  const typeBytes = Buffer.from(type, 'ascii');
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  typeBytes.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])), 8 + data.length);
  return chunk;
};

const createPng = (width, height) => {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  const pixels = Buffer.alloc(height * (1 + width * 3));
  for (let row = 0; row < height; row += 1) pixels[row * (1 + width * 3)] = 0;
  return Buffer.concat([
    Buffer.from('\x89PNG\r\n\x1a\n', 'binary'),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(pixels)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
};

const PNG = createPng(1200, 800);
const file = Object.freeze({
  id: '92000000-0000-4000-8000-000000000001',
  width: 1200,
  height: 800,
  filename_download: 'finefoods-task9-release.png',
  type: 'image/png',
});

const translated = (id, en, vi) => [
  { id: `${id}-en`, languages_code: 'en', ...en },
  { id: `${id}-vi`, languages_code: 'vi', ...vi },
];

const brand = Object.freeze({
  id: '90000000-0000-4000-8000-000000000002',
  status: 'published', image: file, accent: 'orange', sort: 1,
  translations: translated('brand',
    { name: 'Release Brand', slug: 'release-brand', description: 'Authenticated release fixture brand.', origin: 'Vietnam', image_alt: 'Release brand mark' },
    { name: 'Thương Hiệu Phát Hành', slug: 'thuong-hieu-phat-hanh', description: 'Thương hiệu kiểm thử phát hành.', origin: 'Việt Nam', image_alt: 'Nhãn hiệu phát hành' }),
});

const product = (postBuild = false) => ({
  id: postBuild ? '90000000-0000-4000-8000-000000000006' : '90000000-0000-4000-8000-000000000003',
  status: 'published', brand, image: file, featured: !postBuild, sort: postBuild ? 2 : 1,
  categories: [], applications: [], audience_channels: [],
  translations: translated(postBuild ? 'product-after' : 'product',
    postBuild
      ? { name: 'Task 9 Product After Build', slug: 'task9-product-after-build', description: 'Published after the Worker build.', origin: 'Vietnam', pack_format: '500 g', storage_label: 'Keep frozen', storage_temperature: '-18°C', benefits: ['No rebuild', 'Bilingual'], image_alt: 'Post-build Task 9 product package' }
      : { name: 'Task 9 Product', slug: 'task9-product', description: 'Published before the Worker build.', origin: 'Vietnam', pack_format: '1 kg', storage_label: 'Keep frozen', storage_temperature: '-18°C', benefits: ['Bilingual', 'Runtime published'], image_alt: 'Task 9 product package' },
    postBuild
      ? { name: 'Sản Phẩm Task 9 Sau Build', slug: 'san-pham-task9-sau-build', description: 'Được phát hành sau khi dựng Worker.', origin: 'Việt Nam', pack_format: '500 g', storage_label: 'Bảo quản đông lạnh', storage_temperature: '-18°C', benefits: ['Không dựng lại', 'Song ngữ'], image_alt: 'Bao bì sản phẩm Task 9 sau build' }
      : { name: 'Sản Phẩm Task 9', slug: 'san-pham-task9', description: 'Được phát hành trước khi dựng Worker.', origin: 'Việt Nam', pack_format: '1 kg', storage_label: 'Bảo quản đông lạnh', storage_temperature: '-18°C', benefits: ['Song ngữ', 'Xuất bản lúc chạy'], image_alt: 'Bao bì sản phẩm Task 9' }),
});

const blog = (postBuild = false) => ({
  id: postBuild ? '90000000-0000-4000-8000-000000000007' : '90000000-0000-4000-8000-000000000004',
  status: 'published', image: file, published_at: postBuild ? '2026-07-30' : '2026-07-29', reading_minutes: postBuild ? 3 : 4,
  translations: translated(postBuild ? 'blog-after' : 'blog',
    postBuild
      ? { title: 'Task 9 Blog After Build', slug: 'task9-blog-after-build', excerpt: 'Discovered by the already-built Worker.', category: 'Release', body: '<h2>No rebuild</h2><p>The existing Worker discovered this runtime publication.</p>', image_alt: 'Post-build Task 9 story' }
      : { title: 'Task 9 Baseline Story', slug: 'task9-baseline-story', excerpt: 'Published before the one-time Worker build.', category: 'Release', body: '<h2>Baseline story</h2><p>This complete bilingual story is in the initial server response.</p>', image_alt: 'Task 9 baseline story' },
    postBuild
      ? { title: 'Bài Viết Task 9 Sau Build', slug: 'bai-viet-task9-sau-build', excerpt: 'Được Worker đã dựng sẵn phát hiện.', category: 'Phát hành', body: '<h2>Không dựng lại</h2><p>Worker hiện có đã phát hiện nội dung xuất bản lúc chạy.</p>', image_alt: 'Bài viết Task 9 sau build' }
      : { title: 'Bài Viết Task 9 Ban Đầu', slug: 'bai-viet-task9-ban-dau', excerpt: 'Được phát hành trước lần dựng Worker duy nhất.', category: 'Phát hành', body: '<h2>Bài viết ban đầu</h2><p>Bài viết song ngữ hoàn chỉnh có trong phản hồi máy chủ.</p>', image_alt: 'Bài viết Task 9 ban đầu' }),
});

const baselineProduct = product();
const baselineBlog = blog();
const settings = Object.freeze({
  id: '90000000-0000-4000-8000-000000000001', status: 'published', logo: file,
  email: 'release@example.test', phone: '+84 900 000 009',
  translations: translated('settings',
    { site_name: 'Paradise Fine Foods Release', site_description: 'Bilingual release fixture', address: 'Ho Chi Minh City', footer_copy: 'Release fixture footer.' },
    { site_name: 'Thực Phẩm Paradise Phát Hành', site_description: 'Dữ liệu kiểm thử phát hành song ngữ', address: 'Thành phố Hồ Chí Minh', footer_copy: 'Chân trang kiểm thử phát hành.' }),
});
const home = Object.freeze({
  id: '90000000-0000-4000-8000-000000000005', status: 'published', featured_product: baselineProduct,
  hero_image: file, editorial_image: file,
  translations: translated('home',
    { hero_eyebrow: 'Authenticated release fixture', hero_title: 'Runtime CMS content', hero_body: 'Built once, published continuously.', hero_image_alt: 'Release fixture hero', editorial_title: 'Directus-backed publishing', editorial_body: 'Primary content arrives in server HTML.', editorial_image_alt: 'Release fixture editorial' },
    { hero_eyebrow: 'Dữ liệu phát hành xác thực', hero_title: 'Nội dung CMS lúc chạy', hero_body: 'Dựng một lần, xuất bản liên tục.', hero_image_alt: 'Ảnh chính kiểm thử phát hành', editorial_title: 'Xuất bản từ Directus', editorial_body: 'Nội dung chính có trong HTML máy chủ.', editorial_image_alt: 'Ảnh biên tập kiểm thử phát hành' }),
});

const json = (response, status, value) => {
  const body = JSON.stringify(value);
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(body) });
  response.end(body);
};

const parameterSegments = (key) => [
  key.split('[', 1)[0],
  ...Array.from(key.matchAll(/\[([^\]]+)\]/g), (match) => match[1]),
];

export const queryValues = (url, needle) => {
  const values = [];
  for (const [key, value] of url.searchParams) {
    if (parameterSegments(key).includes(needle)) values.push(value);
  }
  const filter = url.searchParams.get('filter');
  if (filter) {
    try {
      const walk = (value, path = []) => {
        if (path.includes(needle) && typeof value === 'string') values.push(value);
        if (value && typeof value === 'object') for (const [childKey, child] of Object.entries(value)) walk(child, [...path, childKey]);
      };
      walk(JSON.parse(filter));
    } catch { /* SDK bracket parameters remain covered above. */ }
  }
  return values;
};

const matchesDetail = (item, url) => {
  const slugs = queryValues(url, 'slug');
  return slugs.length === 0 || item.translations.some(({ slug }) => slugs.includes(slug));
};

const authorized = (request, secret) => request.headers['x-release-secret'] === secret;

export async function createFakeDirectusServer({ port = 0, hostname = '127.0.0.1', adminSecret }) {
  if (!adminSecret) throw new Error('Fake Directus admin secret is required');
  const state = { postBuild: false, outage: false };
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? `${hostname}:${port}`}`);
    if (request.method === 'GET' && url.pathname === '/server/health') return json(response, 200, { status: 'ok' });

    if (url.pathname.startsWith('/__test/')) {
      if (!authorized(request, adminSecret)) return json(response, 401, { error: 'Unauthorized' });
      if (request.method === 'POST' && url.pathname === '/__test/mutate') {
        state.postBuild = true;
        response.writeHead(204); response.end(); return;
      }
      if (request.method === 'POST' && url.pathname === '/__test/reset') {
        state.postBuild = false; state.outage = false;
        response.writeHead(204); response.end(); return;
      }
      if (request.method === 'POST' && url.pathname === '/__test/outage') {
        const chunks = [];
        for await (const chunk of request) chunks.push(chunk);
        const payload = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        state.outage = payload.enabled === true;
        response.writeHead(204); response.end(); return;
      }
      if (request.method === 'GET' && url.pathname === '/__test/state') return json(response, 200, { postBuild: state.postBuild, outage: state.outage });
      return json(response, 404, { error: 'Not found' });
    }

    if (url.pathname.startsWith('/assets/')) {
      response.writeHead(200, { 'content-type': 'image/png', 'content-length': PNG.length, 'cache-control': 'public, max-age=3600' });
      response.end(PNG); return;
    }
    if (!url.pathname.startsWith('/items/')) return json(response, 404, { errors: [{ message: 'Not found' }] });
    if (state.outage) return json(response, 503, { errors: [{ message: 'CMS unavailable' }] });
    if (request.method !== 'GET' && request.method !== 'HEAD') return json(response, 403, { errors: [{ message: 'Forbidden' }] });

    const collection = url.pathname.slice('/items/'.length).split('/')[0];
    const products = state.postBuild ? [baselineProduct, product(true)] : [baselineProduct];
    const blogs = state.postBuild ? [blog(true), baselineBlog] : [baselineBlog];
    const collections = {
      site_settings: settings, home_page: home, categories: [], brands: [brand], products,
      applications: [], audience_channels: [], blog_posts: blogs, partners: [],
      languages: [{ code: 'en', name: 'English', direction: 'ltr' }, { code: 'vi', name: 'Tiếng Việt', direction: 'ltr' }],
    };
    let data = collections[collection];
    if (!data) return json(response, 404, { errors: [{ message: 'Unknown collection' }] });
    if (Array.isArray(data)) {
      data = data.filter((item) => !item.translations || matchesDetail(item, url));
      const excludedIds = queryValues(url, 'id').filter((value) => value !== 'published');
      if (excludedIds.length) data = data.filter(({ id }) => !excludedIds.includes(id));
      const limit = Number.parseInt(url.searchParams.get('limit') ?? '', 10);
      if (Number.isFinite(limit) && limit >= 0) data = data.slice(0, limit);
    }
    if (request.method === 'HEAD') { response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' }); response.end(); return; }
    return json(response, 200, { data: structuredClone(data) });
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, hostname, resolve);
  });
  const address = server.address();
  const actualPort = typeof address === 'object' && address ? address.port : port;
  return {
    url: `http://${hostname}:${actualPort}`,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  createFakeDirectusServer({
    port: Number.parseInt(process.env.FAKE_DIRECTUS_PORT ?? '8056', 10),
    adminSecret: process.env.FAKE_DIRECTUS_ADMIN_SECRET,
  }).then(({ url }) => {
    console.log(`Fake Directus baseline listening at ${url}`);
  }).catch((error) => {
    console.error(error instanceof Error ? error.message : 'Fake Directus failed to start');
    process.exitCode = 1;
  });
}
