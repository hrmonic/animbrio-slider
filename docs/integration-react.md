# React integration

Use `@animbrio/renderer` in any React 19+ app (Vite, CRA, etc.). The player is a client component.

## Props

```tsx
import { ModulePlayer, ModuleStatic } from "@animbrio/renderer";
import type { Module, MediaAsset } from "@animbrio/schema";

const mediaById: Record<string, MediaAsset> = { /* id → asset */ };

<ModulePlayer
  module={module}
  mediaById={mediaById}
  playing
  loop
  breakpoint="desktop"
  respectReducedMotion
/>
```

| Prop | Description |
|------|-------------|
| `module` | `Module` from your JSON or API |
| `mediaById` | Map of media id → `{ url, mimeType, ... }` |
| `mode` | `"output"` (default) or `"editor"` |
| `timeMs` | Controlled playhead (ms) |
| `playing` | Auto-advance timeline |
| `breakpoint` | Responsive layout key |
| `enableScrollTimeline` | Tie playback to page scroll when module settings allow |

## SSR / first paint

`ModuleStatic` renders frame 0 without starting playback — useful for SSR or LCP-friendly heroes.

## Data source

- Load JSON from your CMS or static file.
- Or fetch from the Animbrio editor public API (`GET /api/public/modules/:slug`) and parse with `publicModuleResponseSchema`.

## Styling

The player uses inline layout from module `designSize` and layer boxes. Wrap it in a container; optional `className` on `ModulePlayer` sets the root element class.
