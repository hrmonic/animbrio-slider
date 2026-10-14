import { AnimbrioError, errorResponseSchema } from "@animbrio/schema";

interface Parseable<T> {
  parse: (data: unknown) => T;
}

export async function readJson<T>(res: Response, schema: Parseable<T>): Promise<T> {
  const json: unknown = await res.json();
  if (!res.ok) {
    const err = errorResponseSchema.safeParse(json);
    throw new AnimbrioError("HTTP_ERROR", err.success ? err.data.error : `HTTP ${res.status}`);
  }
  return schema.parse(json);
}

export function errorMessage(e: unknown, fallback = "Erreur"): string {
  if (e instanceof Error) return e.message;
  return fallback;
}
