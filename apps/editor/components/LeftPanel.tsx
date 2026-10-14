"use client";

import { ops, useEditorStore, getActiveModule, getActiveSlide } from "@animbrio/editor-core";
import { loadProject } from "./api";

export function LeftPanel() {
  const document = useEditorStore((s) => s.document);
  const state = useEditorStore();
  const module = getActiveModule(state);
  const slide = getActiveSlide(state);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const selectLayers = useEditorStore((s) => s.selectLayers);
  const setActiveSlide = useEditorStore((s) => s.setActiveSlide);
  const setActiveModule = useEditorStore((s) => s.setActiveModule);
  const setProject = useEditorStore((s) => s.setProject);

  return (
    <aside className="ab-left">
      <h3>Modules</h3>
      {document.draft.modules.map((m) => (
        <button
          key={m.id}
          type="button"
          className={m.id === module?.id ? "ab-item ab-item-on" : "ab-item"}
          onClick={() => setActiveModule(m.id)}
        >
          {m.name}
        </button>
      ))}
      <h3>Slides</h3>
      {module?.slides.map((s, i) => (
        <div key={s.id} className="ab-row">
          <button
            type="button"
            className={s.id === slide?.id ? "ab-item ab-item-on" : "ab-item"}
            onClick={() => setActiveSlide(s.id)}
          >
            {s.name}
          </button>
          <button
            type="button"
            title="Monter"
            onClick={() => {
              if (!module) return;
              const moduleId = module.id;
              setProject((p) => {
                ops.reorderSlides(p, moduleId, i, Math.max(0, i - 1));
              });
            }}
          >
            ↑
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          if (!module) return;
          const moduleId = module.id;
          setProject((p) => {
            const created = ops.addSlide(p, moduleId);
            setActiveSlide(created.id);
          });
        }}
      >
        + Slide
      </button>
      <h3>Calques</h3>
      {slide?.layers.map((l) => (
        <button
          key={l.id}
          type="button"
          className={selectedLayerIds.includes(l.id) ? "ab-item ab-item-on" : "ab-item"}
          onClick={(e) => selectLayers([l.id], e.shiftKey || e.ctrlKey || e.metaKey)}
        >
          {l.hiddenInEditor ? "◌ " : ""}
          {l.locked ? "🔒 " : ""}
          {l.name} <span className="ab-muted">({l.type})</span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => {
          if (!module || !slide) return;
          const moduleId = module.id;
          const slideId = slide.id;
          setProject((p) => {
            const layer = ops.addTextLayer(p, moduleId, slideId);
            selectLayers([layer.id]);
          });
        }}
      >
        + Texte
      </button>
      <h3>Médias</h3>
      {document.draft.media.map((m) => (
        <div key={m.id} className="ab-muted" style={{ fontSize: 12, marginBottom: 4 }}>
          {m.filename}
        </div>
      ))}
      <label className="ab-file">
        Téléverser
        <input
          type="file"
          accept="image/*,video/mp4,video/webm,.json"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const form = new FormData();
            form.append("file", file);
            const key = process.env.NEXT_PUBLIC_ANIMBRIO_API_KEY;
            await fetch(`/api/media/${document.draft.id}`, {
              method: "POST",
              headers: key ? { "x-animbrio-key": key } : undefined,
              body: form,
            });
            useEditorStore.getState().loadDocument(await loadProject(document.draft.id));
          }}
        />
      </label>
    </aside>
  );
}
