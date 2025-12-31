# Tarek Ghoul - Professional Research Website

A modern, professional website showcasing research in transportation AI, safety analysis, and intelligent transportation systems. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Multi-page Navigation**: Home, Research, Publications, Interactive Tools, and Contact pages
- **Technique Tutorials**: Interactive tutorials for research methods (BHEV model, more coming)
- **Publications Showcase**: Filterable list of published and under-review papers
- **Responsive Design**: Mobile-friendly layout with smooth animations
- **GitHub Pages Ready**: Configured for static export and deployment

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Website
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

### Local Build Test

```bash
npm run build
```

This will create a static export in the `out` directory.

### GitHub Pages Deployment

1. **Update base path** (if needed): 
   - If your repository is named something other than "Website", update the `basePath` in `next.config.js` to match your repository name.

2. **Deploy using gh-pages**:
```bash
npm run deploy
```

This will:
- Build the static site
- Create a `.nojekyll` file (required for GitHub Pages)
- Deploy to the `gh-pages` branch

3. **Enable GitHub Pages**:
   - Go to your repository Settings → Pages
   - Select source: `gh-pages` branch
   - Your site will be available at `https://<username>.github.io/Website/`

### Alternative: GitHub Actions Deployment

You can also set up GitHub Actions for automatic deployment on push. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: touch out/.nojekyll
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

## Project Structure

```
/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   ├── about/             # Research page
│   ├── publications/       # Publications page
│   ├── tools/             # Interactive tools page
│   │   └── technique-tutorials/  # Technique tutorial pages
│   │       └── bhev/      # BHEV model tutorial
│   │           └── page.tsx
│   ├── contact/           # Contact page
│   ├── layout.tsx         # Root layout
│   └── globals.css         # Global styles
├── components/            # React components
│   ├── Navigation.tsx     # Site navigation
│   ├── Footer.tsx         # Site footer
│   ├── PublicationCard.tsx # Publication display
│   ├── YOLOPlaceholder.tsx # YOLO placeholder
│   └── technique-tutorials/  # Technique tutorial components
│       └── bhev/          # BHEV model component
│           ├── BHEVModel.tsx
│           ├── types.ts
│           ├── calculations.ts
│           └── README.md
├── data/                  # Data files
│   └── publications.ts    # Publication data
├── public/                # Static assets
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── package.json           # Dependencies
```

## Customization

### Updating Publications

Edit `data/publications.ts` to add or modify publications. The data structure includes:
- Title, authors, journal/conference
- Publication year and status
- DOI and links
- Contribution descriptions

### Modifying Content

- **Home page**: Edit `app/page.tsx`
- **Research page**: Edit `app/about/page.tsx`
- **Contact info**: Edit `app/contact/page.tsx` and `components/Footer.tsx`

### Styling

- Global styles: `app/globals.css`
- Tailwind config: `tailwind.config.ts`
- Color scheme: Modify primary colors in `tailwind.config.ts`

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Interactive data visualizations
- **GitHub Pages**: Static site hosting

## License

This project is for personal/professional use.

## Contact

Tarek Ghoul
- Email: tarek.ghoul@ubc.ca
- LinkedIn: [linkedin.com/in/tarek-ghoul](https://www.linkedin.com/in/tarek-ghoul/)
- Google Scholar: [scholar.google.com/citations?user=-vy503AAAAAJ](https://scholar.google.com/citations?user=-vy503AAAAAJ&hl=en)


