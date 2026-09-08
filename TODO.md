# TODO — Model Architecture First

更新日期：2026-09-08  
状态：长期产品方向与后续设计任务。本文档不授权直接大规模改代码；实现前仍需拆成独立 task、完成 schema 评审与兼容性计划。

Asteria 当前已经具备可编辑 canvas、typed blocks、Symbol entries、model versions、Story Outline 与 Markdown export。下一阶段不应继续把更多研究内容无差别塞进同一张无限画布，也不应把 Asteria 做成 PPT 编辑器。最重要的产品转向是：

> **Asteria should become a general statistical architecture atlas: a system that makes every object, symbol, layer, dependency, assumption, estimand and inference step traceable.**

中文定位：

> **Asteria 是面向统计研究的“模型架构地图”，首先回答一个方法到底由哪些层组成、每个量是什么、从哪里来、如何得到、影响什么；然后再连接方法谱系与研究证据。**

这个定位不局限于 Bayesian models。Bayesian prior 只是某一种 stochastic specification；frequentist estimating equations、optimization objectives、causal estimands、identification assumptions、machine-learning losses 和 algorithmic transforms 都应当是同等一等对象。

---

## 1. 为什么以 Model Architecture 为第一优先级

现在的 block system 能记录 Model、Prior、Theorem、Dataset、Result、Notation、Symbol 等内容，但“能记录很多东西”不等于“能帮助理解模型”。当前主要问题是：

1. 一个 symbol、一整篇 paper、一个 dataset 和一个 simulation 容易成为同一级 block；
2. 普通箭头不能说明“生成”“参数化”“估计”“识别”“近似”之间的区别；
3. 用户能看到公式，却不能快速回答某个符号在第几层、维度是什么、上游从哪里来、下游进入哪个量；
4. Bayesian-specific block types 容易让 frequentist、causal inference、semiparametric 或 machine-learning workflow 无法自然表达；
5. 单一大 canvas 同时承担模型内部结构、方法谱系、论文证据和汇报叙事，导致尺度混乱。

因此下一阶段首先做清楚 **Model Architecture / Anatomy**，而不是继续新增更多松散 block type 或视觉装饰。

---

## 2. 长期信息架构：One Knowledge Graph, Multiple Views

Asteria 长期采用一个 Project 下共享 entity/relation 的多视图结构：

```text
Project: CAT-TRACE / Causal Study / Bioinformatics Pipeline / ...

[ Architecture ] [ Lineage ] [ Evidence ]

Story Outline
Search
Object Inspector
```

### 2.1 Architecture View

回答：

- 模型或方法有哪些层？
- 每个符号、数据对象、参数、潜变量、变换、估计量和目标是什么？
- 它从哪里来、由什么决定、服从什么分布或满足什么方程？
- 哪些假设保证它可识别或可估计？
- 它最终影响什么预测、estimand 或决策？

这是 Asteria 的核心视图和第一优先级。

### 2.2 Lineage View

回答：某个方法继承、推广、替换或放松了哪些既有方法。节点粒度以 model、method、paper、algorithm 和 prior family 为主，不放普通微观符号。

### 2.3 Evidence View

以 Claim 为核心，将 theorem、simulation、dataset、result、ablation、reference、limitation 和 implementation 连接起来，检查研究论证是否闭环。

### 2.4 Story Outline

Story Outline 已经实现并继续保留，但它是从 graph 抽取线性叙事的输出层，不是第四种同构 canvas，也不应反过来决定底层知识结构。

---

## 3. 通用 Statistical Object Schema

下一阶段不要继续用“每种方法加一个专属 block type”的方式扩展。应建立少量稳定的顶层 object kinds，再允许 domain-specific subtype。

建议第一版 schema：

```ts
type StatisticalObjectKind =
  | "observed_data"
  | "measurement"
  | "derived_data"
  | "latent_variable"
  | "parameter"
  | "nuisance_parameter"
  | "hyperparameter"
  | "deterministic_transform"
  | "stochastic_mechanism"
  | "objective"
  | "constraint"
  | "assumption"
  | "identification_condition"
  | "estimand"
  | "estimator"
  | "prediction_target"
  | "decision_rule"
  | "algorithm"
  | "diagnostic"
  | "uncertainty_object"
  | "result"
  | "claim"
  | "reference"
```

