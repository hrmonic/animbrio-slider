import type { Box, GroupLayer, LayerBase, Module, Project, Slide, TextLayer, Typography } from "./project.ts";
import { SCHEMA_VERSION } from "./project.ts";

export function defaultBox(overrides: Partial<Box> = {}): Box {
  return {
    x: 0,
    y: 0,
    width: 100,
    height: 80,
    rotation: 0,
    originX: 0.5,
    originY: 0.5,
    opacity: 1,
    ...overrides,
  };
}

export function defaultTypography(overrides: Partial<Typography> = {}): Typography {
  return {
    fontFamily: "system-ui, sans-serif",
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: 0,
    textAlign: "left",
    color: "#ffffff",
    ...overrides,
  };
}

function layerBase(input: { name: string; zIndex: number; box?: Box; id?: string }): LayerBase {
  return {
    id: input.id ?? crypto.randomUUID(),
    name: input.name,
    parentId: null,
    zIndex: input.zIndex,
    locked: false,
    hiddenInEditor: false,
    hiddenInOutput: false,
    style: {},
    box: { desktop: input.box ?? defaultBox() },
    animation: {},
  };
}

export function createTextLayer(input: {
  name: string;
  content: string;
  zIndex: number;
  box?: Box;
  typography?: Partial<Typography>;
  animation?: TextLayer["animation"];
}): TextLayer {
  return {
    ...layerBase(input),
    type: "text",
    content: input.content,
    typography: defaultTypography(input.typography),
    animation: input.animation ?? {},
  };
}

export function createGroupLayer(input: { name: string; zIndex: number; childIds: string[]; box?: Box }): GroupLayer {
  return {
    ...layerBase(input),
    type: "group",
    childIds: input.childIds,
  };
}

export function createEmptySlide(name = "Slide 1"): Slide {
  return {
    id: crypto.randomUUID(),
    name,
    duration: 6000,
    transition: { type: "fade", duration: 300 },
    background: { type: "color", color: "#111111" },
    layers: [],
  };
}

export function createEmptyModule(name = "Module 1", slug = "module-1"): Module {
  return {
    id: crypto.randomUUID(),
    name,
    slug,
    kind: "scene",
    designSize: { desktop: { width: 1240, height: 900 } },
    slides: [createEmptySlide()],
    settings: { parallax: { enabled: false, type: "off", levels: [] } },
    customCss: "",
    extensionHints: [],
  };
}

export function createEmptyProject(name = "Nouveau projet"): Project {
  const now = new Date().toISOString();
  const titleLayer = createTextLayer({
    name: "Titre",
    content: "Animbrio Slider",
    zIndex: 1,
    box: defaultBox({ x: 120, y: 200, width: 600, height: 80, originX: 0 }),
    typography: { fontSize: 48, fontWeight: 700, lineHeight: 1.1 },
    animation: {
      in: {
        delay: 200,
        duration: 800,
        tracks: [
          {
            property: "opacity",
            keyframes: [
              { time: 0, value: 0, easing: "easeOut" },
              { time: 1, value: 1 },
            ],
          },
          {
            property: "y",
            keyframes: [
              { time: 0, value: 40, easing: "easeOutCubic" },
              { time: 1, value: 0 },
            ],
          },
        ],
      },
    },
  });
  const module = createEmptyModule();
  const slide = module.slides[0];
  if (slide) {
    slide.background = { type: "gradient", gradient: "linear-gradient(135deg,#0c0000,#1a0a2e)" };
    slide.layers = [titleLayer];
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    media: [],
    modules: [module],
  };
}
