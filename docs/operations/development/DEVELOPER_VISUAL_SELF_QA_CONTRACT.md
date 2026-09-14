# Asteria Developer Visual Self-QA Contract

日期：2026-09-14

本文件约束开发阶段的视觉验收。它不是 GPT Work Browser contract，也不是用户最终验收替代品。

目标只有一个：

> 明显的 UI / graph / math / copy 问题必须在 Codex 自己开发时被发现和修掉，不能把 GPT Work 或用户当作第一轮视觉 QA。

## 1. 什么时候强制执行

只要 task 修改以下任一 surface，就必须执行：

- Architecture / Lineage / Evidence layout；
- graph cards / nodes / arrows / edge labels；
- selection / trace visual state；
- inspector / math rendering；
- Semantic Diff / researcher-facing copy；
- theme / responsive / viewport behavior；
- motion / transitions；
- toolbar / disclosure / user-visible controls。

纯 backend / scientific fixture / non-visual docs task 可不执行。

## 2. 完成定义

```text
implement
-> run automated regression
-> open real rendered UI
-> capture required screenshots
-> visually inspect screenshots/full screen
-> identify obvious defects
-> repair
-> recapture screenshots
-> second visual inspection
-> only then mark COMPLETE
```

`npm test = PASS`、`bbox overlap = 0`、`screenshot generated`、`endpoint error = 0` 都不能单独作为 visual task 完成依据。

## 3. 默认 required states

除非 task 明确更窄，至少检查：

- 1536×864 Dark；
- 1366×768 Light；
- 改动涉及的每个主 view；
- selection/trace ON 与 OFF；
- 如果涉及密图：Overview + Full model/Fit；
- 如果涉及 Inspector：至少一个短公式和一个长公式；
- 如果涉及 copy：至少滚动检查完整 section，不只看第一项；
- 如果涉及 routing/connector：至少做 source/target endpoint close-up，以及 1536→1366→1536 resize。

## 4. 每轮截图必须检查什么

### Graph / geometry

- card/node 是否互压；
- label/title 是否被 line-clamp / ellipsis / clipping；
- edge 是否穿过 card/body/text；
- relation label/chip 是否漂浮、压线、遮挡；
- target/source 是否贴 viewport 边缘；
- selected/reveal 后已有节点是否无意义位移；
- edge 是否出现可避免的 crossing；
- 本可留在上方/下方的 relation 是否无故跨区再返回。

### Arrow / connector quality

- 线宽是否统一、克制；
- active state 是否只比 baseline 稍强，而不是粗几倍；
- arrowhead 是否与 stroke 比例协调；
- 多条边是否在目标前汇成粗结；
- 同一 view connector grammar 是否统一；
- arrow tip 是否只在 target border 单点接触；
- connector 是否沿 source/target card border 长距离贴行；
- final segment 是否近似垂直进入 target side，而不是擦边进入；
- source departure 是否近似垂直离开 source side；
- 非 terminal path 是否进入 source/target card 的约 6px clearance zone；
- 多 ports 是否真正分开。

默认建议：

- ordinary graph edge：约 1.2–1.6 CSS px；
- selected/trace edge：约 1.8–2.2 CSS px；
- Lineage connector：约 1.4–1.8 CSS px；
- 不允许仅因为 SVG viewBox 缩放导致不同 viewport 下视觉粗细改变；
- canonical arrowhead 使用小型 open chevron；
- final target/source stub 推荐 12–20 CSS px；
- arrowhead/terminal 不得沿 card border 贴行。

### Edge crossing / corridor review

每个复杂 graph screenshot 必须额外问：

1. 这两条 crossing 是否真的不可避免？
2. 如果 source/target 都在画布下半区，为什么 path 要跨到上半区？
3. 是否存在更短、同一区域、少 bend 的路线？
4. 当前 route 是否只是“第一个不撞 card”的算法产物，而不是视觉最优路径？

如果答案显示 crossing/detour 可避免，Codex 必须继续修 routing/scoring，不得因为 `EDGE_CARD_INTERSECTION_COUNT = 0` 就结束。

### Footer / legend review

- Lineage/Evidence 不得显示无解释的 raw category footer string；
- 若 card 已有 kind/status，默认不再重复 `Theory / implementation / datasets / limitation / pending`；
- 若需要 legend，必须是真正有视觉 swatch/含义的 legend，不是 placeholder text。

### Math

- KaTeX/MathJax 是否完整横向可读；
- 上下标是否碎裂；
- 主阅读层是否出现 raw ASCII / raw LaTeX；
- 公式块是否撑破 inspector。

### Copy

- 是否有重复 generic AI sentence；
- 是否暴露 schema/debug/internal wording；
- `Why it matters` 是否解释统计意义而不是 graph topology；
- Lineage/Evidence 是否说人话。

## 5. 两轮 self-review 是默认要求

### Round 1
实现后完整截图并列出发现的问题。

### Round 2
修复 Round 1 问题后重新截图并重新审查。

只有 Round 2 不再出现明显 blocker，才能标记 `SELF_VISUAL_QA = PASS`。若 Round 2 仍有明显问题，继续 Round 3。

## 6. Result 必填字段

所有 visual task result 至少包含：

```text
SELF_VISUAL_QA_ROUNDS = n
SELF_VISUAL_QA_SCREENSHOTS = <paths>
SELF_VISUAL_QA_GESTALT = PASS | FAIL
SELF_VISUAL_QA_ARROW_WEIGHT = PASS | FAIL | N/A
SELF_VISUAL_QA_PRIMARY_TEXT = PASS | FAIL | N/A
SELF_VISUAL_QA_MATH = PASS | FAIL | N/A
SELF_VISUAL_QA_COPY = PASS | FAIL | N/A
SELF_VISUAL_QA_MOTION = PASS | FAIL | N/A
SELF_VISUAL_QA = PASS | FAIL
```

如果涉及 connector/routing，还必须包含：

```text
EDGE_CARD_BORDER_HUG_COUNT
NONTERMINAL_CARD_CLEARANCE_FAIL_COUNT
TERMINAL_NORMAL_ANGLE_FAIL_COUNT
AVOIDABLE_EDGE_EDGE_CROSSING_COUNT
STATIC_CATEGORY_FOOTER_COUNT
```

并简述每轮实际发现并修掉什么。

## 7. 外部 GPT Work 的角色

GPT Work 只负责独立复核、找遗漏和 release gate。

GPT Work 不负责第一次发现：

- 箭头明显太粗或 terminal 贴着 card 边走；
- card title 被截断；
- 数学碎裂；
- Lineage 一眼难看；
- Evidence path 明显绕错区域/产生可避免 crossing；
- static category footer 没有产品意义；
- 明显 AI copy。

如果这些问题在 GPT Work 或用户才第一次暴露，应视为 developer workflow defect，并补 regression/self-QA rule。

## 8. 用户时间优先

除非用户明确要求，否则：

- developer self-QA 未 PASS 前，不生成新的 GPT Work campaign；
- 修复范围很窄时，优先让 Codex 自审完成，再只跑最少必要 reviewer；
- 不要求用户手工打开页面替 Codex 做第一轮设计检查。