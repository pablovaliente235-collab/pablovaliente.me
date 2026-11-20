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
  // Classes toggled from JS at runtime
  safelist: ['hidden', 'flex', 'block'],
  theme: { extend: { colors: { primary: '#A8895A' } } },
};
