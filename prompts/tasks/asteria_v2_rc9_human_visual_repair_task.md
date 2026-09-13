---
id: asteria_v2_rc9_human_visual_repair
title: Repair final human-acceptance visual blockers across Architecture, Lineage, Evidence, math rendering, and copy
created_at: 2026-09-13
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Asteria 2.0 RC.9 — Human Visual Acceptance Repair

## 0. 状态与目标

RC.8 的 GPT Work gate 曾通过，但用户最终人工验收明确 FAIL。不要争论此前 Work PASS；human blocker 优先。

先读：

1. `AGENTS.md`
2. `prompts/AGENT_RULES.md`
3. `docs/operations/acceptance/RC8_HUMAN_ACCEPTANCE_FAILURE_2026-09-13.md`
4. `docs/operations/blackbox-audit/VISUAL_ACCEPTANCE_CONTRACT.md`
5. `docs/operations/blackbox-audit/UI_BLACKBOX_BROWSER_CONTRACT.md`
6. `docs/notes/2026-09-12_asteria_acceptance_mode_public_refresh_contract.md`
7. `docs/notes/2026-09-09_trace_and_cat_trace_reference_for_asteria_v2.md`
8. 当前 `ArchitectureWorkspace.tsx`, `ArchitectureReferencePanel.tsx`, `viewProjection.ts`, `RenderedMath.tsx`, `semanticDiff.ts`, `multiViewTraceProject.ts`, styles, Playwright tests 与相关 validators。

目标版本：

```text
2.0.0-rc.9
```

本轮不是新增 feature，而是把当前 2.0 Web shell 从“功能完整但视觉像工程原型”修到可以重新进入 human acceptance。

完成后：

```text
NEXT_ACTION = GPT_WORK_FULL_REAUDIT_W01_W06
```

不要发布 `2.0.0` stable。

---

## 1. Scientific truth freeze

禁止改变：

- Original TRACE / CAT-TRACE Frozen V2 scientific definitions；
- canonical entities / relation truth / ontology；
- `gamma_g = gamma_0 pi_g` derived semantics；
- `p_g` fixed computational truncation semantics；
- `nu` not-intercept semantics；
- finite working set / residual normalization semantics；
- Evidence pending/support/limitation truth；
- first-paper dataset set；
- v1 -> v2 migration compatibility；
- fixed public URL / DNS / tunnel identity。

允许改变：

- presentation-only Overview baseline；
- layout coordinates / packing / edge ports / edge-label placement；
- relation-label presentation；
- motion / transition；
- stable-facing copy；
- math rendering metadata/component；
- Lineage/Evidence presentation positions；
- browser/visual regression coverage。

如果发现必须修改 scientific truth，停止并在 result 标记 blocker；不要自行扩 ontology。

---

## 2. Architecture：selection 前后必须是“同一张地图”，不能重新排布

### 2.1 修复当前 reflow 根因

当前 `buildProjectionLayout` 会基于**当前 display subset**计算 min/max，再 normalize 到百分比。selected/trace reveal 改变 subset 后，已有节点位置会跟着重算，造成点击后的全图位移/僵硬动画。

RC.9 必须改成稳定坐标体系：

- normalize bounds 使用 canonical view/full projection bounds，不能使用当前 visible subset bounds；
- 同一个 model/detail level 下，selection/trace/reveal 不能改变已有 shared node 的坐标；
- reveal 的 context node 可以新增/消失，但已有节点必须保持原位；
- Overview ↔ Full model 可以是两个 presentation state，但各自内部 selection 必须稳定。

Playwright 必须直接记录至少 10 个 shared node 的 `getBoundingClientRect()`：

```text
initial overview
-> select y^U_igh
-> select gamma_g
-> select beta^U_gh
```

除新增/删除节点外，shared-node center delta 应接近 0（允许 < 2 CSS px 的 rounding）。

### 2.2 禁止 geometry transition

当前 graph node 不得使用 generic `transition: all` 或等价行为。

只允许轻量过渡：

- opacity
- border-color
- background-color
- box-shadow
- stroke / stroke-opacity

建议 100–160ms。`left/top/transform(width/height position)` 不得因 selection 被动画。