这些 kind 不等于 UI 一定显示二十种颜色。UI 可以继续使用少量视觉家族，但底层必须知道对象语义。

### 3.1 Bayesian 只是 schema 的一种实例

Bayesian model 可使用：

- observed_data；
- latent_variable；
- parameter / hyperparameter；
- stochastic_mechanism；
- prior relation；
- posterior / uncertainty_object；
- prediction_target。

### 3.2 Frequentist / optimization 方法

应能自然表示：

- likelihood、loss 或 estimating equation 作为 objective；
- parameter 与 nuisance parameter；
- regularizer 与 constraint；
- estimator 由 argmin / root-finding 得到；
- standard error、confidence interval、bootstrap distribution 作为 uncertainty_object。

### 3.3 Causal inference

应能自然表示：

- treatment \(A\)、outcome \(Y\)、covariates \(X\)；
- potential outcomes \(Y(1),Y(0)\)；
- estimand，例如
  \[
  \operatorname{ATE}=E\{Y(1)-Y(0)\};
  \]
- consistency、exchangeability、positivity 作为 identification conditions；
- propensity score \(e(X)\) 或 outcome regression；
- IPW、AIPW、matching 等 estimator；
- sensitivity analysis 与 overlap diagnostics。

这类项目不应被迫伪装成“prior/model/theorem”三类 Bayesian blocks。

### 3.4 Bioinformatics / pipeline 方法

应能表示 raw reads → QC → alignment → feature table → normalization → model → inference 的 deterministic 与 stochastic 混合流程，并记录软件/版本/参数 provenance。

---

## 4. Symbol 应成为一等 Entity

当前 Symbol block 是列表；长期应升级为可被公式、对象和关系引用的 canonical entity。每个 symbol 至少应有：

```ts
type StatisticalSymbol = {
  id: string
  latex: string
  canonicalName: string
  objectKind: StatisticalObjectKind
  subtype?: string

  scopeLevel?: string
  indices?: SymbolIndexSpec[]
  dimension?: string
  domain?: string
  unit?: string

  observedStatus: "observed" | "latent" | "fixed" | "estimated" | "derived"
  definitionMode:
    | "stochastic"
    | "deterministic"
    | "optimization"
    | "estimating_equation"
    | "causal"
    | "algorithmic"

  definition?: RichTextOrEquation
  stochasticLaw?: RichTextOrEquation
  objectiveOrEquation?: RichTextOrEquation
  constraints?: EntityRef[]
  assumptions?: EntityRef[]

  parentRefs?: EntityRef[]
  childRefs?: EntityRef[]
  definedIn?: EntityRef
  usedIn?: EntityRef[]

  provenance?: ProvenanceRecord[]
  codeBindings?: CodeBinding[]
  citations?: ReferenceRef[]
  variantState?: VariantMetadata
}
```

### 4.1 点击 symbol 后必须能回答的问题

以 CAT-TRACE 的 \(\beta^{\mathcal U}_{gh}\) 为例：

- 类型：parameter；
- 层级：open-tail feature within biological group；
- 维度：\(\mathbb R^q\)；
- indices：group \(g\)、within-group feature \(h\)；
- 定义：\(\nu+a_g+v^{\mathcal U}_{gh}\)；
- 上游：\(\nu,a_g,v^{\mathcal U}_{gh}\)；
- 下游：\(x_i^\top\beta^{\mathcal U}_{gh}\)、occurrence probability、richness theorem；
- stochastic law：若为 Bayesian specification，显示相应 prior；
- constraints：group effects sum-to-zero；
- code binding：R/C++ 参数名与文件位置；
- variant diff：旧版本使用 \(\nu_g\)，当前版本使用 \(\nu+a_g\)。

这类 traceability 才是 Asteria 相比普通 Markdown/Notion 的核心价值。

---

## 5. General Architecture Layers

Layer 不应硬编码成 Bayesian 专属。建议通用层级为：

1. **Scientific target / estimand**  
   研究真正想回答的问题、预测或决策目标。

2. **Observed inputs**  
   raw data、sample metadata、external structured data、units、index sets。

3. **Measurement / preprocessing**  
   detection、aggregation、normalization、matching、feature construction、missingness handling。

4. **Structural / latent representation**  
   latent variables、potential outcomes、state equations、graphical mechanisms、low-rank structure。

