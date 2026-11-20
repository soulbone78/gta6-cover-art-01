// Wires the Neon Vice editor: layout / grade / size pickers, caption
// fields, six photo slots with zoom and pan (sliders, drag, wheel),
// slot selection by clicking the preview, and PNG export.
// A `?shot=` query loads a fixed scene for a screenshot (./shots.js).

import { renderCover, slotBoxesPx, EXPORT_SIZES, SLOT_NAMES, SAMPLE_ORDER } from './cover.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('poster');
const headlineInput = $('headline');
const taglineInput = $('tagline');
const notice = $('notice');
const zoomSlider = $('zoomSlider');
const panXSlider = $('panXSlider');
const panYSlider = $('panYSlider');
const picker = $('filePicker');
const chipRow = $('slotChips');

const blankSlot = () => ({ photo: null, zoom: 1, panX: 0, panY: 0 });
const scene = {
  layout: 'classic',
  grade: 'vice',
  size: 'portrait',
  title: headlineInput.value,
  subtitle: taglineInput.value,
  slots: Array.from({ length: 6 }, blankSlot),
};
let active = 0;

function paint() {
  renderCover(canvas, scene);
  refreshChips();
}

function refreshChips() {
  [...chipRow.children].forEach((chip, i) => {
    chip.classList.toggle('picked', i === active);
    chip.classList.toggle('blank', !scene.slots[i].photo);
  });
  const slot = scene.slots[active];
  zoomSlider.value = String(slot.zoom);
  panXSlider.value = String(slot.panX);
  panYSlider.value = String(slot.panY);
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

function pickSlot(i) {
  active = i;
  refreshChips();
}

function buildChips() {
  chipRow.textContent = '';
  SLOT_NAMES.forEach((label, i) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'slot-chip blank';
    chip.innerHTML = `<span class="swatch"></span>${label}`;
    chip.addEventListener('click', () => pickSlot(i));
    chipRow.appendChild(chip);
  });
}

function wirePicker(id, key) {
  const group = $(id);
  group.addEventListener('click', (event) => {
    const btn = event.target.closest('button');
    if (!btn) return;
    [...group.children].forEach((b) => b.classList.toggle('on', b === btn));
    scene[key] = btn.dataset[key];
    if (key === 'size') {
      const [w, h] = EXPORT_SIZES[scene.size];
      canvas.width = w;
      canvas.height = h;
    }
    paint();
  });
}

wirePicker('layoutPicker', 'layout');
wirePicker('gradePicker', 'grade');
wirePicker('sizePicker', 'size');
headlineInput.addEventListener('input', () => { scene.title = headlineInput.value; paint(); });
taglineInput.addEventListener('input', () => { scene.subtitle = taglineInput.value; paint(); });
zoomSlider.addEventListener('input', () => { scene.slots[active].zoom = Number(zoomSlider.value); paint(); });
panXSlider.addEventListener('input', () => { scene.slots[active].panX = Number(panXSlider.value); paint(); });
panYSlider.addEventListener('input', () => { scene.slots[active].panY = Number(panYSlider.value); paint(); });

$('loadBtn').addEventListener('click', () => picker.click());
picker.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const slot = scene.slots[active];
  slot.photo = await loadImage(URL.createObjectURL(file));
  slot.zoom = 1;
  slot.panX = 0;
  slot.panY = 0;
  picker.value = '';
  notice.textContent = `Photo loaded into the ${SLOT_NAMES[active]} slot.`;
  paint();
});

$('repeatBtn').addEventListener('click', () => {
  const photo = scene.slots[active].photo;
  if (!photo) { notice.textContent = 'Load a photo into the active slot first.'; return; }
  scene.slots.forEach((slot) => { slot.photo = photo; });
  notice.textContent = 'Same photo in every slot.';
  paint();
});

$('samplesBtn').addEventListener('click', async () => {
  const images = await Promise.all(
    SAMPLE_ORDER.map((name) => loadImage(`samples/${name}.jpg`)),
  );
  images.forEach((photo, i) => {
    scene.slots[i].photo = photo;
    scene.slots[i].zoom = 1;
    scene.slots[i].panX = 0;
    scene.slots[i].panY = 0;
  });
  notice.textContent = 'Sample photos loaded.';
  paint();
});

// Click a slot in the preview to pick it; drag inside it to pan its photo.
let drag = null;
function toCanvas(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}
canvas.addEventListener('pointerdown', (event) => {
  const point = toCanvas(event);
  const boxes = slotBoxesPx(canvas, scene.layout);
  const i = boxes.findIndex(
    (b) => point.x >= b.x && point.x < b.x + b.w && point.y >= b.y && point.y < b.y + b.h,
  );
  if (i === -1) return;
  pickSlot(i);
  drag = {
    from: point,
    panX: scene.slots[i].panX,
    panY: scene.slots[i].panY,
    box: boxes[i],
  };
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const point = toCanvas(event);
  const slot = scene.slots[active];
  slot.panX = drag.panX + (point.x - drag.from.x) / drag.box.w;
  slot.panY = drag.panY + (point.y - drag.from.y) / drag.box.h;
  paint();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  const slot = scene.slots[active];
  slot.zoom = Math.min(2.5, Math.max(1, slot.zoom - event.deltaY * 0.001));
  paint();
}, { passive: false });

$('exportBtn').addEventListener('click', () => {
  const [w, h] = EXPORT_SIZES[scene.size];
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  renderCover(off, scene);
  off.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `neon-vice-${w}x${h}.png`;
    a.click();
    notice.textContent = `Saved neon-vice-${w}x${h}.png`;
  }, 'image/png');
});

buildChips();

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, {
    loadImage,
    apply(next) {
      scene.layout = next.layout;
      scene.grade = next.grade;
      scene.size = next.size;
      scene.title = next.title;
      scene.subtitle = next.subtitle;
      headlineInput.value = next.title;
      taglineInput.value = next.subtitle;
      const [w, h] = EXPORT_SIZES[scene.size];
      canvas.width = w;
      canvas.height = h;
      scene.slots = next.slots;
      document.querySelectorAll('#layoutPicker button').forEach(
        (b) => b.classList.toggle('on', b.dataset.layout === next.layout));
      document.querySelectorAll('#gradePicker button').forEach(
        (b) => b.classList.toggle('on', b.dataset.grade === next.grade));
      document.querySelectorAll('#sizePicker button').forEach(
        (b) => b.classList.toggle('on', b.dataset.size === next.size));
      paint();
    },
  });
} else {
  paint();
}
