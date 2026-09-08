# Asteria 2.0 系统重构总计划

日期：2026-09-08
性质：2.0 主架构与执行路线。它继承 `TODO.md` 与 `docs/notes/ASTERIA_MODEL_ARCHITECTURE_TODO_20260908.pdf` 的“模型架构优先”方向，但进一步把版本边界、当前代码风险、CAT-TRACE reference、性能预算、视觉交互与桌面化路线收敛成可执行目标。

## 0. 结论

Asteria 不需要推倒重写。现有 React + Vite + React Flow + TipTap + KaTeX + Zustand + Dexie 是可保留的产品壳；真正需要重构的是**数据真值与交互语义**。

2.0 的 canonical source of truth 应从“节点里塞 rich text，边主要是画线样式”变成：

> **一个规范化的统计架构图谱 + 多个视图投影。**

其中实体、符号、关系、变体与研究语义是持久化真值；React Flow 节点的位置、折叠、局部显示和视觉样式只是某个 view 的投影。旧 block canvas 先作为兼容视图保留，而不是被删除。

CAT-TRACE 作为第一套 production reference model。它足够复杂，能同时检验身份状态、分组、潜变量、层级参数、TRACE 校准、残差依赖、计算截断、未来发现和模型变体，因此比人工 toy example 更适合决定 Asteria 2.0 的 schema。

## 1. 产品定位

Asteria 2.0 首先回答：

- 一个符号是什么；
- 位于哪一层；
- 维数、索引、domain、观察状态是什么；
- 如何定义、生成、估计或识别；
- 上游依赖什么；
- 下游进入哪些公式、目标、算法和 claim；
- 哪些假设或约束作用于它；
- 哪个模型变体改变了它；
- 在代码或文档中哪里实现/定义。

长篇解释、论文背景和完整 proof 仍应由文档承担。Asteria 的优势不是替代 Markdown，而是在 Markdown 无法做到的地方提供结构定位与交互追踪。

## 2. 2.0 的四层架构

### 2.1 Domain graph：真正的统计语义

建议新增独立 `src/architecture/` domain 层，至少包含：

```ts
type ArchitectureProjectV2 = {
  schemaVersion: "2.x"
  project: ProjectMetadata
  entities: Record<string, StatisticalEntity>
  symbols: Record<string, StatisticalSymbol>
  relations: Record<string, TypedRelation>
  variants: Record<string, SemanticVariant>
  views: Record<string, ArchitectureView>
  documents?: Record<string, LinkedDocument>
  updatedAt: string
}
```

不要把上游/下游数组作为多个互相同步的真值。关系表是唯一关系真值，`parents/children/whereUsed` 通过 graph index 派生。

### 2.2 Semantic entities：少量稳定顶层类型

沿用 TODO 中的通用思想，但第一版表单不暴露全部字段。底层可支持：

- observed / derived data；
- measurement / preprocessing；
- latent variable；
- parameter / nuisance / hyperparameter；
- deterministic transform；
- stochastic mechanism；
- objective / constraint / assumption / identification condition；
- estimand / estimator / prediction target / decision rule；
- algorithm / diagnostic / uncertainty object；
- result / claim / reference。

UI 仍只需要少量视觉家族，不能给每一种 semantic kind 分配一个高饱和颜色。

### 2.3 View projection：布局与语义分离

每个 view 保存：

- 哪些 entity/symbol 被投影；
- node position/size/collapsed state；
- local visibility；
- layer filter；
- camera/viewport；
- presentation overrides。

实体定义不因移动节点而更新。一个 entity 可出现在多个 view 中而不复制定义。

### 2.4 Legacy compatibility：1.x 是输入格式，不再是 2.0 真值

保留现有 `ExportedMap.version = 1` 导入路径，新建显式 `migrateV1ToV2()`。旧 block 内容转换为 generic/note entity 或 legacy presentation entity；旧 Symbol rows 可逐步提升为 canonical symbols。任何无法可靠自动推断的语义都保留为 unresolved metadata，不能猜。

## 3. 符号是一等实体

2.0 的最小 symbol 对象建议为：

```ts
type StatisticalSymbol = {
  id: string
  scopeId: string
  latex: string
  canonicalName: string
  meaning: string
  objectKind: StatisticalObjectKind
  observedStatus: "observed" | "latent" | "fixed" | "estimated" | "derived"
  definitionMode: "stochastic" | "deterministic" | "optimization" | "estimating_equation" | "causal" | "algorithmic"
  indices?: SymbolIndexSpec[]
  dimension?: string
  domain?: string
  unit?: string
  definitionRef?: string
  provenance?: ProvenanceRecord[]
}
```

