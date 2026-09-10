# Asteria 2.0 Web 交付详细计划

更新日期：2026-09-11
状态：G00–G06 已完成到 `2.0.0-rc.2`。2026-09-11 最终验收前源码审计发现中央 renderer 尚未完全由 canonical graph/view projection/typed relation 驱动，因此新增 RC.3 acceptance hardening。若与更早 2026-09-08/09 规划冲突，以本文件、`ROADMAP.md`、`VERSIONING.md`、`docs/notes/2026-09-11_asteria_v2_rc2_acceptance_audit.md` 和最新 active task 为准。

## 0. 结论

A/B/C/D/E1/E2 六张概念图已经覆盖 Asteria 2.0 首个完整 Web 产品需要的关键状态：Light/Dark Architecture、Symbol Trace、TRACE→CAT-TRACE Semantic Diff、Lineage 与 Evidence。产品方向不再继续发散。

G00–G06 已完成：1.x freeze、semantic kernel、Original TRACE/CAT-TRACE fixtures、symbol trace、typed relations、layers、outline、export、validation、semantic diff、performance、Playwright QA、Lineage/Evidence multi-view。

但 RC.2 源码审计确认一个关键差距：**数据模型已经是 canonical graph，多数 Inspector/validation/search 也已经数据驱动；中央 canvas 仍残留 hard-coded node/position/static SVG edge，并未完全兑现“one graph, multiple projections”。**

因此最终验收前增加一个窄范围 RC.3：

```text
2.0.0-rc.2
  ↓
RC.3 Acceptance Hardening
  - active model/view/selection 单一真值
  - Original TRACE / CAT-TRACE 中央 Architecture 真切换
  - nodes from ArchitectureView.projections
  - edges from TypedRelation
  - trace path highlights real relations
  - relation-driven Lineage/Evidence canvas
  - semantic diff linked to central graph
  - committed final acceptance screenshots
  ↓
2.0.0-rc.3
  ↓
FINAL USER ACCEPTANCE
```

当前执行入口：

`prompts/tasks/asteria_v2_rc3_acceptance_hardening_task.md`

详细审计：

`docs/notes/2026-09-11_asteria_v2_rc2_acceptance_audit.md`

## 1. 2.0 Web 必须形成的闭环

### Architecture

- canonical symbol registry；
- explicit formula binding；
- Symbol/Object Inspector；
- direct/recursive upstream/downstream trace；
- typed relation；
- layer focus/filter；
- Architecture Outline；
- readable Markdown / schema-v2 JSON export；
- structural validation；
- Original TRACE ↔ CAT-TRACE semantic diff；
- **中央 node/edge/layout 由 active project/view/relations 驱动，而不是 component 手写图。**

### Lineage

方法级谱系，不铺普通微观符号。中央 visible edge 必须真实对应 `extends`, `preserves`, `borrows_interpretation_from`, `computationally_inspired_by`, `uses_methodological_component_from` 等 typed relations。

### Evidence

Claim-centered graph，区分 theory / proof / simulation / dataset / result / implementation / limitation / pending。中央 visible edge 必须来自 evidence typed relations；closure warning 只描述结构缺口，不自动判断科研正确性。

### Story

继续是线性输出层，保留旧 1.x workflow，不成为第四个同构 graph。

## 2. 首批两个 canonical model variants

第一批用户可见 variants 只有：

1. Original TRACE：严格参考 Stolf & Dunson 原论文与 supplementary proof；
2. CAT-TRACE Frozen V2：严格参考 2026-09-09 canonical architecture。

RC.3 必须保证 active model state 同时驱动 central Architecture、Inspector、Trace、Outline、export/validation 与 save/restore context。Original TRACE 不能只是右栏文字切换。

## 3. Accepted Concept Package

六张 accepted concepts 位于 `docs/design/accepted-concepts/`。它们只决定 visual/interaction language，不是数学、作者、citation、simulation status 或 real-data status 的 source of truth。

- A：Light Architecture；
- B：Quiet Celestial Dark Architecture/shell；
- C：Symbol Trace path interaction；
- D：semantic diff；
- E1：Lineage；
- E2：Evidence。

当前已有 celestial background 可复用/淡化；不做 raster screenshot UI，不做 SaaS card dashboard。

## 4. 已完成阶段

### G00 — 1.0 Freeze & Baseline