新 reveal context 可以轻淡入，但不能滑动整张图。

---

## 3. Architecture Overview：重新做 deterministic non-overlap presentation

用户人工截图显示 Overview 右侧 `alpha^U_gh / beta^U_gh / gamma_g / p_g / nu / a_g / v^U_gh` 明显堆叠。

### 3.1 Overview baseline 进一步收敛

不要把 decomposition 的所有叶子节点同时放在 baseline。

Baseline 应优先表达主故事：

```text
observed inputs
-> catalogue/open-tail identity split
-> latent probit branch
-> main open-tail parameterization
-> calibration / truncation
-> residual scope
-> inference / target
```

建议 baseline 直接可见：

- `Y_raw`
- `x_i`
- `c(f)`
- `g(f)`
- `mathcal K`
- `mathcal U`
- `mathcal G`
- `y^U_igh`
- `z^U_igh`
- `alpha^U_gh`
- `beta^U_gh`
- `gamma_g`
- `p_g`
- `Sigma_W`
- inference
- richness/discovery target

`nu / a_g / v^U_gh` 默认可由选择 `beta^U_gh` 后 reveal；`gamma_0 / pi_g` 默认可由选择 `gamma_g` 后 reveal。不要删除 canonical entities，只做 projection-level disclosure。

`x_i` 是 probit 主方程输入，Overview 必须直接可见，不能因为降密度被省略。

### 3.2 Non-overlap invariant

为 CAT-TRACE Overview 做 deterministic lane packing / explicit presentation positions，不能继续只靠全图 positions normalize 后挤压。

在 1536×864 和 1366×768：

- node/card bounding boxes 互不相交；
- card 至少保留 10–14 CSS px 空隙；
- key symbol + human label 完整可读；
- `x_i`, `Y_raw`, `c(f)`, `mathcal U`, `y^U_igh`, `z^U_igh`, `alpha^U_gh`, `beta^U_gh`, `gamma_g`, `p_g`, `Sigma_W`, target 不得被遮挡；
- reveal context 后依然不得与既有 card 相交。

如果 lane 内节点过多，使用 presentation-only vertical slots / compact secondary card，而不是把 card 叠在一起。

### 3.3 Full model

Full model 允许密，但：

- primary symbol/title 不得被邻卡或 relation label 遮住；
- Zoom/Fit/Pan 保留；
- `title`/tooltip 提供完整 human label；
- key nodes 仍应在 Fit 后可定位。

---

## 4. Edge / arrow / relation-label：彻底改掉“文字压在线上”的视觉

人工截图中 `parameterized by`, `derived from`, `targets` 等大号文字直接横穿节点；Lineage 中长句横跨整条曲线。

### 4.1 Architecture

- 默认 non-selected/non-trace edges 不显示 inline text；
- selected / active trace 只显示**少量 concise label**；
- 不直接渲染 raw relation type (`parameterized_by`, `derived_from` 的 type string) 作为画布主标签；
- 优先使用 relation 的短 human label；如果原 label 太长，提供 presentation-only short label map；
- label 使用 compact 10–11px pill / halo，而不是 SVG 中按 viewBox 放大的裸文字；
- label box 不得覆盖 node/card；
- edge 从 card side ports 出发/进入，避免穿过 card body 和主要文字；
- 多条同源/同目标边应有稳定 offset，避免完全重合。

### 4.2 Lineage

当前大段：

- borrows interpretation from
- computationally inspired by
- uses methodological component from

不得继续直接铺在线上。

Lineage 应保持左→右 source -> CAT-TRACE target 的清楚结构，但：

- source cards 对齐；
- target card 留足右侧 margin，不贴边；
- line 本身简洁；
- relation 用短 compact chip / selected inspector / legend；
- 若必须 inline，最长不超过约 2–3 个词，字号与 card secondary label 一致；
- `extends` / `preserves` 可短标签；其余长关系写到 inspector/legend。

### 4.3 Evidence

Evidence 同样禁止把 support/pending/limitation 长句铺在线路上。

优先：

- edge tone + short status tag (`supports`, `pending`, `limited by`)；
- selected entity inspector 展示完整 relation explanation；
- relation text 不能遮 node。

---

## 5. Edge-label collision regression

