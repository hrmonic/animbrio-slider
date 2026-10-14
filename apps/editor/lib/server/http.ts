import { NextResponse } from "next/server";
import { errorMessage } from "../http";
import { assertApiAuth } from "./store";

export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function requireEditor(request: Request): NextResponse | null {
  if (!assertApiAuth(request)) return jsonError("Non autorisé", 401);
  return null;
}

export function catchHttp(e: unknown, fallback: string, status = 400): NextResponse {
  return jsonError(errorMessage(e, fallback), status);
}
