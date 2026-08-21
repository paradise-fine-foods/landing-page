import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { CmsDataError } from '../src/lib/cms/directus/errors';
import { createCmsQueries } from '../src/lib/cms/queries';
import { mapRecipe } from '../src/lib/cms/directus/mappers';
import {
  createCmsRepository,
  type CmsRequest,
} from '../src/lib/cms/directus/repository';
import {
  buildRecipeRouteMaps,
  findRecipeRoute,
  loadRecipeDetailPageData,
  recipeAlternatePath,
  recipeDetailPath,
} from '../src/lib/recipes/routes';
import { loadRecipeSuggestions } from '../src/lib/recipes/suggestions';
import {
  fixtureRepository,
  fixtureRecipe,
  getGlobalSettings,
  getLatestRecipes,
  getRecipeBySlug,
  getRecipes,
} from './fixtures/directus';

const directusUrl = 'https://cms.example.com';
const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

const createRequestHarness = (...responses: unknown[]) => {
  const requests: Array<{
    path: string;
    params?: Record<string, unknown>;
    method: string;
  }> = [];
  const request: CmsRequest = async (command) => {
    requests.push(command() as never);
    const response = responses.shift();
    if (response instanceof Error) throw response;
    return response as never;
  };
  return { request, requests };
};

describe('recipe repository command contracts', () => {
  test('declares a dedicated recipes collection command instead of routing through blog_posts', () => {
    const repositorySource = source('src/lib/cms/directus/repository.ts');

    expect(repositorySource).toContain("readItems<DirectusSchema, 'recipes', TQuery>('recipes', query)");
    expect(repositorySource).toContain('const readRecipes =');
    expect(repositorySource).not.toContain("getRecipes: async (locale): Promise<RecipeRecord[]> => list('recipes', readBlogPosts(");
    expect(repositorySource).not.toContain("getLatestRecipes: async (locale, limit, excludeId): Promise<RecipeRecord[]> => {\r\n      const safeLimit = Math.max(0, Math.floor(limit));\r\n      if (safeLimit === 0) return Promise.resolve([]);\r\n      return list('recipes', readBlogPosts(");
    expect(repositorySource).not.toContain("getRecipeBySlug: async (locale, slug): Promise<RecipeRecord | undefined> => detail('recipes', readBlogPosts(");
  });

  test('issues /items/recipes requests with published and localized filters for list, latest, and detail', async () => {
    const harness = createRequestHarness([fixtureRecipe], [fixtureRecipe], [fixtureRecipe]);
    const repository = createCmsRepository(harness.request);

    await repository.getRecipes('vi');
    await repository.getLatestRecipes('en', 2, 'recipe-butter-lamination');
    await repository.getRecipeBySlug('vi', 'cach-can-lop-bo');

    expect(harness.requests.map(({ path }) => path)).toEqual([
      '/items/recipes',
      '/items/recipes',
      '/items/recipes',
    ]);
    expect(harness.requests[0]?.params).toMatchObject({
      filter: { status: { _eq: 'published' } },
      sort: ['-published_at', 'id'],
      deep: {
        translations: {
          _filter: { languages_code: { _eq: 'vi' } },
          _limit: 1,
        },
      },
    });
    expect(harness.requests[1]?.params).toMatchObject({
      filter: {
        status: { _eq: 'published' },
        id: { _neq: 'recipe-butter-lamination' },
      },
      sort: ['-published_at', 'id'],
      limit: 2,
      deep: {
        translations: {
          _filter: { languages_code: { _eq: 'en' } },
          _limit: 1,
        },
      },
    });
    expect(harness.requests[2]?.params).toMatchObject({
      filter: {
        status: { _eq: 'published' },
        translations: {
          languages_code: { _eq: 'vi' },
          slug: { _eq: 'cach-can-lop-bo' },
        },
      },
      deep: {
        translations: {
          _filter: { languages_code: { _in: ['en', 'vi'] } },
          _limit: 2,
        },
      },
      limit: 1,
    });
  });

  test('applies recipe latest limits and exclusions without making zero-limit CMS calls', async () => {
    const harness = createRequestHarness([fixtureRecipe]);
    const repository = createCmsRepository(harness.request);

    expect(await repository.getLatestRecipes('en', 0, 'recipe-butter-lamination')).toEqual([]);
    expect(harness.requests).toHaveLength(0);

    const latest = await repository.getLatestRecipes('en', 1.9, 'current-recipe');
    expect(latest.map(({ id }) => id)).toEqual(['recipe-butter-lamination']);
    expect(harness.requests[0]?.params).toMatchObject({
      limit: 1,
      filter: {
        status: { _eq: 'published' },
        id: { _neq: 'current-recipe' },
      },
    });
  });
});