第一期只要求核心字段可编辑。`dimension/domain/unit/provenance` 可渐进补齐。

公式绑定第一版采用**显式绑定**而非全自动 LaTeX parser：公式节点保存 `symbolBindings`，将用户选中的 token/LaTeX fragment 连接到 symbol ID。后续可以增加 parser-assisted suggestion，但不能在 2.0 核心里依赖字符串猜测。

## 4. Typed relations

2.0 必须把 relation semantics 与 edge appearance 分开。

第一批 canonical relation family：

- 数据：`measured_as`, `preprocessed_into`, `aggregated_into`, `matched_to`, `derived_from`, `indexed_by`；
- 数学：`generates`, `depends_on`, `parameterized_by`, `transforms_to`, `constrained_by`, `conditions_on`, `marginalizes_to`, `factorizes_as`；
- 推断：`estimated_by`, `optimizes`, `solves`, `approximated_by`, `regularized_by`, `identified_by`, `uncertainty_quantified_by`；
- 目标/证据：`targets`, `predicts`, `supports`, `tests`, `validated_on`, `limited_by`, `contradicts`；
- 因果关系必须显式标记，普通 regression edge 绝不自动升级为 causal edge。

视觉上仍可用少数线型和动画提示；semantic type 存在 inspector、search、filter 和 export 中。

## 5. Architecture 视图的最小闭环

2.0 stable 前必须完成：

1. **Symbol Inspector**：点击符号即可看到含义、角色、层、definition、indices/dimension、Where defined、Where used。
2. **Trace upstream/downstream**：支持 direct 与 recursive 两种模式；默认只突出局部子图，不把整张图全部变暗到不可读。
3. **Layer focus**：Observation / Measurement / Latent / Parameterization / Assumption / Inference / Prediction / Validation 等层可以过滤或聚焦。
4. **Typed edge inspector**：关系语义与视觉样式分别编辑。
5. **Architecture Outline**：自动从 layer + graph 生成可阅读大纲，点击条目定位 canvas。
6. **Readable export**：导出独立可读 Markdown + 去重 symbol table；同时导出 schema-v2 JSON。
7. **Structural validation**：只做可机械检查的 warning，不冒充 theorem prover。

## 6. 模型变体

当前 sequential block inheritance 先保留为 legacy content version。2.0 新增 semantic variant：

- added entity/relation；
- removed entity/relation；
- modified definition；
- modified assumption/constraint；
- modified target；
- unchanged inherited entity。

Variant 不应复制整张图。建议保存 base variant + typed overrides，并让 view projection 独立决定在该 variant 下的布局。

CAT-TRACE reference 至少应覆盖：TRACE → Grouped open-tail → Catalogue-aware CAT-TRACE 三个语义层级，以测试 `β^U` 从旧 `ν_g` 到共享 `ν+a_g` 等真实定义变化。

## 7. 性能是架构约束，不是最后优化

2.0 不允许把 semantic graph 直接塞进现有 monolithic render path 后再补救。

核心规则：

1. Zustand hot path 使用 selector，Canvas/App/Toolbar/Inspector 不再默认订阅整个 store。
2. canonical graph 使用 normalized record/Map 索引；recursive trace 使用预建 adjacency index，不能每次全表扫描。
3. React Flow 只接收当前 view 的 rendered projection，不接收项目全部 entities。
4. rich text 与 semantic metadata 分层。未编辑的长 rich text 不应导致每次 graph 操作重新解析。
5. undo/redo 从全量 clone + `JSON.stringify` snapshot 逐步迁到 patch/operation history 或结构共享；至少大图拖动不应频繁复制完整 project。
6. Search/validation 在实体量明显上升后可移到 worker；第一版先做可取消、可增量的 index。
7. fancy motion 只使用 transform/opacity/path emphasis 等 GPU 友好方式；不引入持续粒子场、3D engine 或全屏 WebGL 作为默认体验。

建议先测量而不是拍脑袋冻结硬阈值。2.0 RC 至少建立以下 benchmark fixture：

- 2,000 semantic entities / 5,000 relations 的存储与 trace；
- 200–300 visible nodes / 500–800 visible edges 的 canvas；
- 输入 rich text 时不触发无关 node 的大范围重渲染；
- symbol click → local highlight 的主线程延迟保持在交互级别。

## 8. 视觉与“fancy JS”方向

Asteria 可以更有表现力，但动画必须解释结构。

