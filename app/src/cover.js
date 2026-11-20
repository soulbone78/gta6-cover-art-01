// Neon Vice renderer: paints the six-panel GTA-style cover onto a canvas.
// Photos sit in panels under a filmic colour grade, split by hairline gutters,
// with a soft vignette over the whole poster and bold caption lettering. No
// game art and no outside images: every panel holds the maker's own photo or
// a sample made for make.fun with an image model.

/** Export sizes in pixels, keyed by the size control's data-size value. */
export const EXPORT_SIZES = {
  square: { w: 1080, h: 1080 },
  portrait: { w: 1080, h: 1350 },
  wide: { w: 1920, h: 1080 },
};

/**
 * Panel geometry as fractions of the cover, one entry per layout. Every layout
 * holds six panels. `caption` says where the lettering goes: on the last
 * panel (the classic panorama) or in a shaded band along the foot.
 */
export const PANEL_LAYOUTS = {
  classic: {
    caption: 'panel',
    rects: [
      { x: 0, y: 0, w: 0.42, h: 0.66 },
      { x: 0.42, y: 0, w: 0.29, h: 0.33 },
      { x: 0.71, y: 0, w: 0.29, h: 0.33 },
      { x: 0.42, y: 0.33, w: 0.29, h: 0.33 },
      { x: 0.71, y: 0.33, w: 0.29, h: 0.33 },
      { x: 0, y: 0.66, w: 1, h: 0.34 },
    ],
  },
  hero: {
    caption: 'band',
    rects: [
      { x: 0, y: 0, w: 1, h: 0.55 },
      { x: 0, y: 0.55, w: 0.2, h: 0.45 },
      { x: 0.2, y: 0.55, w: 0.2, h: 0.45 },
      { x: 0.4, y: 0.55, w: 0.2, h: 0.45 },
      { x: 0.6, y: 0.55, w: 0.2, h: 0.45 },
      { x: 0.8, y: 0.55, w: 0.2, h: 0.45 },
    ],
  },
  grid: {
    caption: 'band',
    rects: [
      { x: 0, y: 0, w: 1 / 3, h: 0.5 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 0.5 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 0.5 },
      { x: 0, y: 0.5, w: 1 / 3, h: 0.5 },
      { x: 1 / 3, y: 0.5, w: 1 / 3, h: 0.5 },
      { x: 2 / 3, y: 0.5, w: 1 / 3, h: 0.5 },
    ],
  },
  split: {
    caption: 'band',
    rects: [
      { x: 0, y: 0, w: 0.55, h: 1 },
      { x: 0.55, y: 0, w: 0.45, h: 0.2 },
      { x: 0.55, y: 0.2, w: 0.45, h: 0.2 },
      { x: 0.55, y: 0.4, w: 0.45, h: 0.2 },
      { x: 0.55, y: 0.6, w: 0.45, h: 0.2 },
      { x: 0.55, y: 0.8, w: 0.45, h: 0.2 },
    ],
  },
};

/**
 * Colour grades. `tint` is the wash each panel gets from top to bottom,
 * `wash` a faint warm light over the whole panel, `title` the caption
 * gradient, `gutter` the colour between panels and `empty` the fill for a
 * panel with no photo yet.
 */
export const GRADES = {
  vice: {
    tint: ['rgba(255, 40, 115, 0)', 'rgba(255, 40, 115, 0.40)'],
    wash: 'rgba(255, 168, 80, 0.10)',
    title: ['#fff3d6', '#ffb25e'],
    gutter: '#150a26',
    empty: ['#2e1650', '#0d0618'],
  },
  sunset: {
    tint: ['rgba(255, 122, 40, 0)', 'rgba(228, 48, 108, 0.44)'],
    wash: 'rgba(255, 190, 92, 0.12)',
    title: ['#fff8dc', '#ffab4a'],
    gutter: '#1d0e2c',
    empty: ['#40205e', '#130a24'],
  },
  neon: {
    tint: ['rgba(0, 218, 255, 0)', 'rgba(255, 0, 148, 0.44)'],
    wash: 'rgba(120, 238, 255, 0.08)',
    title: ['#eafdff', '#4de6ff'],
    gutter: '#080822',
    empty: ['#13244e', '#040412'],
  },
  dusk: {
    tint: ['rgba(158, 98, 255, 0)', 'rgba(54, 18, 128, 0.50)'],
    wash: 'rgba(198, 138, 255, 0.08)',
    title: ['#f4e9ff', '#c88cff'],
    gutter: '#100820',
    empty: ['#2b1846', '#0a0516'],
  },
};

const BLANK = { img: null, zoom: 1, panX: 0, panY: 0 };

