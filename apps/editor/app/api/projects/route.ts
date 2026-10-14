import { NextResponse } from "next/server";
import { createEmptyProject, createProjectBodySchema, projectDocumentSchema } from "@animbrio/schema";
import { catchHttp, requireEditor } from "@/lib/server/http";
import { projectStore } from "@/lib/server/store";

export async function GET(request: Request) {
  const denied = requireEditor(request);
  if (denied) return denied;
  const list = await projectStore.list();
  return NextResponse.json({ projects: list });
}

export async function POST(request: Request) {
  const denied = requireEditor(request);
  if (denied) return denied;
  try {
    const body = createProjectBodySchema.parse(await request.json().catch(() => ({})));
    const draft = createEmptyProject(body.name ?? "Nouveau projet");
    const doc = projectDocumentSchema.parse({ draft, revisionHistory: [] });
    await projectStore.save(doc);
    return NextResponse.json({ project: doc });
  } catch (e) {
    return catchHttp(e, "Requête invalide");
  }
}
