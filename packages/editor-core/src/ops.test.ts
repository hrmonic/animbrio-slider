import { describe, expect, it } from "vitest";
import { createEmptyProject, firstModule, firstSlide } from "@animbrio/schema";
import { addTextLayer, alignLayers, duplicateLayers, moveLayer } from "./ops.ts";

describe("editor ops", () => {
  it("ajoute et déplace un calque", () => {
    const p = createEmptyProject();
    const mod = firstModule(p);
    const slide = firstSlide(mod);
    const layer = addTextLayer(p, mod.id, slide.id);
    const x = layer.box.desktop.x;
    moveLayer(p, mod.id, slide.id, layer.id, 10, 0);
    expect(layer.box.desktop.x).toBe(x + 10);
  });

  it("duplique sans muter la source id", () => {
    const p = createEmptyProject();
    const mod = firstModule(p);
    const slide = firstSlide(mod);
    const sourceId = slide.layers[0]?.id;
    if (!sourceId) throw new Error("Calque source manquant");
    const ids = duplicateLayers(p, mod.id, slide.id, [sourceId]);
    expect(ids).toHaveLength(1);
    expect(slide.layers).toHaveLength(2);
    expect(ids[0]).not.toBe(sourceId);
  });

  it("aligne à gauche", () => {
    const p = createEmptyProject();
    const mod = firstModule(p);
    const slide = firstSlide(mod);
    const a = addTextLayer(p, mod.id, slide.id);
    const b = addTextLayer(p, mod.id, slide.id);
    a.box.desktop.x = 40;
    b.box.desktop.x = 120;
    alignLayers(p, mod.id, slide.id, [a.id, b.id], "left");
    expect(a.box.desktop.x).toBe(40);
    expect(b.box.desktop.x).toBe(40);
  });
});
