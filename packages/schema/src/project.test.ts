import { describe, expect, it } from "vitest";
import { createEmptyProject } from "./factories.ts";
import { firstModule, firstSlide } from "./access.ts";
import { projectSchema } from "./project.ts";

describe("project schema", () => {
  it("valide un projet vide généré", () => {
    const p = createEmptyProject();
    expect(projectSchema.safeParse(p).success).toBe(true);
    expect(firstSlide(firstModule(p)).layers).toHaveLength(1);
  });
});
