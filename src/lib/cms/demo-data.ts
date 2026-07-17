import type { BrandAccent, LocalizedSlug, LocalizedText } from './types';
import editorialTableSrc from '../../assets/demo/editorial-table.svg?no-inline';
import livingHeroProductSrc from '../../assets/demo/living-hero-product.svg?no-inline';
import productArtSrc from '../../assets/demo/product-art.svg?no-inline';
import megaMartSrc from '../../assets/brand/paradise/mega-mart.jpeg?no-inline';
import winmartSrc from '../../assets/brand/paradise/winmart.png?no-inline';
import aeonMallSrc from '../../assets/brand/paradise/aeon-mall.png?no-inline';
import emartSrc from '../../assets/brand/paradise/emart.png?no-inline';
import lotteMartSrc from '../../assets/brand/paradise/lotte-mart.png?no-inline';
import bachHoaXanhSrc from '../../assets/brand/paradise/bach-hoa-xanh.png?no-inline';
import satraSrc from '../../assets/brand/paradise/satra.png?no-inline';
import beeMartSrc from '../../assets/brand/paradise/beemart.png?no-inline';

interface DemoImageAsset {
  src: string;
  width: number;
  height: number;
  alt: LocalizedText;
}

export interface DemoCategory {
  id: string;
  slug: LocalizedSlug;
  name: LocalizedText;
  description: LocalizedText;
  image: DemoImageAsset;
}

export interface DemoBrand {
  id: string;
  slug: LocalizedSlug;
  name: LocalizedText;
  description: LocalizedText;
  origin: LocalizedText;
  image: DemoImageAsset;
  /** Review-only decorative accent. It must never carry text or interaction state. */
  accent: BrandAccent;
}

export interface DemoProduct {
  id: string;
  slug: LocalizedSlug;
  name: LocalizedText;
  description: LocalizedText;
  image: DemoImageAsset;
  brandId: string;
  categoryIds: string[];
  origin: LocalizedText;
  applications: string[];
  audienceChannels: string[];
  packFormat: LocalizedText;
  storage: { label: LocalizedText; temperature: string };
  benefits: Record<'en' | 'vi', string[]>;
  featured: boolean;
  demo: true;
}

export interface DemoBrandingAsset {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: LocalizedText;
  sourceUrl: string;
  group: 'retail' | 'horeca' | 'ecommerce';
}

const productImage = (en: string, vi: string): DemoImageAsset => ({
  src: productArtSrc,
  width: 1200,
  height: 900,
  alt: { en, vi },
});

const editorialImage = (en: string, vi: string): DemoImageAsset => ({
  src: editorialTableSrc,
  width: 1600,
  height: 1000,
  alt: { en, vi },
});

const livingHeroImage = (en: string, vi: string): DemoImageAsset => ({
  src: livingHeroProductSrc,
  width: 1600,
  height: 1100,
  alt: { en, vi },
});

// All names, specifications, claims, and imagery below are fictional review-only content.
// They must be replaced or approved before this site is used as a factual catalog.
export const demoCategories: DemoCategory[] = [
  {
    id: 'butter',
    slug: { en: 'butter', vi: 'bo' },
    name: { en: 'Butter', vi: 'Bơ' },
    description: {
      en: 'Demo butter formats for professional kitchens.',
      vi: 'Các định dạng bơ minh họa cho bếp chuyên nghiệp.',
    },
    image: productImage('Abstract butter product stage', 'Bối cảnh sản phẩm bơ trừu tượng'),
  },
  {
    id: 'cream',
    slug: { en: 'cream', vi: 'kem-sua' },
    name: { en: 'Cream', vi: 'Kem sữa' },
    description: {
      en: 'Demo cream products for culinary preparation.',
      vi: 'Sản phẩm kem sữa minh họa cho chế biến ẩm thực.',
    },
    image: productImage('Abstract cream product stage', 'Bối cảnh sản phẩm kem sữa trừu tượng'),
  },
  {
    id: 'cheese',
    slug: { en: 'cheese', vi: 'pho-mai' },
    name: { en: 'Cheese', vi: 'Phô mai' },
    description: {
      en: 'Demo cheese formats for foodservice teams.',
      vi: 'Các định dạng phô mai minh họa cho đội ngũ dịch vụ ăn uống.',
    },
    image: productImage('Abstract cheese product stage', 'Bối cảnh sản phẩm phô mai trừu tượng'),
  },
  {
    id: 'pastry',
    slug: { en: 'pastry', vi: 'banh-ngot' },
    name: { en: 'Pastry', vi: 'Bánh ngọt' },
    description: {
      en: 'Demo ingredients selected for pastry workflows.',
      vi: 'Nguyên liệu minh họa dành cho quy trình bánh ngọt.',
    },
    image: productImage('Abstract pastry ingredient stage', 'Bối cảnh nguyên liệu bánh ngọt trừu tượng'),
  },
];

