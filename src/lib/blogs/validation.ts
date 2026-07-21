import type { DemoBlogPost } from '../cms/demo-data';
import { locales, type Locale } from '../i18n/types';

type UnknownRecord = Record<string, unknown>;

const fail = (id: string, message: string): never => {
  throw new Error(`Invalid blog post "${id}": ${message}`);
};

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonBlankString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const localizedText = (
  id: string,
  value: unknown,
  locale: Locale,
  field: string,
): string => {
  if (!isRecord(value)) fail(id, `${locale}.${field} is required`);
  const localizedValue = (value as UnknownRecord)[locale];
  if (typeof localizedValue === 'string' && localizedValue.trim()) return localizedValue;
  return fail(id, `${locale}.${field} is required`);
};

export const validateDemoBlogPosts = (posts: readonly DemoBlogPost[]): void => {
  const ids = new Set<string>();
  const slugs = { en: new Set<string>(), vi: new Set<string>() };

  for (const post of posts) {
    const id = isRecord(post) && isNonBlankString(post.id) ? post.id.trim() : '<missing-id>';
    if (!isRecord(post)) fail(id, 'record is required');
    if (!isNonBlankString(post.id)) fail(id, 'id is required');
    if (ids.has(post.id)) fail(id, 'id must be unique');
    ids.add(post.id);

    if (!isNonBlankString(post.publishedAt)) fail(id, 'publishedAt must be a real YYYY-MM-DD date');
    const parsedDate = new Date(`${post.publishedAt}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(post.publishedAt)
      || Number.isNaN(parsedDate.valueOf())
      || parsedDate.toISOString().slice(0, 10) !== post.publishedAt) fail(id, 'publishedAt must be a real YYYY-MM-DD date');
    if (!Number.isInteger(post.readingMinutes) || post.readingMinutes <= 0) fail(id, 'readingMinutes must be a positive integer');
    if (!isRecord(post.image)
      || !isNonBlankString(post.image.src)
      || typeof post.image.width !== 'number' || post.image.width <= 0
      || typeof post.image.height !== 'number' || post.image.height <= 0) fail(id, 'image is required');

    for (const locale of locales) {
      const slug = localizedText(id, post.slug, locale, 'slug');
      localizedText(id, post.title, locale, 'title');
      localizedText(id, post.excerpt, locale, 'excerpt');
      localizedText(id, post.category, locale, 'category');
      localizedText(id, post.image.alt, locale, 'imageAlt');
      if (slugs[locale].has(slug)) fail(id, `${locale}.slug must be unique`);
      slugs[locale].add(slug);

      if (!isRecord(post.sections) || !Array.isArray(post.sections[locale]) || post.sections[locale].length === 0) {
        fail(id, `${locale}.sections must not be empty`);
      }
      for (const section of post.sections[locale]) {
        if (!isRecord(section)) fail(id, `${locale}.section is required`);
        if (section.heading !== undefined && !isNonBlankString(section.heading)) fail(id, `${locale}.section heading must not be blank`);
        if (!Array.isArray(section.paragraphs)
          || section.paragraphs.length === 0
          || section.paragraphs.some((paragraph) => !isNonBlankString(paragraph))) fail(id, `${locale}.section paragraphs must not be empty`);
      }
    }
  }
};
