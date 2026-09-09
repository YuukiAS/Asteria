---
id: asteria_v2_g06
title: Build Architecture, Lineage, and Evidence multi-view final Web RC
created_at: 2026-09-09
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Goal G06 — Architecture + Lineage + Evidence / Final Web RC

## 1. 执行时机

仅当 `results/asteria_v2_g05_result.md` 中：

```text
G06_READY = YES
```

才执行。

目标版本：`2.0.0-rc.2`。

G06 是当前 Asteria 2.0 Web 主链最后一个自动 Goal。完成后停止等待用户最终验收，不自动发布 stable。

## 2. 必须先读

- `AGENTS.md`
- `prompts/AGENT_RULES.md`
- `ROADMAP.md`
- `VERSIONING.md`
- `docs/notes/2026-09-09_asteria_v2_web_delivery_plan.md`
- `docs/notes/2026-09-09_trace_and_cat_trace_reference_for_asteria_v2.md`
- `docs/design/accepted-concepts/README.md`
- `docs/design/accepted-concepts/E1_lineage.png`
- `docs/design/accepted-concepts/E2_evidence.png`
- `results/asteria_v2_g05_result.md`
- 当前 schema / view projection / variant / validation / Story 实现。

若 repo 提供 frontend-app-builder / react-best-practices / frontend-testing-debugging skills，读取与本 Goal相关部分，用于真实浏览器实现与性能/视觉 QA。

## 3. 目标

实现真正的：

> **one canonical graph, multiple independent view projections**

当前正式 view：

- Architecture：模型内部结构；
- Lineage：方法级谱系；
- Evidence：claim-centered 证据闭环。

三个 view 共享实体定义与关系真值，但布局、camera、default granularity、filters、outline 与 inspector context 独立。

Story/Narrative 继续是线性输出层，不成为第四套 graph 真值。

## 4. Shared graph / independent layout

必须保证：

1. 同一 entity 的 definition/provenance 只存一份；
2. 同一 entity 可以投影到多个 views；
3. position/size/collapse/local visibility 属于 view projection；
4. 切换 view 不重建 domain graph；
5. 每个 view 保存自己的 viewport/layout；
6. selection 若在目标 view 有 projection，可跨 view 保留；没有 projection 时 Inspector 仍能显示 canonical entity，并提供 `Show in current view` 或等价动作；
7. 不自动把 Architecture 全部 symbols 投影进 Lineage/Evidence。

## 5. Architecture view

保留 G05 已完成 Architecture，不做破坏性重写。

在 multi-view shell 中保证：

- Original TRACE 与 CAT-TRACE variants 可切换；
- Symbol Trace / Layer / Outline / Semantic Diff 都继续可用；
- `Open in Lineage` / `Open Evidence` 只在存在对应 entity/relation 时展示。

## 6. Lineage view

### 6.1 粒度

节点主要是：

- method；
- model；
- paper；
- algorithm；
- prior family / methodological component。

不要铺 `beta`, `gamma`, `Sigma` 这类普通模型内部微观符号。

### 6.2 初始 CAT-TRACE seed

至少使用经过 reference note 核对的：

- TRACE / Infinite JSDM — Stolf & Dunson；
- HMSC framework — Ovaskainen / HMSC；
- bigMVP / high-dimensional multivariate binary response — Chakraborty, Ou & Dunson；
- Sparse Bayesian Infinite Factor Models / MGP — Bhattacharya & Dunson；
- CAT-TRACE。

可以加少量确实需要的相关方法，但不导入整篇 bibliography。

概念图 E1 中任何错误作者名、虚构论文名或不准确方法关系不得进入 seed。

### 6.3 Lineage relation types

至少：

- `extends`；
- `preserves`；
- `borrows_interpretation_from`；
- `computationally_inspired_by`；
- `uses_methodological_component_from`；
- `related_to`（仅用于真正的 broader proximity，不能替代更精确关系）。

不要自动从 citation 推断这些关系。

### 6.4 CAT-TRACE Method Inspector

至少显示：

- method summary；
- Extends；
- Preserves；
- Borrows interpretation；
- Computational inspiration；
- Adds / changes；
- Open in Architecture；
- Open Evidence。

不得把 CAT-TRACE 描述成 `TRACE + HMSC` 的机械拼接。

## 7. Evidence view

### 7.1 Claim-centered graph

Evidence 的中心实体是 Claim，不是 Dataset、文件或 TODO。

第一版允许：

- theorem / proposition；
- proof dependency；
- simulation；
- real dataset/result；
- ablation；
- implementation evidence；
- reference；
- limitation / open question。

### 7.2 Evidence relations

至少区分：

- `theoretically_supports`；
- `empirically_tests`；
- `validated_on`；
- `validates_implementation`；
- `stress_tests`；
- `limited_by`；
- `pending`；
- `contradicts_or_challenges`。

不要把所有 support 都画成绿色通过墙。

### 7.3 初始 CAT-TRACE Evidence seed

可以以 grouped open-tail richness / marginal probit preservation 等 claim 展示结构，但**状态必须来自当前 repo 实际证据**：

- theory/proof 只有真实存在时才标 available/supported；
- simulation 尚未运行完成时标 planned/pending；
- real data 尚未形成结果时不能标 empirical support；
- explicit vs aggregated zero-slot 只有测试真实存在并通过后才标 validated；
- future marked-discovery distributional theorem 保持 pending。

