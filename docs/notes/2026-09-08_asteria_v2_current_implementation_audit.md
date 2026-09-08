# Asteria 1.x 当前实现审计：2.0 重构前的保留项、阻塞项与性能风险

日期：2026-09-08
审计基线：`main` @ `fdaf54cdccf0c7934bea479ebe3431737b739e44`

本审计只根据当前仓库实现判断，不把 TODO 里的未来设想当作已实现功能。

## 1. 总体判断

当前 Asteria 是一套已经相当完整的**研究画布应用**，而不是一个失败原型。重写 React Flow、TipTap、KaTeX、Dexie 或共享保存都没有必要。2.0 的核心问题在于：现在的数据模型仍以“block + visual edge”为中心，语义结构与 view presentation 混在一起；如果直接在这个模型上继续加 symbol trace、typed relation、multiple views 和 evidence graph，状态规模与重渲染成本会迅速放大。

因此采用“保留壳、替换真值层”的方式：1.x 继续作为兼容输入/legacy canvas；2.0 新增 normalized semantic graph，React Flow 只渲染投影。

## 2. 值得保留的实现

| 资产 | 当前证据 | 2.0 处理 |
|---|---|---|
| React Flow canvas | `src/components/Canvas.tsx` | 保留，改为消费 view projection |
| Rich text + math | TipTap/KaTeX；`RichTextEditor`, `RichTextPreview` | 保留，公式增加显式 symbol binding metadata |
| IndexedDB/local-first | Dexie + `src/lib/db.ts` | 保留，外面增加 persistence adapter |
| Shared server | 单一 shared map + revision check | 保留，2.0 schema 仍可序列化为单文件/record |
| restore safety | `restoreSafety.ts` | 必须保留 regression；migration 前后都要 safety backup |
| model versions | `blockVersionState.ts` | 保留为 legacy content version；新增 semantic variant 层，不直接删除 |
| Story Outline | README 已有成熟 workflow | 保留，2.0 architecture export 与 Story export 分工 |
| search | 已覆盖 rich text/math/Symbol | 保留入口；2.0 改为 semantic index + legacy content index |
| interaction modes | Move/Edit/Zoom | 保留，Architecture trace/focus 在其上增加，不重新发明基础交互 |

## 3. 当前数据模型的主要阻塞

### 3.1 `BlockData` 同时承担内容、语义和 presentation

`src/types/map.ts` 的 `BlockData` 同时保存 title、TipTap JSON、variants、颜色、尺寸、display mode、nodeType、状态和 emoji。位置则在 React Flow node 本身。

问题不是字段多，而是**没有稳定的 domain entity**。同一个数学参数若出现在两个 view，需要复制 block 或复制说明；移动卡片也会更新整个 node object。2.0 必须把 entity 与 view node 分开。

### 3.2 `SymbolEntry` 只有 `id/latex/meaning`

这足以做 notation table，但无法回答 scope、indices、dimension、definition mode、upstream/downstream、where defined/used、variant change。2.0 不应继续无限给 `SymbolEntry` 加 optional 字段并把它锁在某一个 block 内；应建立 project-level canonical symbol registry，再让 Symbol block 成为该 registry 的一个投影/编辑器。

### 3.3 `MapEdgeData` 只有视觉语义

当前 edge data 包括 label、color、line style、path、arrow、stroke width、version visibility。没有 relation type。这是 1.1 时代刻意的轻量设计，但 2.0 若仍只靠人工 label，就无法做 trace、validation、semantic diff 或机器导出。

2.0 应新增 `TypedRelation`；React Flow edge 只负责展示 relation 或 legacy visual edge。

### 3.4 `ExportedMap.version = 1` 是 node-centric schema

现有导出把 nodes、edges、Story、versions、viewport 作为一份 map。这一格式必须继续可读，但不能继续扩成 2.0 唯一 canonical JSON。需要显式 `ArchitectureProjectV2` 与 `migrateV1ToV2()`。

## 4. 当前性能风险

### 4.1 多个核心组件订阅整个 Zustand store

代码搜索可见 `App.tsx`、`Canvas.tsx`、`Toolbar.tsx`、`InspectorPanel.tsx`、`StoryOutlinePanel.tsx`、`EdgeInspector.tsx` 存在 `useMapStore()` 全量订阅。任何 store 更新都可能让这些大组件重新渲染。

这在 1.x 几十个 block 时尚可，但 2.0 加入 entity registry、trace state、layer filter、semantic relations、validation warnings 后会成为首要卡顿来源。

**2.0 gate：Canvas hot path 与编辑 hot path 必须改用 selector；callback 只读取需要的 action，不为调用 action 订阅整个 state。**

