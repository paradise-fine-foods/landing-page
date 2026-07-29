import type { Brand } from '../cms/types';
import { localizedPath, type CounterpartMap } from '../i18n/routes';
import type { Locale } from '../i18n/types';
import { counterpartLocale } from '../i18n/static-paths';

export const brandDetailPath = (locale: Locale, brand: Pick<Brand, 'slug'>): string =>
  `${localizedPath(locale, 'brands')}${brand.slug}/`;

export const brandAlternatePath = (
  locale: Locale,
  brand: Pick<Brand, 'counterpart'>,
): string => brand.counterpart
  ? brandDetailPath(brand.counterpart.locale, brand.counterpart)
  : localizedPath(counterpartLocale(locale), 'brands');

export const buildBrandRouteMaps = (
  englishBrands: readonly Brand[],
  vietnameseBrands: readonly Brand[],
): CounterpartMap[] => {
  const vietnameseById = new Map(vietnameseBrands.map((brand) => [brand.id, brand]));

  return englishBrands.flatMap((englishBrand) => {
    const vietnameseBrand = vietnameseById.get(englishBrand.id);
    return vietnameseBrand ? [{
      en: brandDetailPath('en', englishBrand),
      vi: brandDetailPath('vi', vietnameseBrand),
    }] : [];
  });
};

export const findBrandRoute = (
  maps: readonly CounterpartMap[],
  pathname: string,
  targetLocale: Locale,
): string | undefined => maps.find((map) => Object.values(map).includes(pathname))?.[targetLocale];
