/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    }
    return config
  },
  async redirects() {
    return []
  },
  async rewrites() {
    return {
      beforeFiles: [
        // autodetaildelivered.com serves the /auto-detail-delivered/* pages
        {
          has: [{ type: 'host', value: 'autodetaildelivered\\.com' }],
          source: '/:path*',
          destination: '/auto-detail-delivered/:path*',
        },
      ],
    }
  },
}

module.exports = nextConfig