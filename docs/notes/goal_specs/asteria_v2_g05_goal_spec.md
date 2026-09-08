---
id: asteria_v2_g05
title: Performance, interaction polish, and 2.0 RC gate
created_at: 2026-09-08
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Goal G05 — Performance & Interaction RC：让 2.0 真正可长期使用

## 1. 前置条件

仅当 `results/asteria_v2_g04_result.md` 中 `G05_READY = YES` 才执行。

目标版本：`2.0.0-rc.1`。

本 Goal 不继续增加统计 ontology。它负责把 G01–G04 已完成的 Architecture 闭环收敛成可验收 RC：不卡、交互顺、视觉结构清楚、旧功能不退化。

## 2. 必须先读

- `AGENTS.md`
- `prompts/AGENT_RULES.md`
- `docs/notes/2026-09-08_asteria_v2_master_plan.md`
- `docs/notes/2026-09-08_asteria_v2_current_implementation_audit.md`
- `docs/notes/2026-09-08_asteria_v2_product_design_and_desktop_strategy.md`
- `docs/notes/2026-09-08_asteria_v2_image_prompt_library.md`
- `results/asteria_v2_g00_result.md`（baseline）
- `results/asteria_v2_g04_result.md`
- 当前 Canvas/store/architecture selectors/semantic node/Inspector/Outline 实现。

## 3. 首先做性能证据，不先凭感觉重写

建立可重复 stress fixtures：

- graph：约 2,000 semantic entities / 5,000 relations；
- rendered view：约 200–300 visible nodes / 500–800 visible edges；
- rich-text mix：包含少量长公式/说明 block，不能所有节点都是空壳；
- trace/layer/variant/outline 操作都有可测 scenario。

记录 G00 baseline 可比项与 RC 当前项。若 absolute browser timing 难以 CI 稳定断言，可采用：

- deterministic operation count；
- React render instrumentation；
- Node benchmark；
- browser manual profiling evidence；
- conservative non-flaky thresholds。

不要写一个偶尔失败的 16ms CI 测试来假装性能有保障。

## 4. Store / render hot path 重构

根据证据优先处理：

### 4.1 Zustand selectors

消除核心 hot path 中不必要的全 store subscription。至少审计：

- `App.tsx`
- `Canvas.tsx`
- `Toolbar.tsx`
- `InspectorPanel.tsx`
- Architecture-specific inspector/outline/trace controls
- Story panel

原则：只订阅 render 真正需要的 state；只为调用 action 时不要订阅无关 state。

### 4.2 Projection boundary

React Flow 只能接收当前 view 的 rendered projection。Domain graph 的 2,000 entities 不应因为当前 view 只有 220 nodes 就全部参与 Canvas render path。

### 4.3 Graph indexes

upstream/downstream、outline、validation lookup 使用可复用 index。重复查询不得每次扫描全部 relations。

### 4.4 History

视图拖拽不应复制整个 semantic project。若仍使用全量 node/edge clone + stringify snapshot，至少将 semantic domain history 与 layout drag history 分离，并把 drag undo 变成 position/viewport patch 或等价轻量机制。

不能为了性能直接删除 Undo/restore safety。

### 4.5 Heavy component isolation

- semantic micro-node 使用轻 renderer；
- TipTap editor 只在需要编辑 rich content 时存在；
- long inspector sections 按需要渲染；
- 大型可选功能可以 dynamic import，但不要为了几 KB 把代码拆得不可维护。

## 5. Interaction polish

把以下状态做成稳定一致的 interaction language：

- selection；
- direct/recursive Symbol Trace；
- layer focus；
- outline jump；
- formula-bound symbol hover/click；
- semantic variant diff；
- clear/reset state。

动效要求：

- 主要使用 transform/opacity/SVG path emphasis；
- selection/path reveal 约 120–260ms；
- camera pan/fit 约 220–350ms；
- recursive trace stagger 有总时长上限；
- `prefers-reduced-motion` 下关闭非必要 motion；
- 不加默认持续 edge animation；
- 不引入 Three.js / physics / 粒子系统 / WebGL 依赖。

## 6. Visual polish 边界

默认**保留当前 Asteria shell 和 celestial identity**，只修信息层级、spacing、semantic nodes、inspector/outline density、trace feedback。

如果现有 layout 明确无法容纳 Architecture workflow，不要直接凭感觉做大改。此时：

1. 使用 `docs/notes/2026-09-08_asteria_v2_image_prompt_library.md` 生成/准备概念方向；
2. 在 result 中说明需要独立 Product Design task；
3. 本 Goal 仍先完成性能/interaction correctness；
4. 不因视觉分歧阻塞 semantic RC。

本任务不要求 Figma。只有已有明确选定视觉方向、需要稳定 design tokens/component spec 时才建议 Figma。

## 7. Browser QA

除自动测试外，必须真实启动 app，覆盖至少：

1. 导入/打开 CAT-TRACE reference；
2. 点击 `β^U_{gh}`，检查 inspector + trace；
3. recursive trace；
4. layer focus；
5. Architecture Outline 定位；
6. formula symbol binding interaction；
7. variant diff；
8. readable Markdown export；
9. legacy V1 map import；
10. Story Outline；
11. save/restore basic flow（不得触碰生产 shared data；使用安全本地/fixture 环境）。

至少验证一个典型 1920×1080/125% scaling 等效 viewport，以及一个更窄 laptop viewport。不要因为当前 toolbar 自动 icon-only 就忽略 inspector/canvas 可用面积。

## 8. 2.0 RC 验收矩阵

RC 必须达到：

- V1 migration 无损；
- CAT reference 完整；
- canonical symbol trace 可用；
- typed relations/layers/outline 可用；
- Markdown/JSON export 可用；
- validation 可用；
- semantic variant diff 可用；
- Story/restore/search/version basics 不退化；
- stress fixture 下没有明显交互冻结；
- typing rich text 不导致无关大范围 semantic node rerender；
- memory/layout history 没有随每次拖动复制完整 semantic graph 的已知主路径。

## 9. 测试

运行：

- `npm run build`；
- 所有旧 regression；
- G01–G04 新增 regression；
- stress/benchmark；
- 本 Goal 新增 performance regression；
- browser QA。

若 repo 支持对应 frontend testing/debugging skill，使用它做浏览器级回归；不要只凭 build 成功宣布完成。

## 10. 退出门槛

1. RC acceptance matrix 全通过；
2. performance report 有 baseline vs RC evidence；
3. 没有严重 render/memory regression；
4. CAT 交互闭环可演示；
5. 版本更新到 `2.0.0-rc.1`；
6. commit `v2.0.0-rc.1` 并 push；
7. **不要自动发布 `2.0.0` stable**。用户只需要在这一阶段结束后做一次最终验收。

## 11. 停止条件

- correctness gate 失败；
- performance 优化需要删除重要旧功能；
- 必须换前端框架才能继续；
- 需要改变固定公网部署；
- 大幅 layout 分叉确实需要用户审美选择。

遇到上述情况，记录 blocker，不继续 G06/G07。

## 12. Result

写 `results/asteria_v2_g05_result.md`，必须包含：

- baseline vs RC 性能表；
- browser QA；
- architecture acceptance matrix；
- 所有测试；
- commit/push；
- 剩余视觉/功能差异；
- 是否建议使用 image prompt / Figma；
- 最后一行：

```text
ASTERIA_V2_RC_READY_FOR_USER_ACCEPTANCE = YES/NO
```
