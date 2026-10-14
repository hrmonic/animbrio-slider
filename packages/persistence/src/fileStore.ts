import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  AnimbrioError,
  isRecord,
  projectDocumentSchema,
  type MediaAsset,
  type ProjectDocument,
} from "@animbrio/schema";
import { base64ToBytes, bytesToBase64, decodeBundle, encodeBundle } from "./bundle.ts";
import { ALLOWED_MIME, mimeFromFilename, parseStoredDocument } from "./document.ts";
import type { ProjectListItem, ProjectStore } from "./types.ts";

function isErrno(e: unknown): e is { code: string } {
  return isRecord(e) && typeof e.code === "string";
}

export function createFileProjectStore(dataDir: string): ProjectStore {
  const projectsDir = path.join(dataDir, "projects");
  const mediaRoot = path.join(dataDir, "media");

  async function ensure(): Promise<void> {
    await mkdir(projectsDir, { recursive: true });
    await mkdir(mediaRoot, { recursive: true });
  }

  function mediaDir(projectId: string): string {
    return path.join(mediaRoot, projectId);
  }

  return {
    async list(): Promise<ProjectListItem[]> {
      await ensure();
      const files = await readdir(projectsDir);
      const items: ProjectListItem[] = [];
      for (const f of files) {
        if (!f.endsWith(".json")) continue;
        const raw = await readFile(path.join(projectsDir, f), "utf8");
        const doc = parseStoredDocument(raw);
        items.push({
          id: doc.draft.id,
          name: doc.draft.name,
          updatedAt: doc.draft.updatedAt,
          published: Boolean(doc.published),
        });
      }
      return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    async load(projectId: string) {
      await ensure();
      const file = path.join(projectsDir, `${projectId}.json`);
      try {
        const raw = await readFile(file, "utf8");
        return parseStoredDocument(raw);
      } catch (e) {
        if (isErrno(e) && e.code === "ENOENT") return null;
        throw e;
      }
    },

    async save(document: ProjectDocument) {
      await ensure();
      const validated = projectDocumentSchema.parse(document);
      const file = path.join(projectsDir, `${validated.draft.id}.json`);
      await writeFile(file, JSON.stringify(validated, null, 2), "utf8");
    },

    async delete(projectId: string) {
      await ensure();
      await rm(path.join(projectsDir, `${projectId}.json`), { force: true });
      await rm(mediaDir(projectId), { recursive: true, force: true });
    },

    async exportBundle(projectId: string) {
      const doc = await this.load(projectId);
      if (!doc) throw new AnimbrioError("PROJECT_NOT_FOUND", "Projet introuvable");
      const files: Record<string, { filename: string; mimeType: string; base64: string }> = {};
      for (const asset of doc.draft.media) {
        const stored = await this.readMedia(projectId, asset.id);
        if (!stored) continue;
        files[asset.id] = {
          filename: stored.filename,
          mimeType: stored.mimeType,
          base64: bytesToBase64(stored.bytes),
        };
      }
      return encodeBundle(doc, files);
    },

    async importBundle(data: Uint8Array) {
      const bundle = decodeBundle(data);
      await this.save(bundle.document);
      const projectId = bundle.document.draft.id;
      await mkdir(mediaDir(projectId), { recursive: true });
      for (const [id, file] of Object.entries(bundle.files)) {
        const bytes = base64ToBytes(file.base64);
        await this.saveMedia(projectId, file.filename, bytes, file.mimeType, id);
      }
      return bundle.document;
    },

    async saveMedia(projectId: string, filename: string, bytes: Uint8Array, mimeType: string, id = crypto.randomUUID()) {
      if (!ALLOWED_MIME.has(mimeType)) {
        throw new AnimbrioError("UNSUPPORTED_MEDIA", `Format non pris en charge: ${mimeType}`);
      }
      await ensure();
      const dir = mediaDir(projectId);
      await mkdir(dir, { recursive: true });
      const safe = filename.replace(/[^\w.\-]+/g, "_");
      const storedName = `${id}-${safe}`;
      await writeFile(path.join(dir, storedName), bytes);
      const asset: MediaAsset = {
        id,
        filename: safe,
        mimeType,
        url: `/api/media/${projectId}/${id}`,
        source: "upload",
      };
      return asset;
    },

    async readMedia(projectId: string, mediaId: string) {
      await ensure();
      const dir = mediaDir(projectId);
      try {
        const names = await readdir(dir);
        const name = names.find((n) => n.startsWith(`${mediaId}-`));
        if (!name) return null;
        const bytes = new Uint8Array(await readFile(path.join(dir, name)));
        const filename = name.slice(mediaId.length + 1);
        return { bytes, mimeType: mimeFromFilename(filename), filename };
      } catch (e) {
        if (isErrno(e) && e.code === "ENOENT") return null;
        throw e;
      }
    },
  };
}
