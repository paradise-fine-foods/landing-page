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
