---
id: asteria_v2_rc11_reader_finish
title: Final reader-facing Architecture repair for canonical math, card labels, and scientific Why-it-matters copy
created_at: 2026-09-13
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Asteria 2.0 RC.11 — Reader-facing Architecture Finish

## 0. 状态与目标

RC.10 Wave A re-audit 未通过，但问题已高度收敛。

先读：

1. `AGENTS.md`
2. `prompts/AGENT_RULES.md`
3. `docs/operations/blackbox-audit/reports/RC10_WAVE_A_REAUDIT_CONSOLIDATED_REPORT_2026-09-13.md`
4. `docs/operations/blackbox-audit/VISUAL_ACCEPTANCE_CONTRACT.md`
5. `docs/operations/blackbox-audit/UI_BLACKBOX_BROWSER_CONTRACT.md`
6. `docs/notes/2026-09-09_trace_and_cat_trace_reference_for_asteria_v2.md`
7. 当前 `RenderedMath.tsx`, `ArchitectureReferencePanel.tsx`, `ArchitectureWorkspace.tsx`, `viewProjection.ts`, `styles`, browser tests。

目标版本：

```text
2.0.0-rc.11
```

本轮只修三个 reader-facing blocker：

1. Inspector canonical definition 数学碎裂；
2. Architecture scientific card label clipping；
3. Architecture `Why it matters` 仍是 graph-topology/关系计数文案。

不要发布 stable，不要邀请用户人工验收。

## 1. Scope freeze

禁止修改：

- Original TRACE / CAT-TRACE scientific truth；
- canonical entities / typed relation truth / ontology；
- trace algorithm / direction semantics；
- session / Save-Restore contract；
- Lineage layout / connector grammar / relation chips；
- Evidence layout / truth boundary；
- Full-model Zoom/Fit/Pan behavior；
- fixed public URL / tunnel identity；
- v1 migration compatibility。

结果必须返回：

```text
SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
LINEAGE_LAYOUT_CHANGED = NO
EVIDENCE_LAYOUT_CHANGED = NO
```

若不能保持上述边界，停止并报告 blocker。

## 2. Inspector canonical definition：建立真正 formula block

### 2.1 当前问题

虽然核心 definitions 已有 KaTeX mapping，但 W01/W04 在真实 UI 中看到 `beta^U_gh`、`gamma_g`、Original TRACE definitions 被压成纵向碎片。

不要只继续补 mapping；当前重点是**布局容器**。

### 2.2 要求

为 canonical definition 建立 dedicated reader-facing formula block，例如 `CanonicalFormulaBlock` 或等价实现：

- 不放在带 `break-words` 的普通 metadata `dd` 内；
- formula block 独占一行/一块；
- KaTeX root 使用不可拆分的横向数学盒；
- `white-space: nowrap`；
- `min-width: max-content` 或等价，防止内部 glyph 压缩成逐列布局；
- 外层 `max-width:100%; overflow-x:auto`，长公式只在公式块内部横向滚动；
- 不产生 inspector 整体 horizontal overflow；
- 300–460px inspector 宽度下均可用；
- 不 uppercase math token；
- raw canonical source 只能留在 sr-only / Advanced/export，不作为主视觉 fallback。

必须覆盖：

- `beta^U_gh = nu + a_g + v^U_gh`；
- `gamma_g = gamma_0*pi_g`；
- `alpha^U_gh | gamma_g,p_g ~ ...`；
- Original TRACE `z_ij = ...`；
- Original TRACE `beta_j ~ N_q(nu,Psi)`；
- Original TRACE `alpha_j | gamma,p ~ ...`；
- `D_W^{-1/2} Omega_W D_W^{-1/2}` / `Sigma_W` normalization。

### 2.3 Browser hard gate

对以上公式检查：

```text
FORMULA_FRAGMENTED_COUNT = 0
RAW_ASCII_CANONICAL_DEFINITION_COUNT = 0
INSPECTOR_HORIZONTAL_OVERFLOW = NO
```

截图至少保存：

