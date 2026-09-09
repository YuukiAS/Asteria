# Asteria 2.0 — E1 / E2 Canonical Image Generation Prompts

日期：2026-09-09
状态：当前 E1 / E2 图片生成的单一执行版本。

本文件用于消除 `2026-09-08_asteria_v2_image_prompt_library.md` 中较短的概念说明与聊天中较完整执行 prompt 之间的差异。

## 使用规则

1. E1 与 E2 都使用已接受的 **B — Quiet Celestial Dark** 图片作为 visual reference。
2. 不要把 B 当作局部 edit target；每次都重新生成完整 screen/state。
3. 生成 E2 时仍然引用 B，不要拿 E1 继续修改成 E2。
4. B 只决定 shell、palette、typography、density、inspector anatomy 与整体设计语言；数学与统计语义服从最新 Frozen Canonical V2。
5. 暗色 celestial 背景必须比已生成 B 更克制：降低星点数量和亮度，不出现银河、星云、亮星、粒子流、科幻 HUD 或 neon glow。
6. `2026-09-08_asteria_v2_image_prompt_library.md` 继续作为长期 prompt library；本文件中的 E1/E2 完整 prompt 是当前实际生成时应复制使用的版本。

---

# E1 — Lineage View / 方法谱系视图

请以附图 B 作为 Asteria 2.0 的视觉设计 reference，而不是局部编辑目标。

保留附图中的整体产品设计语言，包括：
- 顶部 command bar 的高度、密度与组件风格；
- 左侧 navigation rail 的宽度与层级；
- 右侧 Inspector 的宽度、排版和 section rhythm；
- 深蓝黑 Quiet Celestial Dark 配色；
- 科研软件 / IDE / scientific atlas 的整体气质；
- 节点、线条、字体、间距和 selected state 的精细程度。

但请重新生成一张完整的新 screen，不要求中央 canvas 保持原图布局。

当前 View 改为 `Lineage`。

这是 Asteria 2.x 的“方法谱系视图”，核心问题不是模型内部某个 β、γ 或 α 怎样连接，而是：

“当前统计方法从哪些既有方法继承、扩展、替换或借鉴了什么？”

当前 Project 为 `CAT-TRACE`。

左侧 Views 继续显示：
Architecture
Lineage
Evidence
Narrative
Data
Code

其中 `Lineage` 被选中。

中央 canvas 必须从 Architecture 的微观符号图切换成“方法级谱系”，不要把普通参数和符号铺满画面。

使用少量但真正有意义的方法级实体：

1. `TRACE / Infinite JSDM`
   - open-ended species list
   - TRACE tail calibration
   - marginal probit backbone

2. `HMSC`
   - trait / taxonomy / phylogeny structured borrowing
   - ecological interpretation framework

3. `High-dimensional multivariate binary response / bigMVP`
   - marginal-first computation
   - two-stage dependence inference inspiration

4. `Sparse Bayesian Infinite Factor Models`
   - multiplicative gamma process shrinkage
   - residual factor rank control

5. `CAT-TRACE`
   - 当前 selected method

可以补少量必要的方法节点，但总节点数量控制在约 6–10 个，不要变成论文 citation network。

不同方法之间的边必须带有真实语义，例如：

extends
preserves
borrows structured interpretation from
computationally inspired by
uses shrinkage idea from

不要把所有关系画成同一种普通箭头。

尤其不要表达成：
TRACE + HMSC = CAT-TRACE

CAT-TRACE 不是简单拼接两个模型。

中央布局可以具有轻微的从早期方法到当前方法的演化方向，但不要做成 Git commit graph、PPT 时间线或文献引用网络。

选中 `CAT-TRACE` 后，右侧 Inspector 显示类似：

CAT-TRACE
Method / Model family

Summary
Catalogue-aware marked open-tail joint species distribution model.

Extends
TRACE open-ended species framework

Preserves
Marginal probit interpretation
TRACE open-tail richness calibration

Borrows structured interpretation
Trait / taxonomy / phylogeny hierarchy where species identity exists

Computational inspiration
Marginal-first high-dimensional binary inference
Finite-working-set residual dependence

Adds / changes
Finite catalogue
Grouped open tail
Catalogue/open-tail discovery decomposition
Structured residual dependence stage

并显示：
Open in Architecture
Open supporting Evidence
Related variants

整体仍然以 canvas 为视觉中心，不要变成卡片 dashboard。

背景继续使用 Quiet Celestial Dark，但比附图 B 更克制：
降低星点数量和亮度，不出现银河、星云、亮星、粒子流、科幻 HUD 或 neon glow。
背景只是低对比品牌纹理，不应抢模型谱系的视觉注意力。

这是统计研究工具，不是 SaaS 营销 dashboard。
不要 hero、营销文案、fake metrics、badge wall、bento grid。
16:10 desktop app screenshot，约 1600×1000。
所有主要文字必须清楚可读。

---

# E2 — Evidence View / 研究证据闭环

请以附图 B 作为 Asteria 2.0 的视觉设计 reference，而不是局部编辑目标。

保留附图中的 app shell、Quiet Celestial Dark palette、toolbar density、left rail、right inspector、typography、节点精细度和 scientific IDE 风格，但重新生成完整的新 Evidence view。

当前 Project 为 `CAT-TRACE`。
顶部 View 选中 `Evidence`。
左侧 Views 中 Evidence 高亮。

这是“研究证据视图”，不是 Architecture 模型结构图。

核心问题是：

“一个研究主张，被哪些 theorem、proof、simulation、real data、implementation test 支持？还缺什么证据？”

中央 canvas 应采用 claim-centered evidence graph，而不是 Observation → Measurement → Latent → Parameterization 的模型层级。

当前 selected claim：

`Grouped open-tail richness remains finite under TRACE-calibrated group tails while preserving marginal probit interpretation.`

围绕这个 claim 放置少量清晰证据节点：

Theory
Group-specific open-tail richness calibration theorem

Proof dependency
TRACE Gaussian–probit identity
Extreme-tail asymptotics

Simulation S1A
Finite-p oracle calibration

Simulation S1B
Fitted grouped-open-tail recovery
Parameter recovery / coverage / truncation sensitivity

Real data
Finland fungi
TRACE continuity + grouped-open-tail analysis

Implementation evidence
Explicit zero slots
vs
one zero-slot prototype + multiplicity
numerical equivalence test

Open gap / limitation
Future marked-discovery distributional theorem still pending

可以在远处保留 Malagasy arthropods 与 South-West Australia plants 作为其他 research claims 的折叠入口，但不要把 GSMc 放进第一篇论文的主 evidence chain。

Evidence relations 必须具有不同语义，例如：

supports
tests
validates implementation
limited by
pending

不要把全部证据都画成绿色“通过”。
Asteria 不应暗示自己自动证明统计或数学正确性。

右侧改为 Claim Inspector，显示：

Claim
完整 claim statement

Status
例如 Supported / Partial / Pending 中的一种克制状态

Supporting evidence
Theory
Proof
Simulation
Real data
Implementation checks

Limitations / missing evidence
明确列出仍未闭环部分

Affected variants

Linked theorem / simulation / dataset / result

Open in Architecture

整体应像“论文论证结构 + IDE dependency trace”，而不是项目管理 dashboard、PR review 或 checklist 页面。

背景继续沿用 Quiet Celestial Dark，但星空纹理比附图 B 更弱。
canvas 仍然是绝对主体。

这是统计研究工具，不是 SaaS 营销 dashboard。
不要 hero、营销文案、fake metrics、badge wall、bento grid。
16:10 desktop screenshot，约 1600×1000。