5. **Parameterization**  
   coefficients、group effects、variance/correlation、basis expansion、link functions。

6. **Assumptions / identification**  
   independence、exchangeability、positivity、rank condition、model restrictions、constraints。

7. **Inference / estimation**  
   prior + likelihood、estimating equations、optimization、MCMC、variational approximation、bootstrap。

8. **Prediction / decision**  
   posterior predictive、counterfactual estimand、classification decision、policy rule。

9. **Diagnostics / validation**  
   convergence、calibration、sensitivity、cross-validation、simulation checks。

用户可以过滤 layer，或只显示某个 symbol 的 upstream/downstream 子图。Layer 是认知视图，不要求所有方法严格线性流动。

---

## 6. Typed Relations

长期不能继续把所有 edge 当作普通箭头。建议 relation schema 至少支持：

### 6.1 Data 与结构

- `measured_as`
- `preprocessed_into`
- `aggregated_into`
- `matched_to`
- `derived_from`
- `indexed_by`

### 6.2 数学定义

- `generates`
- `depends_on`
- `parameterized_by`
- `transforms_to`
- `constrained_by`
- `conditions_on`
- `marginalizes_to`
- `factorizes_as`

### 6.3 推断

- `estimated_by`
- `optimizes`
- `solves`
- `approximated_by`
- `regularized_by`
- `identified_by`
- `uncertainty_quantified_by`

### 6.4 目标与证据

- `targets`
- `predicts`
- `intervenes_on`
- `supports`
- `tests`
- `validated_on`
- `limited_by`
- `contradicts`

Canvas 可保持简洁线条，但 inspector、search、filter 和 export 必须保留真实 relation type。

---

## 7. Architecture View 的核心交互

### 7.1 Symbol Trace

点击对象或 symbol 后提供：

- `Trace upstream`：只显示直接/递归依赖；
- `Trace downstream`：显示进入哪些公式、目标、算法和 claim；
- `Where defined`；
- `Where used`；
- `Which assumptions apply`；
- `Which variants change it`。

### 7.2 Focus by Layer

用户可以只显示 Observation、Latent、Inference 或 Prediction 等层，避免在完整模型上不断手动缩放。

### 7.3 Formula-aware references

公式中的 canonical symbols 应能链接到 symbol entity。第一版不要求完整 computer algebra parser，但至少允许用户显式绑定公式 token 与 symbol ID。

### 7.4 Architecture Outline

除自由 canvas 外，应有自动生成的层级大纲：

```text
Observed data
  Y_raw
  X
Measurement
  hard matching c(f)
  group mark g(f)
Latent model
  z_K
  z_U
Parameters
  alpha_K
  alpha_U
  beta_K
  beta_U
Inference
  priors
  marginal approximation
Targets
  richness
  future discovery
```

这比“从 canvas 猜阅读顺序”更稳定。

---

## 8. Model Variants 与 Semantic Diff

当前 sequential inheritance 保留，不应立即重写。但长期 variant 的价值不是保存三张近似相同的图，而是明确：

- Added entity；
- Removed entity；
- Modified definition；
- Modified relation；
- Changed assumption；
- Changed estimand / theorem applicability；
- Unchanged inherited entity。

以 CAT-TRACE 为例：

```text
TRACE
  alpha_j ~ TRACE calibration
  beta_j ~ N(nu, Psi)

Grouped CAT-TRACE
  Added: g, pi_g, a_g
  Changed: beta_gh = nu + a_g + v_gh
  Preserved: marginal probit and richness calibration

Catalogue variant
  Added: K, c(f), Y_K, finite catalogue intercept
  Added target: Delta_K
```

Semantic diff 应直接读取 entity/relation 变化，而不是只比较 rich-text 字符串。

---

## 9. Architecture Validation

Asteria 长期应提供“模型架构审计”，但不能假装自动证明数学正确。第一版可检查结构一致性：

1. symbol 被使用但未定义；
2. 同一 scope 下 canonical symbol 重名；
3. index 或 dimension 明显不一致；
4. parameter 没有进入任何 equation / target；
5. estimator 没有对应 estimand；
6. prior 没有对应 parameter，或 likelihood 没有 observed data；
7. causal estimand 缺少 identification condition；
8. claim 没有 theorem/simulation/result evidence；
9. variant 修改了 definition，但依赖 theorem 仍被标为 unchanged；
10. code binding 指向不存在的文件或 stale symbol name。

