import { NextResponse } from "next/server";
import { projectStore } from "@/lib/server/store";

type Params = { params: Promise<{ projectId: string; mediaId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { projectId, mediaId } = await params;
  const stored = await projectStore.readMedia(projectId, mediaId);
  if (!stored) return NextResponse.json({ error: "Média introuvable" }, { status: 404 });
  return new NextResponse(Buffer.from(stored.bytes), {
    headers: {
      "Content-Type": stored.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
