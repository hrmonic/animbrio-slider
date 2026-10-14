"use client";

import { useRef } from "react";
import { ModulePlayer } from "@animbrio/renderer";
import { getActiveModule, getActiveSlide, mediaMap, ops, useEditorStore } from "@animbrio/editor-core";

export function SceneCanvas() {
  const state = useEditorStore();
  const module = getActiveModule(state);
  const slide = getActiveSlide(state);
  const media = mediaMap(state.document.draft);
  const playheadMs = useEditorStore((s) => s.playheadMs);
  const playing = useEditorStore((s) => s.playing);
  const setPlayhead = useEditorStore((s) => s.setPlayhead);
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const pan = useEditorStore((s) => s.pan);
  const setPan = useEditorStore((s) => s.setPan);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const selectLayers = useEditorStore((s) => s.selectLayers);
  const setProject = useEditorStore((s) => s.setProject);
  const snap = useEditorStore((s) => s.snap);
  const breakpoint = useEditorStore((s) => s.breakpoint);
  const drag = useRef<{ ids: string[]; x: number; y: number } | null>(null);

  if (!module || !slide) return null;
  const design = module.designSize[breakpoint] ?? module.designSize.desktop;

  return (
    <div
      className="ab-scene"
      onWheel={(e) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        setZoom(zoom + (e.deltaY > 0 ? -0.08 : 0.08));
      }}
      onMouseDown={(e) => {
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
          const start = { x: e.clientX - pan.x, y: e.clientY - pan.y };
          const move = (ev: MouseEvent) => setPan({ x: ev.clientX - start.x, y: ev.clientY - start.y });
          const up = () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", up);
          };
          window.addEventListener("mousemove", move);
          window.addEventListener("mouseup", up);
        }
      }}
    >
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "top center",
          width: "min(100%, 1100px)",
          position: "relative",
        }}
      >
        <ModulePlayer
          module={{ ...module, slides: [slide] }}
          mediaById={media}
          mode="editor"
          timeMs={playheadMs}
          playing={playing}
          breakpoint={breakpoint}
          onTimeUpdate={setPlayhead}
          enableScrollTimeline={false}
        />
        {slide.layers
          .filter((l) => l.type !== "group" && !l.hiddenInEditor)
          .map((layer) => {
            const box = layer.box[breakpoint] ?? layer.box.desktop;
            const selected = selectedLayerIds.includes(layer.id);
            return (
              <div
                key={layer.id}
                className={selected ? "ab-handle ab-handle-on" : "ab-handle"}
                style={{
                  left: `${(box.x / design.width) * 100}%`,
                  top: `${(box.y / design.height) * 100}%`,
                  width: `${(box.width / design.width) * 100}%`,
                  height: `${(box.height / design.height) * 100}%`,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  selectLayers([layer.id], e.shiftKey);
                  drag.current = { ids: e.shiftKey ? [...selectedLayerIds, layer.id] : [layer.id], x: e.clientX, y: e.clientY };
                  const move = (ev: MouseEvent) => {
                    if (!drag.current) return;
                    let dx = (ev.clientX - drag.current.x) / zoom;
                    let dy = (ev.clientY - drag.current.y) / zoom;
                    if (snap) {
                      dx = Math.round(dx / 8) * 8;
                      dy = Math.round(dy / 8) * 8;
                    }
                    const ids = drag.current.ids;
                    drag.current.x = ev.clientX;
                    drag.current.y = ev.clientY;
                    setProject((p) => {
                      for (const id of ids) {
                        ops.moveLayer(p, module.id, slide.id, id, dx, dy, breakpoint);
                      }
                    });
                  };
                  const up = () => {
                    drag.current = null;
                    window.removeEventListener("mousemove", move);
                    window.removeEventListener("mouseup", up);
                  };
                  window.addEventListener("mousemove", move);
                  window.addEventListener("mouseup", up);
                }}
              />
            );
          })}
      </div>
    </div>
  );
}
