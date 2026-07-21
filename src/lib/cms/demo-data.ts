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
  /** Decorative accent. It must never carry text or interaction state. */
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

export interface DemoBlogSection { heading?: string; paragraphs: string[] }
export interface DemoBlogPost {
  id: string;
  slug: LocalizedSlug;
  title: LocalizedText;
  excerpt: LocalizedText;
  publishedAt: string;
  readingMinutes: number;
  category: LocalizedText;
  image: DemoImageAsset;
  sections: Record<'en' | 'vi', DemoBlogSection[]>;
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

export const demoCategories: DemoCategory[] = [
  {
    id: 'butter',
    slug: { en: 'butter', vi: 'bo' },
    name: { en: 'Butter', vi: 'Bơ' },
    description: {
      en: 'Professional butter formats for pastry and culinary teams.',
      vi: 'Các định dạng bơ dành cho đội ngũ làm bánh và bếp chuyên nghiệp.',
    },
    image: productImage('Abstract butter product stage', 'Bối cảnh sản phẩm bơ trừu tượng'),
  },
  {
    id: 'cream',
    slug: { en: 'cream', vi: 'kem-sua' },
    name: { en: 'Cream', vi: 'Kem sữa' },
    description: {
      en: 'Cream products selected for professional culinary preparation.',
      vi: 'Sản phẩm kem sữa dành cho chế biến ẩm thực chuyên nghiệp.',
    },
    image: productImage('Abstract cream product stage', 'Bối cảnh sản phẩm kem sữa trừu tượng'),
  },
  {
    id: 'cheese',
    slug: { en: 'cheese', vi: 'pho-mai' },
    name: { en: 'Cheese', vi: 'Phô mai' },
    description: {
      en: 'Cheese formats selected for foodservice teams.',
      vi: 'Các định dạng phô mai dành cho đội ngũ dịch vụ ăn uống.',
    },
    image: productImage('Abstract cheese product stage', 'Bối cảnh sản phẩm phô mai trừu tượng'),
  },
  {
    id: 'pastry',
    slug: { en: 'pastry', vi: 'banh-ngot' },
    name: { en: 'Pastry', vi: 'Bánh ngọt' },
    description: {
      en: 'Ingredients selected for consistent pastry workflows.',
      vi: 'Nguyên liệu tuyển chọn cho quy trình làm bánh ổn định.',
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
      en: 'A dairy house focused on dependable professional butter formats.',
      vi: 'Nhà sản xuất sữa tập trung vào các định dạng bơ chuyên nghiệp ổn định.',
    },
    origin: { en: 'Europe', vi: 'Châu Âu' },
    image: productImage('Maison Laitière product presentation', 'Sản phẩm Nhà Sữa Maison'),
  },
  {
    id: 'atelier-creme',
    accent: 'bordeaux',
    slug: { en: 'atelier-creme', vi: 'xuong-kem' },
    name: { en: 'Atelier Crème', vi: 'Xưởng Kem' },
    description: {
      en: 'A cream specialist serving pastry and culinary teams.',
      vi: 'Chuyên gia kem sữa phục vụ đội ngũ làm bánh và bếp chuyên nghiệp.',
    },
    origin: { en: 'Alpine Europe', vi: 'Vùng Alps, Châu Âu' },
    image: productImage('Atelier Crème product presentation', 'Sản phẩm Xưởng Kem'),
  },
  {
    id: 'formagerie-nord',
    accent: 'cold-chain',
    slug: { en: 'formagerie-nord', vi: 'xuong-pho-mai-bac' },
    name: { en: 'Formagerie Nord', vi: 'Xưởng Phô Mai Bắc' },
    description: {
      en: 'A cheese workshop focused on practical foodservice formats.',
      vi: 'Nhà sản xuất phô mai tập trung vào quy cách phù hợp dịch vụ ăn uống.',
    },
    origin: { en: 'Northern Europe', vi: 'Bắc Âu' },
    image: productImage('Formagerie Nord product presentation', 'Sản phẩm Xưởng Phô Mai Bắc'),
  },
];

export const demoProducts: DemoProduct[] = [
  {
    id: 'cultured-butter-sheet',
    slug: { en: 'cultured-butter-sheet', vi: 'bo-lat-len-men' },
    name: { en: 'Cultured Butter Sheet', vi: 'Bơ lát lên men' },
    description: {
      en: 'A cultured butter sheet designed for precise pastry lamination.',
      vi: 'Bơ lát lên men dành cho kỹ thuật cán lớp bánh chính xác.',
    },
    image: productImage('Cultured butter sheet on an abstract stage', 'Bơ lát lên men trên bối cảnh trừu tượng'),
    brandId: 'maison-laitiere',
    categoryIds: ['butter', 'pastry'],
    origin: { en: 'Europe', vi: 'Châu Âu' },
    applications: ['lamination', 'viennoiserie'],
    audienceChannels: ['bakery', 'hotel', 'restaurant'],
    packFormat: { en: '1 kg sheet', vi: 'Tấm 1 kg' },
    storage: { label: { en: 'Keep chilled', vi: 'Bảo quản lạnh' }, temperature: '2–6 °C' },
    benefits: {
      en: ['Consistent handling during lamination', 'Reliable pastry performance'],
      vi: ['Dễ thao tác khi cán lớp', 'Hiệu năng ổn định cho bánh ngọt'],
    },
    featured: true,
  },
  {
    id: 'whipping-cream-35',
    slug: { en: 'whipping-cream-35', vi: 'kem-danh-bong-35' },
    name: { en: 'Whipping Cream 35', vi: 'Kem đánh bông 35' },
    description: { en: 'Professional whipping cream for pastry and culinary preparation.', vi: 'Kem đánh bông chuyên nghiệp cho làm bánh và chế biến ẩm thực.' },
    image: productImage('Whipping cream pack on an abstract stage', 'Hộp kem đánh bông trên bối cảnh trừu tượng'),
    brandId: 'atelier-creme', categoryIds: ['cream', 'pastry'],
    origin: { en: 'Alpine Europe', vi: 'Vùng Alps, Châu Âu' },
    applications: ['whipping', 'sauces'], audienceChannels: ['bakery', 'hotel', 'restaurant'],
    packFormat: { en: '1 L carton', vi: 'Hộp 1 L' },
    storage: { label: { en: 'Keep chilled', vi: 'Bảo quản lạnh' }, temperature: '2–6 °C' },
    benefits: { en: ['Stable whipping performance'], vi: ['Độ bông ổn định'] },
    featured: true,
  },
  {
    id: 'mascarpone-tub',
    slug: { en: 'mascarpone-tub', vi: 'mascarpone-hop' },
    name: { en: 'Mascarpone Tub', vi: 'Mascarpone hộp' },
    description: { en: 'Mascarpone with a smooth texture for desserts and pastry.', vi: 'Mascarpone kết cấu mịn dành cho món tráng miệng và bánh ngọt.' },
    image: productImage('Mascarpone tub on an abstract stage', 'Hộp mascarpone trên bối cảnh trừu tượng'),
    brandId: 'atelier-creme', categoryIds: ['cheese', 'pastry'],
    origin: { en: 'Alpine Europe', vi: 'Vùng Alps, Châu Âu' },
    applications: ['tiramisu', 'desserts'], audienceChannels: ['bakery', 'hotel', 'restaurant'],
    packFormat: { en: '500 g tub', vi: 'Hộp 500 g' },
    storage: { label: { en: 'Keep chilled', vi: 'Bảo quản lạnh' }, temperature: '2–6 °C' },
    benefits: { en: ['Smooth, creamy texture'], vi: ['Kết cấu mịn và béo'] },
    featured: false,
  },
  {
    id: 'cream-cheese-block',
    slug: { en: 'cream-cheese-block', vi: 'pho-mai-kem-khoi' },
    name: { en: 'Cream Cheese Block', vi: 'Phô mai kem khối' },
    description: { en: 'Professional cream cheese for baking, spreads, and kitchen preparation.', vi: 'Phô mai kem chuyên nghiệp cho làm bánh, món phết và chế biến trong bếp.' },
    image: productImage('Cream cheese block on an abstract stage', 'Khối phô mai kem trên bối cảnh trừu tượng'),
    brandId: 'formagerie-nord', categoryIds: ['cheese'],
    origin: { en: 'Northern Europe', vi: 'Bắc Âu' },
    applications: ['cheesecake', 'spreads'], audienceChannels: ['bakery', 'hotel', 'restaurant'],
    packFormat: { en: '1 kg block', vi: 'Khối 1 kg' },
    storage: { label: { en: 'Keep chilled', vi: 'Bảo quản lạnh' }, temperature: '2–6 °C' },
    benefits: { en: ['Blends smoothly in professional recipes'], vi: ['Phối trộn mượt trong công thức chuyên nghiệp'] },
    featured: false,
  },
  {
    id: 'mozzarella-shred',
    slug: { en: 'mozzarella-shred', vi: 'mozzarella-soi' },
    name: { en: 'Mozzarella Shred', vi: 'Mozzarella sợi' },
    description: { en: 'Shredded mozzarella for pizza, baking, and foodservice menus.', vi: 'Mozzarella sợi dành cho pizza, làm bánh và thực đơn dịch vụ ăn uống.' },
    image: productImage('Mozzarella shred pack on an abstract stage', 'Gói mozzarella sợi trên bối cảnh trừu tượng'),
    brandId: 'formagerie-nord', categoryIds: ['cheese'],
    origin: { en: 'Northern Europe', vi: 'Bắc Âu' },
    applications: ['pizza', 'baking'], audienceChannels: ['hotel', 'restaurant', 'catering'],
    packFormat: { en: '2 kg bag', vi: 'Túi 2 kg' },
    storage: { label: { en: 'Keep chilled', vi: 'Bảo quản lạnh' }, temperature: '2–6 °C' },
    benefits: { en: ['Even melting for consistent service'], vi: ['Tan chảy đồng đều khi chế biến'] },
    featured: false,
  },
  {
    id: 'unsalted-butter-block',
    slug: { en: 'unsalted-butter-block', vi: 'bo-nhat-khoi' },
    name: { en: 'Unsalted Butter Block', vi: 'Bơ nhạt khối' },
    description: { en: 'Unsalted butter for baking, cooking, and professional preparation.', vi: 'Bơ nhạt dành cho làm bánh, nấu ăn và chế biến chuyên nghiệp.' },
    image: productImage('Unsalted butter block on an abstract stage', 'Khối bơ nhạt trên bối cảnh trừu tượng'),
    brandId: 'maison-laitiere', categoryIds: ['butter'],
    origin: { en: 'Europe', vi: 'Châu Âu' },
    applications: ['baking', 'cooking'], audienceChannels: ['bakery', 'hotel', 'restaurant', 'catering'],
    packFormat: { en: '1 kg block', vi: 'Khối 1 kg' },
    storage: { label: { en: 'Keep chilled', vi: 'Bảo quản lạnh' }, temperature: '2–6 °C' },
    benefits: { en: ['Versatile use across bakery and culinary work'], vi: ['Linh hoạt cho làm bánh và chế biến món ăn'] },
    featured: false,
  },
];

export const demoGlobalSettings = {
  siteName: { en: 'Paradise Fine Foods', vi: 'Thực Phẩm Paradise' },
  siteDescription: {
    en: 'Professional foodservice ingredients, handled with care and delivered across Vietnam.',
    vi: 'Nguyên liệu dịch vụ ăn uống chuyên nghiệp, được bảo quản cẩn thận và phân phối trên toàn Việt Nam.',
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
    eyebrow: { en: 'Pastry selection', vi: 'Tuyển chọn cho bánh ngọt' },
    title: { en: 'Ingredients shaped for thoughtful menus', vi: 'Nguyên liệu cho thực đơn chỉn chu' },
    body: { en: 'Explore professional ingredients selected for precise, repeatable pastry work.', vi: 'Khám phá nguyên liệu chuyên nghiệp dành cho quy trình làm bánh chính xác và ổn định.' },
    productId: 'cultured-butter-sheet',
    image: livingHeroImage('Featured butter presentation', 'Trình bày sản phẩm bơ nổi bật'),
  },
  editorial: {
    title: { en: 'Built around the professional table', vi: 'Được xây dựng quanh bàn bếp chuyên nghiệp' },
    body: { en: 'A focused portfolio for professional kitchens, pastry teams, and retail partners.', vi: 'Danh mục tập trung cho bếp chuyên nghiệp, đội ngũ làm bánh và đối tác bán lẻ.' },
    image: editorialImage('Abstract professional kitchen still life', 'Tĩnh vật bếp chuyên nghiệp trừu tượng'),
  },
};

export const demoBlogPosts: DemoBlogPost[] = [
  {
    id: 'temperature-discipline',
    slug: { en: 'temperature-discipline-pastry', vi: 'ky-luat-nhiet-do-banh-ngot' },
    title: { en: 'Why temperature discipline protects pastry performance', vi: 'VÃ¬ sao ká»· luáº­t nhiá»‡t Ä‘á»™ báº£o vá»‡ hiá»‡u suáº¥t lÃ m bÃ¡nh' },
    excerpt: { en: 'Practical cold-chain notes for professional pastry teams.', vi: 'Ghi chÃº thá»±c táº¿ vá» chuá»—i láº¡nh cho Ä‘á»™i ngÅ© bÃ¡nh chuyÃªn nghiá»‡p.' },
    publishedAt: '2026-07-12', readingMinutes: 6,
    category: { en: 'Cold-chain notes', vi: 'Ghi chÃº chuá»—i láº¡nh' },
    image: editorialImage('Professional pastry ingredients arranged for cold storage', 'NguyÃªn liá»‡u bÃ¡nh chuyÃªn nghiá»‡p Ä‘Æ°á»£c sáº¯p xáº¿p Ä‘á»ƒ báº£o quáº£n láº¡nh'),
    sections: {
      en: [
        { paragraphs: ['Good pastry begins before the dough reaches the bench. Stable receiving and storage conditions help teams protect ingredient consistency.'] },
        { heading: 'Make conditions visible', paragraphs: ['Record delivery temperatures, return chilled products promptly, and give every shift the same handling reference.'] },
      ],
      vi: [
        { paragraphs: ['Má»™t máº» bÃ¡nh tá»‘t báº¯t Ä‘áº§u trÆ°á»›c khi bá»™t lÃªn bÃ n. Äiá»u kiá»‡n tiáº¿p nháº­n vÃ  báº£o quáº£n á»•n Ä‘á»‹nh giÃºp Ä‘á»™i ngÅ© duy trÃ¬ tÃ­nh nháº¥t quÃ¡n cá»§a nguyÃªn liá»‡u.'] },
        { heading: 'LÃ m rÃµ Ä‘iá»u kiá»‡n báº£o quáº£n', paragraphs: ['Ghi nháº­n nhiá»‡t Ä‘á»™ khi giao hÃ ng, Ä‘Æ°a sáº£n pháº©m trá»Ÿ láº¡i kho láº¡nh ká»‹p thá»i vÃ  dÃ¹ng chung hÆ°á»›ng dáº«n xá»­ lÃ½ cho má»i ca lÃ m viá»‡c.'] },
      ],
    },
  },
  {
    id: 'cream-for-service',
    slug: { en: 'choosing-cream-for-service', vi: 'chon-kem-sua-cho-phuc-vu' },
    title: { en: 'Choosing cream for a busy service', vi: 'Chá»n kem sá»¯a cho ca phá»¥c vá»¥ báº­n rá»™n' },
    excerpt: { en: 'Match format and handling to the work your kitchen repeats every day.', vi: 'Káº¿t há»£p quy cÃ¡ch vÃ  cÃ¡ch xá»­ lÃ½ vá»›i cÃ´ng viá»‡c nhÃ  báº¿p láº·p láº¡i má»—i ngÃ y.' },
    publishedAt: '2026-07-04', readingMinutes: 4,
    category: { en: 'Application guide', vi: 'HÆ°á»›ng dáº«n á»©ng dá»¥ng' },
    image: productImage('Cream carton on an abstract professional kitchen stage', 'Há»™p kem sá»¯a trÃªn bá»‘i cáº£nh báº¿p chuyÃªn nghiá»‡p trá»«u tÆ°á»£ng'),
    sections: {
      en: [
        { paragraphs: ['The best cream choice starts with the task: whipping, sauces, finishing, or a combination across service.'] },
        { heading: 'Choose for the workflow', paragraphs: ['Compare pack size, storage space, opening frequency, and the consistency your team needs during peak hours.'] },
      ],
      vi: [
        { paragraphs: ['Lá»±a chá»n kem sá»¯a phÃ¹ há»£p báº¯t Ä‘áº§u tá»« cÃ´ng viá»‡c: Ä‘Ã¡nh bÃ´ng, lÃ m xá»‘t, hoÃ n thiá»‡n mÃ³n hoáº·c káº¿t há»£p trong suá»‘t ca phá»¥c vá»¥.'] },
        { heading: 'Chá»n theo quy trÃ¬nh', paragraphs: ['So sÃ¡nh dung tÃ­ch, khÃ´ng gian báº£o quáº£n, táº§n suáº¥t má»Ÿ há»™p vÃ  Ä‘á»™ á»•n Ä‘á»‹nh Ä‘á»™i ngÅ© cáº§n trong giá» cao Ä‘iá»ƒm.'] },
      ],
    },
  },
  {
    id: 'focused-dairy-house',
    slug: { en: 'inside-a-focused-dairy-house', vi: 'ben-trong-nha-sua-chuyen-biet' },
    title: { en: 'Inside a focused dairy house', vi: 'BÃªn trong má»™t nhÃ  sá»¯a chuyÃªn biá»‡t' },
    excerpt: { en: 'Dependable professional formats begin with a clear production point of view.', vi: 'Quy cÃ¡ch chuyÃªn nghiá»‡p Ä‘Ã¡ng tin cáº­y báº¯t Ä‘áº§u tá»« Ä‘á»‹nh hÆ°á»›ng sáº£n xuáº¥t rÃµ rÃ ng.' },
    publishedAt: '2026-06-26', readingMinutes: 5,
    category: { en: 'Producer story', vi: 'CÃ¢u chuyá»‡n nhÃ  sáº£n xuáº¥t' },
    image: livingHeroImage('Dairy producer presentation with professional ingredients', 'TrÃ¬nh bÃ y nhÃ  sáº£n xuáº¥t sá»¯a cÃ¹ng nguyÃªn liá»‡u chuyÃªn nghiá»‡p'),
    sections: {
      en: [
        { paragraphs: ['A focused producer designs formats around repeatable kitchen work, not novelty alone.'] },
        { heading: 'Clarity travels', paragraphs: ['Clear specifications help distributors and kitchen teams preserve the makerâ€™s intent through storage, delivery, and use.'] },
      ],
      vi: [
        { paragraphs: ['Má»™t nhÃ  sáº£n xuáº¥t chuyÃªn biá»‡t xÃ¢y dá»±ng quy cÃ¡ch quanh cÃ´ng viá»‡c báº¿p cÃ³ thá»ƒ láº·p láº¡i, khÃ´ng chá»‰ quanh sá»± má»›i láº¡.'] },
        { heading: 'Sá»± rÃµ rÃ ng Ä‘i cÃ¹ng sáº£n pháº©m', paragraphs: ['ThÃ´ng sá»‘ rÃµ rÃ ng giÃºp nhÃ  phÃ¢n phá»‘i vÃ  Ä‘á»™i ngÅ© báº¿p giá»¯ Ä‘Ãºng Ã½ Ä‘á»“ cá»§a nhÃ  sáº£n xuáº¥t trong báº£o quáº£n, giao hÃ ng vÃ  sá»­ dá»¥ng.'] },
      ],
    },
  },
  {
    id: 'consistent-lamination',
    slug: { en: 'consistent-lamination-workflows', vi: 'quy-trinh-can-lop-on-dinh' },
    title: { en: 'Building a consistent lamination workflow', vi: 'XÃ¢y dá»±ng quy trÃ¬nh cÃ¡n lá»›p á»•n Ä‘á»‹nh' },
    excerpt: { en: 'Small handling decisions make repeatable pastry work easier to sustain.', vi: 'Nhá»¯ng quyáº¿t Ä‘á»‹nh xá»­ lÃ½ nhá» giÃºp duy trÃ¬ cÃ´ng viá»‡c bÃ¡nh á»•n Ä‘á»‹nh hÆ¡n.' },
    publishedAt: '2026-06-18', readingMinutes: 7,
    category: { en: 'Kitchen notes', vi: 'Ghi chÃº nhÃ  báº¿p' },
    image: editorialImage('Pastry lamination tools and butter on a work table', 'Dá»¥ng cá»¥ cÃ¡n lá»›p bÃ¡nh vÃ  bÆ¡ trÃªn bÃ n lÃ m viá»‡c'),
    sections: {
      en: [
        { paragraphs: ['Consistency comes from controlling temperature, rest time, thickness, and the order in which each step happens.'] },
        { heading: 'Write the repeatable version', paragraphs: ['Turn the successful sequence into a short shared method that every shift can follow and review.'] },
      ],
      vi: [
        { paragraphs: ['TÃ­nh á»•n Ä‘á»‹nh Ä‘áº¿n tá»« viá»‡c kiá»ƒm soÃ¡t nhiá»‡t Ä‘á»™, thá»i gian nghá»‰, Ä‘á»™ dÃ y vÃ  thá»© tá»± cá»§a tá»«ng bÆ°á»›c.'] },
        { heading: 'Ghi láº¡i phiÃªn báº£n cÃ³ thá»ƒ láº·p láº¡i', paragraphs: ['Chuyá»ƒn trÃ¬nh tá»± thÃ nh cÃ´ng thÃ nh phÆ°Æ¡ng phÃ¡p ngáº¯n gá»n Ä‘á»ƒ má»i ca lÃ m viá»‡c cÃ¹ng Ã¡p dá»¥ng vÃ  rÃ  soÃ¡t.'] },
      ],
    },
  },
];
