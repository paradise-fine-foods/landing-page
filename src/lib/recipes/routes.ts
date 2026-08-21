import {
  getGlobalSettings,
  getRecipeBySlug,
  type CmsQueries,
} from '@/lib/cms/queries';
import { loadCmsPageData } from '@/lib/cms/page-state';
import type { GlobalSettings, Recipe } from '@/lib/cms/types';
import { counterpartPath, localizedPath, type CounterpartMap } from '@/lib/i18n/routes';
import { counterpartLocale } from '@/lib/i18n/static-paths';
import type { Locale } from '@/lib/i18n/types';

export const recipeDetailPath = (locale: Locale, recipe: Pick<Recipe, 'slug'>): string =>
  `${localizedPath(locale, 'recipes')}${recipe.slug}/`;

export const recipeAlternatePath = (
  locale: Locale,
  recipe: Pick<Recipe, 'counterpart'>,
): string => recipe.counterpart
  ? recipeDetailPath(recipe.counterpart.locale, recipe.counterpart)
  : localizedPath(counterpartLocale(locale), 'recipes');

type RecipeDetailQueries = Pick<
  CmsQueries,
  'getGlobalSettings' | 'getRecipeBySlug'
>;

export type RecipeDetailPageData =
  | { status: 200; settings: GlobalSettings; recipe: Recipe }
  | { status: 404 }
  | { status: 503 };

const productionRecipeDetailQueries: RecipeDetailQueries = {
  getGlobalSettings,
  getRecipeBySlug,
};

export const loadRecipeDetailPageData = async (
  locale: Locale,
  slug: string,
  queries: RecipeDetailQueries = productionRecipeDetailQueries,
): Promise<RecipeDetailPageData> => {
  const primaryData = await loadCmsPageData(
    () => queries.getGlobalSettings(locale),
    () => queries.getRecipeBySlug(locale, slug),
  );
  if (!primaryData.ok) return { status: 503 };

  const [settings, recipe] = primaryData.data;
  if (!recipe) return { status: 404 };

  return {
    status: 200,
    settings,
    recipe,
  };
};

export const buildRecipeRouteMaps = (
  english: readonly Recipe[],
  vietnamese: readonly Recipe[],
): CounterpartMap[] => {
  const vietnameseById = new Map(vietnamese.map((recipe) => [recipe.id, recipe]));
  return english.flatMap((englishRecipe) => {
    const vietnameseRecipe = vietnameseById.get(englishRecipe.id);
    return vietnameseRecipe ? [{
      en: recipeDetailPath('en', englishRecipe),
      vi: recipeDetailPath('vi', vietnameseRecipe),
    }] : [];
  });
};

export const findRecipeRoute = (
  maps: readonly CounterpartMap[],
  pathname: string,
  targetLocale: Locale,
): string | undefined => maps.find((map) => Object.values(map).includes(pathname))?.[targetLocale];