- rc11-beta-definition.png
- rc11-gamma-definition.png
- rc11-original-trace-definition.png
- rc11-alphaU-definition.png

不要只断言 `.katex` 存在；必须看真实截图和 rect。

## 3. Architecture card label：禁止稳定版省略 scientific label

### 3.1 当前问题

当前 `.architecture-map-node small` 使用 `line-clamp-2`，导致 stable-facing scientific label 被 `...` 截断。

### 3.2 要求

Architecture 主卡的 human-readable scientific label：

- 禁止 `line-clamp` / ellipsis；
- 允许自然 2–3 行换行；
- 文字必须完整显示；
- key labels 必须完整：
  - Shared environmental-response vector
  - Catalogue-external open tail
  - Group composition weight
  - Response heterogeneity covariance
  - Richness and discovery targets
- 如果需要，增加 presentation-only card width/height；
- layout/packing 必须重新使用最终 card geometry，保持 overlap=0；
- Overview 与 Full model 都必须通过；
- 1366×768 与 1536×864 都必须通过；
- title/tooltip 只能辅助，不能替代主卡完整显示。

Hard gate：

```text
CAT_OVERVIEW_PRIMARY_LABEL_CLIPPED_COUNT = 0
CAT_FULL_PRIMARY_LABEL_CLIPPED_COUNT = 0
CAT_NODE_OVERLAP_COUNT = 0
EDGE_LABEL_CARD_COLLISION_COUNT = 0
```

browser regression 不得只检查 card bbox overlap；还要对 label 元素检查：

- `scrollHeight <= clientHeight + tolerance`；
- 无 `-webkit-line-clamp` 生效；
- 无 `text-overflow: ellipsis`；
- screenshot 中完整可辨。

## 4. Architecture `Why it matters`：必须讲统计意义

### 4.1 当前问题

当前 Architecture fallback `whyEntityMatters()` 主要说：

- 位于哪个 layer；
- 有多少 upstream/downstream relations。

这属于 graph metadata，不是研究者解释。

### 4.2 要求

为 canonical Architecture 核心对象提供 source-supported、item-specific scientific explanation。可以使用 entity-id keyed presentation copy 或等价 typed metadata；不要通过自由生成猜科学语义。

至少：

- `beta^U_gh`：说明 open-tail environmental response 由 shared `nu`、group deviation `a_g`、open-tail-specific heterogeneity `v^U_gh` 组成；
- `gamma_g`：说明它是 `gamma_0` 与 `pi_g` 构成的 derived group intensity，不是独立 intercept/group effect；
- `p_g`：说明 fixed computational truncation，不是 estimand/未知真实物种数，zero slots 保留 likelihood information；
- `alpha^U_gh`：说明 TRACE extreme-tail calibration 被保留在 open-tail intercept；
- `Sigma_W`：说明 residual dependence 只在 finite working set，并通过 unit diagonal 保持 marginal probit interpretation；
- `c(f)`：说明 raw feature 被确定性路由到 finite catalogue identity 或 catalogue-external open tail；
- `mathcal K` / `mathcal U`：说明 finite known identities 与 anonymous open-tail discovery 的身份分离；
- `x_i -> z^U_igh -> y^U_igh`：说明 covariate / latent probit score / observed occurrence 的读法；
- Original TRACE 核心 `alpha_j`, `beta_j`, `z_ij` 也不得退化为 relation-count copy。

主 `Why it matters` 禁止出现：

```text
N upstream relations
N downstream relations
sits in the <layer> layer
contextual graph entity
```

这些信息如有价值可以放 Advanced metadata，不得做主解释。

## 5. Semantic Diff 小幅 copy polish

W01 仅报 P3：少量全大写/source-note 味。

允许在不改变 semantics 的前提下低风险清理：

- prose 使用正常 sentence case；
- math 继续 structured rendering；
- 不扩大到新 onboarding / new evidence claim。

这不是主 blocker，不得为此扩 scope。

## 6. 必须保护的 RC.10 PASS surface

