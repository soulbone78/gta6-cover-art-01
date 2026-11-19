// Fixed scenes for screenshots: ?shot=cover shows the cover alone at its
// export size; ?shot=editor shows the editor with sample photos loaded.
// Query params: layout, grade, size, title, subtitle, photo (sample name).
// window.__shotReady is set once painted.

/** Loads the two sample photos and builds a four-panel state from a scene. */
export async function runShot(shot, query, api) {
  const layout = query.get('layout') ?? 'hero';
  const grade = query.get('grade') ?? 'sunset';
  const size = query.get('size') ?? 'wide';
  const title = query.get('title') ?? 'Vice Nights';
  const subtitle = query.get('subtitle') ?? 'One city. One last score.';
  const photoA = await api.loadImage(`samples/${query.get('photo') ?? 'pier'}.jpg`);
  const photoB = await api.loadImage(`samples/${query.get('photo2') ?? 'boulevard'}.jpg`);
  // Optional per-panel vertical pan (comma list, one value per panel, empty = 0),
  // e.g. pany=0.9,0.44,0,0.44. Positive panY shifts the photo down so a face
  // near the top of the source photo stays inside a short/wide panel.
  const panY = (query.get('pany') ?? '').split(',').map((v) => Number(v) || 0);
  const panels = [photoA, photoB, photoA, photoB].map((img, i) => ({ img, zoom: 1, panX: 0, panY: panY[i] ?? 0 }));
  if (shot === 'cover') document.body.classList.add('shot-cover');
  api.apply({ layout, grade, size, title, subtitle, panels });
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