export const demoBrands: DemoBrand[] = [
  {
    id: 'maison-laitiere',
    accent: 'butter',
    slug: { en: 'maison-laitiere', vi: 'nha-sua-maison' },
    name: { en: 'Maison Laitière', vi: 'Nhà Sữa Maison' },
    description: {
      en: 'A fictional review-only dairy house.',
      vi: 'Thương hiệu sữa hư cấu chỉ dùng để duyệt nội dung.',
    },
    origin: { en: 'Fictional European origin', vi: 'Nguồn gốc châu Âu hư cấu' },
    image: productImage('Unbranded Maison Laitière demo pack', 'Bao bì minh họa Nhà Sữa Maison không thương hiệu'),
  },
  {
    id: 'atelier-creme',
    accent: 'bordeaux',
    slug: { en: 'atelier-creme', vi: 'xuong-kem' },
    name: { en: 'Atelier Crème', vi: 'Xưởng Kem' },
    description: {
      en: 'A fictional review-only cream specialist.',
      vi: 'Chuyên gia kem sữa hư cấu chỉ dùng để duyệt nội dung.',
    },
    origin: { en: 'Fictional alpine origin', vi: 'Nguồn gốc vùng núi hư cấu' },
    image: productImage('Unbranded Atelier Crème demo pack', 'Bao bì minh họa Xưởng Kem không thương hiệu'),
  },
  {
    id: 'formagerie-nord',
    accent: 'cold-chain',
    slug: { en: 'formagerie-nord', vi: 'xuong-pho-mai-bac' },
    name: { en: 'Formagerie Nord', vi: 'Xưởng Phô Mai Bắc' },
    description: {
      en: 'A fictional review-only cheese workshop.',
      vi: 'Xưởng phô mai hư cấu chỉ dùng để duyệt nội dung.',
    },
    origin: { en: 'Fictional northern origin', vi: 'Nguồn gốc phương bắc hư cấu' },
    image: productImage('Unbranded Formagerie Nord demo pack', 'Bao bì minh họa Xưởng Phô Mai Bắc không thương hiệu'),
  },
];

