"use client";

import { useEffect, useState } from "react";
import { ModulePlayer } from "@animbrio/renderer";
import { firstModule, projectResponseSchema, type MediaAsset, type Module } from "@animbrio/schema";
import { errorMessage, readJson } from "@/lib/http";

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<{ module: Module; media: MediaAsset[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { id } = await params;
      try {
        const res = await fetch(`/api/projects/${id}`);
        const json = await readJson(res, projectResponseSchema);
        const src = json.project.published ?? json.project.draft;
        setData({ module: firstModule(src), media: src.media });
      } catch (e) {
        setError(errorMessage(e, "Projet introuvable"));
      }
    })();
  }, [params]);

  if (error) return <p>{error}</p>;
  if (!data) return <p>Chargement…</p>;
  const mediaById = Object.fromEntries(data.media.map((m) => [m.id, m]));
  return (
    <div style={{ padding: 24, background: "#111", minHeight: "100vh" }}>
      <ModulePlayer module={data.module} mediaById={mediaById} playing loop />
    </div>
  );
}
