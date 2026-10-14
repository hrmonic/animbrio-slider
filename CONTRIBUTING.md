# Contributing

Thank you for improving Animbrio Slider.

## Setup

```bash
pnpm install
pnpm --filter @animbrio/schema build
```

## Checks before a PR

```bash
pnpm -r run lint
pnpm -r run test
pnpm --filter @animbrio/editor build
pnpm --filter @animbrio/integration-demo build
```

## Code style

- TypeScript strict; no `any` without justification.
- Prefer Zod schemas at API boundaries (`@animbrio/schema`).
- Keep packages focused: logic in engines, I/O in `persistence` and Next routes.
- Match existing import style (`.ts` / `.tsx` extensions in package sources).

## Commits

Use clear messages (e.g. `feat:`, `fix:`, `docs:`). One logical change per PR when possible.

## License

By contributing, you agree that your contributions are licensed under the [Apache License 2.0](LICENSE).
