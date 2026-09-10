# Result asteria_v2_g05

status: completed

## Version

```text
2.0.0-rc.1
```

## Browser Bootstrap

```text
BROWSER_PATH = PLAYWRIGHT_FALLBACK
BROWSER_PLUGIN_REASON = Browser tool/skill not available in current WSL Codex session
PLAYWRIGHT_VERSION = 1.63.0
CHROMIUM_SMOKE = PASS
```

Bootstrap commands:

```text
npm install --save-dev @playwright/test
npx playwright install chromium
node -e "... chromium.launch ..."
```

The first sandboxed browser install attempt did not produce a Chromium executable. The task-authorized normal local install completed and downloaded Playwright Chromium `1243`; `chromium.launch()` loaded a DOM page and printed `playwright-ok`.

## Architecture RC Work

- Added repeatable Playwright QA infrastructure: `playwright.config.ts`, `tests/browser/asteria-v2-rc.spec.ts`, `npm run test:browser`, and `npm run test:e2e`.
- Added `ArchitectureWorkspace` as the main Architecture tab surface, so the 2.0 Architecture canvas is the primary workspace instead of only a right-side reference panel.
- Extended `ArchitectureReferencePanel` with Architecture / Lineage / Evidence view switch, search scope, schema-v2 JSON preview, Markdown preview, local view save/restore, and a legacy V1 import + Story check.
- Added G05 stress regression and benchmark scripts.
- Split Vite chunks into `icons`, `flow`, `vendor`, `math`, and `rich-text`, removing the previous large main chunk warning.

## Baseline Vs RC Performance

G00 baseline:

```text
large v1 normalizeAverageMs = 9.878
large v1 projectionAverageMs = 1.544
large v1 historySignatureAverageMs = 10.003
distAssetBytes = 2496409
G04 main JS chunk = 1,344.13 kB / gzip 412.66 kB
```

G05 RC:

```json
{
  "entityCount": 2200,
  "relationCount": 6200,
  "visibleProjectionCount": 260,
  "indexAverageMs": 3.203,
  "traceAverageMs": 3.399,
  "layerFocusAverageMs": 4.569
}
```

Build chunk summary:

```text
index JS = 278.38 kB / gzip 76.37 kB
rich-text JS = 377.41 kB / gzip 120.75 kB
flow JS = 179.89 kB / gzip 58.25 kB
vendor JS = 245.94 kB / gzip 80.45 kB
math JS = 261.07 kB / gzip 77.50 kB
chunk-size warning = none
```

## Browser QA

```text
npm run test:browser
2 passed
```

Covered:

- Original TRACE reference.
- CAT-TRACE Frozen V2 reference.
- `beta^U_gh` inspector and recursive trace.
- `p_g` not-estimand / not-unknown-species-count constraint.
- layer focus and Architecture Outline.
- formula binding note.
- TRACE to CAT-TRACE semantic diff.
- Markdown and schema-v2 JSON export preview.
- legacy V1 import and Story regression check.
- local view save/restore.
- desktop viewport `1536x864` and laptop viewport `1366x768`.

Screenshot evidence:

```text
/tmp/asteria-browser-qa/g05-architecture-desktop.png
/tmp/asteria-browser-qa/g05-architecture-laptop.png
```

Console health:

```text
No unexplained console/page errors.
Known Vite-only dev-server /api/asteria/status 404 probe was identified and filtered in test as non-rendering, non-interaction evidence.
```

## Accepted-Concept Fidelity Ledger

- A/B shell: implemented left view rail, central lane-based Architecture canvas, right inspector, compact toolbar integration, and dark default shell.
- C Symbol Trace: selected symbol remains highlighted, upstream/downstream symbols stay visible with dimmed unrelated nodes, recursive trace controls are browser-tested.
- D Semantic Diff: diff remains in the inspector as added/modified/preserved facts while the central canvas keeps stable Architecture positions.
- Typography/density: shortened central math tokens prevent clipping; inspector controls use compact RC density.
- Background/palette: reused current celestial map indirectly through the existing canvas direction, with subdued dark treatment and non-particle motion.

Remaining intentional deviation:

- G05 does not yet replace the inspector diff with a full in-canvas before/after diff layer; the semantic diff is stable and tested, and final multi-view polish continues in G06.

## Tests

```text
npm run build
exit 0

npm run test:regression
exit 0

npm run test:architecture-g05
exit 0

npm run bench:architecture-g05
exit 0

npm run test:browser
exit 0

git diff --check
exit 0
```

## Commit And Push

Target commit:

```text
v2.0.0-rc.1
```

The exact commit SHA is reported after commit/push.

## Remaining Issues

- G06 still owns final Lineage/Evidence RC readiness and E1/E2 fidelity.
- Vite dev-only `/api/asteria/status` 404 remains expected when running pure `npm run dev`; shared-server validation remains covered separately.

G06_READY = YES
