import type { Locale } from '../i18n/types';
import type { EnquiryMode } from '../i18n/ui';

export const contactModes = ['customer', 'supplier'] as const;
export type ContactMode = (typeof contactModes)[number];

export interface EnquiryModeCopy {
  eyebrow: string;
  title: string;
  description: string;
  submit: string;
  successMessage?: string;
  interestLabel: string;
  interestOptions: Record<string, string>;
  productRangeLabel?: string;
  temperatureLabel?: string;
}

const copy: Record<Locale, Record<EnquiryMode, EnquiryModeCopy>> = {
  en: {
    general: { eyebrow: 'General enquiry', title: 'Tell us what you need', description: 'Share a question and our team will prepare a useful follow-up.', submit: 'Send enquiry', interestLabel: 'Area of interest', interestOptions: { retail: 'Retail', horeca: 'HORECA', bakery: 'Bakery & Pastry', ecommerce: 'E-commerce', other: 'Other' } },
    customer: { eyebrow: 'Become a customer', title: 'Start buying ingredients', description: 'Tell us about your operation and the ingredients you need to source.', submit: 'Apply as a customer', interestLabel: 'Buying channel', interestOptions: { retail: 'Retail', horeca: 'HORECA', bakery: 'Bakery & Pastry', ecommerce: 'E-commerce' } },
    supplier: { eyebrow: 'Become a supplier', title: 'Sell products through Paradise', description: 'Share your product range and supply capabilities with our team.', submit: 'Apply as a supplier', interestLabel: 'Product focus', interestOptions: { dairy: 'Dairy', bakery: 'Bakery & Pastry', frozen: 'Frozen', other: 'Other' }, productRangeLabel: 'Product range', temperatureLabel: 'Storage temperature' },
  },
  vi: {
    general: { eyebrow: 'Yêu cầu chung', title: 'Chia sẻ nhu cầu của bạn', description: 'Hãy gửi câu hỏi để đội ngũ chúng tôi chuẩn bị phản hồi hữu ích.', submit: 'Gửi yêu cầu', interestLabel: 'Lĩnh vực quan tâm', interestOptions: { retail: 'Bán lẻ', horeca: 'HORECA', bakery: 'Bánh & bánh ngọt', ecommerce: 'Thương mại điện tử', other: 'Khác' } },
    customer: { eyebrow: 'Trở thành khách hàng', title: 'Bắt đầu mua nguyên liệu', description: 'Cho chúng tôi biết về mô hình vận hành và nguyên liệu bạn cần.', submit: 'Đăng ký khách hàng', interestLabel: 'Kênh mua hàng', interestOptions: { retail: 'Bán lẻ', horeca: 'HORECA', bakery: 'Bánh & bánh ngọt', ecommerce: 'Thương mại điện tử' } },
    supplier: { eyebrow: 'Trở thành nhà cung cấp', title: 'Cung cấp sản phẩm cho Paradise', description: 'Chia sẻ danh mục sản phẩm và khả năng cung ứng của bạn.', submit: 'Đăng ký nhà cung cấp', interestLabel: 'Nhóm sản phẩm', interestOptions: { dairy: 'Sữa', bakery: 'Bánh & bánh ngọt', frozen: 'Đông lạnh', other: 'Khác' }, productRangeLabel: 'Danh mục sản phẩm', temperatureLabel: 'Nhiệt độ bảo quản' },
  },
};

export const getEnquiryModeCopy = (locale: Locale, mode: EnquiryMode): EnquiryModeCopy => copy[locale][mode];
