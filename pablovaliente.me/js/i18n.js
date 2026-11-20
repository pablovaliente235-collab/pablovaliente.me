/* ═══════════════════════════════════════════════
   i18n.js — [data-i18n] / [data-i18n-aria] keys (EN / ES)
   Language state, storage and switches live in /js/lang.js (window.pvLang).
   ═══════════════════════════════════════════════ */
'use strict';

const i18n = {
  en: {
    /* ── Menu (legacy overlay) ── */
    menu_contact:   'Contact',
    menu_about:     'About',
    menu_impressum: 'Impressum',

    /* ── Spec labels (shared) ── */
    label_work:        'Project',
    label_description: 'Description',
    label_camera:      'Camera',
    label_software:    'Software',
    label_location:    'Location',

    /* ── Video modal ── */
    modal_close:      'Close',
    modal_fullscreen: 'Full screen',

    /* ── Project descriptions ── */
    monasterio_desc: 'Architectural photography of the Monasterio de San Miguel de los Reyes — a 16th-century Renaissance monastery in Valencia, now home to the Valencian Library. The series documents the exterior facades, arcade corridors and formal gardens through careful attention to light and architectural geometry.',
    japanese_desc:   'Silent symmetry and traditional wooden architecture. Documentation of a Japanese shrine — light, shadow and the language of form.',
    iglesia_desc:    'One of the most significant Baroque churches in Latin America. Colors, wood carvings and the silence of a unique sacred building in Paraguay.',
    bellamar_desc:   'Comprehensive audiovisual production for brand identity and booking platforms. It features a cinematic hero film with Es Vedrá aerials, alongside exterior drone photography of the facade and detailed interior shots of the suites and en-suite bathrooms.',
  },
  es: {
    /* ── Menu (legacy overlay) ── */
    menu_contact:   'Contacto',
    menu_about:     'Sobre mí',
    menu_impressum: 'Aviso legal',

    /* ── Spec labels (shared) ── */
    label_work:        'Proyecto',
    label_description: 'Descripción',
    label_camera:      'Cámara',
    label_software:    'Software',
    label_location:    'Ubicación',

    /* ── Video modal ── */
    modal_close:      'Cerrar',
    modal_fullscreen: 'Pantalla completa',

    /* ── Project descriptions ── */
    monasterio_desc: 'Fotografía de arquitectura del Monasterio de San Miguel de los Reyes, un monasterio renacentista del siglo XVI en Valencia, hoy sede de la Biblioteca Valenciana. La serie documenta las fachadas exteriores, los pasillos con arcadas y los jardines formales, prestando especial atención a la luz y a la geometría arquitectónica.',
    japanese_desc:   'Simetría silenciosa y arquitectura tradicional de madera. Documentación de un santuario japonés: luz, sombra y el lenguaje de la forma.',
    iglesia_desc:    'Una de las iglesias barrocas más importantes de América Latina. Colores, tallas de madera y el silencio de un edificio sagrado único en Paraguay.',
    bellamar_desc:   'Producción audiovisual integral para la identidad de marca y las plataformas de reservas. Incluye un vídeo de presentación cinematográfico con tomas aéreas de Es Vedrá, además de fotografía exterior con dron de la fachada y tomas interiores detalladas de las suites y sus baños.',
  }
};

/* ── Apply the keys for one language ── */
function applyLang(lang) {
  if (window.pvLang && window.pvLang.get() !== lang) { window.pvLang.set(lang); return; }
  lang = lang === 'es' ? 'es' : 'en';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (i18n[lang][key] !== undefined) el.textContent = i18n[lang][key];
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.dataset.i18nAria;
    if (i18n[lang][key] !== undefined) el.setAttribute('aria-label', i18n[lang][key]);
  });
}

/* ── Center mobile lang toggle between logo and MENU ── */
function positionMobileLangToggle() {
  var t = document.getElementById('langToggleMobile');
  var logo = document.querySelector('nav > a');
  var menu = document.getElementById('mobile-menu-btn');
  if (!t || !logo || !menu) return;
  var nav = t.closest('nav');
  if (!nav) return;
  nav.style.position = 'relative';
  t.style.position = 'absolute';
  t.style.left = '';
  t.style.transform = '';
  var navRect = nav.getBoundingClientRect();
  var logoRect = logo.getBoundingClientRect();
  var menuRect = menu.getBoundingClientRect();
  var logoPadRight = parseFloat(getComputedStyle(logo).paddingRight) || 0;
  var menuPadLeft  = parseFloat(getComputedStyle(menu).paddingLeft)  || 0;
  var logoTextRight = logoRect.right  - logoPadRight;
  var menuTextLeft  = menuRect.left   + menuPadLeft;
  var mid = (logoTextRight + menuTextLeft) / 2;
  t.style.left = (mid - navRect.left) + 'px';
  t.style.transform = 'translateX(-50%)';
}

/* ── Init (call once DOM is ready): apply now, follow every later change ── */
let _i18nBound = false;
function initLang() {
  const cur = window.pvLang ? window.pvLang.get() : 'en';
  applyLang(cur);
  if (!_i18nBound) {
    _i18nBound = true;
    if (window.pvLang) window.pvLang.on(applyLang);
    document.addEventListener('DOMContentLoaded', () => applyLang(window.pvLang ? window.pvLang.get() : 'en'));
    window.addEventListener('resize', positionMobileLangToggle);
  }
  positionMobileLangToggle();
}
initLang();
