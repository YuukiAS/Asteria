---
id: asteria_v2_g05
title: Architecture performance and visual convergence RC gate
created_at: 2026-09-09
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Goal G05 — Architecture Performance & Visual Convergence

## 1. 前置条件

仅当 `results/asteria_v2_g04_result.md` 中 `G05_READY = YES` 才执行。

目标版本：`2.0.0-rc.1`。

本 Goal 不继续扩 ontology。它把 G01–G04 的 Architecture 闭环收敛为性能、交互与视觉都可长期使用的内部 RC，然后自动交给 G06 完成 Lineage / Evidence 与最终 Web RC。

## 2. 必须先读

- `AGENTS.md`
- `prompts/AGENT_RULES.md`
- `ROADMAP.md`
- `VERSIONING.md`
- `docs/notes/2026-09-09_asteria_v2_web_delivery_plan.md`
- `docs/notes/2026-09-09_trace_and_cat_trace_reference_for_asteria_v2.md`
- `docs/notes/2026-09-08_asteria_v2_current_implementation_audit.md`
- `results/asteria_v2_g00_result.md`
- `results/asteria_v2_g04_result.md`
- `docs/design/accepted-concepts/README.md` 与 A/B/C/D（若 autonomous preflight 已导入）
- 当前 Canvas/store/selectors/semantic node/Inspector/Outline 实现。

如果 repo/环境提供 Build Web Apps 的 frontend-app-builder / react-best-practices / frontend-testing-debugging skills，优先读取相关 skill，作为实现与 QA 约束。不要因此更换已接受的产品方向。

## 3. 先做性能证据，再改 hot path

建立可重复 stress fixtures：

- graph：约 2,000 semantic entities / 5,000 relations；
- rendered Architecture view：约 200–300 visible nodes / 500–800 edges；
- rich-text mix：包含少量长公式/说明 block；
- trace/layer/variant/outline 都有可测 scenario。

记录 G00 baseline 可比项与 RC 当前项。若 absolute browser timing 难以 CI 稳定断言，可采用 deterministic operation count、React render instrumentation、Node benchmark 与 browser profile evidence；不要写脆弱的偶发 16ms gate。

## 4. Store / render hot path

根据证据优先处理：

### 4.1 Zustand selectors

至少审计：

- `App.tsx`
- `Canvas.tsx`
- `Toolbar.tsx`
- `InspectorPanel.tsx`
- Architecture Inspector / Outline / Trace controls
- Story panel

只订阅 render 真正需要的 state；只调用 action 时不要 broad-subscribe 无关 state。

### 4.2 Projection boundary

React Flow 只接收当前 view 的 rendered projection。Domain graph 的全部 entities 不参与当前 canvas render path。

### 4.3 Graph indexes

upstream/downstream、outline、validation lookup 使用可复用 index，不反复扫描全部 relations/rich text。

### 4.4 History

视图拖拽不复制整个 semantic project。保留 undo/restore safety，但 layout history 使用 position/viewport patch 或等价轻量机制。

### 4.5 Heavy component isolation

- semantic micro-node 使用轻 renderer；
- TipTap 只在真正编辑 rich content 时激活；
- Inspector 长 section 按需渲染；
- dynamic import 只用于确实重的可选 feature。

## 5. Architecture interaction polish

统一以下状态：

- selection；
- direct/recursive Symbol Trace；
- layer focus；
- outline jump；
- formula-bound symbol hover/click；
- Original TRACE ↔ CAT-TRACE semantic diff；
- clear/reset state。

动效：

- transform / opacity / SVG path emphasis 为主；
- selection/path reveal 约 120–260ms；
- camera pan/fit 约 220–350ms；
- recursive trace stagger 有总时长上限；
- `prefers-reduced-motion` 关闭非必要 motion；
- 不做持续 edge animation；
- 不引入 Three.js / physics / particle / WebGL default effect。

## 6. Accepted concept fidelity

A/B/C/D 是已接受的 Architecture 产品设计输入：

