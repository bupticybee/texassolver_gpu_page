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
