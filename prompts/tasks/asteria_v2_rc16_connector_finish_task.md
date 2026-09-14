---
id: asteria_v2_rc16_connector_finish
title: Canonical open-chevron connector terminals and Lineage relation-label finish
created_at: 2026-09-14
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Asteria 2.0 RC.16 — Connector Finish

## 0. Goal

RC.15 fixed major routing/layout/inspector issues, but human review still fails on a much narrower stable-facing finish problem:

1. arrowheads still look like generic flowchart filled triangles;
2. Lineage `Extends | Preserves` uses a literal vertical bar and nested capsule styling, which looks stiff and inconsistent.

This is not a new routing/layout rewrite. Preserve RC.15 geometry and apply the canonical connector visual grammar from:

```text
docs/design/SCIENTIFIC_GRAPH_VISUAL_SYSTEM.md
```

Also read:

```text
AGENTS.md
prompts/AGENT_RULES.md
docs/operations/development/DEVELOPER_VISUAL_SELF_QA_CONTRACT.md
docs/operations/acceptance/RC15_HUMAN_VISUAL_REVIEW_FAILURE_2026-09-14.md
docs/operations/blackbox-audit/VISUAL_ACCEPTANCE_CONTRACT.md
```

Target version:

```text
2.0.0-rc.16
```

Do not start GPT Work. Final next action must be:

```text
NEXT_ACTION = CHATGPT_REVIEW_DEVELOPER_SCREENSHOTS
```

---

## 1. Preserve existing geometry

RC.16 must not reopen broad graph layout work unless a narrowly necessary label-clearance adjustment is required.

Preserve:

- Architecture route selection / route scoring / rounded-route geometry;
- Architecture lane packing and Full model virtual canvas;
- Lineage container-driven source/target geometry and endpoint alignment;
- Evidence IA and routing truth;
- 1366 safe bounds;
- inspector vertical IA;
- scientific truth / trace semantics / session contract.

Return:

```text
ROUTING_GEOMETRY_CHANGED = NO | MINIMAL_LABEL_CLEARANCE_ONLY
SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
EVIDENCE_TRUTH_CHANGED = NO
```

If broad geometry changes become necessary, stop and report instead of silently expanding scope.

---

## 2. Shared canonical arrow terminal

Implement a reusable stable-facing graph terminal / SVG marker definition for Architecture, Lineage, and Evidence.

### 2.1 Shape

The canonical terminal is an **open chevron**, not a filled triangle.

Presentation target:

```text
open V / chevron
5.5–7 CSS px visual footprint
fill: none
stroke: context-stroke or equivalent edge color
round linecap
round linejoin
non-scaling stroke
```

A representative path is:

```text
M 0.7 0.7 L 6.1 3.5 L 0.7 6.3
```

Exact geometry may be tuned, but the screenshot must read as a light editorial direction cue rather than a flowchart arrow.

### 2.2 Reuse

Do not copy three unrelated marker shapes.

Prefer one reusable React/SVG helper or one canonical marker-construction interface with id/prefix input so Architecture / Lineage / Evidence share:

- shape;
- visual size;
- stroke grammar;
- active/base sizing rule.

Different views may tune opacity/color through CSS, but not invent a different marker shape.

### 2.3 State hierarchy

- ordinary and active/selected arrowheads use the **same visual size**;
- active state can increase opacity / edge color / edge stroke only;
- active arrowhead must not grow;
- selected card remains visually stronger than connector terminal;
- ordinary arrowheads may be slightly more muted than active arrowheads.

### 2.4 Geometry

Keep the endpoint guarantees from RC.14/15:

- tip touches target border;
- marker does not penetrate card body;
- fan-in terminals remain separated;
- no floating terminal;
- resize 1536 -> 1366 -> 1536 stays aligned.

Hard fields:

```text
FILLED_TRIANGLE_MARKER_COUNT = 0
CANONICAL_OPEN_CHEVRON = PASS
ARROW_SHAPE_CONSISTENT_ACROSS_VIEWS = PASS
ACTIVE_ARROW_SIZE_EQUALS_BASE = PASS
FLOATING_ARROWHEAD_COUNT = 0
ARROW_CARD_PENETRATION_COUNT = 0
FANIN_ARROWHEAD_COLLISION_COUNT = 0
```

