// Neon Vice cover painter: six photos in a GTA-style poster grid, a warm
// sunset/neon grade over every panel, and bold caption lettering on top.
// Everything is drawn on canvas with the app's own shapes — no game art,
// no logos, no outside images.

/** Export sizes in pixels: [width, height] per size button. */
export const EXPORT_SIZES = {
  square: [1080, 1080],
  portrait: [1080, 1350],
  wide: [1920, 1080],
};

/**
 * Panel boxes as fractions of the cover: [x, y, width, height].
 * Six slots in every arrangement; the photo order follows the slot order.
 * classic is the poster look: a tall hero on the left, four vignettes,
 * and a full-width skyline band along the bottom for the caption.
 */
export const GRID_LAYOUTS = {
  classic: [
    [0, 0, 0.42, 0.64],
    [0.42, 0, 0.29, 0.32],
    [0.71, 0, 0.29, 0.32],
    [0.42, 0.32, 0.29, 0.32],
    [0.71, 0.32, 0.29, 0.32],
    [0, 0.64, 1, 0.36],
  ],
  grid: [
    [0, 0, 1 / 3, 0.5],
    [1 / 3, 0, 1 / 3, 0.5],
    [2 / 3, 0, 1 / 3, 0.5],
    [0, 0.5, 1 / 3, 0.5],
    [1 / 3, 0.5, 1 / 3, 0.5],
    [2 / 3, 0.5, 1 / 3, 0.5],
  ],
  hero: [
    [0, 0, 1, 0.56],
    [0, 0.56, 0.2, 0.44],
    [0.2, 0.56, 0.2, 0.44],
    [0.4, 0.56, 0.2, 0.44],
    [0.6, 0.56, 0.2, 0.44],
    [0.8, 0.56, 0.2, 0.44],
  ],
};

/**
 * Colour grades. wash is the tint each panel gets (top, bottom); headline
 * is the caption gradient; seam is the gutter between panels; blank is
 * the fill of a panel with no photo yet; rule is the accent bar colour.
 */
export const COLOR_GRADES = {
  vice: {
    wash: ['rgba(255, 140, 70, 0.08)', 'rgba(255, 45, 120, 0.40)'],
    headline: ['#fff6da', '#ffb347'],
    seam: '#150a1e',
    blank: ['#40205c', '#140a26'],
    rule: '#ff7a3d',
  },
  neon: {
    wash: ['rgba(0, 220, 255, 0.10)', 'rgba(255, 0, 160, 0.42)'],
    headline: ['#eafcff', '#4de8ff'],
    seam: '#070716',
    blank: ['#14224e', '#050514'],
    rule: '#00e5ff',
  },
  dusk: {
    wash: ['rgba(170, 110, 255, 0.10)', 'rgba(70, 25, 150, 0.46)'],
    headline: ['#f3e8ff', '#c77dff'],
    seam: '#100820',
    blank: ['#2c1848', '#0b0616'],
    rule: '#c77dff',
  },
};

/** Short names for the six slots, shown as chips in the editor. */
export const SLOT_NAMES = ['Hero', 'Neon', 'Boat', 'Street', 'Pier', 'Sky'];

/** The six bundled sample photos, in slot order. */
export const SAMPLE_ORDER = ['duo', 'neon', 'boat', 'boulevard', 'pier', 'heli'];

/**
 * Paints `img` to cover `box` (pixels), honouring the slot's zoom and pan.
 * The photo is scaled so its smaller side fills the box, then shifted by
 * the pan offsets (fractions of the box) before being clipped to the box.
 */
