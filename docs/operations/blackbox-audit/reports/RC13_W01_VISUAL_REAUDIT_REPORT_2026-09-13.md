# Asteria RC.13 W01 Visual Re-audit

日期：2026-09-13  
产品版本：`2.0.0-rc.13`  
固定入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`

## Gate 结论

```text
W01 = FAIL
P0 = 0
P1 = 0
P2 = 2
P3 = 0
FINAL_HUMAN_ACCEPTANCE = NOT_READY
STABLE_RELEASE = BLOCKED
NEXT_VERSION = 2.0.0-rc.14
```

不要运行更多 GPT Work。当前失败已经足够定位下一步；继续开 W06/W02/W04/W05 只会浪费时间。

## W01 通过项

RC.13 generic graph foundation 并非失败方向。以下均有正向证据：

- CAT Architecture Full model lane locality = PASS；
- Full model hairball = PASS；
- edge-card intersection = PASS；
- selection geometry stability = PASS；
- Evidence routing regression = PASS；
- chip/path association = PASS；
- CAT Full model / Original TRACE 的通用 layout 比旧 global row-major grid 明显更合理。

因此 RC.14 不应回滚 `graphPresentation.ts`，而应修它暴露出的**响应式坐标空间整合问题**。

## Must-fix A — Lineage connector 与 target card 不在同一响应式坐标空间

W01 在 1536×864、1366×768 以及 1536→1366→1536 resize 后均看到：connector arrowhead 停在 CAT-TRACE target card 左侧空白区域，没有真实触达 target card border。

代码根因已经明确：

- `layoutProvenanceFlow(...)` 生成 fixed virtual-pixel layout；
- SVG 使用 `viewBox="0 0 virtualWidth virtualHeight"` + `preserveAspectRatio="none"`，会随着实际容器大小缩放；
- source/target HTML cards 却直接使用 `left/top/width/minHeight = virtual px`，没有跟随 SVG 的同一 scale transform；
- 因而只要实际 Lineage canvas 尺寸与 virtual dimensions 不完全一致，SVG endpoint 与 HTML card rect 就会分离；resize 时分离程度会变化。

这解释了为什么内部 `targetPort` 数学上落在 virtual target rect 边界，但黑箱真实页面仍显示 floating arrowhead。

### RC.14 必须统一坐标空间

二选一，优先更简洁且通用的实现：

1. **Container-driven layout**：用 `ResizeObserver` 获取实际 Lineage presentation content box 的 width/height，再以真实 CSS px 调用 provenance layout；SVG viewBox 与 HTML card px 使用同一实际尺寸；或
2. **Single scaled surface**：source/target cards、chips、SVG connector 全部放入同一个 intrinsic virtual surface，再由一个共同 transform/scale 缩放整个 surface，不能只有 SVG 被缩放。

不允许继续通过移动 target/card magic number 来补当前 4-source example。

Hard gate：

```text
LINEAGE_CONNECTOR_TOUCH_TARGET = PASS
LINEAGE_FLOATING_ARROWHEAD_COUNT = 0
LINEAGE_PORT_SEPARATION = PASS
LINEAGE_TARGET_SAFE_MARGIN = PASS
LINEAGE_RESIZE_ALIGNMENT = PASS
```

其中 `LINEAGE_CONNECTOR_TOUCH_TARGET` 必须用真实 rendered DOM rect 与 SVG endpoint/screen coordinates 对比，而不是只比较 virtual layout data。

## Must-fix B — 1366 inspector-open 的 Architecture safe area 没有纳入 card bounds

W01 在 1366×768 Architecture Overview 看到右侧 inference/prediction cards 被推到 canvas/inspector 边界，存在部分裁切风险。

当前 Overview position 仍以 percentage center 为主；而 card width 是 CSS px。类似 `leftPercent≈94` 的节点，在 canvas 因右侧 inspector 变窄时，`center + halfCardWidth` 可以超出真实 content box。

### RC.14 必须做 generic viewport-safe node clamping / fit

不要只移动 `gamma_g / I_CAT / R_g,R_0` 当前三个节点。

需要：

- layout 接收/知道实际 canvas content width/height；
- 根据每个 node 的 rendered/presentation width/height 和 safe inset，clamp center 到真实可用 bounds；
- 1366 / 1536、inspector open、Overview/selection/trace 均保持右侧 safe padding；
- resize 后重新计算，但不能造成无意义 animation/reflow；
- selected/shared node geometry 在同一 viewport 内保持稳定。

Hard gate：

```text
ARCH_1366_VISIBLE_CARD_CLIPPED_COUNT = 0
ARCH_1366_RIGHT_SAFE_MARGIN = PASS
ARCH_RESIZE_SAFE_BOUNDS = PASS
SELECTION_GEOMETRY_STABLE = PASS
```

## Motion finding

W01 将 `MOTION_QUALITY = FAIL` 主要与 resize/geometry alignment failure 一起报告。RC.14 不应新增 geometry transition；resize 后可以立即稳定重算。不得引入滑动动画来掩盖 endpoint/card mismatch。

## Scope freeze

RC.14 是窄 visual/responsive geometry repair。禁止修改：

- scientific fixtures / canonical relation truth；
- trace algorithm / direction semantics；
- session contract；
- Evidence truth / IA；
- Architecture semantic lane ordering；
- edge weight hierarchy（除非 endpoint fix 需要 marker alignment 的极小 presentation 调整）；
- math / copy 已通过的 reader-facing surface。

## Reviewer strategy after RC.14

RC.14 完成并通过 developer screenshot self-QA 后，不直接开多 reviewer。

```text
Stage 1: W01 only
if W01 FAIL -> repair again
if W01 PASS -> W06 only
if W06 PASS -> user final human acceptance
```

只有实现实际越界修改 scientific/state/copy/accessibility surface，才扩大 reviewer 集合。
