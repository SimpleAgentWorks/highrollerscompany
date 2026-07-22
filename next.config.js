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
