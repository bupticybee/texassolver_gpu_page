const localeOrder = ['en', 'zh', 'ko', 'ja', 'ru']
const storageKey = 'texassolver_gpu_locale'

const currentLocale = document.body.dataset.locale || 'en'
const basePath = document.body.dataset.basePath || ''
const localeLinks = document.querySelectorAll('[data-locale-link]')

localeLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const nextLocale = event.currentTarget.getAttribute('data-locale-link')
    if (!localeOrder.includes(nextLocale)) return
    localStorage.setItem(storageKey, nextLocale)
  })
})

const params = new URLSearchParams(window.location.search)
const paramLocale = params.get('lang')

if (paramLocale && localeOrder.includes(paramLocale) && paramLocale !== currentLocale) {
  localStorage.setItem(storageKey, paramLocale)
  window.location.replace(buildLocaleUrl(paramLocale))
} else if (!paramLocale) {
  const storedLocale = localStorage.getItem(storageKey)
  const browserLocale = matchLocale((navigator.language || '').toLowerCase())
  const desiredLocale = storedLocale || browserLocale
  const isRootPage = currentLocale === 'en' && window.location.pathname.replace(/\/+$/, '').endsWith('texassolver_gpu_page')

  if (isRootPage && desiredLocale && desiredLocale !== 'en') {
    window.location.replace(buildLocaleUrl(desiredLocale))
  }
}

localStorage.setItem(storageKey, currentLocale)

function buildLocaleUrl(locale) {
  const normalizedBase = basePath.replace(/\/$/, '')
  return locale === 'en' ? `${normalizedBase}/` : `${normalizedBase}/${locale}/`
}

function matchLocale(language) {
  return localeOrder.find((locale) => language === locale || language.startsWith(`${locale}-`)) || ''
}
