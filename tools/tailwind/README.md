# Tailwind build

`/css/tailwind.css` is generated (Tailwind 3.4.17) for the photography pages
(`architecture/*`, `hospitality/`) and `works.html`. Rebuild after changing classes in those pages:

```
npx tailwindcss@3.4.17 -c tools/tailwind/tailwind.config.js -i tools/tailwind/input.css -o pablovaliente.me/css/tailwind.css --minify
```

(run from the repository root). If you use a new Tailwind class in JS only, add it to `safelist`.