输出应是 warning / audit report，不自动篡改用户模型。

---

## 10. General Templates

Asteria 不应只有 Bayesian model template。至少需要：

### 10.1 Probabilistic / Bayesian model

Observed → latent → likelihood → parameter hierarchy → prior → posterior algorithm → prediction。

### 10.2 Frequentist regression / M-estimation

Data → objective / estimating equation → parameter → estimator → asymptotic variance / bootstrap → target。

### 10.3 Causal inference

Observed variables + DAG / potential outcomes → estimand → identification assumptions → identifying functional → estimator → diagnostics / sensitivity。

### 10.4 Machine learning

Input / label → representation → model → loss / regularization → optimizer → prediction → evaluation / calibration。

### 10.5 Bioinformatics pipeline

Raw assay → QC → preprocessing → features → model → inference → biological interpretation，且每步记录软件、版本、参数与 artifact provenance。

这些 template 应共享底层 schema，而不是各自重新开发一套 block system。

---

## 11. Machine-readable Export

Asteria 的长期输出不应只有截图和 Story Markdown。需要一个稳定的 architecture export：

```ts
type StatisticalArchitectureExport = {
  schemaVersion: string
  project: ProjectMetadata
  entities: StatisticalEntity[]
  symbols: StatisticalSymbol[]
  relations: TypedRelation[]
  views: ViewProjection[]
  variants: ModelVariant[]
  validation: ArchitectureWarning[]
}
```

用途包括：

- 生成 model section / notation table；
- 给 Codex/AI skill 提供无歧义模型上下文；
- 对照代码检查 symbol bindings；
- 生成 theorem dependency list；
- 从 Architecture View 导出可阅读 Markdown；
- 在不同项目之间复用方法模块。

JSON 是 canonical exchange format；Markdown/LaTeX 是可读投影，不反过来成为唯一源数据。

---

## 12. 与现有 Asteria 的迁移原则

1. 不破坏旧 map；
2. 现有 block 在迁移时可自动成为 generic entity，并保留 rich text；
3. 现有 Symbol entries 可逐步提升为 canonical symbols，不要求一次迁完；
4. position、size、collapsed state 与 local visibility 属于 view projection；
5. title、definition、symbol metadata、citations 属于 entity；
6. 现有 version resolver 先保留，后续再映射成 semantic variants；
7. Story Outline 继续引用 source entity，不复制冻结内容；
8. 不把 Architecture、Lineage、Evidence 三个视图做成同一张 canvas 的三个大框。

---

## 13. 实施优先级

### P0 — Schema 与设计审计

先写独立 design specification，不改 UI：

- entity / symbol / relation / layer / view schema；
- 旧 map migration strategy；
- CAT-TRACE 与 causal inference 两个完整 worked examples；
- 哪些字段 required、optional、computed；
- JSON compatibility/versioning；
- architecture validator 的第一批规则。

只有 schema 通过人工评审后才能进入实现。

### P1 — Symbol Entity + Typed Metadata

在不引入多视图大改的前提下：

- 让 Symbol 可拥有 dimension、indices、scope、definition mode、parents/children、constraints；
- 允许 block / formula 显式引用 symbol ID；
- Inspector 显示 Where defined / Where used；
- 支持 Symbol Trace 的最小版本。

这是最先能产生实际价值的一步。

### P2 — Layers + Typed Edges

- entity layer；
- typed relations；
- layer filter；
- upstream/downstream focus；
- architecture outline；
- basic validation warnings。

### P3 — Project + Multiple Views

实现 Architecture / Lineage / Evidence 的 projection 与独立布局。底层 entity 共享，不能复制三份内容。

### P4 — Semantic Diff

让 model variants 能报告真实的 added/removed/modified entities and relations，并检查 theorem/claim applicability。

### P5 — Evidence Closure 与 Code Binding

- claim-centered evidence audit；
- symbol / algorithm 到代码文件的 bindings；
- stale binding 检查；
- architecture Markdown/LaTeX/JSON export。

---

## 14. 当前明确不做

下一阶段不做：

