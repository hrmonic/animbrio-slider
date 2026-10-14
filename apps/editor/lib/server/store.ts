import path from "path";
import { createFileProjectStore } from "@animbrio/persistence";
import { assertRole } from "./auth";

const dataDir = process.env.ANIMBRIO_DATA_DIR ?? path.join(process.cwd(), "../../data");

export const projectStore = createFileProjectStore(dataDir);

export function assertApiAuth(request: Request): boolean {
  return assertRole(request, ["editor", "publisher"]);
}

export function assertPublishAuth(request: Request): boolean {
  return assertRole(request, ["publisher", "editor"]);
}
