import { NextResponse } from "next/server";
import { catchHttp, jsonError, requireEditor } from "@/lib/server/http";
import { projectStore } from "@/lib/server/store";

type Params = { params: Promise<{ projectId: string }> };

const MAX_BYTES = 12 * 1024 * 1024;

export async function POST(request: Request, { params }: Params) {
  const denied = requireEditor(request);
  if (denied) return denied;
  const { projectId } = await params;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return jsonError("Fichier manquant", 400);
  }
  if (file.size > MAX_BYTES) {
    return jsonError("Fichier trop volumineux (max 12 Mo)", 400);
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    const asset = await projectStore.saveMedia(projectId, file.name, bytes, file.type || "application/octet-stream");
    const doc = await projectStore.load(projectId);
    if (doc) {
      doc.draft.media.push(asset);
      doc.draft.updatedAt = new Date().toISOString();
      await projectStore.save(doc);
    }
    return NextResponse.json({ media: asset });
  } catch (e) {
    return catchHttp(e, "Upload refusé");
  }
}
