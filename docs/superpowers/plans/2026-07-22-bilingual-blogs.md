# Bilingual Blogs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add bilingual blog indexes and article routes, a Blogs navigation item, three latest stories on the homepage, and three latest alternatives on every article.

**Architecture:** Extend the existing demo-backed CMS query boundary with a small localized `BlogPost` model and four bilingual records. All prominence and recommendations derive from one newest-first query; shared server-rendered Astro components present the same data on the index, homepage, and article pages.

**Tech Stack:** Astro 7 static output, TypeScript 6, Bun tests, existing Newsreader/Nunito fonts, existing Living Ingredients CSS tokens.

## Global Constraints

- Keep the public CMS model limited to `id`, localized `slug`, `title`, `excerpt`, `category`, required localized image alt text, `publishedAt`, `readingMinutes`, and localized structured `sections`.
- Add exactly four complete bilingual demo posts.
- Use publication date as the only prominence control: no tags, featured switches, relationship records, or recommendation scoring.
- Homepage shows the three newest posts; each article shows up to three newest posts excluding its own stable ID.
- Canonical structural routes are `/en/blogs/` and `/vi/blogs/`; detail routes are `/{locale}/blogs/{localized-slug}/`.
- Place Blogs between Brands and Contact in the shared header; place the homepage latest-stories section after Featured Brands and before Partner Strip.
- Reuse `#fbfaf5`, `#28342b`, `#e46f2c`, `#0796d2`, `#94c11f`, Newsreader, Nunito, and the existing spacing/focus tokens; do not add a second visual theme.
- Keep the ingredient-label treatment as the single expressive flourish; hierarchy is CSS-only and never stored in CMS data.
- Render complete semantic content without JavaScript and preserve focus, mobile, and reduced-motion contracts.
- Invalid IDs, localized slugs/content, ISO dates, reading time, images, or article sections must fail with the offending record ID in the message.
- Add no dependencies and make no unrelated refactors.

---

## File structure

- `src/lib/cms/types.ts`: public localized `BlogPost` and `BlogSection` contracts.
- `src/lib/cms/demo-data.ts`: four bilingual demo records behind the CMS boundary.
- `src/lib/cms/queries.ts`: localization, validation call, newest-first queries, slug lookup.
- `src/lib/blogs/validation.ts`: pure build-time validation for demo blog records.
- `src/lib/blogs/routes.ts`: localized detail paths and reciprocal route maps keyed by stable ID.
- `src/lib/blogs/presentation.ts`: locale-aware date and read-time formatting shared by components.
- `src/components/blogs/BlogCard.astro`: reusable semantic story card with CSS-only variants.
- `src/components/blogs/LatestBlogs.astro`: reusable one-to-three-card latest-stories section.
- `src/components/blogs/BlogArticle.astro`: semantic long-form article and story label.
- `src/pages/[locale]/blogs/index.astro`: localized newest-first blog index and empty state.
- `src/pages/[locale]/blogs/[slug].astro`: localized article static paths, counterpart metadata, and latest alternatives.
- `src/lib/i18n/types.ts`, `src/lib/i18n/routes.ts`, `src/lib/i18n/ui.ts`: Blogs route key and bilingual UI copy.
- `src/components/global/Header.astro`: primary Blogs navigation item.
- `src/pages/[locale]/index.astro`: homepage latest-blog query and section placement.
- `tests/blog-data.test.ts`: model, validation, ordering, exclusion, and reciprocal route unit tests.
- `tests/blog-components.test.ts`: semantic and visual component source contracts.
- `tests/blog-routes.test.ts`: localized page/query/counterpart route contracts.
- `tests/blog-integration.test.ts`: navigation and homepage composition contracts.
- `tests/verify-built-route-manifest.ts`, `tests/route-manifest.test.ts`: exact 42-page route set.
- `tests/verify-built-blogs.ts`, `tests/blog-build-verifier.test.ts`, `package.json`: generated-output verification.

---

### Task 1: Blog data, validation, query, route, and presentation contracts

**Files:**
- Create: `src/lib/blogs/validation.ts`
- Create: `src/lib/blogs/routes.ts`
- Create: `src/lib/blogs/presentation.ts`
- Modify: `src/lib/cms/types.ts`
- Modify: `src/lib/cms/demo-data.ts`
- Modify: `src/lib/cms/queries.ts`
- Modify: `src/lib/i18n/types.ts`
- Modify: `src/lib/i18n/routes.ts`
- Test: `tests/blog-data.test.ts`

**Interfaces:**
- Produces: `BlogPost`, `BlogSection`, `getBlogPosts(locale)`, `getLatestBlogPosts(locale, limit, excludeId?)`, `getBlogPostBySlug(locale, slug)`, `blogDetailPath(locale, post)`, `buildBlogRouteMaps(en, vi)`, `findBlogRoute(maps, pathname, targetLocale)`, `formatBlogDate(locale, date)`, and `formatReadingTime(template, minutes)`.
- Consumes: existing `Locale`, `LocalizedText`, `LocalizedSlug`, `ImageAsset`, `CounterpartMap`, and demo image helpers.

- [ ] **Step 1: Write the failing data/query tests**

Create `tests/blog-data.test.ts` with these exact behavioral checks:

```ts
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
});
```

- [ ] **Step 2: Run the test and confirm the missing blog exports fail**

Run: `bun test tests/blog-data.test.ts`

Expected: FAIL because `demoBlogPosts`, the blog query functions, and `src/lib/blogs/*` do not exist.

- [ ] **Step 3: Add the public and demo types**

Append to `src/lib/cms/types.ts`:

```ts
export interface BlogSection {
  heading?: string;
  paragraphs: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readingMinutes: number;
  category: string;
  image: ImageAsset;
  sections: BlogSection[];
}
```

Add to `src/lib/cms/demo-data.ts`:

