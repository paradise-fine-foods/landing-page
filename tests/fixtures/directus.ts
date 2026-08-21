export const fixtureFile = {
  id: 'file-product',
  width: 1200,
  height: 900,
  filename_download: 'product.jpg',
  type: 'image/jpeg',
} as const;

export const fixtureCategory = {
  id: 'butter',
  status: 'published',
  sort: 1,
  image: { ...fixtureFile, id: 'file-category' },
  translations: [
    {
      id: 'category-en',
      languages_code: 'en',
      name: 'Butter',
      slug: 'butter',
      description: 'Professional butter formats.',
      image_alt: 'Butter category',
    },
    {
      id: 'category-vi',
      languages_code: 'vi',
      name: 'Bơ',
      slug: 'bo',
      description: 'Các định dạng bơ chuyên nghiệp.',
      image_alt: 'Danh mục bơ',
    },
  ],
} as const;

export const fixtureBrand = {
  id: 'maison-laitiere',
  status: 'published',
  accent: 'bordeaux',
  sort: 1,
  image: { ...fixtureFile, id: 'file-brand' },
  translations: [
    {
      id: 'brand-en',
      languages_code: 'en',
      name: 'Maison Laitière',
      slug: 'maison-laitiere',
      description: 'A focused dairy house.',
      origin: 'Europe',
      image_alt: 'Maison Laitière products',
    },
    {
      id: 'brand-vi',
      languages_code: 'vi',
      name: 'Nhà Sữa Maison',
      slug: 'nha-sua-maison',
      description: 'Một nhà sữa chuyên biệt.',
      origin: 'Châu Âu',
      image_alt: 'Sản phẩm Nhà Sữa Maison',
    },
  ],
} as const;

export const fixtureApplication = {
  id: 'lamination',
  status: 'published',
  sort: 1,
  translations: [
    {
      id: 'application-en',
      languages_code: 'en',
      name: 'Lamination',
      slug: 'lamination',
      description: 'For laminated pastry.',
    },
    {
      id: 'application-vi',
      languages_code: 'vi',
      name: 'Cán lớp',
      slug: 'can-lop',
      description: 'Dành cho bánh cán lớp.',
    },
  ],
} as const;

export const fixtureAudienceChannel = {
  id: 'bakery',
  status: 'published',
  sort: 1,
  translations: [
    {
      id: 'audience-en',
      languages_code: 'en',
      name: 'Bakery',
      slug: 'bakery',
      description: 'Professional bakeries.',
    },
    {
      id: 'audience-vi',
      languages_code: 'vi',
      name: 'Tiệm bánh',
      slug: 'tiem-banh',
      description: 'Các tiệm bánh chuyên nghiệp.',
    },
  ],
} as const;

export const fixtureProduct = {
  id: 'cultured-butter-sheet',
  status: 'published',
  featured: true,
  sort: 1,
  image: fixtureFile,
  brand: fixtureBrand,
  categories: [{ id: 'product-category', categories_id: fixtureCategory }],
  applications: [{ id: 'product-application', applications_id: fixtureApplication }],
  audience_channels: [
    { id: 'product-audience', audience_channels_id: fixtureAudienceChannel },
  ],
  translations: [
    {
      id: 'product-en',
      languages_code: 'en',
      name: 'Cultured Butter Sheet',
      slug: 'cultured-butter-sheet',
      description: 'A butter sheet for precise lamination.',
      origin: 'Europe',
      pack_format: '1 kg sheet',
      storage_label: 'Keep chilled',
      storage_temperature: '2–6 °C',
      benefits: ['First benefit', 'Second benefit'],
      image_alt: 'Cultured butter sheet',
    },
    {
      id: 'product-vi',
      languages_code: 'vi',
      name: 'Bơ lát lên men',
      slug: 'bo-lat-len-men',
      description: 'Bơ lát dành cho kỹ thuật cán lớp.',
      origin: 'Châu Âu',
      pack_format: 'Tấm 1 kg',
      storage_label: 'Bảo quản lạnh',
      storage_temperature: '2–6 °C',
      benefits: ['Lợi ích thứ nhất', 'Lợi ích thứ hai'],
      image_alt: 'Bơ lát lên men',
    },
  ],
} as const;

