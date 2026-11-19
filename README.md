# Neon Palms — Sunset Cover Maker

[![make.fun bounty](https://img.shields.io/badge/make.fun-bounty-ff2e88)](https://make.fun/bounty/gta6-cover-art-01)

Turn your photos into a multi-panel sunset cover, in the style of a Vice City poster — drawn entirely by this app, with no game art, no logos and no outside files.

## What it does

- **Any photo:** load your own photos from your machine into four panels — one photo per panel, or the same photo in every panel. Click a panel in the preview to select it, then zoom and pan it with the sliders, by dragging, or with the scroll wheel.
- **Multi-panel layouts:** Hero + strip, Grid 2×2, or Split — pick the one that fits your shots.
- **Bold caption lettering:** an editable title and subtitle, drawn as big outlined gradient capitals over a shaded band.
- **Sunset colour grades:** Sunset, Neon and Dusk — each with its own overlay tint, retro striped sun, palm silhouettes and caption colours, all drawn on canvas.
- **Fast and easy:** pick photos, type a caption, export a PNG in 1080×1080, 1080×1350 or 1920×1080.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. The app is plain static files under `app/` — no build step, no network requests, your photos never leave your machine.

## Files

- `app/index.html` — the editor page
- `app/style.css` — the editor's look
- `app/src/main.js` — wiring: controls, panel selection, drag-to-pan, export
- `app/src/cover.js` — the cover renderer: layouts, grades, sun, palms, caption
- `app/src/shots.js` — fixed scenes used to take the screenshots
- `app/samples/` — two sample photos, made with an image model for make.fun and free to use
- `main.ts` — hands the app in: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — screenshots taken with headless Chromium

## License

MIT — see `LICENSE`.
