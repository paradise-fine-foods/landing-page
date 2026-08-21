export type RouteKey =
  | "home"
  | "products"
  | "brands"
  | "blogs"
  | "recipes"
  | "contact"
  | "customerContact"
  | "supplierContact";

export const locales = ["en", "vi"] as const;

export const defaultLocale = "vi";

export type Locale = (typeof locales)[number];

export const isLocale = (value: string): value is Locale =>
  locales.includes(value as Locale);
