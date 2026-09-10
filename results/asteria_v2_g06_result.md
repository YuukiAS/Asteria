# Result asteria_v2_g06

status: completed

## Version

```text
2.0.0-rc.2
```

## Scope

G06 completes the Web-only Asteria 2.0 release candidate for user acceptance. It does not enter Tauri/Electron desktop work, does not publish `2.0.0` stable, and does not change the fixed public URL, Cloudflare tunnel, DNS, or production infrastructure.

## Browser Path

```text
BROWSER_PATH = PLAYWRIGHT_FALLBACK
BROWSER_PLUGIN_REASON = Browser tool/skill not available in current WSL Codex session
PLAYWRIGHT_VERSION = 1.63.0
```

Playwright Chromium is installed locally from the official Playwright browser bundle. Chromium launch smoke passed before browser QA.

## G06 Work

- Completed the Web RC view model with Architecture, Lineage, and Evidence projections.
- Added E1 Lineage entities for TRACE / Infinite JSDM, HMSC framework, bigMVP, sparse Bayesian infinite factor / MGP, and CAT-TRACE Frozen V2.
- Added E2 Evidence entities for CAT-TRACE claims, TRACE proof reference, implementation fixtures, G05 stress evidence, first-paper datasets, real-data closure gap, and pending marked discovery theorem.
- Added explicit relation types for lineage and evidence closure, including `extends`, `preserves`, `borrows_interpretation_from`, `computationally_inspired_by`, `uses_methodological_component_from`, `theoretically_supports`, `empirically_tests`, `validates_implementation`, `stress_tests`, `pending`, and `contradicts_or_challenges`.
- Added cross-view links and all-graph search so Architecture, Lineage, and Evidence remain separate projections over one canonical project graph.
- Added browser assertions for active view synchronization across the central workspace and right inspector.

## Seed Fidelity

Original TRACE and CAT-TRACE Frozen V2 remain the only first formal model fixtures. Concept images are used only as visual and interaction references. No concept-image formulas, authors, citations, simulation status, or real-data status were copied as semantic truth.

Lineage status is method/reference provenance only:

```text
TRACE / Infinite JSDM
HMSC framework
bigMVP
Sparse Bayesian infinite factor / MGP
CAT-TRACE Frozen V2
```

Evidence status preserves unresolved claims:

```text
Finland fungi = first-paper dataset, pending real-data closure relation
Malagasy arthropods = first-paper dataset, pending real-data closure relation
South-West Australia plants = first-paper dataset, pending real-data closure relation
Marked discovery theorem = pending
GSMc = not present
```

## Browser QA

```text
npm run test:browser
2 passed
```

Covered:

- Architecture RC surface with CAT-TRACE Frozen V2.
- Original TRACE / CAT-TRACE model switching.
- Recursive `beta^U_gh` trace, `p_g` zero-slot constraints, layer focus, and semantic diff.
- Markdown export and schema-v2 JSON preview.
- Legacy V1 import + Story check.
- Local view save/restore.
- Lineage map and method inspector.
- Evidence map, claim inspector, evidence closure warnings, and pending gap display.
- Cross-view links from Lineage to Evidence and Evidence to Architecture.
- All-graph search.
- Active view synchronization between central workspace rail and right inspector segmented controls.
- Theme toggle.
- Desktop viewport `1536x864` and laptop viewport `1366x768`.

Screenshot evidence:

```text
/tmp/asteria-browser-qa/g05-architecture-desktop.png
/tmp/asteria-browser-qa/g05-architecture-laptop.png
/tmp/asteria-browser-qa/g06-lineage-desktop.png
/tmp/asteria-browser-qa/g06-multiview-desktop.png
/tmp/asteria-browser-qa/g06-evidence-laptop.png
```

Console health:

```text
No unexplained console/page errors.
The Vite-only /api/asteria/status 404 probe is filtered as expected local-dev evidence; shared-server config remains covered by npm run test:shared-server.
```

## Performance Summary

```json
{
  "entityCount": 2200,
  "relationCount": 6200,
  "visibleProjectionCount": 260,
  "indexAverageMs": 4,
  "traceAverageMs": 4.119,
  "layerFocusAverageMs": 5.487
}
```

Build chunk summary:

```text
index JS = 278.51 kB / gzip 76.38 kB
rich-text JS = 377.41 kB / gzip 120.75 kB
flow JS = 179.89 kB / gzip 58.25 kB
vendor JS = 245.94 kB / gzip 80.45 kB
math JS = 261.07 kB / gzip 77.50 kB
chunk-size warning = none
```

## Tests

```text
npm run build
exit 0

npm run test:regression
exit 0

npm run test:architecture-g06
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
v2.0.0-rc.2
```

The exact commit SHA is reported after commit/push.

## Remaining Issues

- Final human/user acceptance is still pending.
- Real-data closure remains intentionally pending for the first-paper datasets.
- The marked discovery theorem remains intentionally pending.
- Pure `npm run dev` still emits the expected `/api/asteria/status` 404 probe because the shared local server API is separate from Vite dev.

ASTERIA_V2_WEB_RC_READY_FOR_USER_ACCEPTANCE = YES
NEXT_ACTION = FINAL_USER_ACCEPTANCE
