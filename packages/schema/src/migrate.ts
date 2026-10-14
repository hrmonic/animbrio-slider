import { AnimbrioError } from "./errors.ts";
import { isRecord } from "./json.ts";
import type { Project } from "./project.ts";
import { projectSchema, SCHEMA_VERSION } from "./project.ts";

/** Migre un document vers la version courante du schéma. */
export function migrateProject(input: unknown): Project {
  if (!isRecord(input)) {
    throw new AnimbrioError("INVALID_PROJECT", "Projet JSON invalide");
  }
  const version = typeof input.schemaVersion === "number" ? input.schemaVersion : 0;
  if (version === SCHEMA_VERSION) {
    return projectSchema.parse(input);
  }
  if (version === 0) {
    return projectSchema.parse({ ...input, schemaVersion: SCHEMA_VERSION });
  }
  throw new AnimbrioError("UNSUPPORTED_SCHEMA", `Version de schéma non supportée: ${String(version)}`);
}
