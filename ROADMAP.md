# Asteria Product Roadmap

更新时间：2026-08-28

## 1. 重新定义 Asteria

Asteria 不应继续沿着“把一项完整研究摊在一张无限画布上”的方向发展。完整研究一旦同时包含背景、模型、符号、定理、simulation、dataset、结果、讨论和后续计划，本质上已经接近结构化文档；二维画布会逐渐承担它并不擅长的线性叙事职责，最终导致信息密度过高、关系混杂、阅读路径不稳定。

Asteria 更适合承担一种文档难以替代的任务：**把统计模型、方法之间的继承关系，以及研究主张与证据之间的关系，表示成可交互、可追踪、带明确语义的图结构。**

因此，长期产品定位调整为：

> **Asteria is an interactive atlas for understanding statistical models, their lineage, and the evidence supporting research claims.**

中文可理解为：Asteria 是一个面向统计研究的“交互式方法地图”，而不是二维论文编辑器。

核心原则是：**一份底层知识，多种视图；不同认知尺度，不强行塞进同一张 canvas。**

---

## 2. 为什么不应继续使用单一大 Canvas

Asteria 目前的 block system 已经可以表达 Model、Prior、Theorem、Dataset、Result、Notation、Symbol、Reference 等对象，但这些对象实际上位于不同的认知尺度。

以 CAT-TRACE 为例：

- `y_ij`、`z_ij`、`alpha_j`、`beta_j` 属于模型内部的微观结构；
- MVP、TRACE、HMSC、CAT-TRACE、bigMVP 属于模型之间的宏观谱系；
- Theorem 5.1、Simulation 1、Malagasy arthropod、real-data result 属于研究主张的证据体系。

如果把三类对象放在一张 canvas 上，会产生四个问题：

1. **尺度冲突**：一个 symbol 和一整篇 model paper 变成同一级节点。
2. **边语义冲突**：`beta_j -> occurrence probability` 与 `HMSC -> CAT-TRACE`、`Simulation 2 -> Claim A` 并不是同一种关系。
3. **布局冲突**：模型内部适合分层布局；方法谱系适合 genealogy / dependency layout；研究证据适合 claim-centered 或 bipartite layout。
4. **阅读目标冲突**：理解公式、理解文献脉络、检查论文证据闭环，是三个完全不同的问题。

因此，未来不应把 Model Anatomy、Model Lineage 和 Research Graph 设计为同一张画布上的三个区域。它们应该是同一个 Project 下的不同 **View / Tab**，共享底层对象，但拥有独立布局、过滤规则和交互方式。

---

## 3. 顶层信息架构：Project + Views

Asteria 的长期工作区建议采用：

```text
Project: CAT-TRACE

[ Model Anatomy ] [ Model Lineage ] [ Research / Evidence ]

                                   Story Outline
                                   Search
                                   Object Inspector
```

核心不是创建三个互不相关的文件，而是建立一个 Project 内的三个“投影视图”。

### 3.1 Model Anatomy

回答：

> 这个模型究竟怎么组成？每个符号是什么？从哪里来？影响什么？为什么存在？

这是 Asteria 最核心的视图，也是第一优先级。

### 3.2 Model Lineage

回答：

> 这个方法从哪里来？继承了谁？替换了什么？与相邻方法有什么实质区别？

这是文献阅读和方法比较视图。

### 3.3 Research / Evidence Graph

回答：

> 论文的每一个 scientific/statistical claim，由什么 theorem、simulation、dataset、result 和 reference 支撑？还有哪些 claim 没有证据闭环？

这是研究设计与论文完整性视图。

### 3.4 Story Outline

Story 不属于第四种 graph。它的目标是把任意视图中的对象抽出来形成线性叙事。因此长期仍应视为**输出层 / presentation layer**，而不是与三个 graph 完全同构的 canvas。

当前已经实现的 Story Outline 可以继续保留在侧边栏。以后如果侧边栏过于拥挤，可以把 Story 升级成独立 workspace tab，但其数据结构仍然应引用 source entities，而不是复制内容。

---