export const demoProducts: DemoProduct[] = [
  {
    id: 'cultured-butter-sheet',
    slug: { en: 'cultured-butter-sheet', vi: 'bo-lat-mau' },
    name: { en: 'Cultured Butter Sheet', vi: 'Bơ lát mẫu' },
    description: {
      en: 'A fictional butter sheet created to demonstrate a pastry catalog.',
      vi: 'Bơ lát hư cấu dùng để minh họa danh mục nguyên liệu bánh.',
    },
    image: productImage('Fictional cultured butter sheet on an abstract stage', 'Bơ lát mẫu hư cấu trên bối cảnh trừu tượng'),
    brandId: 'maison-laitiere',
    categoryIds: ['butter', 'pastry'],
    origin: { en: 'Fictional European origin', vi: 'Nguồn gốc châu Âu hư cấu' },
    applications: ['lamination', 'viennoiserie'],
    audienceChannels: ['bakery', 'hotel', 'restaurant'],
    packFormat: { en: 'Demo 1 kg sheet', vi: 'Tấm mẫu 1 kg' },
    storage: { label: { en: 'Keep chilled', vi: 'Bảo quản lạnh' }, temperature: '2–6 °C (demo)' },
    benefits: {
      en: ['Fictional handling benefit', 'Review-only pastry claim'],
      vi: ['Lợi ích thao tác hư cấu', 'Tuyên bố bánh ngọt chỉ để duyệt'],
    },
    featured: true,
    demo: true,
  },
  {
    id: 'whipping-cream-35',
    slug: { en: 'whipping-cream-35', vi: 'kem-danh-bong-mau' },
    name: { en: 'Whipping Cream 35 Demo', vi: 'Kem đánh bông mẫu' },
    description: { en: 'Fictional cream for menu concept review.', vi: 'Kem sữa hư cấu để duyệt ý tưởng thực đơn.' },
    image: productImage('Fictional whipping cream pack on an abstract stage', 'Hộp kem đánh bông hư cấu trên bối cảnh trừu tượng'),
    brandId: 'atelier-creme', categoryIds: ['cream', 'pastry'],
    origin: { en: 'Fictional alpine origin', vi: 'Nguồn gốc vùng núi hư cấu' },
    applications: ['whipping', 'sauces'], audienceChannels: ['bakery', 'hotel', 'restaurant'],
    packFormat: { en: 'Demo 1 L carton', vi: 'Hộp mẫu 1 L' },
    storage: { label: { en: 'Keep chilled', vi: 'Bảo quản lạnh' }, temperature: '2–6 °C (demo)' },
    benefits: { en: ['Fictional stable-whip claim'], vi: ['Tuyên bố độ bông ổn định hư cấu'] },
    featured: true, demo: true,
  },
  {
    id: 'mascarpone-tub',
    slug: { en: 'mascarpone-tub', vi: 'mascarpone-hop-mau' },
    name: { en: 'Mascarpone Demo Tub', vi: 'Mascarpone hộp mẫu' },
    description: { en: 'Fictional mascarpone for dessert concept review.', vi: 'Mascarpone hư cấu để duyệt ý tưởng món tráng miệng.' },
    image: productImage('Fictional mascarpone tub on an abstract stage', 'Hộp mascarpone hư cấu trên bối cảnh trừu tượng'),
    brandId: 'atelier-creme', categoryIds: ['cheese', 'pastry'],
    origin: { en: 'Fictional alpine origin', vi: 'Nguồn gốc vùng núi hư cấu' },
    applications: ['tiramisu', 'desserts'], audienceChannels: ['bakery', 'hotel', 'restaurant'],
    packFormat: { en: 'Demo 500 g tub', vi: 'Hộp mẫu 500 g' },
    storage: { label: { en: 'Keep chilled', vi: 'Bảo quản lạnh' }, temperature: '2–6 °C (demo)' },
    benefits: { en: ['Fictional creamy-texture claim'], vi: ['Tuyên bố kết cấu mịn hư cấu'] },
    featured: false, demo: true,
  },
  {
    id: 'cream-cheese-block',
    slug: { en: 'cream-cheese-block', vi: 'pho-mai-kem-khoi-mau' },
    name: { en: 'Cream Cheese Demo Block', vi: 'Phô mai kem khối mẫu' },
    description: { en: 'Fictional cream cheese for kitchen planning.', vi: 'Phô mai kem hư cấu để lập kế hoạch bếp.' },
    image: productImage('Fictional cream cheese block on an abstract stage', 'Khối phô mai kem hư cấu trên bối cảnh trừu tượng'),
    brandId: 'formagerie-nord', categoryIds: ['cheese'],
    origin: { en: 'Fictional northern origin', vi: 'Nguồn gốc phương bắc hư cấu' },
    applications: ['cheesecake', 'spreads'], audienceChannels: ['bakery', 'hotel', 'restaurant'],
    packFormat: { en: 'Demo 1 kg block', vi: 'Khối mẫu 1 kg' },
    storage: { label: { en: 'Keep chilled', vi: 'Bảo quản lạnh' }, temperature: '2–6 °C (demo)' },
    benefits: { en: ['Fictional blending claim'], vi: ['Tuyên bố phối trộn hư cấu'] },
    featured: false, demo: true,
  },
  {
    id: 'mozzarella-shred',
    slug: { en: 'mozzarella-shred', vi: 'mozzarella-soi-mau' },
    name: { en: 'Mozzarella Demo Shred', vi: 'Mozzarella sợi mẫu' },
    description: { en: 'Fictional shredded cheese for menu prototyping.', vi: 'Phô mai sợi hư cấu để tạo mẫu thực đơn.' },
    image: productImage('Fictional mozzarella shred pack on an abstract stage', 'Gói mozzarella sợi hư cấu trên bối cảnh trừu tượng'),
    brandId: 'formagerie-nord', categoryIds: ['cheese'],
    origin: { en: 'Fictional northern origin', vi: 'Nguồn gốc phương bắc hư cấu' },
    applications: ['pizza', 'baking'], audienceChannels: ['hotel', 'restaurant', 'catering'],
    packFormat: { en: 'Demo 2 kg bag', vi: 'Túi mẫu 2 kg' },
    storage: { label: { en: 'Keep chilled', vi: 'Bảo quản lạnh' }, temperature: '2–6 °C (demo)' },
    benefits: { en: ['Fictional melt claim'], vi: ['Tuyên bố độ tan chảy hư cấu'] },
    featured: false, demo: true,
  },
  {
    id: 'unsalted-butter-block',
    slug: { en: 'unsalted-butter-block', vi: 'bo-nhat-khoi-mau' },
    name: { en: 'Unsalted Butter Demo Block', vi: 'Bơ nhạt khối mẫu' },
    description: { en: 'Fictional unsalted butter for culinary review.', vi: 'Bơ nhạt hư cấu để duyệt ứng dụng ẩm thực.' },
    image: productImage('Fictional unsalted butter block on an abstract stage', 'Khối bơ nhạt hư cấu trên bối cảnh trừu tượng'),
    brandId: 'maison-laitiere', categoryIds: ['butter'],
    origin: { en: 'Fictional European origin', vi: 'Nguồn gốc châu Âu hư cấu' },
    applications: ['baking', 'cooking'], audienceChannels: ['bakery', 'hotel', 'restaurant', 'catering'],
    packFormat: { en: 'Demo 1 kg block', vi: 'Khối mẫu 1 kg' },
    storage: { label: { en: 'Keep chilled', vi: 'Bảo quản lạnh' }, temperature: '2–6 °C (demo)' },
    benefits: { en: ['Fictional versatile-use claim'], vi: ['Tuyên bố đa dụng hư cấu'] },
    featured: false, demo: true,
  },
];

