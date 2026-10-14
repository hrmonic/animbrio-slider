"use client";

import { useCallback, useEffect, useState } from "react";
import { ops, useEditorStore } from "@animbrio/editor-core";
import { errorMessage } from "@/lib/http";
import { listProjects, loadProject, saveProject } from "./api";
import { LeftPanel } from "./LeftPanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { SceneCanvas } from "./SceneCanvas";
import { TimelinePanel } from "./TimelinePanel";
import { Toolbar } from "./Toolbar";

export function EditorShell({ initialProjectId }: { initialProjectId?: string }) {
  const document = useEditorStore((s) => s.document);
  const loadDocument = useEditorStore((s) => s.loadDocument);
  const setProject = useEditorStore((s) => s.setProject);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus);
  const copySelection = useEditorStore((s) => s.copySelection);
  const pasteClipboard = useEditorStore((s) => s.pasteClipboard);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const activeModuleId = useEditorStore((s) => s.activeModuleId);
  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const [projectList, setProjectList] = useState<{ id: string; name: string }[]>([]);

  const refreshList = useCallback(async () => {
    try {
      const data = await listProjects();
      setProjectList(data.projects);
    } catch {
      /* liste indisponible (auth) */
    }
  }, []);

  const loadById = useCallback(
    async (id: string) => {
      try {
        loadDocument(await loadProject(id));
      } catch {
        /* projet introuvable */
      }
    },
    [loadDocument],
  );

  const save = useCallback(async () => {
    setSaveStatus("saving");
    try {
      await saveProject(document);
      setSaveStatus("saved");
      await refreshList();
    } catch (e) {
      setSaveStatus("error", errorMessage(e));
    }
  }, [document, refreshList, setSaveStatus]);

  useEffect(() => {
    void refreshList();
  }, [refreshList]);

  useEffect(() => {
    if (initialProjectId) void loadById(initialProjectId);
    else if (projectList[0] && projectList[0].id !== document.draft.id) void loadById(projectList[0].id);
  }, [initialProjectId, projectList, loadById, document.draft.id]);

  useEffect(() => {
    const t = setInterval(() => {
      void save();
    }, 30000);
    return () => clearInterval(t);
  }, [save]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        void save();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "c") copySelection();
      if ((e.ctrlKey || e.metaKey) && e.key === "v") pasteClipboard();
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        setProject((p) => ops.duplicateLayers(p, activeModuleId, activeSlideId, selectedLayerIds));
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        const target = e.target;
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
        setProject((p) => ops.deleteLayers(p, activeModuleId, activeSlideId, selectedLayerIds));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, save, copySelection, pasteClipboard, setProject, activeModuleId, activeSlideId, selectedLayerIds]);

  return (
    <div className="ab-shell">
      <Toolbar projectList={projectList} onLoad={loadById} onSave={() => void save()} onRefresh={refreshList} />
      <div className="ab-body">
        <LeftPanel />
        <main className="ab-main">
          <SceneCanvas />
          <TimelinePanel />
        </main>
        <PropertiesPanel />
      </div>
    </div>
  );
}