## 4. 核心架构思想：One Knowledge Graph, Multiple Projections

长期应避免“每个 tab 各存一份重复 block 内容”。更合理的数据模型是区分：

1. **Entity：对象本身是什么**；
2. **View Projection：这个对象在某个视图里如何显示**。

概念上可类似：

```ts
type AsteriaProject = {
  entities: Record<EntityId, Entity>
  relations: Record<RelationId, Relation>
  views: AsteriaView[]
  variants: ModelVariant[]
  storyOutline: StoryOutlineItem[]
}

type AsteriaView = {
  id: string
  type: "model_anatomy" | "model_lineage" | "research_evidence"
  title: string
  entityRefs: EntityId[]
  relationRefs: RelationId[]
  layout: ViewLayoutState
  viewport: ViewportState
  filters: ViewFilterState
}
```

这里的关键是：**position、size、collapsed state、local visibility 属于 view；数学定义、正文、metadata、canonical identity 属于 entity。**

例如 CAT-TRACE 可以同时出现在 Model Lineage 和 Research Graph 中，但两个 tab 不需要复制两份 CAT-TRACE block。

这种结构也是以后支持 causal inference、bioinformatics 等领域的基础。

---

## 5. View 1 — Model Anatomy

### 5.1 产品目标

Model Anatomy 不再追求“把研究写完整”，而是追求“把模型讲透”。

一张 Anatomy canvas 应主要包含：

- observed data；
- latent variables；
- parameters；
- priors / distributions；
- assumptions；
- transformations；
- estimands / predictive targets；
- inference components；
- 必要的 interpretation blocks。

Simulation、dataset、paper result 不应作为主图同层节点；它们只通过 Evidence links 挂接。

### 5.2 Symbol 需要成为一等对象

未来 Symbol 不只是一个“符号表 block”，而应该可以被模型节点引用。

例如 `beta_j` 应至少支持：

```text
Symbol: beta_j
Type: Parameter
Dimension: R^q
Level: species
Parents: nu, Gamma, t_j, ...
Children: x_i^T beta_j
Interpretation: species-specific environmental response
Identifiability / constraints: ...
Defined in: Catalogue slope layer
Used in: marginal occurrence probability, richness results
```

用户点击 `beta_j` 后，应能够直接回答：

- 它在哪里被定义？
- 哪些公式使用它？
- 上游先验是什么？
- 下游影响什么 quantity？
- 哪些 theorem 依赖它？
- 哪个 model variant 修改了它？

这类“traceability”是 Asteria 相比文档最有价值的能力之一。

### 5.3 Anatomy Edge 必须有语义

不能长期停留在“任意画一条箭头”。建议逐步加入关系类型，例如：

- `generates`
- `conditions on`
- `parameterizes`
- `has prior`
- `transforms to`
- `constrains`
- `marginalizes to`
- `approximates`
- `identifies`
- `predicts`

显示时仍可保持视觉简洁，但 inspector 和搜索应知道边的真实含义。

### 5.4 Model Layer / Focus Mode

复杂模型往往有多个层级。建议允许给 anatomy entity 增加 layer：

```text
Observation
Latent representation
Marginal mean
Prior / hierarchy
Dependence
Inference
Prediction / estimand
```

用户可以只显示某一层，或者点击一个节点后进入 “Trace upstream / Trace downstream” 模式，只显示与该节点有依赖关系的局部子图。

这比单纯 zoom canvas 更能降低认知负担。

---

## 6. Model Variants：替代“整张图多版本”的长期方向

当前 sequential model versions 已经有实际价值，不应立即删除。但长期应把“版本”从整张研究地图的历史副本，逐渐转向**模型变体（Model Variant）与语义差异（Semantic Diff）**。

例如：

```text
CAT-TRACE Core
  + Catalogue traits
  + Phylogeny borrowing
  + Continuous open-tail marks
  + Residual factor copula
```

从 Core 切到 Trait Variant 时，Asteria 应能够明确表示：

```text
Added:
  t_j
  Gamma

Changed:
  beta_j prior mean

Unchanged:
  y_ij = I(z_ij > 0)
  marginal probit interpretation
```

