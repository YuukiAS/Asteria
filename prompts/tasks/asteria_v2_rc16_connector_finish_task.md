---
id: asteria_v2_rc16_connector_finish
title: Canonical connector terminals, card contact, crossing and footer finish
created_at: 2026-09-14
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Asteria 2.0 RC.16 — Connector / Route Contact Finish

## 0. Goal

RC.15 human review found that the remaining problem is broader than arrow shape alone. The screenshots show:

1. filled arrowheads still look like generic flowchart markers;
2. Lineage `Extends | Preserves` uses an awkward literal divider;
3. multiple Architecture/Evidence connectors visually **hug card borders** before terminating;
4. some Evidence routes take avoidable crossings / wrong visual corridors;
5. endpoint correctness is being judged only by coordinates, not by terminal approach geometry;
6. stable views still show low-value static footer strings such as `Theory / implementation / datasets / limitation / pending`.

This task must implement the canonical connector/contact rules from:

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

Do not start GPT Work. Final next action:

```text
NEXT_ACTION = CHATGPT_REVIEW_DEVELOPER_SCREENSHOTS
```

---

## 1. Scope boundary

RC.16 may change **connector/routing presentation mechanics**, but must not reopen product/scientific architecture.

Allowed:

- reusable arrow terminal helper;
- source/target port selection policy;
- source departure / target terminal stub geometry;
- route candidate scoring;
- edge-edge crossing avoidance;
- card-border clearance / border-hug elimination;
- Lineage relation-label group presentation;
- Evidence/Architecture route finish;
- removal of static footer/placeholder legend UI;
- generic regression fixtures.

Do not change:

- scientific truth / ontology / typed relation semantics;
- trace algorithm semantics;
- session contract;
- Architecture lane packing / Full model semantic layout except tiny clearance needed by routing;
- Evidence claim truth / pending/support status;
- Inspector IA except footer cleanup does not belong there.

Return:

```text
SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
EVIDENCE_TRUTH_CHANGED = NO
ARCH_LAYOUT_CHANGED = NO | MINIMAL_ROUTE_CLEARANCE_ONLY
REVIEWER_SCOPE_EXPANDED = NO
```

---

## 2. Shared canonical open-chevron terminal

Replace stable-facing filled triangle markers across Architecture / Lineage / Evidence with one reusable canonical open-chevron terminal.

Target:

```text
visual size: 5.5–7 CSS px
fill: none
stroke: context edge color
round linecap / linejoin
non-scaling stroke
ordinary and active same physical size
```

Representative geometry:

```text
M 0.7 0.7 L 6.1 3.5 L 0.7 6.3
```

Exact coordinates may be tuned from screenshot review.

Hard fields:

```text
FILLED_TRIANGLE_MARKER_COUNT = 0
CANONICAL_OPEN_CHEVRON = PASS
ARROW_SHAPE_CONSISTENT_ACROSS_VIEWS = PASS
ACTIVE_ARROW_SIZE_EQUALS_BASE = PASS
```

---

## 3. Card-contact contract — only the terminal tip touches the target

The current screenshots show routes that are mathematically outside the card but visually run **along the card border**. This is forbidden.

### 3.1 Target terminal stub

For every connector:

- target arrow tip touches target border at exactly one port;
- final 12–20 CSS px should form a terminal stub approaching approximately perpendicular to the target side;
- the final tangent should be within approximately 15° of the target-side inward normal;
- no non-terminal segment may remain within roughly 6 CSS px of the target border for a visually meaningful distance;
- do not travel along the target border before terminating;
- do not enter via a corner unless the geometry truly requires it and screenshot remains clean.

### 3.2 Source departure stub

Likewise:

- source path leaves from exactly one source port;
- initial 12–20 CSS px should leave approximately perpendicular to the source side;
- do not run along the source border after leaving.

### 3.3 Port-side policy

Use relation geometry rather than nearest-point-only behavior:

```text
clear left -> right relation: source right / target left
clear right -> left relation: source left / target right
same-column vertical relation: source bottom/top -> target top/bottom
```

Obstacle routing may choose another side only when necessary, but terminal/departure stubs still remain normal to the chosen side.

