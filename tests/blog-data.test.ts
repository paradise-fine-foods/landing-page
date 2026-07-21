import { describe, expect, test } from 'bun:test';
import { demoBlogPosts } from '../src/lib/cms/demo-data';
import { getBlogPostBySlug, getBlogPosts, getLatestBlogPosts } from '../src/lib/cms/queries';
import { buildBlogRouteMaps, blogDetailPath, findBlogRoute } from '../src/lib/blogs/routes';
import { validateDemoBlogPosts } from '../src/lib/blogs/validation';

describe('bilingual blog data', () => {
  test('contains four complete bilingual records sorted newest first', async () => {
    expect(demoBlogPosts).toHaveLength(4);
    expect(() => validateDemoBlogPosts(demoBlogPosts)).not.toThrow();
    const [en, vi] = await Promise.all([getBlogPosts('en'), getBlogPosts('vi')]);
    expect(en.map(({ id }) => id)).toEqual([
      'temperature-discipline', 'cream-for-service', 'focused-dairy-house', 'consistent-lamination',
    ]);
    expect(vi.map(({ id }) => id)).toEqual(en.map(({ id }) => id));
    expect(en.every((post) => post.sections.length > 0)).toBe(true);
    expect(vi.every((post) => post.sections.length > 0)).toBe(true);
  });

  test('stores the blog Vietnamese content as proper UTF-8 text', () => {
    expect(JSON.stringify(demoBlogPosts)).not.toContain('\u00c3\u0192');
    expect(demoBlogPosts[0]!.title.vi).toBe('V\u00ec sao k\u1ef7 lu\u1eadt nhi\u1ec7t \u0111\u1ed9 b\u1ea3o v\u1ec7 hi\u1ec7u su\u1ea5t l\u00e0m b\u00e1nh');
    expect(demoBlogPosts[0]!.sections.vi[1]!.heading).toBe('L\u00e0m r\u00f5 \u0111i\u1ec1u ki\u1ec7n b\u1ea3o qu\u1ea3n');
  });

  test('limits latest posts and excludes the current stable ID', async () => {
    expect((await getLatestBlogPosts('en', 3)).map(({ id }) => id)).toEqual([
      'temperature-discipline', 'cream-for-service', 'focused-dairy-house',
    ]);
    expect((await getLatestBlogPosts('en', 3, 'temperature-discipline')).map(({ id }) => id))
      .toEqual(['cream-for-service', 'focused-dairy-house', 'consistent-lamination']);
    expect(await getLatestBlogPosts('vi', 0)).toEqual([]);
  });

  test('looks up localized slugs without inventing unknown posts', async () => {
    expect((await getBlogPostBySlug('en', 'temperature-discipline-pastry'))?.id)
      .toBe('temperature-discipline');
    expect((await getBlogPostBySlug('vi', 'ky-luat-nhiet-do-banh-ngot'))?.id)
      .toBe('temperature-discipline');
    expect(await getBlogPostBySlug('en', 'missing-post')).toBeUndefined();
  });

  test('builds reciprocal localized detail routes by stable ID', async () => {
    const [en, vi] = await Promise.all([getBlogPosts('en'), getBlogPosts('vi')]);
    const maps = buildBlogRouteMaps(en, vi);
    expect(maps).toHaveLength(4);
    expect(blogDetailPath('en', en[0]!)).toBe('/en/blogs/temperature-discipline-pastry/');
    expect(findBlogRoute(maps, maps[0]!.en, 'vi')).toBe(maps[0]!.vi);
  });

  test('identifies invalid content by record ID', () => {
    const duplicate = structuredClone(demoBlogPosts);
    duplicate[1]!.id = duplicate[0]!.id;
    expect(() => validateDemoBlogPosts(duplicate)).toThrow('temperature-discipline');
    const invalidDate = structuredClone(demoBlogPosts);
    invalidDate[0]!.publishedAt = 'July 12';
    expect(() => validateDemoBlogPosts(invalidDate)).toThrow('temperature-discipline');
    const emptySections = structuredClone(demoBlogPosts);
    emptySections[0]!.sections.vi = [];
    expect(() => validateDemoBlogPosts(emptySections)).toThrow('temperature-discipline');
  });

  test('identifies malformed nested content by record ID', () => {
    const mutations: Array<(post: Record<string, unknown>) => void> = [
      (post) => { post.image = undefined; },
      (post) => { post.slug = undefined; },
      (post) => { (post.title as Record<string, unknown>).vi = undefined; },
      (post) => { post.sections = undefined; },
      (post) => { (post.sections as Record<string, unknown>).vi = [undefined]; },
      (post) => { (post.sections as Record<string, unknown>).vi = [{ paragraphs: undefined }]; },
      (post) => { (post.sections as Record<string, unknown>).vi = [{ paragraphs: [undefined] }]; },
    ];

    for (const mutate of mutations) {
      const invalid = structuredClone(demoBlogPosts) as unknown as Array<Record<string, unknown>>;
      mutate(invalid[0]!);
      expect(() => validateDemoBlogPosts(invalid as never)).toThrow('temperature-discipline');
    }
  });

  test('identifies sparse paragraphs and non-finite image dimensions by record ID', () => {
    const mutations: Array<(post: Record<string, unknown>) => void> = [
      (post) => { (post.sections as Record<string, unknown>).vi = [{ paragraphs: new Array(1) }]; },
      (post) => { (post.image as Record<string, unknown>).width = Number.NaN; },
      (post) => { (post.image as Record<string, unknown>).height = Infinity; },
    ];

    for (const mutate of mutations) {
      const invalid = structuredClone(demoBlogPosts) as unknown as Array<Record<string, unknown>>;
      mutate(invalid[0]!);
      expect(() => validateDemoBlogPosts(invalid as never)).toThrow('temperature-discipline');
    }
  });
});
