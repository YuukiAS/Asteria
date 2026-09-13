---
id: asteria_v2_rc10_visual_finish
title: Final broad visual finish for Full model, Original TRACE, Lineage/Evidence, math/copy, and disclosure
created_at: 2026-09-13
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Asteria 2.0 RC.10 — Final Visual Finish

## 0. 状态与目标

RC.9 full re-audit 未通过。不要重新争论 severity；以最新 consolidated report 与用户人工视觉判断为准。

先读：

1. `AGENTS.md`
2. `prompts/AGENT_RULES.md`
3. `docs/operations/blackbox-audit/reports/RC9_FULL_REAUDIT_CONSOLIDATED_REPORT_2026-09-13.md`
4. `docs/operations/blackbox-audit/VISUAL_ACCEPTANCE_CONTRACT.md`
5. `docs/design/LINEAGE_EVIDENCE_VISUAL_GRAMMAR_SPEC.md`
6. `docs/operations/blackbox-audit/UI_BLACKBOX_BROWSER_CONTRACT.md`
7. `docs/notes/2026-09-09_trace_and_cat_trace_reference_for_asteria_v2.md`
8. 当前 Architecture/Lineage/Evidence renderer、viewProjection、RenderedMath、semanticDiff、reference panel、styles、browser tests。

目标版本：

```text
2.0.0-rc.10
```

本轮不是新增 feature，只做 stable-facing visual/product-quality repair。

完成后：

```text
NEXT_ACTION = GPT_WORK_REAUDIT_W01_W02_W04_W05_W06
```

若实际修改了 session/trace/state machine，则改为 W01–W06 全跑。

## 1. Scientific/state freeze

禁止改变：

- Original TRACE / CAT-TRACE Frozen V2 scientific truth；
- canonical entities / relation truth / ontology；
- Evidence pending/support/limitation truth；
- trace algorithm / direction semantics；
- Save/Restore contract；
- cross-view search truth；
- v1 migration compatibility；
- fixed public URL / DNS / tunnel identity。

必须在 result 返回：

```text
SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
```

若做不到，停止并说明 blocker。

## 2. Architecture Full model：真正 non-overlap

RC.9 只把 CAT Overview 修到基本可用；Full model + Fit 仍在 1366/1536 出现大量 card overlap。

### 2.1 不再把 Full model 强行塞进 viewport

采用 presentation virtual canvas + deterministic lane/slot packing：

- 6 个 semantic lanes 固定 x columns；
- 每个 lane 内按稳定顺序垂直排 slot；
- card 间至少 12–16 CSS px gap；
- Fit = 缩放整个 non-overlap virtual canvas；
- Zoom/Pan 查看局部；
- 不通过改变 canonical projection coordinates/relations 来实现；
- key cards 在 Fit 后仍可定位，hover/title 可完整读 label。

### 2.2 Hard assertion

1366×768、1536×864，CAT Full model + Fit：

```text
NODE_OVERLAP_COUNT = 0
PRIMARY_TITLE_CLIPPED_COUNT = 0
```

不要再接受“Full model 主动进入所以重叠没关系”。密可以，小可以，但不能互相压住。

## 3. Original TRACE：独立 deterministic layout

Original TRACE 不能复用导致节点挤压的 generic normalize。

为 Original TRACE Architecture 建稳定 presentation layout：

- observation: `x_i`, `y_ij`；
- latent: `z_ij`；
- parameterization: `alpha_j`, `beta_j`, `nu/Psi`, TRACE calibration `mu_p/tau_p/gamma/p`；
- inference/prediction/targets 放在独立 slots；
- 1366/1536 均无 overlap；
- model toggle 前后不存在 stale CAT positions。

Hard gate：W06 已报告的 `I_TRACE/R_i`, `tau_p/marginal probability`, `y_ij/z_ij` overlap 必须归零。

## 4. Lineage：按 dedicated visual grammar 重做 presentation

严格按：

`docs/design/LINEAGE_EVIDENCE_VISUAL_GRAMMAR_SPEC.md`

不要继续在当前 SVG 上微调几条文字。

### 4.1 Visual connector bundling