export const fixturePartner = {
  id: 'mega-mart',
  status: 'published',
  group: 'retail',
  source_url: 'https://example.com/source',
  sort: 1,
  logo: { ...fixtureFile, id: 'file-partner', width: 512, height: 207 },
  translations: [
    {
      id: 'partner-en',
      languages_code: 'en',
      name: 'Mega Market',
      logo_alt: 'Mega Market partner mark',
    },
    {
      id: 'partner-vi',
      languages_code: 'vi',
      name: 'Mega Market',
      logo_alt: 'Logo đối tác Mega Market',
    },
  ],
} as const;

export const fixtureSiteSettings = {
  id: 'settings',
  status: 'published',
  logo: { ...fixtureFile, id: 'file-logo', width: 640, height: 240 },
  email: 'hello@example.com',
  phone: '+84 900 000 000',
  translations: [
    {
      id: 'settings-en',
      languages_code: 'en',
      site_name: 'Paradise Fine Foods',
      site_description: 'Professional foodservice ingredients.',
      address: 'Ho Chi Minh City',
      footer_copy: 'Handled with care.',
    },
    {
      id: 'settings-vi',
      languages_code: 'vi',
      site_name: 'Thực Phẩm Paradise',
      site_description: 'Nguyên liệu dịch vụ ăn uống chuyên nghiệp.',
      address: 'Thành phố Hồ Chí Minh',
      footer_copy: 'Được chăm chút cẩn thận.',
    },
  ],
} as const;

export const fixtureHomePage = {
  id: 'home',
  status: 'published',
  featured_product: fixtureProduct,
  hero_image: { ...fixtureFile, id: 'file-hero', width: 1600, height: 1100 },
  editorial_image: { ...fixtureFile, id: 'file-editorial', width: 1600, height: 1000 },
  translations: [
    {
      id: 'home-en',
      languages_code: 'en',
      hero_eyebrow: 'Pastry selection',
      hero_title: 'Ingredients shaped for thoughtful menus',
      hero_body: 'Explore professional ingredients.',
      hero_image_alt: 'Featured butter presentation',
      editorial_title: 'Built around the professional table',
      editorial_body: 'A focused portfolio for professional kitchens.',
      editorial_image_alt: 'Professional kitchen still life',
    },
    {
      id: 'home-vi',
      languages_code: 'vi',
      hero_eyebrow: 'Tuyển chọn cho bánh ngọt',
      hero_title: 'Nguyên liệu cho thực đơn chỉn chu',
      hero_body: 'Khám phá nguyên liệu chuyên nghiệp.',
      hero_image_alt: 'Trình bày sản phẩm bơ nổi bật',
      editorial_title: 'Được xây dựng quanh bàn bếp chuyên nghiệp',
      editorial_body: 'Danh mục tập trung cho bếp chuyên nghiệp.',
      editorial_image_alt: 'Tĩnh vật bếp chuyên nghiệp',
    },
  ],
} as const;

export const fixtureBlogPost = {
  id: 'temperature-discipline',
  status: 'published',
  image: { ...fixtureFile, id: 'file-blog', width: 1600, height: 1000 },
  published_at: '2026-07-12',
  reading_minutes: 6,
  translations: [
    {
      id: 'blog-en',
      languages_code: 'en',
      title: 'Why temperature discipline protects pastry',
      slug: 'temperature-discipline-pastry',
      excerpt: 'Practical cold-chain notes.',
      category: 'Cold-chain notes',
      body: '<h2>Safe heading</h2><p onclick="evil()">Keep <strong>cold</strong> and <em>steady</em>.</p><ul><li>Cold storage</li></ul><ol><li>Check temperature</li></ol><blockquote>Handle with care.</blockquote><pre><code>2–6 °C</code></pre><script>alert(1)</script><a href="javascript:alert(2)">bad</a><a href="https://example.com" target="_blank" title="Read">safe</a><a href="https://example.com" target="popup">popup</a><img src="https://evil.test/a.jpg">',
      image_alt: 'Ingredients in cold storage',
    },
    {
      id: 'blog-vi',
      languages_code: 'vi',
      title: 'Vì sao kỷ luật nhiệt độ bảo vệ bánh',
      slug: 'ky-luat-nhiet-do-banh-ngot',
      excerpt: 'Ghi chú thực tế về chuỗi lạnh.',
      category: 'Ghi chú chuỗi lạnh',
      body: '<h2>Điều kiện bảo quản</h2><p>Giữ sản phẩm lạnh.</p>',
      image_alt: 'Nguyên liệu trong kho lạnh',
    },
  ],
} as const;