```ts
export interface DemoBlogSection { heading?: string; paragraphs: string[] }
export interface DemoBlogPost {
  id: string;
  slug: LocalizedSlug;
  title: LocalizedText;
  excerpt: LocalizedText;
  publishedAt: string;
  readingMinutes: number;
  category: LocalizedText;
  image: DemoImageAsset;
  sections: Record<'en' | 'vi', DemoBlogSection[]>;
}

export const demoBlogPosts: DemoBlogPost[] = [
  {
    id: 'temperature-discipline',
    slug: { en: 'temperature-discipline-pastry', vi: 'ky-luat-nhiet-do-banh-ngot' },
    title: { en: 'Why temperature discipline protects pastry performance', vi: 'Vì sao kỷ luật nhiệt độ bảo vệ hiệu suất làm bánh' },
    excerpt: { en: 'Practical cold-chain notes for professional pastry teams.', vi: 'Ghi chú thực tế về chuỗi lạnh cho đội ngũ bánh chuyên nghiệp.' },
    publishedAt: '2026-07-12', readingMinutes: 6,
    category: { en: 'Cold-chain notes', vi: 'Ghi chú chuỗi lạnh' },
    image: editorialImage('Professional pastry ingredients arranged for cold storage', 'Nguyên liệu bánh chuyên nghiệp được sắp xếp để bảo quản lạnh'),
    sections: {
      en: [
        { paragraphs: ['Good pastry begins before the dough reaches the bench. Stable receiving and storage conditions help teams protect ingredient consistency.'] },
        { heading: 'Make conditions visible', paragraphs: ['Record delivery temperatures, return chilled products promptly, and give every shift the same handling reference.'] },
      ],
      vi: [
        { paragraphs: ['Một mẻ bánh tốt bắt đầu trước khi bột lên bàn. Điều kiện tiếp nhận và bảo quản ổn định giúp đội ngũ duy trì tính nhất quán của nguyên liệu.'] },
        { heading: 'Làm rõ điều kiện bảo quản', paragraphs: ['Ghi nhận nhiệt độ khi giao hàng, đưa sản phẩm trở lại kho lạnh kịp thời và dùng chung hướng dẫn xử lý cho mọi ca làm việc.'] },
      ],
    },
  },
  {
    id: 'cream-for-service',
    slug: { en: 'choosing-cream-for-service', vi: 'chon-kem-sua-cho-phuc-vu' },
    title: { en: 'Choosing cream for a busy service', vi: 'Chọn kem sữa cho ca phục vụ bận rộn' },
    excerpt: { en: 'Match format and handling to the work your kitchen repeats every day.', vi: 'Kết hợp quy cách và cách xử lý với công việc nhà bếp lặp lại mỗi ngày.' },
    publishedAt: '2026-07-04', readingMinutes: 4,
    category: { en: 'Application guide', vi: 'Hướng dẫn ứng dụng' },
    image: productImage('Cream carton on an abstract professional kitchen stage', 'Hộp kem sữa trên bối cảnh bếp chuyên nghiệp trừu tượng'),
    sections: {
      en: [
        { paragraphs: ['The best cream choice starts with the task: whipping, sauces, finishing, or a combination across service.'] },
        { heading: 'Choose for the workflow', paragraphs: ['Compare pack size, storage space, opening frequency, and the consistency your team needs during peak hours.'] },
      ],
      vi: [
        { paragraphs: ['Lựa chọn kem sữa phù hợp bắt đầu từ công việc: đánh bông, làm xốt, hoàn thiện món hoặc kết hợp trong suốt ca phục vụ.'] },
        { heading: 'Chọn theo quy trình', paragraphs: ['So sánh dung tích, không gian bảo quản, tần suất mở hộp và độ ổn định đội ngũ cần trong giờ cao điểm.'] },
      ],
    },
  },
  {
    id: 'focused-dairy-house',
    slug: { en: 'inside-a-focused-dairy-house', vi: 'ben-trong-nha-sua-chuyen-biet' },
    title: { en: 'Inside a focused dairy house', vi: 'Bên trong một nhà sữa chuyên biệt' },
    excerpt: { en: 'Dependable professional formats begin with a clear production point of view.', vi: 'Quy cách chuyên nghiệp đáng tin cậy bắt đầu từ định hướng sản xuất rõ ràng.' },
    publishedAt: '2026-06-26', readingMinutes: 5,
    category: { en: 'Producer story', vi: 'Câu chuyện nhà sản xuất' },
    image: livingHeroImage('Dairy producer presentation with professional ingredients', 'Trình bày nhà sản xuất sữa cùng nguyên liệu chuyên nghiệp'),
    sections: {
      en: [
        { paragraphs: ['A focused producer designs formats around repeatable kitchen work, not novelty alone.'] },
        { heading: 'Clarity travels', paragraphs: ['Clear specifications help distributors and kitchen teams preserve the maker’s intent through storage, delivery, and use.'] },
      ],
      vi: [
        { paragraphs: ['Một nhà sản xuất chuyên biệt xây dựng quy cách quanh công việc bếp có thể lặp lại, không chỉ quanh sự mới lạ.'] },
        { heading: 'Sự rõ ràng đi cùng sản phẩm', paragraphs: ['Thông số rõ ràng giúp nhà phân phối và đội ngũ bếp giữ đúng ý đồ của nhà sản xuất trong bảo quản, giao hàng và sử dụng.'] },
      ],
    },
  },
  {
    id: 'consistent-lamination',
    slug: { en: 'consistent-lamination-workflows', vi: 'quy-trinh-can-lop-on-dinh' },
    title: { en: 'Building a consistent lamination workflow', vi: 'Xây dựng quy trình cán lớp ổn định' },
    excerpt: { en: 'Small handling decisions make repeatable pastry work easier to sustain.', vi: 'Những quyết định xử lý nhỏ giúp duy trì công việc bánh ổn định hơn.' },
    publishedAt: '2026-06-18', readingMinutes: 7,
    category: { en: 'Kitchen notes', vi: 'Ghi chú nhà bếp' },
    image: editorialImage('Pastry lamination tools and butter on a work table', 'Dụng cụ cán lớp bánh và bơ trên bàn làm việc'),
    sections: {
      en: [
        { paragraphs: ['Consistency comes from controlling temperature, rest time, thickness, and the order in which each step happens.'] },
        { heading: 'Write the repeatable version', paragraphs: ['Turn the successful sequence into a short shared method that every shift can follow and review.'] },
      ],
      vi: [
        { paragraphs: ['Tính ổn định đến từ việc kiểm soát nhiệt độ, thời gian nghỉ, độ dày và thứ tự của từng bước.'] },
        { heading: 'Ghi lại phiên bản có thể lặp lại', paragraphs: ['Chuyển trình tự thành công thành phương pháp ngắn gọn để mọi ca làm việc cùng áp dụng và rà soát.'] },
      ],
    },
  },
];
```

- [ ] **Step 4: Implement exact validation**

Create `src/lib/blogs/validation.ts`:

```ts
import type { DemoBlogPost } from '../cms/demo-data';
import { locales } from '../i18n/types';

const fail = (id: string, message: string): never => {
  throw new Error(`Invalid blog post "${id}": ${message}`);
};

export const validateDemoBlogPosts = (posts: readonly DemoBlogPost[]): void => {
  const ids = new Set<string>();
  const slugs = { en: new Set<string>(), vi: new Set<string>() };

  for (const post of posts) {
    const id = post.id.trim() || '<missing-id>';
    if (!post.id.trim()) fail(id, 'id is required');
    if (ids.has(post.id)) fail(id, 'id must be unique');
    ids.add(post.id);
    const parsedDate = new Date(`${post.publishedAt}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(post.publishedAt)
      || Number.isNaN(parsedDate.valueOf())
      || parsedDate.toISOString().slice(0, 10) !== post.publishedAt) fail(id, 'publishedAt must be a real YYYY-MM-DD date');
    if (!Number.isInteger(post.readingMinutes) || post.readingMinutes <= 0) fail(id, 'readingMinutes must be a positive integer');
    if (!post.image.src || post.image.width <= 0 || post.image.height <= 0) fail(id, 'image is required');

    for (const locale of locales) {
      for (const [field, value] of Object.entries({ slug: post.slug[locale], title: post.title[locale], excerpt: post.excerpt[locale], category: post.category[locale], imageAlt: post.image.alt[locale] })) {
        if (!value.trim()) fail(id, `${locale}.${field} is required`);
      }
      if (slugs[locale].has(post.slug[locale])) fail(id, `${locale}.slug must be unique`);
      slugs[locale].add(post.slug[locale]);
      if (post.sections[locale].length === 0) fail(id, `${locale}.sections must not be empty`);
      for (const section of post.sections[locale]) {
        if (section.heading !== undefined && !section.heading.trim()) fail(id, `${locale}.section heading must not be blank`);
        if (section.paragraphs.length === 0 || section.paragraphs.some((paragraph) => !paragraph.trim())) fail(id, `${locale}.section paragraphs must not be empty`);
      }
    }
  }
};
```

- [ ] **Step 5: Add queries and formatting helpers**

In `src/lib/cms/queries.ts`, import `demoBlogPosts`, `DemoBlogPost`, `BlogPost`, and `validateDemoBlogPosts`, call validation once at module initialization, and add:

```ts
validateDemoBlogPosts(demoBlogPosts);

