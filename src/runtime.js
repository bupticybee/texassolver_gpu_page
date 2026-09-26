// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const switcher = document.querySelector('.locale-switcher')
  if (switcher && switcher.hasAttribute('open') && !switcher.contains(e.target)) {
    switcher.removeAttribute('open')
  }
})

// Mobile menu toggle logic
const menuBtn = document.querySelector('.mobile-menu-btn')
const siteHeader = document.querySelector('.site-header')
if (menuBtn && siteHeader) {
  menuBtn.addEventListener('click', () => {
    siteHeader.classList.toggle('menu-open')
  })
}

// Close mobile menu when navigating
document.querySelectorAll('.top-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    if (siteHeader) siteHeader.classList.remove('menu-open')
  })
})

// Hero screenshot carousel: auto-advance, pause on hover/focus, and allow manual navigation.
const heroCarousel = document.querySelector('.hero-visual')
if (heroCarousel) {
  const slides = Array.from(heroCarousel.querySelectorAll('.hero-carousel-img'))
  const previousButton = heroCarousel.querySelector('.hero-carousel-prev')
  const nextButton = heroCarousel.querySelector('.hero-carousel-next')
  let currentSlide = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')))
  let carouselTimer = null

  const showSlide = (index) => {
    currentSlide = (index + slides.length) % slides.length
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === currentSlide
      slide.classList.toggle('is-active', active)
      slide.setAttribute('aria-hidden', active ? 'false' : 'true')
    })
  }

  const stopCarousel = () => {
    if (carouselTimer) {
      window.clearInterval(carouselTimer)
      carouselTimer = null
    }
  }

  const startCarousel = () => {
    stopCarousel()
    if (slides.length > 1) {
      carouselTimer = window.setInterval(() => showSlide(currentSlide + 1), 5000)
    }
  }

  previousButton?.addEventListener('click', () => showSlide(currentSlide - 1))
  nextButton?.addEventListener('click', () => showSlide(currentSlide + 1))
  heroCarousel.addEventListener('mouseenter', stopCarousel)
  heroCarousel.addEventListener('mouseleave', startCarousel)
  heroCarousel.addEventListener('focusin', stopCarousel)
  heroCarousel.addEventListener('focusout', (event) => {
    if (!heroCarousel.contains(event.relatedTarget)) startCarousel()
  })

  showSlide(currentSlide)
  startCarousel()
}

function escapeHtml(input) {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function applyLanguage(lang) {
  if (!window.i18nData || !window.i18nData[lang]) return;
  const db = window.i18nData[lang];
  const featDb = window.featureData;
  const labels = window.labelsData;

  document.documentElement.lang = db.lang || lang;
  
  // Standard translations
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const path = el.getAttribute('data-i18n').split('.');
    let val = db;
    for (const k of path) {
      if (val != null) val = val[k];
    }
    
    if (val !== undefined) {
      if (el.tagName === 'META') {
        el.setAttribute('content', val);
      } else if (el.tagName === 'TITLE') {
        document.title = val;
      } else {
        el.innerHTML = escapeHtml(val);
      }
    }
  });

  // Translated accessibility labels
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const path = el.getAttribute('data-i18n-aria').split('.');
    let val = db;
    for (const k of path) {
      if (val != null) val = val[k];
    }
    if (val !== undefined) el.setAttribute('aria-label', val);
  });

  // Feature translations
  document.querySelectorAll('[data-i18n-feat]').forEach(el => {
    const path = el.getAttribute('data-i18n-feat').split('.');
    if (featDb[path[0]] && featDb[path[0]][lang]) {
      const val = featDb[path[0]][lang][path[1]];
      if (val !== undefined) {
        el.innerHTML = escapeHtml(val);
      }
    }
  });

  // Update current locale display
  const display = document.getElementById('current-locale-display');
  if (display && labels[lang]) {
    display.innerText = labels[lang];
  }
  
  // Highlight active option
  document.querySelectorAll('.locale-option').forEach(el => {
    if (el.getAttribute('data-set-locale') === lang) {
      el.setAttribute('aria-current', 'true');
    } else {
      el.removeAttribute('aria-current');
    }
  });
}

function initLanguage() {
  if (!window.supportedLangs) return;
  let saved = localStorage.getItem('preferred_locale');
  let lang = saved;
  
  if (!lang) {
    let userLang = navigator.language || navigator.userLanguage || 'en';
    lang = userLang.split('-')[0];
  }
  if (!window.supportedLangs.includes(lang)) {
    lang = 'en';
  }
  applyLanguage(lang);
}

// Ensure it runs once initially before body displays if positioned directly
initLanguage();

// Handle locale switching interactions
document.querySelectorAll('.locale-option').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const lang = btn.getAttribute('data-set-locale');
    if (lang) {
      localStorage.setItem('preferred_locale', lang);
      applyLanguage(lang);
      const switcher = document.querySelector('.locale-switcher');
      if (switcher) switcher.removeAttribute('open');
    }
  });
});
