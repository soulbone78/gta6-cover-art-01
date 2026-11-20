// Wires the Neon Vice editor: layout / grade / size buttons, caption fields,
// per-panel photo loading with zoom and pan (sliders, drag, wheel), panel
// selection by clicking the preview, and PNG export at the chosen size.
// A `?shot=` query sets up a fixed scene for a screenshot (./shots.js).

import { drawCover, layoutPanelCount, MAX_PANELS, panelRectsPx, SIZES } from './cover.js';
import { runShot, SAMPLE_ORDER } from './shots.js';

const canvas = document.getElementById('cover');
const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
const status = document.getElementById('status');
const zoomInput = document.getElementById('zoom');
const panXInput = document.getElementById('panX');
const panYInput = document.getElementById('panY');
const fileInput = document.getElementById('photoFile');
const panelList = document.getElementById('panelList');

const state = {
  layout: 'classic',
  grade: 'sunset',
  size: 'portrait',
  title: titleInput.value,
  subtitle: subtitleInput.value,
  panels: Array.from({ length: MAX_PANELS }, () => ({ img: null, zoom: 1, panX: 0, panY: 0 })),
};
let selected = 0;

function redraw() {
  drawCover(canvas, state);
  syncPanelChips();
}

function syncPanelChips() {
  [...panelList.children].forEach((chip, i) => {
    chip.classList.toggle('on', i === selected);
    chip.classList.toggle('empty', !state.panels[i].img);
  });
  const p = state.panels[selected];
  zoomInput.value = String(p.zoom);
  panXInput.value = String(p.panX);
  panYInput.value = String(p.panY);
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function selectPanel(i) {
  selected = i;
  syncPanelChips();
}

/** One chip per panel the current layout draws; Classic shows six, the rest four. */
function buildPanelChips() {
  const count = layoutPanelCount(state.layout);
  if (selected >= count) selected = 0;
  panelList.textContent = '';
  const labels = ['Hero', 'Panel 2', 'Panel 3', 'Panel 4', 'Panel 5', 'Panel 6'];
  for (let i = 0; i < count; i++) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'panel-chip empty';
    chip.innerHTML = `<span class="dot"></span>${labels[i]}`;
    chip.addEventListener('click', () => selectPanel(i));
    panelList.appendChild(chip);
  }
  syncPanelChips();
}

function wireSegment(id, key) {
  const seg = document.getElementById(id);
  seg.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    [...seg.children].forEach((b) => b.classList.toggle('on', b === btn));
    state[key] = btn.dataset[key];
    if (key === 'size') {
      const { w, h } = SIZES[state.size];
      canvas.width = w;
      canvas.height = h;
    }
    if (key === 'layout') buildPanelChips();
    redraw();
  });
}

wireSegment('layoutSeg', 'layout');
wireSegment('gradeSeg', 'grade');
wireSegment('sizeSeg', 'size');
titleInput.addEventListener('input', () => { state.title = titleInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });
zoomInput.addEventListener('input', () => { state.panels[selected].zoom = Number(zoomInput.value); redraw(); });
panXInput.addEventListener('input', () => { state.panels[selected].panX = Number(panXInput.value); redraw(); });
panYInput.addEventListener('input', () => { state.panels[selected].panY = Number(panYInput.value); redraw(); });

document.getElementById('loadPhoto').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  state.panels[selected].img = await loadImage(URL.createObjectURL(file));
  state.panels[selected].zoom = 1;
  state.panels[selected].panX = 0;
  state.panels[selected].panY = 0;
  fileInput.value = '';
  status.textContent = `Photo loaded into panel ${selected + 1}.`;
  redraw();
});

document.getElementById('fillAll').addEventListener('click', () => {
  const img = state.panels[selected].img;
  if (!img) { status.textContent = 'Load a photo into the selected panel first.'; return; }
  state.panels.forEach((p) => { p.img = img; });
  status.textContent = 'Same photo in every panel.';
  redraw();
});

document.getElementById('sampleBtn').addEventListener('click', async () => {
  const imgs = await Promise.all(SAMPLE_ORDER.map((name) => loadImage(`samples/${name}.jpg`)));
  imgs.forEach((img, i) => { state.panels[i].img = img; });
  status.textContent = 'Sample photos loaded.';
  redraw();
});

// Click a panel in the preview to select it; drag inside it to pan its photo.
let dragging = null;
function canvasPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * canvas.width,
    y: ((e.clientY - rect.top) / rect.height) * canvas.height,
  };
}
canvas.addEventListener('pointerdown', (e) => {
  const p = canvasPoint(e);
  const rects = panelRectsPx(canvas, state.layout);
  const i = rects.findIndex((r) => p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h);
  if (i === -1) return;
  selectPanel(i);
  dragging = { start: p, panX: state.panels[i].panX, panY: state.panels[i].panY, rect: rects[i] };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const p = canvasPoint(e);
  const panel = state.panels[selected];
  panel.panX = dragging.panX + (p.x - dragging.start.x) / dragging.rect.w;
  panel.panY = dragging.panY + (p.y - dragging.start.y) / dragging.rect.h;
  redraw();
});
canvas.addEventListener('pointerup', () => { dragging = null; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const panel = state.panels[selected];
  panel.zoom = Math.min(2.5, Math.max(1, panel.zoom - e.deltaY * 0.001));
  redraw();
}, { passive: false });

document.getElementById('export').addEventListener('click', () => {
  const { w, h } = SIZES[state.size];
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  drawCover(off, state);
  off.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `neon-vice-${w}x${h}.png`;
    a.click();
    status.textContent = `Saved neon-vice-${w}x${h}.png`;
  }, 'image/png');
});

buildPanelChips();

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, {
    loadImage,
    apply(scene) {
      state.layout = scene.layout;
      state.grade = scene.grade;
      state.size = scene.size;
      state.title = scene.title;
      state.subtitle = scene.subtitle;
      titleInput.value = scene.title;
      subtitleInput.value = scene.subtitle;
      const { w, h } = SIZES[state.size];
      canvas.width = w;
      canvas.height = h;
      state.panels = scene.panels;
      document.querySelectorAll('#layoutSeg button').forEach((b) => b.classList.toggle('on', b.dataset.layout === scene.layout));
      document.querySelectorAll('#gradeSeg button').forEach((b) => b.classList.toggle('on', b.dataset.grade === scene.grade));
      document.querySelectorAll('#sizeSeg button').forEach((b) => b.classList.toggle('on', b.dataset.size === scene.size));
      buildPanelChips();
      redraw();
    },
  });
} else {
  redraw();
}
