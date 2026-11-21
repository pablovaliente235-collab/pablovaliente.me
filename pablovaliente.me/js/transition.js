/* ═══ Page transitions — kinetic typography, every internal navigation ═══
   Leave: a dark panel slides up, the destination name rises in letter by letter, then we navigate.
   Enter: the next page starts covered (html.pv-entering, set by a head snippet only when we arrived through a transition),
   the name rises out, the panel slides away. Direct visits never see a cover.
   API: window.pvTransition(url, label, { kicker, lang })  — see /I18N.md ("Page transitions"). */
(function () {
  'use strict';
  var KEY = 'pv-tx', doc = document, root = doc.documentElement;
  var LEAVE_MS = 500, RM_MS = 170, MAX_AGE = 8000;
  var busy = false, timers = [], ov = null;

  var reduce = function () { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  var L = window.pvLang || null;
  function T(en, es, lang) { lang = lang || (L ? L.get() : 'en'); return lang === 'es' ? es : en; }

  /* ── CSS (injected, so no <head> edits other than the tiny anti-flash snippet) ── */
  var css = '' +
    '#pv-transition{position:fixed;inset:0;z-index:2147483000;background:#0C0C0B;color:#F2F0EF;visibility:hidden;pointer-events:none;transform:translateY(100%);display:flex;align-items:center;padding:0 40px;font-family:"neue-haas-grotesk-display",sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden}' +
    '#pv-transition.pv-on{visibility:visible;pointer-events:auto}' +
    '#pv-transition.pv-up{transform:translateY(0);transition:transform .4s cubic-bezier(.77,0,.175,1)}' +
    '#pv-transition.pv-reveal{transform:translateY(-100%);pointer-events:none;transition:transform .5s cubic-bezier(.77,0,.175,1) .08s}' +
    '#pv-transition.pv-menu{transform:none;background-color:rgba(12,12,11,0);transition:background-color .35s ease}' +
    '#pv-transition.pv-menu.pv-up{background-color:#0C0C0B;transition:background-color .35s ease}' +
    '#pv-transition.pv-rm{transform:none;opacity:0;transition:opacity .15s ease}' +
    '#pv-transition.pv-rm.pv-up{opacity:1}' +
    '#pv-transition.pv-rm.pv-reveal{opacity:0;pointer-events:none;transition:opacity .15s ease}' +
    '#pv-transition.pv-rm .pv-tx-in{display:none}' +
    '#pv-transition.pv-instant,#pv-transition.pv-instant *{transition:none!important}' +
    '#pv-transition *{box-sizing:border-box}' +
    '.pv-tx-in{max-width:100%;--pvfs:clamp(34px,min(10vw,19vh),230px)}' +
    '.pv-tx-kicker{display:block;font-size:12px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;line-height:1;margin:0 0 calc(var(--pvfs)*.14);opacity:0;transform:translateY(8px);transition:opacity .35s ease .1s,transform .45s cubic-bezier(.22,1,.36,1) .1s}' +
    '.pv-in .pv-tx-kicker{opacity:.5;transform:none}' +
    '.pv-out .pv-tx-kicker{opacity:0;transform:translateY(-8px);transition:opacity .25s ease,transform .35s ease}' +
    '.pv-tx-text{display:flex;flex-wrap:wrap;column-gap:.24em;font-size:var(--pvfs);font-weight:500;letter-spacing:-.035em;line-height:.98}' +
    '.pv-w{display:inline-block;overflow:hidden;white-space:nowrap;padding:.04em .04em .14em 0;margin-right:-.04em;margin-bottom:-.1em}' +
    '.pv-w .ch{display:inline-block;white-space:pre;transform:translateY(125%);transition:transform .42s cubic-bezier(.22,1,.36,1);transition-delay:calc(var(--base,0ms) + var(--d,0)*1ms)}' +
    '.pv-in .pv-w .ch{transform:translateY(0)}' +
    '.pv-out .pv-w .ch{transform:translateY(-125%);transition:transform .45s cubic-bezier(.7,0,.3,1);transition-delay:calc(var(--d,0)*1ms)}' +
    /* menu words rise out while the destination rises in */
    '.kmenu.pv-leaving .kmenu-word .ch{transform:translateY(-2.2em)!important;transition:transform .5s cubic-bezier(.7,0,.3,1)!important;transition-delay:calc(var(--i,0)*16ms)!important}' +
    '.kmenu.pv-leaving .kmenu-idx,.kmenu.pv-leaving .kmenu-foot,.kmenu.pv-leaving .kmenu-marquee{opacity:0!important;transition:opacity .25s ease!important}' +
    '@media (max-width:767px){#pv-transition{padding:0 24px}.pv-tx-in{--pvfs:clamp(34px,min(15vw,13svh),96px)}}';
  var st = doc.createElement('style');
  st.setAttribute('data-pv-transition', '');
  st.textContent = css;
  (doc.head || root).appendChild(st);

  /* ── label resolution ── */
  var NAMES = {
    '/': ['Film', 'Film', 'Film'],
    '/services': ['Services', 'Servicios'],
    '/es/servicios': ['Services', 'Servicios'],
    '/services/brand-commercial-video-production': ['Commercial video', 'Vídeo comercial'],
    '/es/servicios/video-publicitario-marca': ['Commercial video', 'Vídeo comercial'],
    '/services/hotel-hospitality-video-production': ['Hotels & hospitality', 'Hoteles y hostelería'],
    '/es/servicios/video-hoteles-hosteleria': ['Hotels & hospitality', 'Hoteles y hostelería'],
    '/services/real-estate-video-photography': ['Real estate', 'Inmobiliaria'],
    '/es/servicios/video-fotografia-inmobiliaria': ['Real estate', 'Inmobiliaria'],
    '/services/remote-video-editing-color-grading': ['Editing & grading', 'Edición y etalonaje'],
    '/es/servicios/edicion-video-etalonaje-remoto': ['Editing & grading', 'Edición y etalonaje'],
    '/dctl': ['DCTLs', 'DCTLs'],
    '/about': ['About', 'Sobre mí'],
    '/contact': ['Contact', 'Contacto'],
    '/start-a-project': ['Start a project', 'Empezar un proyecto'],
    '/bellamar': ['Bellamar Hotel', 'Bellamar Hotel'],
    '/marvell': ['Marvell Club', 'Marvell Club'],
    '/ordinary': ['The Ordinary', 'The Ordinary'],
    '/esparadis': ['Es Paradis', 'Es Paradis'],
    '/perdido-en-una-perdiz': ['Perdido en una perdiz', 'Perdido en una perdiz'],
    '/zufaellige-begegnung': ['Zufällige Begegnung', 'Zufällige Begegnung'],
    '/architecture': ['Monasterio de San Miguel', 'Monasterio de San Miguel'],
    '/architecture/japanese': ['Japanese Sanctuary', 'Santuario japonés'],
    '/architecture/iglesia-yaguaron': ['Iglesia de Yaguarón', 'Iglesia de Yaguarón'],
    '/hospitality': ['Bellamar Hotel Ibiza', 'Bellamar Hotel Ibiza']
  };
  var KICK = {
    film: ['Film', 'Film'], photo: ['Photography', 'Fotografía'], svc: ['Services', 'Servicios']
  };
  function normPath(p) {
    p = p.toLowerCase().replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    if (p.length > 1) p = p.replace(/\/+$/, '');
    return p || '/';
  }
  function kickerFor(p) {
    if (/^\/(architecture|hospitality)/.test(p)) return KICK.photo;
    if (/^\/(services|es\/servicios)/.test(p)) return KICK.svc;
    if (/^\/(bellamar|marvell|ordinary|esparadis|perdido-en-una-perdiz|zufaellige-begegnung)$/.test(p)) return KICK.film;
    return null;
  }
  function labelForUrl(u, lang) {
    var p = normPath(u.pathname);
    if (p === '/' && /^#(works|photography)$/.test(u.hash)) return T('Photography', 'Fotografía', lang);
    var n = NAMES[p];
    return n ? T(n[0], n[1], lang) : '';
  }
  function kickerForUrl(u, lang) {
    var k = kickerFor(normPath(u.pathname));
    return k ? T(k[0], k[1], lang) : 'Pablo Valiente';
  }
  function clean(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

  /* ── overlay ── */
  function build(label, kicker) {
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    ov = doc.createElement('div');
    ov.id = 'pv-transition';
    ov.setAttribute('aria-hidden', 'true');
    var inner = doc.createElement('div'); inner.className = 'pv-tx-in';
    var k = doc.createElement('span'); k.className = 'pv-tx-kicker'; k.textContent = kicker || 'Pablo Valiente';
    var tx = doc.createElement('div'); tx.className = 'pv-tx-text';
    var words = clean(label).split(' ').filter(Boolean), n = 0, total = clean(label).length;
    var step = Math.min(20, 130 / Math.max(total, 1));
    words.forEach(function (w) {
      var ws = doc.createElement('span'); ws.className = 'pv-w';
      Array.from(w).forEach(function (c) {
        var s = doc.createElement('span'); s.className = 'ch'; s.textContent = c;
        s.style.setProperty('--d', Math.round(n * step)); n++;
        ws.appendChild(s);
      });
      n++;
      tx.appendChild(ws);
    });
    inner.appendChild(k); inner.appendChild(tx); ov.appendChild(inner);
    (doc.body || root).appendChild(ov);
    return ov;
  }
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function reflow() { return ov && ov.offsetWidth; }

  function reset() {
    clearTimers();
    busy = false;
    try { sessionStorage.removeItem(KEY); } catch (e) {}
    root.classList.remove('pv-entering');
    if (ov) { ov.className = ''; if (ov.parentNode) ov.parentNode.removeChild(ov); ov = null; }
    var m = doc.getElementById('kmenu');
    if (m) m.classList.remove('pv-leaving');
    if (window.pvMenu && window.pvMenu.isOpen && window.pvMenu.isOpen()) window.pvMenu.close();
    root.classList.remove('kmenu-lock');
    doc.body && doc.body.classList.remove('kmenu-open');
  }

  /* ── leave ── */
  function go(url, label, opts) {
    opts = opts || {};
    if (busy) return;
    var u;
    try { u = new URL(url, location.href); } catch (e) { location.href = url; return; }
    var lang = opts.lang;
    label = clean(label) || labelForUrl(u, lang) || 'Pablo Valiente';
    var kicker = opts.kicker || kickerForUrl(u, lang);
    if (!doc.body) { location.href = u.href; return; }
    busy = true;
    try { sessionStorage.setItem(KEY, Date.now() + '|' + kicker + '|' + label); } catch (e) {}
    var rm = reduce();
    build(label, kicker);
    var menu = doc.getElementById('kmenu');
    var fromMenu = !!(menu && menu.classList.contains('open'));
    ov.classList.add('pv-instant', 'pv-on');
    if (rm) ov.classList.add('pv-rm'); else if (fromMenu) ov.classList.add('pv-menu');
    reflow();
    ov.classList.remove('pv-instant');
    ov.style.setProperty('--base', fromMenu ? '180ms' : '90ms');
    if (fromMenu && !rm) menu.classList.add('pv-leaving');
    requestAnimationFrame(function () {
      if (!ov) return;
      ov.classList.add('pv-up', 'pv-in');
    });
    later(function () { location.href = u.href; }, rm ? RM_MS : LEAVE_MS);
    // never leave the user stuck if the navigation is cancelled (e.g. a download or a beforeunload prompt)
    later(function () { if (busy) reset(); }, 4000);
  }

  /* ── enter ── */
  function enter() {
    var v = null;
    try { v = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch (e) {}
    if (!v || Date.now() - parseInt(v, 10) > MAX_AGE) { root.classList.remove('pv-entering'); return; }
    var parts = v.split('|');
    var kicker = parts[1], label = parts.slice(2).join('|');
    var rm = reduce();
    busy = true;
    build(label, kicker);
    ov.classList.add('pv-instant', 'pv-on', 'pv-up', 'pv-in');
    if (rm) ov.classList.add('pv-rm');
    ov.style.setProperty('--base', '0ms');
    reflow();
    root.classList.remove('pv-entering');   // same task as the overlay insert: no flash
    ov.classList.remove('pv-instant');
    try { doc.activeElement && doc.activeElement.blur && doc.activeElement.blur(); doc.body.setAttribute('tabindex', '-1'); doc.body.focus({ preventScroll: true }); doc.body.removeAttribute('tabindex'); } catch (e) {}
    var hold = rm ? 40 : 150;
    later(function () {
      if (!ov) return;
      if (!rm) ov.classList.add('pv-out');
      ov.classList.remove('pv-up');
      ov.classList.add('pv-reveal');
    }, hold);
    later(finish, hold + (rm ? 220 : 760));
    later(finish, 1500);   // safety
  }
  function finish() {
    clearTimers();
    busy = false;
    root.classList.remove('pv-entering');
    if (ov) { if (ov.parentNode) ov.parentNode.removeChild(ov); ov = null; }
  }

  /* ── link interception ── */
  function eligible(a, e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
    if (a.hasAttribute('download') || a.hasAttribute('data-book') || a.hasAttribute('data-no-transition')) return null;
    var tg = a.getAttribute('target');
    if (tg && tg !== '_self') return null;
    if ((a.getAttribute('rel') || '').indexOf('external') > -1) return null;
    var h = a.getAttribute('href');
    if (!h || h.charAt(0) === '#') return null;
    var u;
    try { u = new URL(a.href, location.href); } catch (err) { return null; }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (u.origin !== location.origin) return null;
    if (u.pathname === location.pathname && u.search === location.search) return null;   // same page (hash / reload)
    var last = u.pathname.split('/').pop();
    if (last.indexOf('.') > -1 && !/\.html?$/i.test(last)) return null;                 // files
    return u;
  }
  function kmenuLabel(a) {
    var w = a.querySelector('.kmenu-word');
    if (!w) return null;
    var links = Array.prototype.slice.call(a.parentNode.querySelectorAll('.kmenu-link'));
    var i = links.indexOf(a) + 1;
    return { label: clean(w.getAttribute('aria-label') || w.textContent), kicker: i ? (i < 10 ? '0' + i : '' + i) : null };
  }
  doc.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var u = eligible(a, e);
    if (!u) return;
    e.preventDefault();
    if (busy) return;
    var menu = doc.getElementById('kmenu');
    // kmenu.js closes the menu on a plain link click; re-open it synchronously (no frame is painted in between) so it can animate out
    if (menu && menu.contains(a) && window.pvMenu && !window.pvMenu.isOpen()) window.pvMenu.open();
    var km = menu && menu.contains(a) ? kmenuLabel(a) : null;
    var label = km && km.label || a.getAttribute('data-transition-label') || '';
    var kicker = km && km.kicker || a.getAttribute('data-transition-kicker') || '';
    if (!label) label = labelForUrl(u);
    if (!label) { var t = clean(a.textContent); label = t && t.length <= 24 ? t : 'Pablo Valiente'; }
    go(u.href, label, { kicker: kicker || null });
  });

  window.addEventListener('pageshow', function (e) { if (e.persisted) reset(); });
  window.pvTransition = go;
  window.pvTransition.reset = reset;

  if (root.classList.contains('pv-entering') || (function () { try { return !!sessionStorage.getItem(KEY); } catch (e) { return false; } })()) {
    if (doc.body) enter(); else doc.addEventListener('DOMContentLoaded', enter);
  }
})();
