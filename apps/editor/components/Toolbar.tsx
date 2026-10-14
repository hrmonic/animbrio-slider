"use client";

import { breakpointSchema } from "@animbrio/schema";
import { useEditorStore } from "@animbrio/editor-core";
import { createProject, importProjectBundle } from "./api";
import { errorMessage } from "@/lib/http";

export function Toolbar({
  projectList,
  onLoad,
  onSave,
  onRefresh,
}: {
  projectList: { id: string; name: string }[];
  onLoad: (id: string) => void;
  onSave: () => void;
  onRefresh: () => Promise<void>;
}) {
  const document = useEditorStore((s) => s.document);
  const loadDocument = useEditorStore((s) => s.loadDocument);
  const playing = useEditorStore((s) => s.playing);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const saveError = useEditorStore((s) => s.saveError);
  const publishDraft = useEditorStore((s) => s.publishDraft);
  const breakpoint = useEditorStore((s) => s.breakpoint);
  const setBreakpoint = useEditorStore((s) => s.setBreakpoint);
  const snap = useEditorStore((s) => s.snap);
  const setSnap = useEditorStore((s) => s.setSnap);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  return (
    <header className="ab-toolbar">
      <strong>Animbrio Slider</strong>
      <span className="ab-muted">{document.draft.name}</span>
      <button type="button" onClick={onSave}>
        Sauvegarder
      </button>
      <button
        type="button"
        onClick={() => {
          publishDraft();
          onSave();
        }}
      >
        Publier
      </button>
      <button type="button" onClick={() => setPlaying(!playing)}>
        {playing ? "Pause" : "Lecture"}
      </button>
      <button type="button" onClick={undo}>
        Annuler
      </button>
      <button type="button" onClick={redo}>
        Rétablir
      </button>
      <select
        value={breakpoint}
        onChange={(e) => {
          const parsed = breakpointSchema.safeParse(e.target.value);
          if (parsed.success) setBreakpoint(parsed.data);
        }}
      >
        <option value="desktop">Desktop</option>
        <option value="notebook">Notebook</option>
        <option value="tablet">Tablette</option>
        <option value="mobile">Mobile</option>
      </select>
      <label className="ab-muted">
        <input type="checkbox" checked={snap} onChange={(e) => setSnap(e.target.checked)} /> Snap
      </label>
      <span className={saveStatus === "error" ? "ab-danger" : "ab-muted"}>
        {saveStatus === "saving" && "Enregistrement…"}
        {saveStatus === "saved" && "Enregistré"}
        {saveStatus === "error" && (saveError ?? "Erreur")}
      </span>
      <select value={document.draft.id} onChange={(e) => onLoad(e.target.value)} style={{ marginLeft: "auto" }}>
        {projectList.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={async () => {
          const project = await createProject(`Projet ${projectList.length + 1}`);
          loadDocument(project);
          await onRefresh();
        }}
      >
        Nouveau
      </button>
      <a href={`/api/projects/${document.draft.id}/export`} download>
        Export
      </a>
      <label className="ab-file">
        Import
        <input
          type="file"
          accept=".json,.animbrio.json"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const project = await importProjectBundle(await file.arrayBuffer());
              loadDocument(project);
              await onRefresh();
            } catch (err) {
              console.error(errorMessage(err, "Import invalide"));
            }
          }}
        />
      </label>
    </header>
  );
}
