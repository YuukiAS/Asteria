---
id: asteria_v2_rc15_visual_system
title: Implement canonical scientific graph visual system across Architecture Lineage Evidence and Inspector
created_at: 2026-09-14
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Asteria 2.0 RC.15 — Scientific Graph Visual System

## 0. 背景与目标

RC.14 已修正 coordinate-space mismatch 与 floating endpoint，但用户直接查看实际页面后仍判视觉 FAIL：

- Architecture 像 electrical wiring；
- Lineage relation chip attach 规则不一致；
- Evidence relation 也出现硬直角线路图感；
- Evidence/Lineage inspector 中 Search 与 Primary Inspector 之间出现 tiny clipped/scroll strip。

本轮不是继续补单条 edge，而是实现统一 visual system。

必须先读：

1. `AGENTS.md`
2. `prompts/AGENT_RULES.md`
3. `docs/design/SCIENTIFIC_GRAPH_VISUAL_SYSTEM.md`
4. `docs/operations/acceptance/RC14_HUMAN_VISUAL_REVIEW_FAILURE_2026-09-14.md`
5. `docs/operations/development/DEVELOPER_VISUAL_SELF_QA_CONTRACT.md`
6. `docs/operations/blackbox-audit/VISUAL_ACCEPTANCE_CONTRACT.md`
7. current `graphPresentation.ts`, `viewProjection.ts`, `ArchitectureWorkspace.tsx`, `ArchitectureReferencePanel.tsx`, styles and browser tests.

目标版本：

```text
2.0.0-rc.15
```

完成后：

```text
NEXT_ACTION = CHATGPT_REVIEW_DEVELOPER_SCREENSHOTS
```

不要生成 GPT Work，不要请求用户人工验收。

---

## 1. Scientific/state freeze

禁止改变：

- Original TRACE / CAT-TRACE Frozen V2 scientific truth；
- canonical entities / relation truth / ontology；
- Evidence pending/support/limitation truth；
- trace semantics / direction algorithm；
- session contract；
- model/view identity；
- fixed public URL。

必须返回：

```text
SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
EVIDENCE_TRUTH_CHANGED = NO
```

---

## 2. Architecture：从“避障线路图”升级为 scientific model flow

### 2.1 Router 仍负责 geometry，renderer 负责 visual grammar

当前 `routeBoundaryEdge()` 候选 route 多为 polyline，且通过 `polylinePath()` 直接输出硬 `M/L`，导致几何正确但视觉像线路板。

重构为：

```text
routeBoundaryEdge -> logical route points / ports / metadata
renderScientificRoute(points, grammar) -> SVG path
```

不要让 route engine 直接决定最终“硬折线”视觉。

### 2.2 Simple path priority

不同 lane 且无 obstacle 的普通 relation：

- 默认使用轻微 S-shaped cubic Bezier；
- left-to-right monotone；
- 曲率克制；
- source/target 使用 boundary ports；
- 不引入额外 bend。

### 2.3 Obstacle route

需要绕 card 时：

- 允许 orthogonal logical route；
- 最终 rendering 必须 rounded orthogonal；
- corner radius 10–16 CSS px；
- 优先 1–2 bends；
- 禁止 raw 90° `L` 成为最终主视觉。

### 2.4 Candidate score

不要再选择“第一个不碰 obstacle 的 candidate”。为 candidate 计算通用 score：

```text
pathLength
+ bendCount * BEND_PENALTY
+ backwardXDistance * BACKWARD_PENALTY
+ outsideSourceTargetCorridor * DETOUR_PENALTY
+ nearThirdPartyCard * PROXIMITY_PENALTY
+ targetPortCrowding * PORT_PENALTY
```

对 cross-lane left->right relation：

- backward x 应有高 penalty；
- 极端 top/bottom detour 应有高 penalty；
- 短、单调、少 bend 的 route 优先。

### 2.5 Geometry must stay stable

selection / trace 只修改 style，不修改 route geometry。

### 2.6 Architecture acceptance

1536 dark / 1366 light，Overview + Full model：

```text
ARCH_ELECTRICAL_WIRING_GESTALT = PASS
ARCH_RAW_90_DEGREE_DOMINANT_ROUTE_COUNT = 0
ARCH_EXCESSIVE_DETOUR_COUNT = 0
ARCH_EDGE_CARD_INTERSECTION_COUNT = 0
ARCH_FLOATING_ARROWHEAD_COUNT = 0
ARCH_NODE_OVERLAP_COUNT = 0
ARCH_SELECTION_GEOMETRY_STABLE = PASS
```

这里 `RAW_90_DEGREE_DOMINANT_ROUTE_COUNT=0` 不代表禁止任何 orthogonal logical route；意思是最终可见 connector 必须使用 rounded corner / soft path，不得像裸线路图。

---

## 3. Lineage：统一 relation-label grammar

当前 connector endpoint 已正确触达 target，保留该修复。

### 3.1 One connector = one relation-label group

每个 source-target visual connector 只有一个 label group。

