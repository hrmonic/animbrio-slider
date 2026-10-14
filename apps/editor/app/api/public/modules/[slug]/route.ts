import { NextResponse } from "next/server";
import { projectStore } from "@/lib/server/store";

type Params = { params: Promise<{ slug: string }> };

/** Lecture publique : uniquement la version publiée. Le brouillon n'est jamais exposé. */
export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const list = await projectStore.list();
  for (const item of list) {
    const doc = await projectStore.load(item.id);
    const published = doc?.published;
    if (!published) continue;
    const mod = published.modules.find((m) => m.slug === slug);
    if (!mod) continue;
    return NextResponse.json({
      module: mod,
      media: published.media,
      projectId: published.id,
      publishedAt: doc.revisionHistory[0]?.savedAt ?? published.updatedAt,
    });
  }
  return NextResponse.json({ error: "Module non publié" }, { status: 404 });
}
