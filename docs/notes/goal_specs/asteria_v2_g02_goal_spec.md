---
id: asteria_v2_g02
title: Build original TRACE and CAT-TRACE reference workspaces with Symbol Trace
created_at: 2026-09-09
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Goal G02 — Original TRACE + CAT-TRACE Frozen V2 + Canonical Symbols + Symbol Trace

## 1. 前置条件

只有 `results/asteria_v2_g01_result.md` 中 `G02_READY = YES` 才执行。

目标版本：`2.0.0-alpha.2`。

本 Goal 第一次把 2.0 semantic kernel 变成用户可感知的研究工具：点击一个统计符号，可以知道它是什么、如何定义、依赖什么、被哪里使用，并能在 Original TRACE 与 CAT-TRACE 两个正式 model variants 中保持正确语义。

## 2. 必须先读

1. `AGENTS.md`
2. `prompts/AGENT_RULES.md`
3. `ROADMAP.md`
4. `VERSIONING.md`
5. `docs/notes/2026-09-09_asteria_v2_web_delivery_plan.md`
6. `docs/notes/2026-09-09_trace_and_cat_trace_reference_for_asteria_v2.md`
7. `docs/notes/2026-09-08_asteria_v2_current_implementation_audit.md`
8. `results/asteria_v2_g01_result.md`
9. 当前 Symbol / equation / Inspector / Canvas 实现。

若 Asteria repo 外还提供 Original TRACE paper 或 `CAT_TRACE_CANONICAL_NOTATION_AND_ARCHITECTURE_20260909.pdf`，可只读核对；不要因此覆盖 repo reference note 之外的项目文件，也不要让视觉概念图成为模型 source of truth。

## 3. 两个 canonical fixtures

创建版本化 reference fixtures：

### 3.1 Original TRACE

至少覆盖：

- `y_ij`, `z_ij`, `alpha_j`, `beta_j`, `x_i`；
- truncation `p`；
- `gamma`, `mu_p(gamma)`, `tau_p`；
- `nu`, `Psi`；
- marginal occurrence probability；
- richness / discovery targets；
- 原论文真实存在且 Asteria 需要表达的 dependence/inference semantics。

禁止加入 finite catalogue、`c(f)`、grouped tail、`a_g`, `pi_g` 或历史 `nu_g`。

### 3.2 CAT-TRACE Frozen V2

至少覆盖：

- `Y_raw`, `x_i`, `c(f)`, `g(f)`；
- `mathcal K`, `K=|mathcal K|`, `mathcal K_n`, `mathcal U`, `mathcal G`, `mathcal W`；
- `y^K_ij`, `y^U_igh`；
- `z^K_ij`, `z^U_igh`；
- `alpha^K_j`, `alpha^U_gh`；
- `beta^K_j`, `beta^U_gh`；
- `nu`, `a_g`, `Gamma`, `t_j`, `b^phy_j`, `v^K_j`, `v^U_gh`, `Psi`；
- `gamma_0`, `pi_g`, `gamma_g`；
- `p_g`, `p_g^*`, zero-slot multiplicity `p_g-p_g^*`；
- `Lambda_W`, `Omega_W`, `Sigma_W`；
- factor index `d=1,...,H`；
- richness / catalogue discovery / open-tail discovery targets。

必须保持：

- open-tail response index order = `i,g,h`；
- `beta^U_gh = nu + a_g + v^U_gh`；
- `gamma_g = gamma_0*pi_g` 为 derived；
- `p_g` 是 fixed computational truncation，not estimand；
- `nu` 是 environment-response vector，不是 global intercept；
- `Sigma_W` 只在 finite working set；
- taxonomy proxy 与 branch-length phylogeny 不混写。

## 4. Project-level canonical symbol registry

实现 project-level symbol registry，而不是继续把所有符号锁在某一个 Symbol block 私有列表中。

第一版 symbol 至少支持：

- stable ID；
- model/variant scope；
- LaTeX；
- canonical name；
- meaning；
- object kind / role；
- layer；
- observed status；
- definition mode；
- indices；
- dimension/domain；
- definition reference。

同样显示成 `beta` 的符号在不同 model scope 中可以是不同 entity；同一 model scope 中的同一 canonical symbol 不应因多处显示而复制定义。

旧 Symbol block 继续可用，并可作为 canonical registry 的投影/兼容展示；不能删除原 workflow。