完成 1.x compatibility fixtures、save/restore/import/export regression 与 performance baseline。

### G01 — 2.0 Semantic Kernel

完成 normalized entity/symbol/relation/view/variant schema、graph indexes、v1→v2 migration 与 persistence boundary。

### G02 — TRACE + CAT-TRACE / Symbol Trace

完成两个 canonical fixtures、project-level symbols、formula binding、Inspector 与 direct trace。

### G03 — Typed Relations / Layers / Recursive Trace / Outline

完成 relation semantics、recursive trace、layer focus、Architecture Outline 与 graph-index-based traversal。

### G04 — Export / Validation / Semantic Diff

完成 readable Markdown、schema-v2 JSON、mechanical validation、cross-paradigm fixtures 与 Original TRACE→CAT-TRACE semantic diff。

### G05 — Architecture Performance & Visual RC

完成 Playwright fallback、stress benchmark、bundle splitting、Architecture RC interaction 与 accepted A/B/C/D 大方向。

### G06 — Multi-view Web RC

完成 Architecture/Lineage/Evidence user-visible views、cross-view links、search、closure warnings 与 E1/E2 大方向，版本 `2.0.0-rc.2`。

## 5. RC.3 — Final Acceptance Hardening

RC.3 不扩 ontology，只解决 RC.2 审计暴露的 renderer truth 问题。

必须：

1. 消除 `stageSymbols` / `methodPositions` / `evidencePositions` / semantic-looking static SVG paths 作为第二套 graph 真值；
2. central nodes 从 `ArchitectureView.projections` 生成；
3. central edges 从 current projected `TypedRelation` 生成，并绑定 relation ID/type；
4. Original TRACE / CAT-TRACE model switch 真正改变中央 Architecture projection；
5. central/Inspector/view/model/selection state 同步；
6. trace highlight 真实 relation edges；
7. Lineage/Evidence 中央边真实来自 typed relations；
8. semantic diff 在中央 graph 有可定位的 visual linkage；
9. Playwright 增加 model-stage sync / relation truth / projection truth / trace-edge truth regression；
10. 保存最终 acceptance screenshots 到 `results/asteria_v2_rc3_acceptance/screenshots/`。

Renderer 可以复用现有 `@xyflow/react`，也可以把现有 DOM/SVG 改成 data-driven；不允许新增 dependency。

## 6. 性能与兼容边界

继续维持：

- 约 2,200 entities / 6,200 relations stress fixture；
- 约 260 visible projection；
- trace 使用 adjacency index；
- current view only rendering；
- micro semantic nodes 不默认挂 TipTap；
- layout/selection 不复制完整 graph；
- main bundle 不回退到 G04 单巨大 chunk；
- 1.x migration、Story、save/restore/export regressions 全部保留。

## 7. Product Design / Figma

如果 Codex 环境有 frontend app builder / React best practices / frontend testing-debugging skill，应在 RC.3 使用 accepted concepts 做 implementation inventory、browser mismatch ledger 与 responsive QA。

Figma 默认不启用。只有真实实现出现明确跨组件 token/component ambiguity 时才考虑；本任务不因没有 Figma 阻塞。

## 8. 2.0 不要求完成

- AI 自动从论文生成架构；
- theorem prover / symbolic algebra；
- 自动判断因果识别；
- real-data 分析闭环；
- marked discovery theorem；
- 完整 code binding；
- Tauri / Electron desktop；
- 移动端完整编辑器；
- 第三个正式 model variant。

## 9. 最终验收时用户只需要看

1. Original TRACE 与 CAT-TRACE 两个中央 Architecture 是否真实切换且都读得懂；
2. `beta^U_gh`, `gamma_g`, `p_g`, `Sigma_W` 的节点与 edge path trace 是否自然；
3. semantic diff 是否能在中央 graph 中定位差异；
4. Lineage 是否是真正的 relation-driven method graph；
5. Evidence 是否真能读出 support / pending / limitation / closure gap；
6. dark/light、desktop/laptop 是否达到 A–E2 的整体层级；
7. 旧 map / Story / save / restore / export 是否仍可靠；
8. 日常交互是否无明显卡顿；
9. `results/asteria_v2_rc3_acceptance/screenshots/` 是否足够直接审阅。

通过后再决定发布 `2.0.0` stable，以及是否进入 Tauri desktop。