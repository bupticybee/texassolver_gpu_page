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

await writeFile(path.join(distDir, 'index.html'), renderPage(), 'utf8')

function renderPage() {
  const baseLocale = 'en'
  const content = localizedContent[baseLocale]
  const assetPrefix = './assets'
  const canonical = `${siteConfig.basePath}/`
  const buildHash = Date.now().toString(36)

  const localeOptions = localeOrder
    .map((code) => {
      return `<button class="locale-option" data-set-locale="${code}">${localeLabels[code]}</button>`
    })
    .join('')

  const valueCards = content.values
    .map(
      ([title, description], i) => `
          <article class="value-card">
            <h3 data-i18n="values.${i}.0">${escapeHtml(title)}</h3>
            <p data-i18n="values.${i}.1">${escapeHtml(description)}</p>
          </article>`,
    )
    .join('')

  const featureCards = featureOrder
    .map((key, index) => {
      const [title, accent, body] = featureContent[key][baseLocale]
      const image = optimizedScreenshots[key]
      const reverse = index % 2 === 1 ? ' reverse' : ''
      return `
        <article class="feature-card${reverse}">
          <div class="feature-copy">
            <p class="feature-accent" data-i18n-feat="${key}.1">${escapeHtml(accent)}</p>
            <h3 data-i18n-feat="${key}.0">${escapeHtml(title)}</h3>
            <p data-i18n-feat="${key}.2">${escapeHtml(body)}</p>
          </div>
          <div class="feature-media">
            <div class="image-mask">
              <img src="${assetPrefix}/images/${image}" alt="" loading="lazy" />
            </div>
          </div>
        </article>`
    })
    .join('')

  const ecosystemPoints = content.ecosystem
    .map((point, i) => `<div class="point-pill" data-i18n="ecosystem.${i}">${escapeHtml(point)}</div>`)
    .join('')

  const faqItems = content.faq
    .map(
      ([question, answer], i) => `
          <article class="faq-item">
            <h3 data-i18n="faq.${i}.0">${escapeHtml(question)}</h3>
            <p data-i18n="faq.${i}.1">${escapeHtml(answer)}</p>
          </article>`,
    )
    .join('')

  const pageHref = canonical

  return `<!doctype html>
<html lang="${content.lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <title data-i18n="title">${escapeHtml(content.title)}</title>
    <meta name="description" data-i18n="description" content="${escapeHtml(content.description)}" />
    <meta property="og:title" data-i18n="title" content="${escapeHtml(content.title)}" />
    <meta property="og:description" data-i18n="description" content="${escapeHtml(content.description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${pageHref}" />
    <meta property="og:image" content="${assetPrefix}/images/${optimizedScreenshots.tree}" />
    <meta name="robots" content="index,follow" />
    <link rel="icon" type="image/png" href="${assetPrefix}/images/${optimizedScreenshots.favicon}" />
    <link rel="canonical" href="${canonical}" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${assetPrefix}/site.css?v=${buildHash}" />
    <script>
      window.i18nData = ${JSON.stringify(localizedContent)};
      window.featureData = ${JSON.stringify(featureContent)};
      window.labelsData = ${JSON.stringify(localeLabels)};
      window.supportedLangs = ${JSON.stringify(localeOrder)};
    </script>
  </head>
  <body data-base-path="${siteConfig.basePath}">
    <div class="page-shell">
      <div class="ambient ambient-left"></div>
      <div class="ambient ambient-right"></div>
      <header class="site-header glass-panel">
        <div class="header-main">
          <a class="brand" href="#top">
            <img class="brand-mark" src="${assetPrefix}/images/${optimizedScreenshots.logo}" alt="" />
            <span>${siteConfig.productName}</span>
          </a>
          <button class="mobile-menu-btn" aria-label="Toggle menu">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div class="header-actions">
          <nav class="top-nav">
            <a href="#overview" data-i18n="nav.overview">${escapeHtml(content.nav.overview)}</a>
            <a href="#features" data-i18n="nav.features">${escapeHtml(content.nav.features)}</a>
            <a href="#faq" data-i18n="nav.faq">${escapeHtml(content.nav.faq)}</a>
          </nav>
          <details class="locale-switcher">
            <summary>
              <span class="locale-switcher-label" data-i18n="nav.language">${escapeHtml(content.nav.language)}</span>
              <span class="locale-switcher-value" id="current-locale-display">${escapeHtml(localeLabels[baseLocale])}</span>
            </summary>
            <div class="locale-menu">${localeOptions}</div>
          </details>
        </div>
      </header>

      <main id="top">
        <section class="hero section-frame">
          <div class="hero-copy">
            <p class="eyebrow" data-i18n="hero.eyebrow">${escapeHtml(content.hero.eyebrow)}</p>
            <h1 data-i18n="hero.title">${escapeHtml(content.hero.title)}</h1>
            <p class="hero-description" data-i18n="hero.description">${escapeHtml(content.hero.description)}</p>
            <div class="cta-row">
              ${renderButton(siteConfig.downloadHref, content.hero.download, 'hero.download', 'primary', true)}
              ${renderButton(siteConfig.tutorialHref, content.hero.tutorial, 'hero.tutorial', 'secondary', true)}
              ${renderButton(siteConfig.discordHref, content.hero.discord, 'hero.discord', 'discord', true)}
              ${renderButton(siteConfig.contactHref, content.hero.contact, 'hero.contact', 'secondary', false)}
            </div>
          </div>
          <div class="hero-visual">
            <div class="hero-orbit"></div>
            <img src="${assetPrefix}/images/${optimizedScreenshots.play}" alt="TexasSolver GPU play against strategy" fetchpriority="high" class="hero-carousel-img img-1" />
            <img src="${assetPrefix}/images/${optimizedScreenshots.tree}" alt="TexasSolver GPU tree configuration" fetchpriority="high" class="hero-carousel-img img-2" />
            <img src="${assetPrefix}/images/${optimizedScreenshots.quickStart}" alt="TexasSolver GPU quick start" fetchpriority="high" class="hero-carousel-img img-3" />
            <img src="${assetPrefix}/images/${optimizedScreenshots.nodeLock}" alt="TexasSolver GPU node lock" fetchpriority="high" class="hero-carousel-img img-4" />
            <img src="${assetPrefix}/images/${optimizedScreenshots.batch}" alt="TexasSolver GPU batch solving" fetchpriority="high" class="hero-carousel-img img-5" />
          </div>
        </section>

        <section id="overview" class="values section-frame glass-panel">
          <div class="section-intro">
            <p class="section-label" data-i18n="nav.overview">${escapeHtml(content.nav.overview)}</p>
            <h2 data-i18n="valuesTitle">${escapeHtml(content.valuesTitle)}</h2>
            <p data-i18n="valuesText">${escapeHtml(content.valuesText)}</p>
          </div>
          <div class="value-grid">${valueCards}
          </div>
        </section>

        <section id="features" class="features section-frame glass-panel">
          <div class="section-intro">
            <p class="section-label" data-i18n="nav.features">${escapeHtml(content.nav.features)}</p>
            <h2 data-i18n="featuresTitle">${escapeHtml(content.featuresTitle)}</h2>
            <p data-i18n="featuresText">${escapeHtml(content.featuresText)}</p>
          </div>
          ${featureCards}
        </section>

        <section class="ecosystem section-frame glass-panel">
          <div class="section-intro">
            <p class="section-label">Workflow</p>
            <h2 data-i18n="ecosystemTitle">${escapeHtml(content.ecosystemTitle)}</h2>
            <p data-i18n="ecosystemText">${escapeHtml(content.ecosystemText)}</p>
          </div>
          <div class="point-grid">${ecosystemPoints}</div>
        </section>

        <section class="future-note section-frame glass-panel">
          <div class="future-note-inner">
            <p class="section-label">More Ahead</p>
            <h2 data-i18n="futureTitle">${escapeHtml(content.futureTitle)}</h2>
            <p data-i18n="futureText">${escapeHtml(content.futureText)}</p>
          </div>
        </section>

        <section id="faq" class="faq section-frame glass-panel">
          <div class="section-intro">
            <p class="section-label">FAQ</p>
            <h2 data-i18n="faqTitle">${escapeHtml(content.faqTitle)}</h2>
          </div>
          <div class="faq-grid">${faqItems}
          </div>
        </section>
      </main>

      <footer class="site-footer section-frame">
        <div>
          <a class="brand footer-brand" href="#top">${siteConfig.productName}</a>
          <p data-i18n="footer.rights">${escapeHtml(content.footer.rights)}</p>
        </div>
        <div class="footer-links">
          <a href="${siteConfig.discordHref}" target="_blank" rel="noreferrer" data-i18n="footer.discord">${escapeHtml(content.footer.discord)}</a>
          <a href="${siteConfig.contactHref}" data-i18n="footer.contact">${escapeHtml(content.footer.contact)}</a>
          <a href="${siteConfig.githubHref}" target="_blank" rel="noreferrer" data-i18n="footer.github">${escapeHtml(content.footer.github)}</a>
          <span data-i18n="hero.free">${escapeHtml(content.hero.free)}</span>
        </div>
      </footer>
    </div>
    <script src="${assetPrefix}/runtime.js?v=${buildHash}"></script>
  </body>
</html>`
}

