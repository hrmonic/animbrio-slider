export interface PointerNorm {
  x: number;
  y: number;
}

/** Offset en px : depth 1 ≈ 5px, depth 10 ≈ 50px. */
export function parallaxOffset(depth: number, pointer: PointerNorm, strength = 5): { x: number; y: number } {
  const d = depth || 0;
  return {
    x: pointer.x * d * strength,
    y: pointer.y * d * strength,
  };
}

export function scrollProgress(scrollY: number, start: number, end: number): number {
  if (end <= start) return 0;
  return Math.min(1, Math.max(0, (scrollY - start) / (end - start)));
}

export function scrollTimeMs(scrollY: number, start: number, end: number, durationMs: number): number {
  return scrollProgress(scrollY, start, end) * durationMs;
}
