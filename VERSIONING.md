# Asteria 版本路线：1.x 冻结与 2.0 Web 转型

更新时间：2026-09-11

Asteria 当前进入明确的两代产品边界。

## 1. 版本含义

- **Asteria 1.x**：现有“可编辑研究画布”一代。核心是 React Flow block、TipTap 富文本、LaTeX、Symbol 列表、模型版本、Story Outline、JSON/IndexedDB/共享保存。`1.0.0` 已作为 compatibility baseline 冻结。
- **Asteria 2.0**：新的“统计模型架构地图”一代。核心变化不是换皮，而是把实体、符号、语义关系、模型变体与视图投影变成稳定的数据结构，并让 Architecture / Lineage / Evidence 共享同一 canonical graph。

## 2. 冻结规则

1.x 此后只接受高优先级兼容或安全修复；新的结构功能进入 2.x。旧 map 必须继续可导入，Story/save/restore/export 不得因 2.0 失效。

## 3. 2.0 预发布版本

已完成版本链：

- `2.0.0-alpha.1`：semantic schema、normalized graph、v1→v2 migration；
- `2.0.0-alpha.2`：Original TRACE + CAT-TRACE reference workspace、canonical symbols、Symbol Trace；
- `2.0.0-beta.1`：typed relations、layers、recursive trace、Architecture Outline；
- `2.0.0-beta.2`：readable export、structural validation、Original TRACE ↔ CAT-TRACE semantic diff；
- `2.0.0-rc.1`：Architecture performance、interaction、accepted A/B/C/D visual convergence；
- `2.0.0-rc.2`：Architecture + Lineage + Evidence multi-view、accepted E1/E2 visual convergence。

RC.2 完成既定 G00–G06 gate 后，2026-09-11 源码验收审计发现中央 renderer 仍存在 hard-coded node/position/static edge 与 canonical view projection/typed relation 并存的双重 source-of-truth；同时 Original TRACE model switch 尚未完整驱动中央 Architecture stage。

因此增加并已完成：

- `2.0.0-rc.3`：**final acceptance hardening**。已修 central model-stage synchronization、relation-driven edge rendering、view-projection-driven layout、trace-edge linkage、semantic-diff visual linkage，并保存最终 acceptance screenshots；未新增 ontology 或产品范围。
- `2.0.0`：仅在用户最终验收 `rc.3` 通过后发布 stable。

详细审计：

`docs/notes/2026-09-11_asteria_v2_rc2_acceptance_audit.md`

执行任务：

`prompts/tasks/asteria_v2_rc3_acceptance_hardening_task.md`

Lineage / Evidence 已纳入 2.0 Web 正式范围。桌面壳仍不阻塞 2.0 Web stable；Tauri/Electron 进入后续 2.x 平台化阶段。

## 4. 首批 canonical model variants

2.0 第一批用户可见模型变体固定为：

1. Original TRACE；
2. CAT-TRACE Frozen V2（2026-09-09）。

历史 grouped working draft 不作为首发正式 variant。Semantic Diff 首先把这两个模型比较正确，再扩展更多变体。

RC.3 要求 model variant 的 active state 同时驱动 central Architecture、Inspector、Trace、Outline、export/validation context，不能只改变右侧面板。

## 5. 兼容性承诺

1. 1.x map 必须可导入 2.x，且原 rich text、位置、尺寸、颜色、版本内容、Story Outline、edge presentation 不丢失。
2. 2.x canonical graph 不应反向压扁为 1.x 唯一真值；legacy export 只能是明确兼容投影。
3. 1.x migration tests 保留到至少一个稳定 2.x 版本之后。
4. 当前 fixed public entry point 与 local-first/shared persistence 继续存在；2.0 不以更换部署方式为前提。
5. accepted concept images 是视觉/交互规格，不是数学、文献或结果真值。
6. `ArchitectureView.projections` 与 `TypedRelation` 是 2.0 canvas 的 canonical layout/relation truth；组件内不得长期维护第二套语义图。

## 6. 核心判断

1.x 的价值是“研究内容可以被画出来并编辑”。2.0 的价值必须升级为：

> **模型结构可以被查询、追踪、比较、跨视图理解，并检查研究证据是否闭环，而且中央画布本身真实反映这份 canonical graph。**

如果一个 2.x 功能只增加新的 block 类型、颜色或装饰，或仅让 Inspector 数据正确而中央 canvas 仍不由 semantic graph 驱动，它不属于完成的 2.0 主线。