describe('recipe query and mapper behavior', () => {
  test('maps recipes through the public CMS query names with bilingual counterpart metadata', async () => {
    const queries = createCmsQueries(fixtureRepository, directusUrl);

    const [englishRecipe] = await queries.getRecipes('en');
    const [vietnameseRecipe] = await queries.getLatestRecipes('vi', 1);
    const detail = await queries.getRecipeBySlug('en', englishRecipe!.slug);

    expect(englishRecipe?.id).toBe('recipe-butter-lamination');
    expect(englishRecipe?.slug).toBe('butter-lamination-method');
    expect(englishRecipe?.counterpart).toEqual({
      id: 'recipe-butter-lamination',
      locale: 'vi',
      slug: 'cach-can-lop-bo',
    });
    expect(englishRecipe?.title.length).toBeGreaterThan(0);
    expect(englishRecipe?.excerpt.length).toBeGreaterThan(0);
    expect(englishRecipe?.readingMinutes).toBeGreaterThan(0);
    expect(vietnameseRecipe).toMatchObject({
      slug: 'cach-can-lop-bo',
      counterpart: {
        id: 'recipe-butter-lamination',
        locale: 'en',
        slug: 'butter-lamination-method',
      },
    });
    expect(detail?.bodyHtml).toContain('<h2>');
    expect(detail?.bodyHtml).toContain('<p>');
    expect(detail?.bodyHtml).not.toMatch(/script|onclick|javascript:|<img/i);
  });

  test('requires recipe title, excerpt, body, image alt, and reading minutes while preserving safe markup', () => {
    const recipe = mapRecipe(structuredClone(fixtureRecipe), 'en', directusUrl);

    expect(recipe.bodyHtml).toContain('<blockquote>Chill before service.</blockquote>');
    expect(recipe.bodyHtml).toContain(
      '<a href="https://example.com" title="Read" target="_blank" rel="noopener noreferrer">safe</a>',
    );
    expect(recipe.bodyHtml).not.toMatch(/script|onclick|javascript:|<img/i);

    const missingTitle = {
      ...structuredClone(fixtureRecipe),
      translations: fixtureRecipe.translations.map((translation, index) =>
        index === 0 ? { ...translation, title: '   ' } : translation),
    };
    const missingAlt = {
      ...structuredClone(fixtureRecipe),
      translations: fixtureRecipe.translations.map((translation, index) =>
        index === 0 ? { ...translation, image_alt: '' } : translation),
    };
    const missingReadingMinutes = {
      ...structuredClone(fixtureRecipe),
      reading_minutes: null,
    };

    expect(() => mapRecipe(missingTitle, 'en', directusUrl)).toThrow(CmsDataError);
    expect(() => mapRecipe(missingTitle, 'en', directusUrl)).toThrow('title is required');
    expect(() => mapRecipe(missingAlt, 'en', directusUrl)).toThrow(CmsDataError);
    expect(() => mapRecipe(missingAlt, 'en', directusUrl)).toThrow('alt text is required');
    expect(() => mapRecipe(missingReadingMinutes, 'en', directusUrl)).toThrow(CmsDataError);
    expect(() => mapRecipe(missingReadingMinutes, 'en', directusUrl)).toThrow('reading_minutes must be finite');
  });
});

