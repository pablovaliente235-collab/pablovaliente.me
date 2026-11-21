const path = require('path');
const site = path.join(__dirname, '..', '..', 'pablovaliente.me');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(site, 'architecture/index.html'),
    path.join(site, 'architecture/japanese/index.html'),
    path.join(site, 'architecture/iglesia-yaguaron/index.html'),
    path.join(site, 'hospitality/index.html'),
    path.join(site, 'works.html'),
  ],
  // If a class is only toggled from JS at runtime, add it here: safelist: ['hidden', ...]
  theme: { extend: {} },
};