function renderButton(href, fallbackLabel, i18nKey, variant, external) {
  const attrs = external ? ' target="_blank" rel="noreferrer"' : ''
  return `<a class="button button-${variant}" href="${href}"${attrs} data-i18n="${i18nKey}">${escapeHtml(fallbackLabel)}</a>`
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
    buildWebp(path.join(rootDir, 'src', 'logo-mark.png'), path.join(screenshotDir, optimizedScreenshots.logo), 192, 82, false),
    buildPng(path.join(rootDir, 'src', 'logo-mark.png'), path.join(screenshotDir, optimizedScreenshots.favicon), 64),
    buildWebp(path.join(rawImageDir, siteConfig.screenshots.tree), path.join(screenshotDir, optimizedScreenshots.tree), 1600, 82, true),
    buildWebp(path.join(rawImageDir, siteConfig.screenshots.quickStart), path.join(screenshotDir, optimizedScreenshots.quickStart), 1600, 80, true),
    buildWebp(path.join(rawImageDir, siteConfig.screenshots.nodeLock), path.join(screenshotDir, optimizedScreenshots.nodeLock), 1600, 80, true),
    buildWebp(path.join(rawImageDir, siteConfig.screenshots.batch), path.join(screenshotDir, optimizedScreenshots.batch), 1600, 80, true),
    buildWebp(path.join(rawImageDir, siteConfig.screenshots.play), path.join(screenshotDir, optimizedScreenshots.play), 1600, 80, true),
  ]

  await Promise.all(jobs)
}

async function buildWebp(input, output, width, quality, cropRight = false) {
  let pipeline = sharp(input)
  if (cropRight) {
    const metadata = await pipeline.metadata()
    const cropWidth = Math.floor(metadata.width * 0.98)
    pipeline = sharp(input).extract({ left: 0, top: 0, width: cropWidth, height: metadata.height })
  }
  return pipeline
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
