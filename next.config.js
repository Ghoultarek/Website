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
}

module.exports = nextConfig