export const fixtureRecipe = {
  id: 'recipe-butter-lamination',
  status: 'published',
  image: { ...fixtureFile, id: 'file-recipe', width: 1600, height: 1000 },
  published_at: '2026-08-03',
  reading_minutes: 8,
  translations: [
    {
      id: 'recipe-en',
      languages_code: 'en',
      title: 'Butter lamination method',
      slug: 'butter-lamination-method',
      excerpt: 'A controlled pastry method for folded butter dough.',
      category: 'Pastry method',
      body: '<h2>Recipe method</h2><p onclick="evil()">Keep the dough <strong>cool</strong> before folding.</p><ul><li>Sheet butter evenly</li></ul><ol><li>Rest between turns</li></ol><blockquote>Chill before service.</blockquote><pre><code>2 turns</code></pre><script>alert(1)</script><a href="javascript:alert(2)">bad</a><a href="https://example.com" target="_blank" title="Read">safe</a><a href="https://example.com" target="popup">popup</a><img src="https://evil.test/a.jpg">',
      image_alt: 'Laminated butter dough',
    },
    {
      id: 'recipe-vi',
      languages_code: 'vi',
      title: 'Cách cán lớp bơ',
      slug: 'cach-can-lop-bo',
      excerpt: 'Phương pháp kiểm soát cho bột cán lớp với bơ.',
      category: 'Phương pháp bánh',
      body: '<h2>Phương pháp công thức</h2><p>Giữ bột lạnh trước khi gấp.</p>',
      image_alt: 'Bột cán lớp với bơ',
    },
  ],
} as const;

export const directusFixture = {
  siteSettings: fixtureSiteSettings,
  homePage: fixtureHomePage,
  categories: [fixtureCategory],
  brands: [fixtureBrand],
  products: [fixtureProduct],
  applications: [fixtureApplication],
  audienceChannels: [fixtureAudienceChannel],
  blogPosts: [fixtureBlogPost],
  recipes: [fixtureRecipe],
  partners: [fixturePartner],
} as const;

const rawFile = (
  id: string,
  image: { width: number; height: number },
) => ({
  id: `file-${id}`,
  width: image.width,
  height: image.height,
  filename_download: `${id}.webp`,
  type: 'image/webp',
});

const rawCategories = demoCategories.map((category, index) => ({
  id: category.id,
  status: 'published',
  sort: index + 1,
  image: rawFile(`category-${category.id}`, category.image),
  translations: (['en', 'vi'] as const).map((locale) => ({
    id: `${category.id}-${locale}`,
    languages_code: locale,
    name: category.name[locale],
    slug: category.slug[locale],
    description: category.description[locale],
    image_alt: category.image.alt[locale],
  })),
}));

const rawBrands = demoBrands.map((brand, index) => ({
  id: brand.id,
  status: 'published',
  accent: brand.accent,
  sort: index + 1,
  image: rawFile(`brand-${brand.id}`, brand.image),
  translations: (['en', 'vi'] as const).map((locale) => ({
    id: `${brand.id}-${locale}`,
    languages_code: locale,
    name: brand.name[locale],
    slug: brand.slug[locale],
    description: brand.description[locale],
    origin: brand.origin[locale],
    image_alt: brand.image.alt[locale],
  })),
}));

const applicationIds = [
  ...new Set(demoProducts.flatMap(({ applications }) => applications)),
];
const applicationTranslationNames: Record<string, { en: string; vi: string }> = {
  lamination: { en: 'Lamination', vi: 'Cán lớp' },
  viennoiserie: { en: 'Viennoiserie', vi: 'Bánh viennoiserie' },
  whipping: { en: 'Whipping', vi: 'Đánh bông' },
  sauces: { en: 'Sauces', vi: 'Xốt' },
  tiramisu: { en: 'Tiramisu', vi: 'Tiramisu' },
  desserts: { en: 'Desserts', vi: 'Món tráng miệng' },
  cheesecake: { en: 'Cheesecake', vi: 'Bánh phô mai' },
  spreads: { en: 'Spreads', vi: 'Món phết' },
  pizza: { en: 'Pizza', vi: 'Pizza' },
  baking: { en: 'Baking', vi: 'Làm bánh' },
  cooking: { en: 'Cooking', vi: 'Nấu ăn' },
};
const audienceChannelIds = [
  ...new Set(demoProducts.flatMap(({ audienceChannels }) => audienceChannels)),
];

