import { afterEach, describe, expect, test } from 'bun:test';

import { createCmsQueries } from '../src/lib/cms/queries';
import { createDirectusCmsClient } from '../src/lib/cms/directus/client';
import { createCmsRepository, type CmsRequest } from '../src/lib/cms/directus/repository';
import { createFakeDirectusServer, queryValues } from '../scripts/fake-directus-server.mjs';

let server: Awaited<ReturnType<typeof createFakeDirectusServer>> | undefined;
afterEach(async () => server?.close());

describe('mutable fake Directus release server', () => {
  test('matches filter field segments exactly instead of date or composite field substrings', () => {
    const url = new URL('http://release.test/items/blog_posts');
    url.searchParams.set('filter[published_at][_lte]', '2026-07-29');
    url.searchParams.set('filter[candidate_id][_eq]', 'not-the-item-id');
    url.searchParams.set('filter[id][_neq]', 'exact-item-id');
    expect(queryValues(url, 'id')).toEqual(['exact-item-id']);
  });

  test('serves exact baseline fixtures through the production SDK and mappers', async () => {
    server = await createFakeDirectusServer({ port: 0, adminSecret: 'test-admin-secret' });
    const client = createDirectusCmsClient(server.url);
    const repository = createCmsRepository(((command) => client.request(command)) as CmsRequest);
    const queries = createCmsQueries(repository, server.url);

    const [settings, home, products, blogs] = await Promise.all([
      queries.getGlobalSettings('vi'),
      queries.getFeaturedContent('en'),
      queries.getProducts('en'),
      queries.getBlogPosts('vi'),
    ]);
    expect(settings.store.address).toBe('Thành phố Hồ Chí Minh');
    expect(home.hero.product.slug).toBe('task9-product');
    expect(products.map(({ slug }) => slug)).toEqual(['task9-product']);
    expect(blogs.map(({ slug }) => slug)).toEqual(['bai-viet-task9-ban-dau']);

    const [englishBlog, vietnameseBlog] = await Promise.all([
      queries.getBlogPostBySlug('en', 'task9-baseline-story'),
      queries.getBlogPostBySlug('vi', 'bai-viet-task9-ban-dau'),
    ]);
    expect(englishBlog?.title).toBe('Task 9 Baseline Story');
    expect(vietnameseBlog?.counterpart?.slug).toBe('task9-baseline-story');

    const dateFilteredUrl = new URL('/items/blog_posts', server.url);
    dateFilteredUrl.searchParams.set('filter[published_at][_lte]', '2026-07-29');
    const dateFiltered = await (await fetch(dateFilteredUrl)).json() as { data: unknown[] };
    expect(dateFiltered.data).toHaveLength(1);

    const asset = await fetch(products[0]!.image.src);
    expect(asset.status).toBe(200);
    expect(asset.headers.get('content-type')).toBe('image/png');
    const image = new Uint8Array(await asset.arrayBuffer());
    expect(new TextDecoder().decode(image.slice(12, 16))).toBe('IHDR');
    const header = new DataView(image.buffer, image.byteOffset, image.byteLength);
    expect(header.getUint32(16)).toBe(1200);
    expect(header.getUint32(20)).toBe(800);
  });

  test('adds a bilingual product and blog through the guarded post-build mutation without restart', async () => {
    server = await createFakeDirectusServer({ port: 0, adminSecret: 'test-admin-secret' });
    const mutation = await fetch(`${server.url}/__test/mutate`, {
      method: 'POST',
      headers: { 'x-release-secret': 'test-admin-secret' },
    });
    expect(mutation.status).toBe(204);

    const client = createDirectusCmsClient(server.url);
    const repository = createCmsRepository(((command) => client.request(command)) as CmsRequest);
    const queries = createCmsQueries(repository, server.url);
    expect((await queries.getProducts('en')).map(({ slug }) => slug))
      .toEqual(['task9-product', 'task9-product-after-build']);
    expect((await queries.getBlogPosts('vi')).map(({ slug }) => slug))
      .toEqual(['bai-viet-task9-sau-build', 'bai-viet-task9-ban-dau']);
    expect((await queries.getProductBySlug('vi', 'san-pham-task9-sau-build'))?.counterpart?.slug)
      .toBe('task9-product-after-build');
  });

  test('forces and clears a CMS outage without exposing the admin secret', async () => {
    server = await createFakeDirectusServer({ port: 0, adminSecret: 'test-admin-secret' });
    const denied = await fetch(`${server.url}/__test/outage`, { method: 'POST' });
    expect(denied.status).toBe(401);
    expect(await denied.text()).not.toContain('test-admin-secret');

    await fetch(`${server.url}/__test/outage`, {
      method: 'POST',
      headers: { 'x-release-secret': 'test-admin-secret', 'content-type': 'application/json' },
      body: JSON.stringify({ enabled: true }),
    });
    expect((await fetch(`${server.url}/items/products`)).status).toBe(503);
    await fetch(`${server.url}/__test/outage`, {
      method: 'POST',
      headers: { 'x-release-secret': 'test-admin-secret', 'content-type': 'application/json' },
      body: JSON.stringify({ enabled: false }),
    });
    expect((await fetch(`${server.url}/items/products`)).status).toBe(200);
  });
});