export function paintPhoto(ctx, img, box, zoom, panX, panY) {
  const fit = Math.max(box.w / img.naturalWidth, box.h / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * fit;
  const dh = img.naturalHeight * fit;
  // Clamp the pan so the photo always covers the box: a wide pan on a
  // photo that only just covers its slot would otherwise leave a bare strip.
  const capX = Math.max(0, (dw - box.w) / 2 / box.w);
  const capY = Math.max(0, (dh - box.h) / 2 / box.h);
  const px = Math.min(capX, Math.max(-capX, panX));
  const py = Math.min(capY, Math.max(-capY, panY));
  const cx = box.x + box.w / 2 + px * box.w;
  const cy = box.y + box.h / 2 + py * box.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.restore();
}

/**
 * Paints one slot: the photo (or a graded placeholder), the grade wash,
 * and a hairline frame that separates it from its neighbours.
 */
export function paintSlot(ctx, box, slot, grade) {
  const seam = Math.max(3, box.w * 0.012);
  const inner = {
    x: box.x + seam / 2,
    y: box.y + seam / 2,
    w: box.w - seam,
    h: box.h - seam,
  };
  ctx.save();
  ctx.beginPath();
  ctx.rect(inner.x, inner.y, inner.w, inner.h);
  ctx.clip();
  if (slot.photo) {
    paintPhoto(ctx, slot.photo, inner, slot.zoom, slot.panX, slot.panY);
  } else {
    const fill = ctx.createLinearGradient(0, inner.y, 0, inner.y + inner.h);
    fill.addColorStop(0, grade.blank[0]);
    fill.addColorStop(1, grade.blank[1]);
    ctx.fillStyle = fill;
    ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = `700 ${Math.max(13, inner.w * 0.06)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ADD PHOTO', inner.x + inner.w / 2, inner.y + inner.h / 2);
  }
  const wash = ctx.createLinearGradient(0, inner.y, 0, inner.y + inner.h);
  wash.addColorStop(0, grade.wash[0]);
  wash.addColorStop(1, grade.wash[1]);
  ctx.fillStyle = wash;
  ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
  ctx.restore();
  // Hairline frame around the slot.
  ctx.strokeStyle = 'rgba(8, 2, 16, 0.85)';
  ctx.lineWidth = Math.max(1.5, seam / 2);
  ctx.strokeRect(inner.x, inner.y, inner.w, inner.h);
}

/** Shrinks the headline until it fits `limit` pixels wide, then returns its size. */
export function headlineSize(ctx, text, limit, start) {
  const face = (px) => `900 ${px}px "Arial Black", "Arial Bold", sans-serif`;
  let px = start;
  ctx.font = face(px);
  while (px > 16 && ctx.measureText(text).width > limit) {
    px -= 2;
    ctx.font = face(px);
  }
  return px;
}

/**
 * Paints the caption over the bottom of the cover: a shade that lifts the
 * lettering off the photo, the big outlined headline with a slight lean,
 * an accent rule, and the letterspaced subtitle beneath it.
 */
export function paintCaption(ctx, w, h, title, subtitle, grade) {
  const headline = title.trim().toUpperCase();
  const shade = ctx.createLinearGradient(0, h * 0.74, 0, h);
  shade.addColorStop(0, 'rgba(10, 3, 22, 0)');
  shade.addColorStop(1, 'rgba(10, 3, 22, 0.68)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, h * 0.74, w, h * 0.26);
  const shortSide = Math.min(w, h);
  if (headline) {
    const size = headlineSize(ctx, headline, w * 0.88, shortSide * 0.135);
    const top = h * 0.865 - size / 2;
    const ink = ctx.createLinearGradient(0, top, 0, top + size);
    ink.addColorStop(0, grade.headline[0]);
    ink.addColorStop(1, grade.headline[1]);
    ctx.save();
    ctx.translate(w / 2, h * 0.865);
    ctx.transform(1, 0, -0.07, 1, 0, 0);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${size}px "Arial Black", "Arial Bold", sans-serif`;
    ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.15;
    ctx.strokeStyle = 'rgba(16, 3, 26, 0.92)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = size * 0.12;
    ctx.shadowOffsetY = size * 0.04;
    ctx.strokeText(headline, 0, 0);
    ctx.fillStyle = ink;
    ctx.fillText(headline, 0, 0);
    ctx.restore();
    const ruleW = Math.min(w * 0.4, ctx.measureText(headline).width * 0.42);
    ctx.fillStyle = grade.rule;
    ctx.fillRect((w - ruleW) / 2, h * 0.918, ruleW, Math.max(3, size * 0.035));
  }
  const sub = subtitle.trim();
  if (sub) {
    const size = Math.max(13, shortSide * 0.021);
    ctx.font = `600 ${size}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${size * 0.32}px`;
    ctx.fillText(sub.toUpperCase(), w / 2, h * 0.955);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }
}

/**
 * Renders the whole cover onto `canvas` at its own pixel size.
 * `scene` is { layout, grade, title, subtitle, slots: [{photo, zoom, panX, panY}] }.
 */
export function renderCover(canvas, scene) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = COLOR_GRADES[scene.grade] ?? COLOR_GRADES.vice;
  const boxes = GRID_LAYOUTS[scene.layout] ?? GRID_LAYOUTS.classic;
  ctx.fillStyle = grade.seam;
  ctx.fillRect(0, 0, w, h);
  boxes.forEach((frac, i) => {
    const box = { x: frac[0] * w, y: frac[1] * h, w: frac[2] * w, h: frac[3] * h };
    const slot = scene.slots[i] ?? { photo: null, zoom: 1, panX: 0, panY: 0 };
    paintSlot(ctx, box, slot, grade);
  });
  // One soft vignette over the finished poster.
  const vig = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.42,
    w / 2, h / 2, Math.max(w, h) * 0.78,
  );
  vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vig.addColorStop(1, 'rgba(8, 2, 18, 0.34)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  paintCaption(ctx, w, h, scene.title, scene.subtitle, grade);
}

/** Slot boxes in canvas pixels, for hit-testing clicks and drags. */
export function slotBoxesPx(canvas, layout) {
  const w = canvas.width;
  const h = canvas.height;
  return (GRID_LAYOUTS[layout] ?? GRID_LAYOUTS.classic).map(
    (f) => ({ x: f[0] * w, y: f[1] * h, w: f[2] * w, h: f[3] * h }),
  );
}
