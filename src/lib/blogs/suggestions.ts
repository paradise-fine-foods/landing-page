import { getLatestBlogPosts } from '@/lib/cms/queries';
import type { BlogPost } from '@/lib/cms/types';
import type { Locale } from '@/lib/i18n/types';

export type LatestBlogQuery = (
  locale: Locale,
  limit: number,
  excludeId?: string,
) => Promise<BlogPost[]>;

export const loadBlogSuggestions = async (
  locale: Locale,
  currentPostId: string,
  query: LatestBlogQuery = getLatestBlogPosts,
): Promise<BlogPost[]> => (await query(locale, 3, currentPostId))
  .filter(({ id }) => id !== currentPostId)
  .slice(0, 3);
