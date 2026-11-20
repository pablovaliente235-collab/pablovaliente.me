/* ═══ Kinetic menu — shared by every page ═══
   Markup: #kmenu.kmenu (static in each page). Openers: #menu-btn, #burger-btn, #burgerBtn. */
(function () {
  'use strict';
  var menu = document.getElementById('kmenu');
  if (!menu) return;
  var menuBtn = document.getElementById('menu-btn');
  var burgers = [document.getElementById('burger-btn'), document.getElementById('burgerBtn')].filter(Boolean);

  // split each word into letters for the kinetic animation
  menu.querySelectorAll('.kmenu-word').forEach(function (word, wi) {
    var text = word.textContent;
    word.setAttribute('aria-label', text);
    word.textContent = '';
    Array.from(text).forEach(function (ch, i) {
      var s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = ch;
      s.style.setProperty('--i', i);
      s.style.setProperty('--d', 120 + wi * 70 + i * 28);
      word.appendChild(s);
    });
  });

  function isOpen() { return menu.classList.contains('open'); }
  function setExpanded(v) {
    if (menuBtn) { menuBtn.setAttribute('aria-expanded', v); menuBtn.textContent = v ? 'CLOSE' : 'MENU'; }
    burgers.forEach(function (b) { b.setAttribute('aria-expanded', v); b.setAttribute('aria-label', v ? 'Close menu' : 'Open menu'); });
  }
  function open() {
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('kmenu-open');
    document.documentElement.classList.add('kmenu-lock');
    setExpanded(true);
  }
  function close() {
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('kmenu-open');
    document.documentElement.classList.remove('kmenu-lock');
    setExpanded(false);
  }
  function toggle(e) { if (e) e.preventDefault(); if (isOpen()) close(); else open(); }

  if (menuBtn) menuBtn.addEventListener('click', toggle);
  burgers.forEach(function (b) { b.addEventListener('click', toggle); });

  // Home / Works: on the home page scroll to the first / second page; elsewhere follow the link
  menu.querySelectorAll('.kmenu-link').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var go = a.getAttribute('data-go');
      var home = document.getElementById('de-home');
      if (go && home) {
        e.preventDefault();
        close();
        window.scrollTo({ top: go === 'works' ? home.offsetTop : 0, behavior: 'smooth' });
        return;
      }
      close();
    });
  });

  // Language buttons on the pages from pablovaliente.de (their i18n uses applyLang + localStorage 'pv_lang')
  var langBtns = menu.querySelectorAll('[data-kmenu-lang]');
  function markLang() {
    var cur = 'de';
    try { cur = localStorage.getItem('pv_lang') || (typeof currentLang !== 'undefined' ? currentLang : 'de'); } catch (err) {}
    langBtns.forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-kmenu-lang') === cur); });
  }
  langBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      if (typeof window.applyLang === 'function') window.applyLang(b.getAttribute('data-kmenu-lang'));
      markLang();
    });
  });
  if (langBtns.length) markLang();

  // While the menu is open, keep page-level wheel / key / swipe handlers (sliders, section scrolling) from reacting
  function guard(e) {
    if (!isOpen()) return;
    if (e.type === 'keydown') {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key !== 'Tab' && e.key !== 'Enter' && e.key !== ' ') e.stopPropagation();
      return;
    }
    e.stopPropagation();
  }
  ['keydown', 'wheel', 'touchstart', 'touchmove', 'touchend'].forEach(function (t) {
    window.addEventListener(t, guard, { capture: true, passive: t !== 'keydown' });
  });

  window.pvMenu = { open: open, close: close, toggle: toggle, isOpen: isOpen };
})();
