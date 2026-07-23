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
<<<<<<< HEAD
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
=======
    return [
      {
        source: '/book',
        destination: 'https://autodetaildelivered.com/auto-detail-delivered/book',
        permanent: false,
      },
    ]
>>>>>>> origin/main
  },
}

module.exports = nextConfig
