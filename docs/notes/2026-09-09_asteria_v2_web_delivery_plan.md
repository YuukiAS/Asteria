# Asteria 2.0 Web 交付详细计划

更新日期：2026-09-09
状态：当前 Web 2.0 执行计划。若与 2026-09-08 的 Asteria 2.0 规划发生冲突，以本文件、`ROADMAP.md`、`VERSIONING.md` 和最新 active task 为准。

## 0. 结论

Asteria 2.0 现在不再处于“继续探索产品方向”的阶段。A/B/C/D/E1/E2 六张概念图已经覆盖了 2.0 首个完整 Web 产品需要的关键状态：

- A：Light Architecture；
- B：Quiet Celestial Dark Architecture；
- C：Symbol Trace；
- D：TRACE → CAT-TRACE semantic variant diff；
- E1：Lineage；
- E2：Evidence。

后续主线从“概念生成”切换到“实现 + 浏览器验收”。G/H 细节图只有在真实实现出现明确布局问题时才补；桌面端、Tauri 与 Figma 均不阻塞 Web 2.0。

2.0 的最终 Web 验收对象不是一张漂亮的 Architecture canvas，而是一个共享 canonical graph 的三视图研究工具：

```text
Architecture  <->  Lineage  <->  Evidence
       \             |             /
        \------ shared entities ---/

+ semantic variants
+ symbol trace
+ readable export
+ structural validation
+ legacy 1.x compatibility
```

## 1. 当前产品边界

### 1.1 2.0 必须完成

1. 1.x 冻结与无损迁移。
2. normalized semantic graph：entity / symbol / typed relation / variant / view projection。
3. Architecture：symbol inspector、direct/recursive trace、layer focus、outline。
4. 两个首批模型变体：
   - original TRACE（以原论文为准）；
   - CAT-TRACE Frozen V2（以 2026-09-09 canonical architecture 为准）。
5. Semantic Diff：同一 canvas 稳定位置下展示 added / removed / modified / preserved semantics。
6. Lineage：方法级谱系，不铺普通微观符号。
7. Evidence：claim-centered evidence graph，不做项目管理 dashboard。
8. Markdown / schema-v2 JSON export。
9. 结构校核与 warning。
10. 性能、浏览器 QA、视觉收敛。

### 1.2 2.0 不需要完成

- AI 自动从论文生成完整架构；
- theorem prover / symbolic algebra；
- 自动判断因果识别正确；
- 完整代码绑定生态；
- Tauri / Electron 桌面发行；
- 移动端完整编辑器；
- Figma 作为依赖；
- 为每种统计范式建立独立前端产品。

## 2. Accepted Concept Package

Codex 启动 active autonomous task 时，用户会把六张图片作为任务附件或本地输入提供。Codex 首先把原始图片按字节复制到：

```text
docs/design/accepted-concepts/
  A_light_architecture.png
  B_dark_architecture.png
  C_symbol_trace.png
  D_variant_diff.png
  E1_lineage.png
  E2_evidence.png
  README.md
```

`README.md` 必须记录每张图的职责、强约束与非约束部分。

关键规则：

- 六张图片是 **visual / interaction specification**，不是数学 source of truth。
- 图片内任何作者名、公式、状态、数值和 citation 若与 canonical model/reference 冲突，必须以文本 reference 为准。
- B 是暗色主 shell 视觉母版；A 是 light projection；C 是 trace interaction；D 是 semantic diff；E1/E2 分别是 Lineage / Evidence 的信息架构参考。
- 当前已有 `public/backgrounds/asteria-celestial-map.png`。实现应优先复用或淡化，不依据 B 重新制作更强烈星空背景。
- 概念图不作为 raster UI 直接嵌入产品。

## 3. 两个 canonical model variants

首批只做两个用户可见 canonical variants，避免在产品刚重构时把历史工作稿也变成正式变体。

### Variant A — Original TRACE

来源：Stolf & Dunson, *Infinite joint species distribution models* 及其 supplementary proof。

最小结构：

```text
y_ij = 1{z_ij > 0}
z_ij = alpha_j + x_i^T beta_j + epsilon_ij
alpha_j ~ N(mu_p(gamma), tau_p^2)
beta_j ~ N_q(nu, Psi)
```

并保留：

- open-ended species dimension / finite truncation `p`；
- TRACE tail calibration；
- marginal probit interpretation；
- richness/discovery targets；
- 原论文中真实存在的 dependence/inference semantics。

不要把历史 CAT-TRACE working draft 的 `nu_g`、catalogue 或 grouped-tail 结构反写成 original TRACE。

### Variant B — CAT-TRACE Frozen V2

来源：`CAT_TRACE_CANONICAL_NOTATION_AND_ARCHITECTURE_20260909`。

关键语义至少包括：

- finite catalogue `mathcal K`, `K=|mathcal K|`, observed catalogue subset `mathcal K_n`；
- deterministic matching `c(f)` 与共同 biological group `g(f)`；
- open-tail truncation `p_g`、non-empty open-tail count `p_g^*`、zero slots `p_g-p_g^*`；
- `beta^U_gh = nu + a_g + v^U_gh`；
- catalogue slope `beta^K_j = nu + a_{g_j} + Gamma^T t_j + b^phy_j + v^K_j`（模块存在时）；
- `gamma_g = gamma_0 pi_g`；
- open-tail intercept TRACE calibration；
- finite working set `mathcal W` 上的 normalized factor copula；
- catalogue/open-tail discovery decomposition；
- `p_g` 不是 estimand，也不是真实未知物种数。

