# Asteria Lineage / Evidence Visual Grammar

日期：2026-09-13

本文件定义 Asteria 2.0 的 Lineage / Evidence 成品视觉语法。它是 presentation contract，不改变 canonical entity/relation truth。

## 1. Lineage：目标

Lineage 回答：CAT-TRACE 从哪些方法继承、保留、借用解释或计算思想？

视觉必须像一个克制的 method provenance diagram，不像 Sankey、不像 citation network、不像 debug graph。

## 2. Lineage card layout

推荐固定两列：

```text
source methods                         CAT-TRACE target

HMSC framework    -------------------->
TRACE             -------------------->
BigMVP            --------------------> CAT-TRACE Frozen V2
Sparse factor/MGP -------------------->
```

要求：

- source cards 左列统一 x；
- source cards 垂直间距一致；
- target card 右列垂直居中；
- target card 距 canvas 右边至少 48–64px；
- 1366 与 1536 都不得裁切；
- source/target 主标题完整显示，secondary label 最多两行。

## 3. Lineage connector grammar

### 3.1 一对节点只画一条 visual connector

canonical typed relations 可以多条，但同一 source-target pair 不重复画平行粗线。

例如 TRACE -> CAT-TRACE 的 `extends` 与 `preserves`：

- 数据层仍保留两条 relation；
- 画布只画一条 connector；
- connector 附近显示两个 compact relation chips：`Extends`、`Preserves`。

### 3.2 Connector

- 默认 1.5–2px；
- selected 2–2.5px；
- 使用平滑、低曲率路径；
- 每条 source 使用不同 target-side port，避免 4 条线在同一点形成视觉结；
- arrowhead 小，只在 target card 边界；
- connector 不穿过 card body；
- connector 不穿过 relation chip。

### 3.3 Relation chips

禁止 SVG 大号裸文字漂在线路上。

Relation chip：

- 10–11px；
- panel background + subtle border/halo；
- 放在 connector 中段偏 source 一侧或专门 label column；
- 和对应 connector 的距离固定；
- chip 不覆盖 connector，不与其他 chip 重叠；
- 完整 typed relation / provenance 在 inspector 展示。

建议 stable-facing display：

- HMSC -> CAT-TRACE：`Ecological hierarchy`
- TRACE -> CAT-TRACE：`Extends` + `Preserves`
- bigMVP -> CAT-TRACE：`Scalable probit`
- MGP -> CAT-TRACE：`Factor shrinkage`

这些是 display copy，不改 canonical typed relation。

## 4. Lineage card copy

主卡 secondary label 使用自然、研究者语言：

- HMSC framework — `Ecological hierarchy`
- TRACE / Infinite JSDM — `Open-tail foundation`
- bigMVP — `Scalable probit computation`
- Sparse Bayesian infinite factor / MGP — `Factor shrinkage`
- CAT-TRACE Frozen V2 — `Catalogue-aware extension`

禁止在主卡使用：

- interpretation source
- method source
- methodological component
- selected method
- Web RC
- fixture

这些内部 role 可放 Advanced。

## 5. Evidence visual grammar

Evidence 是 claim-centered evidence map，不是另一张 generic node graph。

推荐：

- claim 节点为主视觉中心；
- proof / implementation / dataset / limitation 从外围连接到 claim；
- connector 细；
- edge inline copy 只允许短 status：`Supports`, `Tests`, `Pending`, `Limited by`；
- 完整 relation explanation 在 inspector；
- Pending/limited 必须同时有文字，不靠颜色；
- dataset/pending card 不与 claim/support card 混成同一种视觉权重。

禁止长句直接铺在线路上。

## 6. Geometry hard gate

1366×768 与 1536×864：

```text
TARGET_CARD_CLIPPED = NO
NODE_OVERLAP_COUNT = 0
RELATION_CHIP_OVERLAP_COUNT = 0
RELATION_CHIP_CARD_COLLISION_COUNT = 0
```

Lineage 至少检查所有 5 张主卡和所有 relation chips。

Evidence 至少检查 visible claim/proof/dataset/implementation/gap cards。

## 7. Gestalt hard gate

Reviewer 必须整屏判断，而不是只看 bbox：

- 第一眼能否看懂 source -> CAT-TRACE；
- connector 是否细、整齐、克制；
- 箭头是否像成熟 diagram，而不是汇流粗线；
- 文案是否附属于关系，而不是漂浮在画布；
- target 是否有呼吸空间；
- selected state 是否只增强，不破坏布局。

核心 Lineage/Evidence 若达到 P2 级视觉缺陷，应 FAIL，不允许 PASS+P2 进入人工验收。
