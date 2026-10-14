export type EasingName =
  | "linear"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "easeInQuad"
  | "easeOutQuad"
  | "easeInOutQuad"
  | "easeInCubic"
  | "easeOutCubic"
  | "easeInOutCubic";

export function cubicBezier(t: number, p1x: number, p1y: number, p2x: number, p2y: number): number {
  const x = Math.min(1, Math.max(0, t));
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;
  let guess = x;
  for (let i = 0; i < 6; i++) {
    const current = ((ax * guess + bx) * guess + cx) * guess - x;
    const deriv = (3 * ax * guess + 2 * bx) * guess + cx;
    if (Math.abs(deriv) < 1e-6) break;
    guess -= current / deriv;
  }
  return ((ay * guess + by) * guess + cy) * guess;
}

export function applyEasing(
  t: number,
  easing: EasingName = "linear",
  bezier?: [number, number, number, number],
): number {
  if (bezier) return cubicBezier(t, bezier[0], bezier[1], bezier[2], bezier[3]);
  const x = Math.min(1, Math.max(0, t));
  switch (easing) {
    case "linear":
      return x;
    case "easeIn":
      return x * x;
    case "easeOut":
      return 1 - (1 - x) * (1 - x);
    case "easeInOut":
      return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    case "easeInQuad":
      return x * x;
    case "easeOutQuad":
      return 1 - (1 - x) * (1 - x);
    case "easeInOutQuad":
      return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    case "easeInCubic":
      return x * x * x;
    case "easeOutCubic":
      return 1 - Math.pow(1 - x, 3);
    case "easeInOutCubic":
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    default:
      return x;
  }
}
