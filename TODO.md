# TODO — 模型架构优先

更新日期：2026-09-08
状态：长期产品方向与后续设计任务。本文档不授权直接大规模改代码；实现前仍需拆成独立 task、完成结构评审与兼容性计划。

Asteria 当前已经具备可编辑画布、类型化模块、符号条目、模型版本、叙事提纲与 Markdown 导出。下一阶段不应继续把更多研究内容无差别塞进同一张无限画布，也不应把 Asteria 做成 PPT 编辑器。最重要的产品转向是：

> **Asteria 应成为一套通用统计架构地图：让每个对象、符号、层级、依赖、假设、估计目标和推断步骤都可以追溯。**

中文定位：

> **Asteria 是面向统计研究的“模型架构地图”，首先回答一个方法到底由哪些层组成、每个量是什么、从哪里来、如何得到、影响什么；然后再连接方法谱系与研究证据。**

这个定位不局限于贝叶斯模型。贝叶斯先验只是某一种随机设定；频率学派估计方程、优化目标、因果估计目标、识别假设、机器学习损失函数和算法变换都应当是同等一等对象。

---

## 1. 为什么以模型架构为第一优先级

现在的模块系统能记录模型、先验、定理、数据集、结果、记号和符号等内容，但“能记录很多东西”不等于“能帮助理解模型”。当前主要问题是：

1. 一个符号、一整篇论文、一个数据集和一个模拟实验容易成为同一级模块；
2. 普通箭头不能说明“生成”“参数化”“估计”“识别”“近似”之间的区别；
3. 用户能看到公式，却不能快速回答某个符号在第几层、维度是什么、上游从哪里来、下游进入哪个量；
4. 贝叶斯专属模块类型容易让频率学派、因果推断、半参数方法或机器学习工作流无法自然表达；
5. 单一大画布同时承担模型内部结构、方法谱系、论文证据和汇报叙事，导致尺度混乱。

因此下一阶段首先做清楚 **模型架构 / 模型剖面**，而不是继续新增更多松散模块类型或视觉装饰。

---

## 2. 长期信息架构：一个知识图谱，多种视图

Asteria 长期采用一个项目下共享实体/关系的多视图结构：

```text
Project: CAT-TRACE / Causal Study / Bioinformatics Pipeline / ...

[ Architecture ] [ Lineage ] [ Evidence ]

Story Outline
Search
Object Inspector
```

### 2.1 架构视图（Architecture）

回答：

- 模型或方法有哪些层？
- 每个符号、数据对象、参数、潜变量、变换、估计量和目标是什么？
- 它从哪里来、由什么决定、服从什么分布或满足什么方程？
- 哪些假设保证它可识别或可估计？
- 它最终影响什么预测、估计目标或决策？

这是 Asteria 的核心视图和第一优先级。

### 2.2 方法谱系视图（Lineage）

回答：某个方法继承、推广、替换或放松了哪些既有方法。节点粒度以模型、方法、论文、算法和先验族为主，不放普通微观符号。

### 2.3 研究证据视图（Evidence）

以研究主张为核心，将定理、模拟实验、数据集、结果、消融、参考文献、限制和实现连接起来，检查研究论证是否闭环。

### 2.4 叙事提纲

叙事提纲已经实现并继续保留，但它是从知识图谱抽取线性叙事的输出层，不是第四种同构画布，也不应反过来决定底层知识结构。

---

## 3. 通用统计对象结构

下一阶段不要继续用“每种方法加一个专属模块类型”的方式扩展。应建立少量稳定的顶层对象类型，再允许领域特异子类型。

建议第一版结构：

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

这些类型不等于 UI 一定显示二十种颜色。UI 可以继续使用少量视觉家族，但底层必须知道对象语义。

### 3.1 贝叶斯只是结构的一种实例

贝叶斯模型可使用：

- `observed_data`；
- `latent_variable`；
- parameter / hyperparameter；
- `stochastic_mechanism`；
- 先验关系；
- 后验 / `uncertainty_object`；
- `prediction_target`。

### 3.2 频率学派 / 优化方法

应能自然表示：

- 似然、损失函数或估计方程作为目标函数；
- 参数与干扰参数；
- 正则项与约束；
- 估计量由 argmin / root-finding 得到；
- 标准误、置信区间、bootstrap 分布作为 uncertainty_object。

### 3.3 因果推断

应能自然表示：

