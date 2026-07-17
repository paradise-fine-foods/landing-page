import type { Locale } from './types';

export interface UiCopy {
  siteName: string;
  languageName: string;
  skipToContent: string;
  demoNotice: string;
  demoNoticeLabel: string;
  header: {
    navigation: string;
    menuOpen: string;
    menuClose: string;
    home: string;
    products: string;
    brands: string;
    contact: string;
    language: string;
  };
  footer: {
    tagline: string;
    navigation: string;
    contact: string;
    legal: string;
    copyright: string;
  };
  floatingRail: {
    navigation: string;
    label: string;
    panelTitle: string;
    toggleOpen: string;
    toggleClose: string;
    buy: string;
    sell: string;
    contact: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    brand: string;
    origin: string;
    packFormat: string;
    storage: string;
  };
  home: {
    credibilityTitle: string;
    operationalPillars: Array<{ title: string; description: string }>;
    categoryEyebrow: string;
    categoryTitle: string;
    categoryDescription: string;
    categoryProductLabel: string;
    featuredProductsEyebrow: string;
    featuredProductsTitle: string;
    carousel: { label: string; previous: string; next: string; status: string };
    featuredBrandsEyebrow: string;
    featuredBrandsTitle: string;
    serviceEyebrow: string;
    serviceTitle: string;
    serviceDescription: string;
    serviceTemperatureLabel: string;
    channelsEyebrow: string;
    channelsTitle: string;
    channels: Record<'retail' | 'horeca' | 'bakery' | 'ecommerce', { label: string; description: string }>;
    finalCtaTitle: string;
    finalCtaDescription: string;
    finalCtaButton: string;
    finalCtaLabel: string;
  };
  catalog: {
    eyebrow: string;
    title: string;
    description: string;
    searchLabel: string;
    searchPlaceholder: string;
    categoryLabel: string;
    brandLabel: string;
    applicationLabel: string;
    allCategories: string;
    allBrands: string;
    allApplications: string;
    clearFilters: string;
    resetFilters: string;
    resultSingular: string;
    resultPlural: string;
    noResultsTitle: string;
    noResultsDescription: string;
    noScript: string;
  };
  product: {
    viewDetails: string;
    productDetails: string;
    origin: string;
    category: string;
    packFormat: string;
    storage: string;
    applications: string;
    applicationNames: Record<string, string>;
    benefits: string;
    audience: string;
    enquire: string;
    relatedTitle: string;
    backToProducts: string;
    breadcrumb: string;
  };
  brand: {
    eyebrow: string;
    title: string;
    description: string;
    viewBrand: string;
    origin: string;
    story: string;
    categories: string;
    products: string;
    backToBrands: string;
    breadcrumb: string;
    demoNotice: string;
  };
  form: {
    eyebrow: string;
    title: string;
    description: string;
    requiredNote: string;
    required: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    interest: string;
    interestPlaceholder: string;
    interestOptions: Record<'retail' | 'horeca' | 'bakery' | 'ecommerce' | 'other', string>;
    product: string;
    productPlaceholder: string;
    message: string;
    consent: string;
    submit: string;
    submitting: string;
    demoDelivery: string;
    noScript: string;
    unexpectedError: string;
  };
  status: {
    formError: string;
    successTitle: string;
    successMessage: string;
    reference: string;
  };
  validation: {
    nameRequired: string;
    emailRequired: string;
    emailInvalid: string;
    interestRequired: string;
    messageRequired: string;
    consentRequired: string;
  };
  notFound: {
    eyebrow: string;
    title: string;
    description: string;
    homeLink: string;
    productsLink: string;
  };
}

