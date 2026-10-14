import { create } from "zustand";
import { produce } from "immer";
import type { Breakpoint, Layer, MediaAsset, Project, ProjectDocument } from "@animbrio/schema";
import { createEmptyProject, firstModule, firstSlide } from "@animbrio/schema";

const MAX_HISTORY = 80;

export interface EditorState {
  document: ProjectDocument;
  activeModuleId: string;
  activeSlideId: string;
  selectedLayerIds: string[];
  playheadMs: number;
  playing: boolean;
  zoom: number;
  pan: { x: number; y: number };
  breakpoint: Breakpoint;
  snap: boolean;
  clipboard: Layer[];
  saveStatus: "idle" | "saving" | "saved" | "error";
  saveError: string | null;
  past: Project[];
  future: Project[];
}

export interface EditorActions {
  loadDocument: (doc: ProjectDocument) => void;
  setProject: (updater: (p: Project) => void) => void;
  undo: () => void;
  redo: () => void;
  selectLayers: (ids: string[], additive?: boolean) => void;
  setPlayhead: (ms: number) => void;
  setPlaying: (v: boolean) => void;
  setActiveSlide: (slideId: string) => void;
  setActiveModule: (moduleId: string) => void;
  setSaveStatus: (status: EditorState["saveStatus"], error?: string | null) => void;
  publishDraft: () => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setBreakpoint: (bp: Breakpoint) => void;
  setSnap: (v: boolean) => void;
  copySelection: () => void;
  pasteClipboard: () => void;
  restoreRevision: (revisionId: string) => void;
}

function pushHistory(state: EditorState, nextDraft: Project): Pick<EditorState, "document" | "past" | "future"> {
  const past = [...state.past, state.document.draft].slice(-MAX_HISTORY);
  return {
    document: { ...state.document, draft: nextDraft },
    past,
    future: [],
  };
}

export const useEditorStore = create<EditorState & EditorActions>((set, get) => {
  const empty = createEmptyProject();
  const initialDoc: ProjectDocument = {
    draft: empty,
    revisionHistory: [],
  };
  const module = firstModule(empty);
  const slide = firstSlide(module);

  return {
    document: initialDoc,
    activeModuleId: module.id,
    activeSlideId: slide.id,
    selectedLayerIds: [],
    playheadMs: 0,
    playing: false,
    zoom: 1,
    pan: { x: 0, y: 0 },
    breakpoint: "desktop",
    snap: true,
    clipboard: [],
    saveStatus: "idle",
    saveError: null,
    past: [],
    future: [],

    loadDocument: (doc) =>
      set({
        document: doc,
        activeModuleId: doc.draft.modules[0]?.id ?? "",
        activeSlideId: doc.draft.modules[0]?.slides[0]?.id ?? "",
        past: [],
        future: [],
        playheadMs: 0,
        playing: false,
        selectedLayerIds: [],
      }),

    setProject: (updater) =>
      set((state) => {
        const next = produce(state.document.draft, updater);
        next.updatedAt = new Date().toISOString();
        return pushHistory(state, next);
      }),

    undo: () =>
      set((state) => {
        const previous = state.past[state.past.length - 1];
        if (!previous) return state;
        return {
          ...state,
          document: { ...state.document, draft: previous },
          past: state.past.slice(0, -1),
          future: [state.document.draft, ...state.future],
        };
      }),

    redo: () =>
      set((state) => {
        const next = state.future[0];
        if (!next) return state;
        return {
          ...state,
          document: { ...state.document, draft: next },
          past: [...state.past, state.document.draft],
          future: state.future.slice(1),
        };
      }),

    selectLayers: (ids, additive = false) =>
      set((state) => ({
        selectedLayerIds: additive ? Array.from(new Set([...state.selectedLayerIds, ...ids])) : ids,
      })),
    setPlayhead: (ms) => set({ playheadMs: Math.max(0, ms) }),
    setPlaying: (v) => set({ playing: v }),
    setActiveSlide: (slideId) => set({ activeSlideId: slideId, playheadMs: 0, playing: false, selectedLayerIds: [] }),
    setActiveModule: (moduleId) => {
      const mod = get().document.draft.modules.find((m) => m.id === moduleId);
      set({
        activeModuleId: moduleId,
        activeSlideId: mod?.slides[0]?.id ?? "",
        playheadMs: 0,
        playing: false,
      });
    },
    setSaveStatus: (status, error = null) => set({ saveStatus: status, saveError: error }),
    publishDraft: () =>
      set((state) => ({
        document: {
          ...state.document,
          published: state.document.draft,
          revisionHistory: [
            {
              id: crypto.randomUUID(),
              savedAt: new Date().toISOString(),
              label: "Publication",
              snapshot: structuredClone(state.document.draft),
            },
            ...state.document.revisionHistory,
          ].slice(0, 50),
        },
      })),
    setZoom: (zoom) => set({ zoom: Math.min(4, Math.max(0.2, zoom)) }),
    setPan: (pan) => set({ pan }),
    setBreakpoint: (bp) => set({ breakpoint: bp }),
    setSnap: (v) => set({ snap: v }),
    copySelection: () => {
      const s = get();
      const mod = s.document.draft.modules.find((m) => m.id === s.activeModuleId);
      const currentSlide = mod?.slides.find((sl) => sl.id === s.activeSlideId);
      const layers = currentSlide?.layers.filter((l) => s.selectedLayerIds.includes(l.id)) ?? [];
      set({ clipboard: structuredClone(layers) });
    },
    pasteClipboard: () => {
      const s = get();
      if (s.clipboard.length === 0) return;
      s.setProject((p) => {
        const mod = p.modules.find((m) => m.id === s.activeModuleId);
        const current = mod?.slides.find((sl) => sl.id === s.activeSlideId);
        if (!current) return;
        for (const src of s.clipboard) {
          const copy = structuredClone(src);
          copy.id = crypto.randomUUID();
          copy.name = `${src.name} copie`;
          copy.zIndex = current.layers.length + 1;
          copy.box.desktop.x += 16;
          copy.box.desktop.y += 16;
          current.layers.push(copy);
        }
      });
    },
    restoreRevision: (revisionId) =>
      set((state) => {
        const rev = state.document.revisionHistory.find((r) => r.id === revisionId);
        if (!rev) return state;
        return pushHistory(state, structuredClone(rev.snapshot));
      }),
  };
});

export function getActiveModule(state: EditorState) {
  return state.document.draft.modules.find((m) => m.id === state.activeModuleId);
}

export function getActiveSlide(state: EditorState) {
  return getActiveModule(state)?.slides.find((s) => s.id === state.activeSlideId);
}

export function mediaMap(project: Project): Record<string, MediaAsset> {
  return Object.fromEntries(project.media.map((m) => [m.id, m]));
}

export * as ops from "./ops.ts";
