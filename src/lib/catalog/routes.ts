import type { Product } from '../cms/types';
import { localizedPath, type CounterpartMap } from '../i18n/routes';
import type { Locale } from '../i18n/types';

export const productDetailPath = (locale: Locale, product: Pick<Product, 'slug'>): string =>
  `${localizedPath(locale, 'products')}${product.slug}/`;

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