export const ui: Record<Locale, UiCopy> = {
  en: {
    siteName: 'Paradise Fine Foods Demo',
    languageName: 'English',
    skipToContent: 'Skip to main content',
    demoNotice: 'Client-review demo — product names, specifications, claims, and imagery are fictional.',
    demoNoticeLabel: 'Review / 00',
    header: { navigation: 'Primary navigation', menuOpen: 'Open menu', menuClose: 'Close menu', home: 'Home', products: 'Products', brands: 'Brands', contact: 'Contact', language: 'Tiếng Việt' },
    footer: { tagline: 'Exceptional ingredients, handled with care.', navigation: 'Explore', contact: 'Contact', legal: 'Demo content for review only.', copyright: 'Paradise Fine Foods. All rights reserved.' },
    floatingRail: { navigation: 'Enquiry options', label: 'Enquire', panelTitle: 'Start a conversation', toggleOpen: 'Open enquiry options', toggleClose: 'Close enquiry options', buy: 'Buy ingredients', sell: 'Sell products', contact: 'General enquiry' },
    hero: { eyebrow: 'Living ingredients', title: 'Exceptional ingredients. Delivered with confidence.', description: 'A review-ready showcase of specialty dairy and professional ingredients, supported by careful handling and responsive service.', primaryCta: 'Explore products', secondaryCta: 'Start an enquiry', brand: 'Brand', origin: 'Origin', packFormat: 'Pack format', storage: 'Storage' },
    home: {
      credibilityTitle: 'Built for dependable ingredient sourcing',
      operationalPillars: [
        { title: 'Selected portfolio', description: 'A focused range shaped around professional kitchen and retail requirements.' },
        { title: 'Cold-chain care', description: 'Storage and handling conditions stay visible from selection through delivery.' },
        { title: 'Channel support', description: 'Practical guidance adapts to retail, HORECA, bakery, and online operations.' },
        { title: 'Nationwide Vietnam delivery', description: 'Distribution planning supports partners and service points across Vietnam.' },
      ],
      categoryEyebrow: 'Discover', categoryTitle: 'Ingredients by category', categoryDescription: 'Explore a representative selection created to review the future catalog experience.', categoryProductLabel: 'products',
      featuredProductsEyebrow: 'Selected ingredients', featuredProductsTitle: 'Featured products', carousel: { label: 'Featured products', previous: 'Previous product', next: 'Next product', status: 'Product {current} of {total}' }, featuredBrandsEyebrow: 'Producer stories', featuredBrandsTitle: 'Featured brands',
      serviceEyebrow: 'Cold-chain confidence', serviceTitle: 'Care from selection to delivery', serviceDescription: 'A precise service framework for professional kitchens, retail teams, and growing food businesses.', serviceTemperatureLabel: '2—6 °C / MONITORED',
      channelsEyebrow: 'Who we serve', channelsTitle: 'Pathways for every channel',
      channels: {
        retail: { label: 'Retail', description: 'Shelf-ready formats, clear product stories, and dependable replenishment support.' },
        horeca: { label: 'HORECA', description: 'Consistent professional formats and responsive guidance for busy service teams.' },
        bakery: { label: 'Bakery & Pastry', description: 'Performance-led ingredients selected for repeatable pastry and baking workflows.' },
        ecommerce: { label: 'E-commerce', description: 'Catalog-ready information and handling clarity for confident online selling.' },
      },
      finalCtaTitle: 'Let’s find the right ingredient.', finalCtaDescription: 'Tell us what you are making and our team will help shape the next conversation.', finalCtaButton: 'Contact our team', finalCtaLabel: 'PFF / SALES LINE',
    },
    catalog: { eyebrow: 'Demo catalog', title: 'Professional ingredients', description: 'Search and filter a representative bilingual product range.', searchLabel: 'Search products', searchPlaceholder: 'Search by name or application', categoryLabel: 'Category', brandLabel: 'Brand', applicationLabel: 'Application', allCategories: 'All categories', allBrands: 'All brands', allApplications: 'All applications', clearFilters: 'Clear filters', resetFilters: 'Reset filters', resultSingular: 'product found', resultPlural: 'products found', noResultsTitle: 'No products match these filters', noResultsDescription: 'Try a broader search or reset the filters to see the full demo range.', noScript: 'Interactive filtering requires JavaScript, but the full catalog remains visible below.' },
    product: { viewDetails: 'View product', productDetails: 'Product details', origin: 'Origin', category: 'Category', packFormat: 'Pack format', storage: 'Storage', applications: 'Applications', applicationNames: { lamination: 'Lamination', viennoiserie: 'Viennoiserie', whipping: 'Whipping', sauces: 'Sauces', tiramisu: 'Tiramisu', desserts: 'Desserts', cheesecake: 'Cheesecake', spreads: 'Spreads', pizza: 'Pizza', baking: 'Baking', cooking: 'Cooking' }, benefits: 'Professional benefits', audience: 'Suitable for', enquire: 'Enquire about this product', relatedTitle: 'Related products', backToProducts: 'Back to products', breadcrumb: 'Product breadcrumb' },
    brand: { eyebrow: 'Our brands', title: 'Ingredient makers with a point of view', description: 'Explore representative producer stories and product families.', viewBrand: 'View brand', origin: 'Origin', story: 'Brand story', categories: 'Categories', products: 'Products from this brand', backToBrands: 'Back to brands', breadcrumb: 'Brand breadcrumb', demoNotice: 'Review-only story: this brand identity, origin, imagery, and product relationship are fictional.' },
    form: { eyebrow: 'Sales enquiry', title: 'Tell us what you need', description: 'Share your ingredient requirements and we will prepare a useful follow-up.', requiredNote: 'Fields marked with an asterisk are required.', required: 'Required', name: 'Name', company: 'Company', email: 'Email', phone: 'Phone', interest: 'Area of interest', interestPlaceholder: 'Choose an area of interest', interestOptions: { retail: 'Retail', horeca: 'HORECA', bakery: 'Bakery & Pastry', ecommerce: 'E-commerce', other: 'Other' }, product: 'Product (optional)', productPlaceholder: 'No specific product', message: 'How can we help?', consent: 'I agree that this demo may process my details to show the enquiry experience.', submit: 'Send enquiry', submitting: 'Sending…', demoDelivery: 'Demo only: this form does not send an email or create a CRM record.', noScript: 'JavaScript is required to demonstrate submission. Your details are not sent anywhere.', unexpectedError: 'The demo could not complete this submission. Please try again.' },
    status: { formError: 'Please correct the highlighted fields.', successTitle: 'Thank you for your enquiry', successMessage: 'Your demo enquiry has been recorded for this review session.', reference: 'Reference' },
    validation: { nameRequired: 'Enter your name.', emailRequired: 'Enter your email address.', emailInvalid: 'Enter a valid email address.', interestRequired: 'Choose an area of interest.', messageRequired: 'Tell us how we can help.', consentRequired: 'Confirm your consent to continue.' },
    notFound: { eyebrow: '404', title: 'This page could not be found', description: 'The address may have changed, or the page may not be part of this demo.', homeLink: 'Go to English home', productsLink: 'Browse English products' },
  },
  vi: {
    siteName: 'Thực Phẩm Paradise Bản Mẫu',
    languageName: 'Tiếng Việt',
    skipToContent: 'Chuyển đến nội dung chính',
    demoNotice: 'Bản demo duyệt với khách hàng — tên, thông số, tuyên bố và hình ảnh sản phẩm đều là nội dung hư cấu.',
    demoNoticeLabel: 'Duyệt / 00',
    header: { navigation: 'Điều hướng chính', menuOpen: 'Mở menu', menuClose: 'Đóng menu', home: 'Trang chủ', products: 'Sản phẩm', brands: 'Thương hiệu', contact: 'Liên hệ', language: 'English' },
    footer: { tagline: 'Nguyên liệu tuyển chọn, được chăm chút cẩn thận.', navigation: 'Khám phá', contact: 'Liên hệ', legal: 'Nội dung demo chỉ dùng để duyệt.', copyright: 'Paradise Fine Foods. Bảo lưu mọi quyền.' },
    floatingRail: { navigation: 'Lựa chọn yêu cầu', label: 'Trao đổi', panelTitle: 'Bắt đầu trao đổi', toggleOpen: 'Mở lựa chọn yêu cầu', toggleClose: 'Đóng lựa chọn yêu cầu', buy: 'Mua nguyên liệu', sell: 'Cung cấp sản phẩm', contact: 'Yêu cầu chung' },
    hero: { eyebrow: 'Nguyên liệu sống động', title: 'Nguyên liệu tuyển chọn. Giao hàng trọn niềm tin.', description: 'Không gian giới thiệu sẵn sàng để duyệt về nguyên liệu sữa đặc tuyển và nguyên liệu chuyên nghiệp, cùng quy trình bảo quản cẩn thận và dịch vụ linh hoạt.', primaryCta: 'Khám phá sản phẩm', secondaryCta: 'Gửi yêu cầu', brand: 'Thương hiệu', origin: 'Xuất xứ', packFormat: 'Quy cách', storage: 'Bảo quản' },
    home: {
      credibilityTitle: 'Nền tảng tìm nguồn nguyên liệu đáng tin cậy',
      operationalPillars: [
        { title: 'Danh mục tuyển chọn', description: 'Danh mục tập trung vào nhu cầu thực tế của bếp chuyên nghiệp và bán lẻ.' },
        { title: 'Chăm sóc chuỗi lạnh', description: 'Điều kiện bảo quản và xử lý luôn rõ ràng từ tuyển chọn đến giao hàng.' },
        { title: 'Hỗ trợ từng kênh', description: 'Tư vấn thực tế phù hợp với bán lẻ, HORECA, bánh và vận hành trực tuyến.' },
        { title: 'Giao hàng toàn quốc', description: 'Kế hoạch phân phối hỗ trợ đối tác và điểm phục vụ trên khắp Việt Nam.' },
      ],
      categoryEyebrow: 'Khám phá', categoryTitle: 'Nguyên liệu theo danh mục', categoryDescription: 'Khám phá bộ sưu tập đại diện được xây dựng để duyệt trải nghiệm danh mục tương lai.', categoryProductLabel: 'sản phẩm',
      featuredProductsEyebrow: 'Nguyên liệu tuyển chọn', featuredProductsTitle: 'Sản phẩm nổi bật', carousel: { label: 'Sản phẩm nổi bật', previous: 'Sản phẩm trước', next: 'Sản phẩm tiếp theo', status: 'Sản phẩm {current} trên {total}' }, featuredBrandsEyebrow: 'Câu chuyện nhà sản xuất', featuredBrandsTitle: 'Thương hiệu nổi bật',
      serviceEyebrow: 'Vững tin chuỗi lạnh', serviceTitle: 'Chăm chút từ tuyển chọn đến giao hàng', serviceDescription: 'Quy trình dịch vụ chuẩn xác dành cho bếp chuyên nghiệp, đội ngũ bán lẻ và doanh nghiệp thực phẩm đang phát triển.', serviceTemperatureLabel: '2—6 °C / KIỂM SOÁT',
      channelsEyebrow: 'Đối tượng phục vụ', channelsTitle: 'Giải pháp cho từng kênh',
      channels: {
        retail: { label: 'Bán lẻ', description: 'Quy cách phù hợp kệ hàng, câu chuyện rõ ràng và hỗ trợ bổ sung ổn định.' },
        horeca: { label: 'HORECA', description: 'Quy cách chuyên nghiệp nhất quán và tư vấn linh hoạt cho đội ngũ phục vụ.' },
        bakery: { label: 'Bánh mì & Bánh ngọt', description: 'Nguyên liệu chú trọng hiệu năng cho quy trình làm bánh lặp lại ổn định.' },
        ecommerce: { label: 'Thương mại điện tử', description: 'Thông tin sẵn sàng cho danh mục và hướng dẫn bảo quản khi bán trực tuyến.' },
      },
      finalCtaTitle: 'Cùng tìm nguyên liệu phù hợp.', finalCtaDescription: 'Hãy chia sẻ món bạn đang phát triển để đội ngũ của chúng tôi hỗ trợ bước trao đổi tiếp theo.', finalCtaButton: 'Liên hệ đội ngũ', finalCtaLabel: 'PFF / KẾT NỐI',
    },
    catalog: { eyebrow: 'Danh mục demo', title: 'Nguyên liệu chuyên nghiệp', description: 'Tìm kiếm và lọc danh mục sản phẩm song ngữ đại diện.', searchLabel: 'Tìm sản phẩm', searchPlaceholder: 'Tìm theo tên hoặc ứng dụng', categoryLabel: 'Danh mục', brandLabel: 'Thương hiệu', applicationLabel: 'Ứng dụng', allCategories: 'Tất cả danh mục', allBrands: 'Tất cả thương hiệu', allApplications: 'Tất cả ứng dụng', clearFilters: 'Xóa bộ lọc', resetFilters: 'Đặt lại bộ lọc', resultSingular: 'sản phẩm được tìm thấy', resultPlural: 'sản phẩm được tìm thấy', noResultsTitle: 'Không có sản phẩm phù hợp', noResultsDescription: 'Hãy thử từ khóa rộng hơn hoặc đặt lại bộ lọc để xem toàn bộ danh mục demo.', noScript: 'Bộ lọc tương tác cần JavaScript, nhưng toàn bộ danh mục vẫn hiển thị bên dưới.' },
    product: { viewDetails: 'Xem sản phẩm', productDetails: 'Chi tiết sản phẩm', origin: 'Xuất xứ', category: 'Danh mục', packFormat: 'Quy cách', storage: 'Bảo quản', applications: 'Ứng dụng', applicationNames: { lamination: 'Cán lớp', viennoiserie: 'Bánh viennoiserie', whipping: 'Đánh bông', sauces: 'Xốt', tiramisu: 'Tiramisu', desserts: 'Món tráng miệng', cheesecake: 'Bánh phô mai', spreads: 'Món phết', pizza: 'Pizza', baking: 'Làm bánh', cooking: 'Nấu ăn' }, benefits: 'Lợi ích chuyên nghiệp', audience: 'Phù hợp với', enquire: 'Yêu cầu tư vấn sản phẩm', relatedTitle: 'Sản phẩm liên quan', backToProducts: 'Quay lại sản phẩm', breadcrumb: 'Đường dẫn sản phẩm' },
    brand: { eyebrow: 'Thương hiệu', title: 'Những nhà sản xuất nguyên liệu giàu bản sắc', description: 'Khám phá câu chuyện nhà sản xuất và các dòng sản phẩm đại diện.', viewBrand: 'Xem thương hiệu', origin: 'Xuất xứ', story: 'Câu chuyện thương hiệu', categories: 'Danh mục', products: 'Sản phẩm từ thương hiệu này', backToBrands: 'Quay lại thương hiệu', breadcrumb: 'Đường dẫn thương hiệu', demoNotice: 'Câu chuyện chỉ để duyệt: nhận diện, xuất xứ, hình ảnh và mối quan hệ sản phẩm của thương hiệu này đều là hư cấu.' },
    form: { eyebrow: 'Yêu cầu tư vấn', title: 'Chia sẻ nhu cầu của bạn', description: 'Hãy cho chúng tôi biết yêu cầu nguyên liệu để chuẩn bị phản hồi hữu ích.', requiredNote: 'Các trường có dấu sao là bắt buộc.', required: 'Bắt buộc', name: 'Họ và tên', company: 'Công ty', email: 'Email', phone: 'Điện thoại', interest: 'Lĩnh vực quan tâm', interestPlaceholder: 'Chọn lĩnh vực quan tâm', interestOptions: { retail: 'Bán lẻ', horeca: 'HORECA', bakery: 'Bánh mì & Bánh ngọt', ecommerce: 'Thương mại điện tử', other: 'Khác' }, product: 'Sản phẩm (không bắt buộc)', productPlaceholder: 'Không chọn sản phẩm cụ thể', message: 'Chúng tôi có thể hỗ trợ gì?', consent: 'Tôi đồng ý để bản demo xử lý thông tin nhằm minh họa trải nghiệm gửi yêu cầu.', submit: 'Gửi yêu cầu', submitting: 'Đang gửi…', demoDelivery: 'Chỉ là demo: biểu mẫu này không gửi email hoặc tạo hồ sơ CRM.', noScript: 'Cần JavaScript để minh họa việc gửi biểu mẫu. Thông tin của bạn không được gửi đi.', unexpectedError: 'Bản demo chưa thể hoàn tất yêu cầu này. Vui lòng thử lại.' },
    status: { formError: 'Vui lòng sửa các trường được đánh dấu.', successTitle: 'Cảm ơn yêu cầu của bạn', successMessage: 'Yêu cầu demo đã được ghi nhận cho phiên duyệt này.', reference: 'Mã tham chiếu' },
    validation: { nameRequired: 'Vui lòng nhập họ và tên.', emailRequired: 'Vui lòng nhập địa chỉ email.', emailInvalid: 'Vui lòng nhập địa chỉ email hợp lệ.', interestRequired: 'Vui lòng chọn lĩnh vực quan tâm.', messageRequired: 'Vui lòng cho biết chúng tôi có thể hỗ trợ gì.', consentRequired: 'Vui lòng xác nhận đồng ý để tiếp tục.' },
    notFound: { eyebrow: '404', title: 'Không tìm thấy trang này', description: 'Địa chỉ có thể đã thay đổi hoặc trang chưa nằm trong phạm vi bản demo.', homeLink: 'Đến trang chủ tiếng Việt', productsLink: 'Xem sản phẩm tiếng Việt' },
  },
};