- 同一 source-target pair 只画一条 visual connector；
- TRACE -> CAT-TRACE 的 `extends` + `preserves` 数据层仍是两 relation，但视觉上一条 connector + 两个 chips；
- HMSC / bigMVP / MGP 各一 connector；
- target card 左边使用 4 个不同 vertical ports，connector 不在同一点汇成蓝色粗结；
- stroke 默认 1.5–2px；small arrowhead；selected 才增强。

### 4.2 Relation chips

禁止裸 SVG relation text。

用 HTML/presentation chips：

- HMSC: `Ecological hierarchy`
- TRACE: `Extends`, `Preserves`
- bigMVP: `Scalable probit`
- MGP: `Factor shrinkage`

完整 relation/provenance 保留 inspector。

### 4.3 Cards

stable-facing secondary copy：

- HMSC — Ecological hierarchy
- TRACE — Open-tail foundation
- bigMVP — Scalable probit computation
- MGP — Factor shrinkage
- CAT-TRACE — Catalogue-aware extension

不要主卡展示 `interpretation source`, `method source`, `methodological component`, `selected method`。

1366/1536 target 右侧 safe margin >= 48px；绝不能裁切。

## 5. Evidence：保持 clean graph，但修 copy

W01 视觉上 Evidence 基本通过，W04 copy 未通过。

### 5.1 Why it matters 不得再用 graph-topology 模板

禁止主文案：

`<entity> sits in the validation layer with ... upstream/downstream relations`

按 kind 给研究者解释：

- claim：具体 scientific claim + 当前 support/gap；
- proof：支持哪个 claim、支持什么；
- dataset：为什么用于 first paper、当前为何仍 pending；
- implementation：验证实现/符号一致性，不是 theorem proof；
- limitation：具体缺什么；
- pending theorem：什么仍未完成。

### 5.2 Closure gap 必须 entity-specific

`What is missing` 和 `What would close this` 不能所有项目复用同一句。

只基于现有 relation/constraints 生成，不能发明 scientific result。

## 6. Main-UI math rendering：彻底收口

### 6.1 Inspector canonical definition

- 所有核心 definition 用 KaTeX；
- 不显示 uppercased ASCII math；
- 公式容器不能碎裂上下标；
- 使用 `white-space: nowrap` + 必要时局部横向滚动；
- font-size/line-height 适合 inspector 300–460px 宽度。

必须覆盖：

- `beta^U_gh = nu + a_g + v^U_gh`
- `gamma_g = gamma_0 pi_g`
- open-tail intercept calibration
- Original TRACE latent equation / beta prior / alpha calibration
- Sigma_W normalization

### 6.2 Semantic Diff

所有数学 token 使用 structured math parts/RenderedMath，禁止主阅读层 raw：

`mathcal K`, `a_g`, `p_g^*`, `gamma_0`, `pi_g`, `gamma_g`, `beta^U_gh`, `Sigma_W`。

不要对整句 prose regex 猜 LaTeX。

## 7. Semantic Diff copy：逐项真实意义

禁止 generic：

`New CAT-TRACE structure that Original TRACE does not expose.`

每个 item 的 Why it matters 必须具体，例如：

- finite catalogue：separate known identities from open-tail discovery；
- matching：deterministic identity routing controls catalogue vs open-tail branch；
- grouping：shared response + group deviations；
- truncation/zero slots：keeps anonymous zero slots as likelihood information；
- gamma composition：separates total intensity from group allocation；
- catalogue hierarchy：allows finite catalogue trait/relatedness borrowing when inputs exist；
- residual dependence：finite working set correlation with unit marginal normalization；
- preserved marginal probit：dependence does not change marginal mean semantics。

无营销句、无“because it is new”。

## 8. Advanced / Export disclosure 真正隐藏

修复 W04/W06 发现：collapsed / `Show export tools` 时内容仍视觉展开。

要求：

```text
aria-expanded=false
=> Markdown / Schema V2 / preview / raw JSON / warning list 不渲染或 hidden

aria-expanded=true
=> 全部显示
```

mouse / Enter / Space / top Export 四条路径一致。

