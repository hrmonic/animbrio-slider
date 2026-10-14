import { NextResponse } from "next/server";
import { catchHttp, requireEditor } from "@/lib/server/http";
import { projectStore } from "@/lib/server/store";

export async function POST(request: Request) {
  const denied = requireEditor(request);
  if (denied) return denied;
  try {
    const doc = await projectStore.importBundle(new Uint8Array(await request.arrayBuffer()));
    return NextResponse.json({ project: doc });
  } catch (e) {
    return catchHttp(e, "Import invalide");
  }
}
