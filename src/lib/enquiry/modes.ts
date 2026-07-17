import type { Locale } from '../i18n/types';
import type { EnquiryMode } from '../i18n/ui';

export interface EnquiryModeCopy {
  eyebrow: string;
  title: string;
  description: string;
  submit: string;
  successMessage?: string;
  interestLabel: string;
  interestOptions: Record<string, string>;
}

const copy: Record<Locale, Record<EnquiryMode, EnquiryModeCopy>> = {
  en: {
    general: { eyebrow: 'General enquiry', title: 'Tell us what you need', description: 'Share a question and our team will prepare a useful follow-up.', submit: 'Send enquiry', interestLabel: 'Area of interest', interestOptions: { retail: 'Retail', horeca: 'HORECA', bakery: 'Bakery & Pastry', ecommerce: 'E-commerce', other: 'Other' } },
    customer: { eyebrow: 'Become a customer', title: 'Start buying ingredients', description: 'Tell us about your operation and the ingredients you need to source.', submit: 'Apply as a customer', interestLabel: 'Buying channel', interestOptions: { retail: 'Retail', horeca: 'HORECA', bakery: 'Bakery & Pastry', ecommerce: 'E-commerce' } },
    supplier: { eyebrow: 'Become a supplier', title: 'Sell products through Paradise', description: 'Share your product range and supply capabilities with our team.', submit: 'Apply as a supplier', interestLabel: 'Product focus', interestOptions: { dairy: 'Dairy', bakery: 'Bakery & Pastry', frozen: 'Frozen', other: 'Other' } },
  },
  vi: {
    general: { eyebrow: 'Yeu cau chung', title: 'Chia se nhu cau cua ban', description: 'Hay gui cau hoi de doi ngu chung toi chuan bi phan hoi huu ich.', submit: 'Gui yeu cau', interestLabel: 'Linh vuc quan tam', interestOptions: { retail: 'Ban le', horeca: 'HORECA', bakery: 'Banh & banh ngot', ecommerce: 'Thuong mai dien tu', other: 'Khac' } },
    customer: { eyebrow: 'Tro thanh khach hang', title: 'Bat dau mua nguyen lieu', description: 'Cho chung toi biet ve mo hinh van hanh va nguyen lieu ban can.', submit: 'Dang ky khach hang', interestLabel: 'Kenh mua hang', interestOptions: { retail: 'Ban le', horeca: 'HORECA', bakery: 'Banh & banh ngot', ecommerce: 'Thuong mai dien tu' } },
    supplier: { eyebrow: 'Tro thanh nha cung cap', title: 'Cung cap san pham cho Paradise', description: 'Chia se danh muc san pham va kha nang cung ung cua ban.', submit: 'Dang ky nha cung cap', interestLabel: 'Nhom san pham', interestOptions: { dairy: 'Sua', bakery: 'Banh & banh ngot', frozen: 'Dong lanh', other: 'Khac' } },
  },
};

export const getEnquiryModeCopy = (locale: Locale, mode: EnquiryMode): EnquiryModeCopy => copy[locale][mode];
