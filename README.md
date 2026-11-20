# Neon Vice — Classic Cover Maker

[![make.fun bounty](https://img.shields.io/badge/make.fun-bounty-ff2e88)](https://make.fun/bounty/gta6-cover-art-01)

Turn your photos into a classic multi-panel Vice City cover, in the style of a GTA poster — drawn entirely by this app, with no game art, no logos and no outside files.

## What it does

- **The Classic grid:** a tall hero panel of the people, four small vignette panels of the action and the city, and a wide skyline panorama along the bottom under the title — the six-panel grid a GTA cover is recognised by. Hero + strip, Grid 2×2 and Split layouts are there too.
- **Any photo:** load your own photos from your machine into six panels — one photo per panel, or the same photo in every panel. Click a panel in the preview to select it, then zoom and pan it with the sliders, by dragging, or with the scroll wheel.
- **Six sample scenes:** a stylish duo on Ocean Drive at sunset, a neon-lit sports car at night, a speedboat jumping the waves, a helicopter over the downtown skyline, a boulevard convertible and a pier fisherman — all made for this entry with an image model and free to use, so every panel shows something different.
- **Bold caption lettering:** an editable title and subtitle, drawn as big outlined gradient capitals with a soft shadow over a shaded band, with a thin accent rule between them.
- **Cinematic colour grades:** Sunset, Neon, Dusk and Vice — each a gentle film-like lift rather than a flat wash, so the photos keep their detail.
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
- `app/src/cover.js` — the cover renderer: layouts, grades, caption
- `app/src/shots.js` — fixed scenes used to take the screenshots
- `app/samples/` — six sample photos, made with an image model for this entry and free to use
- `main.ts` — hands the app in: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — screenshots taken with headless Chromium

## License

MIT — see `LICENSE`.
