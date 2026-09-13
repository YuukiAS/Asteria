# Asteria RC.11 pre-Work visual review failure

日期：2026-09-13  
候选版本：`2.0.0-rc.11`

## Verdict

```text
PRE_WORK_VISUAL_REVIEW = FAIL
DO_NOT_START_GPT_WORK = YES
NEXT_VERSION = 2.0.0-rc.12
```

RC.11 自动 regression 已通过，但用户在开发完成后的首轮截图中仍能一眼看到明显 presentation 问题。此类问题不应消耗新的 GPT Work 才被发现；必须先在 developer self-QA 阶段收掉。

## H1 — Architecture active/selected arrows 视觉权重过重

当前 Architecture 中 active/selected/trace 边明显比普通关系边粗很多，arrowhead 也同步显得过大，导致 `beta^U_gh` 周围几条输入边形成高视觉权重的蓝色束，压过节点本身。

代码当前使用 SVG viewBox 单位控制 stroke；历史样式包含：

- muted Architecture edge 约 `stroke-width: 0.28`；
- selected/trace Architecture edge 约 `stroke-width: 0.56`；
- Lineage connector 约 `0.18`，active 约 `0.24`。

这些并不是稳定 CSS pixel 线宽；在 SVG viewBox/viewport 缩放下，实际视觉粗细会随画布尺寸变化。RC.12 应采用 pixel-stable presentation（优先 `vector-effect: non-scaling-stroke` 或等价方法）并重新设计 arrow marker。

目标视觉基线：

```text
Architecture ordinary edge: ~1.2–1.5 CSS px
Architecture selected/trace edge: ~1.8–2.1 CSS px
Lineage connector: ~1.4–1.7 CSS px
Evidence ordinary edge: ~1.2–1.5 CSS px
Evidence selected/support emphasis: ~1.7–2.0 CSS px
```

允许主题微调，但 active/baseline 差异不能粗到像 Sankey/highlighter。

## H2 — Arrowhead 尺寸与线宽不协调

Architecture active arrows 的三角箭头过大，尤其多条边指向同一节点时会形成视觉结。要求：

- arrowhead 使用固定、克制的视觉尺寸；
- 不能随 strokeWidth/viewBox 非均匀缩放膨胀；
- 多条入边在 node side ports 上应清楚分开；
- selected/trace 只增强线条/颜色，不把 arrowhead 放大数倍。

## H3 — 开发完成前缺少真实 screenshot gestalt review

RC.11 task 报告了大量自动字段 PASS，但用户第一眼仍能发现箭头比例不自然。这说明 developer visual QA 仍不充分。

后续所有视觉 task 必须遵守：

`docs/operations/development/DEVELOPER_VISUAL_SELF_QA_CONTRACT.md`

在 GPT Work 前至少做两轮：

```text
implement -> screenshot -> visual review -> repair -> screenshot -> visual review
```

如果截图一眼仍不成熟，不得 `STATUS=COMPLETE`。

## H4 — 顶部 model selector 与当前 Architecture model 必须核对一致

用户提供的 RC.11 Architecture 截图中，顶部 context 显示 `MODEL CAT-TRACE Frozen V2`、右侧 model switch 也高亮 CAT-TRACE，但相邻 select 文本看起来为 `Original TRACE`。

RC.12 必须用真实浏览器确认是否可复现：

- 若可复现，视为 visible state incoherence，必须修复；
- 若不可复现，在 result 中给 fresh screenshot/visible value 证据，不能忽略。

## Scope

RC.12 是 developer visual finish，不改：

- scientific truth；
- canonical relations/ontology；
- trace algorithm；
- session contract；
- Lineage/Evidence scientific content。

只允许改 presentation/style/marker/edge rendering，以及若 H4 可复现所需的 UI state binding 修复。
