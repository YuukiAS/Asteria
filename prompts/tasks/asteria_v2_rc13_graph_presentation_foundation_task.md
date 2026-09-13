---
id: asteria_v2_rc13_graph_presentation_foundation
title: Generic graph presentation foundation for Architecture and provenance connectors
created_at: 2026-09-13
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Asteria 2.0 RC.13 — Generic Graph Presentation Foundation

## 0. 目标

RC.12 的 edge weight 已明显改善，但 ChatGPT 直接审查 developer round-2 screenshots 后仍判定：现在不值得启动 GPT Work，也不值得让用户继续人工验收。

本轮必须先读：

1. `AGENTS.md`
2. `prompts/AGENT_RULES.md`
3. `docs/operations/development/DEVELOPER_VISUAL_SELF_QA_CONTRACT.md`
4. `docs/operations/acceptance/RC12_CHATGPT_SCREENSHOT_REVIEW_2026-09-13.md`
5. `docs/operations/blackbox-audit/VISUAL_ACCEPTANCE_CONTRACT.md`
6. `docs/design/LINEAGE_EVIDENCE_VISUAL_GRAMMAR_SPEC.md`
7. current `ArchitectureWorkspace.tsx`, `viewProjection.ts`, styles, browser tests and RC.12 self-QA scripts.

目标版本：

```text
2.0.0-rc.13
```

这不是 CAT-TRACE/TRACE 两个 example 的专用修补；要修它们暴露的**通用 graph-presentation mechanism**。

完成后：

```text
NEXT_ACTION = CHATGPT_REVIEW_DEVELOPER_SCREENSHOTS
```

不要创建 GPT Work，不要请求用户人工验收。

---

## 1. Generic-fix hard rule

必须遵守 `prompts/AGENT_RULES.md` 新增的 Example/fixture 规则。

禁止为了当前截图过关而新增：

- `if entityId === betaU_gh` 一类视觉分支；
- 只针对 HMSC/TRACE/bigMVP/MGP 的 connector endpoint magic numbers；
- 只让 CAT-TRACE / Original TRACE 当前节点数刚好不重叠的全局 grid magic numbers。

允许：

- model-specific presentation metadata/hints，但必须通过通用 interface；
- canonical semantic layer / relation truth 驱动的 layout；
- dedicated Lineage/Evidence presentation component，但 geometry engine 必须对 source 数量/viewport 变化通用。

最终 result 必须：

```text
GENERIC_FIX = PASS
EXAMPLE_SPECIFIC_HARDCODE_ADDED = NO
GENERIC_REGRESSION_FIXTURE = <test/fixture path>
```

---

## 2. Architecture Full model：从“全局网格”升级为 lane-aware virtual canvas

当前 Full model 的 `packFullArchitectureNodes` 实际只用 semantic lane 来排序，再把节点按全局 8×5 grid 顺序填充。它能避免 bbox overlap，但会破坏 layer locality，导致大量跨列 edge/hairball。

### 2.1 通用 lane packer

实现 reusable architecture packing：

- semantic layer 决定主 x lane；
- observation / measurement / latent / parameterization / inference / prediction-target 保持稳定 lane 顺序；
- 每个 lane 内独立 vertical slot packing；
- 节点多时允许该 lane 使用 presentation-only subcolumn 或增加 virtual canvas height；
- card gap 至少 12–16 CSS px；
- 不因 model node count 变化而退化成全局 row-major grid；
- Original TRACE / CAT-TRACE / 至少一个其它 generic fixture 都走同一底层 packer，除非某 view 明确提供 presentation metadata。

### 2.2 Virtual canvas / Fit

Full model 不要求把所有内容原尺寸硬塞进 viewport。

- build non-overlap virtual canvas；
- Fit = 计算 virtual bounds 后整体缩放；
- Zoom/Pan 在该 virtual canvas 上工作；
- semantic lane x ordering 必须在 Fit 后仍一眼可辨。

### 2.3 Acceptance

1366×768 / 1536×864：

```text
FULL_MODEL_NODE_OVERLAP_COUNT = 0
FULL_MODEL_LAYER_ORDER = PASS
FULL_MODEL_LANE_LOCALITY = PASS
FULL_MODEL_PRIMARY_LABELS = PASS
```

同时人工截图必须判断 edge crossing/hairball 是否显著降低，而不是只看 bbox=0。

---

## 3. Generic node-boundary ports

当前 `sidePort()` 用 percent + width/height heuristic，不是严格 card-rectangle boundary geometry。

实现 reusable boundary-port helper：

输入：

```text
source node rect / target node rect / canvas bounds / optional port index
```

输出：

```text
source boundary point
target boundary point
```

要求：

