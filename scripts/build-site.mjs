import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { featureContent, featureOrder, localizedContent, localeLabels, localeOrder, siteConfig } from '../src/site-data.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const assetDir = path.join(distDir, 'assets')
const screenshotDir = path.join(assetDir, 'images')
const optimizedScreenshots = {
  tree: 'tree_construction_page.webp',
  quickStart: 'quick_start_page.webp',
  nodeLock: 'node_lock_page.webp',
  batch: 'batch_solving_page.webp',
  play: 'play_against_strategy.webp',
  logo: 'logo-mark.webp',
  favicon: 'logo-mark.png',
}

await rm(distDir, { recursive: true, force: true })
await mkdir(screenshotDir, { recursive: true })

await cp(path.join(rootDir, 'src', 'site.css'), path.join(assetDir, 'site.css'))
await cp(path.join(rootDir, 'src', 'runtime.js'), path.join(assetDir, 'runtime.js'))
await optimizeImages()
await writeFile(path.join(distDir, '.nojekyll'), '')

for (const locale of localeOrder) {
  const folder = locale === 'en' ? distDir : path.join(distDir, locale)
  await mkdir(folder, { recursive: true })
  await writeFile(path.join(folder, 'index.html'), renderPage(locale), 'utf8')
}

function renderPage(locale) {
  const content = localizedContent[locale]
  const assetPrefix = locale === 'en' ? './assets' : '../assets'
  const canonical = locale === 'en' ? `${siteConfig.basePath}/` : `${siteConfig.basePath}/${locale}/`
  const alternates = localeOrder
    .map((code) => {
      const href = code === 'en' ? `${siteConfig.basePath}/` : `${siteConfig.basePath}/${code}/`
      return `<link rel="alternate" hreflang="${code}" href="${href}" />`
    })
    .join('\n    ')

  const localeOptions = localeOrder
    .map((code) => {
      const href = code === 'en' ? `${siteConfig.basePath}/` : `${siteConfig.basePath}/${code}/`
      const current = code === locale ? ' aria-current="true"' : ''
      return `<a class="locale-option" href="${href}" data-locale-link="${code}"${current}>${localeLabels[code]}</a>`
    })
    .join('')

  const valueCards = content.values
    .map(
      ([title, description]) => `
          <article class="value-card">
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(description)}</p>
          </article>`,
    )
    .join('')

  const featureCards = featureOrder
    .map((key, index) => {
      const [title, accent, body] = featureContent[key][locale]
      const image = optimizedScreenshots[key]
      const reverse = index % 2 === 1 ? ' reverse' : ''
      return `
        <article class="feature-card${reverse}">
          <div class="feature-copy">
            <p class="feature-accent">${escapeHtml(accent)}</p>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(body)}</p>
          </div>
          <div class="feature-media">
            <img src="${assetPrefix}/images/${image}" alt="${escapeHtml(title)}" loading="lazy" />
          </div>
        </article>`
    })
    .join('')

  const ecosystemPoints = content.ecosystem
    .map((point) => `<div class="point-pill">${escapeHtml(point)}</div>`)
    .join('')

  const faqItems = content.faq
    .map(
      ([question, answer]) => `
          <article class="faq-item">
            <h3>${escapeHtml(question)}</h3>
            <p>${escapeHtml(answer)}</p>
          </article>`,
    )
    .join('')

  const pageHref = locale === 'en' ? `${siteConfig.basePath}/` : `${siteConfig.basePath}/${locale}/`

  return `<!doctype html>
<html lang="${content.lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(content.title)}</title>
    <meta name="description" content="${escapeHtml(content.description)}" />
    <meta property="og:title" content="${escapeHtml(content.title)}" />
    <meta property="og:description" content="${escapeHtml(content.description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${pageHref}" />
    <meta property="og:image" content="${assetPrefix}/images/${optimizedScreenshots.tree}" />
    <meta name="robots" content="index,follow" />
    <link rel="icon" type="image/png" href="${assetPrefix}/images/${optimizedScreenshots.favicon}" />
    <link rel="canonical" href="${canonical}" />
    <link rel="alternate" hreflang="x-default" href="${siteConfig.basePath}/" />
    ${alternates}
    <link rel="stylesheet" href="${assetPrefix}/site.css" />
  </head>
  <body data-locale="${locale}" data-base-path="${siteConfig.basePath}">
    <div class="page-shell">
      <div class="ambient ambient-left"></div>
      <div class="ambient ambient-right"></div>
      <header class="site-header">
        <a class="brand" href="#top">
          <img class="brand-mark" src="${assetPrefix}/images/${optimizedScreenshots.logo}" alt="" />
          <span>${siteConfig.productName}</span>
        </a>
        <nav class="top-nav">
          <a href="#overview">${escapeHtml(content.nav.overview)}</a>
          <a href="#features">${escapeHtml(content.nav.features)}</a>
          <a href="#faq">${escapeHtml(content.nav.faq)}</a>
        </nav>
        <details class="locale-switcher">
          <summary>
            <span class="locale-switcher-label">${escapeHtml(content.nav.language)}</span>
            <span class="locale-switcher-value">${escapeHtml(localeLabels[locale])}</span>
          </summary>
          <div class="locale-menu">${localeOptions}</div>
        </details>
      </header>

      <main id="top">
        <section class="hero section-frame">
          <div class="hero-copy">
            <div class="hero-priority">
              <span class="hero-priority-pill hero-priority-free">${escapeHtml(content.hero.free)}</span>
              <span class="hero-priority-pill hero-priority-claim">${escapeHtml(content.hero.claim)}</span>
            </div>
            <p class="eyebrow">${escapeHtml(content.hero.eyebrow)}</p>
            <h1>${escapeHtml(content.hero.title)}</h1>
            <p class="hero-description">${escapeHtml(content.hero.description)}</p>
            <div class="cta-row">
              ${renderButton(siteConfig.downloadHref, content.hero.download, 'primary', false)}
              ${renderButton(siteConfig.discordHref, content.hero.discord, 'secondary', true)}
              ${renderButton(siteConfig.contactHref, content.hero.contact, 'ghost', false)}
            </div>
            <div class="hero-tags">
              <span>${escapeHtml(content.hero.platform)}</span>
              <span>${escapeHtml(content.hero.free)}</span>
            </div>
          </div>
          <div class="hero-visual">
            <div class="hero-orbit"></div>
            <img src="${assetPrefix}/images/${optimizedScreenshots.tree}" alt="TexasSolver GPU tree configuration" fetchpriority="high" />
          </div>
        </section>

        <section id="overview" class="values section-frame">
          <div class="section-intro">
            <p class="section-label">${escapeHtml(content.nav.overview)}</p>
            <h2>${escapeHtml(content.valuesTitle)}</h2>
            <p>${escapeHtml(content.valuesText)}</p>
          </div>
          <div class="value-grid">${valueCards}
          </div>
        </section>

        <section id="features" class="features section-frame">
          <div class="section-intro">
            <p class="section-label">${escapeHtml(content.nav.features)}</p>
            <h2>${escapeHtml(content.featuresTitle)}</h2>
            <p>${escapeHtml(content.featuresText)}</p>
          </div>
          ${featureCards}
        </section>

        <section class="ecosystem section-frame">
          <div class="section-intro">
            <p class="section-label">Workflow</p>
            <h2>${escapeHtml(content.ecosystemTitle)}</h2>
            <p>${escapeHtml(content.ecosystemText)}</p>
          </div>
          <div class="point-grid">${ecosystemPoints}</div>
        </section>

        <section id="faq" class="faq section-frame">
          <div class="section-intro">
            <p class="section-label">FAQ</p>
            <h2>${escapeHtml(content.faqTitle)}</h2>
          </div>
          <div class="faq-grid">${faqItems}
          </div>
        </section>
      </main>

      <footer class="site-footer section-frame">
        <div>
          <a class="brand footer-brand" href="#top">${siteConfig.productName}</a>
          <p>${escapeHtml(content.footer.rights)}</p>
        </div>
        <div class="footer-links">
          <a href="${siteConfig.discordHref}" target="_blank" rel="noreferrer">${escapeHtml(content.footer.discord)}</a>
          <a href="${siteConfig.contactHref}">${escapeHtml(content.footer.contact)}</a>
          <a href="${siteConfig.githubHref}" target="_blank" rel="noreferrer">${escapeHtml(content.footer.github)}</a>
          <span>${escapeHtml(content.hero.platform)}</span>
          <span>${escapeHtml(content.hero.free)}</span>
        </div>
      </footer>
    </div>
    <script type="module" src="${assetPrefix}/runtime.js"></script>
  </body>
</html>`
}