1. 不直接重写整个 app；
2. 不先做 AI 自动建图；
3. 不做完整 symbolic algebra / theorem prover；
4. 不把 Asteria 做成 PPT/PDF 编辑器；
5. 不为每个统计领域增加互不兼容的 block set；
6. 不删除现有 version、Story Outline 或旧 map 兼容；
7. 不在 schema 未评审前直接实现多 tab 大迁移；
8. 不把 causal DAG editor 当成单独产品分叉；DAG 是 general architecture schema 的一种 projection。

---

## 15. 下一张正式任务应产出什么

后续 Codex task 应是 **design-only**，不是 implementation。建议任务名称：

```text
prompts/tasks/asteria_statistical_architecture_schema_plan_task.md
```

必须产出：

1. `docs/notes/2026-09-xx_statistical_architecture_schema.md`；
2. entity/symbol/relation/view TypeScript draft interfaces；
3. CAT-TRACE worked example；
4. causal inference worked example；
5. old-map migration table；
6. P1 最小实现边界与 regression-test plan；
7. 明确列出哪些当前 store/export assumptions 会阻碍新架构。

完成 design review 后，再拆出 P1 implementation task。不要让 Codex根据本 TODO 一次性开发 P0--P5。

---

## 16. 验收方向

Asteria 转型是否成功，不以“新增多少 block”衡量，而看用户能否对任意统计项目快速回答：

- 这个符号是什么意思？
- 它在哪一层？
- 是观测、潜在、固定、估计还是派生量？
- 维度、indices、domain 和单位是什么？
- 它由哪些对象得到？
- 它进入哪些公式、估计量和预测目标？
- 若是 Bayesian，prior 与 hyperparameter 是什么？
- 若是 frequentist，它由什么 objective / estimating equation 得到？
- 若是 causal，它对应什么 estimand，依赖哪些 identification assumptions？
- 哪个 variant 修改了它？
- 哪些 theorem、simulation 和 result 支持相关 claim？
- 代码里哪个对象实现了它？

当这些问题可以由结构化 graph 回答时，Asteria 才真正从“什么都能记的画布”变成“统计模型与研究论证的交互式地图”。

---

## 17. 同日补充：第一期只交付模型结构阅读闭环

本节在读取并保留同日提交 `58153582f644af294367001ab06e1fc88ba6e62e` 的以上规划后补入，不覆盖并行工作。进一步的界面、关系语义、三个范式案例及迁移分析见 [模型结构优先方案](docs/notes/2026-09-08_model_architecture_first.md)。

上述完整对象/关系清单是设计空间，不是第一张编辑表单必须全部填写的字段，也不是第一次开发必须完整实现的本体。首期最小闭环按以下顺序推进：

- [ ] 先完成作用域内的符号身份与显式公式引用。点击即可看到含义、角色、层级、定义/来源及直接依赖；维数、约束和更细来源按需补充。
- [ ] 再完成可配置层级、最小语义关系和局部上下游追踪。重复结构用索引范围表示，不在画布上展开全部样本/物种。
- [ ] 紧接着导出可独立阅读的模型说明 Markdown 与去重符号表，并验证旧地图、现有版本和保存的往返兼容。这个人读导出不等待 P3 的三个完整视图或 P5 的代码绑定全部完成；完整机器导出可渐进扩充。
- [ ] 最低样例必须同时覆盖 CAT-TRACE、无参数先验的回归/优化，以及平均处理效应的因果识别与估计。P0/P15 原有两个完整案例保留，补一个简短的频率学派案例，避免通用设计仍暗中依赖 Bayesian 字段。

先验是可选的分布关系，不是所有未知参数的必填项。观测、未知参数、估计量、后验分布和抽样分布必须可区分。生成箭头、推断信息流与因果箭头分别标注：从观测向上阅读不是“数据生成先验”，回归或相关也不能自动成为因果关系。

第一期校核只提醒未定义符号、作用域/索引冲突、派生量重复赋先验、数据来源和假设未说明等作者可以修复的问题，不为补齐图而编造数值先验或宣称数学/因果识别已获证明。Lineage/Evidence、语义差异、自动论文解析、完整代码绑定与 AI 自动建图继续后置，不与首期模型阅读闭环并行扩张。

本轮仅完成文档与 TODO 补充，以上功能没有因勾选计划而被标为实现。