- connector 从 card 边界出发并在 target card 边界结束；
- 不从 card center 开始；
- 不把 arrowhead 悬在 card 外；
- horizontal/vertical/diagonal relation 都稳定；
- card width/height、viewport、zoom 改变后仍正确。

如果现有百分比 coordinate renderer 不适合精确 rect geometry，可以引入统一 virtual coordinate rect，再映射到 SVG viewBox；不要用 DOM mutation/imperative hack 破坏 React state。

---

## 4. Architecture edge routing / fan-in policy

edge weight 已在 RC.12 收口，本轮重点是 geometry。

建立通用 routing policy：

- ordinary edge 默认使用低曲率路径；
- source/target 同 lane 时避免穿 card；
- cross-lane edge 优先单调 left->right；
- 多条 relation 进入同一 target 时使用稳定 separated target ports，不在一个点汇成星爆；
- selected/trace relation 可增强，但 selected node 必须仍是第一焦点；
- ordinary edge 不能比 selected card 更抢眼；
- relation path 尽量减少穿越第三方 card rect；如果 routing 仍穿 card，test 必须失败。

至少做 browser geometry assertion：

```text
EDGE_CARD_INTERSECTION_COUNT = 0
FLOATING_ARROWHEAD_COUNT = 0
TARGET_PORT_COLLAPSE_COUNT = 0
```

如果完全避免 edge-edge crossing 不现实，不把 edge-edge crossing 设为 0 hard gate；但 developer gestalt 必须判断没有明显 hairball。

---

## 5. Lineage：去掉 fixed y/port/chip percentages

当前 `lineageCards` 把 source `y`、target `port`、chip `left/top`、connector endpoint x 写死。RC.12 screenshot 显示 HMSC/MGP 等 arrowhead 看起来悬在 target 左侧，说明视觉 geometry 与实际 target rect 脱节。

### 5.1 Generic provenance layout

实现 reusable provenance flow：

输入至少包括：

```text
sources[]
target
relations[]
source display copy
relation display chips
```

不要依赖固定 4-source 数量。

### 5.2 Connector geometry

- source card 实际 presentation rect 驱动起点；
- target card actual rect 驱动终点；
- target ports 必须全部位于 target card 左边界内部；
- n 个 source 时，ports 在 target height 内均匀/安全分配；
- arrowhead 必须视觉上触达 target border；
- 同 source-target 多 typed relations 仍可共享一条 visual connector + 多 chips；
- source 数量 3/4/6 的 synthetic fixture 都能正常排。

### 5.3 Relation chips

relation chip 不能独立写死百分比。

- chip anchor 从对应 connector geometry/path 派生；
- chip 与 connector 距离固定；
- chip 不覆盖 source/target card；
- chip 不与其它 chip 重叠；
- viewport resize 后仍跟随对应 connector。

Hard fields：

```text
LINEAGE_CONNECTOR_TOUCH_TARGET = PASS
LINEAGE_FLOATING_ARROWHEAD_COUNT = 0
LINEAGE_PORTS_INSIDE_TARGET = PASS
LINEAGE_CHIP_PATH_ASSOCIATION = PASS
LINEAGE_CHIP_CARD_COLLISION_COUNT = 0
```

---

## 6. Evidence：不重做 IA，只做 routing regression

RC.12 Evidence screenshot 整体可接受。本轮不要扩大产品范围。

只要求：

- 如果共享 boundary-port/routing engine，则 Evidence 使用同样 geometry；
- selected claim 保持主焦点；
- edges 仍克制；
- support/pending/limitation scientific truth 不变；
- no card intersection / no floating arrowhead regression。

不要改 Evidence scientific copy/ontology，除非是 geometry display copy 的纯 presentation bug。

---

## 7. Overview：不要为了 Full model 重构而回退

CAT Overview 当前 edge weight 与 card readability 已比 RC.11 好。

必须保护：

- ordinary edge ~ 当前克制程度；
- active edge 不恢复“荧光笔”视觉；
- selected card > active edge > ordinary edge > muted context；
- selection geometry stable；
- 1366 light trace 仍可读。

实际数值可以在 self-QA 中微调，但必须返回：

```text
ARCH_BASE_EDGE_CSS_PX
ARCH_ACTIVE_EDGE_CSS_PX
ARCH_ACTIVE_TO_BASE_RATIO
```

不应仅靠精确数值判断美观。

---

## 8. Generic regression fixture

除了 CAT-TRACE / Original TRACE，必须增加至少一个不同结构的 presentation regression fixture，验证底层机制不是只为两个 example 写的。

可以使用仓库已有 frequentist/causal fixture；若不适合，则新增测试内 synthetic fixture：

- 3+ semantic lanes；
- 每 lane 不同 node count；
- 至少一个 multi-input target；
- 至少一个 6-source provenance target；
- varied label lengths。

不需要作为新产品 model 暴露给用户；只作为 renderer/layout regression。

必须验证：

