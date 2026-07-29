import {
  getBlogPostBySlug,
  getGlobalSettings,
  getLatestBlogPosts,
  type CmsQueries,
} from '../cms/queries';
import { loadCmsPageData } from '../cms/page-state';
import type { BlogPost, GlobalSettings } from '../cms/types';
import { counterpartPath, localizedPath, type CounterpartMap } from '../i18n/routes';
import { counterpartLocale } from '../i18n/static-paths';
import type { Locale } from '../i18n/types';

export const blogDetailPath = (locale: Locale, post: Pick<BlogPost, 'slug'>): string =>
  `${localizedPath(locale, 'blogs')}${post.slug}/`;

export const blogAlternatePath = (
  locale: Locale,
  post: Pick<BlogPost, 'counterpart'>,
): string => post.counterpart
  ? blogDetailPath(post.counterpart.locale, post.counterpart)
  : localizedPath(counterpartLocale(locale), 'blogs');

type BlogDetailQueries = Pick<
  CmsQueries,
  'getGlobalSettings' | 'getBlogPostBySlug' | 'getLatestBlogPosts'
>;

export type BlogDetailPageData =
  | { status: 200; settings: GlobalSettings; post: BlogPost; suggestions: BlogPost[] }
  | { status: 404 }
  | { status: 503 };

const productionBlogDetailQueries: BlogDetailQueries = {
  getGlobalSettings,
  getBlogPostBySlug,
  getLatestBlogPosts,
};

export const loadBlogDetailPageData = async (
  locale: Locale,
  slug: string,
  queries: BlogDetailQueries = productionBlogDetailQueries,
): Promise<BlogDetailPageData> => {
  const primaryData = await loadCmsPageData(
    () => queries.getGlobalSettings(locale),
    () => queries.getBlogPostBySlug(locale, slug),
  );
  if (!primaryData.ok) return { status: 503 };

  const [settings, post] = primaryData.data;
  if (!post) return { status: 404 };

  const suggestionsData = await loadCmsPageData(
    () => queries.getLatestBlogPosts(locale, 3, post.id),
  );
  if (!suggestionsData.ok) return { status: 503 };

  return {
    status: 200,
    settings,
    post,
    suggestions: suggestionsData.data[0],
  };
};

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
