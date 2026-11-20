[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/soulbone78/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/soulbone78/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Neon Vice — Classic Cover Maker

A GTA-style cover art maker for the make.fun gta6-cover-art-01 bounty: turn
your own photos into a six-panel poster in the classic Vice City style — a
hero couple, four vignettes and a skyline panorama under a filmic neon grade,
with bold caption lettering and PNG export.

## Features

- **Four layouts**: Classic 6-panel (the GTA poster grid), Hero + strip,
  Grid 3 × 2 and Split — each with six photo panels.
- **Four colour grades**: Vice (warm filmic magenta), Sunset, Neon and Dusk.
- **Any photo**: load your own pictures into any panel, crop and position
  each with zoom and pan (sliders, drag, scroll), fill every panel with one
  photo, or fill all six with the built-in samples.
- **Editable caption**: title and subtitle, drawn as bold gradient lettering
  with a dark edge over the panorama (Classic) or a shaded band (other
  layouts).
- **Export PNG** in the common post sizes: 1080 × 1080, 1080 × 1350 and
  1920 × 1080.

## Try it

Run `node serve.ts` from the repository root, then open
http://localhost:8080 in desktop Chrome. The app is plain static files
under `app/` — no build step, no library, no network request. Photos are
read on your own machine and never uploaded anywhere.

## Hand it in

Run `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts` to copy `app/`
and `screenshots/` to the output directory and write `dossier.json` with
the vendored make.fun library.

## Layout of the repo

- `app/index.html` — the editor page.
- `app/style.css` — the editor's look.
- `app/src/cover.js` — the cover renderer (layouts, grades, caption).
- `app/src/main.js` — the editor wiring (panels, chips, export).
- `app/src/shots.js` — fixed scenes for screenshots (`?shot=cover|editor`).
- `app/samples/` — six sample photos, made with an image model for make.fun.
- `shots.json` — the four screenshot scenes.
- `screenshots/` — the screenshots the entry hands in (first by name is the cover).

## Licence

This entry is MIT-licensed; the full text is in `LICENSE`. No Rockstar
Games logo, artwork, character or font is used anywhere in this entry.
