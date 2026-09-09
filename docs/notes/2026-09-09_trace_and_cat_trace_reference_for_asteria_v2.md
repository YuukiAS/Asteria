# Original TRACE 与 CAT-TRACE Frozen V2：Asteria 2.0 Canonical Reference

更新日期：2026-09-09
用途：Asteria 2.0 首批 model variants、Architecture fixture、Semantic Diff、Lineage/Evidence seed 的模型语义入口。

本文件只摘取 Asteria 需要表达和测试的模型结构，不替代 TRACE 原论文或 CAT-TRACE canonical PDF。若这里与源材料冲突，源材料优先。

## 0. 两个首批 canonical variants

Asteria 2.0 第一批只把以下两个模型作为用户可见 canonical variants：

1. **Original TRACE**：以 Stolf & Dunson 的 *Infinite joint species distribution models* 及 supplementary proofs 为准。
2. **CAT-TRACE Frozen V2**：以 `CAT_TRACE_CANONICAL_NOTATION_AND_ARCHITECTURE_20260909` 为准。

不要把历史 grouped working draft 或 2026-09-08 旧记号作为第三个正式 variant。以后若有实际产品价值，再新增 semantic variant。

## 1. Original TRACE 最小架构

对 sample `i` 和 working species/feature column `j`：

```latex
y_{ij}=1\{z_{ij}>0\},\qquad
z_{ij}=\alpha_j+x_i^\top\beta_j+\varepsilon_{ij}.
```

在 unit marginal residual variance 下：

```latex
P(y_{ij}=1\mid x_i,\alpha_j,\beta_j)
=\Phi(\alpha_j+x_i^\top\beta_j).
```

开放维度由有限截断 `p` 表示并取 `p -> infinity`。TRACE 截距校准：

```latex
\alpha_j\mid\gamma,p\sim N\{\mu_p(\gamma),\tau_p^2\},
```

```latex
\tau_p=\sqrt{2\log p},\qquad
\mu_p(\gamma)=\sqrt{1+\tau_p^2}\,\Phi^{-1}\!\left(\frac{\gamma}{\gamma+p}\right).
```

带 covariates 的 species-response superpopulation 可表达为：

```latex
\beta_j\sim N_q(\nu,\Psi).
```

TRACE 的核心保留语义：

- response list 可随 truncation 增长；
- sample-level expected richness 在校准下保持有限；
- `beta_j` 保持 marginal probit environmental-response interpretation；
- dependence 改变 joint occurrence / richness variance，但在 unit marginal variance 下不改变上述 marginal probit mean。

Original TRACE fixture 只放原论文真实存在的模型结构。不要加入：

- finite catalogue `mathcal K`；
- deterministic catalogue matching `c(f)`；
- grouped open-tail `g, a_g, pi_g`；
- catalogue/open-tail discovery decomposition；
- 历史 CAT-TRACE working draft 的 `nu_g`。

## 2. CAT-TRACE Frozen V2 数据与身份结构

原始特征集合：

```latex
\mathcal F_n.
```

原始二元响应：

```latex
Y^{\mathrm{raw}}=(y^{\mathrm{raw}}_{if}).
```

有限分析用物种目录：

```latex
\mathcal K=\{1,\ldots,K\},\qquad K=|\mathcal K|.
```

前 `n` 个样本中已检测到的目录身份集合：

```latex
\mathcal K_n\subseteq\mathcal K.
```

共同 biological group space：

```latex
\mathcal G=\{1,\ldots,G\}.
```

确定性映射：

```latex
c(f)\in\mathcal K\cup\{\varnothing\},\qquad
g(f)\in\mathcal G.
```

其中 `c(f)=j` 表示原始 feature 映射到 catalogue identity `j`；`c(f)=empty` 进入 catalogue-external open tail。

多个 raw features 映射到同一 catalogue identity 时使用 OR aggregation。

## 3. CAT-TRACE Frozen V2 开放尾部记号

对 group `g`：

- `p_g`：有限计算截断；
- `p_g^*`：前 `n` 个样本中非空 open-tail 列数；
- `p_g-p_g^*`：匿名全零槽位数；
- `h=1,...,p_g`：group 内匿名 open-tail column index。

必须保护：