首个 semantic diff 只比较 Original TRACE 与 CAT-TRACE Frozen V2。Grouped open-tail 可以存在为内部结构/未来 variant，但不作为第一批用户可见 canonical variant。

## 4. 执行阶段

### G00 — 1.0 Freeze & Baseline

只冻结 1.x，不加 2.0 语义功能。建立：

- 兼容 fixtures；
- save/restore/import/export regression；
- current performance baseline；
- `1.0.0` version record。

### G01 — 2.0 Semantic Kernel

建立 canonical domain graph 与 v1→v2 migration：

- normalized records；
- graph indexes；
- entity / symbol / relation / view / variant schema；
- legacy payload / provenance；
- persistence adapter boundary。

### G02 — TRACE + CAT-TRACE Reference / Symbol Trace

先建立两个 model fixtures，再实现：

- project-level symbol registry；
- formula explicit binding；
- Symbol Inspector；
- direct trace。

CAT-TRACE 的 regression symbols 采用 2026-09-09 记号：`p_g`, `p_g^*`, `gamma_g`, `beta^U_gh`, `Sigma_W` 等。

### G03 — Typed Relations / Layers / Recursive Trace / Outline

实现：

- typed relation semantics；
- recursive trace；
- layer filter/focus；
- Architecture Outline；
- shared selection；
- 轻量 trace motion。

### G04 — Export / Validation / Two-Variant Semantic Diff

实现：

- readable architecture Markdown；
- schema-v2 JSON；
- mechanical structural warnings；
- Original TRACE ↔ CAT-TRACE semantic diff；
- frequentist / causal 小 fixture，防止 schema 暗中 Bayesian-only。

### G05 — Architecture Performance & Visual Convergence

G05 是内部 Architecture RC gate，不再停下来要求用户先验收。

必须：

- selector/render hot-path refactor；
- stress fixture；
- trace/layer/diff interaction polish；
- 按 A/B/C/D accepted concepts 做 browser visual QA；
- 保持 dark celestial 纹理极弱；
- light/dark 两套 theme 可以共享布局与 design tokens。

G05 通过后继续 G06。

### G06 — Multi-view + Final Web RC

把 Architecture / Lineage / Evidence 纳入同一 canonical project：

- independent view layouts；
- shared entities / definitions；
- cross-view links；
- Lineage method-level entity + relations；
- Evidence claim-centered graph + closure warnings；
- Story 仍是输出层，不成为第四个 graph；
- 按 E1/E2 做 visual QA；
- 最终版本建议 `2.0.0-rc.2`。

G06 结束才进入用户最终验收。

## 5. Product Design 使用规则

A/B/C/D/E1/E2 已经足够作为正式设计输入。后续 Codex 若拥有 Build Web Apps / frontend design skill，应读取并用于：

- 从 accepted concepts 提取 design tokens；
- implementation inventory；
- screenshot-to-concept fidelity QA；
- responsive / inspector / toolbar polish。

但不得重新发散一个全新视觉方向。

Figma 默认不启用。只有满足以下条件才使用：

1. 已经有真实浏览器实现；
2. 存在具体的 component/token 不一致问题；
3. Figma 能降低实现歧义，而不是只是再画一套 mockup。

没有 Figma 不构成任何 gate blocker。

## 6. 性能边界

继续采用“semantic graph ≠ React Flow 全量节点”的原则。

至少维持：

- 约 2,000 semantic entities / 5,000 relations 的图索引 fixture；
- 单 view 约 200–300 visible nodes / 500–800 edges；
- trace 使用 adjacency index；
- micro semantic node 不默认挂 TipTap；
- layout drag 不复制完整 semantic project；
- hot path 不 broad-subscribe 整个 Zustand store；
- motion 只使用 transform/opacity/SVG path emphasis；
- `prefers-reduced-motion` 有效。

## 7. 自动化与停止条件

用户不负责：

- schema 字段命名；
- store 拆分；
- selector 设计；
- CSS 微调；
- 测试 fixture 组织；
- icon placement；
- motion duration；
- ordinary refactor；
- 每个阶段是否继续。

每个 gate 通过后 Codex自动 commit + push，并继续下一阶段。

只在以下情况停止：

- 会覆盖 unrelated dirty work；
- 需要不可逆迁移；
- 需要新 credential / 付费服务 / 未授权 dependency download；
- correctness / compatibility / performance gate 在合理修复后仍失败；
- 必须改变 fixed public URL / production infra；
- G06 完成，等待最终用户验收。

## 8. 最终验收时用户需要看什么

用户最终只需要集中看一次：

1. Architecture：TRACE 与 CAT-TRACE 两个模型是否读得懂；
2. 点击 `beta^U_gh`, `gamma_g`, `p_g`, `Sigma_W` 是否能自然追踪；
3. semantic diff 是否真正讲清楚两种模型差异；
4. Lineage 是否比普通 citation graph 更有用；
5. Evidence 是否能暴露 claim 的证据闭环/缺口；
6. dark/light 视觉是否达到 A–E2 的设计水平；
7. 常规编辑、保存、恢复、导出、旧 map 导入是否仍可靠；
8. 日常交互是否无明显卡顿。

通过后再决定是否发布 `2.0.0` stable，以及是否进入 Tauri desktop。