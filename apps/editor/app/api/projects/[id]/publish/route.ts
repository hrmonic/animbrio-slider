import { NextResponse } from "next/server";
import { assertApiAuth, projectStore } from "@/lib/server/store";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  if (!assertApiAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  const doc = await projectStore.load(id);
  if (!doc) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  const published = {
    ...doc,
    published: doc.draft,
    revisionHistory: [
      {
        id: crypto.randomUUID(),
        savedAt: new Date().toISOString(),
        label: "Publication API",
        snapshot: doc.draft,
      },
      ...doc.revisionHistory,
    ].slice(0, 50),
  };
  await projectStore.save(published);
  return NextResponse.json({ publishedAt: published.revisionHistory[0]?.savedAt });
}
