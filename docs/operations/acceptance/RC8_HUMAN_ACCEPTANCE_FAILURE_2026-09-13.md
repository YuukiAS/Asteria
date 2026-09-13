# Asteria 2.0 RC.8 Human Acceptance Failure

日期：2026-09-13  
候选版本：`2.0.0-rc.8`  
固定入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`

## Verdict

```text
FINAL_HUMAN_ACCEPTANCE = FAIL
STABLE_RELEASE = BLOCKED
NEXT_VERSION = 2.0.0-rc.9
```

此前 GPT Work black-box gate 虽然通过，但用户最终人工验收在真实页面中发现多处一眼可见、会直接降低科研读图质量的 blocker。受影响 scope 的此前 PASS 不再视为 stable 充分证据。

## Human blocker H1 — Architecture graph cards / arrows / relation labels 拥挤与互相遮挡

用户在 CAT-TRACE Architecture Overview 中连续点击不同节点后观察到：

- right-side parameter cards 明显挤在一起；
- relation line/arrow 与 card、文字互相穿插；
- relation label 直接压在图上，字号和视觉权重过大；
- `Open-tail intercept / Open-tail slope / gamma_g / p_g / nu / a_g / v^U_gh` 一带尤其拥挤；
- 画面不是“dense but readable”，而是元素互相竞争。

这是核心 model-atlas surface，属于 stable blocker。

## Human blocker H2 — Selection / trace 点击后的 motion 僵硬，节点会出现不必要的整体位移

连续选择 `Open-tail occurrence`、`Group open-tail intensity` 等节点时，graph context reveal / selected state 变化让已有节点位置发生明显跳动/滑动，视觉上像 layout 被重新归一化，而不是稳定地图中的局部 focus。

目标：selection/trace 只能改变 focus/reveal，不应让共享节点整体重新排布。

## Human blocker H3 — 关键节点/文字被挡住或无法完整阅读

人工验收观察到包括 observed covariate / raw feature 等主结构节点在部分状态下难以完整看到；部分 human-readable label 发生遮挡/截断。

要求：Overview 和 Full model 的 primary symbol/title 不得被 edge label、邻近 card 或 canvas clipping 挡住。

## Human blocker H4 — Semantic Diff 中大量 raw math / ASCII math 没有正常渲染

人工截图中可直接看到：

- `a_g`
- `p_g, p_g^*`
- `gamma_0, pi_g, gamma_g`
- 类似 raw canonical source 的表达

主阅读层应使用数学排版，而不是把 canonical ASCII 字符串直接展示给研究者。

## Human blocker H5 — Semantic Diff / Inspector 存在大量模板化 AI 语言

典型问题：多个不同 diff item 重复同一句：

`Why it matters: New CAT-TRACE structure that Original TRACE does not expose.`

这没有解释每项变化的统计意义，属于明显的占位式/AI 模板文案。

另需清理 stable-facing 主 UI 中的内部/工程化措辞，例如 `Web RC`, `fixture`, `G05`, `canonical source string`, `selected method` 等；必要技术信息只能放 Advanced。

## Human blocker H6 — Lineage / Evidence graph 的箭头与文字视觉质量不合格

Lineage 人工截图显示：

- `borrows interpretation from`
- `extends`
- `preserves`
- `computationally inspired by`
- `uses methodological component from`

等长文本直接横跨曲线并占据画布中心，字号过大、与 arrow/card 冲突，明显不像成熟 scientific IDE。

Evidence 同类问题需要一起处理：relation type/status 不应以大号裸文字铺在线路上。

## 为什么 GPT Work 没拦住

这次暴露的是验收 workflow 的缺口，而不只是产品 bug：

1. W01/W05 过去更偏“功能是否可读/可操作”的 checklist，而没有强制做全屏 gestalt review；
2. prompt 没要求连续点击多个节点并比较 selection 前后共享节点坐标，因此 dynamic reflow 没被识别；
3. 没有 DOM/SVG bounding-box collision gate，card/edge-label overlap 只靠主观截图容易漏掉；
4. raw math 检查主要盯公式节点，没有系统扫 Semantic Diff / Lineage / Evidence 主阅读文案；
5. `PASS + P2` 在此前 visual review 中被允许进入后续 gate，导致核心视觉 P2 被过早接受；
6. 对重复模板化 AI copy 没有专门 copy-quality gate。

因此新增：

`docs/operations/blackbox-audit/VISUAL_ACCEPTANCE_CONTRACT.md`

后续 broad visual repair 的 GPT Work 必须按该 contract 做整屏、动态、碰撞、数学渲染和 copy-quality 验收。

## RC.9 repair scope

RC.9 是 broad visual/product-quality repair，覆盖：

- Architecture layout / geometry stability / edge routing / relation-label grammar；
- selection / trace motion；
- Overview baseline node selection；
- Full model primary-label visibility；
- Semantic Diff math rendering + item-specific copy；
- Lineage / Evidence graph visual grammar；
- stable-facing copy cleanup；
- exact browser overlap / clipping / motion regressions。

不允许改变 CAT-TRACE / Original TRACE scientific truth、canonical ontology、Evidence pending/support truth 或 release scope。