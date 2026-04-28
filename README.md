# broughton.com.au

Personal site for Andrew Broughton — Designer.

Static HTML/CSS/JS. No build step. Animations via [GSAP](https://gsap.com/) (loaded from CDN). Type-set in GT Standard Compressed (self-hosted).

## Local development

Just open `index.html` in a browser, or serve the folder with any static server:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deployment

Hosted on [Vercel](https://vercel.com/). Pushes to `main` deploy to production; pushes to other branches get preview URLs automatically.

## Structure

- `index.html` — entry point, loads partials via `script.js`
- `*.html` (hero, about-experience, work, speaking, thoughts, portfolio, ticker, scribble, footer-callout, modal, footer) — section partials
- `styles.css` — all styles
- `script.js` — section loader + animations
- `GT-Standard/` — self-hosted webfonts
- `*.svg`, `*.jpg`, `*.png`, `*.avif` — assets
