/**
 * Custom next/image loader for Cloudflare Pages.
 *
 * next/image's default optimizer isn't available on Cloudflare Pages, so we route
 * requests through Cloudflare Image Resizing (`/cdn-cgi/image/...`) to get resized,
 * WebP/AVIF, quality-tuned images (better LCP / Core Web Vitals) instead of shipping
 * full-size originals.
 *
 * INERT BY DEFAULT: passes the src through unchanged — identical to the old
 * `images.unoptimized` behaviour — so it can never break a deploy. To turn on real
 * optimization:
 *   1. Enable Image Resizing on the zone (Cloudflare dashboard → Speed → Optimization
 *      → Image Resizing), and
 *   2. set NEXT_PUBLIC_CF_IMAGES=true in the Pages build environment.
 */
export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}): string {
  // Passthrough until Cloudflare Image Resizing is enabled (see header).
  if (process.env.NEXT_PUBLIC_CF_IMAGES !== 'true') return src

  const options = `width=${width},quality=${quality || 75},format=auto`
  // Remote images pass as a full URL; local paths pass relative to the site root.
  const source = /^https?:\/\//i.test(src) ? src : src.replace(/^\/+/, '')
  return `/cdn-cgi/image/${options}/${source}`
}
