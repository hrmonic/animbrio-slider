# Project format (v1)

A project is stored as a `ProjectDocument` JSON file.

```json
{
  "draft": { "schemaVersion": 1, "id": "...", "name": "...", "modules": [], "media": [] },
  "published": { "...": "optional published snapshot" },
  "revisionHistory": [{ "id": "...", "savedAt": "ISO-8601", "snapshot": { "...": "Project" } }]
}
```

## Module

- `kind`: `scene` | `slider` | `carousel` | `hero`
- `designSize`: width/height per breakpoint (`desktop`, `notebook`, `tablet`, `mobile`)
- `slides[]`: duration, transition, `background`, `layers[]`
- `customCss`: author CSS injected in the player (review for safety in production)
- `extensionHints`: optional plugin identifiers for renderer extensions

## Layer

Types: `text`, `image`, `shape`, `group`, `video`, `button`, `lottie`.

Optional: `href`, `parallaxDepth`, responsive `box`, `animation.in|out|loop` with tracks `{ property, keyframes[] }`.

Common animated properties: `opacity`, `x`, `y`, `rotation`, `scale`.

`module.settings.parallax` and `module.settings.scrollTimeline` enable interaction extensions.

## Media

`media[]`: `{ id, filename, mimeType, url, source }` — stable IDs; URLs may point to your CDN or the editor media API.

Bundles (`.animbrio.json`) embed media as base64 for portable import/export.
