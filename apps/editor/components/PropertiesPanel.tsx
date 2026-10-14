"use client";

import { getActiveModule, getActiveSlide, ops, useEditorStore } from "@animbrio/editor-core";
import { isTextLike } from "@animbrio/schema";

export function PropertiesPanel() {
  const state = useEditorStore();
  const module = getActiveModule(state);
  const slide = getActiveSlide(state);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const setProject = useEditorStore((s) => s.setProject);
  const document = useEditorStore((s) => s.document);
  const restoreRevision = useEditorStore((s) => s.restoreRevision);
  const layer = slide?.layers.find((l) => selectedLayerIds.includes(l.id));
  const missing = document.draft.media.filter((m) => !m.url);

  const patchSelected = (updater: Parameters<typeof ops.mutateLayer>[4]) => {
    if (!module || !slide || !layer) return;
    setProject((p) => ops.mutateLayer(p, module.id, slide.id, layer.id, updater));
  };

  return (
    <aside className="ab-right">
      <h3>Propriétés</h3>
      {selectedLayerIds.length > 1 && module && slide ? (
        <div>
          <p className="ab-muted">{selectedLayerIds.length} calques</p>
          <button type="button" onClick={() => setProject((p) => ops.alignLayers(p, module.id, slide.id, selectedLayerIds, "left"))}>
            Aligner gauche
          </button>
          <button type="button" onClick={() => setProject((p) => ops.alignLayers(p, module.id, slide.id, selectedLayerIds, "center"))}>
            Aligner centre
          </button>
          <button type="button" onClick={() => setProject((p) => ops.groupLayers(p, module.id, slide.id, selectedLayerIds))}>
            Grouper
          </button>
        </div>
      ) : null}
      {layer && isTextLike(layer) ? (
        <>
          <label>Texte</label>
          <textarea
            value={layer.content}
            rows={3}
            onChange={(e) => {
              const value = e.target.value;
              patchSelected((l) => ops.setTextContent(l, value));
            }}
          />
          <label>Taille</label>
          <input
            type="number"
            value={layer.typography.fontSize}
            onChange={(e) => {
              const value = Number(e.target.value);
              patchSelected((l) => ops.setFontSize(l, value));
            }}
          />
        </>
      ) : layer ? (
        <p className="ab-muted">
          {layer.name} ({layer.type})
        </p>
      ) : (
        <p className="ab-muted">Sélectionnez un calque.</p>
      )}
      {layer ? (
        <>
          <label>
            <input
              type="checkbox"
              checked={layer.locked}
              onChange={(e) => {
                const checked = e.target.checked;
                patchSelected((l) => {
                  l.locked = checked;
                });
              }}
            />{" "}
            Verrouillé
          </label>
          <label>
            <input
              type="checkbox"
              checked={layer.hiddenInEditor}
              onChange={(e) => {
                const checked = e.target.checked;
                patchSelected((l) => {
                  l.hiddenInEditor = checked;
                });
              }}
            />{" "}
            Masqué éditeur
          </label>
          <label>
            <input
              type="checkbox"
              checked={layer.hiddenInOutput}
              onChange={(e) => {
                const checked = e.target.checked;
                patchSelected((l) => {
                  l.hiddenInOutput = checked;
                });
              }}
            />{" "}
            Masqué publié
          </label>
          {layer.type === "group" && module && slide ? (
            <button type="button" onClick={() => setProject((p) => ops.ungroup(p, module.id, slide.id, layer.id))}>
              Dégrouper
            </button>
          ) : null}
        </>
      ) : null}
      {missing.length > 0 ? (
        <p className="ab-danger">Médias manquants : {missing.map((m) => m.filename).join(", ")}</p>
      ) : null}
      <h3>Historique</h3>
      {document.revisionHistory.slice(0, 8).map((r) => (
        <button key={r.id} type="button" className="ab-item" onClick={() => restoreRevision(r.id)}>
          {r.label ?? "Version"} — {r.savedAt.slice(0, 16)}
        </button>
      ))}
    </aside>
  );
}