const localizeBlogPost = (post: DemoBlogPost, locale: Locale): BlogPost => ({
  id: post.id,
  slug: post.slug[locale],
  title: post.title[locale],
  excerpt: post.excerpt[locale],
  publishedAt: post.publishedAt,
  readingMinutes: post.readingMinutes,
  category: post.category[locale],
  image: localizeImage(post.image, locale),
  sections: post.sections[locale].map((section) => ({
    ...(section.heading ? { heading: section.heading } : {}),
    paragraphs: [...section.paragraphs],
  })),
});

export const getBlogPosts = async (locale: Locale): Promise<BlogPost[]> =>
  demoBlogPosts.map((post) => localizeBlogPost(post, locale))
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));

export const getLatestBlogPosts = async (
  locale: Locale,
  limit: number,
  excludeId?: string,
): Promise<BlogPost[]> => (await getBlogPosts(locale))
  .filter(({ id }) => id !== excludeId)
  .slice(0, Math.max(0, limit));

export const getBlogPostBySlug = async (
  locale: Locale,
  slug: string,
): Promise<BlogPost | undefined> => {
  const post = demoBlogPosts.find((item) => item.slug[locale] === slug);
  return post ? localizeBlogPost(post, locale) : undefined;
};
```

Create `src/lib/blogs/presentation.ts`:

```ts
import type { Locale } from '../i18n/types';

