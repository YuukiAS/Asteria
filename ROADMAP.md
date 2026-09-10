# Asteria Product Roadmap

更新时间：2026-09-11
状态：Asteria 2.0 Web 已完成 G00–G06 与 RC.3 acceptance hardening 到 `2.0.0-rc.3`。下一步是最终人工验收；未发布 `2.0.0` stable。

## 0. 当前判断

Asteria 不再定位为“把一整项研究摊在无限画布上的笔记工具”。2.0 的核心产品是：

> **一个可以理解、追踪、比较和验证统计模型结构的交互式研究地图。**

底层只有一份 canonical semantic graph；Architecture、Lineage、Evidence 是不同认知尺度下的 view projection，而不是三套重复数据。

A/B/C/D/E1/E2 六张 accepted concepts 已覆盖 Architecture light/dark、Symbol Trace、Semantic Diff、Lineage 与 Evidence。产品方向不再继续发散。

G00–G06 已经完成 schema、fixtures、trace、typed relations、layers、outline、export、validation、semantic diff、multi-view、browser QA 与 performance 基础。2026-09-11 RC.2 源码审计发现的 central renderer 双重 source-of-truth 已在 `2.0.0-rc.3` 中收束：central nodes 来自 `ArchitectureView.projections`，central edges 来自 `TypedRelation`，Original TRACE / CAT-TRACE 共享同一 active model/view/selection state。

RC.3 执行入口：

`prompts/tasks/asteria_v2_rc3_acceptance_hardening_task.md`

审计依据：

`docs/notes/2026-09-11_asteria_v2_rc2_acceptance_audit.md`

详细主计划：

`docs/notes/2026-09-09_asteria_v2_web_delivery_plan.md`

两个首批模型 reference：

`docs/notes/2026-09-09_trace_and_cat_trace_reference_for_asteria_v2.md`

## 1. 两代产品边界

### Asteria 1.x

现有 React Flow + TipTap + KaTeX + Zustand + Dexie 的可编辑研究画布。`1.0.0` 已冻结为 legacy compatibility baseline。1.x 继续保留 map、rich text、Story、save/restore/import/export 兼容。

### Asteria 2.0

不推翻现有前端壳；重构的是“数据真值与交互语义”。核心 source of truth：

```text
entities
symbols
typed relations
semantic variants
view projections
validation state
```

React Flow/中央 canvas 的 position、size、collapse、visibility 属于 view；数学定义和关系属于 canonical graph。

## 2. 2.0 首个完整 Web 产品

### 2.1 Architecture

必须能够回答模型到底由什么组成，并提供：canonical symbol registry、formula binding、Symbol/Object Inspector、direct/recursive upstream/downstream trace、typed relation、layer focus、Architecture Outline、Markdown/JSON export、structural validation、semantic variant diff。

RC.3 进一步要求：中央 canvas 本身也必须由 active model + `ArchitectureView.projections` + `TypedRelation` 驱动，不能只让 Inspector 数据正确而中央图仍是手写 fixture renderer。

### 2.2 Lineage

方法级谱系，不铺普通微观参数。CAT-TRACE 初始 lineage 连接 TRACE、HMSC、bigMVP、MGP factor shrinkage，并保留 `extends`, `preserves`, `borrows interpretation from`, `computationally inspired by`, `uses methodological component from` 等真实 relation semantics。

### 2.3 Evidence

Claim-centered evidence graph，区分 theory / proof / simulation / dataset / result / implementation / limitation / pending。Asteria 只显示结构化 evidence closure，不自动宣称 theorem、实验或因果识别正确。

### 2.4 Story / Narrative

Story 是线性输出层，不成为第四个同构 graph；继续兼容旧 1.x Story workflow。

## 3. 首批两个 Model Variants

第一批正式用户可见 variants 只有：

1. **Original TRACE**：严格参考 Stolf & Dunson 原论文及 supplementary proof；
2. **CAT-TRACE Frozen V2**：严格参考 2026-09-09 canonical architecture。

历史 grouped working draft 不作为第三个首发 variant。

RC.3 必须保证两个 model switch 不只改变右侧 Inspector，而是真正改变中央 Architecture projection、symbols、relations、outline、trace/export context。