---

## 3. Lineage relation-label group finish

The current TRACE group visibly renders:

```text
Extends | Preserves
```

and code uses a literal divider. This is forbidden by the updated visual system.

### 3.1 Remove text separator

Delete the literal `|` / slash separator from stable-facing relation labels.

For a multi-relation source, render peer capsules inside one positional group:

```text
[ Extends ]  [ Preserves ]
```

There should be 4–6px gap, no textual separator.

Hard field:

```text
LINEAGE_LITERAL_SEPARATOR_COUNT = 0
```

### 3.2 Remove nested-pill appearance

Current outer `lineage-relation-label-group` should be positional only.

- outer group: no border, no background, no shadow, no padding beyond spacing needed for layout;
- each `lineage-relation-chip-part`: the actual capsule with border/background/radius/padding;
- single-relation group and multi-relation group use the same capsule style;
- no outer big pill containing inner pills.

Hard field:

```text
LINEAGE_OUTER_GROUP_VISUAL_BOX = NONE
LINEAGE_CAPSULE_STYLE_UNIFORM = PASS
```

### 3.3 Path association

Keep one relation-label group per visual connector.

- anchor at 45–55% connector arc length;
- derive tangent/normal from connector geometry;
- default offset 8–12px to the visually open/screen-up side;
- if collision occurs, flip to the other side using a generic collision rule;
- keep a visible clearance from the connector stroke;
- resize must preserve the association;
- no label group may intersect source/target card.

Do not use source-specific magic `left/top` coordinates.

Hard fields:

```text
LINEAGE_LABEL_PATH_ASSOCIATION = PASS
LINEAGE_LABEL_STROKE_INTERSECTION_COUNT = 0
LINEAGE_LABEL_CARD_COLLISION_COUNT = 0
LINEAGE_RESIZE_LABEL_ASSOCIATION = PASS
```

---

## 4. Architecture arrow finish

Do not redesign Architecture again.

Keep current route geometry, but visually inspect the new canonical chevron in:

- CAT Overview selected, 1536 dark;
- CAT Overview trace, 1366 light;
- CAT Full model/Fit;
- Original TRACE smoke.

Acceptance:

- no filled flowchart triangles;
- arrows do not become a field of visual noise;
- active edge emphasis comes mainly from stroke/color, not larger terminal;
- selected node stays first focal point;
- direction remains readable.

Hard fields:

```text
ARCH_ARROW_GESTALT = PASS
ARCH_SELECTED_CARD_PRIMARY = PASS
ARCH_ARROW_VISUAL_NOISE = PASS
```

---

## 5. Evidence arrow regression

Evidence currently has acceptable IA. Only adopt the canonical terminal and preserve the current light edge grammar.

Do not alter evidence truth/copy/layout.

Acceptance:

```text
EVIDENCE_ARROW_GESTALT = PASS
EVIDENCE_SELECTED_CARD_PRIMARY = PASS
```

---

## 6. CSS/token cleanup

Remove obsolete presentation rules after the change, including if no longer needed:

- `.lineage-relation-divider`;
- outer relation-label group border/background/shadow used only for nested-pill presentation;
- filled-marker CSS assumptions.

Prefer centralized variables/tokens for:

```text
--graph-arrow-size
--graph-arrow-stroke
--graph-relation-chip-gap
--graph-relation-chip-radius
```

Do not create view-specific magic values unless the canonical spec explicitly permits a view token.

---

## 7. Developer visual self-QA — mandatory

External GPT Work is forbidden for this task. Codex must visually inspect real rendered screenshots.

At least two rounds. If round 2 is still aesthetically rough, continue round 3.

Required screenshot set each final round:

```text
cat-overview-selected-1536-dark
cat-overview-trace-1366-light
cat-full-fit-1536-dark
original-trace-1536-dark
lineage-1536-dark
lineage-1366-dark
lineage-trace-multi-relation-group-closeup
evidence-1536-dark
```

The Lineage screenshot review must explicitly answer:

- Is TRACE shown as two sibling capsules with no `|`?
- Do all four relation groups use the same visual format?
- Does every group visibly belong to its connector?
- Do arrowheads look like small editorial chevrons rather than filled flowchart triangles?

The Architecture review must explicitly answer:

