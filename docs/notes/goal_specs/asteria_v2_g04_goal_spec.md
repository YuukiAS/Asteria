---
id: asteria_v2_g04
title: Add architecture export, structural validation, and semantic variant diff
created_at: 2026-09-08
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Goal G04 — Architecture Export + Structural Validation + Semantic Variant Diff

## 1. 前置条件

仅当 `results/asteria_v2_g03_result.md` 中 `G04_READY = YES` 才执行。

目标版本：`2.0.0-beta.2`。

## 2. 目标

让 2.0 graph 不只“画得出来”，而是能可靠地：

1. 导出为脱离 Asteria 也能阅读的模型说明；
2. 发现机械可检测的结构缺口；
3. 解释模型版本到底改变了什么语义。

## 3. 必须先读

- `AGENTS.md`
- `prompts/AGENT_RULES.md`
- `docs/notes/2026-09-08_asteria_v2_master_plan.md`
- `docs/notes/2026-09-08_cat_trace_reference_architecture_for_asteria_v2.md`
- `results/asteria_v2_g03_result.md`
- 当前 Story Markdown export、model version resolver、architecture schema。

## 4. Readable Architecture Markdown Export

新增独立于 Story deck 的模型说明 export。输出至少包含：

- project/model purpose 与 scope；
- observed inputs；
- measurement/preprocessing；
- layers 按阅读顺序的对象与公式；
- deduplicated canonical symbol table；
- parameter/derived quantity 的 definition/source；
- assumptions/constraints；
- inference/approximation；
- prediction/estimand targets；
- unresolved warnings；
- variant summary（若选定 variant）。

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
4. derived quantity 同时又被赋独立 prior/stochastic law 的冲突；
5. parameter/object 完全没有进入任何 relation/target（允许显式忽略）；
6. estimator 没有 target；
7. likelihood/stochastic mechanism 没有 observed data input；
8. causal estimand/identified functional 缺 identification condition link；
9. claim 缺 supports/tests/validated_on 证据时给 warning；
10. semantic variant 修改 definition，但依赖对象仍被错误标记 unchanged；
11. formula binding 指向 stale symbol ID；
12. code binding 若已存在且能本地检查，指向不存在路径时 warning。

所有 warning 必须有 severity、entity refs、human-readable message。Validation 不自动修改 graph。

CAT-TRACE fixture 至少验证：

- `γ_g` 是 `γ_0 π_g` 派生量；
- `p_{U,g}` 不应被标为 estimand；
- `a_g` 的 sum-to-zero constraint link 存在；
- `Σ_W` scope 限于 finite working set；
- canonical symbol bindings 不 stale。

## 6. Semantic Variant Diff

保留 legacy sequential rich-text versions，但新增 semantic diff。至少支持：

- Added entity/relation；
- Removed entity/relation；
- Modified definition；
- Modified assumption/constraint；
- Modified target；
- Unchanged inherited entity。

CAT reference variant chain：

```text
TRACE -> Grouped open-tail -> Catalogue-aware CAT-TRACE
```

必须能生成结构化 diff summary，而不是只比较 serialized rich-text string。

UI 最小闭环：

- 选择 base/target variant；
- canvas 保持尽量稳定布局；
- added/removed/modified 以 restrained presentation 表达；
- inspector 显示 before/after definition 或 relation；
- unchanged 不持续闪烁。

不要为了 diff 创建三份实体 copy。

## 7. Cross-paradigm acceptance fixtures

为了防止 schema 暗中只适用于 Bayesian model，新增两个小 fixture：

### Frequentist regression / optimization

```latex
y=X\beta+\varepsilon,\qquad
\widehat\beta=\arg\min_b\|y-Xb\|^2.
```

必须能区分 data、parameter、estimator、objective、sampling uncertainty；`β` 没有 prior 不应 warning 为“不完整”。

### Causal ATE

包含：`X, A, Y, Y(1), Y(0), ATE`、consistency/exchangeability/positivity、identified functional、一个 estimator。必须区分 causal relation、identification relation、estimation relation。

这些是 schema acceptance fixture，不是新增统计计算引擎。

## 8. 测试

至少新增：

- CAT Markdown golden export；
- dedup symbol table；
- JSON schema v2 round-trip；
- each validation warning positive + negative case；
- no false Bayesian-prior warning on frequentist fixture；
- causal identification warning case；
- semantic variant diff golden；
- legacy Story export regression；
- v1 migration regression。

运行 build + 全量 regression。

## 9. 退出门槛

1. readable model Markdown 可独立阅读；
2. schema-v2 JSON stable；
3. structural validation warnings 可定位且不自动修；
4. CAT + frequentist + causal fixtures 全通过；
5. semantic diff 正确；
6. legacy Story/versions 不坏；
7. 版本 `2.0.0-beta.2`；
8. commit `v2.0.0-beta.2` 并 push。

## 10. 停止条件

若 validation 只能通过文本关键词猜语义，或 variant diff 必须复制整张 graph，停止并修 schema，不得硬过 gate。

## 11. Result

写 `results/asteria_v2_g04_result.md`，末尾：

```text
G05_READY = YES/NO
```

记录导出样例路径、validation 覆盖、three-paradigm fixture、variant diff、测试、commit/push。