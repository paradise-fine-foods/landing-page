import type { Locale } from './types';

export interface UiCopy {
  languageName: string;
  skipToContent: string;
  demoNotice: string;
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
    interactionPrompt: string;
    stageFallback: string;
  };
  home: {
    credibilityTitle: string;
    categoryEyebrow: string;
    categoryTitle: string;
    categoryDescription: string;
    featuredProductsEyebrow: string;
    featuredProductsTitle: string;
    featuredBrandsEyebrow: string;
    featuredBrandsTitle: string;
    serviceEyebrow: string;
    serviceTitle: string;
    serviceDescription: string;
    channelsEyebrow: string;
    channelsTitle: string;
    retail: string;
    horeca: string;
    bakery: string;
    ecommerce: string;
    finalCtaTitle: string;
    finalCtaDescription: string;
    finalCtaButton: string;
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
    message: string;
    consent: string;
    submit: string;
    submitting: string;
    demoDelivery: string;
  };
  status: {
    formError: string;
    successTitle: string;
    successMessage: string;
    reference: string;
    modelLoading: string;
    modelUnavailable: string;
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
    languageName: 'English',
    skipToContent: 'Skip to main content',
    demoNotice: 'Client-review demo — product names, specifications, claims, and imagery are fictional.',
    header: { navigation: 'Primary navigation', menuOpen: 'Open menu', menuClose: 'Close menu', home: 'Home', products: 'Products', brands: 'Brands', contact: 'Contact', language: 'Tiếng Việt' },
    footer: { tagline: 'Exceptional ingredients, handled with care.', navigation: 'Explore', contact: 'Contact', legal: 'Demo content for review only.', copyright: 'Paradise Fine Foods. All rights reserved.' },
    hero: { eyebrow: 'Cold-chain ingredients', title: 'Exceptional ingredients. Delivered with confidence.', description: 'A review-ready showcase of specialty dairy and professional ingredients, supported by careful handling and responsive service.', primaryCta: 'Explore products', secondaryCta: 'Start an enquiry', brand: 'Brand', origin: 'Origin', packFormat: 'Pack format', storage: 'Storage', interactionPrompt: 'Interact with the 3D product package', stageFallback: 'Product package preview' },
    home: { credibilityTitle: 'Built for dependable ingredient sourcing', categoryEyebrow: 'Discover', categoryTitle: 'Ingredients by category', categoryDescription: 'Explore a representative selection created to review the future catalog experience.', featuredProductsEyebrow: 'Selected ingredients', featuredProductsTitle: 'Featured products', featuredBrandsEyebrow: 'Producer stories', featuredBrandsTitle: 'Featured brands', serviceEyebrow: 'Cold-chain confidence', serviceTitle: 'Care from selection to delivery', serviceDescription: 'A precise service framework for professional kitchens, retail teams, and growing food businesses.', channelsEyebrow: 'Who we serve', channelsTitle: 'Pathways for every channel', retail: 'Retail', horeca: 'HORECA', bakery: 'Bakery & Pastry', ecommerce: 'E-commerce', finalCtaTitle: 'Let’s find the right ingredient.', finalCtaDescription: 'Tell us what you are making and our team will help shape the next conversation.', finalCtaButton: 'Contact our team' },
    catalog: { eyebrow: 'Demo catalog', title: 'Professional ingredients', description: 'Search and filter a representative bilingual product range.', searchLabel: 'Search products', searchPlaceholder: 'Search by name or application', categoryLabel: 'Category', brandLabel: 'Brand', applicationLabel: 'Application', allCategories: 'All categories', allBrands: 'All brands', allApplications: 'All applications', clearFilters: 'Clear filters', resetFilters: 'Reset filters', resultSingular: 'product found', resultPlural: 'products found', noResultsTitle: 'No products match these filters', noResultsDescription: 'Try a broader search or reset the filters to see the full demo range.', noScript: 'Interactive filtering requires JavaScript, but the full catalog remains visible below.' },
    product: { viewDetails: 'View product', productDetails: 'Product details', origin: 'Origin', category: 'Category', packFormat: 'Pack format', storage: 'Storage', applications: 'Applications', benefits: 'Professional benefits', audience: 'Suitable for', enquire: 'Enquire about this product', relatedTitle: 'Related products', backToProducts: 'Back to products', breadcrumb: 'Product breadcrumb' },
    brand: { eyebrow: 'Our brands', title: 'Ingredient makers with a point of view', description: 'Explore representative producer stories and product families.', viewBrand: 'View brand', origin: 'Origin', story: 'Brand story', categories: 'Categories', products: 'Products from this brand', backToBrands: 'Back to brands', breadcrumb: 'Brand breadcrumb' },
    form: { eyebrow: 'Sales enquiry', title: 'Tell us what you need', description: 'Share your ingredient requirements and we will prepare a useful follow-up.', requiredNote: 'Fields marked with an asterisk are required.', required: 'Required', name: 'Name', company: 'Company', email: 'Email', phone: 'Phone', interest: 'Area of interest', interestPlaceholder: 'Choose an area of interest', message: 'How can we help?', consent: 'I agree that this demo may process my details to show the enquiry experience.', submit: 'Send enquiry', submitting: 'Sending…', demoDelivery: 'Demo only: this form does not send an email or create a CRM record.' },
    status: { formError: 'Please correct the highlighted fields.', successTitle: 'Thank you for your enquiry', successMessage: 'Your demo enquiry has been recorded for this review session.', reference: 'Reference', modelLoading: 'Loading interactive product view…', modelUnavailable: 'The interactive view is unavailable. The product preview remains available.' },
    validation: { nameRequired: 'Enter your name.', emailRequired: 'Enter your email address.', emailInvalid: 'Enter a valid email address.', interestRequired: 'Choose an area of interest.', messageRequired: 'Tell us how we can help.', consentRequired: 'Confirm your consent to continue.' },
    notFound: { eyebrow: '404', title: 'This page could not be found', description: 'The address may have changed, or the page may not be part of this demo.', homeLink: 'Go to English home', productsLink: 'Browse English products' },
  },
  vi: {
    languageName: 'Tiếng Việt',
    skipToContent: 'Chuyển đến nội dung chính',
    demoNotice: 'Bản demo duyệt với khách hàng — tên, thông số, tuyên bố và hình ảnh sản phẩm đều là nội dung hư cấu.',
    header: { navigation: 'Điều hướng chính', menuOpen: 'Mở menu', menuClose: 'Đóng menu', home: 'Trang chủ', products: 'Sản phẩm', brands: 'Thương hiệu', contact: 'Liên hệ', language: 'English' },
    footer: { tagline: 'Nguyên liệu tuyển chọn, được chăm chút cẩn thận.', navigation: 'Khám phá', contact: 'Liên hệ', legal: 'Nội dung demo chỉ dùng để duyệt.', copyright: 'Paradise Fine Foods. Bảo lưu mọi quyền.' },
    hero: { eyebrow: 'Nguyên liệu chuỗi lạnh', title: 'Nguyên liệu tuyển chọn. Giao hàng trọn niềm tin.', description: 'Không gian giới thiệu sẵn sàng để duyệt về nguyên liệu sữa đặc tuyển và nguyên liệu chuyên nghiệp, cùng quy trình bảo quản cẩn thận và dịch vụ linh hoạt.', primaryCta: 'Khám phá sản phẩm', secondaryCta: 'Gửi yêu cầu', brand: 'Thương hiệu', origin: 'Xuất xứ', packFormat: 'Quy cách', storage: 'Bảo quản', interactionPrompt: 'Tương tác với bao bì sản phẩm 3D', stageFallback: 'Hình xem trước bao bì sản phẩm' },
    home: { credibilityTitle: 'Nền tảng tìm nguồn nguyên liệu đáng tin cậy', categoryEyebrow: 'Khám phá', categoryTitle: 'Nguyên liệu theo danh mục', categoryDescription: 'Khám phá bộ sưu tập đại diện được xây dựng để duyệt trải nghiệm danh mục tương lai.', featuredProductsEyebrow: 'Nguyên liệu tuyển chọn', featuredProductsTitle: 'Sản phẩm nổi bật', featuredBrandsEyebrow: 'Câu chuyện nhà sản xuất', featuredBrandsTitle: 'Thương hiệu nổi bật', serviceEyebrow: 'Vững tin chuỗi lạnh', serviceTitle: 'Chăm chút từ tuyển chọn đến giao hàng', serviceDescription: 'Quy trình dịch vụ chuẩn xác dành cho bếp chuyên nghiệp, đội ngũ bán lẻ và doanh nghiệp thực phẩm đang phát triển.', channelsEyebrow: 'Đối tượng phục vụ', channelsTitle: 'Giải pháp cho từng kênh', retail: 'Bán lẻ', horeca: 'HORECA', bakery: 'Bánh mì & Bánh ngọt', ecommerce: 'Thương mại điện tử', finalCtaTitle: 'Cùng tìm nguyên liệu phù hợp.', finalCtaDescription: 'Hãy chia sẻ món bạn đang phát triển để đội ngũ của chúng tôi hỗ trợ bước trao đổi tiếp theo.', finalCtaButton: 'Liên hệ đội ngũ' },
    catalog: { eyebrow: 'Danh mục demo', title: 'Nguyên liệu chuyên nghiệp', description: 'Tìm kiếm và lọc danh mục sản phẩm song ngữ đại diện.', searchLabel: 'Tìm sản phẩm', searchPlaceholder: 'Tìm theo tên hoặc ứng dụng', categoryLabel: 'Danh mục', brandLabel: 'Thương hiệu', applicationLabel: 'Ứng dụng', allCategories: 'Tất cả danh mục', allBrands: 'Tất cả thương hiệu', allApplications: 'Tất cả ứng dụng', clearFilters: 'Xóa bộ lọc', resetFilters: 'Đặt lại bộ lọc', resultSingular: 'sản phẩm được tìm thấy', resultPlural: 'sản phẩm được tìm thấy', noResultsTitle: 'Không có sản phẩm phù hợp', noResultsDescription: 'Hãy thử từ khóa rộng hơn hoặc đặt lại bộ lọc để xem toàn bộ danh mục demo.', noScript: 'Bộ lọc tương tác cần JavaScript, nhưng toàn bộ danh mục vẫn hiển thị bên dưới.' },
    product: { viewDetails: 'Xem sản phẩm', productDetails: 'Chi tiết sản phẩm', origin: 'Xuất xứ', category: 'Danh mục', packFormat: 'Quy cách', storage: 'Bảo quản', applications: 'Ứng dụng', benefits: 'Lợi ích chuyên nghiệp', audience: 'Phù hợp với', enquire: 'Yêu cầu tư vấn sản phẩm', relatedTitle: 'Sản phẩm liên quan', backToProducts: 'Quay lại sản phẩm', breadcrumb: 'Đường dẫn sản phẩm' },
    brand: { eyebrow: 'Thương hiệu', title: 'Những nhà sản xuất nguyên liệu giàu bản sắc', description: 'Khám phá câu chuyện nhà sản xuất và các dòng sản phẩm đại diện.', viewBrand: 'Xem thương hiệu', origin: 'Xuất xứ', story: 'Câu chuyện thương hiệu', categories: 'Danh mục', products: 'Sản phẩm từ thương hiệu này', backToBrands: 'Quay lại thương hiệu', breadcrumb: 'Đường dẫn thương hiệu' },
    form: { eyebrow: 'Yêu cầu tư vấn', title: 'Chia sẻ nhu cầu của bạn', description: 'Hãy cho chúng tôi biết yêu cầu nguyên liệu để chuẩn bị phản hồi hữu ích.', requiredNote: 'Các trường có dấu sao là bắt buộc.', required: 'Bắt buộc', name: 'Họ và tên', company: 'Công ty', email: 'Email', phone: 'Điện thoại', interest: 'Lĩnh vực quan tâm', interestPlaceholder: 'Chọn lĩnh vực quan tâm', message: 'Chúng tôi có thể hỗ trợ gì?', consent: 'Tôi đồng ý để bản demo xử lý thông tin nhằm minh họa trải nghiệm gửi yêu cầu.', submit: 'Gửi yêu cầu', submitting: 'Đang gửi…', demoDelivery: 'Chỉ là demo: biểu mẫu này không gửi email hoặc tạo hồ sơ CRM.' },
    status: { formError: 'Vui lòng sửa các trường được đánh dấu.', successTitle: 'Cảm ơn yêu cầu của bạn', successMessage: 'Yêu cầu demo đã được ghi nhận cho phiên duyệt này.', reference: 'Mã tham chiếu', modelLoading: 'Đang tải chế độ xem sản phẩm tương tác…', modelUnavailable: 'Chế độ xem tương tác hiện không khả dụng. Hình xem trước sản phẩm vẫn được giữ lại.' },
    validation: { nameRequired: 'Vui lòng nhập họ và tên.', emailRequired: 'Vui lòng nhập địa chỉ email.', emailInvalid: 'Vui lòng nhập địa chỉ email hợp lệ.', interestRequired: 'Vui lòng chọn lĩnh vực quan tâm.', messageRequired: 'Vui lòng cho biết chúng tôi có thể hỗ trợ gì.', consentRequired: 'Vui lòng xác nhận đồng ý để tiếp tục.' },
    notFound: { eyebrow: '404', title: 'Không tìm thấy trang này', description: 'Địa chỉ có thể đã thay đổi hoặc trang chưa nằm trong phạm vi bản demo.', homeLink: 'Đến trang chủ tiếng Việt', productsLink: 'Xem sản phẩm tiếng Việt' },
  },
};