真正有价值的不是保存 V1/V2/V3 三张近似相同的地图，而是回答：

> 新版本到底改变了模型的哪一部分？哪些解释和 theorem 仍然成立？

### 6.1 Semantic Diff 的最终目标

Compare 两个 variant 时，可分为：

- Added entity
- Removed entity
- Modified definition
- Modified relation
- Unchanged inherited entity
- Changed assumption
- Changed theorem applicability

这应该成为 Asteria 的中期核心能力。

### 6.2 与现有版本系统的兼容

不要在早期重写当前 sequential inheritance。

迁移策略应是：

1. 保留当前版本 resolver；
2. 先增加新的 Project/View abstraction；
3. 再让 Model Anatomy 逐步理解 variant semantics；
4. 最后才考虑把旧 version records 映射成新的 variant representation。

旧 map 必须可继续打开，不做破坏性自动迁移。

---

## 7. View 2 — Model Lineage

### 7.1 产品目标

Model Lineage 的节点粒度应明显高于 Anatomy。

这里的节点通常是：

- model；
- method；
- paper；
- computational algorithm；
- prior family；
- conceptual framework。

不应该把 `beta_j`、`Sigma` 等普通符号放进这一层。

### 7.2 典型关系

Lineage edges 应重点支持：

- `extends`
- `generalizes`
- `special case of`
- `borrows from`
- `replaces`
- `relaxes assumption of`
- `computationally approximates`
- `alternative to`
- `inspired by`

### 7.3 CAT-TRACE 示例

```text
Multivariate Probit
        |
        v
      TRACE ------------> CAT-TRACE
        ^                    ^
        |                    |
      IBP                HMSC borrowing
                             ^
                             |
                  traits / phylogeny ideas

bigMVP -----------------> CAT-TRACE inference
```

点击 `TRACE -> CAT-TRACE` 不只是看到箭头，而应看到一个 concise change summary：

```text
TRACE:
  open-ended anonymous species space

CAT-TRACE:
  known-but-unseen finite catalogue
  + catalogue-external open tail
  + marked ecological discovery
```

### 7.4 Paper Reading Workflow

以后阅读一篇新论文时，不需要先决定“这篇论文要塞进完整研究地图的哪个角落”。

用户可以：

1. 创建或定位 paper/model entity；
2. 放入 Lineage；
3. 标记其与已有方法的关系；
4. 只在真正相关时进入某个 Model Anatomy；
5. 如果它支持一个研究 claim，再在 Research Graph 中建立 evidence relation。

这会显著减少当前“一篇论文读完之后整张 canvas 越来越乱”的问题。

---

## 8. View 3 — Research / Evidence Graph

### 8.1 为什么必须单独做

Research Graph 与前两个视图最不适合混在一张 canvas 中。

它不是模型结构图，也不是方法谱系图，而是**论文论证结构图**。

最核心的节点不应该是 Model，而应该是 **Claim**。

例如：

```text
Claim A
CAT-TRACE preserves marginal probit interpretation.

Claim B
Catalogue/open-tail decomposition separates two scientifically different discovery targets.

Claim C
Trait/taxonomy borrowing improves prediction for rare or known-but-unseen catalogue species.
```

然后 theorem、simulation、dataset、result、reference 围绕 claim 组织。

### 8.2 Evidence Node Types

Research Graph 第一版建议支持：

- Claim
- Theorem / Proposition / Corollary
- Simulation
- Dataset
- Result
- Ablation
- Assumption / Limitation
- Reference
- Implementation / Experiment
- Open Question

### 8.3 Evidence Edge Types

建议至少区分：

- `theoretically supports`
- `empirically tests`
- `validates on`
- `stress-tests`
- `motivates`
- `contradicts / challenges`
- `depends on assumption`
- `limited by`
- `implemented by`
- `compared against`

### 8.4 Claim-centered Layout

Research Graph 不应该简单复制 paper section 顺序。

推荐围绕 claim 分区：

