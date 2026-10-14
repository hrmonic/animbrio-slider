import { z } from "zod";

export const SCHEMA_VERSION = 1;

export const breakpointSchema = z.enum(["desktop", "notebook", "tablet", "mobile"]);
export type Breakpoint = z.infer<typeof breakpointSchema>;

export const easingSchema = z.enum([
  "linear",
  "easeIn",
  "easeOut",
  "easeInOut",
  "easeInQuad",
  "easeOutQuad",
  "easeInOutQuad",
  "easeInCubic",
  "easeOutCubic",
  "easeInOutCubic",
]);

export type EasingName = z.infer<typeof easingSchema>;

export const keyframeSchema = z.object({
  time: z.number().min(0),
  value: z.union([z.number(), z.string()]),
  easing: easingSchema.optional(),
  bezier: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
});

export const animTrackSchema = z.object({
  property: z.string(),
  keyframes: z.array(keyframeSchema).min(1),
});

export const layerAnimationSchema = z.object({
  in: z
    .object({
      delay: z.number().min(0).default(0),
      duration: z.number().min(0).default(0),
      tracks: z.array(animTrackSchema).default([]),
    })
    .optional(),
  out: z
    .object({
      delay: z.number().min(0).default(0),
      duration: z.number().min(0).default(0),
      tracks: z.array(animTrackSchema).default([]),
    })
    .optional(),
  loop: z
    .object({
      duration: z.number().min(0),
      tracks: z.array(animTrackSchema).default([]),
    })
    .optional(),
});

export const boxSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().default(0),
  originX: z.number().min(0).max(1).default(0.5),
  originY: z.number().min(0).max(1).default(0.5),
  opacity: z.number().min(0).max(1).default(1),
});

export const responsiveBoxSchema = z.object({
  desktop: boxSchema,
  notebook: boxSchema.optional(),
  tablet: boxSchema.optional(),
  mobile: boxSchema.optional(),
});

export const layerBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  parentId: z.string().nullable().default(null),
  zIndex: z.number().int(),
  locked: z.boolean().default(false),
  hiddenInEditor: z.boolean().default(false),
  hiddenInOutput: z.boolean().default(false),
  box: responsiveBoxSchema,
  animation: layerAnimationSchema.default({}),
  style: z.record(z.union([z.string(), z.number()])).default({}),
  href: z.string().optional(),
  parallaxDepth: z.number().optional(),
});

export const textLayerSchema = layerBaseSchema.extend({
  type: z.literal("text"),
  content: z.string(),
  typography: z.object({
    fontFamily: z.string().default("inherit"),
    fontSize: z.number().positive().default(16),
    fontWeight: z.union([z.number(), z.string()]).default(400),
    lineHeight: z.number().positive().default(1.2),
    letterSpacing: z.number().default(0),
    textAlign: z.enum(["left", "center", "right", "justify"]).default("left"),
    color: z.string().default("#ffffff"),
  }),
});

export const imageLayerSchema = layerBaseSchema.extend({
  type: z.literal("image"),
  mediaId: z.string(),
  objectFit: z.enum(["cover", "contain", "fill", "none"]).default("cover"),
});

export const shapeLayerSchema = layerBaseSchema.extend({
  type: z.literal("shape"),
  shape: z.enum(["rect", "ellipse"]).default("rect"),
  fill: z.string().default("#ffffff"),
  borderRadius: z.number().min(0).default(0),
});

export const groupLayerSchema = layerBaseSchema.extend({
  type: z.literal("group"),
  childIds: z.array(z.string()).default([]),
});

export const videoLayerSchema = layerBaseSchema.extend({
  type: z.literal("video"),
  mediaId: z.string().optional(),
  videoUrl: z.string().optional(),
  autoplay: z.boolean().default(false),
  loop: z.boolean().default(true),
  muted: z.boolean().default(true),
});

export const buttonLayerSchema = layerBaseSchema.extend({
  type: z.literal("button"),
  content: z.string(),
  href: z.string().optional(),
  typography: textLayerSchema.shape.typography,
});

export const lottieLayerSchema = layerBaseSchema.extend({
  type: z.literal("lottie"),
  mediaId: z.string().optional(),
  jsonUrl: z.string().optional(),
});