- treatment $A$、outcome $Y$、covariates $X$；
- 潜在结局 $Y(1),Y(0)$；
- 估计目标，例如
  $$
  \operatorname{ATE}=E\{Y(1)-Y(0)\};
  $$
- consistency、exchangeability、positivity 作为 identification conditions；
- 倾向评分 $e(X)$ 或结局回归；
- IPW、AIPW、matching 等估计量；
- 敏感性分析与重叠性诊断。

这类项目不应被迫伪装成“先验/模型/定理”三类贝叶斯模块。

### 3.4 生物信息学 / 流程方法

应能表示原始 reads → QC → alignment → 特征表 → 标准化 → 模型 → 推断的确定性与随机混合流程，并记录软件/版本/参数来源记录。

---

## 4. 符号应成为一等实体

当前符号模块是列表；长期应升级为可被公式、对象和关系引用的规范实体。每个符号至少应有：

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

### 4.1 点击符号后必须能回答的问题

以 CAT-TRACE 的 $\beta^{\mathcal U}_{gh}$ 为例：

- 类型：参数；
- 层级：开放尾部特征，位于生物分组内；
- 维度：$\mathbb R^q$；
- 索引：组 $g$、组内特征 $h$；
- 定义：$\nu+a_g+v^{\mathcal U}_{gh}$；
- 上游：$\nu,a_g,v^{\mathcal U}_{gh}$；
- 下游：$x_i^\top\beta^{\mathcal U}_{gh}$、发生概率、丰富度定理；
- 随机规律：若为贝叶斯设定，显示相应先验；
- 约束：分组效应和为零；
- 代码绑定：R/C++ 参数名与文件位置；
- 版本差异：旧版本使用 $\nu_g$，当前版本使用 $\nu+a_g$。

这类可追溯性才是 Asteria 相比普通 Markdown/Notion 的核心价值。

---

## 5. 通用架构层

层不应硬编码成贝叶斯专属。建议通用层级为：

1. **科学目标 / 估计目标**
   研究真正想回答的问题、预测或决策目标。

2. **观测输入**
   原始数据、样本元数据、外部结构化数据、单位、索引集合。

3. **测量 / 预处理**
   检测、聚合、标准化、匹配、特征构造、缺失处理。

4. **结构 / 潜在表示**
   潜变量、潜在结局、状态方程、图结构机制、低秩结构。

5. **参数化**
   系数、分组效应、方差/相关、基展开、连接函数。

6. **假设 / 识别**
   独立性、可交换性、正值性、秩条件、模型限制、约束。

7. **推断 / 估计**
   先验 + 似然、估计方程、优化、MCMC、变分近似、bootstrap。

8. **预测 / 决策**
   后验预测、反事实估计目标、分类决策、策略规则。

9. **诊断 / 验证**
   收敛、校准、敏感性、交叉验证、模拟实验检查。

用户可以过滤层，或只显示某个符号的上游/下游子图。层是认知视图，不要求所有方法严格线性流动。

---

## 6. 类型化关系

长期不能继续把所有边当作普通箭头。建议关系结构至少支持：

### 6.1 数据与结构

- `measured_as`
- `preprocessed_into`
- `aggregated_into`
- `matched_to`
- `derived_from`
- `indexed_by`

### 6.2 数学定义

- `generates`
- `depends_on`
- `参数ized_by`
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

Canvas 可保持简洁线条，但 inspector、search、filter 和 export 必须保留真实关系 type。

---

## 7. 架构视图（Architecture）的核心交互

### 7.1 符号 Trace

点击对象或符号后提供：

- `Trace upstream`：只显示直接/递归依赖；
- `Trace downstream`：显示进入哪些公式、目标、算法和 claim；
- `Where defined`；
- `Where used`；
- `Which assumptions apply`；
- `Which variants change it`。

### 7.2 Focus by 层

用户可以只显示 Observation、Latent、Inference 或 Prediction 等层，避免在完整模型上不断手动缩放。

### 7.3 公式感知引用

公式中的 canonical 符号s 应能链接到符号实体。第一版不要求完整 computer algebra parser，但至少允许用户显式绑定公式 token 与符号 ID。

### 7.4 架构 Outline

除自由画布外，应有自动生成的层级大纲：

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

这比“从画布猜阅读顺序”更稳定。

---

## 8. Model Variants 与语义差异

当前 sequential inheritance 保留，不应立即重写。但长期 variant 的价值不是保存三张近似相同的图，而是明确：

