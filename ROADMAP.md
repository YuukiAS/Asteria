# Asteria Product Roadmap

更新时间：2026-09-09
状态：当前产品与工程路线。旧版 2026-08-28 长期构想已被本版收敛为可执行的 Asteria 2.0 Web 路线。

## 0. 当前判断

Asteria 不再定位为“把一整项研究摊在无限画布上的笔记工具”。2.0 的核心产品是：

> **一个可以理解、追踪、比较和验证统计模型结构的交互式研究地图。**

底层只有一份 canonical semantic graph；Architecture、Lineage、Evidence 是不同认知尺度下的 view projection，而不是三套重复数据。

当前视觉探索已经完成到足以实现的程度。A/B/C/D/E1/E2 六张 accepted concepts 分别覆盖 Architecture light/dark、Symbol Trace、Semantic Diff、Lineage 与 Evidence。后续不再继续系统性生成更多主界面概念图；除非真实实现出现明确局部问题，否则直接进入开发。

详细执行计划：

`docs/notes/2026-09-09_asteria_v2_web_delivery_plan.md`

两个首批模型 reference：

`docs/notes/2026-09-09_trace_and_cat_trace_reference_for_asteria_v2.md`

## 1. 两代产品边界

### Asteria 1.x

现有 React Flow + TipTap + KaTeX + Zustand + Dexie 的可编辑研究画布。1.x 仍有价值，并作为 legacy compatibility input 保留。

2.0 开始前先正式冻结 `1.0.0`：建立兼容 fixtures、性能基线、save/restore/import/export regression。之后 1.x 只接受必要修复，不继续加入新的语义结构功能。

### Asteria 2.0

不推翻现有前端壳；重构的是“数据真值与交互语义”。核心 source of truth 从 node-centric map 升级为：

```text
entities
symbols
typed relations
semantic variants
view projections
validation state
```

React Flow node 的 position/size/collapse/visibility 属于 view，而不是 statistical entity 本身。

## 2. 2.0 首个完整 Web 产品

2.0 Web stable 前必须形成以下闭环。

### 2.1 Architecture

回答：模型到底由什么组成？

必须有：

- canonical symbol registry；
- formula explicit binding；
- Symbol/Object Inspector；
- direct + recursive upstream/downstream trace；
- typed relation；
- layer focus/filter；
- Architecture Outline；
- readable Markdown / schema-v2 JSON export；
- structural validation warnings；
- semantic variant diff。

### 2.2 Lineage

回答：方法从哪里来、继承什么、借鉴什么、替换什么。

节点粒度以 model/method/paper/algorithm/prior family 为主，不放普通微观参数。

初始 CAT-TRACE lineage 至少连接：TRACE、HMSC、bigMVP、MGP factor shrinkage 与 CAT-TRACE；关系必须有 `extends`, `borrows interpretation from`, `computationally inspired by`, `uses shrinkage idea from` 等语义，不做普通 citation graph。

### 2.3 Evidence

回答：研究 claim 被哪些 theory / proof / simulation / real data / implementation evidence 支持，还缺什么。

Evidence 以 Claim 为中心。Asteria 只显示证据状态和 closure gap，不自动宣称 theorem 正确或因果识别成立。

### 2.4 Story / Narrative

Story 继续是线性输出层，不成为第四个同构 graph。它引用 canonical entities，不复制冻结内容。

## 3. 首批两个 Model Variants

第一批正式用户可见 variants 只有：

1. **Original TRACE**：严格参考 Stolf & Dunson 原论文及 supplementary proof；
2. **CAT-TRACE Frozen V2**：严格参考 2026-09-09 canonical architecture。

不把历史 grouped working draft 作为第三个首发 variant。

Semantic Diff 至少回答：

- CAT-TRACE 新增了什么；
- 哪些定义改变；
- 哪些 TRACE semantics 被保留；
- 哪些对象在某个 variant 中不存在/隐藏。

任何概念图里的数学文本都不是 source of truth。

## 4. Accepted Design Direction

执行任务开始时，把 A/B/C/D/E1/E2 六张已接受概念图复制到：

