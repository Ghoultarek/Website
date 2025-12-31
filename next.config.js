/** @type {import('next').NextConfig} */
// Update the repository name below if your GitHub repo has a different name
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'Website';

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // For GitHub Pages, use the repository name as basePath
  // If deploying to root domain, set basePath to ''
  basePath: process.env.NODE_ENV === 'production' ? `/${repoName}` : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? `/${repoName}` : '',
  // Security: Note that HTTP headers cannot be set for static exports
  // Headers are configured via meta tags in app/layout.tsx
  // For true HTTP headers, configure at GitHub Pages/CDN level if possible
}

module.exports = nextConfig