const dateLocales: Record<Locale, string> = { en: 'en-GB', vi: 'vi-VN' };
export const formatBlogDate = (locale: Locale, value: string): string =>
  new Intl.DateTimeFormat(dateLocales[locale], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${value}T00:00:00Z`));
export const formatReadingTime = (template: string, minutes: number): string =>
  template.replace('{minutes}', String(minutes));
```

- [ ] **Step 6: Add the Blogs structural route and reciprocal detail helpers**

Change `RouteKey` in `src/lib/i18n/types.ts` to include `'blogs'`. Add `blogs: 'blogs'` to both locale maps in `src/lib/i18n/routes.ts`.

Create `src/lib/blogs/routes.ts`:

```ts
import type { BlogPost } from '../cms/types';
import { counterpartPath, localizedPath, type CounterpartMap } from '../i18n/routes';
import type { Locale } from '../i18n/types';

export const blogDetailPath = (locale: Locale, post: Pick<BlogPost, 'slug'>): string =>
  `${localizedPath(locale, 'blogs')}${post.slug}/`;

export const buildBlogRouteMaps = (
  english: readonly BlogPost[],
  vietnamese: readonly BlogPost[],
): CounterpartMap[] => {
  const vietnameseById = new Map(vietnamese.map((post) => [post.id, post]));
  return english.flatMap((post) => {
    const counterpart = vietnameseById.get(post.id);
    return counterpart ? [{ en: blogDetailPath('en', post), vi: blogDetailPath('vi', counterpart) }] : [];
  });
};

export const findBlogRoute = (
  maps: readonly CounterpartMap[],
  pathname: string,
  targetLocale: Locale,
): string | undefined => {
  const path = counterpartPath(pathname, targetLocale, maps);
  return path === localizedPath(targetLocale, 'home') ? undefined : path;
};
```

- [ ] **Step 7: Run focused tests and commit**

Run: `bun test tests/blog-data.test.ts tests/i18n.test.ts`

Expected: PASS.

```bash
git add src/lib/cms/types.ts src/lib/cms/demo-data.ts src/lib/cms/queries.ts src/lib/blogs src/lib/i18n/types.ts src/lib/i18n/routes.ts tests/blog-data.test.ts
git commit -m "feat: add bilingual blog data queries"
```

---

### Task 2: Localized blog UI and reusable semantic components

**Files:**
- Modify: `src/lib/i18n/ui.ts`
- Create: `src/components/blogs/BlogCard.astro`
- Create: `src/components/blogs/LatestBlogs.astro`
- Create: `src/components/blogs/BlogArticle.astro`
- Test: `tests/blog-components.test.ts`

**Interfaces:**
- Consumes: Task 1 `BlogPost`, `Locale`, `localizedPath`, `formatBlogDate`, and `formatReadingTime`.
- Produces: `ui[locale].blog`, homepage blog copy, `BlogCard`, `LatestBlogs`, and `BlogArticle`.

- [ ] **Step 1: Write the failing component contract test**

Create `tests/blog-components.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ui } from '../src/lib/i18n/ui';
const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

describe('blog components', () => {
  test('provides complete bilingual blog interface copy', () => {
    for (const locale of ['en', 'vi'] as const) {
      expect(ui[locale].header.blogs.length).toBeGreaterThan(3);
      expect(ui[locale].blog.readStory).toBeTruthy();
      expect(ui[locale].blog.readingTime).toContain('{minutes}');
      expect(ui[locale].home.latestBlogsTitle).toBeTruthy();
    }
  });
  test('renders semantic cards with localized time, image, and descriptive links', () => {
    const card = source('src/components/blogs/BlogCard.astro');
    expect(card).toContain('<article');
    expect(card).toContain('<time datetime={post.publishedAt}>');
    expect(card).toContain('width={post.image.width}');
    expect(card).toContain('height={post.image.height}');
    expect(card).toContain('alt={post.image.alt}');
    expect(card).toContain('blog-card--lead');
    expect(card).toContain('blog-card__label');
  });
  test('omits empty latest sections and keeps article heading hierarchy', () => {
    const latest = source('src/components/blogs/LatestBlogs.astro');
    const article = source('src/components/blogs/BlogArticle.astro');
    expect(latest).toContain('posts.length > 0');
    expect(latest).toContain('data-latest-blogs');
    expect(article).toContain('data-blog-article');
    expect(article).toContain('<h1>{post.title}</h1>');
    expect(article).toContain('section.heading && <h2>');
    expect(article).not.toContain('<script');
  });
});
```

- [ ] **Step 2: Run the component test and confirm missing copy/files fail**

Run: `bun test tests/blog-components.test.ts`

Expected: FAIL because the blog copy and components do not exist.

- [ ] **Step 3: Add exact localized copy contracts**

Extend `UiCopy.header` with `blogs: string`. Extend `UiCopy.home` with `latestBlogsEyebrow`, `latestBlogsTitle`, and `latestBlogsViewAll`. Add:

```ts
blog: {
  eyebrow: string; title: string; description: string; readStory: string;
  readingTime: string; publishedLabel: string; readingTimeLabel: string; categoryLabel: string;
  latestEyebrow: string; latestTitle: string; viewAll: string;
  breadcrumb: string; emptyTitle: string; emptyDescription: string;
};
```

Use these exact localized values:

```ts
// English additions
header: { /* existing values */, blogs: 'Blogs' },
home: { /* existing values */, latestBlogsEyebrow: 'From the professional table', latestBlogsTitle: 'Latest stories', latestBlogsViewAll: 'View all stories' },
blog: {
  eyebrow: 'Culinary dispatches', title: 'Stories behind better ingredients.',
  description: 'Practical notes on ingredients, handling, makers, and professional kitchen work.',
  readStory: 'Read story', readingTime: '{minutes} min read', publishedLabel: 'Published', readingTimeLabel: 'Reading time', categoryLabel: 'Category', latestEyebrow: 'Continue reading',
  latestTitle: 'Latest stories', viewAll: 'View all stories', breadcrumb: 'Blog breadcrumb',
  emptyTitle: 'Stories are being prepared', emptyDescription: 'Return soon for new notes from the professional table.',
},

// Vietnamese additions
header: { /* existing values */, blogs: 'Bài viết' },
home: { /* existing values */, latestBlogsEyebrow: 'Từ bàn bếp chuyên nghiệp', latestBlogsTitle: 'Bài viết mới nhất', latestBlogsViewAll: 'Xem tất cả bài viết' },
blog: {
  eyebrow: 'Ghi chép ẩm thực', title: 'Câu chuyện phía sau nguyên liệu tốt.',
  description: 'Ghi chú thực tế về nguyên liệu, bảo quản, nhà sản xuất và công việc bếp chuyên nghiệp.',
  readStory: 'Đọc bài viết', readingTime: '{minutes} phút đọc', publishedLabel: 'Ngày đăng', readingTimeLabel: 'Thời gian đọc', categoryLabel: 'Chủ đề', latestEyebrow: 'Đọc tiếp',
  latestTitle: 'Bài viết mới nhất', viewAll: 'Xem tất cả bài viết', breadcrumb: 'Đường dẫn bài viết',
  emptyTitle: 'Bài viết đang được chuẩn bị', emptyDescription: 'Hãy quay lại để xem ghi chép mới từ bàn bếp chuyên nghiệp.',
},
```

- [ ] **Step 4: Implement the reusable story card**

Create `src/components/blogs/BlogCard.astro` with this structure and exact variant contract:

```astro
---
import type { BlogPost } from '../../lib/cms/types';
import { blogDetailPath } from '../../lib/blogs/routes';
import { formatBlogDate, formatReadingTime } from '../../lib/blogs/presentation';
import type { Locale } from '../../lib/i18n/types';
import { ui } from '../../lib/i18n/ui';
interface Props { post: BlogPost; locale: Locale; variant?: 'standard' | 'lead' | 'compact'; headingLevel?: 'h2' | 'h3'; showExcerpt?: boolean }
const { post, locale, variant = 'standard', headingLevel = 'h3', showExcerpt = true } = Astro.props;
const copy = ui[locale].blog;
const Heading = headingLevel;
const href = blogDetailPath(locale, post);
---
<article class:list={['blog-card', `blog-card--${variant}`]}>
  <a class="blog-card__image" href={href} aria-label={`${copy.readStory}: ${post.title}`}>
    <img src={post.image.src} width={post.image.width} height={post.image.height} alt={post.image.alt} />
  </a>
  <div class="blog-card__copy">
    <div class="blog-card__meta">
      <span>{post.category}</span>
      <time datetime={post.publishedAt}>{formatBlogDate(locale, post.publishedAt)}</time>
      <span>{formatReadingTime(copy.readingTime, post.readingMinutes)}</span>
    </div>
    <Heading><a href={href}>{post.title}</a></Heading>
    {showExcerpt && <p>{post.excerpt}</p>}
    <a class="blog-card__label" href={href}>{copy.readStory}<span aria-hidden="true"> →</span></a>
  </div>
</article>
<style>
  .blog-card { background: var(--color-paper-white); border: 1px solid var(--color-mist-blue); border-radius: var(--radius-sm) 2.75rem var(--radius-sm) var(--radius-sm); display: grid; min-inline-size: 0; overflow: hidden; }
  .blog-card__image { aspect-ratio: 16 / 10; background: var(--color-mist-blue); display: block; overflow: hidden; }
  .blog-card__image img { block-size: 100%; inline-size: 100%; object-fit: cover; transition: transform var(--transition-base); }
  .blog-card:hover .blog-card__image img { transform: scale(1.025); }
  .blog-card__copy { align-content: start; display: grid; gap: var(--space-4); padding: var(--space-5); }
  .blog-card__meta { color: var(--color-deep-herb); display: flex; flex-wrap: wrap; font-size: var(--text-xs); font-weight: 700; gap: var(--space-2) var(--space-4); letter-spacing: .04em; text-transform: uppercase; }
  .blog-card__meta span:first-child { color: var(--color-paradise-blue); }
  .blog-card h2, .blog-card h3 { font-size: var(--text-xl); }
  .blog-card h2 a, .blog-card h3 a { text-decoration: none; }
  .blog-card__label { background: var(--color-deep-herb); border-radius: var(--radius-sm) 1rem var(--radius-sm) var(--radius-sm); color: var(--color-paper-white); font-size: var(--text-sm); font-weight: 700; inline-size: fit-content; margin-block-start: auto; min-block-size: 2.75rem; padding: .7rem var(--space-4); text-decoration: none; }
  .blog-card--lead { grid-column: 1 / -1; grid-template-columns: minmax(0, 1.2fr) minmax(18rem, .8fr); }
  .blog-card--lead .blog-card__image { aspect-ratio: 4 / 3; }
  .blog-card--lead .blog-card__copy { align-content: center; background: var(--color-mist-blue); padding: clamp(var(--space-6), 5vw, var(--space-8)); }
  .blog-card--compact { border-block-start: .2rem solid var(--color-paradise-orange); border-radius: 0; grid-template-columns: 7rem minmax(0, 1fr); }
  .blog-card--compact .blog-card__image { aspect-ratio: 1; }
  .blog-card--compact .blog-card__copy { gap: var(--space-2); padding: var(--space-3); }
  .blog-card--compact .blog-card__label { display: none; }
  @media (max-width: 42rem) { .blog-card--lead, .blog-card--compact { grid-template-columns: minmax(0, 1fr); } .blog-card--compact .blog-card__image { aspect-ratio: 16 / 9; } }
  @media (prefers-reduced-motion: reduce) { .blog-card__image img { transition: none; } .blog-card:hover .blog-card__image img { transform: none; } }
</style>
```

- [ ] **Step 5: Implement latest-story and article components**

Create `src/components/blogs/LatestBlogs.astro`:

```astro
---
import type { BlogPost } from '../../lib/cms/types';
import type { Locale } from '../../lib/i18n/types';
import { localizedPath } from '../../lib/i18n/routes';
import BlogCard from './BlogCard.astro';
interface Props { posts: BlogPost[]; locale: Locale; eyebrow: string; title: string; viewAllLabel: string }
const { posts, locale, eyebrow, title, viewAllLabel } = Astro.props;
---
{posts.length > 0 && (
  <section class="latest-blogs section-space" data-latest-blogs aria-labelledby="latest-blogs-title">
    <div class="container">
      <header class="latest-blogs__heading">
        <div><p class="eyebrow">{eyebrow}</p><h2 id="latest-blogs-title">{title}</h2></div>
        <a href={localizedPath(locale, 'blogs')}>{viewAllLabel}</a>
      </header>
      <div class="latest-blogs__grid">{posts.map((post) => <BlogCard {post} {locale} headingLevel="h3" />)}</div>
    </div>
  </section>
)}
<style>
  .latest-blogs { background: color-mix(in srgb, var(--color-mist-blue) 38%, var(--color-rice-paper)); }
  .latest-blogs__heading { align-items: end; display: flex; gap: var(--space-5); justify-content: space-between; margin-block-end: var(--space-7); }
  .latest-blogs__heading h2 { margin-block-start: var(--space-3); }
  .latest-blogs__heading > a { font-weight: 700; min-block-size: 2.75rem; padding-block: .65rem; }
  .latest-blogs__grid { display: grid; gap: var(--space-6); grid-template-columns: repeat(3, minmax(0, 1fr)); }
  @media (max-width: 48rem) { .latest-blogs__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .latest-blogs__grid > :last-child { grid-column: 1 / -1; } }
  @media (max-width: 34rem) { .latest-blogs__heading { align-items: start; flex-direction: column; } .latest-blogs__grid { grid-template-columns: minmax(0, 1fr); } .latest-blogs__grid > :last-child { grid-column: auto; } }
</style>
```

Create `src/components/blogs/BlogArticle.astro`:

```astro
---
import type { BlogPost } from '../../lib/cms/types';
import { formatBlogDate, formatReadingTime } from '../../lib/blogs/presentation';
import type { Locale } from '../../lib/i18n/types';
import { ui } from '../../lib/i18n/ui';
interface Props { post: BlogPost; locale: Locale }
const { post, locale } = Astro.props;
const copy = ui[locale].blog;
---
<article class="blog-article" data-blog-article>
  <header class="blog-article__header">
    <div><p class="eyebrow">{post.category}</p><h1>{post.title}</h1><p class="blog-article__standfirst">{post.excerpt}</p></div>
    <dl class="blog-article__label">
      <div><dt class="visually-hidden">{copy.publishedLabel}</dt><dd><time datetime={post.publishedAt}>{formatBlogDate(locale, post.publishedAt)}</time></dd></div>
      <div><dt class="visually-hidden">{copy.readingTimeLabel}</dt><dd>{formatReadingTime(copy.readingTime, post.readingMinutes)}</dd></div>
      <div><dt class="visually-hidden">{copy.categoryLabel}</dt><dd>{post.category}</dd></div>
    </dl>
  </header>
  <figure class="blog-article__visual"><img src={post.image.src} width={post.image.width} height={post.image.height} alt={post.image.alt} /></figure>
  <div class="blog-article__body">
    {post.sections.map((section) => <section>{section.heading && <h2>{section.heading}</h2>}{section.paragraphs.map((paragraph) => <p>{paragraph}</p>)}</section>)}
  </div>
</article>
<style>
  .blog-article { min-inline-size: 0; }
  .blog-article__header { display: grid; gap: clamp(var(--space-6), 7vw, var(--space-9)); grid-template-columns: minmax(0, 1fr) minmax(11rem, .25fr); padding-block: var(--space-7); }
  .blog-article h1 { margin-block: var(--space-4); max-inline-size: 12ch; }
  .blog-article__standfirst { font-family: var(--font-display); font-size: var(--text-xl); max-inline-size: 42ch; }
  .blog-article__label { align-self: end; background: var(--color-mist-blue); border-radius: 2rem var(--radius-sm) var(--radius-sm) var(--radius-sm); display: grid; padding: var(--space-5); }
  .blog-article__label div { border-block-end: 1px solid color-mix(in srgb, var(--color-paradise-blue) 35%, transparent); padding-block: var(--space-3); }
  .blog-article__label div:last-child { border: 0; }
  .blog-article__label dd { font-size: var(--text-sm); font-weight: 700; }
  .blog-article__visual { aspect-ratio: 16 / 8; border-radius: var(--radius-sm) 6rem var(--radius-sm) var(--radius-sm); overflow: hidden; }
  .blog-article__visual img { block-size: 100%; inline-size: 100%; object-fit: cover; }
  .blog-article__body { display: grid; gap: var(--space-7); margin-inline: auto; max-inline-size: 46rem; padding-block: var(--space-8) var(--space-9); }
  .blog-article__body section { display: grid; gap: var(--space-4); }
  .blog-article__body section:first-child p:first-child { font-family: var(--font-display); font-size: var(--text-lg); }
  @media (max-width: 42rem) { .blog-article__header { grid-template-columns: minmax(0, 1fr); } .blog-article__label { justify-self: start; } .blog-article__visual { aspect-ratio: 4 / 3; border-start-end-radius: 3rem; } }
</style>
```

Add this exact utility to `src/styles/global.css`:

```css
.visually-hidden {
  block-size: 1px;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  inline-size: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
}
```

- [ ] **Step 6: Run focused tests and commit**

Run: `bun test tests/blog-components.test.ts tests/i18n.test.ts`

Expected: PASS.

```bash
git add src/lib/i18n/ui.ts src/components/blogs src/styles/global.css tests/blog-components.test.ts
git commit -m "feat: add bilingual blog components"
```

---

### Task 3: Localized blog index, article routes, and exact route manifest

**Files:**
- Create: `src/pages/[locale]/blogs/index.astro`
- Create: `src/pages/[locale]/blogs/[slug].astro`
- Create: `tests/blog-routes.test.ts`
- Modify: `tests/i18n.test.ts`
- Modify: `tests/verify-built-route-manifest.ts`
- Modify: `tests/route-manifest.test.ts`

**Interfaces:**
- Consumes: Tasks 1–2 query, route, UI, and component interfaces.
- Produces: two blog indexes, eight localized article pages, reciprocal metadata, and an exact 42-page manifest.

- [ ] **Step 1: Write failing route and manifest tests**

Create `tests/blog-routes.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

describe('localized blog routes', () => {
  test('defines one localized index and one localized detail route shape', () => {
    for (const path of ['src/pages/[locale]/blogs/index.astro', 'src/pages/[locale]/blogs/[slug].astro']) expect(existsSync(join(root, path))).toBe(true);
  });
  test('keeps route pages behind CMS queries and reciprocal stable-ID maps', () => {
    const index = source('src/pages/[locale]/blogs/index.astro');
    const detail = source('src/pages/[locale]/blogs/[slug].astro');
    expect(index).toContain('getBlogPosts(locale)');
    expect(detail).toContain('getLatestBlogPosts(locale, 3, post.id)');
    expect(detail).toContain('buildBlogRouteMaps(englishPosts, vietnamesePosts)');
    expect(detail).toContain('satisfies GetStaticPaths');
    expect(`${index}\n${detail}`).not.toMatch(/demo-data|demoBlogPosts/);
  });
  test('renders semantic index, empty state, article, breadcrumbs, and suggestions', () => {
    const index = source('src/pages/[locale]/blogs/index.astro');
    const detail = source('src/pages/[locale]/blogs/[slug].astro');
    expect(index).toContain('data-blog-index');
    expect(index).toContain('posts.length > 0');
    expect(index).toContain("variant={index === 0 ? 'lead' : 'standard'}");
    expect(detail).toContain('<BlogArticle');
    expect(detail).toContain('<LatestBlogs');
    expect(detail).toContain('post.image.src');
    expect(`${index}\n${detail}`).toContain('<Breadcrumbs');
  });
});
```

Update `tests/i18n.test.ts` to expect `localizedPath('en', 'blogs') === '/en/blogs/'`, the Vietnamese equivalent, and both new page shapes in `localizedPages`. Update `tests/route-manifest.test.ts` from 32 to 42 and add an unknown blog slug case.

- [ ] **Step 2: Run tests and confirm routes/manifest fail**

Run: `bun test tests/blog-routes.test.ts tests/i18n.test.ts tests/route-manifest.test.ts`

Expected: FAIL because the pages do not exist and the manifest does not include blog routes.

- [ ] **Step 3: Implement the localized index**

Create `src/pages/[locale]/blogs/index.astro`:

```astro
---
import type { InferGetStaticPropsType } from 'astro';
import BlogCard from '../../../components/blogs/BlogCard.astro';
import Breadcrumbs from '../../../components/global/Breadcrumbs.astro';
import SiteLayout from '../../../layouts/SiteLayout.astro';
import { getBlogPosts } from '../../../lib/cms/queries';
import { localizedPath } from '../../../lib/i18n/routes';
import { counterpartLocale, getLocaleStaticPaths } from '../../../lib/i18n/static-paths';
import { ui } from '../../../lib/i18n/ui';
export const getStaticPaths = getLocaleStaticPaths;
type Props = InferGetStaticPropsType<typeof getStaticPaths>;
const { locale } = Astro.props as Props;
const copy = ui[locale];
const posts = await getBlogPosts(locale);
const pathname = localizedPath(locale, 'blogs');
const alternatePath = localizedPath(counterpartLocale(locale), 'blogs');
---
<SiteLayout {locale} title={`${copy.blog.title} | ${copy.siteName}`} description={copy.blog.description} {pathname} {alternatePath} siteName={copy.siteName} image={posts[0]?.image.src}>
  <div class="blog-index container section-space" data-blog-index>
    <Breadcrumbs label={copy.blog.breadcrumb} items={[{ label: copy.header.home, href: localizedPath(locale, 'home') }, { label: copy.header.blogs }]} />
    <header class="blog-index__intro"><p class="eyebrow">{copy.blog.eyebrow}</p><h1>{copy.blog.title}</h1><p>{copy.blog.description}</p></header>
    {posts.length > 0 ? <section class="blog-index__grid" aria-label={copy.blog.title}>{posts.map((post, index) => <BlogCard {post} {locale} variant={index === 0 ? 'lead' : 'standard'} headingLevel="h2" />)}</section> : <section class="blog-index__empty"><h2>{copy.blog.emptyTitle}</h2><p>{copy.blog.emptyDescription}</p></section>}
  </div>
</SiteLayout>
<style>
  .blog-index__intro { display: grid; gap: var(--space-5); grid-template-columns: minmax(9rem, 1fr) minmax(0, 3fr); padding-block: var(--space-6) var(--space-8); }
  .blog-index__intro h1 { max-inline-size: 12ch; }
  .blog-index__intro > p:last-child { font-size: var(--text-lg); grid-column: 2; max-inline-size: var(--measure); }
  .blog-index__grid { display: grid; gap: var(--space-6); grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .blog-index__empty { background: var(--color-mist-blue); border-radius: 3rem var(--radius-sm) var(--radius-sm); display: grid; gap: var(--space-4); padding: var(--space-7); }
  @media (max-width: 42rem) { .blog-index__intro, .blog-index__grid { grid-template-columns: minmax(0, 1fr); } .blog-index__intro > p:last-child { grid-column: auto; } }
</style>
```

- [ ] **Step 4: Implement localized article static paths and composition**

Create `src/pages/[locale]/blogs/[slug].astro`:

```astro
---
import type { GetStaticPaths, InferGetStaticParamsType, InferGetStaticPropsType } from 'astro';
import BlogArticle from '../../../components/blogs/BlogArticle.astro';
import LatestBlogs from '../../../components/blogs/LatestBlogs.astro';
import Breadcrumbs from '../../../components/global/Breadcrumbs.astro';
import SiteLayout from '../../../layouts/SiteLayout.astro';
import { blogDetailPath, buildBlogRouteMaps, findBlogRoute } from '../../../lib/blogs/routes';
import { getBlogPosts, getLatestBlogPosts } from '../../../lib/cms/queries';
import { localizedPath } from '../../../lib/i18n/routes';
import { counterpartLocale, getLocaleStaticPaths } from '../../../lib/i18n/static-paths';
import { ui } from '../../../lib/i18n/ui';

export const getStaticPaths = (async () => {
  const [englishPosts, vietnamesePosts] = await Promise.all([getBlogPosts('en'), getBlogPosts('vi')]);
  const routeMaps = buildBlogRouteMaps(englishPosts, vietnamesePosts);
  const postsByLocale = { en: englishPosts, vi: vietnamesePosts };
  const grouped = await Promise.all(getLocaleStaticPaths().map(async ({ props: { locale } }) =>
    Promise.all(postsByLocale[locale].map(async (post) => {
      const pathname = blogDetailPath(locale, post);
      const alternateLocale = counterpartLocale(locale);
      return {
        params: { locale, slug: post.slug },
        props: {
          locale, post, pathname,
          alternatePath: findBlogRoute(routeMaps, pathname, alternateLocale) ?? localizedPath(alternateLocale, 'blogs'),
          suggestions: await getLatestBlogPosts(locale, 3, post.id),
        },
      };
    })),
  ));
  return grouped.flat();
}) satisfies GetStaticPaths;

type Params = InferGetStaticParamsType<typeof getStaticPaths>;
type Props = InferGetStaticPropsType<typeof getStaticPaths>;
const { locale, post, pathname, alternatePath, suggestions } = Astro.props as Props;
const localeParam: Params['locale'] = Astro.params.locale;
const slug: Params['slug'] = Astro.params.slug;
void localeParam; void slug;
const copy = ui[locale];
---
<SiteLayout {locale} title={`${post.title} | ${copy.siteName}`} description={post.excerpt} {pathname} {alternatePath} siteName={copy.siteName} image={post.image.src}>
  <div class="blog-page container section-space">
    <Breadcrumbs label={copy.blog.breadcrumb} items={[{ label: copy.header.home, href: localizedPath(locale, 'home') }, { label: copy.header.blogs, href: localizedPath(locale, 'blogs') }, { label: post.title }]} />
    <BlogArticle {post} {locale} />
  </div>
  <LatestBlogs posts={suggestions} {locale} eyebrow={copy.blog.latestEyebrow} title={copy.blog.latestTitle} viewAllLabel={copy.blog.viewAll} />
</SiteLayout>
<style>.blog-page { min-inline-size: 0; }</style>
```

- [ ] **Step 5: Extend the exact route manifest**

Import `demoBlogPosts` in `tests/verify-built-route-manifest.ts`, add `htmlRoute(locale, 'blogs')`, and add every `htmlRoute(locale, 'blogs', post.slug[locale])`. In `tests/route-manifest.test.ts`, require 42 routes and reject `en/blogs/not-a-post/index.html`.

- [ ] **Step 6: Run route tests and commit**

Run: `bun test tests/blog-routes.test.ts tests/i18n.test.ts tests/route-manifest.test.ts`

Expected: PASS with exactly 42 expected generated HTML routes.

```bash
git add src/pages/[locale]/blogs tests/blog-routes.test.ts tests/i18n.test.ts tests/verify-built-route-manifest.ts tests/route-manifest.test.ts
git commit -m "feat: add localized blog routes"
```

---

### Task 4: Header navigation and homepage latest-story integration

**Files:**
- Modify: `src/components/global/Header.astro`
- Modify: `src/pages/[locale]/index.astro`
- Test: `tests/blog-integration.test.ts`
- Test: `tests/homepage-composition.test.ts`

**Interfaces:**
- Consumes: `localizedPath(locale, 'blogs')`, `getLatestBlogPosts(locale, 3)`, `LatestBlogs`, and Task 2 localized copy.
- Produces: Blogs in every enhanced/no-script header mode and the approved homepage section order.

- [ ] **Step 1: Write the failing integration test**

Create `tests/blog-integration.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

describe('blog shell and homepage integration', () => {
  test('places Blogs between Brands and Contact in the shared link array', () => {
    const header = source('src/components/global/Header.astro');
    const brands = header.indexOf("localizedPath(locale, 'brands')");
    const blogs = header.indexOf("localizedPath(locale, 'blogs')");
    const contact = header.indexOf("localizedPath(locale, 'contact')");
    expect(brands).toBeGreaterThan(-1);
    expect(blogs).toBeGreaterThan(brands);
    expect(contact).toBeGreaterThan(blogs);
    expect(header).toContain('label: copy.blogs');
  });
  test('queries exactly three latest posts and places them between brands and partners', () => {
    const home = source('src/pages/[locale]/index.astro');
    expect(home).toContain('getLatestBlogPosts(locale, 3)');
    expect(home).toContain('<LatestBlogs');
    const brands = home.indexOf('<FeaturedBrands');
    const blogs = home.indexOf('<LatestBlogs');
    const partners = home.indexOf('<PartnerStrip');
    expect(blogs).toBeGreaterThan(brands);
    expect(partners).toBeGreaterThan(blogs);
  });
});
```

Also add `getLatestBlogPosts` and `<LatestBlogs` expectations to the existing localized-homepage test in `tests/homepage-composition.test.ts`.

- [ ] **Step 2: Run tests and confirm integration is absent**

Run: `bun test tests/blog-integration.test.ts tests/homepage-composition.test.ts`

Expected: FAIL because Header and the homepage do not yet consume Blogs.

- [ ] **Step 3: Add the shared navigation item**

In `src/components/global/Header.astro`, make the links array exactly:

```ts
const links = [
  { href: localizedPath(locale, 'products'), label: copy.products },
  { href: localizedPath(locale, 'brands'), label: copy.brands },
  { href: localizedPath(locale, 'blogs'), label: copy.blogs },
  { href: localizedPath(locale, 'contact'), label: copy.contact },
];
```

The existing `links.map` calls must remain the single source for desktop/mobile and `<noscript>` navigation.

- [ ] **Step 4: Query and place the homepage section**

In `src/pages/[locale]/index.astro`:

```astro
---
import LatestBlogs from '../../components/blogs/LatestBlogs.astro';
import { getBrands, getCategories, getFeaturedContent, getGlobalSettings, getLatestBlogPosts, getProducts } from '../../lib/cms/queries';
const [settings, featured, categories, products, brands, latestBlogs] = await Promise.all([
  getGlobalSettings(locale), getFeaturedContent(locale), getCategories(locale),
  getProducts(locale, {}), getBrands(locale), getLatestBlogPosts(locale, 3),
]);
---
```

Use the final import without the unused `getBlogPosts`. Insert this exact component after `<FeaturedBrands ... />` and before `<PartnerStrip ... />`:

```astro
<LatestBlogs posts={latestBlogs} {locale} eyebrow={copy.home.latestBlogsEyebrow} title={copy.home.latestBlogsTitle} viewAllLabel={copy.home.latestBlogsViewAll} />
```

- [ ] **Step 5: Run integration tests and commit**

Run: `bun test tests/blog-integration.test.ts tests/homepage-composition.test.ts tests/homepage-contract.test.ts`

Expected: PASS.

```bash
git add src/components/global/Header.astro src/pages/[locale]/index.astro tests/blog-integration.test.ts tests/homepage-composition.test.ts
git commit -m "feat: surface latest blogs across site"
```

---

### Task 5: Generated-output verifier, complete validation, and responsive browser review

**Files:**
- Create: `tests/verify-built-blogs.ts`
- Create: `tests/blog-build-verifier.test.ts`
- Modify: `package.json`
- Modify if browser review finds a defect: only blog files from Tasks 1–4 and their covering tests.

**Interfaces:**
- Consumes: all blog routes/components and the 42-page exact route manifest.
- Produces: a build-time verifier proving localized navigation, metadata, latest ordering, current-post exclusion, and semantic output.

- [ ] **Step 1: Write failing verifier unit tests**

Create `tests/blog-build-verifier.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { assertLatestBlogSection, extractLatestBlogSection } from './verify-built-blogs';

const section = (links: string[]) => `<section data-latest-blogs>${links.map((href) => `<article><a href="${href}">Story</a></article>`).join('')}</section>`;

describe('built blog verifier helpers', () => {
  test('extracts the scoped latest-story section', () => {
    expect(extractLatestBlogSection(`<nav><a href="/outside/">Outside</a></nav>${section(['/a/', '/b/', '/c/'])}`))
      .toContain('href="/a/"');
  });
  test('requires exactly the expected links and excludes the current route', () => {
    expect(() => assertLatestBlogSection(section(['/a/', '/b/', '/c/']), ['/a/', '/b/', '/c/'], '/current/')).not.toThrow();
    expect(() => assertLatestBlogSection(section(['/current/', '/b/', '/c/']), ['/a/', '/b/', '/c/'], '/current/')).toThrow();
    expect(() => assertLatestBlogSection(section(['/a/', '/b/']), ['/a/', '/b/', '/c/'], '/current/')).toThrow();
  });
});
```

- [ ] **Step 2: Run the verifier test and confirm the module is missing**

Run: `bun test tests/blog-build-verifier.test.ts`

Expected: FAIL because `tests/verify-built-blogs.ts` does not exist.

- [ ] **Step 3: Implement the generated-output verifier**

Create `tests/verify-built-blogs.ts`. Export these helpers, then verify home, index, and every article for both locales:

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { blogDetailPath } from '../src/lib/blogs/routes';
import { getBlogPosts, getLatestBlogPosts } from '../src/lib/cms/queries';

export const extractLatestBlogSection = (html: string): string =>
  html.match(/<section\b[^>]*data-latest-blogs[^>]*>[\s\S]*?<\/section>/)?.[0] ?? '';

export const assertLatestBlogSection = (
  html: string,
  expectedPaths: readonly string[],
  currentPath?: string,
): void => {
  const scoped = html.includes('data-latest-blogs') ? extractLatestBlogSection(html) : html;
  assert.ok(scoped, 'latest blog section is missing');
  const articles = scoped.match(/<article\b/g) ?? [];
  assert.equal(articles.length, expectedPaths.length, 'latest blog article count differs');
  for (const path of expectedPaths) assert.ok(scoped.includes(`href="${path}"`), `latest blog section is missing ${path}`);
  if (currentPath) assert.ok(!scoped.includes(`href="${currentPath}"`), `latest blog section repeats current route ${currentPath}`);
};

export const verifyBuiltBlogs = async (dist = join(import.meta.dir, '..', 'dist')): Promise<void> => {
  const origin = 'https://paradisefinefoods.com';
  const built = (path: string) => readFileSync(join(dist, path.replace(/^\//, ''), 'index.html'), 'utf8');
  for (const locale of ['en', 'vi'] as const) {
    const posts = await getBlogPosts(locale);
    const indexPath = `/${locale}/blogs/`;
    const home = built(`/${locale}/`);
    const index = built(indexPath);
    assert.ok(home.includes(`href="${indexPath}"`), `${locale} home/header must link blog index`);
    assert.ok(index.includes('data-blog-index'), `${locale} blog index marker missing`);
    assertLatestBlogSection(home, (await getLatestBlogPosts(locale, 3)).map((post) => blogDetailPath(locale, post)));
    for (const post of posts) {
      const path = blogDetailPath(locale, post);
      const html = built(path);
      assert.ok(html.includes('data-blog-article'), `${path} article marker missing`);
      assert.ok(html.includes(`<time datetime="${post.publishedAt}">`), `${path} semantic date missing`);
      assert.ok(html.includes(`<link rel="canonical" href="${origin}${path}">`), `${path} canonical missing`);
      assertLatestBlogSection(html, (await getLatestBlogPosts(locale, 3, post.id)).map((item) => blogDetailPath(locale, item)), path);
      assert.doesNotMatch(html, /\bundefined\b|file:\/\/\/|src\/assets\/|demo-data/);
    }
  }
};

if (import.meta.main) {
  await verifyBuiltBlogs();
  console.log('Blog build verified: bilingual indexes, articles, metadata, and latest-story exclusions are correct.');
}
```

The helper accepts either a full page or a pre-extracted section so the focused unit test remains small.

- [ ] **Step 4: Add the verifier to the build pipeline and pass focused tests**

Insert `bun tests/verify-built-blogs.ts` after `verify-built-brands.ts` in the `build` script.

Run: `bun test tests/blog-build-verifier.test.ts tests/blog-data.test.ts tests/blog-components.test.ts tests/blog-routes.test.ts tests/blog-integration.test.ts`

Expected: PASS.

- [ ] **Step 5: Run the complete automated verification**

Run in this order:

```bash
bun test
bun run check
bun run build
```

Expected:

- `bun test`: all tests pass.
- `bun run check`: zero errors.
- `bun run build`: Astro generates exactly 42 pages and every verifier, including `verify-built-blogs.ts`, passes.

- [ ] **Step 6: Perform browser verification at desktop and mobile widths**

Start the documented background server:

```bash
bun run astro -- dev --background
bun run astro -- dev status
```

Review `/en/`, `/vi/`, `/en/blogs/`, `/vi/blogs/`, `/en/blogs/temperature-discipline-pastry/`, and `/vi/blogs/ky-luat-nhiet-do-banh-ngot/` at approximately 1440×900 and 390×844. Verify:

- Blogs appears between Brands and Contact in desktop and mobile navigation.
- Homepage latest stories appear between Featured Brands and Partner Strip.
- Index lead story is prominent through CSS only; every post remains in newest-first order.
- Article body is readable, image aspect ratios do not distort, and three suggestions exclude the current route.
- Keyboard focus is visible on navigation, story titles, labels, and View all.
- Disabling JavaScript leaves all blog content and links available.
- `prefers-reduced-motion: reduce` removes image hover motion.
- English and Vietnamese copy, dates, slugs, canonicals, and language-switch counterparts are correct.
- No horizontal overflow occurs at either width.

Capture screenshots for the review report. If a defect is found, add a failing focused test, make the smallest blog-scoped fix, rerun that test plus `bun run check`, and repeat the affected viewport review.

Stop the server:

```bash
bun run astro -- dev stop
```

- [ ] **Step 7: Commit verification and any reviewed polish**

```bash
git add package.json tests/verify-built-blogs.ts tests/blog-build-verifier.test.ts
git add src/components/blogs src/pages/[locale]/blogs src/pages/[locale]/index.astro src/components/global/Header.astro tests
git commit -m "test: verify bilingual blog experience"
```

Run `git status --short` and confirm only `.superpowers/brainstorm/` remains untracked; never stage visual-companion scratch files.

---

## Completion evidence

- Unit tests prove the four-record localized model, content validation, newest-first sorting, limit behavior, stable-ID exclusion, slug lookup, and reciprocal route maps.
- Component tests prove semantic articles/times/headings/images, empty latest-section omission, localized copy, and the CSS-only lead/ingredient-label contracts.
- Route tests prove query-backed localized indexes/details, counterpart routing, and the exact 42-page route set.
- Integration tests prove header order and homepage section placement.
- Built verification proves actual emitted links, canonicals, localized article content, three latest suggestions, and current-route exclusion.
- `bun test`, `bun run check`, `bun run build`, and desktop/mobile browser evidence collectively prove the requested end state.
