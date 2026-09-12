# Asteria

Asteria 2.0 is the active Web product shell for inspecting canonical statistical-model architecture maps. The current build focuses on Original TRACE and CAT-TRACE Frozen V2, with first-level Architecture, Lineage, and Evidence views backed by the same typed semantic graph.

Current app version: `2.0.0-rc.4`.

## Product State

`2.0.0-rc.4` removes the retired Asteria 1.x live Canvas / Toolbar / Inspector / Story startup flow from the active app. Opening Asteria now goes directly to:

- Project: `CAT-TRACE`
- View: `Architecture`
- Model: `CAT-TRACE Frozen V2`
- Selected symbol: `beta^U_gh`

Architecture provides the formal `Original TRACE` / `CAT-TRACE Frozen V2` model selector. Lineage and Evidence are direct first-level views. Save/Restore stores only the Asteria 2.0 view session state, not the retired shared/local 1.x canvas workspace.

## Legacy Compatibility

`v1.0.0` remains the complete freeze point for the historical Asteria 1.x research canvas. The retired live UI/runtime source is archived under:

```text
archive/asteria-v1-ui/
```

That archive is historical reference only and is not imported by the active Asteria 2.0 build. Asteria 2.0 does not provide a hidden live legacy canvas mode.

Active `src/` keeps the v1 compatibility pieces needed for migration: v1 payload/type definitions, import normalization, freeze fixtures, `migrateV1MapToArchitectureProjectV2`, and regression coverage such as `npm run test:legacy-roundtrip`.

## Fixed Public Acceptance URL

The fixed public Asteria acceptance entry point is:

```text
https://asteria.httpwwwcardiacnexus-ukb.com/
```

Acceptance-mode changes must refresh and verify this fixed URL after the commit is pushed. Do not create a quick tunnel, alternate hostname, alternate deployment, or replacement public link.

The shared local origin for the fixed URL is:

```bash
HOST=0.0.0.0 PORT=5174 ASTERIA_RUNTIME_DIR=/home/yuukias/.local/state/asteria/runtime node scripts/asteria-server.mjs
```

`/api/asteria/status` remains available for fixed-origin health checks. The old `/api/asteria/map` and `/api/asteria/session` endpoints may remain as compatibility API surface, but the active 2.0 UI does not use them as a startup gate.

## Run

```bash
npm install
npm run dev
```

The local dev server is configured for `http://127.0.0.1:5173/`.

For the shared server used by the fixed public entry point:

```bash
npm run serve:shared
```

## Build And Test

```bash
npm run build
npm run test:legacy-roundtrip
npm run test:architecture-kernel
npm run test:canonical-trace
npm run test:architecture-g03
npm run test:architecture-g04
npm run test:architecture-g05
npm run test:architecture-g06
npm run test:architecture-rc3
npm run test:architecture-rc4
npm run test:regression
npm run test:browser
```

Public acceptance smoke after a pushed RC.4 commit:

```bash
npm run smoke:public-rc4
```

## Repository Map

- `src/app/App.tsx`: Asteria 2.0 root shell.
- `src/architecture/`: canonical graph schema, fixtures, projections, trace, semantic diff, validation, migration, and session state.
- `src/components/ArchitectureWorkspace.tsx`: central Architecture / Lineage / Evidence projection workspace.
- `src/components/ArchitectureReferencePanel.tsx`: model selector, view selector, trace controls, inspector, export, semantic diff, and session actions.
- `src/fixtures/legacyV1FreezeMap.ts`: v1 compatibility fixture.
- `archive/asteria-v1-ui/`: retired Asteria 1.x live UI/runtime source archive.
- `results/`: task results, screenshots, and acceptance evidence.
