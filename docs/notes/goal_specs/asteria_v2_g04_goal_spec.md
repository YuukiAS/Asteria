---
id: asteria_v2_g04
title: Add architecture export, structural validation, and TRACE to CAT-TRACE semantic diff
created_at: 2026-09-09
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Goal G04 — Export + Structural Validation + Original TRACE ↔ CAT-TRACE Semantic Diff

## 1. 前置条件

仅当 `results/asteria_v2_g03_result.md` 中 `G04_READY = YES` 才执行。

目标版本：`2.0.0-beta.2`。

## 2. 目标

让 2.0 graph 不只“画得出来”，而是能：

1. 导出为脱离 Asteria 也能阅读的模型说明；
2. 发现机械可检测的结构缺口；
3. 正确解释 **Original TRACE** 与 **CAT-TRACE Frozen V2** 到底改变了什么。

## 3. 必须先读

- `AGENTS.md`
- `prompts/AGENT_RULES.md`
- `ROADMAP.md`
- `VERSIONING.md`
- `docs/notes/2026-09-09_asteria_v2_web_delivery_plan.md`
- `docs/notes/2026-09-09_trace_and_cat_trace_reference_for_asteria_v2.md`
- `results/asteria_v2_g03_result.md`
- 当前 Story Markdown export、legacy model version resolver、architecture schema。

如果 accepted concepts 已导入，可把 D 作为 diff 视觉参考，但其图片数学内容不是 source of truth。

## 4. Readable Architecture Markdown Export

新增独立于 Story deck 的模型说明 export。至少包含：

- project/model purpose 与 scope；
- selected canonical model variant；
- observed inputs；
- measurement/preprocessing；
- layers 按阅读顺序的对象与公式；
- deduplicated canonical symbol table；
- parameter/derived quantity 的 definition/source；
- assumptions/constraints；
- inference/approximation；
- prediction/estimand targets；
- unresolved warnings；
- semantic diff summary（比较 variant 时）。

要求：

- Markdown + 标准 LaTeX 可独立阅读；
- 不输出内部 machine token 当正文；
- 相同 symbol 不因多处使用重复定义；
- unresolved object 明确标记，不能编造解释；
- Story Outline export 保持原功能。

同时完善 schema-v2 JSON export，保留 stable IDs、relations、views、variants、validation warnings。

## 5. Structural Validation Engine

只做机械结构审计，不假装数学证明。

第一批 warning 至少检查：

1. referenced symbol/entity 不存在；
2. 同 scope canonical symbol 冲突；
3. 显式声明的 indices/dimension 明显矛盾；
4. derived quantity 同时又被赋独立 prior/stochastic law；
5. parameter/object 完全没有进入任何 relation/target（允许显式 ignore）；
6. estimator 没有 target；
7. likelihood/stochastic mechanism 没有 observed data input；
8. causal estimand/identified functional 缺 identification condition link；
9. claim 缺 supports/tests/validated_on 证据时 warning；
10. semantic variant 修改 definition，但依赖对象仍错误标为 unchanged；
11. formula binding 指向 stale symbol ID；
12. code binding 若存在且本地可检查，指向不存在路径时 warning。

所有 warning 必须有 severity、entity refs、human-readable message。Validation 不自动修改 graph。

CAT-TRACE fixture 至少验证：

- `gamma_g` 是 `gamma_0*pi_g` 派生量；
- `p_g` 不应被标为 estimand；
- `a_g` 有 sum-to-zero constraint；
- `Sigma_W` scope 限于 finite working set；
- `C_tax` / `C_phy` source semantics 不混淆；
- canonical symbol bindings 不 stale。

Original TRACE fixture 至少验证：

- 不存在 catalogue/grouped-tail entities；
- `p` 是 truncation；
- TRACE tail calibration relation 存在；
- marginal probit interpretation relation 存在。

## 6. Semantic Variant Diff

保留 legacy sequential rich-text versions，但新增 semantic diff。

第一批正式 comparison 固定为：

```text
Original TRACE  ->  CAT-TRACE Frozen V2
```

