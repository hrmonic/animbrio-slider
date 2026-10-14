import { AnimbrioError, isRecord, type MediaAsset, type ProjectDocument } from "@animbrio/schema";
import { decodeBundle, encodeBundle } from "./bundle.ts";
import { parseStoredDocument } from "./document.ts";
import type { ProjectStore, QueryFn } from "./types.ts";

function asJsonRows(value: unknown): { json: string }[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    if (!isRecord(row) || typeof row.json !== "string") return [];
    return [{ json: row.json }];
  });
}

function asMediaRow(value: unknown): { filename: string; mime: string; bytes: Uint8Array } | null {
  if (!isRecord(value)) return null;
  if (typeof value.filename !== "string" || typeof value.mime !== "string") return null;
  if (!(value.bytes instanceof Uint8Array)) return null;
  return { filename: value.filename, mime: value.mime, bytes: value.bytes };
}

/**
 * Adaptateur SQL : injecter une fonction de requête (pg, mysql2, etc.).
 * Tables attendues : animbrio_projects(id, json), animbrio_media(project_id, id, filename, mime, bytes).
 */
export function createPostgresProjectStore(query: QueryFn): ProjectStore {
  return {
    async list() {
      const rows = asJsonRows(await query("SELECT id, json FROM animbrio_projects ORDER BY updated_at DESC"));
      return rows.map((r) => {
        const doc = parseStoredDocument(r.json);
        return {
          id: doc.draft.id,
          name: doc.draft.name,
          updatedAt: doc.draft.updatedAt,
          published: Boolean(doc.published),
        };
      });
    },
    async load(projectId) {
      const rows = asJsonRows(await query("SELECT json FROM animbrio_projects WHERE id = $1", [projectId]));
      const row = rows[0];
      if (!row) return null;
      return parseStoredDocument(row.json);
    },
    async save(document) {
      await query(
        "INSERT INTO animbrio_projects (id, json, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (id) DO UPDATE SET json = $2, updated_at = NOW()",
        [document.draft.id, JSON.stringify(document)],
      );
    },
    async delete(projectId) {
      await query("DELETE FROM animbrio_media WHERE project_id = $1", [projectId]);
      await query("DELETE FROM animbrio_projects WHERE id = $1", [projectId]);
    },
    async exportBundle(projectId) {
      const doc = await this.load(projectId);
      if (!doc) throw new AnimbrioError("PROJECT_NOT_FOUND", "Projet introuvable");
      return encodeBundle(doc, {});
    },
    async importBundle(data) {
      const bundle = decodeBundle(data);
      await this.save(bundle.document);
      return bundle.document;
    },
    async saveMedia(projectId, filename, bytes, mimeType, id = crypto.randomUUID()) {
      await query(
        "INSERT INTO animbrio_media (project_id, id, filename, mime, bytes) VALUES ($1,$2,$3,$4,$5)",
        [projectId, id, filename, mimeType, bytes],
      );
      const asset: MediaAsset = {
        id,
        filename,
        mimeType,
        url: `/api/media/${projectId}/${id}`,
        source: "upload",
      };
      return asset;
    },
    async readMedia(projectId, mediaId) {
      const raw = await query(
        "SELECT filename, mime, bytes FROM animbrio_media WHERE project_id = $1 AND id = $2",
        [projectId, mediaId],
      );
      const row = Array.isArray(raw) ? asMediaRow(raw[0]) : null;
      if (!row) return null;
      return { filename: row.filename, mimeType: row.mime, bytes: row.bytes };
    },
  };
}

export function publishedOnly(doc: ProjectDocument): ProjectDocument["published"] {
  return doc.published;
}