/** Cover-fits `img` into `box`, honouring the panel's zoom and pan. */
function placePhoto(ctx, img, box, zoom, dx, dy) {
  const scale = Math.max(box.w / img.naturalWidth, box.h / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const cx = box.x + box.w / 2 + dx * box.w;
  const cy = box.y + box.h / 2 + dy * box.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.restore();
}

/** Paints one panel: the photo (or an empty fill), the grade wash, a hairline frame and a soft inner vignette. */
function paintPanel(ctx, box, panel, grade, coverW) {
  const gap = Math.max(3, coverW * 0.008);
  const inner = { x: box.x + gap / 2, y: box.y + gap / 2, w: box.w - gap, h: box.h - gap };
  ctx.save();
  ctx.beginPath();
  ctx.rect(inner.x, inner.y, inner.w, inner.h);
  ctx.clip();
  if (panel.img) {
    placePhoto(ctx, panel.img, inner, panel.zoom, panel.panX, panel.panY);
  } else {
    const fill = ctx.createLinearGradient(0, inner.y, 0, inner.y + inner.h);
    fill.addColorStop(0, grade.empty[0]);
    fill.addColorStop(1, grade.empty[1]);
    ctx.fillStyle = fill;
    ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = `700 ${Math.max(14, inner.w * 0.06)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+ ADD PHOTO', inner.x + inner.w / 2, inner.y + inner.h / 2);
  }
  const wash = ctx.createLinearGradient(0, inner.y + inner.h * 0.2, 0, inner.y + inner.h);
  wash.addColorStop(0, grade.tint[0]);
  wash.addColorStop(1, grade.tint[1]);
  ctx.fillStyle = wash;
  ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
  ctx.fillStyle = grade.wash;
  ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
  const shade = ctx.createRadialGradient(
    inner.x + inner.w / 2, inner.y + inner.h / 2, Math.min(inner.w, inner.h) * 0.42,
    inner.x + inner.w / 2, inner.y + inner.h / 2, Math.max(inner.w, inner.h) * 0.72,
  );
  shade.addColorStop(0, 'rgba(0,0,0,0)');
  shade.addColorStop(1, 'rgba(8,2,18,0.28)');
  ctx.fillStyle = shade;
  ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.20)';
  ctx.lineWidth = Math.max(1, coverW * 0.0012);
  ctx.strokeRect(inner.x, inner.y, inner.w, inner.h);
  ctx.restore();
}

/** Shrinks the title until it fits one line inside `maxWidth`. */
function fitTitle(ctx, text, maxWidth, start) {
  let size = start;
  const face = (s) => `900 ${s}px "Arial Black", "Helvetica Neue", system-ui, sans-serif`;
  ctx.font = face(size);
  while (ctx.measureText(text).width > maxWidth && size > 14) {
    size -= 2;
    ctx.font = face(size);
  }
  return size;
}

/** Paints the bold caption: gradient title with a dark edge, a thin accent rule, and a letter-spaced subtitle. */
function paintTitle(ctx, w, h, anchor, title, subtitle, grade) {
  const words = title.trim().toUpperCase();
  const sub = subtitle.trim();
  // A gentle darkening behind the lettering so it reads over any photo.
  const shade = ctx.createLinearGradient(0, anchor.y, 0, anchor.y + anchor.h);
  shade.addColorStop(0, 'rgba(10, 3, 22, 0)');
  shade.addColorStop(1, 'rgba(10, 3, 22, 0.66)');
  ctx.fillStyle = shade;
  ctx.fillRect(anchor.x, anchor.y, anchor.w, anchor.h);
  if (words) {
    const size = fitTitle(ctx, words, anchor.w * 0.9, anchor.h * 0.3);
    const grad = ctx.createLinearGradient(0, anchor.y + anchor.h * 0.3, 0, anchor.y + anchor.h * 0.72);
    grad.addColorStop(0, grade.title[0]);
    grad.addColorStop(1, grade.title[1]);
    ctx.save();
    ctx.translate(anchor.x + anchor.w / 2, anchor.y + anchor.h * 0.52);
    ctx.transform(1, 0, -0.07, 1, 0, 0);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.16;
    ctx.strokeStyle = 'rgba(18, 4, 28, 0.92)';
    ctx.strokeText(words, 0, 0);
    ctx.fillStyle = grad;
    ctx.fillText(words, 0, 0);
    ctx.restore();
  }
  if (sub) {
    const size = Math.max(13, h * 0.018);
    const ruleY = anchor.y + anchor.h * 0.72;
    const ruleW = Math.min(anchor.w * 0.24, 260);
    ctx.fillStyle = '#ff8a4d';
    ctx.fillRect(anchor.x + (anchor.w - ruleW) / 2, ruleY, ruleW, Math.max(2, h * 0.0025));
    ctx.font = `600 ${size}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    try { ctx.letterSpacing = `${size * 0.42}px`; } catch { /* older canvas: plain spacing */ }
    ctx.fillText(sub.toUpperCase(), anchor.x + anchor.w / 2, anchor.y + anchor.h * 0.86);
    try { ctx.letterSpacing = '0px'; } catch { /* ignore */ }
  }
}

/**
 * Paints the whole cover onto `canvas` at its own pixel size.
 * `scene` is { layout, grade, title, subtitle, panels: [{img, zoom, panX, panY}] }.
 */
export function paintCover(canvas, scene) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = GRADES[scene.grade] ?? GRADES.vice;
  const layout = PANEL_LAYOUTS[scene.layout] ?? PANEL_LAYOUTS.classic;
  ctx.fillStyle = grade.gutter;
  ctx.fillRect(0, 0, w, h);
  const boxes = layout.rects.map((f) => ({ x: f.x * w, y: f.y * h, w: f.w * w, h: f.h * h }));
  boxes.forEach((box, i) => {
    paintPanel(ctx, box, scene.panels[i] ?? BLANK, grade, w);
  });
  // One soft vignette over the finished poster.
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.44, w / 2, h / 2, Math.max(w, h) * 0.78);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(10,2,20,0.32)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  const anchor = layout.caption === 'panel'
    ? boxes[boxes.length - 1]
    : { x: 0, y: h * 0.8, w, h: h * 0.2 };
  paintTitle(ctx, w, h, anchor, scene.title, scene.subtitle, grade);
}

/** Panel rectangles in canvas pixels, for hit-testing clicks and drags. */
export function panelBoxes(canvas, layout) {
  const w = canvas.width;
  const h = canvas.height;
  const chosen = PANEL_LAYOUTS[layout] ?? PANEL_LAYOUTS.classic;
  return chosen.rects.map((f) => ({ x: f.x * w, y: f.y * h, w: f.w * w, h: f.h * h }));
}
