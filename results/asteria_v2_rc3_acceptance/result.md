# Result asteria_v2_rc3_acceptance_hardening

STATUS = COMPLETE
CURRENT_VERSION = 2.0.0-rc.3
ASTERIA_V2_WEB_RC_READY_FOR_USER_ACCEPTANCE = YES
NEXT_ACTION = FINAL_USER_ACCEPTANCE

## Scope

This result records the narrow `2.0.0-rc.2` to `2.0.0-rc.3` acceptance hardening pass.

No stable release, desktop/Tauri/Electron work, production infrastructure change, Figma redesign, new dependency, third model variant, or real-data research closure was performed.

## Renderer And State Hardening

- Central Architecture / Lineage / Evidence rendering now uses a shared architecture session state for active view, active model, selection, trace controls, layer focus, export mode, action status, and local save/restore.
- Central nodes are generated from the active `ArchitectureView.projectedEntityIds` and `ArchitectureView.projections`.
- Central edges are generated from visible `TypedRelation` source/target membership in the active view.
- The central Architecture view switches between Original TRACE and CAT-TRACE Frozen V2 through the same state used by the inspector, Symbol Trace, outline, export, validation, semantic diff, and save/restore.
- Lineage and Evidence use independent projections and relation-backed edges instead of component-local method/evidence position maps.
- Semantic diff status is visible on CAT-TRACE Architecture nodes.
- Symbol Trace highlights true `TypedRelation.id` edge paths and dims unrelated relation edges.
- View/model buttons now expose `aria-selected` and `data-asteria-selected` and disable transition races on gate-critical active-state screenshots.

## Regression Coverage

Added:

```text
npm run test:architecture-rc3
scripts/validate-architecture-rc3.mjs
```

Covered assertions:

- `ArchitectureWorkspace.tsx` no longer keeps `stageSymbols`, `methodPositions`, `evidencePositions`, or a fixed CAT-TRACE project source.
- Original TRACE central projection includes Original entities and excludes CAT-TRACE entities.
- CAT-TRACE central projection includes CAT-TRACE entities and excludes Original entities.
- Architecture, Lineage, and Evidence edge IDs match projected typed relations.
- Rendered nodes for the validated views come from `ArchitectureView.projections`, not fallback positions.
- Mutating a fixture projection position changes rendered layout coordinates.
- `beta^U_gh` direct upstream trace includes `nu -> beta^U_gh`, `a_g -> beta^U_gh`, `v^U_gh -> beta^U_gh`, and posterior-inference relation evidence.
- `beta^U_gh` recursive downstream trace reaches `z^U_igh`, `y^U_igh`, and richness/discovery targets.
- `p_g` trace includes zero-slot bookkeeping and open-tail intercept calibration.
- Lineage visible relation IDs include TRACE/CAT, TRACE preserve, HMSC, bigMVP, and MGP relation truth.
- Evidence visible relation IDs include proof, implementation fixture, stress fixture, pending Finland data, and real-data gap relation truth.

Playwright browser regression now also covers model-stage sync, relation ID/type DOM truth, projection identity, trace-edge truth, Lineage/Evidence relation counts, and active view visual-state attributes.

## Final Verification

```text
npm run build: exit 0
npm run test:regression: exit 0
npm run bench:architecture-g05: exit 0
npm run test:browser: exit 0
git diff --check: exit 0
```

Key outputs:

```json
{
  "architectureRc3": {
    "status": "validated",
    "originalNodes": 14,
    "originalRelations": 16,
    "catNodes": 37,
    "catRelations": 33,
    "lineageRelations": 5,
    "evidenceRelations": 8,
    "projectionMutationChangedLayout": true
  },
  "performance": {
    "entityCount": 2200,
    "relationCount": 6200,
    "visibleProjectionCount": 260,
    "indexAverageMs": 2.635,
    "traceAverageMs": 2.984,
    "layerFocusAverageMs": 3.943
  },
  "browser": {
    "engine": "Playwright Chromium",
    "tests": 3,
    "status": "passed",
    "durationSeconds": 5.5
  },
  "build": {
    "mainCssGzipKb": 15.61,
    "mainJsGzipKb": 78.62,
    "buildSeconds": 2.91
  }
}
```

## Acceptance Screenshots

Committed screenshot evidence:

```text
results/asteria_v2_rc3_acceptance/screenshots/architecture-cat-trace-dark.png
results/asteria_v2_rc3_acceptance/screenshots/architecture-original-trace-dark.png
results/asteria_v2_rc3_acceptance/screenshots/architecture-trace-focus.png
results/asteria_v2_rc3_acceptance/screenshots/lineage-dark.png
results/asteria_v2_rc3_acceptance/screenshots/evidence-dark.png
results/asteria_v2_rc3_acceptance/screenshots/architecture-light.png
```

All six files are PNG screenshots at `1536 x 864`.

Manual screenshot QA confirmed:

- CAT-TRACE dark Architecture shows `2.0.0-rc.3`, CAT model status, projected nodes, typed relation paths, trace/diff visual states, and the shared inspector.
- Original TRACE dark Architecture shows Original model status, Original projection nodes, and no CAT-TRACE-only central nodes.
- Trace focus screenshot shows downstream relation path highlighting from `beta^U_gh` toward latent occurrence and richness/discovery targets.
- Lineage screenshot shows relation-backed method lineage into CAT-TRACE without the previous cropped target node.
- Evidence screenshot shows relation-backed claims, datasets, implementation evidence, limitation/pending nodes, and stable Evidence active state in both view switchers.
- Light screenshot has no tooltip overlay and keeps the CAT-TRACE projection/trace state readable.

## Accepted-Concept Fidelity Summary

- A/B Architecture shell: central Architecture is now model-aware and projection/relation-driven in both dark and light screenshots.
- C Symbol Trace: trace controls now drive true relation edge highlighting in the central graph.
- D Semantic Diff: CAT-TRACE diff status is visible directly on projected graph nodes and remains backed by the semantic diff report.
- E1 Lineage: central method graph edges now come from lineage typed relations.
- E2 Evidence: central evidence graph edges now come from evidence typed relations and preserve pending/limited status distinctions.

Concept images remained visual/interaction references only; formulas, citations, simulation status, and real-data status were not copied from the images.

## Remaining Issues

- Final user acceptance is pending.
- `2.0.0` stable release is intentionally not published.
- Real-data closure for first-paper datasets remains pending and is not claimed.
- The marked discovery theorem remains pending.
- CAT-TRACE Architecture has high information density by design; rc3 improves truth linkage, not a new visual redesign.
