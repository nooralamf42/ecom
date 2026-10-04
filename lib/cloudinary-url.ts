/*
 * Image width for page content is kept in the Cloudinary URL itself
 * (".../image/upload/c_limit,w_800/..."), because pages are stored as
 * markdown, which has no place for an image size. This also makes Cloudinary
 * serve a smaller file. Only this exact "c_limit,w_N" segment is ours to
 * add or replace; any other transformation in the URL is left alone.
 */

const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/;
const OUR_SEGMENT = /^c_limit,w_(\d+)\//;

export function isCloudinaryImage(src: string): boolean {
  return CLOUDINARY_UPLOAD.test(src);
}

/** Width (px) stored in the URL, or null. */
export function widthFromCloudinaryUrl(src: string): number | null {
  const m = src.match(CLOUDINARY_UPLOAD);
  const w = m?.[2].match(OUR_SEGMENT)?.[1];
  return w ? Number(w) : null;
}

/** Same URL with our width segment set (or removed when width is null). */
export function withCloudinaryWidth(src: string, width: number | null | undefined): string {
  const m = src.match(CLOUDINARY_UPLOAD);
  if (!m) return src;
  const rest = m[2].replace(OUR_SEGMENT, "");
  const w = width ? Math.round(width) : 0;
  return w > 0 ? `${m[1]}c_limit,w_${w}/${rest}` : `${m[1]}${rest}`;
}
