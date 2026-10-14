import { z } from "zod";
import { mediaAssetSchema, moduleSchema, projectDocumentSchema } from "./project.ts";

export const errorResponseSchema = z.object({
  error: z.string(),
});

export const projectListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  updatedAt: z.string().optional(),
  published: z.boolean().optional(),
});

export const projectListResponseSchema = z.object({
  projects: z.array(projectListItemSchema),
});

export const projectResponseSchema = z.object({
  project: projectDocumentSchema,
});

export const createProjectBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
});

export const importReportEntrySchema = z.object({
  level: z.enum(["converted", "adapted", "unsupported", "missing"]),
  message: z.string(),
  source: z.string().optional(),
});

export const importReportSchema = z.object({
  sourceAlias: z.string(),
  entries: z.array(importReportEntrySchema),
  warnings: z.array(z.string()),
});

export const publicModuleResponseSchema = z.object({
  module: moduleSchema,
  media: z.array(mediaAssetSchema),
  projectId: z.string().optional(),
  publishedAt: z.string().optional(),
  error: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type ProjectListResponse = z.infer<typeof projectListResponseSchema>;
export type ProjectResponse = z.infer<typeof projectResponseSchema>;
export type CreateProjectBody = z.infer<typeof createProjectBodySchema>;
export type PublicModuleResponse = z.infer<typeof publicModuleResponseSchema>;
