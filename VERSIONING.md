# Asteria 版本路线：1.x 冻结与 2.0 Web 转型

更新时间：2026-09-09

Asteria 当前进入明确的两代产品边界。

## 1. 版本含义

- **Asteria 1.x**：现有“可编辑研究画布”一代。核心是 React Flow block、TipTap 富文本、LaTeX、Symbol 列表、模型版本、Story Outline、JSON/IndexedDB/共享保存。当前 `package.json` 仍可能显示 pre-1.0 build；G00 会把这一代正式冻结为 `1.0.0`。
- **Asteria 2.0**：新的“统计模型架构地图”一代。核心变化不是换皮，而是把实体、符号、语义关系、模型变体与视图投影变成稳定的数据结构，并让 Architecture / Lineage / Evidence 共享同一 canonical graph。

## 2. 冻结规则

第一张 2.0 执行任务先把当前实现正式冻结为 `1.0.0`：只允许版本记录、兼容 fixture、性能基线与必要测试补充，不借机加入 2.0 功能。

此后 1.x 只接受高优先级兼容或安全修复；新的结构功能进入 2.x。

## 3. 2.0 预发布版本

当前推荐版本链：

- `2.0.0-alpha.1`：semantic schema、normalized graph、v1→v2 migration；
- `2.0.0-alpha.2`：Original TRACE + CAT-TRACE reference workspace、canonical symbols、Symbol Trace；
- `2.0.0-beta.1`：typed relations、layers、recursive trace、Architecture Outline；
- `2.0.0-beta.2`：readable export、structural validation、Original TRACE ↔ CAT-TRACE semantic diff；
- `2.0.0-rc.1`：Architecture performance、interaction、accepted A/B/C/D visual convergence；
- `2.0.0-rc.2`：Architecture + Lineage + Evidence multi-view、accepted E1/E2 visual convergence、最终 Web RC；
- `2.0.0`：用户最终验收通过后发布 stable。

Lineage / Evidence 不再默认后置到 2.1；用户已经确认要把它们纳入当前 2.0 Web 产品的最终验收。

桌面壳仍不阻塞 2.0 Web stable。Tauri/Electron 进入后续 2.x 平台化阶段。

## 4. 首批 canonical model variants

2.0 第一批用户可见模型变体固定为：

1. Original TRACE；
2. CAT-TRACE Frozen V2（2026-09-09）。

历史 grouped working draft 不作为首发正式 variant。Semantic Diff 只需要先把这两个模型比较正确，再扩展更多变体。

## 5. 兼容性承诺

1. 1.x map 必须可导入 2.x，且原 rich text、位置、尺寸、颜色、版本内容、Story Outline、edge presentation 不丢失。
2. 2.x canonical graph 不应反向压扁为 1.x 唯一真值；若导出 legacy map，只能明确标记为兼容投影。
3. 1.x 数据模型继续保留 migration tests，直到至少一个稳定 2.x 版本之后。
4. 当前 fixed public entry point 与 local-first/shared persistence 继续存在；2.0 不以更换部署方式为前提。
5. accepted concept images 是视觉/交互规格，不是数学或文献真值。

## 6. 核心判断

1.x 的价值是“研究内容可以被画出来并编辑”。2.0 的价值必须升级为：

> **模型结构可以被查询、追踪、比较、跨视图理解，并检查研究证据是否闭环。**

如果一个 2.x 功能只增加新的 block 类型、颜色或装饰，却没有增强结构可追踪性、关系语义、跨视图理解或证据闭环，它不属于 2.0 主线。