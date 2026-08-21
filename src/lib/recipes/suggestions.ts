import { getLatestRecipes } from '@/lib/cms/queries';
import type { Recipe } from '@/lib/cms/types';
import type { Locale } from '@/lib/i18n/types';

export type LatestRecipeQuery = (
  locale: Locale,
  limit: number,
  excludeId?: string,
) => Promise<Recipe[]>;

export const loadRecipeSuggestions = async (
  locale: Locale,
  currentRecipeId: string,
  query: LatestRecipeQuery = getLatestRecipes,
): Promise<Recipe[]> => (await query(locale, 3, currentRecipeId))
  .filter(({ id }) => id !== currentRecipeId)
  .slice(0, 3);