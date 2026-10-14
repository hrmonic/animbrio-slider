# Next.js integration

This guide matches [apps/integration-demo](../apps/integration-demo).

## 1. Install packages

From the monorepo (workspace) or your package manager once packages are published:

- `@animbrio/schema`
- `@animbrio/renderer`
- `@animbrio/animation-engine`
- `@animbrio/interaction-engine`

## 2. Configure Next.js

In `next.config.ts`:

- Add packages to `transpilePackages`.
- Optionally map package names to `packages/*/src` during local development (see demo config).
- Set `resolve.extensionAlias` so `.ts` imports resolve when linking source.

## 3. Load a published module

Run the editor (`pnpm dev`) and publish a module with a known `slug`.

```ts
const res = await fetch(`${EDITOR_URL}/api/public/modules/${slug}`);
const { module, media } = publicModuleResponseSchema.parse(await res.json());
const mediaById = Object.fromEntries(media.map((m) => [m.id, m]));
```

Validate responses with `publicModuleResponseSchema` from `@animbrio/schema`.

## 4. Render

```tsx
"use client";

import { ModulePlayer } from "@animbrio/renderer";

export function HeroSlider({ module, mediaById }) {
  return <ModulePlayer module={module} mediaById={mediaById} playing loop />;
}
```

## 5. Environment

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_ANIMBRIO_API` | `http://localhost:3840` |
| `NEXT_PUBLIC_ANIMBRIO_MODULE_SLUG` | `my-hero` |

The demo app loads the local empty project until a slug is set.

## Media URLs

If `media[].url` is relative (e.g. `/api/media/...`), prefix with your editor origin or proxy media through your app.
