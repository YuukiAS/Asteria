# Asteria 2.0 RC.2 最终验收前审计

更新日期：2026-09-11
状态：RC.2 已完成既定 G00–G06 gate，但本轮源码审计发现若干**验收级实现缺口**。因此不建议现在直接发布 `2.0.0` stable；先做一次窄范围 RC.3 acceptance hardening，再交用户集中验收。

## 0. 结论

`2.0.0-rc.2` 不是失败版本。G00–G06 已经完成了大量真正有价值的基础设施：1.x 兼容冻结、normalized semantic graph、Original TRACE / CAT-TRACE fixtures、Symbol Trace、typed relations、layers、outline、export、validation、semantic diff、Lineage / Evidence 数据模型、Playwright QA 与性能治理。

但“测试通过”与“最终产品形态已经兑现”还不是同一件事。当前最主要的问题不是数学 schema，也不是性能，而是**中央 canvas 仍有明显 demo/fixture renderer 痕迹，没有完全成为 canonical graph/view projection 的真实交互投影**。

这会直接影响用户验收时最关心的三个问题：

1. Original TRACE 与 CAT-TRACE 是否真的是两个可切换、可阅读的中央模型架构；
2. 点击符号以后，是否真的是语义关系和真实路径在联动，而不只是若干节点变色；
3. Lineage / Evidence 是否真的是同一 graph 的独立 projection，而不是“节点内容来自 graph、中央连线仍是手写装饰”。

因此建议增加一个最终 RC.3 hardening，不再扩 ontology，不再新增产品方向，只把已经定义好的 2.0 架构真正贯通到中央交互层。

## 1. 已完成且应保留的部分

### 1.1 G00–G04

这些部分已经达到继续复用的程度：

- 1.x map / Story / save-restore / export compatibility；
- schema-v2 entity / symbol / relation / variant / view projection；
- Original TRACE 与 CAT-TRACE Frozen V2 canonical fixtures；
- direct / recursive trace 的图索引逻辑；
- typed relation semantics；
- layer focus 与 Architecture Outline；
- readable Markdown / JSON export；
- structural validation；
- Original TRACE → CAT-TRACE semantic diff；
- frequentist / causal acceptance fixtures。

### 1.2 G05–G06

同样已经完成的重要工程基础：

- Playwright Chromium QA；
- desktop / laptop viewport 回归；
- main bundle 分块；
- 2,200 entities / 6,200 relations stress fixture；
- Architecture / Lineage / Evidence 三个用户可见 view；
- cross-view search 与 inspector links；
- Evidence closure warning；
- accepted concept A–E2 的大方向样式落地。

RC.3 不应重写这些能力。

## 2. 当前验收级缺口

### 2.1 中央 Architecture canvas 固定为 CAT-TRACE

`ArchitectureWorkspace.tsx` 当前直接使用 `catTraceFrozenV2Project`：

```ts
const project = catTraceFrozenV2Project
```

中央 Architecture stage 的节点来自硬编码 `stageSymbols`。与此同时，Original TRACE / CAT-TRACE 的 model switch 存在于 `ArchitectureReferencePanel` 自己的局部 `modelId` 中。

因此用户在右侧切到 Original TRACE 时，Inspector 可以切换，但中央 canvas 本身并没有由同一个 active model state 驱动。这不符合“首批两个正式 Model Variants 都可在 Architecture 中理解和比较”的产品目标。

### 2.2 View projection 数据已经存在，但中央布局没有真正使用它

schema 已经定义：

```ts
ArchitectureView.projections
ViewProjectionNode.position
ViewProjectionNode.size
```

`multiViewTraceProject.ts` 也真正生成了 projection positions。

但 `ArchitectureWorkspace.tsx` 仍另外维护：

```ts
stageSymbols
methodPositions
evidencePositions
```

这意味着 canonical view projection 还不是中央 canvas 的布局真值。数据层与 UI 层仍存在双重 source of truth。

### 2.3 Lineage / Evidence 中央连线不是 semantic relations 的真实投影

`ResearchMap` 虽然用 `projectedEntities(...)` 渲染节点，但其 SVG 连线是一组固定 `path d="..."`，而不是从 `project.relations` 中筛选当前 view 的 source/target，再根据 projection position 生成。

同样一套固定路径被用于 Lineage 与 Evidence。这会造成视觉上“像有关系”，但中央图并不保证每条线对应真实 typed relation。

右侧 Inspector 的 relation list 是数据驱动的，这部分是正确的；RC.3 应把同一个 relation truth 延伸到 canvas。

### 2.4 Architecture Trace 没有真实 relation-edge path highlight