export const demoGlobalSettings = {
  siteName: { en: 'Paradise Fine Foods Demo', vi: 'Thực Phẩm Paradise Bản Mẫu' },
  siteDescription: {
    en: 'A review-only showcase for professional foodservice ingredients.',
    vi: 'Trang giới thiệu chỉ để duyệt cho nguyên liệu dịch vụ ăn uống chuyên nghiệp.',
  },
  demoNotice: {
    en: 'Review-only fictional content: all names, specifications, claims, and imagery are fictional.',
    vi: 'Nội dung hư cấu chỉ để duyệt: mọi tên gọi, thông số, tuyên bố và hình ảnh đều là hư cấu.',
  },
};

export const demoBrandingAssets: DemoBrandingAsset[] = [
  { id: 'mega-mart', src: megaMartSrc, width: 512, height: 207, alt: { en: 'Mega Market partner mark', vi: 'Logo đối tác Mega Market' }, sourceUrl: 'https://paradisefinefoods.com/wp-content/uploads/2021/10/mega-mart.jpeg', group: 'retail' },
  { id: 'winmart', src: winmartSrc, width: 792, height: 397, alt: { en: 'WinMart partner mark', vi: 'Logo đối tác WinMart' }, sourceUrl: 'https://paradisefinefoods.com/wp-content/uploads/2021/10/winmart.png', group: 'retail' },
  { id: 'aeon-mall', src: aeonMallSrc, width: 392, height: 128, alt: { en: 'AEON Mall partner mark', vi: 'Logo đối tác AEON Mall' }, sourceUrl: 'https://paradisefinefoods.com/wp-content/uploads/2021/10/aeon-mall.png', group: 'retail' },
  { id: 'emart', src: emartSrc, width: 1280, height: 362, alt: { en: 'Emart partner mark', vi: 'Logo đối tác Emart' }, sourceUrl: 'https://paradisefinefoods.com/wp-content/uploads/2021/10/1280px-Emart_Logo.svg_.png', group: 'retail' },
  { id: 'lotte-mart', src: lotteMartSrc, width: 1672, height: 391, alt: { en: 'Lotte Mart partner mark', vi: 'Logo đối tác Lotte Mart' }, sourceUrl: 'https://paradisefinefoods.com/wp-content/uploads/2021/10/1672px-Lotte_Mart_2018.svg_.png', group: 'retail' },
  { id: 'bach-hoa-xanh', src: bachHoaXanhSrc, width: 350, height: 150, alt: { en: 'Bach Hoa Xanh partner mark', vi: 'Logo đối tác Bách Hóa Xanh' }, sourceUrl: 'https://paradisefinefoods.com/wp-content/uploads/2021/10/logo-bach-hoa-xanh.png', group: 'retail' },
  { id: 'satra', src: satraSrc, width: 219, height: 103, alt: { en: 'Satra partner mark', vi: 'Logo đối tác Satra' }, sourceUrl: 'https://paradisefinefoods.com/wp-content/uploads/2021/10/logo-satra.png', group: 'retail' },
  { id: 'beemart', src: beeMartSrc, width: 1074, height: 354, alt: { en: 'BeeMart partner mark', vi: 'Logo đối tác BeeMart' }, sourceUrl: 'https://paradisefinefoods.com/wp-content/uploads/2021/10/beemart_logo_1074x.png', group: 'ecommerce' },
];

export const demoFeaturedContent = {
  hero: {
    eyebrow: { en: 'Pastry demo selection', vi: 'Bộ sưu tập bánh mẫu' },
    title: { en: 'Ingredients shaped for thoughtful menus', vi: 'Nguyên liệu cho thực đơn chỉn chu' },
    body: { en: 'Explore fictional products prepared for design review.', vi: 'Khám phá sản phẩm hư cấu được chuẩn bị để duyệt thiết kế.' },
    productId: 'cultured-butter-sheet',
    image: livingHeroImage('Fictional featured butter presentation', 'Trình bày bơ nổi bật hư cấu'),
  },
  editorial: {
    title: { en: 'Built around the professional table', vi: 'Được xây dựng quanh bàn bếp chuyên nghiệp' },
    body: { en: 'Original demo imagery and copy for stakeholder review.', vi: 'Hình ảnh và nội dung mẫu nguyên bản để các bên liên quan duyệt.' },
    image: editorialImage('Abstract professional kitchen still life', 'Tĩnh vật bếp chuyên nghiệp trừu tượng'),
  },
};
