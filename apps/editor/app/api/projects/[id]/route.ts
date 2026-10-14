import { NextResponse } from "next/server";
import { projectDocumentSchema } from "@animbrio/schema";
import { jsonError, requireEditor } from "@/lib/server/http";
import { projectStore } from "@/lib/server/store";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const denied = requireEditor(request);
  if (denied) return denied;
  const { id } = await params;
  const doc = await projectStore.load(id);
  if (!doc) return jsonError("Introuvable", 404);
  return NextResponse.json({ project: doc });
}

export async function PUT(request: Request, { params }: Params) {
  const denied = requireEditor(request);
  if (denied) return denied;
  const { id } = await params;
  const doc = projectDocumentSchema.parse(await request.json());
  if (doc.draft.id !== id) {
    return jsonError("ID projet incohérent", 400);
  }
  await projectStore.save(doc);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Params) {
  const denied = requireEditor(request);
  if (denied) return denied;
  const { id } = await params;
  await projectStore.delete(id);
  return NextResponse.json({ ok: true });
}
