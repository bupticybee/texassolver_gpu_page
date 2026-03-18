# TexasSolver GPU Page

This repository contains the GitHub Pages marketing site for **TexasSolver GPU**.

The site is a static multilingual product page built for:

- product presentation
- download and contact conversion
- GitHub Pages deployment

## Local Preview

Build the static site:

```bash
npm run build
```

Start the local preview server:

```bash
node scripts/preview.mjs
```

Then open:

- `http://localhost:4173/texassolver_gpu_page/`
- `http://localhost:4173/texassolver_gpu_page/zh/`
- `http://localhost:4173/texassolver_gpu_page/ko/`
- `http://localhost:4173/texassolver_gpu_page/ja/`
- `http://localhost:4173/texassolver_gpu_page/ru/`

## Project Structure

- `src/site-data.js`: site content, locale strings, and feature copy
- `src/site.css`: site styling
- `src/runtime.js`: client-side locale switching and redirect behavior
- `scripts/build-site.mjs`: static site generator
- `scripts/preview.mjs`: local preview server
- `raw_images/`: product screenshots and source visual assets

## Deployment

The repository is configured for **GitHub Pages via GitHub Actions**.

On push to `main`, the workflow in `.github/workflows/deploy.yml` builds the site and deploys the generated `dist/` output to GitHub Pages.

## Notes

- The site base path is configured for the repository name `texassolver_gpu_page`.
- Product screenshots are the primary visual assets for the homepage.
- The current download link is configured in `src/site-data.js`.