新增 browser helper/assertion：

- 获取所有 visible `.architecture-map-node` rect；
- 获取所有 visible relation label rect（如果用 HTML pill/SVG text 均可）；
- 对 active/selected labels 断言不与 node primary rect 相交；
- 允许 edge path 穿越空白，但不得穿过 node text/card body（可通过 path port 设计 + screenshot evidence 检查）。

至少覆盖：

- Architecture `y^U_igh` selected；
- Architecture `gamma_g` selected；
- Architecture `beta^U_gh` trace ON；
- Lineage；
- Evidence。

---

## 6. Semantic Diff：数学必须渲染，copy 必须逐项有意义

### 6.1 禁止 raw math 主显示

当前 `semanticDiff.ts` 中存在：

- `mathcal K`
- `a_g`
- `p_g^*`
- `gamma_0`
- `pi_g`
- `gamma_g`
- `beta^U_gh`
- `Sigma_W`

这些不得以 raw ASCII/canonical string 作为主 UI。

不要用脆弱 regex 把整段 prose 猜成 LaTeX。优先把 diff item 变成结构化 presentation，例如：

```text
labelParts: text + math
beforeLatex / afterLatex
why
```

或等价 typed display metadata。

canonical export/source string 可以保留；主 UI 用 `RenderedMath` / structured inline math。

### 6.2 `Why it matters` 必须 item-specific

删除 generic：

`New CAT-TRACE structure that Original TRACE does not expose.`

每个 diff item 给具体统计意义，例如：

- finite catalogue：把已知 catalogue identities 与开放尾部 discovery 分开；
- grouping：允许 biological group deviations，同时保留 shared response；
- grouped truncation：保留 anonymous zero slots 的 likelihood 信息；
- gamma composition：把 total open-tail intensity 与 group allocation 分开；
- catalogue slope：catalogue branch 可使用 trait/relatedness，而 open tail 保持 grouped response；
- residual dependence：相关结构只定义在 finite working set，保持 marginal probit normalization。

不要写营销语言，不要写“why it matters because it is new”。

### 6.3 stable-facing copy cleanup

主 UI 中移除/改写以下内部口吻：

- `Web RC`
- `fixture`
- `G05`
- `canonical source string`
- `selected method`
- `first-paper data line`

如果实现/benchmark 信息有价值，移到 `Advanced / Export & validation`。

---

## 7. Inspector / trace control 视觉清理

人工截图中 trace 控件附近出现窄小的 clipped/scroll strip，整体像内部控件堆叠。

检查并修复：

- 不应出现无意义的水平/垂直 scroll strip；
- Trace on / counters / legend / Clear 分组层级清楚；
- 不让 chip 自动换行成杂乱堆叠；
- 1366 inspector 宽度下仍整洁。

不要改变 trace semantics。

---

## 8. Lineage / Evidence copy 与 graph grammar

### Lineage

保留真实方法关系，但主画布只展示：

- TRACE
- HMSC
- bigMVP
- sparse factor/MGP
- CAT-TRACE

角色 secondary label 改为自然、短语化：

- TRACE: `Open-tail foundation`
- HMSC: `Ecological hierarchy`
- bigMVP: `Scalable probit computation`
- MGP: `Factor shrinkage`
- CAT-TRACE: `Catalogue-aware extension`

不要在 card 上显示 `interpretation source / methodological component / selected method` 这类 schema role。

完整 provenance/typed relation 保留在 inspector/Advanced。

### Evidence

同理：主 card 用 claim / proof / dataset / implementation / gap 的自然标签；不要暴露 `G05 stress fixture` / `Asteria implementation fixtures` 这种内部命名作为主视觉。

scientific truth 不变；只是 stable-facing display label/copy。

---

## 9. Mandatory visual regression suite

新增：

```text
npm run test:architecture-rc9
```

并更新 cumulative regression。

Playwright 至少生成并检查：

