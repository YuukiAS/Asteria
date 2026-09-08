# CAT-TRACE 作为 Asteria 2.0 的 canonical reference workspace

日期：2026-09-08
来源：用户提供的 `CAT_TRACE_CANONICAL_NOTATION_AND_ARCHITECTURE_20260908`。本文只抽取 Asteria 2.0 schema/interaction 验收需要的 canonical 结构，不替代 CAT-TRACE 项目中的正式模型文档。

## 0. 为什么用 CAT-TRACE 做 reference

CAT-TRACE 不是简单的“几个参数加箭头”。它同时包含：

- 原始特征与分析对象之间的映射；
- 身份状态（catalogue / open tail）与生物分组两个正交维度；
- 观测二元变量与潜高斯变量；
- 共享环境响应、组偏移、物种特异偏移；
- 有限 catalogue 截距与 TRACE-calibrated open-tail 截距；
- 组合强度 `γ_g = γ_0 π_g`；
- 有限工作集上的 normalized factor-copula；
- richess / discovery prediction targets；
- 计算截断与真实生态量的语义区别；
- TRACE → grouped → catalogue-aware 的模型变体。

如果 Asteria 2.0 能把这套结构清楚表达、追踪和校核，schema 才有资格称为“通用统计模型架构”，而不是又一套 Bayesian mind map。

## 1. Reference workspace 的 layer anatomy

### Layer 1 — Scientific targets

至少包含：

- group-specific open-tail richness；
- total open-tail richness；
- catalogue discovery；
- open-tail discovery；
- total future discovery；
- joint occurrence / residual dependence diagnostics。

这些 target 不应与 parameter 卡混成同一级别。

### Layer 2 — Observed inputs

核心对象：

- `Y_raw = (y^raw_if)`：原始特征/OTU detection matrix；
- `x_i ∈ R^q`：sample covariates；
- finite analysis catalogue `K = {1,...,K_cat}`（若存在）；
- coarse biological group space `G = {1,...,G}`；
- optional catalogue traits `t_j`；
- optional phylogenetic positions for `P ⊆ K`。

Asteria 必须能显示：catalogue / trait / phylogeny 是输入数据结构，不自动等同于 informative prior。

### Layer 3 — Measurement / preprocessing

- deterministic identity mapping `c(f) ∈ K ∪ {∅}`；
- group mapping `g(f) ∈ G`；
- multiple raw features → same catalogue identity 时做 OR aggregation；
- open-tail observed feature count `K^obs_{U,g}`；
- computational truncation `p_{U,g}`；
- implicit zero-slot multiplicity `n_{0g}`。

这里必须暴露一个关键语义：`p_{U,g}` 是计算截断，不是真实未知物种总数。

### Layer 4 — Latent occurrence model

Catalogue：

```latex
y^{\mathcal K}_{ij}=1\{z^{\mathcal K}_{ij}>0\},\qquad
z^{\mathcal K}_{ij}=\alpha^{\mathcal K}_j+x_i^\top\beta^{\mathcal K}_j+\varepsilon^{\mathcal K}_{ij}.
```

Open tail：

```latex
y^{\mathcal U}_{igh}=1\{z^{\mathcal U}_{igh}>0\},\qquad
z^{\mathcal U}_{igh}=\alpha^{\mathcal U}_{gh}+x_i^\top\beta^{\mathcal U}_{gh}+\varepsilon^{\mathcal U}_{igh}.
```

Canonical index order 是 `i,g,h`；残差因子索引另用 `d`，不能复用 `h`。

### Layer 5 — Shared environmental response hierarchy

总体响应：

```latex
\nu\in\mathbb R^q.
```

组偏移：

```latex
a_g\in\mathbb R^q,\qquad \sum_{g=1}^G a_g=0.
```

Catalogue slope：

```latex
\beta^{\mathcal K}_j
=
\nu+a_{g_j}+\Gamma^\top t_j+b_j^{\mathrm{phy}}+v_j^{\mathcal K}.
```

Open-tail slope：

```latex
\beta^{\mathcal U}_{gh}
=
\nu+a_g+v_{gh}^{\mathcal U}.
```

Shared species-response heterogeneity：

```latex
v_j^{\mathcal K},\ v_{gh}^{\mathcal U}\sim N_q(0,\Psi),\qquad
\Psi=\operatorname{diag}(\psi_1^2,\ldots,\psi_q^2).
```

Asteria 的 Symbol Trace 对 `β^U_{gh}` 必须显示上游 `ν`, `a_g`, `v^U_{gh}`，并显示下游 `x_i^T β^U_{gh}`、occurrence probability 与 richness theorem。

### Layer 6 — Intercepts and tail calibration

Finite catalogue intercept：

```latex
\alpha_j^{\mathcal K}\mid\mu_{\alpha,K},\sigma_{\alpha,K}
\sim N(\mu_{\alpha,K},\sigma_{\alpha,K}^2).
```

Open-tail intercept：

```latex
\alpha_{gh}^{\mathcal U}\mid\gamma_g,p_{\mathcal U,g}
\sim N\{\mu_{p_{\mathcal U,g}}(\gamma_g),\tau_{p_{\mathcal U,g}}^2\}.
```

with

```latex
\tau_p=\sqrt{2\log p},\qquad
\mu_p(\gamma)=\sqrt{1+\tau_p^2}\,\Phi^{-1}\!\left(\frac{\gamma}{\gamma+p}\right).
```

Composition：

```latex
\gamma_g=\gamma_0\pi_g,\qquad \sum_{g=1}^G\pi_g=1.
```

`γ_g` 是 deterministic derived quantity；Asteria validation 应能提示“已标为 derived，却又被赋一套独立 prior”这类结构冲突。