- `p_g` 不是 estimand；
- `p_g` 不是“真实未知物种数”；
- anonymous zero slots 是模型/似然信息，不得因为 UI 或实现简化而被解释成无用空列。

不要再使用 2026-09-08 visual drafts 中的 `p_{U,g}`、`K^obs_{U,g}`、`n_{0g}` 作为当前 canonical display notation；代码内部可以有 `p_tail[g]`, `p_observed[g]`, `n_zero[g]`，但 UI 的数学符号服从 Frozen V2。

## 4. CAT-TRACE Frozen V2 latent occurrence

Catalogue：

```latex
y^{\mathcal K}_{ij}=1\{z^{\mathcal K}_{ij}>0\},
```

```latex
z^{\mathcal K}_{ij}
=\alpha^{\mathcal K}_j+x_i^\top\beta^{\mathcal K}_j+\varepsilon^{\mathcal K}_{ij}.
```

Open tail：

```latex
y^{\mathcal U}_{igh}=1\{z^{\mathcal U}_{igh}>0\},
```

```latex
z^{\mathcal U}_{igh}
=\alpha^{\mathcal U}_{gh}+x_i^\top\beta^{\mathcal U}_{gh}+\varepsilon^{\mathcal U}_{igh}.
```

Canonical response index order 是 `i,g,h`。

## 5. Shared environmental-response hierarchy

总体环境响应：

```latex
\nu\in\mathbb R^q.
```

`nu` 是 environment-response vector，不是 global intercept。

分组偏移：

```latex
a_g\in\mathbb R^q,\qquad \sum_{g=1}^G a_g=0.
```

Open-tail slope：

```latex
\beta^{\mathcal U}_{gh}
=\nu+a_g+v^{\mathcal U}_{gh}.
```

Catalogue slope：

```latex
\beta^{\mathcal K}_j
=\nu+a_{g_j}+\Gamma^\top t_j+b_j^{\mathrm{phy}}+v_j^{\mathcal K},
```

其中 trait / phylogeny module 只在相应输入真实存在且对齐时启用。

Shared species-response heterogeneity：

```latex
v_j^{\mathcal K},v_{gh}^{\mathcal U}\sim N_q(0,\Psi),\qquad
\Psi=\operatorname{diag}(\psi_1^2,\ldots,\psi_q^2).
```

## 6. Intercepts 与 open-tail calibration

Catalogue intercept 是有限层级，不使用 TRACE extreme-value calibration：

```latex
\alpha_j^{\mathcal K}\mid\mu_\alpha,\sigma_\alpha
\sim N(\mu_\alpha,\sigma_\alpha^2).
```

Open-tail intercept：

```latex
\alpha_{gh}^{\mathcal U}\mid\gamma_g,p_g
\sim N\{\mu_{p_g}(\gamma_g),\tau_{p_g}^2\}.
```

Composition：

```latex
\gamma_g=\gamma_0\pi_g,\qquad
\sum_{g=1}^G\pi_g=1.
```

语义：

- `gamma_0` = total open-tail intensity；
- `pi_g` = group composition weight at the centered baseline；
- `gamma_g` = deterministic derived group intensity；
- 三者都不是 intercept / group slope effect。

## 7. Relatedness 与 residual dependence

需要区分：

- `C_tax`：taxonomy-derived relatedness / phylogeny proxy；
- `C_phy`：真正带 branch lengths 的 phylogenetic correlation。

只有真实 `C_phy` 才配套核心 `b_j^phy` 解释。South-West Australia plants 的当前可复现对象是 `C_tax`，不能在 UI seed 中称为 branch-length phylogeny。

Residual dependence 只在 finite working set：

```latex
\mathcal W.
```

定义：

```latex
\Omega_{\mathcal W}
=\Lambda_{\mathcal W}\Lambda_{\mathcal W}^\top+I_{|\mathcal W|},
```

```latex
\Sigma_{\mathcal W}
=D_{\mathcal W}^{-1/2}\Omega_{\mathcal W}D_{\mathcal W}^{-1/2},
\qquad
D_{\mathcal W}=\operatorname{diag}(\Omega_{\mathcal W}).
```

从而：

```latex
\operatorname{diag}(\Sigma_{\mathcal W})=1.
```

