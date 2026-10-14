import { describe, expect, it } from "vitest";
import { parallaxOffset, scrollTimeMs } from "./parallax.ts";

describe("parallax", () => {
  it("scale avec la profondeur", () => {
    const a = parallaxOffset(2, { x: 1, y: 0 });
    const b = parallaxOffset(4, { x: 1, y: 0 });
    expect(b.x).toBe(a.x * 2);
  });

  it("mappe le scroll sur la durée", () => {
    expect(scrollTimeMs(50, 0, 100, 4000)).toBe(2000);
  });
});
