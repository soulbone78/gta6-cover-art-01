// Draws the classic multi-panel Vice City cover: the person's photos in
// panels, a cinematic colour grade, and bold caption lettering, all drawn on
// canvas. No game art, no outside images: the photos are the user's own (or
// the app's built-in samples), and every decoration is drawn in code.
//
// The signature layout is Classic: a tall hero panel of the people, four
// small vignette panels of the action and the city, and a wide panorama along
// the bottom under the title — the grid a GTA cover is recognised by.

/** Export sizes in pixels, keyed by the size button's data-size value. */
export const SIZES = {
  square: { w: 1080, h: 1080 },
  portrait: { w: 1080, h: 1350 },
  wide: { w: 1920, h: 1080 },
};

/** The most panels any layout uses; the editor keeps this many panel slots. */
export const MAX_PANELS = 6;

/**
 * Panel rectangles as fractions of the cover, per layout. Classic is the
 * six-panel GTA grid; the other three layouts use the first four panels.
 */
export const LAYOUTS = {
  classic: [
    { x: 0, y: 0, w: 0.42, h: 0.64 }, // tall hero: the people
    { x: 0.42, y: 0, w: 0.29, h: 0.32 }, // vignette: the car
    { x: 0.71, y: 0, w: 0.29, h: 0.32 }, // vignette: the boat
    { x: 0.42, y: 0.32, w: 0.29, h: 0.32 }, // vignette: the boulevard
    { x: 0.71, y: 0.32, w: 0.29, h: 0.32 }, // vignette: the pier
    { x: 0, y: 0.64, w: 1, h: 0.36 }, // wide panorama: the skyline
  ],
  hero: [
    { x: 0, y: 0, w: 1, h: 0.6 },
    { x: 0, y: 0.6, w: 1 / 3, h: 0.4 },
    { x: 1 / 3, y: 0.6, w: 1 / 3, h: 0.4 },
    { x: 2 / 3, y: 0.6, w: 1 / 3, h: 0.4 },
  ],
  grid: [
    { x: 0, y: 0, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0, w: 0.5, h: 0.5 },
    { x: 0, y: 0.5, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
  ],
  split: [
    { x: 0, y: 0, w: 0.55, h: 1 },
    { x: 0.55, y: 0, w: 0.45, h: 0.5 },
    { x: 0.55, y: 0.5, w: 0.45, h: 0.25 },
    { x: 0.55, y: 0.75, w: 0.45, h: 0.25 },
  ],
};

/** How many panels a layout draws (Classic draws six, the rest four). */
export function layoutPanelCount(layout) {
  return (LAYOUTS[layout] ?? LAYOUTS.classic).length;
}

/**
 * Colour grades: the overlay gradient each panel gets, the caption gradient,
 * the gutter colour and the empty-panel gradient. The overlays are kept
 * light on purpose — a heavy wash flattens the photos, while a gentle warm
 * (or cool) lift at the bottom of each panel reads as a film grade.
 */
export const GRADES = {
  sunset: {
    overlay: ['rgba(255, 110, 60, 0)', 'rgba(255, 60, 120, 0.34)'],
    caption: ['#fff6d8', '#ffb347'],
    accent: '#ff7a3d',
    gutter: '#1c0f2e',
    empty: ['#3b1d5e', '#120a24'],
  },
  neon: {
    overlay: ['rgba(0, 229, 255, 0)', 'rgba(255, 0, 153, 0.34)'],
    caption: ['#eafcff', '#4de8ff'],
    accent: '#00e5ff',
    gutter: '#0a0a24',
    empty: ['#12224d', '#050514'],
  },
  dusk: {
    overlay: ['rgba(150, 90, 255, 0)', 'rgba(60, 20, 140, 0.4)'],
    caption: ['#f3e8ff', '#c77dff'],
    accent: '#c77dff',
    gutter: '#12081f',
    empty: ['#2a1745', '#0b0616'],
  },
  vice: {
    overlay: ['rgba(0, 200, 180, 0)', 'rgba(255, 45, 120, 0.34)'],
    caption: ['#ffffff', '#ff5e8a'],
    accent: '#ff2d78',
    gutter: '#06121a',
    empty: ['#0d2b33', '#050f14'],
  },
};

/** Cover-fits `img` into rect (x, y, w, h) with zoom and pan offsets. */
export function drawPhotoInto(ctx, img, rect, zoom, panX, panY) {
  const scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * zoom;
  const pw = img.naturalWidth * scale;
  const ph = img.naturalHeight * scale;
  const cx = rect.x + rect.w / 2 + panX * rect.w;
  const cy = rect.y + rect.h / 2 + panY * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(img, cx - pw / 2, cy - ph / 2, pw, ph);
  ctx.restore();
}

/** Draws one panel: photo (or a graded empty panel), grade overlay, a soft
 *  inner vignette and a hairline highlight so the panels read as crisp
 *  separate frames. Nothing is drawn over the photo itself — no decals, no
 *  clip-art, so faces and subjects stay clean. */
export function drawPanel(ctx, rect, panel, grade, coverW) {
  const gutter = Math.max(2, coverW * 0.006);
  const r = { x: rect.x + gutter / 2, y: rect.y + gutter / 2, w: rect.w - gutter, h: rect.h - gutter };
  ctx.save();
  ctx.beginPath();
  ctx.rect(r.x, r.y, r.w, r.h);
  ctx.clip();
  if (panel.img) {
    drawPhotoInto(ctx, panel.img, r, panel.zoom, panel.panX, panel.panY);
  } else {
    const empty = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
    empty.addColorStop(0, grade.empty[0]);
    empty.addColorStop(1, grade.empty[1]);
    ctx.fillStyle = empty;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `700 ${Math.max(14, r.w * 0.055)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('+ ADD PHOTO', r.x + r.w / 2, r.y + r.h / 2);
  }
  // Grade: a gentle wash that deepens toward the bottom of the panel.
  const tint = ctx.createLinearGradient(0, r.y + r.h * 0.3, 0, r.y + r.h);
  tint.addColorStop(0, grade.overlay[0]);
  tint.addColorStop(1, grade.overlay[1]);
  ctx.fillStyle = tint;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  // Soft inner vignette: the edges fall off slightly, the subject stays bright.
  const vig = ctx.createRadialGradient(
    r.x + r.w / 2, r.y + r.h / 2, Math.min(r.w, r.h) * 0.42,
    r.x + r.w / 2, r.y + r.h / 2, Math.max(r.w, r.h) * 0.72,
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(8,2,18,0.28)');
  ctx.fillStyle = vig;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.restore();
  // Hairline highlight around the frame.
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = Math.max(1, coverW * 0.001);
  ctx.strokeRect(r.x, r.y, r.w, r.h);
  ctx.restore();
}

/** Fits the title on one line, shrinking until it fits 92% of the width. */
export function fitTitleFont(ctx, text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `900 ${size}px "Arial Black", "Helvetica Neue", system-ui, sans-serif`;
  while (ctx.measureText(text).width > maxWidth && size > 14) {
    size -= 2;
    ctx.font = `900 ${size}px "Arial Black", "Helvetica Neue", system-ui, sans-serif`;
  }
  return size;
}

/** Draws the bold caption: gradient title with a dark outline and soft
 *  shadow over a shaded band, a thin accent rule, and the letter-spaced
 *  subtitle beneath it. */
export function drawCaption(ctx, w, h, title, subtitle, grade) {
  const text = title.trim().toUpperCase();
  const bandH = h * 0.2;
  const bandY = h - bandH;
  const shade = ctx.createLinearGradient(0, bandY, 0, h);
  shade.addColorStop(0, 'rgba(12, 4, 26, 0)');
  shade.addColorStop(0.45, 'rgba(12, 4, 26, 0.55)');
  shade.addColorStop(1, 'rgba(12, 4, 26, 0.82)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, bandY, w, bandH);
  if (text) {
    const size = fitTitleFont(ctx, text, w * 0.92, h * 0.075);
    const grad = ctx.createLinearGradient(0, h - bandH * 0.82, 0, h - bandH * 0.12);
    grad.addColorStop(0, grade.caption[0]);
    grad.addColorStop(1, grade.caption[1]);
    ctx.save();
    ctx.translate(w / 2, h - bandH * 0.46);
    ctx.transform(1, 0, -0.06, 1, 0, 0);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = size * 0.12;
    ctx.shadowOffsetY = size * 0.04;
    ctx.lineWidth = size * 0.15;
    ctx.strokeStyle = 'rgba(20, 4, 30, 0.92)';
    ctx.strokeText(text, 0, 0);
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = grad;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }
  // Thin accent rule between the title and the subtitle.
  const ruleW = Math.min(w * 0.22, 260);
  const ruleY = h - bandH * 0.24;
  ctx.fillStyle = grade.accent;
  ctx.fillRect((w - ruleW) / 2, ruleY, ruleW, Math.max(2, h * 0.0025));
  const sub = subtitle.trim();
  if (sub) {
    const size = Math.max(14, h * 0.021);
    ctx.font = `600 ${size}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.fillText(sub.toUpperCase().split('').join('  '), w / 2, h - bandH * 0.09);
  }
}

/**
 * Draws the whole cover onto `canvas` at its own pixel size.
 * `state` is { layout, grade, title, subtitle, panels: [{img, zoom, panX, panY}] }.
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  const rects = LAYOUTS[state.layout] ?? LAYOUTS.classic;
  ctx.fillStyle = grade.gutter;
  ctx.fillRect(0, 0, w, h);
  rects.forEach((frac, i) => {
    const rect = { x: frac.x * w, y: frac.y * h, w: frac.w * w, h: frac.h * h };
    const panel = state.panels[i] ?? { img: null, zoom: 1, panX: 0, panY: 0 };
    drawPanel(ctx, rect, panel, grade, w);
  });
  // Soft vignette over the whole cover.
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(10,2,20,0.32)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  drawCaption(ctx, w, h, state.title, state.subtitle, grade);
}

/** Panel rectangles in canvas pixels, for hit-testing clicks and drags. */
export function panelRectsPx(canvas, layout) {
  const { width: w, height: h } = canvas;
  return (LAYOUTS[layout] ?? LAYOUTS.classic).map((f) => ({ x: f.x * w, y: f.y * h, w: f.w * w, h: f.h * h }));
}
