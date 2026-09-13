---
id: asteria_v2_rc14_responsive_coordinate_space
title: Unify responsive graph coordinate space for Lineage endpoints and Architecture safe bounds
created_at: 2026-09-13
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Asteria 2.0 RC.14 — Responsive Coordinate-Space Repair

## 0. Goal

RC.13 W01 black-box audit failed with two visual P2s:

1. Lineage arrowheads float before the CAT-TRACE target card at both 1536 and 1366 and after resize.
2. Architecture Overview at 1366 with inspector open can push right-side cards into/clipped by the canvas boundary.

Read first:

1. `AGENTS.md`
2. `prompts/AGENT_RULES.md`
3. `docs/operations/development/DEVELOPER_VISUAL_SELF_QA_CONTRACT.md`
4. `docs/operations/blackbox-audit/reports/RC13_W01_VISUAL_REAUDIT_REPORT_2026-09-13.md`
5. `docs/operations/blackbox-audit/VISUAL_ACCEPTANCE_CONTRACT.md`
6. current `src/architecture/graphPresentation.ts`
7. current `src/architecture/viewProjection.ts`
8. current `src/components/ArchitectureWorkspace.tsx`
9. current styles/browser regression/self-QA scripts.

Target version:

```text
2.0.0-rc.14
```

This is a narrow generic responsive-geometry fix. Do not start GPT Work. Do not request human acceptance.

Final next action:

```text
NEXT_ACTION = CHATGPT_REVIEW_DEVELOPER_SCREENSHOTS
```

---

## 1. Root cause to fix, not patch around

### 1.1 Lineage coordinate-space mismatch

Current Lineage mixes:

- a virtual provenance layout in pixel-like coordinates;
- an SVG `viewBox` stretched to the actual container with `preserveAspectRatio="none"`;
- HTML cards/chips positioned directly with the unscaled virtual `left/top` CSS pixels.

That means SVG connector geometry scales with container size while HTML cards/chips do not share the same transform. Virtual `targetPort` can be mathematically correct and still appear detached from the rendered target card.

Do **not** fix by changing only CAT-TRACE target x or the four current lineage source coordinates.

### 1.2 Architecture safe-bound mismatch

Architecture Overview mixes percentage center coordinates with fixed CSS-pixel card sizes. At a narrow content canvas (especially 1366 with inspector open), a center near the right edge can still put half the card outside the actual content box.

Do **not** move current `gamma_g / I_CAT / R_g,R_0` individually.

---

## 2. Unified responsive geometry

Choose one coherent implementation and use it consistently.

### Preferred option A — container-driven CSS pixel geometry

Use `ResizeObserver` (or an equivalent React-safe measurement hook) to obtain actual presentation/canvas content width and height.

- pass actual width/height into provenance layout and Architecture safe-bounds logic;
- generate SVG geometry in the same actual CSS-pixel coordinate space;
- render HTML cards/chips in those same CSS-pixel coordinates;
- SVG should not apply an additional non-uniform coordinate transform that cards do not share.

### Option B — one intrinsic virtual surface with one common transform

If keeping a virtual coordinate system:

- SVG connectors, HTML cards, HTML chips must all live inside a single intrinsic surface;
- scale/translate that whole surface as one unit;
- no separate SVG scaling while HTML children remain unscaled.

Either option is acceptable. Result must explicitly state which was chosen.

Required field:

```text
COORDINATE_SPACE_STRATEGY = CONTAINER_DRIVEN | SINGLE_SCALED_SURFACE
```

---

## 3. Lineage endpoint and port correctness

### 3.1 Rendered target rect is authoritative

The visual endpoint must match the real rendered target-card left boundary after layout, including resize.

Do not define pass only from virtual data structures.

Browser regression must compare:

- target card `getBoundingClientRect()`;
- SVG path terminal point transformed to screen coordinates (e.g. `getScreenCTM()` / SVGPoint or equivalent visible-geometry method);
- arrowhead endpoint should meet target border within a small tolerance.

Suggested tolerance:

```text
abs(endpointScreenX - targetRect.left) <= 3 CSS px
```

