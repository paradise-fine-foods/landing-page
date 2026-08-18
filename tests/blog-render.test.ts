import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { join } from 'node:path';
import { createServer, type ViteDevServer } from 'vite';

import { resolveConfig } from '../node_modules/astro/dist/core/config/config.js';
import { createSettings } from '../node_modules/astro/dist/core/config/settings.js';
import { AstroLogger } from '../node_modules/astro/dist/core/logger/core.js';
import astroPlugin from '../node_modules/astro/dist/vite-plugin-astro/index.js';
import { mapBlogPost } from '../src/lib/cms/directus/mappers';
import { fixtureBlogPost } from './fixtures/directus';

const directusUrl = 'https://cms.example.com';
const root = join(import.meta.dir, '..');
let vite: ViteDevServer;

beforeAll(async () => {
  const { astroConfig } = await resolveConfig({ root, configFile: false }, 'dev');
  const settings = await createSettings(astroConfig, 'silent', root);
  const logger = new AstroLogger({
    level: 'silent',
    destination: { write: () => undefined },
  });
  vite = await createServer({
    root,
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
    resolve: { alias: { '@': join(root, 'src') } },
    plugins: astroPlugin({ settings, logger }),
  });
});

afterAll(async () => {
  await vite.close();
});

const component = async (path: string) =>
  (await vite.ssrLoadModule(path)).default;

describe('server-rendered blog components', () => {
  test('renders mapper-sanitized rich text and article metadata in the initial HTML', async () => {
    const post = mapBlogPost(structuredClone(fixtureBlogPost), 'en', directusUrl);
    const container = await AstroContainer.create();
    const html = await container.renderToString(await component('/src/components/blogs/BlogArticle.astro'), {
      props: { post, locale: 'en' },
    });

    expect(html).toMatch(/<article\b(?=[^>]*\bclass="blog-article")(?=[^>]*\bdata-blog-article)[^>]*>/);
    expect(html).toMatch(new RegExp(`<h1\\b[^>]*>${post.title}</h1>`));
    expect(html).toContain('<h2>Safe heading</h2>');
    expect(html).toContain('<p>Keep <strong>cold</strong> and <em>steady</em>.</p>');
    expect(html).toMatch(new RegExp(`<time\\b[^>]*datetime="${post.publishedAt}"[^>]*>`));
    expect(html).toContain(`width="${post.image.width}"`);
    expect(html).toContain(`height="${post.image.height}"`);
    expect(html).toContain(`alt="${post.image.alt}"`);
    expect(html).toContain('loading="eager"');
    expect(html).toContain('fetchpriority="high"');
    expect(html.indexOf('<h1')).toBeLessThan(html.indexOf('<h2>Safe heading</h2>'));
    expect(html).not.toMatch(/<script|onclick=|javascript:|<img[^>]+evil\.test/i);
  }, 20000);

  test('renders cards and latest stories as primary server HTML', async () => {
    const post = mapBlogPost(structuredClone(fixtureBlogPost), 'en', directusUrl);
    const container = await AstroContainer.create();
    const card = await container.renderToString(await component('/src/components/blogs/BlogCard.astro'), {
      props: { post, locale: 'en', headingLevel: 'h2' },
    });
    const latest = await container.renderToString(await component('/src/components/blogs/LatestBlogs.astro'), {
      props: {
        posts: [post],
        locale: 'en',
        eyebrow: 'Journal',
        title: 'Latest stories',
        viewAllLabel: 'View all',
      },
    });

    expect(card).toMatch(new RegExp(`<h2\\b[^>]*><a\\b[^>]*href="/en/blogs/${post.slug}/"[^>]*>${post.title}</a></h2>`));
    expect(card).toMatch(new RegExp(`<time\\b[^>]*datetime="${post.publishedAt}"[^>]*>`));
    expect(latest).toContain('data-latest-blogs');
    expect(latest).toContain(post.title);
    expect(latest).toContain(`/en/blogs/${post.slug}/`);
    expect(latest).not.toContain('server:defer');
  }, 20000);

  test('omits an empty latest-stories section from server HTML', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(await component('/src/components/blogs/LatestBlogs.astro'), {
      props: {
        posts: [],
        locale: 'vi',
        eyebrow: 'Nhật ký',
        title: 'Bài mới nhất',
        viewAllLabel: 'Xem tất cả',
      },
    });

    expect(html).not.toContain('data-latest-blogs');
  }, 20000);
});
