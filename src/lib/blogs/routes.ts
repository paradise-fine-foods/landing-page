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