当前 Architecture 中 selected / upstream / downstream node class 已经由 trace result 驱动，这是正确基础；但中央 SVG edge layer 仍是固定路径，没有逐条绑定 relation ID/type，也没有根据 direct/recursive trace 把真实 path 做方向性高亮。

因此 accepted concept C 所表达的“点击符号后连接活起来”，现在更接近“节点活起来”，还没有完全做到“路径活起来”。

### 2.5 Browser QA 主要验证文本存在，不足以阻止上述退化

现有 Playwright 测试覆盖面已经不错，但关键断言主要是：

- 某文本可见；
- Inspector 包含预期内容；
- view button active；
- screenshot 能生成。

它还没有明确验证：

- 选择 Original TRACE 后中央 graph 真正切换；
- CAT-TRACE-only symbol 从中央 stage 消失，TRACE symbol 出现；
- 当前 view 的每条 visible edge 都能追溯到 typed relation；
- trace highlighted edges 对应 graph traversal result；
- 修改 fixture projection position 会改变实际 rendered position。

RC.3 必须补这些 regression，避免以后 UI 又退回“内容正确但 canvas 只是静态装饰”。

### 2.6 用户验收证据仍主要在 `/tmp`

G05/G06 screenshots 当前写在 `/tmp/asteria-browser-qa/`。这对于 CI/runtime QA 足够，但用户最终集中验收时不方便追溯。

RC.3 应把一组精简的最终验收截图作为显式 task artifact 保存到 repo，例如：

```text
results/asteria_v2_rc3_acceptance/
  result.md
  screenshots/
    architecture-cat-trace-dark.png
    architecture-original-trace-dark.png
    architecture-trace-focus.png
    lineage-dark.png
    evidence-dark.png
    architecture-light.png
```

这些截图是验收证据，不是产品资产。

## 3. RC.3 的正确范围

RC.3 **只做实现贯通与验收硬化**，不扩产品范围。

必须做：

- 一个共享 active model/view/selection state 驱动中央 workspace 与 Inspector；
- Original TRACE 与 CAT-TRACE 两个中央 Architecture projection；
- canvas 节点从 `ArchitectureView.projections` 渲染；
- canvas edges 从当前 view 中真实 `TypedRelation` 渲染；
- trace path 对真实 relation edges 高亮；
- Lineage / Evidence 用同一通用 projection renderer，而不是固定 SVG 线路；
- Playwright 增加 model-stage synchronization、relation-edge truth、projection-position truth、trace-edge truth；
- 生成并保存最终验收截图；
- 继续维持当前性能、1.x compatibility、export、Story 与 save/restore。

不做：

- 新 ontology；
- AI 自动建图；
- 新模型 variant；
- real-data 分析；
- marked discovery theorem 研究；
- Tauri / Electron；
- Figma 重设计；
- 新视觉方向。

## 4. Renderer 建议

优先复用仓库已经存在的 `@xyflow/react`，把 semantic graph 变成**当前 view 的轻量 React Flow projection**，因为它天然提供：

- node position；
- edge source/target；
- pan/zoom；
- fit view；
- selected state；
- 后续可选的 drag/layout persistence。

但不强制为了“统一技术栈”大重写。如果当前轻量 DOM/SVG renderer 更容易安全改成 data-driven，也可以保留；唯一硬要求是：

> 中央 node/edge/layout 必须来自 canonical project/view/relation truth，而不是第二套手写数组。

不得新增第三方依赖。

## 5. 最终验收 Gate

RC.3 完成后才真正进入用户验收。至少满足：

1. Original TRACE 与 CAT-TRACE 都能在中央 Architecture 中真实切换；
2. 两个模型的节点集合、关系和 Inspector 同步；
3. `beta^U_gh` trace 高亮真实 `depends_on` / downstream relation paths；
4. `p_g` 的 zero-slot / calibration / truncation links 是真实 graph edges；
5. Lineage 中 TRACE/HMSC/bigMVP/MGP → CAT-TRACE 的 visible edges 与 typed relations 一一对应；
6. Evidence 中 proof / implementation / dataset / limitation / pending visible edges 与 typed relations 一一对应；
7. current view positions 读取 `ArchitectureView.projections`；
8. browser screenshot 与 A–E2 的核心布局/层级一致；
9. dark/light、desktop/laptop 无 clipping/overlap；
10. 全量 regression、build、performance、Playwright 通过；
11. 旧 1.x workflow 不退化；
12. 最终 screenshot artifact 可供用户直接审阅。

通过后版本定为 `2.0.0-rc.3`，再交用户决定是否发布 `2.0.0` stable。
