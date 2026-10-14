# Animbrio Slider

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](package.json)
[![pnpm](https://img.shields.io/badge/pnpm-9.15+-orange)](package.json)

**Animbrio Slider** is an open-source visual editor and **React / Next.js** player for animated sliders, hero sections, and timeline-driven scenes. One JSON schema, one animation engine, and a embeddable `ModulePlayer` you can drop into any site.

## Features

- Visual editor with canvas, layers, responsive breakpoints, and keyframe timeline
- Deterministic animation engine (same output in editor and production)
- Published-only public API for headless sites
- Parallax, scroll timeline, and reduced-motion support
- Monorepo of typed TypeScript packages (`@animbrio/*`)

## Quick start

**Requirements:** Node.js 20+, [pnpm](https://pnpm.io/) 9.15+

```bash
git clone https://github.com/hrmonic/animbrio-slider.git
cd animbrio-slider
pnpm install
pnpm --filter @animbrio/schema build
pnpm dev          # editor → http://localhost:3840
pnpm dev:demo     # Next.js demo → http://localhost:3841
```

Copy [`.env.example`](.env.example) to `apps/editor/.env.local` when you enable API keys or custom data paths.

## Packages

| Package | Role |
|---------|------|
| `@animbrio/schema` | Versioned project JSON (Zod) |
| `@animbrio/animation-engine` | Time → layer render state |
| `@animbrio/interaction-engine` | Parallax & scroll timeline helpers |
| `@animbrio/renderer` | `ModulePlayer` / `ModuleStatic` (React) |
| `@animbrio/editor-core` | Editor state, undo, scene operations |
| `@animbrio/persistence` | File store, bundles, optional SQL adapter |
| `apps/editor` | Next.js editor + REST API |
| `apps/integration-demo` | Minimal Next.js embedding example |

## Integrate in Next.js

1. Add workspace packages (or published npm packages when available).
2. Transpile internal packages in `next.config.ts` (see [docs/integration-nextjs.md](docs/integration-nextjs.md)).
3. Publish a module from the editor, then fetch:

   `GET /api/public/modules/:slug` → `{ module, media }`

4. Render:

```tsx
import { ModulePlayer } from "@animbrio/renderer";

<ModulePlayer module={module} mediaById={mediaById} playing loop />
```

See [apps/integration-demo](apps/integration-demo) and [docs/integration-nextjs.md](docs/integration-nextjs.md).

## Integrate in React

Use `@animbrio/renderer` on the client with a `Module` document and a `Record<string, MediaAsset>` for URLs. For SSR or first paint, use `ModuleStatic` (time = 0). Details: [docs/integration-react.md](docs/integration-react.md).

## Editor API (self-hosted)

| Endpoint | Description |
|----------|-------------|
| `GET/POST /api/projects` | List / create projects |
| `PUT /api/projects/:id` | Save draft |
| `GET /api/public/modules/:slug` | **Published** module only |
| `POST /api/media/:projectId` | Upload media |
| `GET /api/projects/:id/export` | Download project bundle |

Optional headers: `x-animbrio-key`, `x-animbrio-role` (see `.env.example`).

## Configuration

| Variable | Purpose |
|----------|---------|
| `ANIMBRIO_DATA_DIR` | Project + media storage (default: `./data`) |
| `ANIMBRIO_API_KEY` | Protect editor API |
| `NEXT_PUBLIC_ANIMBRIO_API` | Editor base URL for embedding demos |

## Development

```bash
pnpm -r run lint
pnpm -r run test
pnpm -r run build
```

## Documentation

- [Architecture](docs/architecture.md)
- [Project JSON format](docs/project-format.md)
- [Next.js integration](docs/integration-nextjs.md)
- [React integration](docs/integration-react.md)

## License

Apache License 2.0 — see [LICENSE](LICENSE).