const rawApplications = applicationIds.map((id, index) => ({
  id,
  status: 'published',
  sort: index + 1,
  translations: (['en', 'vi'] as const).map((locale) => ({
    id: `${id}-${locale}`,
    languages_code: locale,
    name: applicationTranslationNames[id]?.[locale] ?? id,
    slug: id,
    description: '',
  })),
}));

const rawAudienceChannels = audienceChannelIds.map((id, index) => ({
  id,
  status: 'published',
  sort: index + 1,
  translations: (['en', 'vi'] as const).map((locale) => ({
    id: `${id}-${locale}`,
    languages_code: locale,
    name: id,
    slug: id,
    description: '',
  })),
}));

const rawProducts = demoProducts.map((product, index) => {
  const brand = rawBrands.find(({ id }) => id === product.brandId)!;
  return {
    id: product.id,
    status: 'published',
    featured: product.featured,
    sort: index + 1,
    image: rawFile(`product-${product.id}`, product.image),
    brand,
    categories: product.categoryIds.map((id) => ({
      id: `${product.id}-${id}`,
      categories_id: rawCategories.find((category) => category.id === id)!,
    })),
    applications: product.applications.map((id) => ({
      id: `${product.id}-${id}`,
      applications_id: rawApplications.find((application) => application.id === id)!,
    })),
    audience_channels: product.audienceChannels.map((id) => ({
      id: `${product.id}-${id}`,
      audience_channels_id: rawAudienceChannels.find((channel) => channel.id === id)!,
    })),
    translations: (['en', 'vi'] as const).map((locale) => ({
      id: `${product.id}-${locale}`,
      languages_code: locale,
      name: product.name[locale],
      slug: product.slug[locale],
      description: product.description[locale],
      origin: product.origin[locale],
      pack_format: product.packFormat[locale],
      storage_label: product.storage.label[locale],
      storage_temperature: product.storage.temperature,
      benefits: [...product.benefits[locale]],
      image_alt: product.image.alt[locale],
    })),
  };
});

const rawBlogPosts = demoBlogPosts.map((post) => ({
  id: post.id,
  status: 'published',
  image: rawFile(`blog-${post.id}`, post.image),
  published_at: post.publishedAt,
  reading_minutes: post.readingMinutes,
  translations: (['en', 'vi'] as const).map((locale) => ({
    id: `${post.id}-${locale}`,
    languages_code: locale,
    title: post.title[locale],
    slug: post.slug[locale],
    excerpt: post.excerpt[locale],
    category: post.category[locale],
    body: post.sections[locale]
      .map(({ heading, paragraphs }) => [
        heading ? `<h2>${heading}</h2>` : '',
        ...paragraphs.map((paragraph) => `<p>${paragraph}</p>`),
      ].join(''))
      .join(''),
    image_alt: post.image.alt[locale],
  })),
}));