### Layer 7 — Residual dependence

只在 finite working set `W` 上：

```latex
\Omega_{\mathcal W}=\Lambda_{\mathcal W}\Lambda_{\mathcal W}^\top+I_{|\mathcal W|},
```

```latex
\Sigma_{\mathcal W}=D_{\mathcal W}^{-1/2}\Omega_{\mathcal W}D_{\mathcal W}^{-1/2},\qquad
D_{\mathcal W}=\operatorname{diag}(\Omega_{\mathcal W}).
```

并保持 `diag(Σ_W)=1`。匿名全零 open-tail slots 不进入 species-specific residual network。

### Layer 8 — Inference

第一版 architecture reference 只需要表达推断信息流，不必复制实现路线全部细节：

- marginal probit fit；
- shared hierarchy update / approximation；
- residual dependence second stage；
- truncation sensitivity；
- posterior/bootstrap uncertainty；
- future prediction。

生成关系、推断关系与因果关系必须是不同 relation type。

## 2. 必须建立的 canonical symbols

至少包含：

- `i`, `f`, `j`, `g`, `h`, `k`, `d`；
- `F_n`, `K`, `U`, `G`, `P`, `W`；
- `Y_raw`, `y^K_ij`, `y^U_igh`；
- `z^K_ij`, `z^U_igh`；
- `x_i`；
- `c(f)`, `g(f)`；
- `K^obs_{U,g}`, `p_{U,g}`, `n_{0g}`；
- `α^K_j`, `α^U_gh`；
- `β^K_j`, `β^U_gh`；
- `ν`, `a_g`, `Γ`, `t_j`, `b^phy_j`, `v^K_j`, `v^U_gh`, `Ψ`；
- `γ_0`, `π_g`, `γ_g`；
- `Λ_W`, `Ω_W`, `Σ_W`；
- group richness / discovery targets。

每个 symbol 有稳定 internal ID；display LaTeX 改名不得破坏 relation。

## 3. Reference trace cases

### Case A — `β^U_{gh}`

点击后：

- role = parameter；
- status = latent/estimated parameter；
- dimension = `R^q`；
- indices = `(g,h)`；
- definition = `ν+a_g+v^U_{gh}`；
- parents = `ν`, `a_g`, `v^U_{gh}`；
- child = open-tail latent mean / occurrence probability / richness theorem；
- constraint inherited through `a_g`: sum-to-zero；
- variant diff：旧 grouped draft 若使用 `ν_g`，当前 canonical 改成 `ν+a_g`。

### Case B — `γ_g`

- role = derived parameter/intensity；
- definition mode = deterministic；
- definition = `γ_0 π_g`；
- parent priors 属于 `γ_0` 与 `π`，不是 `γ_g` 独立 prior；
- downstream = open-tail intercept calibration + group richness。

### Case C — `p_{U,g}`

- role = fixed computational setting；
- meaning = truncation；
- not estimand；
- determined by truncation controller / sensitivity rule；
- downstream = `μ_p(γ_g)`, zero-slot bookkeeping, finite-p approximation；
- warning copy：不要解释成“组内真实未知物种上限”。

### Case D — `a_g`

- role = group-specific environmental response deviation；
- estimated from occurrence data through shared hierarchy；
- taxonomy group label itself is data; `a_g` is parameter；
- constraint = sum-to-zero；
- used by catalogue and open-tail slopes。

### Case E — `Σ_W`

- role = residual correlation matrix；
- derived from normalized factor covariance；
- unit diagonal constraint；
- changes joint distribution / variance, not the marginal probit mean；
- only applies to finite working set `W`。

## 4. Semantic relations to verify

Examples：

- `Y_raw --aggregated_into--> Y_K`；
- `c(f) --matched_to--> K identity`；
- `β^U_gh --depends_on--> ν`；
- `β^U_gh --depends_on--> a_g`；
- `γ_g --derived_from--> γ_0`；
- `γ_g --derived_from--> π_g`；
- `α^U_gh --parameterized_by--> γ_g`；
- `Σ_W --derived_from--> Λ_W`；
- marginal probit approximation `--approximates-->` marginal posterior object；
- future discovery target `--predicted_by-->` posterior predictive calculation。

Edge line appearance may be user-adjustable, but relation type is not encoded only in label/color。

## 5. Model variants reference

最小 variant chain：

### TRACE baseline

- no finite catalogue；
- one open-tail group / reduction case；
- TRACE-calibrated intercept；
- common slope superpopulation。

### Grouped open-tail

Added：

- `g`, `π_g`, `a_g`；
- group-specific `γ_g`；
- group richness target。

Modified：

- open-tail slope uses shared `ν+a_g` hierarchy。

### Catalogue-aware CAT-TRACE

Added：

- `K`, `c(f)`, `Y_K`；
- finite catalogue intercept hierarchy；
- catalogue slope with optional trait/phylogeny；
- catalogue discovery target；
- catalogue/open-tail discovery decomposition。

Preserved：

- marginal probit interpretation；
- open-tail TRACE calibration；
- residual dependence does not alter marginal occurrence mean when unit diagonal holds。

Asteria 2.0 的 semantic diff 至少要能自动报告这些 added/modified/preserved objects，而不是只显示三张近似相同的 canvas。

## 6. Reference workspace 的验收用途

它必须同时用于：

1. schema tests；
2. symbol trace tests；
3. typed relation tests；
4. layer filter tests；
5. architecture outline generation；
6. Markdown/JSON export golden fixture；
7. validation warning fixtures；
8. semantic variant diff tests；
9. stress fixture 的可扩展版本。

不要把 CAT-TRACE 的全部论文内容硬编码进产品。Fixture 只应包含足够验证通用架构能力的 canonical model anatomy。