# Asteria RC.10 Wave A GPT Work re-audit 汇总

日期：2026-09-13  
产品版本：`2.0.0-rc.10`  
固定入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`

## Gate 结论

RC.10 staged re-audit 的 Wave A 未通过，因此按既定策略**停止，不运行 W02**。

- W01 Visual = FAIL，P1×1，P2×1，P3×1；
- W04 First-time UX = FAIL，P2×2，P3×4；
- W05 Responsive / Accessibility = FAIL，P2×1；
- W06 Release red-team = PASS，无 finding。

W03 interaction/state 继续 carry forward RC.9 PASS。

```text
GPT_WORK_GATE = FAIL
FINAL_HUMAN_ACCEPTANCE = NOT_READY
STABLE_RELEASE = BLOCKED
NEXT_VERSION = 2.0.0-rc.11
W02_RC10 = NOT_RUN_BY_DESIGN
```

这轮已经明显收敛：Lineage、Evidence、geometry overlap、motion、Advanced disclosure 都基本通过；剩余 blocker 集中在 **Architecture 主阅读层**。

## Must-fix 1 — Inspector canonical definition 数学布局仍失败

W01 与 W04 一致发现：`beta^U_gh`、`gamma_g`、Original TRACE 核心 canonical definition 虽然进入 KaTeX 路径，但视觉上仍碎裂成纵向片段/堆叠，不能作为论文式主阅读公式。

当前 source 已有 `RenderedFormulaText` 和 canonical LaTeX mapping，因此 RC.11 不应再扩科学语义；应修 **formula container/layout**：

- canonical definition 不放在会 `break-words` 的普通 metadata grid cell 中；
- 使用 dedicated formula block；
- KaTeX 主盒保持单一横向公式，不允许 glyph/上下标逐段换行；
- 长公式允许局部水平滚动，而不是整页 overflow；
- inspector 300–460px 宽度下仍可读；
- 禁止 uppercase/raw ASCII fallback 作为主显示。

Hard browser gate 至少覆盖：

- CAT `beta^U_gh = nu + a_g + v^U_gh`；
- CAT `gamma_g = gamma_0 pi_g`；
- open-tail intercept calibration；
- Original TRACE latent equation；
- Original TRACE beta prior；
- Original TRACE alpha calibration；
- `Sigma_W` normalization。

## Must-fix 2 — Architecture scientific card labels 仍被 line-clamp / ellipsis

W01/W05 一致报告：CAT Overview / Full model 中 `Shared environmental-response vector`、`Catalogue-external open tail`、`Group composition weight`、`Response heterogeneity covariance`、`Richness and discovery targets` 等重要 human-readable labels 被截断。

当前样式仍对 `.architecture-map-node small` 使用 `line-clamp-2`，因此这不是偶发现象，而是设计本身允许 stable-facing scientific label 被省略。

RC.11 必须：

- primary scientific card label 不允许 ellipsis / line-clamp；
- 允许 2–3 行自然换行；
- 必要时调整 presentation card width/height；
- packing/layout 必须以新 card rect 为准，继续保持 overlap=0；
- Overview/Full model 在 1366/1536 都要验证完整 label；
- tooltip/title 可保留，但不能作为被截断主标题的唯一补救。

Hard gate：

```text
CAT_OVERVIEW_PRIMARY_LABEL_CLIPPED_COUNT = 0
CAT_FULL_PRIMARY_LABEL_CLIPPED_COUNT = 0
NODE_OVERLAP_COUNT = 0
```

## Must-fix 3 — Architecture `Why it matters` 仍是 graph-topology 文案

W04 明确指出 `Open-tail slope` 的 Why it matters 仍主要说明 `4 upstream / 1 downstream relations`。当前 `whyEntityMatters()` 的实现确实以 incoming/outgoing relation count 生成主文案。

这不是研究者需要的“why”。RC.11 必须把 Architecture 核心对象改成**统计含义解释**，不能把 graph degree 当主说明。

至少覆盖：

- `beta^U_gh`：shared response `nu` + group deviation `a_g` + open-tail-specific heterogeneity `v^U_gh` 如何共同形成环境响应；
- `gamma_g`：total intensity 与 group composition 如何组成 derived group intensity；
- `p_g`：fixed computational truncation、不是 estimand、zero slots 为什么仍是 likelihood information；
- `alpha^U_gh`：为什么 TRACE calibration 作用于 open tail；
- `Sigma_W`：finite working set residual dependence、unit marginal variance 与 marginal probit interpretation；
- `c(f)` / `mathcal K` / `mathcal U`：identity routing 的统计意义；
- `x_i` / `z^U_igh` / `y^U_igh`：covariate -> latent score -> occurrence 的 probit story。

只能使用现有 canonical reference 支持的事实，不发明新 scientific claim。

## P3 / defer

本轮不阻塞 RC.11：

- Semantic Diff 少量 uppercase/source-note 风格；可在同一 copy surface 低风险润色，但不是主目标；
- Current-view search 无结果时缺少一键 All graph；留 2.0.x；
- Advanced 打开后仍是技术内容；默认已隐藏，接受；
- 普通 Tab 会经过较多 graph nodes；skip links 已可用，接受。

## 已通过且必须保护

- Lineage visual grammar = PASS；
- Evidence visual grammar/readability = PASS；
- CAT/Original node overlap = PASS；
- edge-label/card collision = PASS；
- selection geometry stability = PASS；
- motion quality = PASS；
- Advanced collapsed content hidden = PASS；
- W06 release regression = PASS；
- W03 state coherence carry-forward = PASS。

RC.11 不得为了修公式/label/copy 再动 Lineage/Evidence layout、trace algorithm、session contract、canonical scientific truth。

## RC.11 reviewer strategy

RC.11 是窄到中等范围的 Architecture reader-facing repair。

若 result 明确：

```text
SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
LINEAGE_LAYOUT_CHANGED = NO
EVIDENCE_LAYOUT_CHANGED = NO
```

则先跑 Wave A：

```text
W01 + W04 + W05 + W06
```

只有 Wave A 全 PASS，再补跑：

```text
W02 Statistical semantics
```

W03 继续 carry forward RC.9 PASS。