## 4. Accepted Design Direction

六张 accepted concepts 位于：

```text
docs/design/accepted-concepts/
```

角色固定：

- A：Light Architecture；
- B：Quiet Celestial Dark Architecture/shell；
- C：Symbol Trace path interaction；
- D：Original TRACE → CAT-TRACE semantic diff；
- E1：method-level Lineage；
- E2：claim-centered Evidence。

当前 `public/backgrounds/asteria-celestial-map.png` 可复用/淡化；星点、glow、motion 都必须服务结构。Figma 不是 2.0 前置。

## 5. 技术架构原则

继续保留 React + Vite、React Flow、TipTap、KaTeX、Dexie/local-first、shared server、restore safety、Story Outline 与现有 public entry point。

核心边界：

```text
src/architecture/
  types
  schema
  migration
  graphIndex
  selectors
  validation
  export

src/features/architecture/
src/features/lineage/
src/features/evidence/
```

### 性能红线

- semantic project 不等于 React Flow 全量 nodes；
- current view 只渲染自己的 projection；
- recursive trace 使用 adjacency index；
- micro semantic node 不默认挂 TipTap；
- core hot path 不 broad-subscribe 整个 Zustand store；
- layout drag 不复制整个 semantic project；
- 不引入 3D / particle / sustained animation。

目标 stress fixture：约 2,000+ entities / 5,000+ relations；单 view 约 200–300 visible nodes / 500–800 edges。

## 6. 版本与 Goal 链

已完成：

```text
G00  1.0 Freeze & Baseline                    -> 1.0.0
G01  2.0 Semantic Kernel                      -> 2.0.0-alpha.1
G02  TRACE + CAT-TRACE / Symbol Trace         -> 2.0.0-alpha.2
G03  Relations / Layers / Recursive Trace     -> 2.0.0-beta.1
G04  Export / Validation / Semantic Diff      -> 2.0.0-beta.2
G05  Architecture Performance / Visual RC     -> 2.0.0-rc.1
G06  Architecture + Lineage + Evidence RC     -> 2.0.0-rc.2
```

最终验收前新增并已完成：

```text
G06A / RC.3 Acceptance Hardening -> 2.0.0-rc.3
  - central model-stage synchronization
  - relation-driven canvas edges
  - view-projection-driven positions
  - trace edge linkage
  - semantic diff visual linkage
  - committed acceptance screenshots
        ↓
FINAL USER ACCEPTANCE
        ↓
2.0.0 stable（仅用户确认后）
```

## 7. RC.3 不扩范围

RC.3 不做新 ontology、第三个 model variant、AI 自动建图、real-data analysis、marked discovery theorem、Tauri/Electron 或 Figma 重设计。它只把已经定义好的 canonical graph 真正贯通到中央 renderer，并补足 final acceptance evidence。

## 8. 最终验收时用户需要看什么

最终用户只需集中验收：

1. Original TRACE 与 CAT-TRACE 是否都能在中央 Architecture 中读懂并真实切换；
2. 点击 `beta^U_gh`, `gamma_g`, `p_g`, `Sigma_W` 时节点与真实 relation path 是否自然联动；
3. semantic diff 是否在中央 graph 中能定位 added / modified / preserved / absent；
4. Lineage visible edges 是否真对应 typed relations，而不是 citation/装饰线；
5. Evidence 是否能直观看到 support、pending、limitation 与 closure gaps；
6. dark/light 是否达到 A–E2 的产品层级；
7. 旧 map、Story、save/restore/export 是否仍可靠；
8. 日常交互是否无明显卡顿；
9. `results/asteria_v2_rc3_acceptance/screenshots/` 是否提供完整最终截图证据。

通过后再发布 `2.0.0` stable，并决定是否进入 Tauri desktop。

## 9. 后续 2.x

Web 2.0 stable 后再评估 Tauri 2；Electron 仅在 Tauri 明确不能满足要求时考虑。更远期包括 code binding、richer evidence closure、parser-assisted binding、AI-assisted architecture extraction、desktop-native project files、causal/bioinformatics/optimization templates。
