import {
  AnimbrioError,
  isRecord,
  migrateProject,
  parseJsonUnknown,
  projectDocumentSchema,
  type MediaAsset,
  type ProjectDocument,
} from "@animbrio/schema";

export const BUNDLE_KIND = "animbrio-bundle" as const;

export interface ProjectBundle {
  kind: typeof BUNDLE_KIND;
  version: 1;
  document: ProjectDocument;
  files: Record<string, { filename: string; mimeType: string; base64: string }>;
}

function parseBundleFiles(value: unknown): ProjectBundle["files"] {
  if (!isRecord(value)) return {};
  const files: ProjectBundle["files"] = {};
  for (const [id, entry] of Object.entries(value)) {
    if (!isRecord(entry)) continue;
    const filename = typeof entry.filename === "string" ? entry.filename : "";
    const mimeType = typeof entry.mimeType === "string" ? entry.mimeType : "application/octet-stream";
    const base64 = typeof entry.base64 === "string" ? entry.base64 : "";
    if (filename && base64) files[id] = { filename, mimeType, base64 };
  }
  return files;
}

export function encodeBundle(document: ProjectDocument, files: ProjectBundle["files"]): Uint8Array {
  const bundle: ProjectBundle = { kind: BUNDLE_KIND, version: 1, document, files };
  return new TextEncoder().encode(JSON.stringify(bundle));
}

export function decodeBundle(data: Uint8Array): ProjectBundle {
  const parsed = parseJsonUnknown(new TextDecoder().decode(data));
  if (!isRecord(parsed)) {
    throw new AnimbrioError("INVALID_DOCUMENT", "Bundle JSON invalide");
  }
  if (parsed.kind === BUNDLE_KIND && isRecord(parsed.document)) {
    return {
      kind: BUNDLE_KIND,
      version: 1,
      document: projectDocumentSchema.parse({
        ...parsed.document,
        draft: migrateProject(parsed.document.draft),
      }),
      files: parseBundleFiles(parsed.files),
    };
  }
  const doc = projectDocumentSchema.parse({
    ...parsed,
    draft: migrateProject(parsed.draft),
  });
  return { kind: BUNDLE_KIND, version: 1, document: doc, files: {} };
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

export function detectMissingMedia(media: MediaAsset[], existingIds: Set<string>): MediaAsset[] {
  return media.filter((m) => !existingIds.has(m.id) && m.source !== "external");
}
