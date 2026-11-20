/* ═══ Kinetic menu — shared by every page ═══
   Markup: #kmenu.kmenu (static in each page). Openers: #menu-btn, #burger-btn, #burgerBtn. */
(function () {
  'use strict';
  var menu = document.getElementById('kmenu');
  if (!menu) return;
  var menuBtn = document.getElementById('menu-btn');
  var burgers = [document.getElementById('burger-btn'), document.getElementById('burgerBtn')].filter(Boolean);

  // split words into letters for the kinetic animation
  function splitWord(word, base, step) {
    var text = word.textContent;
    word.setAttribute('aria-label', text);
    word.textContent = '';
    Array.from(text).forEach(function (ch, i) {
      var s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = ch;
      s.style.setProperty('--i', i);
      s.style.setProperty('--d', base + i * step);
      word.appendChild(s);
    });
  }
  menu.querySelectorAll('.kmenu-word').forEach(function (word, wi) { splitWord(word, 120 + wi * 70, 28); });
  document.querySelectorAll('.klist').forEach(function (list) {
    list.querySelectorAll('.kword').forEach(function (word, wi) { splitWord(word, 250 + wi * 110, 30); });
    requestAnimationFrame(function () { requestAnimationFrame(function () { list.classList.add('is-in'); }); });
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
      // mobile home: Film / Photography are sections of the vertical slider
      if (go && window.pvMobileHome && window.innerWidth <= 767) {
        e.preventDefault();
        close();
        window.pvMobileHome.go(go === 'works' ? 'photo' : 'film');
        return;
      }
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

  // ── Book a call (Calendly popup). Calendly's script loads only when someone is about to book. ──
  var CAL_URL = 'https://calendly.com/pablovaliente/discovery-call';
  var calState = 'idle';
  function loadCalendly() {
    if (calState !== 'idle') return;
    calState = 'loading';
    var css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = 'https://assets.calendly.com/assets/external/widget.css';
    document.head.appendChild(css);
    var s = document.createElement('script');
    s.src = 'https://assets.calendly.com/assets/external/widget.js'; s.async = true;
    s.onload = function () { calState = 'ready'; };
    s.onerror = function () { calState = 'failed'; };
    document.head.appendChild(s);
  }
  function bookLink(cls) {
    var a = document.createElement('a');
    a.href = CAL_URL; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.className = cls; a.setAttribute('data-book', ''); a.textContent = 'Book a call';
    return a;
  }
  var foot = menu.querySelector('.kmenu-foot');
  if (foot && !foot.querySelector('[data-book]')) foot.insertBefore(bookLink('kmenu-book'), foot.firstChild);
  // keep the marquee just above the foot links, however many lines they wrap to
  var mqTrack = menu.querySelector('.kmenu-marquee-track');
  function placeMarquee() {
    if (foot) menu.style.setProperty('--kfoot-h', foot.offsetHeight + 'px');
    // constant reading speed (~50 px/s) whatever the length of the reviews
    if (mqTrack && mqTrack.offsetWidth) mqTrack.style.animationDuration = Math.round(mqTrack.offsetWidth / 2 / 50) + 's';
  }
  placeMarquee();
  window.addEventListener('resize', placeMarquee);
  [menuBtn].concat(burgers).forEach(function (b) { if (b) b.addEventListener('click', placeMarquee); });
  document.addEventListener('mouseover', function (e) { if (e.target.closest && e.target.closest('[data-book]')) loadCalendly(); });
  document.addEventListener('focusin', function (e) { if (e.target.closest && e.target.closest('[data-book]')) loadCalendly(); });
  document.addEventListener('touchstart', function (e) { if (e.target.closest && e.target.closest('[data-book]')) loadCalendly(); }, { passive: true });
  menuBtn && menuBtn.addEventListener('click', loadCalendly);
  burgers.forEach(function (b) { b.addEventListener('click', loadCalendly); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-book]');
    if (!a) return;
    // If Calendly is not ready (still loading, blocked, offline) the link opens the booking page in a new tab.
    if (calState !== 'ready' || !window.Calendly) { loadCalendly(); return; }
    e.preventDefault();
    if (isOpen()) close();
    window.Calendly.initPopupWidget({ url: CAL_URL + '?hide_gdpr_banner=1' });
  });

  window.pvMenu = { open: open, close: close, toggle: toggle, isOpen: isOpen };
  window.pvBook = {
    load: loadCalendly,
    ready: function () { return calState === 'ready' && !!window.Calendly; },
    open: function () { if (isOpen()) close(); window.Calendly.initPopupWidget({ url: CAL_URL + '?hide_gdpr_banner=1' }); }
  };
})();