### 4.2 Canvas 每次相关更新都全量过滤/映射 nodes/edges

`Canvas.tsx` 会：

- 根据 active version 过滤 nodes；
- map nodes 处理 selected/draggable；
- 建立 `visibleNodeIds`；
- filter edges；
- 对每条 edge 调 `applyEdgePresentation()` 并创建 label style。

这本身不是 bug，但语义 graph 扩到几千 entities 后不能让 React Flow 接收到项目全部对象。必须先在 domain 层得到当前 view 的有限 rendered projection。

### 4.3 每个 Block 有独立 ResizeObserver 与版本解析

`BlockNode.tsx` 对 preview 建 ResizeObserver，并对 active version 计算 state/rows、解析 title/content/symbol entries。只要 rendered node 控制在合理数量，这仍可接受；如果 2.0 把每个微观 symbol 都直接画成完整 BlockNode，会成倍放大开销。

因此 symbol entity 不等于必须独立渲染成重型 TipTap block。可使用轻量 `SemanticNode` renderer，只有说明型节点或 edit state 才加载 rich editor。

### 4.4 History snapshot 使用全量 clone + `JSON.stringify`

`useMapStore.ts` 的 canvas history snapshot 会 clone 全部 nodes/edges，并通过 `JSON.stringify` 生成 signature。当前主要在 drag history 使用，规模不大时简单可靠；2.0 如果 canonical graph 也塞入同一 snapshot，就会形成明显 O(N+E) 大对象复制。

2.0 应至少做到：semantic graph history 与 view drag history 分离；拖动只记录 position patch。长期可使用 operation/patch history，不需要为每次微小布局变化复制完整项目。

### 4.5 若继续在数组上重复 `.find()`，trace/layout 成本会放大

现有布局帮助函数可以通过 `.find()` 在 nodes 数组找 parent，版本/selection 也大量使用线性查找。1.x 足够简单。2.0 graph traversal 必须使用 `Record/Map` 与 adjacency index，而不能递归 `.find()`。

## 5. 文件组织风险

当前 `useMapStore.ts`、`InspectorPanel.tsx`、`BlockNode.tsx` 都已经承担较多职责。2.0 不应继续把新功能加进去。

建议新增：

```text
src/architecture/
  types.ts
  schema.ts
  migration.ts
  graphIndex.ts
  selectors.ts
  validation.ts
  export.ts
  fixtures/

src/features/architecture/
  ArchitectureCanvas.tsx
  SemanticNode.tsx
  SymbolInspector.tsx
  TraceControls.tsx
  LayerFilter.tsx
  ArchitectureOutline.tsx
  RelationInspector.tsx

src/store/
  useMapStore.ts              # legacy adapter during migration
  architectureSlice.ts
  viewSlice.ts
  sessionSlice.ts
  persistenceSlice.ts
```

是否真正拆成多个 Zustand store 可由实现测试决定；关键是 domain slice 与 selector 边界清晰，而不是文件名形式。

## 6. 兼容迁移策略

### Stage A：双轨读取

- v1 JSON 继续通过现有 normalizer；
- 新 `migrateV1ToV2` 构造 V2 project；
- legacy block 未知语义保持 generic entity，不猜 parameter/claim；
- legacy edge 保留 visual relation，并标记 `semanticType: unresolved`。

### Stage B：双轨保存

2.0 alpha 可以在 V2 project 内保存 legacy payload 或 migration provenance，确保恢复与 roundtrip。不要在第一个 alpha 就删除旧字段。

### Stage C：2.0 真值切换

当 CAT-TRACE fixture、v1 migration、shared save、restore、Story 和 export regression 全部通过后，UI 默认以 V2 project 为真值；legacy canvas 成为一个 view/compatibility projection。

## 7. 不建议采用的重构方式

1. 不把现有每个 block 自动变成一个复杂统计 entity 并猜类型。
2. 不给 `BlockData` 直接追加二十多个 semantic fields。
3. 不让 typed relation 只存在 edge label 里。
4. 不先做三个完整 tab 再决定共享 graph schema。
5. 不因为桌面化就把整个 app 换成 Electron。
6. 不把视觉动画当成架构升级；动画必须消费 semantic state，而不是额外维护一套状态。
7. 不在 2.0 开发中破坏固定公网入口、共享保存和 restore safety。

## 8. 审计结论

当前实现真正需要保护的是成熟的编辑/保存体验；真正需要替换的是 node-centric domain model 与粗粒度全局 state subscription。只要先建立 semantic kernel 和 migration 边界，React/Vite/React Flow 这套前端完全可以继续使用，并且足以承载后续的 Symbol Trace、层级聚焦、typed relation 和高级 JS 交互。