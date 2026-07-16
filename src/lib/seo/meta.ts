import { localizedPath } from '../i18n/routes';
import { locales, type Locale } from '../i18n/types';

export interface MetaInput {
  site: string | URL;
  locale: Locale;
  title: string;
  description: string;
  pathname: string;
  alternatePath?: string;
  image?: string;
}

export interface MetaOutput {
  title: string;
  description: string;
  canonical: string;
  alternates: Array<{ locale: Locale; href: string }>;
  openGraph: {
    title: string;
    description: string;
    url: string;
    locale: 'en_US' | 'vi_VN';
    type: 'website';
    image?: string;
  };
}

const absoluteUrl = (path: string, site: string | URL): string =>
  new URL(path, site).toString();

export const buildMeta = (input: MetaInput): MetaOutput => {
  const canonical = absoluteUrl(input.pathname, input.site);
  const counterpartLocale: Locale = input.locale === 'en' ? 'vi' : 'en';
  const paths: Record<Locale, string> = {
    [input.locale]: input.pathname,
    [counterpartLocale]: input.alternatePath ?? localizedPath(counterpartLocale, 'home'),
  } as Record<Locale, string>;

  return {
    title: input.title,
    description: input.description,
    canonical,
    alternates: locales.map((locale) => ({
      locale,
      href: absoluteUrl(paths[locale], input.site),
    })),
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      locale: input.locale === 'en' ? 'en_US' : 'vi_VN',
      type: 'website',
      ...(input.image ? { image: absoluteUrl(input.image, input.site) } : {}),
    },
  };
};
