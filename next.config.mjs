/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Type errors fail the build (a CloudflareEnv.DB binding is declared in
    // cloudflare-env.d.ts so the D1 access type-checks). Flip back to true only as a
    // temporary escape hatch, never as the steady state.
    ignoreBuildErrors: false,
  },
  images: {
    // Route next/image through Cloudflare Image Resizing. The loader is a passthrough
    // (== unoptimized) until NEXT_PUBLIC_CF_IMAGES=true, so this is safe to ship as-is.
    loader: 'custom',
    loaderFile: './lib/cf-image-loader.ts',
  },
}

export default nextConfig
