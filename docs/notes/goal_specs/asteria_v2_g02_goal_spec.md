---
id: asteria_v2_g02
title: Build CAT-TRACE reference workspace and Symbol Trace
created_at: 2026-09-08
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Goal G02 — CAT-TRACE Reference Workspace + Canonical Symbols + Symbol Trace

## 1. 前置条件

只有 `results/asteria_v2_g01_result.md` 中 `G02_READY = YES` 才执行。

目标版本：`2.0.0-alpha.2`。

这一步第一次把 2.0 semantic kernel 变成用户可感知的价值：**点击一个统计符号，能明确看到它是什么、如何定义、直接依赖什么、被哪里使用。**

## 2. 必须先读

1. `AGENTS.md`
2. `prompts/AGENT_RULES.md`
3. `docs/notes/2026-09-08_asteria_v2_master_plan.md`
4. `docs/notes/2026-09-08_cat_trace_reference_architecture_for_asteria_v2.md`
5. `docs/notes/2026-09-08_asteria_v2_product_design_and_desktop_strategy.md`
6. `results/asteria_v2_g01_result.md`
7. 当前 Symbol / equation / Inspector / Canvas 实现。

CAT-TRACE canonical reference note 是本任务的模型真值入口。不要回到历史 Asteria demo 或旧 TRACE notation 自行补定义。

## 3. CAT-TRACE canonical fixture

创建一份版本化 reference fixture，不硬编码完整论文，而只覆盖 Asteria 必须理解的模型 anatomy。

至少包括以下 canonical symbols/objects：

- `Y_raw`, `x_i`, `c(f)`, `g(f)`；
- `y^K_{ij}`, `y^U_{igh}`；
- `z^K_{ij}`, `z^U_{igh}`；
- `α^K_j`, `α^U_{gh}`；
- `β^K_j`, `β^U_{gh}`；
- `ν`, `a_g`, `Γ`, `t_j`, `b^phy_j`, `v^K_j`, `v^U_{gh}`, `Ψ`；
- `γ_0`, `π_g`, `γ_g`；
- `p_{U,g}`；
- `Λ_W`, `Ω_W`, `Σ_W`；
- richness / catalogue discovery / open-tail discovery targets。

必须保持 canonical index 顺序 `y^U_{igh}`，residual factor index 用 `d`，不能复用 `h`。

## 4. Project-level canonical symbol registry

实现 project-level symbol registry UI/API，而不是继续把所有符号锁在某一个 Symbol block 的私有列表中。

第一版 symbol 需要能存并编辑：

- stable ID；
- LaTeX；
- canonical name；
- meaning；
- object kind / role；
- scope；
- observed status；
- definition mode；
- indices；
- dimension/domain（可选但 CAT fixture 应填）；
- definition reference。

旧 Symbol block 继续可用，并能作为 canonical registry 的一个投影/兼容展示；不能删除原 workflow。

## 5. Formula-aware explicit binding

第一版不要造完整 LaTeX parser。实现最小显式绑定：

- formula/rich-text equation 可以保存 token/fragment → symbol ID 的绑定；
- 用户可以从已存在 canonical symbols 选择；
- 改 display LaTeX 不应改变 symbol internal ID；
- unresolved token 不自动猜；
- import/export 保存 binding。

若 TipTap extension 直接修改风险过高，可以先对 block/display equation 实现稳定绑定，再扩展 inline token。必须在 result 写清边界。

## 6. Symbol Inspector

点击已绑定 symbol 或 semantic node 后，右侧至少显示：

- Meaning；
- Role / object kind；
- Scope / layer；
- Indices；
- Dimension/domain；
- Definition；
- Direct upstream；
- Direct downstream；
- Where defined；
- Where used；
- relevant constraint/variant note（若存在）。

CAT reference 必须验证五个 case：

1. `β^U_{gh}`：definition = `ν+a_g+v^U_{gh}`；
2. `γ_g`：derived from `γ_0 π_g`；
3. `p_{U,g}`：fixed computational truncation, not estimand；
4. `a_g`：group response parameter with sum-to-zero constraint；
5. `Σ_W`：derived residual correlation with unit diagonal / finite working set scope。

## 7. Direct Symbol Trace

本 Goal 只实现 **direct** upstream/downstream trace：

- selected symbol 高亮；
- direct parents/children 高亮；
- direct relation edges 高亮；
- unrelated nodes 可轻微降对比但保持可见；
- clear trace 可恢复；
- inspector 与 canvas shared selection 同步。

recursive trace、layer filter、Architecture Outline 进入 G03。

交互不得依赖遍历所有 rich text 字符串。使用 G01 graph index。

## 8. UI 约束

- 不大改 app shell；
- 不先做视觉概念评审；
- 在现有 Canvas/Inspector 上做最小闭环；
- 新 semantic node 如果不需要 rich text，不应复用重量级完整 BlockNode；优先轻量 renderer；
- 动效可有 150–250ms 的 selection/path highlight，但不做持续动画；
- 支持 `prefers-reduced-motion`。

## 9. 性能要求

本任务开始修复**触及到的 hot path**中的 broad Zustand subscriptions：

- 新 Symbol Inspector / trace controls 必须用 selector；
- Canvas 如果因 trace state 新增全量 subscription，视为失败；
- 对 CAT fixture 的 symbol click 不应触发所有 heavy rich-text editors 重建。

增加可复现 render/update instrumentation 或测试，至少证明 trace 查询来自 graph index，而不是 O(N×text-length) 搜索。

## 10. 测试

至少新增：

- CAT-TRACE fixture schema golden test；
- five trace case assertions；
- symbol ID survives display rename；
- formula binding round-trip；
- legacy Symbol block regression；
- direct trace selection/clear；
- unresolved formula token safe behavior；
- canonical notation regression（尤其 `i,g,h` 与 `γ_g=γ_0π_g`）。

运行全量历史 regression/build。

## 11. 退出门槛

1. CAT fixture 完整加载；
2. 五个 canonical symbol case 可点击并得到正确 inspector；
3. direct upstream/downstream trace 正确；
4. formula binding 可保存/恢复；
5. 旧 map/Symbol workflow 不坏；
6. 没有明显 broad-render regression；
7. 版本 `2.0.0-alpha.2`；
8. commit `v2.0.0-alpha.2` 并 push。

## 12. 停止条件

若为了 Symbol Trace 必须把所有公式自动 parse 或必须把每个 symbol 实例化成重型 rich-text block，停止并重构设计，不得用明显不可扩展方案硬过 gate。

## 13. Result

写 `results/asteria_v2_g02_result.md`，末尾：

```text
G03_READY = YES/NO
```

记录 fixture、five cases、测试、render/performance 证据、commit/push。