Residual factor index 使用 `d=1,...,H`；`H` 是 factor truncation / computational cap。

匿名全零 open-tail slots 不进入 species-specific residual network。

## 8. CAT-TRACE targets

至少支持：

- group-specific open-tail richness；
- total open-tail richness；
- catalogue discovery from `mathcal K \ mathcal K_n`；
- group-specific open-tail discovery；
- total future discovery；
- joint occurrence / residual-dependence diagnostics。

未来 marked-discovery distributional theorem 仍是 open item，Evidence view 不得把它显示成已证明结论。

## 9. Initial semantic diff：Original TRACE → CAT-TRACE Frozen V2

### Added

- finite catalogue `mathcal K`, `K`, `mathcal K_n`；
- matching `c(f)`；
- biological groups `g(f)` / `a_g`；
- grouped open-tail truncations `p_g`, `p_g^*`；
- total + composition intensity `gamma_0, pi_g, gamma_g`；
- finite catalogue intercept hierarchy；
- catalogue slope hierarchy；
- catalogue/open-tail discovery decomposition；
- optional trait / relatedness / phylogeny input modules；
- explicit finite-working-set residual factor copula architecture。

### Modified

Original TRACE generic species slope superpopulation：

```latex
\beta_j\sim N_q(\nu,\Psi)
```

CAT-TRACE open-tail slope decomposition：

```latex
\beta^{\mathcal U}_{gh}=\nu+a_g+v^{\mathcal U}_{gh}.
```

### Preserved

- marginal probit interpretation；
- TRACE extreme-value calibration on the open tail；
- finite expected open-tail richness under the calibrated limit；
- residual dependence does not alter marginal occurrence mean when marginal residual variances remain one。

### Do not claim

- CAT-TRACE = TRACE + HMSC；
- original TRACE already had `nu_g` grouped means；
- `p_g` is unknown species count；
- taxonomy proxy = branch-length phylogeny；
- residual association = causal species interaction。

## 10. Architecture acceptance traces

至少验证：

### `beta^U_gh`

- Role: parameter；
- Dimension: `R^q`；
- Definition: `nu+a_g+v^U_gh`；
- Upstream: `nu`, `a_g`, `v^U_gh`；
- Downstream: latent mean, occurrence probability, richness/prediction objects。

### `gamma_g`

- Role: derived quantity；
- Definition: `gamma_0*pi_g`；
- no independent prior；
- Downstream: open-tail intercept calibration and group richness。

### `p_g`

- Role: fixed computational setting；
- not estimand；
- not true unknown species count；
- linked to `p_g^*`, zero-slot multiplicity, calibration, finite-p diagnostics。

### `a_g`

- Role: group-specific environment-response deviation；
- Constraint: sum-to-zero；
- shared by catalogue and open-tail slope hierarchy。

### `Sigma_W`

- Role: derived residual correlation；
- finite working set scope；
- unit diagonal；
- affects joint dependence, not marginal probit mean。

## 11. Lineage seed 的事实边界

Lineage 可以使用：

- TRACE / Infinite JSDM — Stolf & Dunson；
- HMSC — Ovaskainen / HMSC framework；
- bigMVP / high-dimensional multivariate binary inference — Chakraborty, Ou & Dunson；
- Sparse Bayesian Infinite Factor Models / MGP — Bhattacharya & Dunson；
- CAT-TRACE — current project method。

概念图中的作者名或 paper labels 若不正确，不得复制进 seed data。Lineage relation 要表达 `extends`, `borrows interpretation from`, `computationally inspired by`, `uses shrinkage idea from` 等真实关系，而不是简单 citation proximity。

## 12. Evidence seed 的事实边界

Evidence view 第一批以 claim-centered graph 展示结构能力。Seed 状态必须真实：

- 已有理论/证明只按当前证据状态标记；
- simulation 未完成时标 `planned` / `pending`，不能因为概念图画出来就标 `passed`；
- real-data result 未跑完时不能标成 empirical support；
- implementation equivalence test 只有测试真实存在并通过后才标 `validated`；
- future marked-discovery distributional theorem 保持 pending。

Asteria 的 Evidence view 用于暴露证据闭环，不用于自动制造闭环。