不要把历史 grouped working draft 作为第三个首发 canonical variant。

至少支持：

- Added entity/relation；
- Removed/absent entity/relation；
- Modified definition；
- Modified assumption/constraint；
- Modified target；
- Preserved semantic invariant；
- Unchanged inherited entity。

必须能结构化报告：

### Added in CAT-TRACE

- finite catalogue `mathcal K`, `K`, `mathcal K_n`；
- `c(f)` matching；
- biological grouping + `a_g`；
- grouped `p_g`, `p_g^*`, zero slots；
- `gamma_0`, `pi_g`, `gamma_g`；
- finite catalogue intercept/slope structure；
- catalogue/open-tail discovery split；
- finite-working-set normalized factor-copula architecture；
- optional trait/relatedness/phylogeny modules。

### Modified

Original TRACE generic slope superpopulation：

```latex
\beta_j\sim N_q(\nu,\Psi)
```

CAT-TRACE open-tail：

```latex
\beta^{\mathcal U}_{gh}=\nu+a_g+v^{\mathcal U}_{gh}.
```

### Preserved

- marginal probit interpretation；
- TRACE open-tail extreme-value calibration；
- finite expected richness semantics under calibrated tail；
- unit-marginal residual dependence does not change marginal occurrence mean。

### Explicitly forbidden false diff

- 不得说 original TRACE 使用 `nu_g` group-specific mean；
- 不得把 `gamma_0` 写成 global intercept；
- 不得把 `pi_g` 写成 group effect；
- 不得把 `p_g` 写成 unknown species count。

## 7. Diff UI

参考 accepted concept D 的结构语言：

- 同一 canvas 尽量保持稳定空间位置；
- added 用克制 accent；
- modified 用清晰但不刺眼的 highlight；
- absent/hidden 用 ghost outline；
- preserved 不需要全图发光；
- Inspector 显示 before/after；
- 顶部 base/target control compact；
- 不做 GitHub PR 页面。

视觉图片里的公式/作者/数值不得直接复制；使用 canonical reference fixture 渲染。

## 8. Cross-paradigm acceptance fixtures

### Frequentist regression / optimization

```latex
y=X\beta+\varepsilon,\qquad
\widehat\beta=\arg\min_b\|y-Xb\|^2.
```

必须区分 data、parameter、estimator、objective、sampling uncertainty；`beta` 没有 prior 不应 warning 为不完整。

### Causal ATE

包含 `X,A,Y,Y(1),Y(0),ATE`、consistency/exchangeability/positivity、identified functional、一个 estimator。必须区分 causal relation、identification relation、estimation relation。

这些是 schema acceptance fixtures，不是新增统计计算引擎。

## 9. 测试

至少新增：

- Original TRACE Markdown golden export；
- CAT-TRACE Markdown golden export；
- dedup symbol table；
- JSON schema v2 round-trip；
- each validation warning positive + negative case；
- no false Bayesian-prior warning on frequentist fixture；
- causal identification warning case；
- two-variant semantic diff golden；
- forbidden false-diff assertions；
- legacy Story export regression；
- v1 migration regression。

运行 build + 全量 regression。

## 10. 退出门槛

1. 两个 model Markdown 可独立阅读；
2. schema-v2 JSON stable；
3. structural warnings 可定位且不自动修；
4. CAT + TRACE + frequentist + causal fixtures 全通过；
5. Original TRACE ↔ CAT-TRACE semantic diff 正确；
6. legacy Story/versions 不坏；
7. 版本 `2.0.0-beta.2`；
8. commit `v2.0.0-beta.2` 并 push。

## 11. 停止条件

若 validation 只能靠文本关键词猜语义、variant diff 必须复制整张 graph、或无法防止 original TRACE 被历史 CAT-TRACE 记号污染，停止并修 schema，不得硬过 gate。

## 12. Result

写 `results/asteria_v2_g04_result.md`，末尾：

```text
G05_READY = YES/NO
```

记录 export 样例、validation、four fixtures、semantic diff、测试、commit/push。