```text
                         Theorem 5.1
                              |
                              v
Simulation 1 ------> [ Claim: grouped richness calibration ] <------ TRACE theory
                              |
                              v
                       Finland fungi
                              |
                              v
                           Result
```

另一个 claim 可以有完全不同的证据链。

### 8.5 Evidence Coverage

这是 Research Graph 最有潜力的高级能力之一。

系统未来可以自动指出：

- Claim 有 theorem，但没有 simulation；
- Simulation 没有对应任何 claim；
- Dataset 被加入项目，但没有承担明确验证任务；
- Result 存在，但没有回到 research claim；
- Claim 依赖某个 assumption，但没有 sensitivity check；
- paper introduction 中强调的 contribution 没有在 experiments 中得到支撑。

这不是自动“判断论文对不对”，而是检查**论证结构是否闭环**。

这会让 Asteria 从普通 mindmap 工具真正转向科研工作流工具。

---

## 9. Cross-view Linking

三个视图必须分开，但不能彼此孤立。

长期交互原则：**Switch view, keep context.**

例如在 Model Anatomy 中选中 open-tail calibration 节点后，可以：

```text
Open in Lineage
Open related evidence
Show where used
Show supporting papers
Show model variants
```

在 Research Graph 中点击 Theorem 5.1，可以跳回 Anatomy 中它依赖的 `alpha_Uhg`、`gamma_g`、`beta_Uhg`。

在 Lineage 中点击 HMSC -> CAT-TRACE，可以打开 Anatomy 中实际借用了哪些层，而不是只停留在宏观描述。

这种跨视图定位比把所有东西放在一张 canvas 上更强，因为它既保持局部图干净，又没有丢失全局连接。

---

## 10. Typed Statistical Graph：向通用统计工具扩展

Asteria 不应永远被写死成 Bayesian 工具，但也不应简单把 Causal、Bioinformatics、Machine Learning 都塞进 Bayesian 模板。

更合理的长期抽象是建立一个 **Typed Statistical Graph**。

### 10.1 通用 Entity Types

底层可以逐步支持：

```text
Data
Observed variable
Latent variable
Parameter
Distribution
Prior
Likelihood
Assumption
Estimand
Estimator
Algorithm
Objective
Diagnostic
Theorem
Result
Dataset
Reference
Claim
Pipeline step
```

不同领域只启用其中的一部分，并增加领域规则。

### 10.2 Bayesian Profile

典型结构：

```text
Data
 -> Likelihood
 -> Parameter / Latent variable
 <- Prior
 -> Posterior
 -> Posterior predictive / estimand
```

当前 Asteria 应先把这一类做成熟。

### 10.3 Causal Profile

Causal inference 不应被强行表示成 prior-likelihood graph。

它更自然的是：

```text
Observed variables / DAG
        |
        v
Causal assumptions
        |
        v
Estimand
        |
        v
Identification
        |
        v
Estimator
        |
        v
Sensitivity / diagnostics
```

例如 ATE 节点需要知道的重点是 estimand definition、identification assumptions、adjustment set、estimator 和 sensitivity，而不是 prior。

### 10.4 Bioinformatics Profile

Bioinformatics 很多问题兼具 pipeline 与 statistical model，因此更自然的是：

```text
Raw assay
 -> QC
 -> Normalization
 -> Feature representation
 -> Statistical model
 -> Biological target
 -> Validation
```

其中 Statistical model 节点又可以链接到一个 Model Anatomy。

因此 Bioinformatics 不需要另造一套 Asteria，而是使用同一套 Entity/Relation 基础设施，提供不同的 domain profile 和模板。

### 10.5 扩展顺序

不要同时做所有领域。

推荐顺序：

1. Bayesian / hierarchical statistical models；
2. general frequentist model anatomy；
3. causal inference profile；
4. bioinformatics pipeline + model profile；
5. machine learning / deep learning architecture profile。

只有当前统计模型内核成熟后，才应向外扩张。

---

## 11. 交互设计原则

### 11.1 Canvas 不再等于 Project

Project 可以包含多个 View；每个 View 有自己的 canvas、layout 和 viewport。

### 11.2 Entity Inspector 高于 Block Inspector

