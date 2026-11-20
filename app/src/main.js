// Wires the Neon Vice editor: layout / grade / size bars, caption fields,
// six photo panels with zoom and pan (sliders, drag, wheel), panel chips
// that follow the layout, sample photos and PNG export at the chosen size.
// A `?shot=` query builds a fixed scene for a screenshot (./shots.js).

import { paintCover, panelBoxes, EXPORT_SIZES } from './cover.js';
import { setupScene } from './shots.js';

const canvas = document.getElementById('cover');
const titleField = document.getElementById('titleText');
const subtitleField = document.getElementById('subtitleText');
const notice = document.getElementById('notice');
const zoomRange = document.getElementById('zoomRange');
const panXRange = document.getElementById('panXRange');
const panYRange = document.getElementById('panYRange');
const picker = document.getElementById('photoPicker');
const chipRow = document.getElementById('chipRow');

/** Chip labels per layout, so the row names what each panel holds. */
const CHIP_LABELS = {
  classic: ['Hero', 'Neon', 'Boat', 'Boulevard', 'Pier', 'Skyline'],
  hero: ['Hero', 'Strip 1', 'Strip 2', 'Strip 3', 'Strip 4', 'Strip 5'],
  grid: ['Panel 1', 'Panel 2', 'Panel 3', 'Panel 4', 'Panel 5', 'Panel 6'],
  split: ['Main', 'Side 1', 'Side 2', 'Side 3', 'Side 4', 'Side 5'],
};

/** The six sample photos, in the order they fill the classic grid. */
const SAMPLE_ORDER = ['duo', 'neon', 'boat', 'boulevard', 'pier', 'heli'];

const scene = {
  layout: 'classic',
  grade: 'vice',
  size: 'portrait',
  title: titleField.value,
  subtitle: subtitleField.value,
  panels: Array.from({ length: 6 }, () => ({ img: null, zoom: 1, panX: 0, panY: 0 })),
};
let active = 0;

function paint() {
  paintCover(canvas, scene);
  syncChips();
}

function syncChips() {
  [...chipRow.children].forEach((chip, i) => {
    chip.classList.toggle('on', i === active);
    chip.classList.toggle('empty', !scene.panels[i].img);
  });
  const current = scene.panels[active];
  zoomRange.value = String(current.zoom);
  panXRange.value = String(current.panX);
  panYRange.value = String(current.panY);
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadPic(url) {
  return new Promise((resolve, reject) => {
    const pic = new Image();
    pic.onload = () => resolve(pic);
    pic.onerror = reject;
    pic.src = url;
  });
}

function pick(i) {
  active = i;
  syncChips();
}

function buildChips() {
  chipRow.textContent = '';
  const labels = CHIP_LABELS[scene.layout] ?? CHIP_LABELS.classic;
  labels.forEach((label, i) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip empty';
    chip.innerHTML = `<span class="swatch"></span>${label}`;
    chip.addEventListener('click', () => pick(i));
    chipRow.appendChild(chip);
  });
}

function wireBar(id, key) {
  const bar = document.getElementById(id);
  bar.addEventListener('click', (event) => {
    const btn = event.target.closest('button');
    if (!btn) return;
    [...bar.children].forEach((b) => b.classList.toggle('on', b === btn));
    scene[key] = btn.dataset[key];
    if (key === 'size') {
      const { w, h } = EXPORT_SIZES[scene.size];
      canvas.width = w;
      canvas.height = h;
    }
    if (key === 'layout') buildChips();
    paint();
  });
}

wireBar('layoutBar', 'layout');
wireBar('gradeBar', 'grade');
wireBar('sizeBar', 'size');
titleField.addEventListener('input', () => { scene.title = titleField.value; paint(); });
subtitleField.addEventListener('input', () => { scene.subtitle = subtitleField.value; paint(); });
zoomRange.addEventListener('input', () => { scene.panels[active].zoom = Number(zoomRange.value); paint(); });
panXRange.addEventListener('input', () => { scene.panels[active].panX = Number(panXRange.value); paint(); });
panYRange.addEventListener('input', () => { scene.panels[active].panY = Number(panYRange.value); paint(); });

document.getElementById('loadBtn').addEventListener('click', () => picker.click());
picker.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  scene.panels[active].img = await loadPic(URL.createObjectURL(file));
  scene.panels[active].zoom = 1;
  scene.panels[active].panX = 0;
  scene.panels[active].panY = 0;
  picker.value = '';
  notice.textContent = `Photo loaded into panel ${active + 1}.`;
  paint();
});

document.getElementById('fillBtn').addEventListener('click', () => {
  const pic = scene.panels[active].img;
  if (!pic) { notice.textContent = 'Load a photo into the selected panel first.'; return; }
  scene.panels.forEach((p) => { p.img = pic; });
  notice.textContent = 'Same photo in every panel.';
  paint();
});

document.getElementById('sampleBtn').addEventListener('click', async () => {
  const pics = await Promise.all(SAMPLE_ORDER.map((name) => loadPic(`samples/${name}.jpg`)));
  pics.forEach((pic, i) => { scene.panels[i].img = pic; });
  notice.textContent = 'Sample photos loaded.';
  paint();
});

// Click a panel in the preview to select it; drag inside it to pan its photo.
let drag = null;
function pointerInCanvas(event) {
  const box = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - box.left) / box.width) * canvas.width,
    y: ((event.clientY - box.top) / box.height) * canvas.height,
  };
}
canvas.addEventListener('pointerdown', (event) => {
  const at = pointerInCanvas(event);
  const boxes = panelBoxes(canvas, scene.layout);
  const i = boxes.findIndex((b) => at.x >= b.x && at.x < b.x + b.w && at.y >= b.y && at.y < b.y + b.h);
  if (i === -1) return;
  pick(i);
  drag = { start: at, panX: scene.panels[i].panX, panY: scene.panels[i].panY, box: boxes[i] };
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const at = pointerInCanvas(event);
  const panel = scene.panels[active];
  panel.panX = drag.panX + (at.x - drag.start.x) / drag.box.w;
  panel.panY = drag.panY + (at.y - drag.start.y) / drag.box.h;
  paint();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  const panel = scene.panels[active];
  panel.zoom = Math.min(2.5, Math.max(1, panel.zoom - event.deltaY * 0.001));
  paint();
}, { passive: false });

document.getElementById('exportBtn').addEventListener('click', () => {
  const { w, h } = EXPORT_SIZES[scene.size];
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  paintCover(off, scene);
  off.toBlob((blob) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `neon-vice-${w}x${h}.png`;
    link.click();
    notice.textContent = `Saved neon-vice-${w}x${h}.png`;
  }, 'image/png');
});

buildChips();

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  setupScene(shot, params, {
    loadPic,
    apply(next) {
      scene.layout = next.layout;
      scene.grade = next.grade;
      scene.size = next.size;
      scene.title = next.title;
      scene.subtitle = next.subtitle;
      titleField.value = next.title;
      subtitleField.value = next.subtitle;
      const { w, h } = EXPORT_SIZES[scene.size];
      canvas.width = w;
      canvas.height = h;
      scene.panels = next.panels;
      buildChips();
      document.querySelectorAll('#layoutBar button').forEach((b) => b.classList.toggle('on', b.dataset.layout === next.layout));
      document.querySelectorAll('#gradeBar button').forEach((b) => b.classList.toggle('on', b.dataset.grade === next.grade));
      document.querySelectorAll('#sizeBar button').forEach((b) => b.classList.toggle('on', b.dataset.size === next.size));
      paint();
    },
  });
} else {
  paint();
}
