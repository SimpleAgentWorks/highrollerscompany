/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // NOTE: 'output: export' removed — static export breaks API routes.
  // The site must run as a Next.js server (next start / next dev) to use /api/*
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/book',
        destination: 'https://autodetaildelivered.com/auto-detail-delivered/book',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
