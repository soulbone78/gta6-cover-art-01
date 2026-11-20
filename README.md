[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/soulbone78/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/soulbone78/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Neon Vice — Classic Cover Maker

Build a Vice City poster from your own photos: six panels in the classic GTA grid — a tall hero shot, four vignettes and a skyline band — with bold outlined lettering and a warm sunset grade. Everything is drawn by this app, with no game art, no logos and no outside files.

## What it does

- **Your photos, six slots:** load a photo from your machine into any of the six slots — one photo per slot, or the same photo everywhere. Click a slot in the preview to pick it, then zoom and pan with the sliders, by dragging, or with the scroll wheel.
- **Three poster grids:** Classic 6-panel (hero + vignettes + skyline band), Grid 3×2, or Hero + strip — switch any time and the photos follow.
- **Bold caption lettering:** an editable headline and tagline, drawn as big outlined gradient capitals with an accent rule, over a shaded band.
- **Sunset colour grades:** Vice, Neon and Dusk — each with its own panel wash, caption colours and gutter, all drawn on canvas.
- **Fast and easy:** pick photos, type a caption, export a PNG in 1080×1080, 1080×1350 or 1920×1080.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. The app is plain static files under `app/` — no build step, no network requests, your photos never leave your machine.

## Files

- `app/index.html` — the editor page
- `app/style.css` — the editor's look
- `app/src/main.js` — wiring: pickers, caption fields, slot selection, drag-to-pan, export
- `app/src/cover.js` — the cover painter: grids, grades, caption lettering
- `app/src/shots.js` — fixed scenes used to take the screenshots
- `app/samples/` — six sample photos, made with an image model for make.fun and free to use
- `main.ts` — hands the app in: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — screenshots taken with headless Chromium

## License

MIT — see `LICENSE`.