describe('recipe routes, pages, and suggestions', () => {
  test('defines localized recipe index and detail routes behind CMS queries and runtime detail loading', () => {
    expect(existsSync(join(root, 'src/pages/[locale]/recipes/index.astro'))).toBe(true);
    expect(existsSync(join(root, 'src/pages/[locale]/recipes/[slug].astro'))).toBe(true);

    const index = source('src/pages/[locale]/recipes/index.astro');
    const detail = source('src/pages/[locale]/recipes/[slug].astro');
    const routes = source('src/lib/recipes/routes.ts');
    const suggestionsIsland = source('src/components/recipes/RecipeSuggestionsIsland.astro');

    expect(index).toContain('getRecipes(locale)');
    expect(index).toContain('loadCmsPageData');
    expect(index).toContain('data-recipe-index');
    expect(index).toContain('recipes.length > 0');
    expect(index).toContain("variant={index === 0 ? 'lead' : 'standard'}");
    expect(index).toContain('recipe-index__empty');
    expect(detail).toContain('loadRecipeDetailPageData(locale, slug)');
    expect(detail).toContain('<RecipeArticle');
    expect(detail).toContain('<RecipeSuggestionsIsland server:defer');
    expect(detail).toContain("currentRecipeId={recipe.id}");
    expect(detail).toContain("return Astro.rewrite('/404')");
    expect(detail).not.toContain('getStaticPaths');
    expect(routes).toContain('queries.getRecipeBySlug(locale, slug)');
    expect(routes).not.toContain('getLatestRecipes');
    expect(suggestionsIsland).toContain('await loadRecipeSuggestions(locale, currentRecipeId)');
  });

  test('builds detail and alternate paths from stable counterpart metadata and route maps', async () => {
    const [englishRecipe] = await getRecipes('en');
    const [vietnameseRecipe] = await getRecipes('vi');
    const maps = buildRecipeRouteMaps([englishRecipe!], [vietnameseRecipe!]);

    expect(recipeDetailPath('en', englishRecipe!)).toBe('/en/recipes/butter-lamination-method/');
    expect(recipeDetailPath('vi', vietnameseRecipe!)).toBe('/vi/recipes/cach-can-lop-bo/');
    expect(recipeAlternatePath('en', englishRecipe!)).toBe('/vi/recipes/cach-can-lop-bo/');
    expect(recipeAlternatePath('en', { counterpart: undefined })).toBe('/vi/recipes/');
    expect(maps).toEqual([{
      en: '/en/recipes/butter-lamination-method/',
      vi: '/vi/recipes/cach-can-lop-bo/',
    }]);
    expect(findRecipeRoute(maps, '/en/recipes/butter-lamination-method/', 'vi')).toBe(
      '/vi/recipes/cach-can-lop-bo/',
    );
  });

  test('resolves recipe details added at runtime and returns 404 for unknown slugs', async () => {
    const [baseRecipe, ...otherRecipes] = await getRecipes('en');
    const records: Array<{ status: 'draft' | 'published'; recipe: NonNullable<typeof baseRecipe> }> = [{
      status: 'draft',
      recipe: { ...baseRecipe!, id: 'draft-recipe', slug: 'draft-recipe' },
    }];
    const queries = {
      getGlobalSettings,
      getRecipeBySlug: async (_locale: 'en' | 'vi', slug: string) =>
        records.find((record) => record.status === 'published' && record.recipe.slug === slug)?.recipe,
    };

    records.push({
      status: 'published',
      recipe: { ...baseRecipe!, id: 'published-after-start', slug: 'published-after-start' },
    });

    const found = await loadRecipeDetailPageData('en', 'published-after-start', queries);
    expect(found.status).toBe(200);
    if (found.status !== 200) throw new Error(`expected runtime recipe, received ${found.status}`);
    expect(found.recipe.id).toBe('published-after-start');
    expect((await loadRecipeDetailPageData('en', 'draft-recipe', queries)).status).toBe(404);
    expect((await loadRecipeDetailPageData('en', 'missing-recipe', queries)).status).toBe(404);
    expect(otherRecipes.length).toBeGreaterThan(0);
  });

  test('keeps homepage recipe composition wired to latest recipes and not blog props', () => {
    const homepage = source('src/pages/[locale]/index.astro');

    expect(homepage).toContain('getLatestRecipes(locale, 3)');
    expect(homepage).toContain('<LatestRecipes recipes={latestRecipes}');
    expect(homepage).toContain('title={copy.home.latestRecipesTitle}');
    expect(homepage).toContain('viewAllLabel={copy.home.latestRecipesViewAll}');
    expect(homepage).not.toContain('<LatestRecipes posts=');
  });

  test('loads deferred suggestions from latest recipes and excludes the current recipe even if the query echoes it', async () => {
    const [currentRecipe, ...otherRecipes] = await getRecipes('en');
    const suggestions = await loadRecipeSuggestions('en', currentRecipe!.id, async () => [
      currentRecipe!,
      ...otherRecipes,
      ...otherRecipes,
    ]);

    expect(suggestions).toHaveLength(3);
    expect(suggestions.every(({ id }) => id !== currentRecipe!.id)).toBe(true);
  });
});
