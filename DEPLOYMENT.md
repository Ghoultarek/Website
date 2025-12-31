# Deployment Guide

## Quick Start

### Option 1: GitHub Actions (Recommended)

1. Push your code to GitHub
2. Go to Settings → Pages in your repository
3. Under "Source", select "GitHub Actions"
4. The workflow will automatically deploy on push to main/master branch

### Option 2: Manual Deployment with gh-pages

1. Install gh-pages (if not already installed):
```bash
npm install --save-dev gh-pages
```

2. Update `next.config.js` with your repository name:
```javascript
const repoName = 'your-repo-name'; // Change this
```

3. Deploy:
```bash
npm run deploy
```

4. Enable GitHub Pages:
   - Go to Settings → Pages
   - Select source: `gh-pages` branch
   - Your site will be live at `https://<username>.github.io/<repo-name>/`

## Important Notes

- **Repository Name**: If your GitHub repository has a different name than "Website", update the `repoName` variable in `next.config.js`
- **Custom Domain**: If using a custom domain, set `basePath: ''` in `next.config.js`
- **.nojekyll File**: Automatically created during build to prevent Jekyll processing

## Troubleshooting

### 404 Errors on GitHub Pages

- Ensure `basePath` in `next.config.js` matches your repository name
- Check that `.nojekyll` file exists in the `out` directory
- Verify GitHub Pages is enabled and pointing to the correct branch

### Build Errors

- Ensure Node.js 18+ is installed
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors: `npm run lint`

### Assets Not Loading

- Verify `assetPrefix` matches `basePath` in `next.config.js`
- Check browser console for 404 errors
- Ensure all paths use Next.js `Link` component or relative paths





