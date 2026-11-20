// Fixed scenes for screenshots: ?shot=cover shows the cover alone at its
// export size; ?shot=editor shows the editor with the samples loaded.
// Query knobs: layout, grade, size, title, subtitle, photos (six sample
// names, comma-separated, one per slot), panx, pany (six numbers each).
// window.__shotReady is set once the scene has painted.

import { SAMPLE_ORDER } from './cover.js';

/** Splits a comma query value into numbers, padding with `fallback`. */
function numberList(raw, count, fallback) {
  // Note: Number('') is 0, so a missing value must stay NaN — otherwise a
  // query without `zoom` would shrink the first slot to nothing.
  const parts = (raw ?? '').split(',').map((v) => (v.trim() === '' ? NaN : Number(v)));
  return Array.from({ length: count }, (_, i) =>
    Number.isFinite(parts[i]) ? parts[i] : fallback);
}

/** Loads the named samples and builds a six-slot scene from the query. */
export async function runShot(shot, query, api) {
  const layout = query.get('layout') ?? 'classic';
  const grade = query.get('grade') ?? 'vice';
  const size = query.get('size') ?? 'portrait';
  const title = query.get('title') ?? 'Vice City';
  const subtitle = query.get('subtitle') ?? 'Every sunset has a price.';
  const names = (query.get('photos') ?? '').split(',').filter(Boolean);
  const picked = Array.from({ length: 6 }, (_, i) => names[i] ?? SAMPLE_ORDER[i]);
  const images = await Promise.all(
    picked.map((name) => api.loadImage(`samples/${name}.jpg`)),
  );
  const panX = numberList(query.get('panx'), 6, 0);
  const panY = numberList(query.get('pany'), 6, 0);
  const zoom = numberList(query.get('zoom'), 6, 1);
  const slots = images.map((photo, i) => ({
    photo, zoom: zoom[i], panX: panX[i], panY: panY[i],
  }));
  if (shot === 'cover') document.body.classList.add('shot-cover');
  api.apply({ layout, grade, size, title, subtitle, slots });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
