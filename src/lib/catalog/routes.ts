import type { Product } from '@/lib/cms/types';
import { localizedPath, type CounterpartMap } from '@/lib/i18n/routes';
import type { Locale } from '@/lib/i18n/types';
import { counterpartLocale } from '@/lib/i18n/static-paths';

export const productDetailPath = (locale: Locale, product: Pick<Product, 'slug'>): string =>
  `${localizedPath(locale, 'products')}${product.slug}/`;

export const productAlternatePath = (
  locale: Locale,
  product: Pick<Product, 'counterpart'>,
): string => product.counterpart
  ? productDetailPath(product.counterpart.locale, product.counterpart)
  : localizedPath(counterpartLocale(locale), 'products');

export const buildProductRouteMaps = (
  englishProducts: readonly Product[],
  vietnameseProducts: readonly Product[],
): CounterpartMap[] => {
  const vietnameseById = new Map(vietnameseProducts.map((product) => [product.id, product]));

  return englishProducts.flatMap((englishProduct) => {
    const vietnameseProduct = vietnameseById.get(englishProduct.id);
    if (!vietnameseProduct) return [];

    return [{
      en: productDetailPath('en', englishProduct),
      vi: productDetailPath('vi', vietnameseProduct),
    }];
  });
};

export const findProductRoute = (
  maps: readonly CounterpartMap[],
  pathname: string,
  targetLocale: Locale,
): string | undefined => maps.find((map) => Object.values(map).includes(pathname))?.[targetLocale];
