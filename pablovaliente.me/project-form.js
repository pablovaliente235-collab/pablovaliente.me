/* ═══ Start a project — step-by-step brief (EN / ES) ═══
   Steps depend on the project type. Answers are sent with EmailJS (same account as the old .de contact form). */
(function () {
  'use strict';
  var root = document.getElementById('wizard');
  if (!root) return;

  var EMAILJS = { publicKey: 'YggEpE1djhQMkvTjR', service: 'service_2tx7dek', template: 'template_q9akzca' };
  var STORE = 'pv-project';

  function L(en, es) { return { en: en, es: es }; }
  function lang() { return document.documentElement.lang === 'es' ? 'es' : 'en'; }
  function tr(x) { return typeof x === 'string' ? x : (x[lang()] || x.en); }
  function o(v, en, es, d) { return { v: v, l: L(en, es || en), d: d || null }; }

  // ── option lists ──
  var LENGTHS = [o('<30s', 'Under 30 s', 'Menos de 30 s'), o('30-60s', '30–60 s'), o('1-3min', '1–3 min'), o('3min+', '3 min +')];
  var FORMATS = [o('16:9', '16:9 Horizontal'), o('9:16', '9:16 Vertical'), o('1:1', '1:1 Square', '1:1 Cuadrado'), o('4:5', '4:5 Feed')];
  var SIZES = [o('<100', 'Under 100 m²', 'Menos de 100 m²'), o('100-250', '100–250 m²'), o('250-500', '250–500 m²'), o('500+', '500 m² +')];
  var BUDGETS = {
    production: [o('<2000', 'Under €2,000', 'Menos de 2.000 €'), o('2000-4000', '€2,000 – 4,000', '2.000 – 4.000 €'), o('4000-8000', '€4,000 – 8,000', '4.000 – 8.000 €'), o('8000-15000', '€8,000 – 15,000', '8.000 – 15.000 €'), o('15000+', '€15,000 +', '15.000 € +'), o('unsure', 'Not sure yet', 'Aún no lo sé')],
    photo: [o('<500', 'Under €500', 'Menos de 500 €'), o('500-1000', '€500 – 1,000', '500 – 1.000 €'), o('1000-2000', '€1,000 – 2,000', '1.000 – 2.000 €'), o('2000+', '€2,000 +', '2.000 € +'), o('unsure', 'Not sure yet', 'Aún no lo sé')],
    post: [o('<500', 'Under €500', 'Menos de 500 €'), o('500-1000', '€500 – 1,000', '500 – 1.000 €'), o('1000-2500', '€1,000 – 2,500', '1.000 – 2.500 €'), o('2500+', '€2,500 +', '2.500 € +'), o('unsure', 'Not sure yet', 'Aún no lo sé')]
  };
  BUDGETS.other = BUDGETS.production;

  // ── steps ── field types: cards, single, multi, counter, text, email, tel, textarea, date, check
  var STEPS = [
    { id: 'type', title: L('What are we making?', '¿Qué vamos a hacer?'), help: L('Pick the one that fits best.', 'Elige la opción que mejor encaje.'),
      fields: [{ id: 'type', type: 'cards', req: true, opts: [
        o('production', 'Full production', 'Producción completa', L('Video from concept to delivery: real estate, hotels, brands.', 'Vídeo de la idea a la entrega: inmobiliaria, hoteles, marcas.')),
        o('photo', 'Photography', 'Fotografía', L('Architecture, interiors and real estate.', 'Arquitectura, interiores e inmobiliaria.')),
        o('post', 'Editing & colour', 'Edición y color', L('You already have the footage.', 'Ya tienes el material grabado.')),
        o('other', 'Something else', 'Otra cosa', L('Tell me in a few words.', 'Cuéntamelo en pocas palabras.'))] }] },

    // Full production
    { id: 'p-kind', when: is('production'), title: L('What kind of video?', '¿Qué tipo de vídeo?'),
      fields: [{ id: 'kind', type: 'single', req: true, opts: [o('realestate', 'Real estate & interiors', 'Inmobiliaria e interiores'), o('hotel', 'Hotel & hospitality', 'Hotel y hospitality'), o('brand', 'Brand film', 'Película de marca'), o('social', 'Social media campaign', 'Campaña para redes'), o('event', 'Event', 'Evento'), o('short', 'Short film', 'Cortometraje'), o('other', 'Other', 'Otro')] }] },
    { id: 'p-concept', when: is('production'), title: L('How far along is the idea?', '¿En qué punto está la idea?'),
      fields: [{ id: 'concept', type: 'single', req: true, opts: [o('ready', 'Script or clear idea ready', 'Tengo guion o una idea clara'), o('help', 'I need help with the concept', 'Necesito ayuda con la idea'), o('unsure', 'Not sure yet', 'Aún no lo sé')] }] },
    { id: 'p-deliv', when: is('production'), title: L('What do you need delivered?', '¿Qué necesitas que te entregue?'),
      fields: [{ id: 'videos', type: 'counter', label: L('Number of videos', 'Número de vídeos'), min: 1, max: 20, def: 1 },
               { id: 'length', type: 'single', req: true, label: L('Length of the main video', 'Duración del vídeo principal'), opts: LENGTHS },
               { id: 'formats', type: 'multi', req: true, label: L('Formats', 'Formatos'), opts: FORMATS }] },
    { id: 'p-shoot', when: is('production'), title: L('Tell me about the shoot.', 'Háblame del rodaje.'),
      fields: [{ id: 'days', type: 'single', req: true, label: L('Shooting days', 'Días de rodaje'), opts: [o('half', 'Half a day', 'Media jornada'), o('1', '1 day', '1 día'), o('2', '2 days', '2 días'), o('3+', '3 days +', '3 días +'), o('unsure', 'Not sure', 'No lo sé')] },
               { id: 'locations', type: 'counter', label: L('Locations', 'Localizaciones'), min: 1, max: 10, def: 1 },
               { id: 'place', type: 'text', label: L('Where? (optional)', '¿Dónde? (opcional)'), ph: L('City, country', 'Ciudad, país') }] },
    { id: 'p-property', when: function (s) { return s.type === 'production' && (s.kind === 'realestate' || s.kind === 'hotel'); },
      title: L('About the property.', 'Sobre la propiedad.'),
      fields: [{ id: 'property', type: 'single', req: true, label: L('Type', 'Tipo'), opts: [o('apartment', 'Apartment', 'Piso'), o('villa', 'House / villa', 'Casa / villa'), o('hotel', 'Hotel', 'Hotel'), o('commercial', 'Commercial space', 'Local comercial'), o('other', 'Other', 'Otro')] },
               { id: 'size', type: 'single', req: true, label: L('Approximate size', 'Tamaño aproximado'), opts: SIZES }] },
    { id: 'p-extras', when: is('production'), title: L('Anything extra?', '¿Algo más?'), help: L('Optional, pick as many as you like.', 'Opcional, elige todas las que quieras.'),
      fields: [{ id: 'extras', type: 'multi', opts: [o('drone', 'Drone', 'Dron'), o('voice', 'Interviews / voice-over', 'Entrevistas / voz en off'), o('talent', 'Models / talent', 'Modelos / talento'), o('music', 'Licensed music', 'Música con licencia'), o('photos', 'Photos too', 'También fotos'), o('subs', 'Subtitles', 'Subtítulos')] }] },
    { id: 'p-usage', when: is('production'), title: L('Where will it be published?', '¿Dónde se publicará?'),
      fields: [{ id: 'usage', type: 'multi', req: true, opts: [o('web', 'Website', 'Web'), o('social', 'Social media', 'Redes sociales'), o('ads', 'Paid ads', 'Publicidad pagada'), o('tv', 'TV / cinema', 'TV / cine'), o('internal', 'Internal', 'Uso interno')] }] },

    // Photography
    { id: 'f-kind', when: is('photo'), title: L('What should I photograph?', '¿Qué fotografío?'),
      fields: [{ id: 'kind', type: 'single', req: true, opts: [o('architecture', 'Architecture', 'Arquitectura'), o('interiors', 'Interiors', 'Interiores'), o('listing', 'Real estate listing', 'Anuncio inmobiliario'), o('hospitality', 'Hotel & hospitality', 'Hotel y hospitality')] }] },
    { id: 'f-scope', when: is('photo'), title: L('How big is it?', '¿Cómo de grande es?'),
      fields: [{ id: 'properties', type: 'counter', label: L('Properties / locations', 'Propiedades / localizaciones'), min: 1, max: 20, def: 1 },
               { id: 'size', type: 'single', req: true, label: L('Approximate size', 'Tamaño aproximado'), opts: SIZES },
               { id: 'place', type: 'text', label: L('Where? (optional)', '¿Dónde? (opcional)'), ph: L('City, country', 'Ciudad, país') }] },
    { id: 'f-images', when: is('photo'), title: L('How many final images?', '¿Cuántas fotos finales?'),
      fields: [{ id: 'images', type: 'single', req: true, opts: [o('10', '~10'), o('20', '~20'), o('30', '~30'), o('50+', '50 +')] },
               { id: 'extras', type: 'multi', label: L('Extras (optional)', 'Extras (opcional)'), opts: [o('twilight', 'Twilight shots', 'Fotos al atardecer'), o('drone', 'Drone', 'Dron'), o('details', 'Details & lifestyle', 'Detalles y lifestyle')] }] },
    { id: 'f-usage', when: is('photo'), title: L('Where will they be used?', '¿Dónde se usarán?'),
      fields: [{ id: 'usage', type: 'multi', req: true, opts: [o('web', 'Website / listing portal', 'Web / portal inmobiliario'), o('social', 'Social media', 'Redes sociales'), o('print', 'Print / advertising', 'Impresión / publicidad')] }] },

    // Editing & colour
    { id: 'e-service', when: is('post'), title: L('What do you need?', '¿Qué necesitas?'),
      fields: [{ id: 'service', type: 'single', req: true, opts: [o('edit', 'Editing', 'Edición'), o('grade', 'Colour grading', 'Etalonaje'), o('both', 'Editing + colour', 'Edición + color'), o('look', 'Custom look / DCTL', 'Look a medida / DCTL')] }] },
    { id: 'e-footage', when: is('post'), title: L('About your footage.', 'Sobre tu material.'),
      fields: [{ id: 'camera', type: 'single', req: true, label: L('Camera', 'Cámara'), opts: [o('sony', 'Sony'), o('arri', 'ARRI'), o('red', 'RED'), o('bmd', 'Blackmagic'), o('canon', 'Canon'), o('panasonic', 'Panasonic'), o('phone', 'Phone / drone', 'Móvil / dron'), o('other', 'Other', 'Otra')] },
               { id: 'log', type: 'single', req: true, label: L('Recorded in', 'Grabado en'), opts: [o('log', 'Log / RAW'), o('709', 'Rec.709 / standard', 'Rec.709 / estándar'), o('unsure', 'Not sure', 'No lo sé')] },
               { id: 'hours', type: 'single', req: true, label: L('Raw footage', 'Material en bruto'), opts: [o('<1', 'Under 1 h', 'Menos de 1 h'), o('1-3', '1–3 h'), o('3-10', '3–10 h'), o('10+', '10 h +')] }] },
    { id: 'e-output', when: is('post'), title: L('What should I deliver?', '¿Qué te entrego?'),
      fields: [{ id: 'pieces', type: 'counter', label: L('Number of pieces', 'Número de piezas'), min: 1, max: 30, def: 1 },
               { id: 'length', type: 'single', req: true, label: L('Final length', 'Duración final'), opts: LENGTHS },
               { id: 'formats', type: 'multi', req: true, label: L('Formats', 'Formatos'), opts: FORMATS },
               { id: 'colorspace', type: 'single', req: true, label: L('Delivery colour space', 'Espacio de color de entrega'), opts: [o('709', 'Rec.709'), o('p3', 'P3'), o('hdr', 'HDR'), o('unsure', 'Not sure', 'No lo sé')] }] },
    { id: 'e-extras', when: is('post'), title: L('Almost there.', 'Ya casi.'),
      fields: [{ id: 'status', type: 'single', req: true, label: L('Is it shot?', '¿Está grabado?'), opts: [o('shot', 'Already shot', 'Ya está grabado'), o('soon', 'Shooting soon', 'Se graba pronto'), o('notyet', 'Not shot yet', 'Aún no')] },
               { id: 'extras', type: 'multi', label: L('Extras (optional)', 'Extras (opcional)'), opts: [o('sound', 'Sound mix', 'Mezcla de sonido'), o('music', 'Music', 'Música'), o('subs', 'Subtitles', 'Subtítulos'), o('titles', 'Titles / motion graphics', 'Rótulos / motion graphics')] }] },

    // Something else
    { id: 'o-desc', when: is('other'), title: L('Tell me in a few words.', 'Cuéntamelo en pocas palabras.'),
      fields: [{ id: 'desc', type: 'textarea', req: true, ph: L('What do you have in mind?', '¿Qué tienes en mente?') }] },

    // Common
    { id: 'time', title: L('When?', '¿Cuándo?'),
      fields: [{ id: 'when', type: 'single', req: true, opts: [o('asap', 'As soon as possible', 'Lo antes posible'), o('month', 'Within a month', 'En el próximo mes'), o('1-3', 'In 1–3 months', 'En 1–3 meses'), o('3+', 'In 3+ months', 'En más de 3 meses'), o('flexible', 'Flexible')] },
               { id: 'date', type: 'date', label: L('Exact date, if you have one (optional)', 'Fecha exacta, si la tienes (opcional)') }] },
    { id: 'budget', title: L("What's the budget?", '¿Qué presupuesto tienes?'), help: L('A range is enough. It helps me propose the right approach.', 'Basta con un rango. Me ayuda a proponerte el enfoque adecuado.'),
      fields: [{ id: 'budget', type: 'single', req: true, opts: function (s) { return BUDGETS[s.type] || BUDGETS.production; } }] },
    { id: 'about', title: L('Last step: who are you?', 'Último paso: ¿quién eres?'),
      fields: [{ id: 'name', type: 'text', req: true, label: L('Name', 'Nombre'), auto: 'name' },
               { id: 'email', type: 'email', req: true, label: L('Email', 'Email'), auto: 'email' },
               { id: 'company', type: 'text', label: L('Company (optional)', 'Empresa (opcional)'), auto: 'organization' },
               { id: 'phone', type: 'tel', label: L('WhatsApp / phone (optional)', 'WhatsApp / teléfono (opcional)'), auto: 'tel' },
               { id: 'notes', type: 'textarea', label: L('Anything else? Links, references… (optional)', '¿Algo más? Enlaces, referencias… (opcional)') },
               { id: 'privacy', type: 'check', req: true, label: L('I agree that my details are used only to answer this request.', 'Acepto que mis datos se usen solo para responder a esta solicitud.') }] },
    { id: 'review', review: true, title: L('All good?', '¿Todo bien?'), help: L('Check your answers and send.', 'Revisa tus respuestas y envía.'), fields: [] }
  ];
  function is(t) { return function (s) { return s.type === t; }; }

  // ── state ──
  var state = {}, idx = 0, sent = false, busy = false;
  try { var saved = JSON.parse(sessionStorage.getItem(STORE) || 'null'); if (saved) { state = saved.state || {}; idx = saved.idx || 0; } } catch (e) {}
  function save() { try { sessionStorage.setItem(STORE, JSON.stringify({ state: state, idx: idx })); } catch (e) {} }
  function steps() { return STEPS.filter(function (s) { return !s.when || s.when(state); }); }
  function optsOf(f) { return typeof f.opts === 'function' ? f.opts(state) : (f.opts || []); }
  function fieldsOf(st) { return st.fields; }
  function valid(st) {
    return fieldsOf(st).every(function (f) {
      if (!f.req) return true;
      var v = state[f.id];
      if (f.type === 'multi') return Array.isArray(v) && v.length > 0;
      if (f.type === 'check') return v === true;
      if (f.type === 'email') return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
      if (f.type === 'single' || f.type === 'cards') return v != null && optsOf(f).some(function (x) { return x.v === v; });
      return typeof v === 'string' && v.trim().length > 0;
    });
  }
  function autoAdvance(st) { var fs = fieldsOf(st); return fs.length === 1 && (fs[0].type === 'single' || fs[0].type === 'cards'); }

  // ── helpers ──
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function kinetic(text, cls) {
    var h = el('h1', cls); h.setAttribute('aria-label', text);
    var n = 0;
    text.split(' ').forEach(function (word, wi, arr) {
      var w = el('span', 'pf-w'); w.setAttribute('aria-hidden', 'true');
      Array.from(word).forEach(function (ch) { var c = el('span', 'ch', ch); c.style.setProperty('--d', 60 + n * 22); n++; w.appendChild(c); });
      h.appendChild(w);
      if (wi < arr.length - 1) h.appendChild(document.createTextNode(' '));
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { h.classList.add('is-in'); }); });
    return h;
  }
  function t(k) {
    var T = {
      kicker: L('Start a project', 'Empieza un proyecto'), back: L('Back', 'Atrás'), next: L('Continue', 'Continuar'), skip: L('Skip', 'Saltar'),
      send: L('Send', 'Enviar'), sending: L('Sending…', 'Enviando…'), edit: L('Edit', 'Editar'), hint: L('Press Enter ↵', 'Pulsa Enter ↵'),
      thanks: L('Thank you.', 'Gracias.'), thanksText: L("I've got your brief. I'll get back to you within 24–48 h with questions or a quote.", 'He recibido tu brief. Te respondo en 24–48 h con preguntas o un presupuesto.'),
      sooner: L('Want to talk sooner?', '¿Quieres hablar antes?'), book: L('Book a call', 'Reserva una llamada'), whatsapp: L('WhatsApp', 'WhatsApp'),
      again: L('Start another project', 'Empezar otro proyecto'),
      fail: L("The form couldn't be sent. Please email it instead — your answers are already written:", 'No se ha podido enviar. Envíalo por email; tus respuestas ya están escritas:'),
      mailIt: L('Send by email', 'Enviar por email'), none: L('—', '—')
    };
    return tr(T[k]);
  }

  // ── render ──
  function render(dir) {
    var list = steps();
    if (idx >= list.length) idx = list.length - 1;
    if (idx < 0) idx = 0;
    var st = list[idx];
    root.innerHTML = '';
    if (sent) return renderThanks();

    var top = el('div', 'pf-top');
    top.appendChild(el('span', 'pf-kicker', t('kicker')));
    top.appendChild(el('span', 'pf-count', pad(idx + 1) + ' / ' + pad(list.length)));
    root.appendChild(top);
    var bar = el('div', 'pf-bar'); var fill = el('span'); fill.style.width = ((idx + 1) / list.length * 100) + '%'; bar.appendChild(fill); root.appendChild(bar);

    var body = el('div', 'pf-step' + (dir === -1 ? ' from-left' : ''));
    body.appendChild(kinetic(tr(st.title), 'pf-title'));
    if (st.help) body.appendChild(el('p', 'pf-help', tr(st.help)));

    if (st.review) body.appendChild(renderReview(list));
    fieldsOf(st).forEach(function (f) { body.appendChild(renderField(st, f)); });
    root.appendChild(body);

    var nav = el('div', 'pf-nav');
    var back = el('button', 'pf-back', '← ' + t('back')); back.type = 'button';
    back.disabled = idx === 0; back.addEventListener('click', function () { go(-1); });
    nav.appendChild(back);
    var right = el('div', 'pf-right');
    if (!st.review && !autoAdvance(st)) right.appendChild(el('span', 'pf-hint', t('hint')));
    var next = el('button', 'pf-next'); next.type = 'button';
    var optionalOnly = fieldsOf(st).length && fieldsOf(st).every(function (f) { return !f.req; }) && fieldsOf(st).every(function (f) { var v = state[f.id]; return v == null || v === '' || (Array.isArray(v) && !v.length); });
    next.textContent = st.review ? t('send') + ' →' : (optionalOnly ? t('skip') + ' →' : t('next') + ' →');
    next.disabled = !valid(st) || busy;
    next.addEventListener('click', function () { if (st.review) submit(); else go(1); });
    right.appendChild(next);
    nav.appendChild(right);
    root.appendChild(nav);
    save();

    var first = body.querySelector('input:not([type=checkbox]), textarea');
    if (first && !('ontouchstart' in window)) setTimeout(function () { try { first.focus({ preventScroll: true }); } catch (e) {} }, 350);
  }
  function refresh() {
    var st = steps()[idx], next = root.querySelector('.pf-next');
    if (!next || !st) return;
    next.disabled = !valid(st) || busy;
    var optionalOnly = !st.review && fieldsOf(st).length && fieldsOf(st).every(function (f) { return !f.req; }) && fieldsOf(st).every(function (f) { var v = state[f.id]; return v == null || v === '' || (Array.isArray(v) && !v.length); });
    if (!st.review) next.textContent = (optionalOnly ? t('skip') : t('next')) + ' →';
    save();
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function go(d) {
    var list = steps();
    if (d > 0 && !valid(list[idx])) return;
    idx = Math.max(0, Math.min(list.length - 1, idx + d));
    render(d);
    root.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function renderField(st, f) {
    var wrap = el('div', 'pf-field pf-f-' + f.type);
    if (f.label) wrap.appendChild(el('span', 'pf-label', tr(f.label)));
    if (f.type === 'cards' || f.type === 'single' || f.type === 'multi') {
      var group = el('div', f.type === 'cards' ? 'pf-cards' : 'pf-chips');
      group.setAttribute('role', f.type === 'multi' ? 'group' : 'radiogroup');
      optsOf(f).forEach(function (op, i) {
        var b = el('button', f.type === 'cards' ? 'pf-card' : 'pf-chip'); b.type = 'button';
        var on = f.type === 'multi' ? (state[f.id] || []).indexOf(op.v) > -1 : state[f.id] === op.v;
        b.classList.toggle('is-on', on);
        b.setAttribute(f.type === 'multi' ? 'aria-pressed' : 'aria-checked', on);
        if (f.type !== 'multi') b.setAttribute('role', 'radio');
        if (f.type === 'cards') {
          b.appendChild(el('span', 'pf-card-idx', pad(i + 1)));
          b.appendChild(el('span', 'pf-card-title', tr(op.l)));
          if (op.d) b.appendChild(el('span', 'pf-card-desc', tr(op.d)));
        } else { b.textContent = tr(op.l); }
        b.addEventListener('click', function () {
          if (f.type === 'multi') {
            var arr = (state[f.id] || []).slice(), k = arr.indexOf(op.v);
            if (k > -1) arr.splice(k, 1); else arr.push(op.v);
            state[f.id] = arr;
            b.classList.toggle('is-on', k === -1); b.setAttribute('aria-pressed', k === -1);
            refresh();
          } else {
            state[f.id] = op.v;
            group.querySelectorAll('button').forEach(function (x) { x.classList.toggle('is-on', x === b); x.setAttribute('aria-checked', x === b); });
            refresh();
            if (autoAdvance(st)) setTimeout(function () { go(1); }, 260);
          }
        });
        group.appendChild(b);
      });
      wrap.appendChild(group);
    } else if (f.type === 'counter') {
      if (state[f.id] == null) state[f.id] = f.def || f.min;
      var c = el('div', 'pf-counter');
      var minus = el('button', 'pf-cbtn', '−'), val = el('span', 'pf-cval', String(state[f.id])), plus = el('button', 'pf-cbtn', '+');
      minus.type = plus.type = 'button'; minus.setAttribute('aria-label', '−'); plus.setAttribute('aria-label', '+');
      function upd(d) { state[f.id] = Math.max(f.min, Math.min(f.max, state[f.id] + d)); val.textContent = state[f.id] + (state[f.id] >= f.max ? '+' : ''); minus.disabled = state[f.id] <= f.min; plus.disabled = state[f.id] >= f.max; refresh(); }
      minus.addEventListener('click', function () { upd(-1); }); plus.addEventListener('click', function () { upd(1); });
      c.appendChild(minus); c.appendChild(val); c.appendChild(plus); wrap.appendChild(c);
      minus.disabled = state[f.id] <= f.min; plus.disabled = state[f.id] >= f.max;
    } else if (f.type === 'check') {
      var lab = el('label', 'pf-check'); var cb = el('input'); cb.type = 'checkbox'; cb.checked = state[f.id] === true;
      cb.addEventListener('change', function () { state[f.id] = cb.checked; refresh(); });
      lab.appendChild(cb); lab.appendChild(el('span', null, tr(f.label))); wrap.innerHTML = ''; wrap.appendChild(lab);
    } else {
      var inp = el(f.type === 'textarea' ? 'textarea' : 'input', 'pf-input');
      if (f.type !== 'textarea') inp.type = f.type === 'text' ? 'text' : f.type;
      if (f.type === 'textarea') inp.rows = st.id === 'o-desc' ? 4 : 2;
      if (f.ph) inp.placeholder = tr(f.ph);
      if (f.auto) inp.autocomplete = f.auto;
      if (f.type === 'date') inp.min = new Date().toISOString().slice(0, 10);
      inp.value = state[f.id] || '';
      if (f.label) inp.setAttribute('aria-label', tr(f.label));
      inp.addEventListener('input', function () { state[f.id] = inp.value; refresh(); });
      wrap.appendChild(inp);
    }
    return wrap;
  }

  // ── review ──
  function answers() {
    var out = [];
    steps().forEach(function (st) {
      if (st.review) return;
      st.fields.forEach(function (f) {
        if (f.id === 'privacy') return;
        var v = state[f.id];
        if (v == null || v === '' || (Array.isArray(v) && !v.length)) return;
        var shown;
        if (f.type === 'single' || f.type === 'cards') { var op = optsOf(f).filter(function (x) { return x.v === v; })[0]; shown = op ? op.l : null; }
        else if (f.type === 'multi') shown = { en: v.map(function (x) { var op = optsOf(f).filter(function (y) { return y.v === x; })[0]; return op ? op.l.en : x; }).join(', '), es: v.map(function (x) { var op = optsOf(f).filter(function (y) { return y.v === x; })[0]; return op ? op.l.es : x; }).join(', ') };
        else shown = { en: String(v), es: String(v) };
        if (!shown) return;
        out.push({ step: st, label: f.label || st.title, value: shown });
      });
    });
    return out;
  }
  function renderReview(list) {
    var box = el('dl', 'pf-review');
    answers().forEach(function (a) {
      var row = el('div', 'pf-row');
      row.appendChild(el('dt', null, tr(a.label).replace(/\s*\((optional|opcional)\)\s*$/i, '').replace(/\?$/, '')));
      var dd = el('dd', null, tr(a.value));
      var e = el('button', 'pf-edit', t('edit')); e.type = 'button';
      e.addEventListener('click', function () { idx = list.indexOf(a.step); render(-1); });
      dd.appendChild(e); row.appendChild(dd); box.appendChild(row);
    });
    return box;
  }

  // ── submit ──
  function summary() {
    var typeOp = STEPS[0].fields[0].opts.filter(function (x) { return x.v === state.type; })[0];
    var lines = ['NUEVO PROYECTO — ' + (typeOp ? typeOp.l.es.toUpperCase() : ''), 'Idioma del cliente: ' + lang().toUpperCase(), ''];
    answers().forEach(function (a) { lines.push(a.label.es.replace(/\s*\(opcional\)\s*$/i, '') + ': ' + a.value.es); });
    return lines.join('\n');
  }
  function loadEmailJS(cb, err) {
    if (window.emailjs) return cb();
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload = function () { try { window.emailjs.init({ publicKey: EMAILJS.publicKey }); cb(); } catch (e) { err(e); } };
    s.onerror = err; document.head.appendChild(s);
  }
  function submit() {
    if (busy) return;
    var list = steps();
    for (var i = 0; i < list.length - 1; i++) if (!valid(list[i])) { idx = i; return render(-1); }
    busy = true;
    var btn = root.querySelector('.pf-next'); if (btn) { btn.disabled = true; btn.textContent = t('sending'); }
    var typeOp = STEPS[0].fields[0].opts.filter(function (x) { return x.v === state.type; })[0];
    var kindTxt = '';
    ['kind', 'service'].forEach(function (k) { STEPS.forEach(function (st) { if (!st.when || st.when(state)) st.fields.forEach(function (f) { if (f.id === k && state[k]) { var op = optsOf(f).filter(function (x) { return x.v === state[k]; })[0]; if (op) kindTxt = op.l.es; } }); }); });
    var params = {
      first_name: (state.name || '').trim(), last_name: '', email: (state.email || '').trim(), reply_to: (state.email || '').trim(),
      subject: 'Nuevo proyecto web — ' + (typeOp ? typeOp.l.es : '') + (kindTxt ? ' · ' + kindTxt : ''),
      message: summary()
    };
    function done() { busy = false; sent = true; try { sessionStorage.removeItem(STORE); } catch (e) {} render(1); }
    function fail() { busy = false; render(0); showFail(params); }
    function viaEmailJS() {
      loadEmailJS(function () {
        window.emailjs.send(EMAILJS.service, EMAILJS.template, params).then(done, fail);
      }, fail);
    }
    // 1st: own Cloudflare endpoint (straight to Gmail) · 2nd: EmailJS · 3rd: mailto fallback
    fetch('/api/brief', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: params.first_name, email: params.email, subject: params.subject, message: params.message, lang: lang(), website: '' })
    }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.ok) done(); else viaEmailJS(); }, viaEmailJS);
  }
  function showFail(p) {
    var box = el('div', 'pf-fail');
    box.appendChild(el('p', null, t('fail')));
    var a = el('a', 'pf-next pf-link', t('mailIt') + ' →');
    a.href = 'mailto:contact@pablovaliente.me?subject=' + encodeURIComponent(p.subject) + '&body=' + encodeURIComponent(p.message + '\n\n' + p.first_name + ' — ' + p.email);
    box.appendChild(a);
    root.appendChild(box);
  }
  function renderThanks() {
    var body = el('div', 'pf-step pf-done');
    body.appendChild(kinetic(t('thanks'), 'pf-title'));
    body.appendChild(el('p', 'pf-help', t('thanksText')));
    var row = el('div', 'pf-after');
    row.appendChild(el('span', 'pf-label', t('sooner')));
    var b = el('a', 'pf-chip is-on', t('book')); b.href = 'https://calendly.com/pablovaliente/discovery-call'; b.target = '_blank'; b.rel = 'noopener noreferrer'; b.setAttribute('data-book', '');
    var w = el('a', 'pf-chip', t('whatsapp')); w.href = 'https://wa.me/491633461889'; w.target = '_blank'; w.rel = 'noopener noreferrer';
    row.appendChild(b); row.appendChild(w); body.appendChild(row);
    var again = el('button', 'pf-back', t('again') + ' →'); again.type = 'button';
    again.addEventListener('click', function () { state = {}; idx = 0; sent = false; render(1); });
    body.appendChild(again);
    root.appendChild(body);
  }

  // ── keyboard: Enter continues, 1–9 picks an option on single-choice steps ──
  document.addEventListener('keydown', function (e) {
    if (document.body.classList.contains('kmenu-open') || sent) return;
    var tag = (e.target.tagName || '').toLowerCase();
    var st = steps()[idx];
    if (e.key === 'Enter' && tag !== 'textarea' && tag !== 'button' && tag !== 'a') {
      if (st.review) { e.preventDefault(); submit(); } else if (valid(st)) { e.preventDefault(); go(1); }
      return;
    }
    if (tag === 'input' || tag === 'textarea') return;
    if (/^[1-9]$/.test(e.key) && autoAdvance(st)) {
      var btns = root.querySelectorAll('.pf-cards button, .pf-chips button'); var b = btns[+e.key - 1];
      if (b) { e.preventDefault(); b.click(); }
    }
  });

  // ── language switch (same as the DCTL page: localStorage 'pv-lang') ──
  var langBtns = document.querySelectorAll('[data-set-lang]');
  function markLang() { langBtns.forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-set-lang') === lang()); }); }
  langBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      document.documentElement.lang = b.getAttribute('data-set-lang');
      try { localStorage.setItem('pv-lang', document.documentElement.lang); } catch (e) {}
      markLang(); render(0);
    });
  });
  markLang();
  render(1);
})();