and endpoint y must fall inside target card vertical content bounds with safe inset.

### 3.2 Port separation

For n incoming provenance sources:

- target ports are distributed inside target left edge;
- minimum vertical separation should be visually distinct at 1366 and 1536;
- ports cannot collapse to one starburst point;
- source count 3 / 4 / 6 generic fixture must still pass.

### 3.3 Chips remain attached

Chip positions must be derived from the same rendered/route geometry after resize, not from stale pre-resize coordinates.

Hard fields:

```text
LINEAGE_CONNECTOR_TOUCH_TARGET = PASS
LINEAGE_FLOATING_ARROWHEAD_COUNT = 0
LINEAGE_PORT_SEPARATION = PASS
LINEAGE_CHIP_PATH_ASSOCIATION = PASS
LINEAGE_TARGET_SAFE_MARGIN = PASS
LINEAGE_RESIZE_ALIGNMENT = PASS
```

---

## 4. Architecture viewport-safe bounds

### 4.1 Generic safe inset

For each visible Architecture card, compute safe placement against the actual canvas content box.

Required invariant:

```text
cardRect.left >= canvasRect.left + safeInset
cardRect.right <= canvasRect.right - safeInset
cardRect.top >= canvasRect.top + safeInset
cardRect.bottom <= canvasRect.bottom - safeInset
```

Use a stable reasonable inset (for example 8–16px), but do not hardcode entity-specific fixes.

### 4.2 Overview and responsive resize

At minimum cover:

- CAT Overview 1536×864 Dark;
- CAT Overview 1366×768 Light;
- selected/trace state at 1366;
- 1536 -> 1366 -> 1536 resize sequence;
- inspector open as the default product state.

The right-side inference/prediction cards must remain fully inside the canvas.

### 4.3 Preserve within-viewport geometry stability

Changing selection/trace at the same viewport must not cause shared existing cards to reflow.

Resize is allowed to recompute responsive positions, but do not animate geometry between stale and new positions.

Hard fields:

```text
ARCH_1366_VISIBLE_CARD_CLIPPED_COUNT = 0
ARCH_1366_RIGHT_SAFE_MARGIN = PASS
ARCH_RESIZE_SAFE_BOUNDS = PASS
SELECTION_GEOMETRY_STABLE = PASS
```

---

## 5. Protect RC.13 wins

Do not regress:

```text
FULL_MODEL_NODE_OVERLAP_COUNT = 0
FULL_MODEL_LAYER_ORDER = PASS
FULL_MODEL_LANE_LOCALITY = PASS
EDGE_CARD_INTERSECTION_COUNT = 0
Evidence routing = PASS
Architecture edge weight hierarchy = PASS
math/copy = PASS
```

Do not change scientific fixtures, trace algorithm, session contract, Evidence truth, semantic lane ordering, or model ontology.

Result must report:

```text
SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
EVIDENCE_TRUTH_CHANGED = NO
REVIEWER_SCOPE_EXPANDED = NO | YES
```

If scope expands beyond visual responsive geometry, say so explicitly.

---

## 6. Generic regression fixture

RC.13 generic fixture must be extended to catch the exact real-browser failure mode.

At least test provenance sources count 3 / 4 / 6 and two container widths.

Do not only test virtual layout coordinates. Include rendered browser geometry.

Required:

```text
GENERIC_PROVENANCE_RENDERED_ENDPOINT_ERROR_MAX_PX <= 3
GENERIC_PROVENANCE_PORT_COLLAPSE_COUNT = 0
GENERIC_PROVENANCE_RESIZE_ALIGNMENT = PASS
GENERIC_ARCH_SAFE_BOUNDS = PASS
```

---

## 7. Developer visual self-QA

This task must obey `DEVELOPER_VISUAL_SELF_QA_CONTRACT.md`.

Minimum two rounds. If Round 2 still visibly fails, continue Round 3.

Each round must capture and actually inspect:

1. `lineage-1536.png`
2. `lineage-1366.png`
3. `lineage-resize-return-1536.png`
4. `arch-overview-1366-light.png`
5. `arch-trace-1366-light.png`
6. `arch-resize-return-1536.png`
7. generic provenance 3-source fixture
8. generic provenance 6-source fixture

Self-QA must explicitly answer:

- Do all Lineage arrowheads visibly touch the CAT-TRACE target border?
- Are target ports visibly separated?
- Do chips remain visually attached to their own connector after resize?
- Is the CAT-TRACE target card fully inside usable canvas at 1366?
- Are Architecture rightmost cards fully inside the canvas at 1366?
- Does 1536->1366->1536 recover alignment without floating endpoints?
- Does whole-screen motion remain restrained?

Result fields:

```text
SELF_VISUAL_QA_ROUNDS = n
SELF_VISUAL_QA_SCREENSHOTS = ...
SELF_VISUAL_QA_LINEAGE_ENDPOINTS = PASS | FAIL
SELF_VISUAL_QA_LINEAGE_PORTS = PASS | FAIL
SELF_VISUAL_QA_1366_SAFE_SPACE = PASS | FAIL
SELF_VISUAL_QA_RESIZE = PASS | FAIL
SELF_VISUAL_QA_GESTALT = PASS | FAIL
SELF_VISUAL_QA_MOTION = PASS | FAIL
SELF_VISUAL_QA = PASS | FAIL
```

`SELF_VISUAL_QA != PASS` => do not report COMPLETE.

---

## 8. Automated verification

Add:

```text
npm run test:architecture-rc14
```

and add it to cumulative regression.

Run:

```text
npm run build
npm run test:regression
npm run test:architecture-rc14
npm run bench:architecture-g05
npm run test:browser
git diff --check
```

---

## 9. Version / public gate

Update to:

```text
2.0.0-rc.14
```

Write result:

```text
results/asteria_v2_rc14_responsive_coordinate_space/result.md
```

Commit/push:

```text
commit = v2.0.0-rc.14
push origin/main
HEAD == origin/main
worktree clean
```

Refresh fixed public URL only:

`https://asteria.httpwwwcardiacnexus-ukb.com/`

Must confirm:

```text
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_ROOT_CHECK = PASS
PUBLIC_STATUS_CHECK = PASS
PUBLIC_BROWSER_SMOKE = PASS
PUBLIC_VERSION = 2.0.0-rc.14
```

Do not create alternate/quick tunnel/VPS proxy.

---

## 10. Required final result

```text
STATUS = COMPLETE
CURRENT_VERSION = 2.0.0-rc.14
FINAL_COMMIT = ...
COORDINATE_SPACE_STRATEGY = ...
LINEAGE_CONNECTOR_TOUCH_TARGET = PASS
LINEAGE_FLOATING_ARROWHEAD_COUNT = 0
LINEAGE_PORT_SEPARATION = PASS
LINEAGE_CHIP_PATH_ASSOCIATION = PASS
LINEAGE_TARGET_SAFE_MARGIN = PASS
LINEAGE_RESIZE_ALIGNMENT = PASS
ARCH_1366_VISIBLE_CARD_CLIPPED_COUNT = 0
ARCH_1366_RIGHT_SAFE_MARGIN = PASS
ARCH_RESIZE_SAFE_BOUNDS = PASS
SELECTION_GEOMETRY_STABLE = PASS
GENERIC_PROVENANCE_RENDERED_ENDPOINT_ERROR_MAX_PX = ...
GENERIC_PROVENANCE_PORT_COLLAPSE_COUNT = 0
GENERIC_PROVENANCE_RESIZE_ALIGNMENT = PASS
GENERIC_ARCH_SAFE_BOUNDS = PASS
SELF_VISUAL_QA_ROUNDS = ...
SELF_VISUAL_QA = PASS
SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
EVIDENCE_TRUTH_CHANGED = NO
REVIEWER_SCOPE_EXPANDED = NO | YES
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_BROWSER_SMOKE = PASS
NEXT_ACTION = CHATGPT_REVIEW_DEVELOPER_SCREENSHOTS
```

Do not launch GPT Work after finishing this task.