- single relation：一个 capsule；
- multi relation：同一个 group 内多个 compact chips；
- `TRACE -> CAT-TRACE` 的 `Extends` + `Preserves` 必须属于同一 group；
- 禁止两个 chip 分散在 connector 不同位置。

### 3.2 Path-derived anchor

label group position 必须来自 connector 几何：

- arc-length 45–55%；
- 计算 path tangent / normal；
- group 沿 normal 偏移 8–12px；
- resize 后重新计算；
- 禁止固定 left/top 百分比。

### 3.3 Capsule style

统一 component，例如：

```text
RelationLabelGroup
  padding 4–6px horizontal
  font 10–11px semibold
  neutral panel background 94–98% opacity
  1px border
  6–8px radius
  subtle shadow
```

Lineage 所有关系都用同一格式，不能有的“贴线”、有的“游离”。

### 3.4 Lineage acceptance

```text
LINEAGE_CONNECTOR_TOUCH_TARGET = PASS
LINEAGE_FLOATING_ARROWHEAD_COUNT = 0
LINEAGE_PORT_SEPARATION = PASS
LINEAGE_RELATION_GROUP_COUNT = VISUAL_CONNECTOR_COUNT
LINEAGE_MULTI_RELATION_GROUPING = PASS
LINEAGE_LABEL_PATH_ASSOCIATION = PASS
LINEAGE_LABEL_CARD_COLLISION_COUNT = 0
LINEAGE_RESIZE_ALIGNMENT = PASS
LINEAGE_GESTALT = PASS
```

---

## 4. Evidence：claim-centered soft routing

不要改 Evidence IA / truth / copy。

### 4.1 Visual routing

Evidence 不得继续看起来像电路图：

- simple relation 使用 soft cubic；
- obstacle relation 使用 rounded orthogonal；
- base edge 比 Architecture 更轻；
- selected claim/card 始终是第一视觉焦点；
- relation 不显示长句；
- no raw 90-degree long wiring。

### 4.2 Acceptance

```text
EVIDENCE_ELECTRICAL_WIRING_GESTALT = PASS
EVIDENCE_EDGE_CARD_INTERSECTION_COUNT = 0
EVIDENCE_FLOATING_ARROWHEAD_COUNT = 0
EVIDENCE_SELECTED_CARD_PRIMARY = PASS
EVIDENCE_TRUTH_CHANGED = NO
```

---

## 5. Inspector：重做 stable-facing vertical IA

用户截图中 Evidence Search 与 Claim Inspector 之间出现高度很小、带 scrollbar/半截控件的 strip。

### 5.1 Single-scroll principle

右侧 inspector：

- 只有 `.inspector` 是主 vertical scroll container；
- 公式可 horizontal scroll；
- Search results 可有明确 max-height list，但不能形成 10–30px tiny strip；
- 禁止非 Architecture view 的 duplicate mini canvas 作为 Primary Inspector 前置区。

### 5.2 Non-Architecture order

Lineage / Evidence 必须按：

```text
Heading
Context helper
View tabs
View help
Search
Primary Method/Claim Inspector
Relations / Closure gaps
Session / Advanced (如适用)
```

当前 `MultiViewPanel` 中的 `research-view-canvas` 若只是重复中央主图，应从 inspector path 移除；如果保留 entity navigator，改成正常高度的 collapsed/list section，且默认不挡 Primary Inspector。

### 5.3 Hard constraints

```text
INSPECTOR_TINY_SECTION_COUNT = 0
INSPECTOR_NESTED_VERTICAL_SCROLLBAR_COUNT = 0
PRIMARY_INSPECTOR_AFTER_SEARCH_GAP_PX <= 20
PRIMARY_INSPECTOR_FIRST_SCREEN_VISIBLE = PASS
```

1366×768 和 1536×864 都测。

---

## 6. Visual tokens implementation

将 `docs/design/SCIENTIFIC_GRAPH_VISUAL_SYSTEM.md` 中的核心 tokens 落地为可维护的 CSS variables / utility classes，避免各 view 自己随意写数值。

至少建立：

```text
--graph-edge-architecture-base
--graph-edge-architecture-active
--graph-edge-lineage-base
--graph-edge-lineage-active
--graph-edge-evidence-base
--graph-edge-evidence-active
--graph-arrow-size
--graph-route-corner-radius
--graph-relation-label-offset
```

数值允许在 self-QA 中微调，但三类 view 必须有一致 scale hierarchy。

---

## 7. Reusable components / helpers

优先抽象：

```text
renderScientificRoute / roundedPolylinePath
scoreRouteCandidate
RelationLabelGroup
pathPointAndNormalAt
```

不要在 Architecture/Lineage/Evidence 各复制一套近似实现。

---

## 8. Generic regression fixtures

除了 CAT-TRACE / Original TRACE：

1. generic lane graph：测试 simple / obstacle / same-lane / fan-in；
2. generic provenance 3/4/6 sources：测试 relation group 与 resize；
3. generic evidence mini graph：至少包含 claim + support + limitation，验证 soft routing。

禁止只靠当前三个页面截图过关。

---

## 9. Developer visual self-QA

