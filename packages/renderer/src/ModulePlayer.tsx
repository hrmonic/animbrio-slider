"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Breakpoint, MediaAsset, Module, Slide } from "@animbrio/schema";
import { evaluateModuleAtTime, getSlidesTotalDuration } from "@animbrio/animation-engine";
import { parallaxOffset, scrollTimeMs } from "@animbrio/interaction-engine";
import { LayerNode } from "./LayerNode.tsx";
import { ParticleWave } from "./ParticleWave.tsx";

export interface ModulePlayerProps {
  module: Module;
  mediaById: Record<string, MediaAsset>;
  mode?: "output" | "editor";
  timeMs?: number;
  playing?: boolean;
  loop?: boolean;
  breakpoint?: Breakpoint;
  className?: string;
  onTimeUpdate?: (timeMs: number) => void;
  respectReducedMotion?: boolean;
  enableScrollTimeline?: boolean;
}

function slideBackgroundStyle(slide: Slide, mediaById: Record<string, MediaAsset>): CSSProperties {
  const bg = slide.background;
  if (bg.type === "color" && bg.color) return { background: bg.color };
  if (bg.type === "gradient" && bg.gradient) return { background: bg.gradient };
  if (bg.type === "image" && bg.mediaId) {
    const url = mediaById[bg.mediaId]?.url;
    if (url) return { backgroundImage: `url(${url})`, backgroundSize: "cover", backgroundPosition: "center" };
  }
  return { background: "#000" };
}

export function ModulePlayer({
  module,
  mediaById,
  mode = "output",
  timeMs: controlledTime,
  playing = false,
  loop = true,
  breakpoint = "desktop",
  className,
  onTimeUpdate,
  respectReducedMotion = true,
  enableScrollTimeline = true,
}: ModulePlayerProps) {
  const design =
    breakpoint === "mobile"
      ? module.designSize.mobile ?? module.designSize.desktop
      : breakpoint === "tablet"
        ? module.designSize.tablet ?? module.designSize.desktop
        : breakpoint === "notebook"
          ? module.designSize.notebook ?? module.designSize.desktop
          : module.designSize.desktop;
  const [internalTime, setInternalTime] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const total = useMemo(() => getSlidesTotalDuration(module.slides), [module.slides]);

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (!respectReducedMotion) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [respectReducedMotion]);

  const scrollEnabled = Boolean(module.settings.scrollTimeline?.enabled) && enableScrollTimeline && mode === "output";
  const timeMs = controlledTime ?? internalTime;
  const state = evaluateModuleAtTime(module.slides, timeMs, breakpoint);
  const slide = module.slides[state.slideIndex] ?? module.slides[0];
  if (!slide) return null;
  const parallaxOn = Boolean(module.settings.parallax?.enabled) && !reducedMotion;
  const particleOn = module.extensionHints.some((h) => h.includes("particle"));

  useEffect(() => {
    if (!playing || controlledTime !== undefined || reducedMotion || scrollEnabled) return;
    const tick = (now: number) => {
      if (lastRef.current != null) {
        const delta = now - lastRef.current;
        setInternalTime((prev) => {
          let next = prev + delta;
          if (next >= total) next = loop ? 0 : total;
          onTimeUpdate?.(next);
          return next;
        });
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    };
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [playing, controlledTime, total, loop, onTimeUpdate, reducedMotion, scrollEnabled]);

  useEffect(() => {
    if (controlledTime !== undefined) setInternalTime(controlledTime);
  }, [controlledTime]);

  useEffect(() => {
    if (!scrollEnabled) return;
    const onScroll = () => {
      const start = module.settings.scrollTimeline?.fixedStart ?? 0;
      const end = module.settings.scrollTimeline?.fixedEnd ?? 3000;
      const next = scrollTimeMs(window.scrollY, start, end, total);
      setInternalTime(next);
      onTimeUpdate?.(next);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollEnabled, module.settings.scrollTimeline, total, onTimeUpdate]);

  const visibleLayers = slide.layers.filter((l) => {
    if (l.type === "group") return false;
    if (mode === "editor" && l.hiddenInEditor) return false;
    if (mode === "output" && l.hiddenInOutput) return false;
    return true;
  });

  return (
    <div
      ref={rootRef}
      className={className}
      role="region"
      aria-label={module.name}
      tabIndex={0}
      onMouseMove={(e) => {
        if (!parallaxOn || module.settings.parallax?.type !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        setPointer({
          x: (e.clientX - r.left) / r.width - 0.5,
          y: (e.clientY - r.top) / r.height - 0.5,
        });
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") setInternalTime((t) => Math.min(total, t + 250));
        if (e.key === "ArrowLeft") setInternalTime((t) => Math.max(0, t - 250));
      }}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: `${design.width} / ${design.height}`,
        overflow: "hidden",
        opacity: state.transitionProgress > 0 ? 1 - state.transitionProgress * 0.35 : 1,
        ...slideBackgroundStyle(slide, mediaById),
      }}
    >
      {module.customCss ? <style>{module.customCss}</style> : null}
      {visibleLayers.map((layer) => {
        const ls = state.layers.find((x) => x.layerId === layer.id);
        if (!ls || !ls.visible) return null;
        const extra =
          parallaxOn && layer.parallaxDepth
            ? parallaxOffset(layer.parallaxDepth, pointer)
            : undefined;
        return (
          <LayerNode
            key={layer.id}
            layer={layer}
            state={ls}
            mediaById={mediaById}
            extraOffset={extra}
          />
        );
      })}
      <ParticleWave enabled={particleOn && !reducedMotion && mode === "output"} />
    </div>
  );
}

/** Rendu statique t=0 pour SSR / contenu essentiel. */
export function ModuleStatic({
  module,
  mediaById,
  breakpoint = "desktop",
}: {
  module: Module;
  mediaById: Record<string, MediaAsset>;
  breakpoint?: Breakpoint;
}) {
  return (
    <ModulePlayer
      module={module}
      mediaById={mediaById}
      timeMs={0}
      playing={false}
      breakpoint={breakpoint}
      respectReducedMotion={false}
      enableScrollTimeline={false}
    />
  );
}
