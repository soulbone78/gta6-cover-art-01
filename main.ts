// Hands the Neon Vice entry in (Node 22, standard library only). The app
// itself is the static files under app/ — app/index.html plus its ES
// modules, no build step and no network request — and this program copies
// app/ and screenshots/ from beside this file into the output directory,
// then writes /output/dossier.json, the summary the judge reads, with the
// vendored make.fun library. The app it hands in builds a six-panel
// GTA-style poster: a tall hero photo, four vignettes and a skyline band,
// three sunset/neon colour grades, an editable headline and tagline, and
// PNG export in 1080x1080, 1080x1350 and 1920x1080. Its six sample photos
// (app/samples/) were made for make.fun with an image model and are free
// to use.
//
// Try it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
const localShots = join(repoRoot, 'screenshots');
if (existsSync(localShots)) cpSync(localShots, join(outputDir, 'screenshots'), { recursive: true });

// The dossier for the Neon Vice entry: buildDossier reads app/ and
// screenshots/ from the output directory and writes the summary the judge
// reads. The limits mirror the gate's own (reference/gate.json): only
// text_max_bytes shapes the bytes; the rest refuse an entry the scorer
// would refuse — more than 4 screenshots or one over 256 KiB; more than
// 993 files in app/ or 48 MiB of app files in all; or a path under app/
// over 1000 bytes. app/ counts beside /output's own 1000-entry cap, which
// it shares with screenshots/ and dossier.json.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