## 5. Formula-aware explicit binding

第一版不要造完整 LaTeX parser。实现最小显式绑定：

- formula/rich-text equation 保存 token/fragment → symbol ID binding；
- 用户从当前 model scope 已存在 canonical symbols 选择；
- display LaTeX 改名不改变 internal ID；
- unresolved token 不自动猜；
- import/export 保存 binding。

如果 TipTap inline-token extension 风险过高，可先完整支持 block/display equation，再扩展 inline；结果中必须写清边界。

## 6. Symbol Inspector

点击已绑定 symbol 或 semantic node 后，右侧至少显示：

- Meaning；
- Role / kind；
- Model + variant scope；
- Layer；
- Indices；
- Dimension/domain；
- Definition；
- Direct upstream；
- Direct downstream；
- Where defined；
- Where used；
- relevant constraint；
- variant note。

CAT-TRACE regression cases：

1. `beta^U_gh`：`nu+a_g+v^U_gh`；
2. `gamma_g`：derived from `gamma_0*pi_g`，no independent prior；
3. `p_g`：fixed computational setting, not estimand, not true unknown species count；
4. `a_g`：group response deviation + sum-to-zero；
5. `Sigma_W`：derived residual correlation + unit diagonal + finite working set。

Original TRACE regression cases至少验证：

- `beta_j` 是 species environmental-response parameter；
- `p` 是 truncation；
- `gamma` 进入 TRACE tail calibration；
- original TRACE 不含 catalogue/grouped-tail entities。

## 7. Direct Symbol Trace

本 Goal 只实现 direct upstream/downstream trace：

- selected symbol 高亮；
- direct parents/children 高亮；
- direct relation edges 高亮；
- unrelated nodes 轻微降对比但仍可见；
- clear trace；
- Inspector 与 canvas shared selection 同步。

recursive trace、layer filter、Architecture Outline 进入 G03。

交互不得依赖扫描所有 rich text；使用 G01 graph index。

## 8. UI 与 accepted design 的关系

G02 只建立正确交互闭环，不在这里完成最终视觉重构。

若 `docs/design/accepted-concepts/` 已由 autonomous preflight 写入，可参考：

- A/B：Architecture shell；
- C：Symbol Trace state。

但不能复制图片里的错误数学内容或 citation。

Micro semantic node 如果不需要 rich text，不应复用重量级完整 BlockNode；优先轻量 renderer。

动效仅允许短时 selection/path emphasis，并支持 `prefers-reduced-motion`。

## 9. 性能要求

- 新 Symbol Inspector / trace controls 使用 selector；
- 不因新增 trace state 让 Canvas broad-subscribe 整个 store；
- symbol click 不触发全部 heavy editors 重建；
- trace query 来自 graph index，而不是 O(N × text-length) 搜索。

## 10. 测试

至少新增：

- Original TRACE fixture golden；
- CAT-TRACE Frozen V2 fixture golden；
- model-scoped symbol identity；
- CAT five trace cases；
- Original TRACE absence/presence assertions；
- symbol ID survives display rename；
- formula binding round-trip；
- legacy Symbol block regression；
- direct trace selection/clear；
- unresolved token safe behavior；
- canonical notation regression（`p_g`, `p_g^*`, `i,g,h`, `gamma_g=gamma_0*pi_g`）。

运行全量历史 regression/build。

## 11. 退出门槛

1. Original TRACE + CAT-TRACE 两个 fixtures 都可加载；
2. CAT five symbol cases inspector/trace 正确；
3. Original TRACE 未被污染成 CAT-TRACE；
4. direct trace 正确；
5. formula binding 可保存/恢复；
6. 旧 map/Symbol workflow 不坏；
7. 没有明显 broad-render regression；
8. 版本 `2.0.0-alpha.2`；
9. commit `v2.0.0-alpha.2` 并 push。

## 12. 停止条件

若为了 Symbol Trace 必须把所有公式自动 parse、必须把每个 symbol 实例化成重型 rich-text block，或无法区分 Original TRACE 与 CAT-TRACE model scope，停止并修 schema，不得硬过 gate。

## 13. Result

写 `results/asteria_v2_g02_result.md`，末尾：

```text
G03_READY = YES/NO
```

记录两个 fixture、trace cases、测试、render/performance evidence、commit/push。