现有 Inspector 主要编辑一个 block 的内容和样式。长期应该逐步增加语义字段：

```text
Identity
Type
Definition
Dimensions
Role
Parents
Children
Assumptions
Variants
Evidence
References
Where used
```

不要求一次重写 UI，可逐步添加。

### 11.3 Layout 是 View-specific 的

同一个 entity 在不同 view 可以：

- 出现在不同位置；
- 有不同大小；
- 使用不同 compact/full representation；
- 在某个 view 被隐藏；
- 使用不同局部 group/frame。

不要把位置作为 entity 的全局属性。

### 11.4 内容保持 Canonical

一个 entity 的数学定义和正文原则上只有一份 canonical content。不同 view 可以显示摘要，但不应因为移动到另一个 tab 就复制一份独立正文。

### 11.5 Search 从全文搜索升级为语义搜索

现有 global search 可以继续保留。未来逐步加入：

```text
Find symbol beta_j
Find all assumptions used by Theorem 5.1
Find claims tested by rd002
Find all models extending TRACE
Find entities changed in Variant B
```

第一阶段不需要 AI，先利用 typed graph metadata 就可以实现大量价值。

---

## 12. 文档与 Asteria 的边界

未来必须明确：Asteria 不替代正式文档。

### 文档适合

- 从头到尾解释一个研究项目；
- 完整 theorem / proof；
- simulation protocol；
- data processing details；
- manuscript drafting；
- long-form discussion。

### Asteria 适合

- 看模型结构；
- 追踪符号上下游；
- 比较模型变体；
- 看方法谱系；
- 看 claim-evidence 闭环；
- 从多个关系视角定位同一个科研对象；
- 从网络结构抽出 Story Outline。

一个简单判断标准是：

> 如果内容主要依赖“阅读顺序”，优先写文档；如果内容主要依赖“对象之间的关系”，优先放 Asteria。

---

## 13. Roadmap Phases

下面按产品价值和工程风险排序，不按固定发布日期排序。

### Phase 0 — Product Direction Freeze

目标：先冻结新方向，避免继续在旧的“大一统 research canvas”上叠功能。

任务：

- 保留当前 app、Story、版本系统和 block 功能；
- 不做破坏性重构；
- 新功能讨论默认以 `Project + Views + Shared Entities` 为目标架构；
- 后续 implementation task 必须明确它属于 Anatomy、Lineage、Research/Evidence 还是跨视图基础设施。

完成标准：产品方向不再围绕“如何把更多研究内容塞进同一张 canvas”。

### Phase 1 — Multi-view Foundation

目标：先解决“不同认知尺度必须分 canvas”的基础问题，不急着重做 graph semantics。

第一版：

- 一个 Project 支持多个 View；
- 至少支持 `Model Anatomy`、`Model Lineage`、`Research / Evidence` 三种 view type；
- 顶部提供清晰 view switcher / tabs；
- 每个 view 保存独立 viewport 和 layout；
- 现有 map 默认迁移/映射为一个 legacy Anatomy-like view；
- JSON import/export 向后兼容；
- shared/local save 逻辑不被破坏；
- Story references 继续有效。

暂时不做：

- shared entity 去重；
- semantic edges；
- automated cross-view links；
- variant rewrite。

这是工程风险最低的骨架阶段。

### Phase 2 — Model Anatomy MVP

目标：让 Anatomy 明显优于普通 mindmap。

重点：

- Entity type 强化：Data / Parameter / Latent / Prior / Assumption / Estimand / Algorithm；
- symbol metadata：dimension、level、definition、interpretation；
- typed anatomy edges；
- upstream/downstream focus；
- layer filter；
- `Where used` 基础索引；
- compact symbol / parameter rendering。

完成标准：使用者可以沿着一个参数从 prior 一直追到 prediction，而不需要在全文中手工搜索。

### Phase 3 — Model Variants + Semantic Diff

目标：把现有多版本机制升级为真正的模型比较工具。

重点：