function renderButton(href, label, variant, external) {
  const attrs = external ? ' target="_blank" rel="noreferrer"' : ''
  return `<a class="button button-${variant}" href="${href}"${attrs}>${escapeHtml(label)}</a>`
}

function escapeHtml(input) {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

async function optimizeImages() {
  const rawImageDir = path.join(rootDir, 'raw_images')
  const jobs = [
    buildWebp(path.join(rootDir, 'src', 'logo-mark.png'), path.join(screenshotDir, optimizedScreenshots.logo), 192, 82),
    buildPng(path.join(rootDir, 'src', 'logo-mark.png'), path.join(screenshotDir, optimizedScreenshots.favicon), 64),
    buildWebp(path.join(rawImageDir, siteConfig.screenshots.tree), path.join(screenshotDir, optimizedScreenshots.tree), 1600, 82),
    buildWebp(path.join(rawImageDir, siteConfig.screenshots.quickStart), path.join(screenshotDir, optimizedScreenshots.quickStart), 1600, 80),
    buildWebp(path.join(rawImageDir, siteConfig.screenshots.nodeLock), path.join(screenshotDir, optimizedScreenshots.nodeLock), 1600, 80),
    buildWebp(path.join(rawImageDir, siteConfig.screenshots.batch), path.join(screenshotDir, optimizedScreenshots.batch), 1600, 80),
    buildWebp(path.join(rawImageDir, siteConfig.screenshots.play), path.join(screenshotDir, optimizedScreenshots.play), 1600, 80),
  ]

  await Promise.all(jobs)
}

function buildWebp(input, output, width, quality) {
  return sharp(input)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(output)
}

function buildPng(input, output, width) {
  return sharp(input)
    .resize({ width, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toFile(output)
}