- Are arrowheads subordinate to selected cards?
- Are arrowheads consistent across ordinary and active edges?
- Does 1366 trace remain readable without terminal clutter?

Result fields:

```text
SELF_VISUAL_QA_ROUNDS = n
SELF_VISUAL_QA_ARROWHEAD = PASS | FAIL
SELF_VISUAL_QA_LINEAGE_LABEL_GROUP = PASS | FAIL
SELF_VISUAL_QA_ARCH_GESTALT = PASS | FAIL
SELF_VISUAL_QA_EVIDENCE_GESTALT = PASS | FAIL
SELF_VISUAL_QA = PASS | FAIL
VISUAL_SYSTEM_CONFORMANCE = PASS | FAIL
```

If any field is FAIL, do not report STATUS=COMPLETE.

---

## 8. Automated regression

Add/update focused regression for the exact presentation failures.

At minimum assert:

- no filled-triangle marker in stable graph renderers;
- no literal `|` / `/` separator node inside Lineage relation group;
- outer group computed border/background are visually transparent/none;
- multi relation group contains two sibling capsule parts;
- open-chevron marker footprint does not change between ordinary and active states;
- rendered target endpoint remains correct after resize;
- Architecture/Evidence still have no card intersection regression.

Commands:

```text
npm run build
npm run test:regression
npm run test:architecture-rc16
npm run bench:architecture-g05
npm run test:browser
git diff --check
```

---

## 9. Version / public gate

After all checks and self-QA PASS:

```text
version = 2.0.0-rc.16
commit = v2.0.0-rc.16
push origin/main
HEAD == origin/main
worktree clean
```

Refresh only the fixed public URL:

```text
https://asteria.httpwwwcardiacnexus-ukb.com/
```

Verify:

```text
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_ROOT_CHECK = PASS
PUBLIC_STATUS_CHECK = PASS
PUBLIC_BROWSER_SMOKE = PASS
PUBLIC_VERSION = 2.0.0-rc.16
```

Do not create alternate URL / quick tunnel / VPS proxy.

---

## 10. Final result fields

Return at least:

```text
STATUS
CURRENT_VERSION
FINAL_COMMIT

FILLED_TRIANGLE_MARKER_COUNT
CANONICAL_OPEN_CHEVRON
ARROW_SHAPE_CONSISTENT_ACROSS_VIEWS
ACTIVE_ARROW_SIZE_EQUALS_BASE
FLOATING_ARROWHEAD_COUNT
ARROW_CARD_PENETRATION_COUNT
FANIN_ARROWHEAD_COLLISION_COUNT

LINEAGE_LITERAL_SEPARATOR_COUNT
LINEAGE_OUTER_GROUP_VISUAL_BOX
LINEAGE_CAPSULE_STYLE_UNIFORM
LINEAGE_LABEL_PATH_ASSOCIATION
LINEAGE_LABEL_STROKE_INTERSECTION_COUNT
LINEAGE_LABEL_CARD_COLLISION_COUNT
LINEAGE_RESIZE_LABEL_ASSOCIATION

ARCH_ARROW_GESTALT
ARCH_SELECTED_CARD_PRIMARY
ARCH_ARROW_VISUAL_NOISE
EVIDENCE_ARROW_GESTALT
EVIDENCE_SELECTED_CARD_PRIMARY

ROUTING_GEOMETRY_CHANGED
SCIENTIFIC_TRUTH_CHANGED
TRACE_ALGORITHM_CHANGED
SESSION_CONTRACT_CHANGED
EVIDENCE_TRUTH_CHANGED
REVIEWER_SCOPE_EXPANDED

SELF_VISUAL_QA_ROUNDS
SELF_VISUAL_QA_ARROWHEAD
SELF_VISUAL_QA_LINEAGE_LABEL_GROUP
SELF_VISUAL_QA_ARCH_GESTALT
SELF_VISUAL_QA_EVIDENCE_GESTALT
SELF_VISUAL_QA
VISUAL_SYSTEM_CONFORMANCE

PUBLIC_ACCEPTANCE_URL_REFRESHED
PUBLIC_BROWSER_SMOKE
PUBLIC_VERSION

NEXT_ACTION = CHATGPT_REVIEW_DEVELOPER_SCREENSHOTS
```

Do not start GPT Work. Stop after writing the result.