1. `rc9-architecture-overview-dark-1536.png`
2. `rc9-architecture-overview-light-1366.png`
3. `rc9-select-yU-dark-1536.png`
4. `rc9-select-gamma-g-dark-1536.png`
5. `rc9-trace-betaU-dark-1536.png`
6. `rc9-full-model-fit-dark-1536.png`
7. `rc9-original-trace-dark-1536.png`
8. `rc9-lineage-dark-1536.png`
9. `rc9-lineage-dark-1366.png`
10. `rc9-evidence-dark-1536.png`
11. `rc9-semantic-diff.png`
12. `rc9-trace-controls-1366.png`

硬断言：

```text
NO_NODE_OVERLAP = PASS
NO_EDGE_LABEL_CARD_COLLISION = PASS
NO_PRIMARY_TEXT_CLIPPING = PASS
SELECTION_GEOMETRY_STABLE = PASS
NO_RAW_MATH_MAIN_UI = PASS
NO_GENERIC_DIFF_WHY_COPY = PASS
```

并做连续点击动态验收：

```text
yU -> gamma_g -> betaU -> c(f) -> clear -> betaU trace
```

浏览器录屏不是必须，但至少保存 before/after screenshots + geometry measurements。

---

## 10. Motion regression

静态 source/test 必须确认：

- graph node 不含 generic transition-all；
- selection 不改变 shared-node layout coordinates；
- relation-label appearance 可以 fade，但不做大位移动画。

Browser 中连续点击时，如果肉眼仍出现全图滑动/跳动，任务不得标 PASS。

---

## 11. Tests / verification

运行：

```text
npm run build
npm run test:regression
npm run test:architecture-rc9
npm run bench:architecture-g05
npm run test:browser
git diff --check
```

性能不应因为 presentation repair 出现明显退化。

---

## 12. Version / result / commit

更新：

- `package.json`, lockfile -> `2.0.0-rc.9`；
- app visible version；
- `CHANGELOG.md`；
- `README.md`；
- `ROADMAP.md` / `VERSIONING.md` 如需要；
- 写 `results/asteria_v2_rc9_human_visual_repair/result.md`。

完成后：

```text
commit = v2.0.0-rc.9
push origin/main
HEAD == origin/main
worktree clean
```

---

## 13. Fixed public URL gate

严格刷新同一入口：

`https://asteria.httpwwwcardiacnexus-ukb.com/`

必须：

```text
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_ROOT_CHECK = PASS
PUBLIC_STATUS_CHECK = PASS
PUBLIC_BROWSER_SMOKE = PASS
PUBLIC_VERSION = 2.0.0-rc.9
```

不要 quick tunnel / alternate URL / VPS proxy。

---

## 14. 修复后的验收策略

这次 human blocker 横跨 Architecture/Lineage/Evidence、math presentation、copy、motion、responsive，因此属于 broad repair。

RC.9 后重新跑完整：

```text
W01 + W02 + W03 + W04 + W05 + W06
```

但 W01/W04/W05 prompt 必须显式遵守：

`docs/operations/blackbox-audit/VISUAL_ACCEPTANCE_CONTRACT.md`

不能再允许核心视觉 P2 以 `PASS + P2` 进入人工验收。

---

## 15. Final result fields

```text
STATUS = COMPLETE
CURRENT_VERSION = 2.0.0-rc.9
FINAL_COMMIT = ...
HUMAN_BLOCKER_H1_LAYOUT_COLLISION = PASS
HUMAN_BLOCKER_H2_MOTION = PASS
HUMAN_BLOCKER_H3_CLIPPING = PASS
HUMAN_BLOCKER_H4_MATH_RENDERING = PASS
HUMAN_BLOCKER_H5_COPY_QUALITY = PASS
HUMAN_BLOCKER_H6_LINEAGE_EVIDENCE_GRAPH = PASS
NO_NODE_OVERLAP = PASS
NO_EDGE_LABEL_CARD_COLLISION = PASS
NO_PRIMARY_TEXT_CLIPPING = PASS
SELECTION_GEOMETRY_STABLE = PASS
MATH_RENDERING_MAIN_UI = PASS
COPY_QUALITY_MAIN_UI = PASS
SCIENTIFIC_TRUTH_CHANGED = NO
REVIEWER_SCOPE_EXPANDED = NO
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_BROWSER_SMOKE = PASS
NEXT_ACTION = GPT_WORK_FULL_REAUDIT_W01_W06
```

只有真实 hard blocker 才允许提前停止。