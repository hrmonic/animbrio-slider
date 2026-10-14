import type { Breakpoint, Layer, Project, Slide } from "@animbrio/schema";
import {
  AnimbrioError,
  createEmptySlide,
  createGroupLayer,
  createTextLayer,
  defaultBox,
  isTextLike,
  requireModule,
  requireSlide,
} from "@animbrio/schema";

function requireLayer(project: Project, moduleId: string, slideId: string, layerId: string): Layer {
  const layer = requireSlide(project, moduleId, slideId).layers.find((l) => l.id === layerId);
  if (!layer) {
    throw new AnimbrioError("LAYER_NOT_FOUND", `Calque introuvable: ${layerId}`);
  }
  return layer;
}

function boxAt(layer: Layer, breakpoint: Breakpoint) {
  if (breakpoint !== "desktop" && !layer.box[breakpoint]) {
    layer.box[breakpoint] = { ...layer.box.desktop };
  }
  return layer.box[breakpoint] ?? layer.box.desktop;
}

export function mutateLayer(
  project: Project,
  moduleId: string,
  slideId: string,
  layerId: string,
  updater: (layer: Layer) => void,
): void {
  updater(requireLayer(project, moduleId, slideId, layerId));
}

export function addTextLayer(project: Project, moduleId: string, slideId: string): Layer {
  const slide = requireSlide(project, moduleId, slideId);
  const layer = createTextLayer({
    name: `Texte ${slide.layers.length + 1}`,
    content: "Nouveau texte",
    zIndex: slide.layers.length + 1,
    box: defaultBox({ x: 100, y: 100, width: 320, height: 64 }),
    typography: { fontSize: 24, fontWeight: 600 },
  });
  slide.layers.push(layer);
  return layer;
}

export function duplicateLayers(project: Project, moduleId: string, slideId: string, ids: string[]): string[] {
  const slide = requireSlide(project, moduleId, slideId);
  const created: string[] = [];
  for (const id of ids) {
    const src = slide.layers.find((l) => l.id === id);
    if (!src) continue;
    const copy = structuredClone(src);
    copy.id = crypto.randomUUID();
    copy.name = `${src.name} copie`;
    copy.zIndex = slide.layers.length + 1;
    copy.box.desktop.x += 16;
    copy.box.desktop.y += 16;
    slide.layers.push(copy);
    created.push(copy.id);
  }
  return created;
}

export function deleteLayers(project: Project, moduleId: string, slideId: string, ids: string[]): void {
  const slide = requireSlide(project, moduleId, slideId);
  slide.layers = slide.layers.filter((l) => !ids.includes(l.id));
}

export function moveLayer(
  project: Project,
  moduleId: string,
  slideId: string,
  layerId: string,
  dx: number,
  dy: number,
  breakpoint: Breakpoint = "desktop",
): void {
  const layer = requireSlide(project, moduleId, slideId).layers.find((l) => l.id === layerId);
  if (!layer || layer.locked) return;
  const box = boxAt(layer, breakpoint);
  box.x += dx;
  box.y += dy;
}

export function resizeLayer(
  project: Project,
  moduleId: string,
  slideId: string,
  layerId: string,
  width: number,
  height: number,
  breakpoint: Breakpoint = "desktop",
): void {
  const layer = requireSlide(project, moduleId, slideId).layers.find((l) => l.id === layerId);
  if (!layer || layer.locked) return;
  const target = boxAt(layer, breakpoint);
  target.width = Math.max(8, width);
  target.height = Math.max(8, height);
}