### 3.4 Hard metrics

Implement browser/geometry checks that sample rendered path geometry, not just logical endpoint coordinates.

```text
EDGE_CARD_BORDER_HUG_COUNT = 0
NONTERMINAL_CARD_CLEARANCE_FAIL_COUNT = 0
TERMINAL_NORMAL_ANGLE_FAIL_COUNT = 0
SOURCE_DEPARTURE_ANGLE_FAIL_COUNT = 0
ARROW_CARD_PENETRATION_COUNT = 0
FLOATING_ARROWHEAD_COUNT = 0
PORT_COLLAPSE_COUNT = 0
```

The tests should catch a path that shares the card x/y boundary for a long segment even if the endpoint itself is correct.

---

## 4. Crossing-aware / corridor-aware route scoring

RC.15 route scoring is not enough. A route can avoid cards and still look wrong.

Extend the generic route scoring to include:

```text
edge_edge_crossing_penalty
card_border_hug_penalty
terminal_angle_penalty
region_change_penalty
```

### 4.1 Existing routed edges as soft obstacles

Route edges in deterministic order. Previously routed visible edges should contribute a soft penalty so that avoidable crossings are not chosen merely because card intersection is zero.

Do not require mathematically zero edge crossings in every arbitrary graph. Instead:

- current stable-facing Architecture / Evidence required states should have zero **avoidable** crossings;
- generic fixture should include an alternate-path case proving the engine chooses the non-crossing candidate when available.

Hard fields:

```text
ARCH_AVOIDABLE_EDGE_EDGE_CROSSING_COUNT = 0
EVIDENCE_AVOIDABLE_EDGE_EDGE_CROSSING_COUNT = 0
GENERIC_AVOIDABLE_EDGE_EDGE_CROSSING_COUNT = 0
```

### 4.2 Region / corridor preference

If source and target both lie in the lower half, prefer lower corridor candidates; likewise for upper half.

Do not send a lower relation into the upper half and back down unless obstacle geometry truly requires it.

Report:

```text
ARCH_REGION_CHANGE_FAIL_COUNT = 0
EVIDENCE_REGION_CHANGE_FAIL_COUNT = 0
```

---

## 5. Architecture exact screenshot review

Use CAT-TRACE / Original TRACE only as diagnostic fixtures, not hardcode targets.

Required review:

- CAT Overview selected, 1536 dark;
- CAT Overview trace, 1366 light;
- CAT Full model/Fit;
- Original TRACE 1536;
- resize 1536 -> 1366 -> 1536.

In addition to overlap/clipping, explicitly inspect:

- selected `beta^U_gh` neighborhood: no connector runs along selected/adjacent card border;
- fan-in ports remain separated;
- endpoint side makes visual sense;
- no route becomes a large unnecessary loop;
- no avoidable edge crossing;
- selected card remains stronger than edge/terminal.

Hard fields:

```text
ARCH_ARROW_GESTALT = PASS
ARCH_SELECTED_CARD_PRIMARY = PASS
ARCH_ARROW_VISUAL_NOISE = PASS
ARCH_CARD_CONTACT_GESTALT = PASS
ARCH_ROUTE_CORRIDOR_GESTALT = PASS
```

---

## 6. Lineage relation-label finish

### 6.1 No text separator

Delete literal `|`, slash or vertical divider.

TRACE must render one path-derived group containing two peer capsules:

```text
[ Extends ]  [ Preserves ]
```

Hard:

```text
LINEAGE_LITERAL_SEPARATOR_COUNT = 0
```

### 6.2 No nested pill

- outer relation-label group: positioning only; transparent/no border/no shadow;
- each relation chip: same capsule style;
- single and multi relation groups use identical capsule visual grammar.

Hard:

```text
LINEAGE_OUTER_GROUP_VISUAL_BOX = NONE
LINEAGE_CAPSULE_STYLE_UNIFORM = PASS
```

### 6.3 Path association / clearance

- one group per visual connector;
- anchor from path arc-length 45–55%;
- normal offset 8–12px;
- collision-aware flip to the opposite side;
- no group touches line/card;
- resize keeps association.

Hard:

```text
LINEAGE_LABEL_PATH_ASSOCIATION = PASS
LINEAGE_LABEL_STROKE_INTERSECTION_COUNT = 0
LINEAGE_LABEL_CARD_COLLISION_COUNT = 0
LINEAGE_RESIZE_LABEL_ASSOCIATION = PASS
LINEAGE_CARD_CONTACT_GESTALT = PASS
```

---

## 7. Evidence exact human failures — use as diagnostic fixture

Do not special-case entity IDs. Use these current relations to test the generic contact/crossing mechanism.

### 7.1 South-West Australia plants -> lower claim area

Current screenshot shows a long vertical segment visually sharing the source/target card boundary before the route continues.

After repair:

- source departure is a clean single port;
- route stays in the lower corridor if possible;
- no border-hug segment;
- target approach uses a clean normal terminal stub;
- no avoidable crossing with the nearby Large-graph relation.

### 7.2 Marked discovery theorem / Real-data closure gap

Current vertical relationship visually hugs the right-side cards.

After repair:

- use clean top/bottom ports for same-column vertical relation;
- no vertical segment runs along a side border;
- terminal is clear and isolated.

### 7.3 Open-tail calibration / Real-data closure gap

Prefer a local, readable route. Do not drop and traverse a long horizontal corridor if a shorter soft curve/rounded route exists.

Hard fields:

```text
EVIDENCE_ARROW_GESTALT = PASS
EVIDENCE_SELECTED_CARD_PRIMARY = PASS
EVIDENCE_CARD_CONTACT_GESTALT = PASS
EVIDENCE_ROUTE_CORRIDOR_GESTALT = PASS
```

---

## 8. Remove static pseudo-legends / footer noise

The following stable-facing footer strings are not real legends and should not remain:

```text
Theory / implementation / datasets / limitation / pending
Extends / preserves / borrows / computational inspiration
Evidence relation legend
Lineage relation legend
```

Decision:

- remove Lineage/Evidence raw category footer strings;
- remove placeholder legend labels if they do not open/display an actual legend;
- if a real legend is kept/added, it must contain meaningful visual swatches/status semantics;
- Architecture may keep a useful compact state chip, but remove debug-like category/count footer noise if it adds no reader value.

Hard:

```text
STATIC_CATEGORY_FOOTER_COUNT = 0
PLACEHOLDER_LEGEND_LABEL_COUNT = 0
```

---

## 9. Automated regression must measure rendered contact geometry

Add/update focused browser regression.

At minimum:

1. sample SVG path points near source and target;
2. compare against rendered card `getBoundingClientRect()`;
3. detect non-terminal path within card clearance zone;
4. approximate source/target tangent and card-side normal angle;
5. detect rendered edge-edge intersections excluding shared ports;
6. verify relation target semantics and arrow terminal side;
7. verify resize 1536 -> 1366 -> 1536;
8. verify generic synthetic fixture, not only CAT-TRACE.

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

## 10. Developer visual self-QA — mandatory

External GPT Work is forbidden.

At least two rounds; continue Round 3+ if any obvious issue remains.

Final-round screenshots must include:

```text
cat-overview-selected-1536-dark
cat-overview-trace-1366-light
cat-full-fit-1536-dark
original-trace-1536-dark
architecture-selected-card-contact-closeup
lineage-1536-dark
lineage-1366-dark
lineage-trace-multi-relation-group-closeup
evidence-1536-dark
evidence-card-contact-closeup-top
evidence-card-contact-closeup-bottom
evidence-right-column-vertical-contact-closeup
```

For every graph screenshot explicitly answer:

- Does any connector run along a card border?
- Does every target arrow approach cleanly and normally?
- Is any edge-edge crossing obviously avoidable?
- Is a route crossing top/bottom regions without need?
- Is any terminal attached to the wrong side/corner?
- Does selected object remain primary?

Result fields:

```text
SELF_VISUAL_QA_ROUNDS
SELF_VISUAL_QA_ARROWHEAD
SELF_VISUAL_QA_CARD_CONTACT
SELF_VISUAL_QA_EDGE_CROSSING
SELF_VISUAL_QA_LINEAGE_LABEL_GROUP
SELF_VISUAL_QA_FOOTER_CLEANUP
SELF_VISUAL_QA_ARCH_GESTALT
SELF_VISUAL_QA_EVIDENCE_GESTALT
SELF_VISUAL_QA
VISUAL_SYSTEM_CONFORMANCE
```

If any field FAIL, do not report STATUS=COMPLETE.

---

## 11. Version / public gate

After all checks PASS:

```text
version = 2.0.0-rc.16
commit = v2.0.0-rc.16
push origin/main
HEAD == origin/main
worktree clean
```

Refresh only:

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

---

## 12. Final result fields

Return at least:

```text
STATUS
CURRENT_VERSION
FINAL_COMMIT

FILLED_TRIANGLE_MARKER_COUNT
CANONICAL_OPEN_CHEVRON
ARROW_SHAPE_CONSISTENT_ACROSS_VIEWS
ACTIVE_ARROW_SIZE_EQUALS_BASE

EDGE_CARD_BORDER_HUG_COUNT
NONTERMINAL_CARD_CLEARANCE_FAIL_COUNT
TERMINAL_NORMAL_ANGLE_FAIL_COUNT
SOURCE_DEPARTURE_ANGLE_FAIL_COUNT
ARROW_CARD_PENETRATION_COUNT
FLOATING_ARROWHEAD_COUNT
PORT_COLLAPSE_COUNT

ARCH_AVOIDABLE_EDGE_EDGE_CROSSING_COUNT
EVIDENCE_AVOIDABLE_EDGE_EDGE_CROSSING_COUNT
GENERIC_AVOIDABLE_EDGE_EDGE_CROSSING_COUNT
ARCH_REGION_CHANGE_FAIL_COUNT
EVIDENCE_REGION_CHANGE_FAIL_COUNT

LINEAGE_LITERAL_SEPARATOR_COUNT
LINEAGE_OUTER_GROUP_VISUAL_BOX
LINEAGE_CAPSULE_STYLE_UNIFORM
LINEAGE_LABEL_PATH_ASSOCIATION
LINEAGE_LABEL_STROKE_INTERSECTION_COUNT
LINEAGE_LABEL_CARD_COLLISION_COUNT
LINEAGE_RESIZE_LABEL_ASSOCIATION

STATIC_CATEGORY_FOOTER_COUNT
PLACEHOLDER_LEGEND_LABEL_COUNT

ARCH_ARROW_GESTALT
ARCH_SELECTED_CARD_PRIMARY
ARCH_ARROW_VISUAL_NOISE
ARCH_CARD_CONTACT_GESTALT
ARCH_ROUTE_CORRIDOR_GESTALT
EVIDENCE_ARROW_GESTALT
EVIDENCE_SELECTED_CARD_PRIMARY
EVIDENCE_CARD_CONTACT_GESTALT
EVIDENCE_ROUTE_CORRIDOR_GESTALT
LINEAGE_CARD_CONTACT_GESTALT

SCIENTIFIC_TRUTH_CHANGED
TRACE_ALGORITHM_CHANGED
SESSION_CONTRACT_CHANGED
EVIDENCE_TRUTH_CHANGED
ARCH_LAYOUT_CHANGED
REVIEWER_SCOPE_EXPANDED

SELF_VISUAL_QA_ROUNDS
SELF_VISUAL_QA_ARROWHEAD
SELF_VISUAL_QA_CARD_CONTACT
SELF_VISUAL_QA_EDGE_CROSSING
SELF_VISUAL_QA_LINEAGE_LABEL_GROUP
SELF_VISUAL_QA_FOOTER_CLEANUP
SELF_VISUAL_QA_ARCH_GESTALT
SELF_VISUAL_QA_EVIDENCE_GESTALT
SELF_VISUAL_QA
VISUAL_SYSTEM_CONFORMANCE

PUBLIC_ACCEPTANCE_URL_REFRESHED
PUBLIC_BROWSER_SMOKE
PUBLIC_VERSION

NEXT_ACTION = CHATGPT_REVIEW_DEVELOPER_SCREENSHOTS
```

Do not start GPT Work. Stop after writing result.