const rawRecipes = [
  {
    id: 'recipe-butter-lamination',
    publishedAt: '2026-08-03',
    readingMinutes: 8,
    image: { width: 1600, height: 1000 },
    translations: {
      en: {
        id: 'recipe-butter-lamination-en',
        title: 'Butter lamination method',
        slug: 'butter-lamination-method',
        excerpt: 'A controlled pastry method for folded butter dough.',
        category: 'Pastry method',
        body: '<h2>Recipe method</h2><p>Keep the dough <strong>cool</strong> before folding.</p>',
        imageAlt: 'Laminated butter dough',
      },
      vi: {
        id: 'recipe-butter-lamination-vi',
        title: 'Cách cán lớp bơ',
        slug: 'cach-can-lop-bo',
        excerpt: 'Phương pháp kiểm soát cho bột cán lớp với bơ.',
        category: 'Phương pháp bánh',
        body: '<h2>Phương pháp công thức</h2><p>Giữ bột lạnh trước khi gấp.</p>',
        imageAlt: 'Bột cán lớp với bơ',
      },
    },
  },
  {
    id: 'recipe-cream-chantilly',
    publishedAt: '2026-07-27',
    readingMinutes: 5,
    image: { width: 1200, height: 900 },
    translations: {
      en: {
        id: 'recipe-cream-chantilly-en',
        title: 'Stable chantilly cream',
        slug: 'stable-chantilly-cream',
        excerpt: 'Whipped cream handling for busy pastry service.',
        category: 'Cream recipe',
        body: '<h2>Whip and hold</h2><p>Start cold and stop at soft peaks.</p>',
        imageAlt: 'Stable chantilly cream',
      },
      vi: {
        id: 'recipe-cream-chantilly-vi',
        title: 'Kem chantilly ổn định',
        slug: 'kem-chantilly-on-dinh',
        excerpt: 'Cách xử lý kem đánh bông cho ca bánh bận rộn.',
        category: 'Công thức kem',
        body: '<h2>Đánh và giữ kem</h2><p>Bắt đầu lạnh và dừng ở chóp mềm.</p>',
        imageAlt: 'Kem chantilly ổn định',
      },
    },
  },
  {
    id: 'recipe-mascarpone-tiramisu',
    publishedAt: '2026-07-18',
    readingMinutes: 7,
    image: { width: 1200, height: 900 },
    translations: {
      en: {
        id: 'recipe-mascarpone-tiramisu-en',
        title: 'Professional tiramisu cream',
        slug: 'professional-tiramisu-cream',
        excerpt: 'A mascarpone base for clean slicing and service.',
        category: 'Dessert recipe',
        body: '<h2>Build the cream</h2><p>Fold mascarpone gently into the base.</p>',
        imageAlt: 'Tiramisu cream in preparation',
      },
      vi: {
        id: 'recipe-mascarpone-tiramisu-vi',
        title: 'Kem tiramisu chuyên nghiệp',
        slug: 'kem-tiramisu-chuyen-nghiep',
        excerpt: 'Nền mascarpone giúp cắt lát và phục vụ gọn gàng.',
        category: 'Công thức tráng miệng',
        body: '<h2>Làm nền kem</h2><p>Trộn mascarpone nhẹ tay vào nền kem.</p>',
        imageAlt: 'Kem tiramisu đang chuẩn bị',
      },
    },
  },
  {
    id: 'recipe-mozzarella-bake',
    publishedAt: '2026-07-09',
    readingMinutes: 6,
    image: { width: 1200, height: 900 },
    translations: {
      en: {
        id: 'recipe-mozzarella-bake-en',
        title: 'Mozzarella tray bake',
        slug: 'mozzarella-tray-bake',
        excerpt: 'A repeatable baked cheese dish for service lines.',
        category: 'Kitchen recipe',
        body: '<h2>Bake for service</h2><p>Layer sauce, cheese, and toppings evenly.</p>',
        imageAlt: 'Mozzarella tray bake',
      },
      vi: {
        id: 'recipe-mozzarella-bake-vi',
        title: 'Mozzarella nướng khay',
        slug: 'mozzarella-nuong-khay',
        excerpt: 'Món phô mai nướng lặp lại ổn định cho dây chuyền phục vụ.',
        category: 'Công thức bếp',
        body: '<h2>Nướng cho phục vụ</h2><p>Xếp xốt, phô mai và topping đều tay.</p>',
        imageAlt: 'Mozzarella nướng khay',
      },
    },
  },
].map((recipe) => ({
  id: recipe.id,
  status: 'published',
  image: rawFile(`recipe-${recipe.id}`, recipe.image),
  published_at: recipe.publishedAt,
  reading_minutes: recipe.readingMinutes,
  translations: (['en', 'vi'] as const).map((locale) => ({
    id: recipe.translations[locale].id,
    languages_code: locale,
    title: recipe.translations[locale].title,
    slug: recipe.translations[locale].slug,
    excerpt: recipe.translations[locale].excerpt,
    category: recipe.translations[locale].category,
    body: recipe.translations[locale].body,
    image_alt: recipe.translations[locale].imageAlt,
  })),
}));

const rawPartners = demoBrandingAssets.map((partner, index) => ({
  id: partner.id,
  status: 'published',
  group: partner.group,
  source_url: partner.sourceUrl,
  sort: index + 1,
  logo: rawFile(`partner-${partner.id}`, partner),
  translations: (['en', 'vi'] as const).map((locale) => ({
    id: `${partner.id}-${locale}`,
    languages_code: locale,
    name: partner.id,
    logo_alt: partner.alt[locale],
  })),
}));

const rawSiteSettings = {
  id: 'settings',
  status: 'published',
  logo: rawFile('site-logo', { width: 640, height: 240 }),
  email: 'hello@paradisefinefoods.com',
  phone: '+84 900 000 000',
  translations: (['en', 'vi'] as const).map((locale) => ({
    id: `settings-${locale}`,
    languages_code: locale,
    site_name: demoGlobalSettings.siteName[locale],
    site_description: demoGlobalSettings.siteDescription[locale],
    address: locale === 'en' ? 'Ho Chi Minh City' : 'Thành phố Hồ Chí Minh',
    footer_copy: locale === 'en' ? 'Handled with care.' : 'Được chăm chút cẩn thận.',
  })),
};

