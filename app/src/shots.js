// Fixed scenes for screenshots: ?shot=cover shows the cover alone at its
// export size; ?shot=editor shows the editor with sample photos loaded.
// Query params: layout, grade, size, title, subtitle, photos (comma list of
// sample names, up to six, in panel order), panx / pany (comma lists, one
// value per panel, empty = 0). window.__shotReady is set once painted.

import { MAX_PANELS } from './cover.js';

/** The six built-in samples, in the order the Classic grid shows them:
 *  the duo in the hero panel, car / boat / boulevard / pier vignettes, and
 *  the helicopter skyline as the wide panorama along the bottom. */
export const SAMPLE_ORDER = ['duo', 'neon', 'boat', 'boulevard', 'pier', 'heli'];

/** Loads the sample photos named in the scene and builds the panel state. */
export async function runShot(shot, query, api) {
  const layout = query.get('layout') ?? 'classic';
  const grade = query.get('grade') ?? 'sunset';
  const size = query.get('size') ?? 'portrait';
  const title = query.get('title') ?? 'Vice City';
  const subtitle = query.get('subtitle') ?? 'Every sunset has a price.';
  const names = (query.get('photos') ?? SAMPLE_ORDER.join(',')).split(',').map((s) => s.trim()).filter(Boolean);
  const panX = (query.get('panx') ?? '').split(',').map((v) => Number(v) || 0);
  const panY = (query.get('pany') ?? '').split(',').map((v) => Number(v) || 0);
  const panels = [];
  for (let i = 0; i < MAX_PANELS; i++) {
    const name = names[i];
    panels.push({
      img: name ? await api.loadImage(`samples/${name}.jpg`) : null,
      zoom: 1,
      panX: panX[i] ?? 0,
      panY: panY[i] ?? 0,
    });
  }
  if (shot === 'cover') document.body.classList.add('shot-cover');
  api.apply({ layout, grade, size, title, subtitle, panels });
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