```text
docs/design/accepted-concepts/
```

并建立 README 记录角色与约束。

视觉原则：

- B 的 Quiet Celestial Dark 是暗色主 shell；
- A 是 light projection；
- C 定义 Symbol Trace 的局部联动；
- D 定义 semantic diff 的稳定单-canvas表达；
- E1 定义 method-level Lineage；
- E2 定义 claim-centered Evidence；
- 当前 `public/backgrounds/asteria-celestial-map.png` 优先复用/淡化；
- 星点、glow、motion 都必须服务结构，不做科幻装饰；
- canvas 始终是主体，不做 SaaS card dashboard。

Figma 默认不启用。若真实实现后出现具体 component/token mismatch，再决定是否用 Figma 做二次规格；没有 Figma 不阻塞 2.0。

## 5. 技术架构原则

### 5.1 保留

- React + Vite；
- React Flow；
- TipTap；
- KaTeX；
- Dexie / local-first；
- shared server；
- restore safety；
- Story Outline；
- current public entry point。

### 5.2 新增/重构

建议 domain 边界：

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

是否拆成多个 Zustand stores 由实现证据决定；必须做到 domain state、view state、session state 和 persistence boundary 清楚。

### 5.3 性能红线

- semantic project 不等于 React Flow 全量 nodes；
- current view 只渲染自己的 projection；
- recursive trace 使用 adjacency index；
- micro semantic node 不默认挂重型 TipTap editor；
- core hot path 不订阅整个 Zustand store；
- layout drag 不复制整个 semantic project；
- 不引入 3D / particle / sustained animation 作为默认体验。

目标 stress fixture：约 2,000 entities / 5,000 relations；单 view 约 200–300 visible nodes / 500–800 edges。

## 6. 版本与 Goal 链

```text
G00  1.0 Freeze & Baseline
 ↓
G01  2.0 Semantic Kernel
 ↓
G02  Original TRACE + CAT-TRACE Reference / Symbol Trace
 ↓
G03  Typed Relations / Layers / Recursive Trace / Outline
 ↓
G04  Export / Validation / Two-Variant Semantic Diff
 ↓
G05  Architecture Performance & Visual Convergence
 ↓
G06  Architecture + Lineage + Evidence / Final Web RC
 ↓
FINAL USER ACCEPTANCE
```

推荐版本：

- `1.0.0`：冻结 1.x；
- `2.0.0-alpha.1`：semantic kernel；
- `2.0.0-alpha.2`：reference workspace + Symbol Trace；
- `2.0.0-beta.1`：typed relations / layers / outline；
- `2.0.0-beta.2`：export / validation / semantic diff；
- `2.0.0-rc.1`：Architecture performance / interaction RC；
- `2.0.0-rc.2`：multi-view + accepted-design final Web RC；
- `2.0.0`：最终人工验收后发布。

当前唯一推荐自动入口：

`prompts/tasks/asteria_v2_core_autonomous_task.md`

## 7. 自动开发原则

用户不需要逐阶段盯开发。每个 Goal 通过后自动：

1. 写 result；
2. 运行相关 regression/build/browser QA；
3. commit；
4. 普通 push 到现有 origin；
5. 进入下一个 Goal。

只有以下情况停止：

- unrelated dirty work 会被覆盖；
- 不可逆数据迁移；
- 需要新 credential / 付费服务 / 未授权 dependency download；
- correctness / compatibility / performance gate 合理修复后仍失败；
- 必须改变 fixed public URL 或生产基础设施；
- G06 完成，等待最终用户验收。

## 8. 后续 2.x

### Desktop

Web 2.0 稳定后再评估 Tauri 2。优先复用同一 React/Vite UI 与 semantic core，并抽象 persistence/file/platform adapters。Electron 仅在 Tauri 明确不能满足要求时考虑。

### 更远期

- code binding / stale binding；
- richer evidence closure；
- parser-assisted symbol binding；
- AI-assisted architecture extraction；
- desktop-native project files；
- domain templates for causal / bioinformatics / optimization。

这些都不应阻塞当前 Web 2.0。