- Added 实体；
- Removed 实体；
- Modified definition；
- Modified 关系；
- Changed assumption；
- Changed 估计目标 / 定理 applicability；
- Unchanged inherited 实体。

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

Semantic diff 应直接读取实体/关系变化，而不是只比较 rich-text 字符串。

---

## 9. 架构 Validation

Asteria 长期应提供“模型架构审计”，但不能假装自动证明数学正确。第一版可检查结构一致性：

1. 符号被使用但未定义；
2. 同一 scope 下 canonical 符号重名；
3. index 或 dimension 明显不一致；
4. 参数没有进入任何 equation / target；
5. 估计量没有对应估计目标；
6. 先验没有对应参数，或似然没有 observed data；
7. causal 估计目标缺少 identification condition；
8. claim 没有定理/模拟实验/结果 evidence；
9. variant 修改了 definition，但依赖定理仍被标为 unchanged；
10. 代码绑定指向不存在的文件或 stale 符号 name。

输出应是 warning / audit report，不自动篡改用户模型。

---

## 10. 通用模板

Asteria 不应只有贝叶斯模型模板。至少需要：

### 10.1 Probabilistic / 贝叶斯模型

Observed → latent → 似然 → 参数 hierarchy → 先验 → 后验算法 → prediction。

### 10.2 频率学派 regression / M-estimation

Data → 目标函数 / 估计方程 → 参数 → 估计量 → asymptotic variance / bootstrap → target。

### 10.3 因果推断

Observed variables + DAG / 潜在结局 → 估计目标 → 识别假设 → identifying functional → 估计量 → diagnostics / sensitivity。

### 10.4 机器学习

Input / label → representation → 模型 → 损失函数 / regularization → optimizer → prediction → evaluation / calibration。

### 10.5 生物信息学流程

Raw assay → QC → preprocessing → features → 模型 → 推断 → biological interpretation，且每步记录软件、版本、参数与产物来源。

这些模板应共享底层结构，而不是各自重新开发一套模块系统。

---

## 11. 机器可读导出

Asteria 的长期输出不应只有截图和叙事 Markdown。需要一个稳定的架构导出：

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

- 生成模型 section / notation table；
- 给 Codex/AI skill 提供无歧义模型上下文；
- 对照代码检查符号 bindings；
- 生成定理 dependency list；
- 从架构视图（Architecture）导出可阅读 Markdown；
- 在不同项目之间复用方法模块。

JSON 是 canonical exchange format；Markdown/LaTeX 是可读投影，不反过来成为唯一源数据。

---

## 12. 与现有 Asteria 的迁移原则

1. 不破坏旧 map；
2. 现有模块在迁移时可自动成为 generic 实体，并保留 rich text；
3. 现有符号条目可逐步提升为 canonical 符号s，不要求一次迁完；
4. position、size、collapsed state 与 local visibility 属于 view 投影；
5. title、definition、符号 metadata、citations 属于实体；
6. 现有版本 resolver 先保留，后续再映射成 semantic variants；
7. 叙事提纲继续引用 source 实体，不复制冻结内容；
8. 不把架构、方法谱系、研究证据三个视图做成同一张画布的三个大框。

---

## 13. 实施优先级

### P0 — 结构与设计审计

先写独立 design specification，不改 UI：

- 实体 / 符号 / 关系 / 层 / view 结构；
- 旧 map migration strategy；
- CAT-TRACE 与因果推断两个完整完整示例；
- 哪些字段 required、optional、computed；
- JSON compatibility/版本ing；
- 架构校验器的第一批规则。

只有结构通过人工评审后才能进入实现。

### P1 — 符号实体 + Typed Metadata

在不引入多视图大改的前提下：

- 让符号可拥有 dimension、indices、scope、definition mode、parents/children、约束；
- 允许模块 / formula 显式引用符号 ID；
- Inspector 显示 Where defined / Where used；
- 支持符号 Trace 的最小版本。

这是最先能产生实际价值的一步。

### P2 — 层 + Typed Edges

- 实体层；
- typed 关系s；
- 层 filter；
- 上游/下游 focus；
- 架构提纲；
- basic validation warnings。

### P3 — 项目 + Multiple Views

实现架构 / 方法谱系 / 研究证据的投影与独立布局。底层实体共享，不能复制三份内容。

### P4 — 语义差异

让模型 variants 能报告真实的 added/removed/modified entities and 关系s，并检查定理/claim applicability。

### P5 — 研究证据 Closure 与 Code Binding

