---
id: asteria--rc18-parent-acceptance-review
reviewed_at: 2026-10-05
status: NEEDS_REVISION
candidate: 2.0.0-rc.18
---

# RC.18 parent acceptance + human visual override

## Decision

`NEEDS_REVISION`.

Do not enter final human acceptance.

## Parent GPT Work

- W01 = FAIL
- W05 = PASS
- W06 = PASS
- must-fix P2 = 3

Fresh W01 findings include remaining ordinary Architecture/Evidence direction terminals and inconsistent Inspector math.

## Human override

The user's screenshots expose the more important systemic defect that the parent review still underweighted:

**the connector geometry itself is ugly.**

Removing arrowheads and edge labels did not make the scientific diagrams good. Architecture and Evidence still contain:

- long orthogonal detours;
- snake-like paths;
- routes that leave the local visual region and return;
- arbitrary bends caused by obstacle routing;
- path shapes that look like an automatic graph engine rather than a designed scientific figure.

Therefore the next repair must not be another arrow/marker/count patch.

## Root architectural mistake

The current stable views use a route-first strategy:

1. keep node positions;
2. choose boundary ports;
3. run generic obstacle/corridor routing;
4. score candidate detours;
5. render soft cubic or rounded orthogonal output.

This treats routing as the primary repair mechanism. For a stable scientific figure, the order must be reversed:

1. place/order nodes so relationships are naturally drawable;
2. reserve lane/gutter/channel structure;
3. draw mostly direct monotone curves;
4. use only very short local avoidance as a last resort.

## Frozen next direction

Use the new `Layout-first scientific routing` amendment in `docs/design/SCIENTIFIC_GRAPH_VISUAL_SYSTEM.md`.

The next RC must introduce generic view-specific presentation mechanisms:

- Architecture: layered DAG + crossing-minimized lane ordering + monotone curves;
- Lineage: source column -> fixed relation column -> target column;
- Evidence: claim-centered component layout + simple local curves.

Do not hardcode CAT-TRACE entity IDs.

The repair must also close:

- trace-OFF selection visible-set/geometry invariance;
- Full-model readable reset/layout;
- ordinary Inspector raw-math tokens.

