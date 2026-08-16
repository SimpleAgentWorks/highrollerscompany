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
        // autodetaildelivered.com serves the /auto-detail-delivered/* pages (with optional www. prefix)
        // Note: exclude public asset paths (/robots.txt, /sitemap.xml, /favicon.ico) so they
        // are served directly from /public/ instead of being rewritten to /auto-detail-delivered/*
        {
          has: [{ type: 'host', value: '(www\\.)?autodetaildelivered\\.com' }],
          source: '/:path((?!robots\\.txt|sitemap\\.xml|favicon\\.ico|images|_next).*)',
          destination: '/auto-detail-delivered/:path',
        },
      ],
    }
  },
}

module.exports = nextConfig