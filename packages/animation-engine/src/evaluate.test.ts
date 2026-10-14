import { describe, expect, it } from "vitest";
import { createEmptyProject, firstModule } from "@animbrio/schema";
import { evaluateModuleAtTime } from "./evaluate.ts";

describe("evaluateModuleAtTime", () => {
  it("reste cohérent après seek", () => {
    const project = createEmptyProject();
    const slides = firstModule(project).slides;
    const at0 = evaluateModuleAtTime(slides, 0);
    const atSeek = evaluateModuleAtTime(slides, 500);
    expect(at0.slideIndex).toBe(0);
    expect(atSeek.layers[0]?.opacity).toBeGreaterThan(0);
  });
});