- Base model + Variant；
- Added / Removed / Modified / Inherited state；
- entity-level diff；
- relation-level diff；
- compare two variants；
- variant applicability metadata for theorem/claim；
- 保持旧 sequential version maps 可读。

完成标准：用户能回答“V2 相比 V1 到底在统计模型上改了什么”，而不是只看到两个版本的内容副本。

### Phase 4 — Model Lineage MVP

目标：形成方法与文献的真正谱系图。

重点：

- model/paper/method-level entities；
- lineage-specific relations；
- concise change summaries on edges；
- paper/reference attachment；
- fold/collapse model families；
- jump to related Anatomy。

完成标准：可以用一张低密度图解释一个方法系列的发展，而不需要混入模型内部符号。

### Phase 5 — Research / Evidence Graph MVP

目标：让 Asteria 能审查研究设计是否形成 evidence closure。

重点：

- Claim 成为一等 entity；
- Simulation / Dataset / Result / Theorem / Limitation 作为 evidence entities；
- evidence-specific typed edges；
- claim-centered layout；
- experiment status：planned / running / completed / failed / superseded；
- claim status：hypothesis / theoretically supported / empirically supported / unresolved；
- basic coverage checks。

基础检查可以先完全 deterministic：

```text
Claim with no evidence
Simulation with no claim
Dataset with no assigned role
Completed result not linked back to a claim
Claim depending on an untested assumption
```

无需 AI 即可产生很高价值。

### Phase 6 — Shared Entity Registry + Cross-view Navigation

目标：从“三张独立 canvas”升级为“一套知识、三个投影”。

重点：

- canonical entity IDs；
- view-local projection state；
- one entity appears in multiple views；
- backlinks；
- `Open in Anatomy / Lineage / Evidence`；
- `Where used` 全项目索引；
- rename canonical entity 后同步各 view；
- Story 引用 canonical entity。

这一阶段涉及数据模型重构，应晚于各 view 的真实需求被验证之后。

### Phase 7 — Statistical Grammar / Domain Profiles

目标：从 Bayesian-oriented research canvas 变成通用统计方法地图。

顺序：

1. Bayesian profile 稳定；
2. Frequentist model profile；
3. Causal profile；
4. Bioinformatics profile；
5. ML / deep learning profile。

每个 profile 重点是 entity schema、relation vocabulary、starter templates 和 inspector fields，而不是复制一个新的应用。

### Phase 8 — Advanced Queries and Diagnostics

目标：利用已经存在的 typed graph 做真正的研究导航。

候选功能：

- trace parameter dependencies；
- trace claim support；
- assumption impact graph；
- unresolved symbol detection；
- unused dataset / orphan result detection；
- variant theorem applicability；
- graph filters；
- saved queries；
- dependency path highlighting。

### Phase 9 — AI-assisted Graph Construction

AI 应最后进入，而不是作为新架构的前提。

可能方向：

- 从论文/Markdown 草拟 Model Anatomy；
- 从选定 blocks 提议 typed edges；
- 发现 undefined symbols；
- 提议 claim-evidence gaps；
- 根据 two variants 生成 semantic change summary；
- 将选定 subgraph 转成 prose / methods draft / story outline。

所有 AI 生成结果都应先作为 suggestion，不自动覆盖 canonical graph。

---

## 14. 推荐的 UI 形态

长期主界面建议接近：

```text
┌──────────────────────────────────────────────────────────────┐
│ Project: CAT-TRACE     Anatomy | Lineage | Evidence          │
├───────────────┬───────────────────────────────┬──────────────┤
│ Object / View │                               │ Inspector    │
│ navigation    │          Canvas               │              │
│               │                               │ Story        │
│               │                               │              │
└───────────────┴───────────────────────────────┴──────────────┘
```

### View tabs 应该是强切换，而不是弱 filter

切换 `Anatomy -> Lineage` 应该进入另一张布局，而不是在原 canvas 上把部分节点隐藏掉。

原因是二者的最佳空间组织方式完全不同。

### 但切换时应保留 context

如果当前选中 CAT-TRACE，切到 Lineage 后优先定位 CAT-TRACE model entity；切到 Evidence 后优先显示相关 claims。

