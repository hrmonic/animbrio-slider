import { NextResponse } from "next/server";
import { catchHttp, requireEditor } from "@/lib/server/http";
import { projectStore } from "@/lib/server/store";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const denied = requireEditor(request);
  if (denied) return denied;
  const { id } = await params;
  try {
    const bytes = await projectStore.exportBundle(id);
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${id}.animbrio.json"`,
      },
    });
  } catch (e) {
    return catchHttp(e, "Export impossible", 404);
  }
}