- 以主张为中心的证据核查；
- 符号 / 算法到代码文件的 bindings；
- stale binding 检查；
- 架构 Markdown/LaTeX/JSON 导出。

---

## 14. 当前明确不做

下一阶段不做：

1. 不直接重写整个 app；
2. 不先做 AI 自动建图；
3. 不做完整符号ic algebra / 定理 prover；
4. 不把 Asteria 做成 PPT/PDF 编辑器；
5. 不为每个统计领域增加互不兼容的模块 set；
6. 不删除现有版本、叙事提纲或旧 map 兼容；
7. 不在结构未评审前直接实现多 tab 大迁移；
8. 不把 causal DAG editor 当成单独产品分叉；DAG 是 general architecture 结构的一种投影。

---

## 15. 下一张正式任务应产出什么

后续 Codex task 应是 **design-only**，不是实现。建议任务名称：

```text
prompts/tasks/asteria_statistical_architecture_schema_plan_task.md
```

必须产出：

1. `docs/notes/2026-09-xx_statistical_architecture_schema.md`；
2. 实体/符号/关系/view TypeScript draft interfaces；
3. CAT-TRACE 完整示例；
4. 因果推断完整示例；
5. old-map migration table；
6. P1 最小实现边界与 regression-test plan；
7. 明确列出哪些当前 store/export assumptions 会阻碍新架构。

完成 design review 后，再拆出 P1 实现 task。不要让 Codex根据本 TODO 一次性开发 P0--P5。

---

## 16. 验收方向

Asteria 转型是否成功，不以“新增多少模块”衡量，而看用户能否对任意统计项目快速回答：

- 这个符号是什么意思？
- 它在哪一层？
- 是观测、潜在、固定、估计还是派生量？
- 维度、indices、domain 和单位是什么？
- 它由哪些对象得到？
- 它进入哪些公式、估计量和预测目标？
- 若是贝叶斯，先验与 hyperparameter是什么？
- 若是频率学派，它由什么目标函数 / 估计方程得到？
- 若是因果推断，它对应什么估计目标，依赖哪些识别假设？
- 哪个版本变体修改了它？
- 哪些定理、模拟实验和结果支持相关研究主张？
- 代码里哪个对象实现了它？

当这些问题可以由结构化 graph 回答时，Asteria 才真正从“什么都能记的画布”变成“统计模型与研究论证的交互式地图”。

---

## 17. 同日补充：第一期只交付模型结构阅读闭环

本节在读取并保留同日提交 `58153582f644af294367001ab06e1fc88ba6e62e` 的以上规划后补入，不覆盖并行工作。进一步的界面、关系语义、三个范式案例及迁移分析见 [模型结构优先方案](docs/notes/2026-09-08_model_architecture_first.md)。

上述完整对象/关系清单是设计空间，不是第一张编辑表单必须全部填写的字段，也不是第一次开发必须完整实现的本体。首期最小闭环按以下顺序推进：

- [ ] 先完成作用域内的符号身份与显式公式引用。点击即可看到含义、角色、层级、定义/来源及直接依赖；维数、约束和更细来源按需补充。
- [ ] 再完成可配置层级、最小语义关系和局部上下游追踪。重复结构用索引范围表示，不在画布上展开全部样本/物种。
- [ ] 紧接着导出可独立阅读的模型说明 Markdown 与去重符号表，并验证旧地图、现有版本和保存的往返兼容。这个人读导出不等待 P3 的三个完整视图或 P5 的代码绑定全部完成；完整机器导出可渐进扩充。
- [ ] 最低样例必须同时覆盖 CAT-TRACE、无参数先验的回归/优化，以及平均处理效应的因果识别与估计。P0/P15 原有两个完整案例保留，补一个简短的频率学派案例，避免通用设计仍暗中依赖贝叶斯字段。

先验是可选的分布关系，不是所有未知参数的必填项。观测、未知参数、估计量、后验分布和抽样分布必须可区分。生成箭头、推断信息流与因果箭头分别标注：从观测向上阅读不是“数据生成先验”，回归或相关也不能自动成为因果关系。

第一期校核只提醒未定义符号、作用域/索引冲突、派生量重复赋先验、数据来源和假设未说明等作者可以修复的问题，不为补齐图而编造数值先验或宣称数学/因果识别已获证明。方法谱系/研究证据、语义差异、自动论文解析、完整代码绑定与 AI 自动建图继续后置，不与首期模型阅读闭环并行扩张。

本轮仅完成文档与 TODO 补充，以上功能没有因勾选计划而被标为实现。