至少 2 轮；如果 Round 2 仍一眼有 wiring / floating labels / tiny inspector strip，继续 Round 3。

每轮必须截图：

- CAT Overview selected 1536 dark；
- CAT Overview trace 1366 light；
- CAT Full model Fit 1536；
- Original TRACE 1536；
- Lineage 1536；
- Lineage 1366；
- Evidence 1536；
- Evidence 1366；
- right inspector Evidence 首屏 1366；
- generic route fixture；
- generic provenance fixture。

自审必须逐项写：

```text
SELF_VISUAL_QA_ARCH_ROUTE_AESTHETICS
SELF_VISUAL_QA_LINEAGE_LABEL_GRAMMAR
SELF_VISUAL_QA_EVIDENCE_ROUTE_AESTHETICS
SELF_VISUAL_QA_INSPECTOR_VERTICAL_IA
SELF_VISUAL_QA_SELECTED_FOCUS
SELF_VISUAL_QA_GESTALT
SELF_VISUAL_QA
```

任何一项 FAIL 不得 STATUS=COMPLETE。

---

## 10. Automated verification

新增：

```text
npm run test:architecture-rc15
```

并纳入 cumulative regression。

运行：

```text
npm run build
npm run test:regression
npm run test:architecture-rc15
npm run bench:architecture-g05
npm run test:browser
git diff --check
```

---

## 11. Version / public gate

完成：

```text
version = 2.0.0-rc.15
commit = v2.0.0-rc.15
push origin/main
HEAD == origin/main
worktree clean
```

刷新固定公网：

`https://asteria.httpwwwcardiacnexus-ukb.com/`

必须：

```text
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_ROOT_CHECK = PASS
PUBLIC_STATUS_CHECK = PASS
PUBLIC_BROWSER_SMOKE = PASS
PUBLIC_VERSION = 2.0.0-rc.15
```

不要创建 alternate URL / quick tunnel / VPS proxy。

---

## 12. Required result fields

```text
STATUS = COMPLETE | BLOCKED
CURRENT_VERSION = 2.0.0-rc.15
FINAL_COMMIT = ...

ARCH_ELECTRICAL_WIRING_GESTALT = PASS | FAIL
ARCH_RAW_90_DEGREE_DOMINANT_ROUTE_COUNT = 0
ARCH_EXCESSIVE_DETOUR_COUNT = 0
ARCH_EDGE_CARD_INTERSECTION_COUNT = 0
ARCH_FLOATING_ARROWHEAD_COUNT = 0
ARCH_SELECTION_GEOMETRY_STABLE = PASS

LINEAGE_CONNECTOR_TOUCH_TARGET = PASS
LINEAGE_FLOATING_ARROWHEAD_COUNT = 0
LINEAGE_PORT_SEPARATION = PASS
LINEAGE_RELATION_GROUP_COUNT = ...
LINEAGE_VISUAL_CONNECTOR_COUNT = ...
LINEAGE_MULTI_RELATION_GROUPING = PASS
LINEAGE_LABEL_PATH_ASSOCIATION = PASS
LINEAGE_LABEL_CARD_COLLISION_COUNT = 0
LINEAGE_RESIZE_ALIGNMENT = PASS
LINEAGE_GESTALT = PASS

EVIDENCE_ELECTRICAL_WIRING_GESTALT = PASS
EVIDENCE_EDGE_CARD_INTERSECTION_COUNT = 0
EVIDENCE_FLOATING_ARROWHEAD_COUNT = 0
EVIDENCE_SELECTED_CARD_PRIMARY = PASS

INSPECTOR_TINY_SECTION_COUNT = 0
INSPECTOR_NESTED_VERTICAL_SCROLLBAR_COUNT = 0
PRIMARY_INSPECTOR_AFTER_SEARCH_GAP_PX = ...
PRIMARY_INSPECTOR_FIRST_SCREEN_VISIBLE = PASS

GENERIC_FIX = PASS
EXAMPLE_SPECIFIC_HARDCODE_ADDED = NO
GENERIC_REGRESSION_FIXTURE = ...

SELF_VISUAL_QA_ROUNDS = n
SELF_VISUAL_QA_ARCH_ROUTE_AESTHETICS = PASS
SELF_VISUAL_QA_LINEAGE_LABEL_GRAMMAR = PASS
SELF_VISUAL_QA_EVIDENCE_ROUTE_AESTHETICS = PASS
SELF_VISUAL_QA_INSPECTOR_VERTICAL_IA = PASS
SELF_VISUAL_QA_SELECTED_FOCUS = PASS
SELF_VISUAL_QA_GESTALT = PASS
SELF_VISUAL_QA = PASS

SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
EVIDENCE_TRUTH_CHANGED = NO
REVIEWER_SCOPE_EXPANDED = NO | YES

PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_BROWSER_SMOKE = PASS
PUBLIC_VERSION = 2.0.0-rc.15
NEXT_ACTION = CHATGPT_REVIEW_DEVELOPER_SCREENSHOTS
```

完成后停止；不要启动 GPT Work。
