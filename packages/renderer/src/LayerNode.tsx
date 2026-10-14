"use client";

import type { CSSProperties, ReactNode } from "react";
import type { Layer, MediaAsset } from "@animbrio/schema";
import type { LayerRenderState } from "@animbrio/animation-engine";

export function LayerNode({
  layer,
  state,
  mediaById,
  extraOffset,
}: {
  layer: Layer;
  state: LayerRenderState;
  mediaById: Record<string, MediaAsset>;
  extraOffset?: { x: number; y: number };
}) {
  const common: CSSProperties = {
    position: "absolute",
    left: state.x + (extraOffset?.x ?? 0),
    top: state.y + (extraOffset?.y ?? 0),
    width: state.width,
    height: state.height,
    opacity: state.opacity,
    transform: `rotate(${state.rotation}deg)`,
    transformOrigin: `${state.originX * 100}% ${state.originY * 100}%`,
    zIndex: layer.zIndex,
    pointerEvents: layer.locked ? "none" : "auto",
  };

  const wrap = (node: ReactNode) =>
    layer.href ? (
      <a key={layer.id} href={layer.href} style={{ ...common, display: "block" }}>
        {node}
      </a>
    ) : (
      <div key={layer.id} style={common}>
        {node}
      </div>
    );

  if (layer.type === "text") {
    return (
      <div
        key={layer.id}
        style={{
          ...common,
          color: layer.typography.color,
          fontFamily: layer.typography.fontFamily,
          fontSize: layer.typography.fontSize,
          fontWeight: layer.typography.fontWeight,
          lineHeight: layer.typography.lineHeight,
          letterSpacing: layer.typography.letterSpacing,
          textAlign: layer.typography.textAlign,
          display: "flex",
          alignItems: "center",
          whiteSpace: "pre-wrap",
        }}
      >
        {layer.href ? <a href={layer.href}>{layer.content}</a> : layer.content}
      </div>
    );
  }

  if (layer.type === "button") {
    return (
      <a
        key={layer.id}
        href={layer.href ?? "#"}
        style={{
          ...common,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: layer.typography.color,
          fontFamily: layer.typography.fontFamily,
          fontSize: layer.typography.fontSize,
          fontWeight: layer.typography.fontWeight,
          textDecoration: "none",
          border: "1px solid currentColor",
          borderRadius: 4,
        }}
      >
        {layer.content}
      </a>
    );
  }

  if (layer.type === "image") {
    const src = mediaById[layer.mediaId]?.url;
    if (!src) return null;
    return wrap(
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: layer.objectFit }} />,
    );
  }

  if (layer.type === "shape") {
    return (
      <div
        key={layer.id}
        style={{
          ...common,
          background: layer.fill,
          borderRadius: layer.shape === "ellipse" ? "50%" : layer.borderRadius,
        }}
      />
    );
  }

  if (layer.type === "video") {
    const src = layer.videoUrl ?? (layer.mediaId ? mediaById[layer.mediaId]?.url : undefined);
    if (!src) return null;
    return (
      <video
        key={layer.id}
        src={src}
        style={common}
        autoPlay={layer.autoplay}
        loop={layer.loop}
        muted={layer.muted}
        playsInline
      />
    );
  }

  if (layer.type === "lottie") {
    const src = layer.jsonUrl ?? (layer.mediaId ? mediaById[layer.mediaId]?.url : undefined);
    return (
      <div key={layer.id} style={{ ...common, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#aaa" }}>
        Lottie{src ? ` (${src.split("/").pop()})` : ""}
      </div>
    );
  }

  return null;
}
