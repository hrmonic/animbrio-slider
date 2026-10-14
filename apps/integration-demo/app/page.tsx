"use client";

import { useEffect, useState } from "react";
import {
  createEmptyProject,
  firstModule,
  publicModuleResponseSchema,
  type MediaAsset,
  type Module,
} from "@animbrio/schema";
import { ModulePlayer } from "@animbrio/renderer";

const fallback = createEmptyProject("Integration demo");

export default function DemoPage() {
  const [mod, setMod] = useState<Module>(firstModule(fallback));
  const [media, setMedia] = useState<Record<string, MediaAsset>>({});
  const [source, setSource] = useState("local-demo");

  useEffect(() => {
    const slug = process.env.NEXT_PUBLIC_ANIMBRIO_MODULE_SLUG?.trim();
    if (!slug) return;
    const base = process.env.NEXT_PUBLIC_ANIMBRIO_API ?? "http://localhost:3840";
    void fetch(`${base}/api/public/modules/${encodeURIComponent(slug)}`)
      .then(async (r) => (r.ok ? publicModuleResponseSchema.parse(await r.json()) : null))
      .then((json) => {
        if (!json?.module) return;
        setMod(json.module);
        setMedia(Object.fromEntries(json.media.map((m) => [m.id, m])));
        setSource(`published:${slug}`);
      })
      .catch(() => undefined);
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", background: "#111", minHeight: "100vh", color: "#eee" }}>
      <h1>Animbrio Slider — Next.js integration</h1>
      <p style={{ color: "#aaa" }}>
        Standalone player (no editor chrome). Source: {source}. Set <code>NEXT_PUBLIC_ANIMBRIO_MODULE_SLUG</code> to load a
        published module from the editor API.
      </p>
      <div style={{ maxWidth: 1100, margin: "24px auto" }}>
        <ModulePlayer module={mod} mediaById={media} playing loop />
      </div>
    </main>
  );
}