不要回归：

```text
NO_NODE_OVERLAP = PASS
NO_EDGE_LABEL_CARD_COLLISION = PASS
SELECTION_GEOMETRY_STABLE = PASS
MOTION_QUALITY = PASS
LINEAGE_VISUAL_GRAMMAR = PASS
EVIDENCE_VISUAL_GRAMMAR = PASS
ADVANCED_COLLAPSED_CONTENT_HIDDEN = PASS
```

特别是不要动 Lineage/Evidence presentation grammar。

## 7. Regression

新增：

```text
npm run test:architecture-rc11
```

加入 cumulative regression。

Playwright 至少：

1. CAT Overview 1366 Light；
2. CAT Overview 1536 Dark；
3. CAT Full model Fit 1366；
4. CAT Full model Fit 1536；
5. betaU inspector formula；
6. gamma_g inspector formula；
7. alphaU inspector formula；
8. Original TRACE formula；
9. Sigma_W formula；
10. Architecture core Why-it-matters text；
11. Lineage/Evidence smoke，确保未被修改；
12. Advanced disclosure smoke；
13. model/view/search/save-restore minimal release smoke。

硬断言：

```text
FORMULA_FRAGMENTED_COUNT = 0
RAW_ASCII_CANONICAL_DEFINITION_COUNT = 0
CAT_OVERVIEW_PRIMARY_LABEL_CLIPPED_COUNT = 0
CAT_FULL_PRIMARY_LABEL_CLIPPED_COUNT = 0
CAT_NODE_OVERLAP_COUNT = 0
EDGE_LABEL_CARD_COLLISION_COUNT = 0
GENERIC_GRAPH_TOPOLOGY_WHY_COUNT = 0
LINEAGE_VISUAL_GRAMMAR = PASS
EVIDENCE_VISUAL_GRAMMAR = PASS
```

## 8. Verification / version / public gate

运行：

```text
npm run build
npm run test:regression
npm run test:architecture-rc11
npm run bench:architecture-g05
npm run test:browser
git diff --check
```

更新：

```text
version = 2.0.0-rc.11
commit = v2.0.0-rc.11
```

写：

```text
results/asteria_v2_rc11_reader_finish/result.md
```

push `origin/main`，确认 HEAD 对齐、worktree clean，然后刷新固定公网：

`https://asteria.httpwwwcardiacnexus-ukb.com/`

必须：

```text
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_ROOT_CHECK = PASS
PUBLIC_STATUS_CHECK = PASS
PUBLIC_BROWSER_SMOKE = PASS
PUBLIC_VERSION = 2.0.0-rc.11
```

## 9. Result fields / next action

最终返回：

```text
STATUS = COMPLETE
CURRENT_VERSION = 2.0.0-rc.11
FINAL_COMMIT = ...
FORMULA_FRAGMENTED_COUNT = 0
RAW_ASCII_CANONICAL_DEFINITION_COUNT = 0
CAT_OVERVIEW_PRIMARY_LABEL_CLIPPED_COUNT = 0
CAT_FULL_PRIMARY_LABEL_CLIPPED_COUNT = 0
CAT_NODE_OVERLAP_COUNT = 0
EDGE_LABEL_CARD_COLLISION_COUNT = 0
GENERIC_GRAPH_TOPOLOGY_WHY_COUNT = 0
MATH_RENDERING_MAIN_UI = PASS
COPY_QUALITY_MAIN_UI = PASS
LINEAGE_VISUAL_GRAMMAR = PASS
EVIDENCE_VISUAL_GRAMMAR = PASS
SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
LINEAGE_LAYOUT_CHANGED = NO
EVIDENCE_LAYOUT_CHANGED = NO
REVIEWER_SCOPE_EXPANDED = NO | YES
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_BROWSER_SMOKE = PASS
NEXT_ACTION = GPT_WORK_RC11_WAVE_A_W01_W04_W05_W06
```

如果 scope expanded，再按 touched surfaces 增加 reviewer；否则 W03 继续 carry forward。