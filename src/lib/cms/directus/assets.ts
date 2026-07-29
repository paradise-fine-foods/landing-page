import type { ImageAsset } from '../types';
import { CmsDataError } from './errors';
import type { DirectusFile } from './schema';

const positiveDimension = (
  value: unknown,
  field: 'width' | 'height',
  context: string,
): number => {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new CmsDataError(context, `asset ${field} must be a positive stored integer`);
  }
  return value;
};

export const buildDirectusAssetUrl = (
  directusUrl: string,
  fileId: string,
  width: number,
  height: number,
): string => {
  let url: URL;
  try {
    url = new URL(
      `${directusUrl.replace(/\/+$/, '')}/assets/${encodeURIComponent(fileId)}`,
    );
  } catch (cause) {
    throw new CmsDataError('DIRECTUS_URL', 'must be an absolute URL', { cause });
  }
  url.searchParams.set('width', String(width));
  url.searchParams.set('height', String(height));
  url.searchParams.set('fit', 'cover');
  url.searchParams.set('format', 'webp');
  return url.toString();
};

export const mapImageAsset = (
  value: unknown,
  altValue: unknown,
  directusUrl: string,
  context: string,
): ImageAsset => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new CmsDataError(context, 'asset relation must be expanded');
  }
  const file = value as Partial<DirectusFile>;
  if (typeof file.id !== 'string' || file.id.length === 0) {
    throw new CmsDataError(context, 'asset id is required');
  }
  const width = positiveDimension(file.width, 'width', context);
  const height = positiveDimension(file.height, 'height', context);
  if (typeof altValue !== 'string' || altValue.trim().length === 0) {
    throw new CmsDataError(context, 'localized asset alt text is required');
  }
  return {
    src: buildDirectusAssetUrl(directusUrl, file.id, width, height),
    width,
    height,
    alt: altValue.trim(),
  };
};
