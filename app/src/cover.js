// Draws the multi-panel sunset cover: photos in panels, a retro sun, palm
// silhouettes, a colour grade and bold caption lettering, all drawn on canvas
// with the app's own vector shapes (no game art, no outside images).

/** Export sizes in pixels, keyed by the size button's data-size value. */
export const SIZES = {
  square: { w: 1080, h: 1080 },
  portrait: { w: 1080, h: 1350 },
  wide: { w: 1920, h: 1080 },
};

/**
 * Panel rectangles as fractions of the cover, per layout. Every layout has
 * four panels; a photo may fill one panel or several.
 */
export const LAYOUTS = {
  hero: [
    { x: 0, y: 0, w: 1, h: 0.60 },
    { x: 0, y: 0.60, w: 1 / 3, h: 0.40 },
    { x: 1 / 3, y: 0.60, w: 1 / 3, h: 0.40 },
    { x: 2 / 3, y: 0.60, w: 1 / 3, h: 0.40 },
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

/**
 * Colour grades: the overlay gradient each panel gets, the sun's colours,
 * the caption gradient and the gutter colour.
 */
export const GRADES = {
  sunset: {
    overlay: ['rgba(255, 110, 60, 0)', 'rgba(255, 60, 120, 0.55)'],
    sun: ['#ffd76e', '#ff7a3d', '#ff2e88'],
    caption: ['#fff6d8', '#ffb347'],
    gutter: '#1c0f2e',
    empty: ['#3b1d5e', '#120a24'],
  },
  neon: {
    overlay: ['rgba(0, 229, 255, 0)', 'rgba(255, 0, 153, 0.55)'],
    sun: ['#8ef6ff', '#00c2ff', '#ff00a8'],
    caption: ['#eafcff', '#4de8ff'],
    gutter: '#0a0a24',
    empty: ['#12224d', '#050514'],
  },
  dusk: {
    overlay: ['rgba(150, 90, 255, 0)', 'rgba(60, 20, 140, 0.6)'],
    sun: ['#ffe9a8', '#c77dff', '#5a189a'],
    caption: ['#f3e8ff', '#c77dff'],
    gutter: '#12081f',
    empty: ['#2a1745', '#0b0616'],
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

/** A retro striped sun: a disc whose lower half is cut into fading bands. Drawn on an
 *  offscreen canvas so the cut-out bands only erase the sun, never the photo beneath it. */
export function drawSun(ctx, cx, cy, r, colors) {
  const off = document.createElement('canvas');
  off.width = Math.ceil(r * 4);
  off.height = Math.ceil(r * 4);
  const o = off.getContext('2d');
  const ox = r * 2;
  const oy = r * 2;
  const glow = o.createRadialGradient(ox, oy, r * 0.2, ox, oy, r * 1.9);
  glow.addColorStop(0, colors[1] + '55');
  glow.addColorStop(1, colors[1] + '00');
  o.fillStyle = glow;
  o.fillRect(0, 0, off.width, off.height);
  const disc = o.createLinearGradient(0, oy - r, 0, oy + r);
  disc.addColorStop(0, colors[0]);
  disc.addColorStop(0.55, colors[1]);
  disc.addColorStop(1, colors[2]);
  o.fillStyle = disc;
  o.beginPath();
  o.arc(ox, oy, r, 0, Math.PI * 2);
  o.fill();
  // Slice the lower half into bands with growing gaps.
  o.globalCompositeOperation = 'destination-out';
  let y = oy + r * 0.08;
  let gap = r * 0.03;
  while (y < oy + r) {
    o.fillRect(ox - r, y, r * 2, gap);
    y += r * 0.16;
    gap *= 1.5;
  }
  ctx.drawImage(off, cx - r * 2, cy - r * 2);
}

/** One palm silhouette: a curved trunk and seven drooping fronds. */
export function drawPalm(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(14, -46, 34, -78);
  ctx.stroke();
  ctx.translate(34, -78);
  for (let i = 0; i < 7; i++) {
    const a = (-0.15 - i * 0.42) * Math.PI;
    const len = 52 - Math.abs(i - 3) * 7;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(Math.cos(a) * len * 0.6, Math.sin(a) * len * 0.45 - 8, Math.cos(a) * len, Math.sin(a) * len + 16);
    ctx.stroke();
  }
  ctx.restore();
}

/** Draws one panel: photo (or a graded empty panel), grade overlay, sun and palms on panel 0. */
export function drawPanel(ctx, rect, panel, grade, index, coverW) {
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
  const tint = ctx.createLinearGradient(0, r.y + r.h * 0.25, 0, r.y + r.h);
  tint.addColorStop(0, grade.overlay[0]);
  tint.addColorStop(1, grade.overlay[1]);
  ctx.fillStyle = tint;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  if (index === 0) {
    const sunR = Math.min(r.w, r.h) * 0.17;
    drawSun(ctx, r.x + r.w * 0.78, r.y + r.h * 0.24, sunR, grade.sun);
    drawPalm(ctx, r.x + r.w * 0.06, r.y + r.h * 0.98, Math.min(r.w, r.h) * 0.004, 'rgba(10, 4, 20, 0.9)');
    drawPalm(ctx, r.x + r.w * 0.9, r.y + r.h * 0.99, Math.min(r.w, r.h) * 0.003, 'rgba(10, 4, 20, 0.85)');
  }
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

/** Draws the bold caption: gradient title with a dark outline, subtitle spaced beneath it. */
export function drawCaption(ctx, w, h, title, subtitle, grade) {
  const text = title.trim().toUpperCase();
  const bandH = h * 0.18;
  const bandY = h - bandH;
  const shade = ctx.createLinearGradient(0, bandY, 0, h);
  shade.addColorStop(0, 'rgba(12, 4, 26, 0)');
  shade.addColorStop(1, 'rgba(12, 4, 26, 0.72)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, bandY, w, bandH);
  if (text) {
    const size = fitTitleFont(ctx, text, w * 0.92, h * 0.072);
    const grad = ctx.createLinearGradient(0, h - bandH * 0.8, 0, h - bandH * 0.1);
    grad.addColorStop(0, grade.caption[0]);
    grad.addColorStop(1, grade.caption[1]);
    ctx.save();
    ctx.translate(w / 2, h - bandH * 0.42);
    ctx.transform(1, 0, -0.06, 1, 0, 0);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.14;
    ctx.strokeStyle = 'rgba(20, 4, 30, 0.9)';
    ctx.strokeText(text, 0, 0);
    ctx.fillStyle = grad;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }
  const sub = subtitle.trim();
  if (sub) {
    const size = Math.max(14, h * 0.02);
    ctx.font = `600 ${size}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fillText(sub.toUpperCase().split('').join('  '), w / 2, h - bandH * 0.08);
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
  const rects = LAYOUTS[state.layout] ?? LAYOUTS.hero;
  ctx.fillStyle = grade.gutter;
  ctx.fillRect(0, 0, w, h);
  rects.forEach((frac, i) => {
    const rect = { x: frac.x * w, y: frac.y * h, w: frac.w * w, h: frac.h * h };
    const panel = state.panels[i] ?? { img: null, zoom: 1, panX: 0, panY: 0 };
    drawPanel(ctx, rect, panel, grade, i, w);
  });
  // Soft vignette over the whole cover.
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(10,2,20,0.35)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  drawCaption(ctx, w, h, state.title, state.subtitle, grade);
}

/** Panel rectangles in canvas pixels, for hit-testing clicks and drags. */
export function panelRectsPx(canvas, layout) {
  const { width: w, height: h } = canvas;
  return (LAYOUTS[layout] ?? LAYOUTS.hero).map((f) => ({ x: f.x * w, y: f.y * h, w: f.w * w, h: f.h * h }));
}