优先效果：

- 点击 symbol 时，直接依赖边按方向依次点亮；
- recursive trace 使用短暂层级 reveal，而不是永久闪烁；
- layer focus 以平滑淡入/淡出与 camera fit 呈现；
- variant diff 用 added/removed/modified 的 restrained transition；
- hover formula token 时，对应实体和下游公式同步强调；
- camera jump 使用短时 smooth pan/zoom；
- inspector 与 outline 通过 shared selection 同步。

禁止默认加入与信息无关的星尘、漂浮粒子、复杂玻璃卡片堆叠或持续 glow。现有 celestial identity 可保留为背景语言，但主信息层要更像严谨科研工具。

精确布局在 coding 前不强行冻结。`docs/notes/2026-09-08_asteria_v2_image_prompt_library.md` 提供成套 GPT Image 概念 prompt；只有需要大幅调整 app shell 时才启用。Figma 是可选的二次规格工具，不作为 2.0 schema 前置依赖。

## 9. 桌面化路线

Web 继续是 reference implementation。为了未来 desktop，不要让 domain graph 依赖浏览器-only API。

先抽象：

```ts
interface PersistenceAdapter { ... }
interface FileDialogAdapter { ... }
interface PlatformCapabilities { ... }
```

Web adapter 继续使用 Dexie/shared HTTP API。桌面优先评估 **Tauri 2**，因为现有 React/Vite 可以直接复用，且相较 Electron 更适合“不要太卡、不要太臃肿”的要求。Electron 仅在未来确认需要 bundled Chromium、Node ecosystem 或特定插件能力且 Tauri 无法满足时再考虑。

桌面壳不阻塞 2.0 stable；先保证数据格式与平台 adapter 边界正确，再做 2.x desktop release。

## 10. 里程碑与任务映射

- **G00 — 1.x Freeze & Baseline**：冻结 1.0.0、性能与兼容基线。
- **G01 — 2.0 Semantic Kernel**：schema、normalized graph、v1→v2 migration。
- **G02 — CAT-TRACE Reference & Symbol Trace**：以 canonical CAT-TRACE 建 fixture，并完成 symbol binding / inspector / basic trace。
- **G03 — Typed Relations, Layers & Outline**：关系语义、层 filter、局部 focus、架构大纲。
- **G04 — Export, Validation & Semantic Variants**：模型说明导出、warning engine、variant semantic diff。
- **G05 — Performance & Interaction RC**：store/render refactor、stress benchmark、motion polish，形成 2.0 RC。
- **G06 — Multi-view Projection**：Architecture/Lineage/Evidence 共享 graph、独立 layout；可作为 2.0 后半或 2.1。
- **G07 — Desktop Platform**：Tauri prototype + platform adapters；属于 2.x 平台化，不阻塞核心模型架构。

每张任务都在 `prompts/tasks/` 中独立存在。另有 `asteria_v2_core_autonomous_task.md`，允许一次启动后顺序执行 G00–G05；任何 gate 失败必须停止，不能以“继续做后面功能”掩盖当前层错误。

## 11. 自动执行原则：尽量不占用户时间

用户不需要逐个决定 schema 字段、颜色、组件拆分或测试阈值。Codex 应自行完成常规工程判断、测试、commit 和 push，并把证据写到 `results/`。

只有以下情况才中断：

- 需要不可逆数据迁移；
- 需要改变固定公网入口或生产基础设施；
- 出现两个会永久改变用户工作方式、且无法通过兼容层同时支持的产品分叉；
- 需要外部付费服务/credential；
- 当前 gate 的 correctness/performance 证据明确失败。

视觉上若存在多个合理 layout，不应阻塞 semantic core；保留现有 shell，先把备选方案沉淀成 image prompts，等最终验收时再决定是否做大改。

## 12. 2.0 stable 的定义

2.0 不是“做完所有长期 TODO”。它达到 stable 的最低标准是：

- v1 map 无损迁移；
- CAT-TRACE reference 可完整表达；
- canonical symbol 可点击追踪；
- typed relations 与 layers 可用；
- architecture outline 可用；
- readable Markdown/JSON export 可用；
- structural warnings 可用；
- semantic variants 不再只是 rich-text diff；
- stress fixture 下交互没有明显架构性卡顿；
- Story Outline、保存/恢复、当前固定 Web 入口继续工作。

Lineage/Evidence 高级视图、自动论文解析、AI 自动建图、完整 code binding、桌面端、factorized collaborative backend 都可以在 2.x 继续迭代。