export const layerSchema = z.discriminatedUnion("type", [
  textLayerSchema,
  imageLayerSchema,
  shapeLayerSchema,
  groupLayerSchema,
  videoLayerSchema,
  buttonLayerSchema,
  lottieLayerSchema,
]);

export const slideBackgroundSchema = z.object({
  type: z.enum(["color", "gradient", "image", "video"]),
  color: z.string().optional(),
  gradient: z.string().optional(),
  mediaId: z.string().optional(),
  videoUrl: z.string().optional(),
});

export const slideSchema = z.object({
  id: z.string(),
  name: z.string(),
  duration: z.number().positive().default(9000),
  transition: z
    .object({
      type: z.enum(["fade", "slide", "none"]).default("fade"),
      duration: z.number().min(0).default(300),
    })
    .default({ type: "fade", duration: 300 }),
  background: slideBackgroundSchema.default({ type: "color", color: "#000000" }),
  layers: z.array(layerSchema),
});

export const moduleKindSchema = z.enum(["scene", "slider", "carousel", "hero"]);

export const moduleSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  kind: moduleKindSchema.default("slider"),
  designSize: z.object({
    desktop: z.object({ width: z.number(), height: z.number() }),
    notebook: z.object({ width: z.number(), height: z.number() }).optional(),
    tablet: z.object({ width: z.number(), height: z.number() }).optional(),
    mobile: z.object({ width: z.number(), height: z.number() }).optional(),
  }),
  slides: z.array(slideSchema).min(1),
  settings: z
    .object({
      parallax: z
        .object({
          enabled: z.boolean().default(false),
          type: z.enum(["mouse", "scroll", "off"]).default("scroll"),
          levels: z.array(z.number()).default([]),
        })
        .optional(),
      scrollTimeline: z
        .object({
          enabled: z.boolean().default(false),
          fixedStart: z.number().default(0),
          fixedEnd: z.number().default(3000),
        })
        .optional(),
    })
    .passthrough()
    .default({}),
  customCss: z.string().default(""),
  /** Optional third-party extension identifiers (renderer plugins). */
  extensionHints: z.array(z.string()).default([]),
});

export const mediaAssetSchema = z.object({
  id: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  url: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  source: z.enum(["upload", "import", "external"]).default("upload"),
});

export const projectSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  modules: z.array(moduleSchema),
  media: z.array(mediaAssetSchema).default([]),
});

export const projectDocumentSchema = z.object({
  draft: projectSchema,
  published: projectSchema.optional(),
  revisionHistory: z
    .array(
      z.object({
        id: z.string(),
        savedAt: z.string(),
        label: z.string().optional(),
        snapshot: projectSchema,
      }),
    )
    .default([]),
});

export type Project = z.infer<typeof projectSchema>;
export type ProjectDocument = z.infer<typeof projectDocumentSchema>;
export type Module = z.infer<typeof moduleSchema>;
export type Slide = z.infer<typeof slideSchema>;
export type LayerBase = z.infer<typeof layerBaseSchema>;
export type Layer = z.infer<typeof layerSchema>;
export type MediaAsset = z.infer<typeof mediaAssetSchema>;
export type Box = z.infer<typeof boxSchema>;
export type ResponsiveBox = z.infer<typeof responsiveBoxSchema>;
export type TextLayer = z.infer<typeof textLayerSchema>;
export type ImageLayer = z.infer<typeof imageLayerSchema>;
export type ShapeLayer = z.infer<typeof shapeLayerSchema>;
export type GroupLayer = z.infer<typeof groupLayerSchema>;
export type VideoLayer = z.infer<typeof videoLayerSchema>;
export type ButtonLayer = z.infer<typeof buttonLayerSchema>;
export type LottieLayer = z.infer<typeof lottieLayerSchema>;
export type Typography = TextLayer["typography"];
export type LayerAnimation = z.infer<typeof layerAnimationSchema>;
export type AnimTrack = z.infer<typeof animTrackSchema>;
export type SlideBackground = z.infer<typeof slideBackgroundSchema>;
export type ModuleSettings = Module["settings"];

export function isTextLike(layer: Layer): layer is TextLayer | ButtonLayer {
  return layer.type === "text" || layer.type === "button";
}