- A：Light Architecture；
- B：Quiet Celestial Dark shell；
- C：Symbol Trace focus；
- D：Semantic Diff。

实现时提取并固定：

- toolbar / rail / inspector density；
- canvas spacing；
- node family；
- type hierarchy；
- selected/trace/diff states；
- dark/light tokens；
- celestial background intensity。

关键规则：

1. 图片只决定 visual / interaction language，不决定数学文本；
2. B 的星空进一步克制，优先复用/淡化已有 `public/backgrounds/asteria-celestial-map.png`；
3. 不做 raster screenshot UI；
4. 不把 canvas 改成 card dashboard；
5. 任何概念图里错误 citation / equation 不得进入 fixture。

如果 frontend app design skill 可用，按 accepted-concept fidelity workflow 做 implementation inventory、design tokens、browser screenshot comparison 和 mismatch ledger。

Figma 不作为本 Goal 前置。只有真实实现后存在明确 component/token mismatch 且 Figma 能降低歧义时才使用；否则不要因为“可能更专业”额外开一套设计流程。

## 7. Browser QA

必须真实启动 app，覆盖：

1. Original TRACE reference；
2. CAT-TRACE reference；
3. `beta^U_gh` inspector + trace；
4. `p_g` trace；
5. recursive trace；
6. layer focus；
7. Architecture Outline；
8. formula binding；
9. TRACE ↔ CAT-TRACE semantic diff；
10. Markdown / JSON export；
11. legacy V1 import；
12. Story；
13. local save/restore fixture flow。

至少检查典型 1920×1080 / 125% scaling 等效 viewport 与一个更窄 laptop viewport。

若 browser screenshot 能产生，必须与 A/B/C/D 对照，记录至少五项具体 mismatch/fix：layout、typography、palette/background、node/edge treatment、inspector density、toolbar、interaction state 中任选至少五类。

## 8. Architecture RC 验收矩阵

- V1 migration 无损；
- Original TRACE fixture 正确；
- CAT-TRACE Frozen V2 fixture 正确；
- canonical symbol trace 可用；
- typed relations/layers/outline 可用；
- Markdown/JSON export 可用；
- validation 可用；
- two-variant semantic diff 可用；
- Story/restore/search/version basics 不退化；
- stress fixture 无明显冻结；
- typing rich text 不触发无关大范围 rerender；
- layout history 不复制完整 semantic project 的主路径；
- A/B/C/D visual intent 已在浏览器中实现到可接受程度。

## 9. 测试

运行：

- `npm run build`；
- 所有旧 regression；
- G01–G04 新 regression；
- stress/benchmark；
- performance regression；
- browser QA。

若 repo 有 frontend testing/debugging skill，优先使用它进行真实界面回归；build 通过不能替代浏览器 QA。

## 10. 退出门槛

1. Architecture RC matrix 全通过；
2. baseline vs RC performance evidence 完整；
3. 没有严重 render/memory regression；
4. TRACE / CAT-TRACE Architecture 闭环可演示；
5. A/B/C/D 设计方向落地；
6. 版本 `2.0.0-rc.1`；
7. commit `v2.0.0-rc.1` 并 push；
8. result 最后一行：`G06_READY = YES/NO`。

G05 通过后**自动进入 G06**。不要在此等待用户最终验收，也不要发布 `2.0.0` stable。

## 11. 停止条件

- correctness gate 失败；
- performance 优化必须删除关键旧功能；
- 必须换前端框架；
- 必须改变 fixed public deployment；
- accepted concepts 与当前技术约束存在无法兼容的核心产品冲突；
- 合理修复后仍无法达到 G06_READY。

普通 CSS、spacing、component 选择或两种等价 layout 不是停止理由，由 Codex 自主选择。

## 12. Result

写 `results/asteria_v2_g05_result.md`，至少包含：

- baseline vs RC 性能；
- browser QA；
- accepted-concept mismatch ledger；
- Architecture acceptance matrix；
- tests；
- commit/push；
- remaining issues；
- `G06_READY = YES/NO`。