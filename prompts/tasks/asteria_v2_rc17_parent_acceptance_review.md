---
id: asteria--rc17-parent-acceptance-review
reviewed_at: 2026-10-04
status: NEEDS_REVISION
candidate: 2.0.0-rc.17
product_commit: 853a043d618ae380f8e5dd658dc6071fa71a537a
---

# RC.17 parent acceptance + human screenshot review

## Decision

`NEEDS_REVISION`.

Do not enter final human acceptance and do not release `2.0.0`.

## GPT Work result

The single parent GPT Work returned:

- W01 = FAIL
- W05 = PASS
- W06 = PASS
- P0 = 0
- P1 = 0
- must-fix P2 = 2

Fresh W01 findings:

1. `AST-RC17-W01-001`: Architecture Overview changes visible entity set / layout under ordinary selection while trace is OFF.
2. `AST-RC17-W01-002`: Full model Fit compresses 37 nodes into an unreadable miniature while leaving substantial usable canvas unused.

## Human screenshot override

The user's direct inspection adds a broader visual-system failure that GPT Work did **not** report.

Visible issues in RC.17 screenshots include:

- Architecture default/trace-off canvas still shows arrow terminals on essentially every ordinary connector. Dense fan-in around core parameter cards becomes a comb of tiny chevrons.
- Architecture connector direction markers compete with the scientific cards even before explicit trace is enabled.
- Lineage still places relation chips such as `Ecological hierarchy`, `Extends`, `Preserves`, `Scalable probit`, and `Factor shrinkage` as floating labels on the connector field. This remains visually generated/diagram-engine-like rather than a finished research-product figure.
- Lineage repeats relationship meaning between source-card copy and floating edge labels.
- Evidence also uses terminal markers on ordinary context relations. The canvas has no need to display direction arrows on every relation when node kind/status and Inspector already explain semantics.
- The current connector system satisfies many endpoint/collision metrics but still fails whole-screen restraint: too many terminals and too much relation text remain on the canvas.

Therefore:

```text
PREVIOUS_PASS_FOR_AFFECTED_VISUAL_SCOPE = INVALIDATED
STABLE_RELEASE = BLOCKED
```

## Root cause in current source

### Selection-only reflow

`selectDisplayEntityIds(...)` currently calls `revealDirectContext(options.selectedEntityId)` for CAT-TRACE Overview. Therefore ordinary selection changes the display entity set even when trace is OFF. This contradicts the visible product copy that selection only controls the Inspector.

### Full-model fit

Full-model lane packing still starts from the fixed `presentationCanvas.width = 1000` / `height = 620` instead of the actual rendered canvas size. The Full-model base viewport zoom is also derived mainly from height and capped at `0.82`, while the toolbar `Fit` action only resets `readingZoom = 1`; it does not compute a real readable fit from rendered node bounds and available canvas.

### Connector noise

`ProjectedEdge` renders `markerEnd="url(#architecture-edge-arrow)"` for every Architecture/Evidence relation regardless of trace state.

`LineagePresentation` renders `markerEnd="url(#lineage-presentation-arrow)"` for every provenance connector and also renders `RelationLabelGroup` for all sources, so the default view necessarily contains both arrowheads and floating labels.

The generic connector engine is not inherently wrong; the presentation policy is too eager. Stable-facing default canvases should be connector-light.

## Frozen repair direction

Use the 2026-10-04 Quiet Connector amendment in `docs/design/SCIENTIFIC_GRAPH_VISUAL_SYSTEM.md`.

The intended stable behavior is:

### Architecture

- trace OFF: ordinary edges have no arrowheads and no inline edge text;
- selection changes selected-card emphasis + Inspector only;
- selection does not change visible entities, node coordinates, or routes;
- explicit trace ON: only active trace edges may show a tiny restrained direction terminal;
- no relation prose on the canvas.

### Lineage

- no default arrowheads;
- no floating connector labels/chips;
- source cards already provide concise provenance interpretation;
- full typed relations live in the Method Inspector;
- selection may emphasize one connector, but it should not restore label clutter.

### Evidence

- no ordinary arrowheads;
- no floating edge text;
- relation/status semantics come from claim/evidence card kind/status, restrained stroke grammar, and the Inspector;
- selected object may emphasize incident relations without turning the graph into an arrow field.

### Full model

Full model is an exploration surface, not a miniature poster. Reset/center must preserve readable symbol/title scale. Do not claim success by squeezing all 37 nodes into one unreadable screen.

## Re-review scope after repair

Because the repair will touch visual grammar, selection/display separation, and Full-model responsive reading behavior, the next independent acceptance should use **one parent GPT Work prompt** containing:

- W01 visual/product;
- W05 responsive/accessibility;
- W06 release red-team.

Do not ask the user to run three prompts.

