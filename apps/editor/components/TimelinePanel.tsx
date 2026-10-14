"use client";

import { getActiveModule, getActiveSlide, ops, useEditorStore } from "@animbrio/editor-core";

export function TimelinePanel() {
  const state = useEditorStore();
  const module = getActiveModule(state);
  const slide = getActiveSlide(state);
  const playheadMs = useEditorStore((s) => s.playheadMs);
  const setPlayhead = useEditorStore((s) => s.setPlayhead);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const setProject = useEditorStore((s) => s.setProject);
  const duration = slide?.duration ?? 6000;

  if (!module || !slide) {
    return (
      <footer className="ab-timeline">
        <p className="ab-muted">Aucune slide active.</p>
      </footer>
    );
  }

  const moduleId = module.id;
  const slideId = slide.id;

  return (
    <footer className="ab-timeline">
      <div className="ab-timeline-head">
        <span className="ab-muted">
          Timeline — {Math.round(playheadMs)} / {duration} ms
        </span>
        <input
          type="range"
          min={0}
          max={duration}
          value={Math.min(playheadMs, duration)}
          onChange={(e) => {
            setPlaying(false);
            setPlayhead(Number(e.target.value));
          }}
        />
      </div>
      <div className="ab-tracks">
        {slide.layers
          .filter((l) => l.type !== "group")
          .map((layer) => {
            const tracks = layer.animation.in?.tracks ?? [];
            const selected = selectedLayerIds.includes(layer.id);
            return (
              <div key={layer.id} className={selected ? "ab-track ab-track-on" : "ab-track"}>
                <span className="ab-track-name">{layer.name}</span>
                <div className="ab-track-bar">
                  {tracks.flatMap((t) =>
                    t.keyframes.map((k, i) => (
                      <button
                        key={`${t.property}-${i}`}
                        type="button"
                        className="ab-kf"
                        title={`${t.property} @ ${k.time}`}
                        style={{ left: `${k.time * 100}%` }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const startX = e.clientX;
                          const startT = k.time;
                          const trackEl = e.currentTarget.parentElement;
                          const move = (ev: MouseEvent) => {
                            if (!(trackEl instanceof HTMLElement)) return;
                            const parent = trackEl.getBoundingClientRect();
                            const next = Math.min(1, Math.max(0, startT + (ev.clientX - startX) / parent.width));
                            setProject((p) =>
                              ops.mutateLayer(p, moduleId, slideId, layer.id, (l) => {
                                const tr = l.animation.in?.tracks.find((x) => x.property === t.property);
                                const kf = tr?.keyframes[i];
                                if (kf) kf.time = next;
                              }),
                            );
                          };
                          const up = () => {
                            window.removeEventListener("mousemove", move);
                            window.removeEventListener("mouseup", up);
                          };
                          window.addEventListener("mousemove", move);
                          window.addEventListener("mouseup", up);
                        }}
                      />
                    )),
                  )}
                </div>
                {selected ? (
                  <button
                    type="button"
                    onClick={() =>
                      setProject((p) => ops.setLayerKeyframe(p, moduleId, slideId, layer.id, "opacity", playheadMs, 1))
                    }
                  >
                    + KF
                  </button>
                ) : null}
              </div>
            );
          })}
      </div>
    </footer>
  );
}