这就是“不同 canvas，但共享语义上下文”。

---

## 15. CAT-TRACE 作为设计验证样例

未来每个核心阶段都可以先用 CAT-TRACE 验证，而不是立即追求 generic demo。

### Anatomy

```text
Y
 -> z_ij
 -> alpha_j + x_i^T beta_j + epsilon_ij

alpha_j
 -> finite catalogue intercept
 -> open-tail TRACE calibration

beta_j
 -> traits
 -> taxonomy / phylogeny borrowing

residual epsilon
 -> normalized factor copula
```

### Lineage

```text
MVP -> TRACE -> CAT-TRACE
IBP -> TRACE
HMSC -> CAT-TRACE borrowing layer
bigMVP -> CAT-TRACE computation
Extended Feature Allocation -> possible informative-label extension
```

### Evidence

```text
Claim: open-tail grouped richness is calibrated
  <- Theorem 5.1
  <- Simulation 1
  <- Finland fungi calibration

Claim: catalogue/open-tail decomposition is scientifically identifiable/useful
  <- Proposition / definition
  <- Simulation 2
  <- Malagasy arthropod

Claim: traits/taxonomy help rare known species
  <- Simulation 3
  <- South-West Australia plants
```

这三个视图都围绕同一研究，但没有任何一个需要承担整篇论文。

---

## 16. 当前应明确停止或降级的方向

以下方向不应作为近期优先级：

1. 继续扩充“完整研究大画布”模板。
2. 在同一 canvas 中同时展示 symbol-level model、literature lineage 和全部 experiments。
3. 把 Asteria 发展成 Word / Notion / LaTeX 的替代品。
4. 在浏览器里做 PPT editor。
5. 让版本系统继续无限承担项目历史、模型 variant、presentation variant 等所有含义。
6. 在基础 graph semantics 尚未稳定前直接做大量 AI 自动生成。
7. 同时开发 Bayesian、Causal、Bioinformatics 三套完整模式。
8. 为了“通用”而牺牲统计对象的严格语义。

---

## 17. 成功标准

Asteria 的长期成功不应该用“一个 canvas 能放多少内容”衡量，而应该用用户能否快速回答下面这些问题衡量：

### 模型理解

- `beta_j` 是什么？
- 它从哪里来？
- 哪些变量影响它？
- 它最终影响哪些概率和 estimand？
- 哪些假设保证它具有当前解释？

### 模型比较

- CAT-TRACE 相比 TRACE 到底增加了什么？
- 哪些部分来自 HMSC？
- 哪些原 TRACE theorem 仍然成立？
- Variant B 相比 Variant A 改了哪几个实体和关系？

### 文献理解

- 这篇新论文位于已有方法谱系的哪个位置？
- 它解决了上一代方法的哪个限制？
- 它对当前项目是核心依赖、计算借鉴还是未来扩展？

### 研究设计

- 论文的每一个核心 claim 有什么 evidence？
- 为什么需要 Simulation 2？
- rd003 到底验证哪个 claim？
- 哪些 experiments 是重复的？
- 哪个 assumption 还没有 sensitivity analysis？

如果这些问题能比阅读一堆 Markdown/PDF 更快回答，Asteria 就找到了不可替代的产品价值。

---

## 18. 当前推荐的下一步

近期不建议立刻实现全部 roadmap。

第一项真正值得进入 implementation planning 的任务是 **Phase 1: Multi-view Foundation**：

> 在不破坏现有 0.9.4 canvas、version、Story、save/import/export 的前提下，引入 Project 内多个独立 View，并首先提供 Anatomy / Lineage / Evidence 三个 view tab。

这一阶段只解决信息架构，不急着完成 shared entity registry。先验证三个独立视图是否真的改善使用体验，再进入 Anatomy semantics 和 variants。

如果 Phase 1 使用顺畅，下一步优先做 Model Anatomy，而不是 Research Graph。原因是 Model Anatomy 最接近 Asteria 当前已经成熟的 block/canvas 能力，也是后续 typed statistical graph、variants、cross-view entity registry 的基础。
