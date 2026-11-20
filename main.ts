// Neon Vice, a gta6-cover-art-01 entry (Node 22, standard library only).
// The app is this directory's app/ folder: plain static files a desktop
// browser loads offline (app/index.html and its ES modules, no library and
// no network request). This program hands it in: it copies app/ and
// screenshots/ from beside this file to /output and writes /output/dossier.json,
// the summary the judge reads, with the vendored make.fun library.
//
// The app is a six-panel GTA-style cover maker in the classic poster layout:
// a hero couple, four vignettes and a skyline panorama under a filmic Vice
// grade, with bold caption lettering and PNG export in 1080x1080, 1080x1350
// and 1920x1080. Its six sample photos (app/samples/) were made for make.fun
// with an image model and are free to use.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

/**
 * The gate's own caps (reference/gate.json): only text_max_bytes shapes the
 * bytes; the others refuse an entry the scorer would refuse — more than 4
 * screenshots or one over 256 KiB, more than 993 files in app/ or 48 MiB of
 * app files in all, or a path under app/ over 1000 bytes.
 */
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

function handIn() {
  const root = fileURLToPath(new URL('.', import.meta.url));
  const dest = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  mkdirSync(dest, { recursive: true });
  cpSync(join(root, 'app'), join(dest, 'app'), { recursive: true });
  const shotsDir = join(dest, 'screenshots');
  mkdirSync(shotsDir, { recursive: true });
  if (existsSync(join(root, 'screenshots'))) cpSync(join(root, 'screenshots'), shotsDir, { recursive: true });
  writeFileSync(join(dest, 'dossier.json'), buildDossier(dest, CAPS));
}

handIn();
