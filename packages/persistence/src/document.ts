import {
  AnimbrioError,
  isRecord,
  migrateProject,
  parseJsonUnknown,
  projectDocumentSchema,
  type ProjectDocument,
} from "@animbrio/schema";

export function parseStoredDocument(raw: string): ProjectDocument {
  const parsed = parseJsonUnknown(raw);
  if (!isRecord(parsed)) {
    throw new AnimbrioError("INVALID_DOCUMENT", "JSON projet invalide");
  }
  return projectDocumentSchema.parse({
    ...parsed,
    draft: migrateProject(parsed.draft),
  });
}

const MIME_BY_EXT = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
  json: "application/json",
} as const;

function isMimeExt(ext: string): ext is keyof typeof MIME_BY_EXT {
  return Object.prototype.hasOwnProperty.call(MIME_BY_EXT, ext);
}

export function mimeFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) return "application/octet-stream";
  if (ext === "jpg") return MIME_BY_EXT.jpeg;
  return isMimeExt(ext) ? MIME_BY_EXT[ext] : "application/octet-stream";
}

export const ALLOWED_MIME = new Set<string>([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "application/json",
]);
