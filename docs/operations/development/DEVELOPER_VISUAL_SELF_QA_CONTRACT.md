# Asteria Developer Visual Self-QA Contract

日期：2026-09-13

本文件约束 **开发阶段** 的视觉验收。它不是 GPT Work Browser contract，也不是用户最终验收替代品。

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

以下流程缺一不可：

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

`npm test = PASS`、`bbox overlap = 0`、`screenshot generated` 都不能单独作为 visual task 完成依据。

## 3. 默认 required states

除非 task 明确更窄，至少检查：

- 1536×864 Dark；
- 1366×768 Light；
- 改动涉及的每个主 view；
- selection/trace ON 与 OFF；
- 如果涉及密图：Overview + Full model/Fit；
- 如果涉及 Inspector：至少一个短公式和一个长公式；
- 如果涉及 copy：至少滚动检查完整 section，不只看第一项。

## 4. 每轮截图必须检查什么

### Graph / geometry

- card/node 是否互压；
- label/title 是否被 line-clamp / ellipsis / clipping；
- edge 是否穿过 card/body/text；
- relation label/chip 是否漂浮、压线、遮挡；
- target/source 是否贴 viewport 边缘；
- selected/reveal 后已有节点是否无意义位移。

### Arrow / connector quality

- 线宽是否统一、克制；
- active state 是否只比 baseline 稍强，而不是粗几倍；
- arrowhead 是否与 stroke 比例协调；
- 多条边是否在目标前汇成粗结；
- 同一 view 的 connector grammar 是否统一。

默认建议：

- ordinary graph edge：约 1.2–1.6 CSS px；
- selected/trace edge：约 1.8–2.2 CSS px；
- Lineage connector：约 1.4–1.8 CSS px；
- 不允许仅因为 SVG viewBox 缩放导致不同 viewport 下视觉粗细改变；优先使用 `vector-effect: non-scaling-stroke` 或等价稳定像素方案；
- arrowhead 尺寸随视觉 stroke 设计，不要使用会随着 viewBox 非均匀缩放膨胀的 marker。

这些是 presentation baseline，可因主题微调，但任何显著偏离必须通过截图说明为什么仍好看。

### Math

- KaTeX/MathJax 是否实际完整横向可读；
- 上下标是否碎裂成竖排；
- 主阅读层是否出现 raw ASCII / raw LaTeX；
- 公式块是否撑破 inspector。

### Copy

- 是否有重复 generic AI sentence；
- 是否暴露 schema/debug/internal wording；
- `Why it matters` 是否解释统计意义而不是 graph topology；
- Lineage/Evidence 是否说人话。

## 5. 两轮 self-review 是默认要求

视觉 task 默认至少两轮：

### Round 1

实现后完整截图并列出发现的问题。

### Round 2

修复 Round 1 问题后重新截图并重新审查。

只有 Round 2 不再出现明显 blocker，才能标记：

```text
SELF_VISUAL_QA = PASS
```

若 Round 2 仍有明显问题，继续 Round 3；不要因为时间到了就交给 GPT Work。

## 6. Result 必填字段

所有 visual task result 必须包含：

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

并简述每轮实际发现并修掉什么。

如果只列 automated assertions，没有说明看过什么截图、发现过什么问题，视为 self-QA 未完成。

## 7. 外部 GPT Work 的角色

GPT Work 只负责：

- 独立复核；
- 找开发者遗漏；
- release gate。

GPT Work 不负责：

- 帮开发者第一次发现箭头明显太粗；
- 第一次发现 card title 被截断；
- 第一次发现数学碎裂；
- 第一次发现 Lineage 一眼难看；
- 第一次发现明显 AI copy。

如果这些问题在 GPT Work 才第一次暴露，应视为 developer workflow defect，并补 regression/self-QA rule。

## 8. 用户时间优先

除非用户明确要求，否则：

- developer self-QA 未 PASS 前，不生成新的 GPT Work campaign；
- 修复范围很窄时，优先让 Codex 自审完成，再只跑最少必要 reviewer；
- 不要求用户手工打开页面替 Codex 做第一轮设计检查。
