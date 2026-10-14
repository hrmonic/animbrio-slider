import type { Breakpoint, Layer, Slide } from "@animbrio/schema";
import { applyEasing, type EasingName } from "./easing.ts";

export interface LayerRenderState {
  layerId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  originX: number;
  originY: number;
  opacity: number;
  visible: boolean;
}

export interface SlideTimelineState {
  slideIndex: number;
  slideLocalTime: number;
  globalTime: number;
  layers: LayerRenderState[];
  transitionProgress: number;
  nextSlideIndex: number | null;
}

function resolveBox(layer: Layer, bp: Breakpoint) {
  const order: Breakpoint[] = ["mobile", "tablet", "notebook", "desktop"];
  const idx = order.indexOf(bp);
  for (let i = idx; i >= 0; i--) {
    const key = order[i];
    if (!key) continue;
    const box = layer.box[key];
    if (box) return box;
  }
  return layer.box.desktop;
}

function interpolateKeyframes(
  keyframes: {
    time: number;
    value: number | string;
    easing?: EasingName;
    bezier?: [number, number, number, number];
  }[],
  progress: number,
): number {
  if (keyframes.length === 0) return 0;
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const first = sorted[0];
  if (!first) return 0;
  const p = Math.min(1, Math.max(0, progress));
  let i = 0;
  while (i < sorted.length - 1 && (sorted[i + 1]?.time ?? Number.POSITIVE_INFINITY) < p) i++;
  const a = sorted[i] ?? first;
  const b = sorted[i + 1] ?? a;
  if (a === b || a.time === b.time) return Number(a.value);
  const local = (p - a.time) / (b.time - a.time);
  const eased = applyEasing(local, b.easing ?? a.easing, b.bezier ?? a.bezier);
  const va = Number(a.value);
  const vb = Number(b.value);
  return va + (vb - va) * eased;
}

function evaluateLayerAtTime(
  layer: Layer,
  slideDuration: number,
  t: number,
  bp: Breakpoint,
): LayerRenderState {
  const base = resolveBox(layer, bp);
  const state: LayerRenderState = {
    layerId: layer.id,
    x: base.x,
    y: base.y,
    width: base.width,
    height: base.height,
    rotation: base.rotation,
    originX: base.originX,
    originY: base.originY,
    opacity: base.opacity,
    visible: !layer.hiddenInOutput,
  };

  const anim = layer.animation;
  const applyTracks = (
    tracks: { property: string; keyframes: { time: number; value: number | string; easing?: EasingName }[] }[],
    progress: number,
  ) => {
    for (const track of tracks) {
      const v = interpolateKeyframes(track.keyframes, progress);
      if (track.property === "opacity") state.opacity *= v;
      else if (track.property === "x") state.x += v;
      else if (track.property === "y") state.y += v;
      else if (track.property === "rotation") state.rotation += v;
      else if (track.property === "scale") {
        state.width *= v;
        state.height *= v;
      }
    }
  };

  if (anim.in && anim.in.duration > 0) {
    const start = anim.in.delay;
    const end = anim.in.delay + anim.in.duration;
    if (t >= start && t <= end) {
      const progress = (t - start) / anim.in.duration;
      applyTracks(anim.in.tracks, progress);
    } else if (t < start) {
      state.opacity = 0;
    }
  }

  if (anim.out && anim.out.duration > 0) {
    const outStart = slideDuration - anim.out.duration - anim.out.delay;
    const outEnd = slideDuration - anim.out.delay;
    if (t >= outStart && t <= outEnd) {
      const progress = (t - outStart) / anim.out.duration;
      applyTracks(anim.out.tracks, progress);
    } else if (t > outEnd) {
      state.opacity = 0;
    }
  }

  if (anim.loop && anim.loop.duration > 0) {
    const loopT = (t % anim.loop.duration) / anim.loop.duration;
    applyTracks(anim.loop.tracks, loopT);
  }

  return state;
}

export function getSlidesTotalDuration(slides: Slide[]): number {
  return slides.reduce((acc, s) => acc + s.duration + s.transition.duration, 0);
}

/** Temps global (ms) → état de la slide active et des calques. */
export function evaluateModuleAtTime(
  slides: Slide[],
  globalTimeMs: number,
  breakpoint: Breakpoint = "desktop",
): SlideTimelineState {
  const first = slides[0];
  if (!first) {
    return {
      slideIndex: 0,
      slideLocalTime: 0,
      globalTime: globalTimeMs,
      layers: [],
      transitionProgress: 0,
      nextSlideIndex: null,
    };
  }
  let t = Math.max(0, globalTimeMs);
  let slideIndex = 0;
  for (let i = 0; i < slides.length; i++) {
    const current = slides[i];
    if (!current) break;
    const block = current.duration + (current.transition.duration ?? 0);
    if (t < block || i === slides.length - 1) {
      slideIndex = i;
      break;
    }
    t -= block;
    slideIndex = i + 1;
  }
  const slide = slides[slideIndex] ?? first;
  const transDur = slide.transition.duration ?? 0;
  const slideLocalTime = Math.min(t, slide.duration);
  let transitionProgress = 0;
  let nextSlideIndex: number | null = null;
  if (transDur > 0 && t > slide.duration && slideIndex < slides.length - 1) {
    transitionProgress = Math.min(1, (t - slide.duration) / transDur);
    nextSlideIndex = slideIndex + 1;
  }

  const layers = slide.layers
    .filter((l) => !l.hiddenInOutput)
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((layer) => evaluateLayerAtTime(layer, slide.duration, slideLocalTime, breakpoint));

  return {
    slideIndex,
    slideLocalTime,
    globalTime: globalTimeMs,
    layers,
    transitionProgress,
    nextSlideIndex,
  };
}
