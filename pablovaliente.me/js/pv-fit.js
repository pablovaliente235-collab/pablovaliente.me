/* Project pages (desktop): keep the spec column clear of the progress bar and inside the viewport.
   The column starts at mid-screen by design; on shorter screens it is lifted just enough to fit. */
(function () {
  function fit() {
    var L = document.querySelector('.hero-left'), C = document.getElementById('hero-content'),
        B = document.querySelector('.hero-bottom'), P = document.getElementById('slide-progress-pct'),
        I = document.getElementById('hero-inner'), H = document.getElementById('site-header');
    if (!L || !C || !B || !P) return;
    L.style.paddingTop = ''; B.style.paddingTop = '';
    if (window.innerWidth < 1024) return;
    var m = I && /translateY\((-?[\d.]+)px\)/.exec(I.style.transform || '');
    var ty = m ? parseFloat(m[1]) : 0;
    var top = C.getBoundingClientRect().top - ty, bottom = C.getBoundingClientRect().bottom - ty;
    var minTop = (H ? H.getBoundingClientRect().bottom : 70) + 32;
    var abs = getComputedStyle(B).position === 'absolute';
    var cut = abs ? bottom - (P.getBoundingClientRect().top - 32)
                  : B.getBoundingClientRect().bottom - ty - (window.innerHeight - 28);
    if (cut <= 0) return;
    var mv = Math.min(cut, Math.max(0, top - minTop));
    L.style.paddingTop = (parseFloat(getComputedStyle(L).paddingTop) - mv) + 'px';
    cut -= mv;
    if (cut > 0 && !abs) B.style.paddingTop = Math.max(40, parseFloat(getComputedStyle(B).paddingTop) - cut) + 'px';
  }
  var t;
  function later() { clearTimeout(t); t = setTimeout(fit, 150); }
  window.addEventListener('load', later);
  window.addEventListener('resize', later);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
})();