const rawHomePage = {
  id: 'home',
  status: 'published',
  featured_product: rawProducts.find(
    ({ id }) => id === demoFeaturedContent.hero.productId,
  )!,
  hero_image: rawFile('home-hero', demoFeaturedContent.hero.image),
  editorial_image: rawFile('home-editorial', demoFeaturedContent.editorial.image),
  translations: (['en', 'vi'] as const).map((locale) => ({
    id: `home-${locale}`,
    languages_code: locale,
    hero_eyebrow: demoFeaturedContent.hero.eyebrow[locale],
    hero_title: demoFeaturedContent.hero.title[locale],
    hero_body: demoFeaturedContent.hero.body[locale],
    hero_image_alt: demoFeaturedContent.hero.image.alt[locale],
    editorial_title: demoFeaturedContent.editorial.title[locale],
    editorial_body: demoFeaturedContent.editorial.body[locale],
    editorial_image_alt: demoFeaturedContent.editorial.image.alt[locale],
  })),
};

const clone = <T>(value: T): T => structuredClone(value);
const localizedBySlug = <T extends {
  translations: Array<{ languages_code: 'en' | 'vi'; slug: string }>;
}>(
  values: T[],
  locale: 'en' | 'vi',
  slug: string,
): T | undefined => values.find(({ translations }) =>
  translations.some((row) => row.languages_code === locale && row.slug === slug));

export const fixtureRepository: CmsRepository = {
  getSiteSettings: async () => clone(rawSiteSettings) as never,
  getHomePage: async () => clone(rawHomePage) as never,
  getCategories: async () => clone(rawCategories) as never,
  getProducts: async () => clone(rawProducts) as never,
  getProductBySlug: async (locale, slug) =>
    clone(localizedBySlug(rawProducts, locale, slug)) as never,
  getBrands: async () => clone(rawBrands) as never,
  getBrandBySlug: async (locale, slug) =>
    clone(localizedBySlug(rawBrands, locale, slug)) as never,
  getPartners: async () => clone(rawPartners) as never,
  getBlogPosts: async () => clone(rawBlogPosts) as never,
  getLatestBlogPosts: async (_locale, limit, excludeId) =>
    clone(rawBlogPosts.filter(({ id }) => id !== excludeId).slice(0, Math.max(0, limit))) as never,
  getBlogPostBySlug: async (locale, slug) =>
    clone(localizedBySlug(rawBlogPosts, locale, slug)) as never,
  getRecipes: async () => clone(rawRecipes) as never,
  getLatestRecipes: async (_locale, limit, excludeId) =>
    clone(rawRecipes.filter(({ id }) => id !== excludeId).slice(0, Math.max(0, limit))) as never,
  getRecipeBySlug: async (locale, slug) =>
    clone(localizedBySlug(rawRecipes, locale, slug)) as never,
};

const fixtureQueries = createCmsQueries(
  fixtureRepository,
  'https://cms.example.com',
);

export const getGlobalSettings = fixtureQueries.getGlobalSettings;
export const getCategories = fixtureQueries.getCategories;
export const getProducts = fixtureQueries.getProducts;
export const getProductBySlug = fixtureQueries.getProductBySlug;
export const getBlogPosts = fixtureQueries.getBlogPosts;
export const getLatestBlogPosts = fixtureQueries.getLatestBlogPosts;
export const getBlogPostBySlug = fixtureQueries.getBlogPostBySlug;
export const getRecipes = fixtureQueries.getRecipes;
export const getLatestRecipes = fixtureQueries.getLatestRecipes;
export const getRecipeBySlug = fixtureQueries.getRecipeBySlug;
export const getBrands = fixtureQueries.getBrands;
export const getBrandBySlug = fixtureQueries.getBrandBySlug;
export const getFeaturedContent = fixtureQueries.getFeaturedContent;
import { createCmsQueries } from '../../src/lib/cms/queries';
import type { CmsRepository } from '../../src/lib/cms/directus/repository';
import {
  demoBlogPosts,
  demoBrandingAssets,
  demoBrands,
  demoCategories,
  demoFeaturedContent,
  demoGlobalSettings,
  demoProducts,
} from './demo-content';