```text
GENERIC_FIXTURE_NODE_OVERLAP = 0
GENERIC_FIXTURE_EDGE_CARD_INTERSECTION = 0
GENERIC_PROVENANCE_FLOATING_ARROWHEAD = 0
GENERIC_PROVENANCE_CHIP_COLLISION = 0
```

---

## 9. Developer visual self-QA：这次必须真正看 graph grammar

至少两轮；如果第二轮仍有一眼明显问题继续第三轮。

Required screenshots：

```text
roundN-cat-overview-selected-1536.png
roundN-cat-overview-trace-1366.png
roundN-cat-full-fit-1536.png
roundN-original-trace-1536.png
roundN-lineage-1536.png
roundN-lineage-1366.png
roundN-evidence-1536.png
roundN-generic-layout-fixture.png
roundN-generic-provenance-fixture.png
```

每轮必须回答，不只是写 PASS：

1. arrowheads 是否真正落到 target card border？
2. chips 是否明显属于对应 connector？
3. Full model 是否还像 row-major grid/hairball？
4. semantic lanes 是否一眼可辨？
5. selected node 是否比 edge 更抢眼？
6. 是否存在 card 被 edge 穿过？
7. 1366/1536 resize 后是否仍然成立？

Result 中必须列出 Round 1 findings、Round 2 findings/fixes；如果 Round 2 只是“PASS”没有具体视觉描述，不算满足 self-QA。

---

## 10. Scientific/state freeze

禁止修改：

- Original TRACE / CAT-TRACE scientific truth；
- canonical relation truth / ontology；
- trace algorithm / direction semantics；
- session/save-restore contract；
- Evidence pending/support truth；
- fixed public URL/tunnel identity。

必须返回：

```text
SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
EVIDENCE_TRUTH_CHANGED = NO
```

---

## 11. Tests

新增：

```text
npm run test:architecture-rc13
```

并加入 cumulative regression。

至少运行：

```text
npm run build
npm run test:regression
npm run test:architecture-rc13
npm run bench:architecture-g05
npm run test:browser
git diff --check
```

---

## 12. Version / public gate

更新到：

```text
2.0.0-rc.13
```

写：

```text
results/asteria_v2_rc13_graph_presentation_foundation/result.md
```

完成：

```text
commit = v2.0.0-rc.13
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
PUBLIC_VERSION = 2.0.0-rc.13
```

---

## 13. Required result

```text
STATUS = COMPLETE
CURRENT_VERSION = 2.0.0-rc.13
FINAL_COMMIT = ...

GENERIC_FIX = PASS
EXAMPLE_SPECIFIC_HARDCODE_ADDED = NO
GENERIC_REGRESSION_FIXTURE = ...

FULL_MODEL_NODE_OVERLAP_COUNT = 0
FULL_MODEL_LAYER_ORDER = PASS
FULL_MODEL_LANE_LOCALITY = PASS
FULL_MODEL_PRIMARY_LABELS = PASS
EDGE_CARD_INTERSECTION_COUNT = 0
FLOATING_ARROWHEAD_COUNT = 0
TARGET_PORT_COLLAPSE_COUNT = 0

LINEAGE_CONNECTOR_TOUCH_TARGET = PASS
LINEAGE_FLOATING_ARROWHEAD_COUNT = 0
LINEAGE_PORTS_INSIDE_TARGET = PASS
LINEAGE_CHIP_PATH_ASSOCIATION = PASS
LINEAGE_CHIP_CARD_COLLISION_COUNT = 0

GENERIC_FIXTURE_NODE_OVERLAP = 0
GENERIC_FIXTURE_EDGE_CARD_INTERSECTION = 0
GENERIC_PROVENANCE_FLOATING_ARROWHEAD = 0
GENERIC_PROVENANCE_CHIP_COLLISION = 0

ARCH_BASE_EDGE_CSS_PX = ...
ARCH_ACTIVE_EDGE_CSS_PX = ...
ARCH_ACTIVE_TO_BASE_RATIO = ...

SELF_VISUAL_QA_ROUNDS = ...
SELF_VISUAL_QA_SCREENSHOTS = ...
SELF_VISUAL_QA_GESTALT = PASS
SELF_VISUAL_QA_ROUTING = PASS
SELF_VISUAL_QA_LINEAGE = PASS
SELF_VISUAL_QA_FULL_MODEL = PASS
SELF_VISUAL_QA = PASS

SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
EVIDENCE_TRUTH_CHANGED = NO

PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_BROWSER_SMOKE = PASS
PUBLIC_VERSION = 2.0.0-rc.13

NEXT_ACTION = CHATGPT_REVIEW_DEVELOPER_SCREENSHOTS
```

若 `SELF_VISUAL_QA != PASS` 或 generic fixture 失败，不允许 STATUS=COMPLETE。