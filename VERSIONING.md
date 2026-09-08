# Asteria 版本路线：1.x 冻结与 2.0 转型

更新时间：2026-09-08

Asteria 现在进入明确的两代产品边界。

## 1. 版本含义

- **Asteria 1.x**：现有“可编辑研究画布”一代。核心是 React Flow block、TipTap 富文本、LaTeX、Symbol 列表、模型版本、Story Outline、JSON/IndexedDB/共享保存。当前 `package.json` 仍是 `0.9.4`，它被视为 1.x 代的 pre-1.0 build，而不是 2.0 架构。
- **Asteria 2.0**：新的“统计模型架构地图”一代。核心变化不是换皮，而是把实体、符号、语义关系、层、模型变体与视图投影变成稳定的数据结构，并让符号可追踪。

## 2. 冻结规则

第一张 2.0 执行任务先把当前实现正式冻结为 `1.0.0`：只允许版本记录、兼容性 fixture、性能基线与必要的测试补充，不借机加入 2.0 功能。此后 1.x 仅接受高优先级兼容/安全修复；新的结构功能进入 2.x。

2.0 开发采用预发布版本，例如：

- `2.0.0-alpha.1`：语义 schema 与 v1→v2 migration；
- `2.0.0-alpha.2`：CAT-TRACE reference workspace 与 Symbol Trace；
- `2.0.0-beta.1`：typed relations、layers、outline；
- `2.0.0-beta.2`：结构化导出、validation、semantic variant diff；
- `2.0.0-rc.1`：性能、交互与视觉收敛；
- `2.0.0`：Architecture 视图闭环稳定。

Lineage / Evidence 的完整多视图能力可以在 2.0 后半段或 2.1 完善；桌面壳不阻塞 2.0 Web 核心，优先作为 2.x 平台化目标。

## 3. 兼容性承诺

1. 1.x map 必须可导入 2.x，且原 rich text、位置、尺寸、颜色、版本内容、Story Outline、edge presentation 不丢失。
2. 2.x canonical graph 不应反向压扁为 1.x 唯一真值；若导出 legacy map，只能明确标记为兼容投影。
3. 1.x 数据模型继续保留 migration tests，直到至少一个稳定 2.x 版本之后。
4. 当前固定公网入口与 local-first/shared persistence 继续存在；2.0 不以换部署方式为前提。

## 4. 核心判断

1.x 的价值是“研究内容可以被画出来并编辑”。2.0 的价值必须升级为“模型结构可以被查询、追踪、比较和导出”。如果一个 2.x 功能只增加新的 block 类型、颜色或装饰，却没有增强结构可追踪性，它不属于 2.0 的主线。