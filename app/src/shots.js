// Screenshot scenes: with ?shot=cover the page shows just the cover at its
// export size; with ?shot=editor it shows the editor with samples in place.
// The query carries layout, grade, size, title, subtitle, photos (a comma
// list of sample names, one per panel) and panx / pany (comma lists, one
// value per panel). The page raises window.__shotReady once it has painted.

/** The default six samples, in classic-grid order. */
const DEFAULT_PHOTOS = ['duo', 'neon', 'boat', 'boulevard', 'pier', 'heli'];

/** Splits a comma param into numbers, missing entries becoming 0. */
function numberList(value) {
  return (value ?? '').split(',').map((v) => Number(v) || 0);
}

/** Loads the scene's sample photos and hands the finished scene to the editor. */
export async function setupScene(shot, query, api) {
  const layout = query.get('layout') ?? 'classic';
  const grade = query.get('grade') ?? 'vice';
  const size = query.get('size') ?? 'portrait';
  const title = query.get('title') ?? 'Vice City';
  const subtitle = query.get('subtitle') ?? 'Every sunset has a price.';
  const names = query.get('photos') ? query.get('photos').split(',') : DEFAULT_PHOTOS;
  const panX = numberList(query.get('panx'));
  const panY = numberList(query.get('pany'));
  const pics = await Promise.all(names.map((name) => api.loadPic(`samples/${name}.jpg`)));
  const panels = pics.map((img, i) => ({ img, zoom: 1, panX: panX[i] ?? 0, panY: panY[i] ?? 0 }));
  if (shot === 'cover') document.body.classList.add('shot-cover');
  api.apply({ layout, grade, size, title, subtitle, panels });
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