export function alignLayers(
  project: Project,
  moduleId: string,
  slideId: string,
  ids: string[],
  mode: "left" | "center" | "right" | "top" | "middle" | "bottom",
): void {
  const slide = requireSlide(project, moduleId, slideId);
  const layers = slide.layers.filter((l) => ids.includes(l.id));
  if (layers.length < 2) return;
  const boxes = layers.map((l) => l.box.desktop);
  const minX = Math.min(...boxes.map((b) => b.x));
  const maxX = Math.max(...boxes.map((b) => b.x + b.width));
  const minY = Math.min(...boxes.map((b) => b.y));
  const maxY = Math.max(...boxes.map((b) => b.y + b.height));
  for (const layer of layers) {
    const b = layer.box.desktop;
    if (mode === "left") b.x = minX;
    if (mode === "right") b.x = maxX - b.width;
    if (mode === "center") b.x = (minX + maxX) / 2 - b.width / 2;
    if (mode === "top") b.y = minY;
    if (mode === "bottom") b.y = maxY - b.height;
    if (mode === "middle") b.y = (minY + maxY) / 2 - b.height / 2;
  }
}

export function groupLayers(project: Project, moduleId: string, slideId: string, ids: string[]): string | null {
  const slide = requireSlide(project, moduleId, slideId);
  const layers = slide.layers.filter((l) => ids.includes(l.id));
  if (layers.length < 2) return null;
  const xs = layers.map((l) => l.box.desktop.x);
  const ys = layers.map((l) => l.box.desktop.y);
  const group = createGroupLayer({
    name: "Groupe",
    zIndex: Math.max(...layers.map((l) => l.zIndex)) + 1,
    childIds: layers.map((l) => l.id),
    box: defaultBox({
      x: Math.min(...xs),
      y: Math.min(...ys),
    }),
  });
  for (const l of layers) l.parentId = group.id;
  slide.layers.push(group);
  return group.id;
}

export function ungroup(project: Project, moduleId: string, slideId: string, groupId: string): void {
  const slide = requireSlide(project, moduleId, slideId);
  const group = slide.layers.find((l) => l.id === groupId);
  if (!group || group.type !== "group") return;
  for (const l of slide.layers) {
    if (l.parentId === groupId) l.parentId = null;
  }
  slide.layers = slide.layers.filter((l) => l.id !== groupId);
}

export function addSlide(project: Project, moduleId: string): Slide {
  const mod = requireModule(project, moduleId);
  const slide = createEmptySlide(`Slide ${mod.slides.length + 1}`);
  mod.slides.push(slide);
  return slide;
}

export function deleteSlide(project: Project, moduleId: string, slideId: string): void {
  const mod = requireModule(project, moduleId);
  if (mod.slides.length <= 1) return;
  mod.slides = mod.slides.filter((s) => s.id !== slideId);
}

export function reorderSlides(project: Project, moduleId: string, from: number, to: number): void {
  const mod = requireModule(project, moduleId);
  const item = mod.slides.splice(from, 1)[0];
  if (!item) return;
  mod.slides.splice(to, 0, item);
}

export function setLayerKeyframe(
  project: Project,
  moduleId: string,
  slideId: string,
  layerId: string,
  property: string,
  time: number,
  value: number,
): void {
  const slide = requireSlide(project, moduleId, slideId);
  const layer = slide.layers.find((l) => l.id === layerId);
  if (!layer) return;
  layer.animation.in = layer.animation.in ?? { delay: 0, duration: slide.duration, tracks: [] };
  const track = layer.animation.in.tracks.find((t) => t.property === property);
  const kf = { time: Math.min(1, Math.max(0, time / (layer.animation.in.duration || 1))), value };
  if (track) {
    const existing = track.keyframes.find((k) => Math.abs(k.time - kf.time) < 0.02);
    if (existing) existing.value = value;
    else track.keyframes.push(kf);
    track.keyframes.sort((a, b) => a.time - b.time);
  } else {
    layer.animation.in.tracks.push({ property, keyframes: [{ time: 0, value }, kf] });
  }
}

export function setTextContent(layer: Layer, content: string): void {
  if (!isTextLike(layer)) return;
  layer.content = content;
}

export function setFontSize(layer: Layer, fontSize: number): void {
  if (!isTextLike(layer)) return;
  layer.typography.fontSize = fontSize;
}

export function restoreRevision(_project: Project, snapshot: Project): Project {
  return structuredClone(snapshot);
}