Top Export 可自动打开 inspector/disclosure并定位，但不下载。

## 9. Relation / edge label collision

Architecture：

- default 不显示 non-active edge text；
- active relation 用 compact HTML pill/halo；
- label 不盖 card；
- edge side ports 不穿 card body。

Lineage/Evidence：按 dedicated spec。

Hard geometry：

```text
EDGE_LABEL_CARD_COLLISION_COUNT = 0
RELATION_CHIP_CARD_COLLISION_COUNT = 0
```

## 10. Automated browser regression

新增：

```text
npm run test:architecture-rc10
```

并加入 cumulative regression。

Playwright 至少检查：

1. CAT Overview dark 1536；
2. CAT Overview light 1366；
3. CAT Full model Fit 1366；
4. CAT Full model Fit 1536；
5. Original TRACE 1366；
6. Original TRACE 1536；
7. Lineage 1366；
8. Lineage 1536；
9. Evidence 1366/1536 smoke；
10. inspector betaU/gamma_g/Original TRACE math；
11. Semantic Diff main items；
12. Advanced closed/open/top Export；
13. model/view/search/save-restore minimal smoke。

必须直接测：

```text
CAT_FULL_NODE_OVERLAP_COUNT = 0
ORIGINAL_TRACE_NODE_OVERLAP_COUNT = 0
LINEAGE_TARGET_CLIPPED = NO
LINEAGE_RELATION_CHIP_COLLISION_COUNT = 0
EDGE_LABEL_CARD_COLLISION_COUNT = 0
PRIMARY_TEXT_CLIPPING = 0
NO_RAW_MATH_MAIN_UI = PASS
NO_GENERIC_WHY_COPY = PASS
ADVANCED_COLLAPSED_CONTENT_HIDDEN = PASS
```

视觉截图：

- `rc10-cat-full-1366.png`
- `rc10-cat-full-1536.png`
- `rc10-original-1366.png`
- `rc10-lineage-1366.png`
- `rc10-lineage-1536.png`
- `rc10-evidence-1536.png`
- `rc10-inspector-math.png`
- `rc10-semantic-diff.png`
- `rc10-advanced-collapsed.png`

## 11. Verification

运行：

```text
npm run build
npm run test:regression
npm run test:architecture-rc10
npm run bench:architecture-g05
npm run test:browser
git diff --check
```

## 12. Version / commit / public gate

更新到 `2.0.0-rc.10`，写：

```text
results/asteria_v2_rc10_visual_finish/result.md
```

完成：

```text
commit = v2.0.0-rc.10
push origin/main
HEAD == origin/main
worktree clean
```

刷新固定公网：

`https://asteria.httpwwwcardiacnexus-ukb.com/`

必须：

```text
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_ROOT_CHECK = PASS
PUBLIC_STATUS_CHECK = PASS
PUBLIC_BROWSER_SMOKE = PASS
PUBLIC_VERSION = 2.0.0-rc.10
```

## 13. Required result fields

最终返回：

```text
STATUS = COMPLETE
CURRENT_VERSION = 2.0.0-rc.10
FINAL_COMMIT = ...
CAT_FULL_NODE_OVERLAP_COUNT = 0
ORIGINAL_TRACE_NODE_OVERLAP_COUNT = 0
LINEAGE_TARGET_CLIPPED = NO
LINEAGE_RELATION_CHIP_COLLISION_COUNT = 0
EDGE_LABEL_CARD_COLLISION_COUNT = 0
PRIMARY_TEXT_CLIPPING = 0
MATH_RENDERING_MAIN_UI = PASS
COPY_QUALITY_MAIN_UI = PASS
ADVANCED_COLLAPSED_CONTENT_HIDDEN = PASS
LINEAGE_VISUAL_GRAMMAR = PASS
EVIDENCE_COPY_QUALITY = PASS
SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
REVIEWER_SCOPE_EXPANDED = NO | YES
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_BROWSER_SMOKE = PASS
NEXT_ACTION = GPT_WORK_REAUDIT_W01_W02_W04_W05_W06
```

如果 state/session/trace 被修改，把 W03 加回 next action。
