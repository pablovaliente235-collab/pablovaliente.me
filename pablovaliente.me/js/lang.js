/* ═══ lang.js — one language mechanism for the whole site (EN default / ES) ═══
   Storage key 'pv-lang' = 'en' | 'es'. Docs: /I18N.md in the repo root.
   Each page also carries a tiny <head> snippet that sets <html lang> before the first paint. */
(function () {
  'use strict';
  var KEY = 'pv-lang', OLD_KEY = 'pv_lang';
  var doc = document;
  var listeners = [];

  /* ── Shared UI strings (exact text of a text node, trimmed) — applied inside header / menu / footers with no markup changes ── */
  var COMMON = {
    'Pablo Valiente. All rights reserved.': 'Pablo Valiente. Todos los derechos reservados.',
    'All rights reserved.': 'Todos los derechos reservados.',
    'Start a project': 'Empezar un proyecto',
    'Book a call': 'Reservar una llamada',
    'Services': 'Servicios',
    'All services': 'Todos los servicios',
    'Mail': 'Email',
    'Impressum': 'Aviso legal',
    'Get in touch': 'Contacto',
    'Contact': 'Contacto',
    'About': 'Sobre mí',
    'Next Work': 'Siguiente proyecto',
    'CLOSE': 'CERRAR',
    'MENU': 'MENÚ'
  };
  /* aria-label / title values anywhere in the page (exact match) */
  var COMMON_ATTR = {
    'Breadcrumb': 'Ruta de navegación',
    'Related services': 'Servicios relacionados',
    'Open menu': 'Abrir menú',
    'Close menu': 'Cerrar menú',
    'Site footer': 'Pie de página',
    'Main menu': 'Menú principal',
    'Main navigation': 'Navegación principal',
    'Navigation': 'Navegación',
    'Client reviews': 'Reseñas de clientes',
    '5 out of 5 stars': '5 de 5 estrellas',
    'Language': 'Idioma',
    'Previous slide': 'Diapositiva anterior',
    'Next slide': 'Diapositiva siguiente',
    'Scroll': 'Desliza',
    'Section': 'Sección',
    'Photography': 'Fotografía',
    'Services': 'Servicios',
    'Browse projects': 'Explorar proyectos',
    'Next Projects': 'Siguientes proyectos',
    'Contact options': 'Opciones de contacto',
    'Play/Pause': 'Reproducir/Pausar',
    'Watch film': 'Ver vídeo',
    'Film player': 'Reproductor de vídeo',
    'Previous': 'Anterior',
    'Next': 'Siguiente',
    'Close': 'Cerrar',
    'Fullscreen': 'Pantalla completa',
    'Full screen': 'Pantalla completa',
    'Play video': 'Reproducir vídeo',
    'Slide 1': 'Diapositiva 1',
    'Slide 2': 'Diapositiva 2',
    'Slide 3': 'Diapositiva 3',
    'Previous example': 'Ejemplo anterior',
    'Next example': 'Ejemplo siguiente',
    'Before / After': 'Antes / Después',
    'Play color grading reel': 'Reproducir muestra de etalonaje'
  };
  /* where COMMON text is looked up (menu words are handled by kmenu.js) */
  var REGIONS = '#site-header, #unified-header, #kmenu, #site-footer, footer, .pv-foot, .last-section, .end-label';
  var SKIP = '.kmenu-word, .kword, .kmenu-marquee-track, [data-es], [data-es-html], script, style, noscript';

  /* ── state ── */
  function norm(v) { return v === 'es' ? 'es' : 'en'; }
  function read() {
    var v = null;
    try {
      v = localStorage.getItem(KEY);
      // old DE/EN key: only an 'en' choice would survive, which is the default anyway -> just drop it
      if (localStorage.getItem(OLD_KEY) !== null) localStorage.removeItem(OLD_KEY);
    } catch (e) {}
    return norm(v);
  }
  /* Pages under /es/ are real Spanish URLs: they always run in Spanish and make Spanish the stored preference. */
  var ES_PATH = /^\/es(\/|$)/.test(location.pathname);
  /* A page can declare its counterpart in the other language: <meta name="pv-alt-en|pv-alt-es" content="/path/">.
     Switching language then navigates there instead of swapping text. */
  function altUrl(l) {
    var m = doc.querySelector('meta[name="pv-alt-' + l + '"]');
    var u = m && m.getAttribute('content');
    return u && u !== location.pathname ? u : null;
  }
  var lang = ES_PATH ? 'es' : read();
  if (ES_PATH) { try { localStorage.setItem(KEY, 'es'); } catch (e) {} }
  doc.documentElement.lang = lang;

  /* ── generic attribute translation ── */
  var ATTRS = [['data-es-aria', 'aria-label'], ['data-es-alt', 'alt'], ['data-es-title', 'title'], ['data-es-placeholder', 'placeholder'], ['data-es-content', 'content'], ['data-es-href', 'href']];

  function memo(el) { return el.__pvl || (el.__pvl = {}); }

  function setProp(el, kind, es) {          // kind: 'text' | 'html'
    var m = memo(el), cur = kind === 'html' ? el.innerHTML : el.textContent;
    if (lang === 'es') {
      if (m[kind] && m[kind].tr === cur) return;
      var orig = cur;
      if (kind === 'html') el.innerHTML = es; else el.textContent = es;
      m[kind] = { en: orig, tr: kind === 'html' ? el.innerHTML : el.textContent };
    } else if (m[kind] && m[kind].tr === cur) {
      if (kind === 'html') el.innerHTML = m[kind].en; else el.textContent = m[kind].en;
      m[kind] = null;
    }
  }
  function setAttr(el, attr, es) {
    var m = memo(el), k = 'a:' + attr, cur = el.getAttribute(attr);
    if (lang === 'es') {
      if (m[k] && m[k].tr === cur) return;
      m[k] = { en: cur, tr: es };
      el.setAttribute(attr, es);
    } else if (m[k] && m[k].tr === cur) {
      if (m[k].en === null) el.removeAttribute(attr); else el.setAttribute(attr, m[k].en);
      m[k] = null;
    }
  }

  function applyAttributes(root) {
    var i, j, list, el;
    list = root.querySelectorAll('[data-es]');
    for (i = 0; i < list.length; i++) {
      el = list[i];
      if (el.matches('.kmenu-word, .kword')) continue;
      setProp(el, 'text', el.getAttribute('data-es'));
      if (el.tagName === 'TITLE') doc.title = el.textContent;
    }
    list = root.querySelectorAll('[data-es-html]');
    for (i = 0; i < list.length; i++) setProp(list[i], 'html', list[i].getAttribute('data-es-html'));
    for (j = 0; j < ATTRS.length; j++) {
      list = root.querySelectorAll('[' + ATTRS[j][0] + ']');
      for (i = 0; i < list.length; i++) setAttr(list[i], ATTRS[j][1], list[i].getAttribute(ATTRS[j][0]));
    }
    if (root === doc || root === doc.documentElement) {
      var t = doc.querySelector('title[data-es]');
      if (t) doc.title = t.textContent;
    }
  }

  /* ── COMMON dictionary on shared regions ── */
  function commonNode(n) {
    var v = n.nodeValue, m = n.__pvc;
    if (lang === 'es') {
      if (m && m.tr === v) return;
      var s = v.trim();
      if (!s || !COMMON.hasOwnProperty(s)) return;
      var lead = v.match(/^\s*/)[0], trail = v.match(/\s*$/)[0];
      var tr = lead + COMMON[s] + trail;
      n.__pvc = { en: v, tr: tr };
      n.nodeValue = tr;
    } else if (m && m.tr === v) {
      n.nodeValue = m.en;
      n.__pvc = null;
    }
  }
  function commonAttrs(root) {
    var list = root.querySelectorAll('[aria-label], [title]'), i, el, a, v, m, k;
    for (i = 0; i < list.length; i++) {
      el = list[i];
      for (a = 0; a < 2; a++) {
        var name = a ? 'title' : 'aria-label';
        v = el.getAttribute(name);
        if (v === null) continue;
        m = memo(el); k = 'c:' + name;
        if (lang === 'es') {
          if (m[k] && m[k].tr === v) continue;
          if (COMMON_ATTR.hasOwnProperty(v)) { m[k] = { en: v, tr: COMMON_ATTR[v] }; el.setAttribute(name, COMMON_ATTR[v]); }
        } else if (m[k] && m[k].tr === v) {
          el.setAttribute(name, m[k].en);
          m[k] = null;
        }
      }
    }
  }
  function applyCommon(root) {
    var regions = root.querySelectorAll(REGIONS), r, w, n;
    for (r = 0; r < regions.length; r++) {
      w = doc.createTreeWalker(regions[r], NodeFilter.SHOW_TEXT, null, false);
      var nodes = [];
      while ((n = w.nextNode())) nodes.push(n);
      for (var i = 0; i < nodes.length; i++) {
        n = nodes[i];
        if (n.parentNode && n.parentNode.closest && n.parentNode.closest(SKIP)) continue;
        commonNode(n);
      }
    }
    commonAttrs(root);
  }

  /* ── switches ── */
  function markSwitches() {
    var i, b, list = doc.querySelectorAll('[data-set-lang]');
    for (i = 0; i < list.length; i++) {
      b = list[i];
      var on = b.getAttribute('data-set-lang') === lang;
      if (b.classList) b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    // legacy single toggles name the OTHER language
    list = doc.querySelectorAll('#langToggle, #langToggleMobile, #langToggleOverlay');
    for (i = 0; i < list.length; i++) list[i].textContent = lang === 'es' ? 'EN' : 'ES';
  }

  function apply(root) {
    root = root || doc;
    applyAttributes(root);
    applyCommon(root);
    if (root === doc) markSwitches();
  }

  function emit() {
    var i;
    for (i = 0; i < listeners.length; i++) { try { listeners[i](lang); } catch (e) {} }
    var ev;
    try { ev = new CustomEvent('pv:lang', { detail: { lang: lang } }); }
    catch (e2) { ev = doc.createEvent('CustomEvent'); ev.initCustomEvent('pv:lang', false, false, { lang: lang }); }
    doc.dispatchEvent(ev);
  }

  function toFrames() {
    var frames = doc.getElementsByTagName('iframe'), i;
    for (i = 0; i < frames.length; i++) {
      try {
        var w = frames[i].contentWindow;
        if (w && w.pvLang && w.pvLang.set) w.pvLang.set(lang);
      } catch (e) {}
    }
  }

  function set(next, opts) {
    next = norm(next);
    var changed = next !== lang;
    lang = next;
    if (!(opts && opts.nostore)) { try { localStorage.setItem(KEY, lang); } catch (e) {} }
    doc.documentElement.lang = lang;
    apply(doc);
    if (changed || (opts && opts.force)) emit();
    toFrames();
    return lang;
  }

  window.pvLang = {
    get: function () { return lang; },
    set: set,
    t: function (en, es) { return lang === 'es' ? es : en; },
    on: function (fn, immediate) { if (typeof fn === 'function') { listeners.push(fn); if (immediate) fn(lang); } },
    apply: apply
  };

  /* ── wiring ── */
  doc.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-set-lang], #langToggle, #langToggleMobile, #langToggleOverlay') : null;
    if (!t) return;
    var target = t.hasAttribute('data-set-lang') ? norm(t.getAttribute('data-set-lang')) : (lang === 'es' ? 'en' : 'es');
    if (!t.hasAttribute('data-set-lang')) e.preventDefault();
    var alt = target !== lang || ES_PATH ? altUrl(target) : null;
    if (alt && target !== lang) {            // counterpart URL exists -> store the choice and go there
      try { localStorage.setItem(KEY, target); } catch (e2) {}
      location.href = alt;
      return;
    }
    set(target);
  });
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY || norm(e.newValue) === lang) return;
    if (ES_PATH) return;                      // /es/ pages stay Spanish
    var alt = altUrl(norm(e.newValue));
    if (alt) { location.replace(alt); return; }
    set(e.newValue, { nostore: true });
  });

  function init() { apply(doc); }
  if (doc.body) init();
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  window.addEventListener('load', function () { apply(doc); toFrames(); });
})();
