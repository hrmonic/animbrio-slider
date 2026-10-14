import { AnimbrioError } from "./errors.ts";
import type { Module, Project, Slide } from "./project.ts";

export function firstModule(project: Project): Module {
  const mod = project.modules[0];
  if (!mod) {
    throw new AnimbrioError("EMPTY_PROJECT", "Le projet n'a aucun module");
  }
  return mod;
}

export function firstSlide(mod: Module): Slide {
  const slide = mod.slides[0];
  if (!slide) {
    throw new AnimbrioError("EMPTY_MODULE", "Le module n'a aucune slide");
  }
  return slide;
}

export function findModule(project: Project, moduleId: string): Module | undefined {
  return project.modules.find((m) => m.id === moduleId);
}

export function findSlide(mod: Module, slideId: string): Slide | undefined {
  return mod.slides.find((s) => s.id === slideId);
}

export function requireModule(project: Project, moduleId: string): Module {
  const mod = findModule(project, moduleId);
  if (!mod) {
    throw new AnimbrioError("MODULE_NOT_FOUND", `Module introuvable: ${moduleId}`);
  }
  return mod;
}

export function requireSlide(project: Project, moduleId: string, slideId: string): Slide {
  const slide = requireModule(project, moduleId).slides.find((s) => s.id === slideId);
  if (!slide) {
    throw new AnimbrioError("SLIDE_NOT_FOUND", `Slide introuvable: ${slideId}`);
  }
  return slide;
}
