---
id: asteria_v2_g03
title: Add typed relations, layers, recursive trace, and architecture outline
created_at: 2026-09-09
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Goal G03 — Typed Relations + Layers + Recursive Trace + Architecture Outline

## 1. 前置条件

仅当 `results/asteria_v2_g02_result.md` 中 `G03_READY = YES` 时执行。

目标版本：`2.0.0-beta.1`。

## 2. 目标

把 G02 的“点击一个符号看到直接连接”扩展成真正可阅读的 Architecture 视图：关系有语义、对象有层、用户可局部递归追踪，并能从自动生成的架构大纲定位模型。

## 3. 必须先读

- `AGENTS.md`
- `prompts/AGENT_RULES.md`
- `ROADMAP.md`
- `VERSIONING.md`
- `docs/notes/2026-09-09_asteria_v2_web_delivery_plan.md`
- `docs/notes/2026-09-09_trace_and_cat_trace_reference_for_asteria_v2.md`
- `results/asteria_v2_g02_result.md`
- 当前 architecture domain、Canvas、EdgeInspector、Inspector、search 实现。

Accepted concept A/B/C 可用于 visual/interaction reference，但数学与关系语义只服从 canonical reference。

## 4. Typed Relations

实现 relation semantic type，与 edge presentation 完全分离。

第一批至少支持：

```text
measured_as
preprocessed_into
aggregated_into
matched_to
derived_from
indexed_by
generates
depends_on
parameterized_by
transforms_to
constrained_by
conditions_on
marginalizes_to
factorizes_as
estimated_by
optimizes
solves
approximated_by
regularized_by
identified_by
uncertainty_quantified_by
targets
predicts
supports
tests
validated_on
limited_by
contradicts
causes
```

可在实现中分 family，但 JSON 中必须保留稳定 canonical relation value。

要求：

- semantic type 不由 line style/color 决定；
- legacy visual edges 可以保持 `unresolved`；
- relation inspector 同时编辑 semantic type 与 presentation；
- search/filter/export 可查询 relation type；
- ordinary regression/dependency 不自动变成 `causes`。

## 5. Configurable Architecture Layers

实现通用层，而不是 Bayesian-specific 硬编码：

- Scientific target / estimand
- Observed input
- Measurement / preprocessing
- Structure / latent representation
- Parameterization
- Assumption / identification
- Inference / estimation
- Prediction / decision
- Diagnostic / validation

允许项目自定义 label/order，但 canonical layer family 保持稳定。

Layer focus：

- 单层聚焦；
- 可保留与该层直接连接的 boundary nodes；
- 不删除或修改 entity；
- clear focus 恢复；
- camera fit 可选、短动画；
- selected/trace state 与 layer focus 不互相破坏。

## 6. Recursive Trace

在 G02 direct trace 基础上增加：

- direct / recursive mode；
- upstream / downstream / both；
- depth limit；
- breadcrumb / current focus；
- recursive expansion 使用 adjacency index；
- cycle-safe，不能无限递归；
- causal DAG validation 与一般模型 graph traversal 分开，不因普通 cycle 就崩溃。

默认不一次显示整个 closure；可采用 depth 1→2 逐步扩展。

## 7. Architecture Outline

自动从 canonical layer + entity/symbol graph 生成结构大纲，不依赖手工 Story Outline。

要求：

- outline 只引用 entity ID，不复制定义；
- 点击 row 定位/选择 canvas entity；
- 支持 collapse by layer/group；
- 当前 selection/trace 同步；
- entity 没有当前 view projection 时给合理提示或临时 reveal，不创建重复 entity；
- Story Outline 继续独立存在。

CAT-TRACE outline 至少呈现：Observed → Measurement → Latent → Parameterization → Inference → Prediction/Targets。

Original TRACE outline 不得出现 catalogue/grouped-tail 专属对象。

## 8. Interaction / motion

可实现轻量结构动效：

- trace path reveal；
- layer focus fade；
- camera pan/fit；
- outline-to-canvas selection。

只允许 transform/opacity/SVG/path emphasis 等轻量方式；支持 reduced motion。不要加全局持续 dash、WebGL 或粒子系统。

## 9. 性能

- Canvas 只消费当前 view projection；
- layer/trace filtering 在 memoized selector / projection helper 中做，不把全部 domain graph 直接塞给 React Flow；
- graph query 使用 adjacency index；
- touched core components 去掉不必要的 `useMapStore()` 全量订阅；
- 200–300 visible nodes / 500–800 visible edges fixture 下 trace/layer interaction 不应出现明显冻结。

不要求一次重写所有 store，但任何新代码不得扩大 broad subscription 模式。

## 10. 测试

至少新增：

- typed relation serialization + legacy unresolved；
- causal relation explicit-only；
- recursive trace depth/cycle safety；
- layer focus preserves data；
- outline generation and click selection；
- Original TRACE relation/outline assertions；
- CAT-TRACE relation golden assertions；
- Story Outline regression；
- active model variant / legacy edge visibility regression；
- stress projection query benchmark。

运行 build + 全量 regression。

## 11. 退出门槛

1. relation semantics 可编辑/保存/查询；
2. layer focus 可用；
3. recursive trace 可用且 cycle-safe；
4. Architecture Outline 可用；
5. Original TRACE / CAT-TRACE references 都正确；
6. legacy Story/version/edge workflow 不退化；
7. stress fixture 无明显架构性卡顿；
8. 版本 `2.0.0-beta.1`；
9. commit `v2.0.0-beta.1` 并 push。

## 12. 停止条件

若实现 layer/outline 必须复制实体定义，或 recursive trace 依赖全量字符串扫描，停止，不得用不可维护 workaround。

## 13. Result

写 `results/asteria_v2_g03_result.md`，末尾：

```text
G04_READY = YES/NO
```

并记录 relation schema、outline example、stress evidence、测试、commit/push。