第一篇论文当前真实数据主线只包括：

- Finland fungi；
- Malagasy arthropods；
- South-West Australia plants。

GSMc 不进入第一篇论文主 Evidence chain。

### 7.4 Claim Inspector

至少显示：

- claim statement；
- status；
- supporting evidence grouped by type；
- limitations / missing evidence；
- affected variants；
- linked theorem/simulation/dataset/result；
- Open in Architecture / Lineage（若存在）。

Validation 只提醒 closure gap，不评价“论文科学上正确”。

## 8. Cross-view interaction

实现至少：

- top View switch；
- left view rail；
- canonical entity cross-link；
- Inspector contextual tabs；
- `Open in Architecture/Lineage/Evidence`；
- selection continuity；
- per-view outline/filter；
- search 可以按 current view 或 all canonical entities 工作，并清楚显示 scope。

View switching 不应让用户丢失当前 project / model variant context；Evidence/Lineage 对模型 variant 的 applicability 可由 relation metadata 表达。

## 9. Accepted concept fidelity

E1/E2 已经人工接受，是正式视觉/信息架构参考。

### E1 要保留

- method-level canvas 是主体；
- CAT-TRACE selected；
- incoming methodological influences 清楚；
- Method Inspector 高密度但可读；
- cross-view links；
- Quiet Celestial Dark 背景极弱。

### E2 要保留

- claim-centered graph；
- theory/proof/simulation/real-data/implementation/open-gap 节点视觉可区分；
- Claim Inspector；
- limitation/pending 是一等关系；
- 不做 project management dashboard。

概念图里的数学公式、citation、状态不能直接作为 seed truth。

实现后必须用真实 browser screenshot 与 E1/E2 对照。若 skill workflow 支持 image comparison/view image，应按可用工具完成；否则做明确 screenshot mismatch ledger。

## 10. Product Design / Figma 决策

accepted concepts 已经解决宏观 layout，不再开新的产品方向。

优先使用现有 frontend product-design skill 做：

- design token extraction；
- component inventory；
- browser fidelity QA；
- responsive refinement。

Figma 默认不使用。只有真实实现后出现明确且影响多个组件的 token/component ambiguity，且当前 Figma connector 能直接减少歧义时才使用；否则跳过，不得让 Figma 阻塞 G06。

## 11. 性能

- 每个 view 只渲染自己的 projection；
- view switch 不重建 graph indexes；
- large Evidence graph 可 filter/outline，不要求一屏铺完；
- Lineage/Evidence 新功能必须使用 selector；
- no broad full-store subscription regression；
- no heavy TipTap block per method/claim by default；
- stress fixture 在 view switching / search / selection / trace 下无明显冻结。

## 12. Browser QA

至少实际测试：

1. Architecture → Lineage → Evidence → Architecture；
2. CAT-TRACE entity cross-view navigation；
3. Original TRACE model variant；
4. CAT-TRACE model variant；
5. Lineage CAT-TRACE inspector；
6. Evidence Claim Inspector；
7. Evidence pending/limitation relation；
8. per-view layout persistence；
9. search current-view/all-project；
10. Story regression；
11. save/restore/import/export；
12. light/dark theme；
13. laptop viewport。

## 13. Tests

至少新增：

- same entity across multiple views shares definition；
- independent layout persistence；
- view switching；
- selection/projection behavior；
- Lineage relation types；
- verified Lineage seed names；
- claim-evidence closure warnings；
- Evidence status truthfulness fixture；
- no GSMc in first-paper main evidence seed；
- Story/V1 migration/Architecture regression；
- stress fixture；
- browser QA evidence。

运行 `npm run build` + 全量 regression + G05 performance checks。

## 14. 退出门槛

完成后必须达到：

1. Architecture / Lineage / Evidence 三 view 完整工作；
2. shared graph / independent layout 正确；
3. Original TRACE / CAT-TRACE 两 variants 无语义污染；
4. E1/E2 信息架构与视觉方向在浏览器中达到可接受一致性；
5. Evidence 不制造虚假已完成证据；
6. save/restore/import/export/Story/V1 migration 不退化；
7. stress/performance 无严重 regression；
8. 版本 `2.0.0-rc.2`；
9. commit `v2.0.0-rc.2` 并 push。

最后写：

```text
ASTERIA_V2_WEB_RC_READY_FOR_USER_ACCEPTANCE = YES/NO
NEXT_ACTION = FINAL_USER_ACCEPTANCE
```

## 15. 停止条件

- correctness / compatibility / performance gate 合理修复后仍失败；
- multi-view 必须复制三份 canonical graph 才能实现；
- accepted E1/E2 与现有实现存在无法兼容且会永久改变产品 workflow 的冲突；
- 必须改变 fixed public deployment；
- 需要新 credential / dependency download 才能继续。

普通布局、CSS、spacing、icon、component、motion 细节由 Codex 自主判断，不询问用户。

## 16. Result

写 `results/asteria_v2_g06_result.md`，记录：

- three-view acceptance matrix；
- cross-view behavior；
- Lineage/Evidence seed provenance；
- accepted-concept mismatch ledger；
- browser QA；
- performance；
- tests；
- commit/push；
- final readiness。

G06 后停止，等待用户最终验收。