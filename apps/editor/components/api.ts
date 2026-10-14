import {
  createProjectBodySchema,
  projectListResponseSchema,
  projectResponseSchema,
  type ProjectDocument,
  type ProjectListResponse,
} from "@animbrio/schema";
import { readJson } from "@/lib/http";

export const apiHeaders = (): HeadersInit => {
  const key = process.env.NEXT_PUBLIC_ANIMBRIO_API_KEY;
  return key ? { "x-animbrio-key": key, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
};

export async function listProjects(): Promise<ProjectListResponse> {
  const res = await fetch("/api/projects", { headers: apiHeaders() });
  return readJson(res, projectListResponseSchema);
}

export async function loadProject(id: string): Promise<ProjectDocument> {
  const res = await fetch(`/api/projects/${id}`, { headers: apiHeaders() });
  const data = await readJson(res, projectResponseSchema);
  return data.project;
}

export async function createProject(name: string): Promise<ProjectDocument> {
  const body = createProjectBodySchema.parse({ name });
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: apiHeaders(),
    body: JSON.stringify(body),
  });
  const data = await readJson(res, projectResponseSchema);
  return data.project;
}

export async function saveProject(document: ProjectDocument): Promise<void> {
  const res = await fetch(`/api/projects/${document.draft.id}`, {
    method: "PUT",
    headers: apiHeaders(),
    body: JSON.stringify(document),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
}

export async function importProjectBundle(buffer: ArrayBuffer): Promise<ProjectDocument> {
  const res = await fetch("/api/projects/import", { method: "POST", body: buffer });
  const data = await readJson(res, projectResponseSchema);
  return data.project;
}
