import type { MediaAsset, Project, ProjectDocument } from "@animbrio/schema";

export interface ProjectListItem {
  id: string;
  name: string;
  updatedAt: string;
  published: boolean;
}

export interface ProjectStore {
  list(): Promise<ProjectListItem[]>;
  load(projectId: string): Promise<ProjectDocument | null>;
  save(document: ProjectDocument): Promise<void>;
  delete(projectId: string): Promise<void>;
  exportBundle(projectId: string): Promise<Uint8Array>;
  importBundle(data: Uint8Array): Promise<ProjectDocument>;
  saveMedia(
    projectId: string,
    filename: string,
    bytes: Uint8Array,
    mimeType: string,
    id?: string,
  ): Promise<MediaAsset>;
  readMedia(projectId: string, mediaId: string): Promise<{ bytes: Uint8Array; mimeType: string; filename: string } | null>;
}

export type QueryFn = (sql: string, params?: unknown[]) => Promise<unknown>;

export type { Project, ProjectDocument, MediaAsset };
