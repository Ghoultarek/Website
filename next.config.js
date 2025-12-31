/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Set basePath for GitHub Pages deployment
  // In development, basePath is empty. In production, it's /Website
  basePath: process.env.NODE_ENV === 'production' ? '/Website' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Website' : '',
  // Security: Note that HTTP headers cannot be set for static exports
  // Headers are configured via meta tags in app/layout.tsx
  // For true HTTP headers, configure at GitHub Pages/CDN level if possible
}

module.exports = nextConfig

