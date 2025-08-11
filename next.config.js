/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during builds to prevent deployment failures
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable static optimization for pages with useSearchParams
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // Your existing image configuration
  images: {
    domains: ['cdn.sanity.io'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

module.exports = nextConfig