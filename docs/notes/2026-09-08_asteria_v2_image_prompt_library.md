# Asteria 2.0 GPT Image 概念图 Prompt Library

更新：2026-09-09
用途：Asteria 2.0 的 production-oriented UI concept 生成规范。这里的 prompt 是视觉设计输入，不是统计模型定义，也不授权直接重构代码。

## 0. 当前状态与生成策略

A/B/C/D 已经生成并通过第一轮人工审阅，可作为 **visual reference**：

- A：Light Scientific Atlas / Architecture 基线；
- B：Quiet Celestial Dark / 暗色主 shell 基线；
- C：Symbol Trace focus state；
- D：Variant Semantic Diff state。

后续不要继续把同一张图反复小修十几轮，也不要完全不引用已有视觉基线重新随机生成。

推荐方法是：**附上最相关的已接受图片作为视觉参考，然后要求“保留 shell / palette / typography / density / inspector anatomy，但重新构图当前 view”。** 这属于 reference-guided regeneration，而不是逐代局部修图。

具体规则：

1. Lineage / Evidence / Inspector / Outline 默认以 **B** 作为暗色视觉母版；B 保留现有 Asteria celestial 品牌记忆，但背景星点必须非常弱，不出现银河、星云、亮星或科幻 HUD。
2. 需要 Light 版本时，以 **A** 为视觉母版；先把暗色信息架构稳定，再做浅色等价投影，不并行发散两套产品结构。
3. 需要 Symbol Trace 的其他状态时，以 **C** 为交互参考；需要 Variant Diff 细化时，以 **D** 为布局参考，但数学内容必须按当前 canonical model 重写，不能继承图片里的旧/错误文字。
4. 不要把 A/B/C/D 当作统计学 source of truth。CAT-TRACE 示例中的符号、定义和模型关系必须服从最新 Frozen Canonical V2；视觉图片只决定设计语言。
5. 新图优先独立生成完整 screen/state；不要通过连续 edit 导致布局越来越拥挤或文字错误累积。
6. 当前 1.x 已有 `public/backgrounds/asteria-celestial-map.png`。实际实现优先评估复用/淡化该品牌资产，而不是依据概念图重新生成一张更强烈的星空背景。

### CAT-TRACE 当前视觉示例必须遵守的 Frozen V2 记号

后续新图至少遵守以下关键点：

- 有限目录是 `𝒦`，目录大小是 `K = |𝒦|`；
- 开放尾部分组截断写 `p_g`，前 `n` 个样本中非空开放尾部列数写 `p_g^*`；
- 匿名全零槽位数是 `p_g - p_g^*`；
- 开放尾部环境响应：`β^U_{gh} = ν + a_g + v^U_{gh}`；
- `ν` 是总体环境响应向量，不是 intercept；
- `a_g` 是 group-specific environment-response deviation；
- `γ_g = γ_0 π_g`，其中 `γ_0` 是 total open-tail intensity，`π_g` 是 group composition weight；二者都不是 intercept/group effect；
- 开放尾部截距：`α^U_{gh} | γ_g,p_g ~ N(μ_{p_g}(γ_g), τ_{p_g}^2)`；
- residual dependence 只在 finite working set `𝒲` 上建模，使用 `Σ_𝒲`；
- 第一篇论文真实数据主线为 Finland fungi、Malagasy arthropods、South-West Australia plants；GSMc 后置。

---

## 通用视觉要求

所有 prompt 默认追加以下约束：

- 这是统计研究工具，不是 SaaS 营销 dashboard；
- 主体必须是可交互模型架构 canvas，不能被卡片网格淹没；
- 需要展示少量真实数学公式与符号，公式必须可读且语义正确；
- 左侧是轻量 project/view/layer/outline navigation，中心是 canvas，右侧是 object/symbol inspector；
- toolbar 必须克制；
- 不要 hero、营销文案、fake metrics、badge wall、bento grid；
- 视觉应像高级科研软件、IDE 与科学图谱的结合；
- code-native UI controls，不能把整张截图当成未来 raster UI；
- 16:10 桌面比例，优先 1440×900 或 1600×1000；
- 动效通过静态画面中的 motion cues 表达，不依赖 3D/粒子系统；
- 暗色 celestial texture 只能做低对比背景记忆，不能成为主视觉焦点。

---

## Prompt A — Light Scientific Atlas / 主架构视图（已生成，保留作 Light reference）

设计 Asteria 2.0 的完整桌面主界面概念图。产品是“统计模型架构地图”：研究者用它理解和编辑复杂统计模型的符号、层级、依赖、假设、推断和预测目标。

视觉方向：高端 scientific atlas + modern IDE，明亮但不是纯办公软件。背景接近干净白纸或非常浅的冷灰，中心 canvas 有极轻的点阵/坐标感。不要大量圆角卡片堆叠。

必须包含顶部窄 command bar、左侧 Views/Layers/Architecture Outline、中央 Architecture canvas 和右侧 Symbol Inspector。CAT-TRACE 示例中选中 `β^U_{gh}`，显示 `β^U_{gh}=ν+a_g+v^U_{gh}`，并高亮其直接上游与 occurrence/richness 等下游对象。

---

## Prompt B — Quiet Celestial Dark / 暗色主架构视图（已生成，后续暗色母版）

设计同一个 Asteria 2.0 主界面的暗色版本，保留现有 Asteria celestial 品牌记忆，但必须非常克制。

背景是深蓝黑科学绘图空间，只允许极轻微星图/点阵纹理；星点密度和亮度应低于已生成 B 的视觉强度，不出现银河、星云、科幻 HUD、大面积 glow。

中央 canvas 展示 CAT-TRACE 架构，selected symbol 为 `γ_g`。必须正确表现 `γ_g = γ_0 π_g`：`γ_0` 标为 total open-tail intensity，`π_g` 标为 group composition weight，`γ_g` 标为 derived group-specific open-tail intensity。不要把 `γ_0` 写成 global intercept，也不要把 `π_g` 写成 group effect。

---

## Prompt C — Symbol Trace Focus State（已生成；后续同类交互参考）

生成 Asteria 2.0 的 Symbol Trace 交互状态完整屏幕概念图。

若重新生成，场景改用 Frozen V2 记号 `p_g`。点击 `p_g` 后只突出：`p_g^*`、zero-slot bookkeeping `p_g-p_g^*`、`μ_{p_g}(γ_g)`、open-tail intercept、finite-truncation diagnostic `ε_g(p)`。其他节点降低对比但仍可见。

Inspector 明确写：Role = fixed computational setting；Not an estimand；Not the true unknown species count；Used in intercept calibration / zero-slot aggregation / finite-p sensitivity。

---

## Prompt D — Variant Semantic Diff State（已生成视觉方向；语义 prompt 已修订）

比较 **original TRACE** 与 **Catalogue-aware CAT-TRACE Frozen V2**。同一 canvas 尽量保持稳定位置，不显示两张重复图。

Original TRACE 侧应表达：没有有限目录 `𝒦`、没有 catalogue matching、没有 `g` / `a_g` 的 grouped tail；环境响应可写成 `β_j = ν + v_j`, `v_j ~ N(0,Ψ)`，保留 TRACE intercept calibration 与 marginal probit interpretation。

CAT-TRACE 侧新增：`𝒦`, `c(f)`, finite catalogue intercept, catalogue discovery target, grouped open tail；开放尾部定义改为 `β^U_{gh}=ν+a_g+v^U_{gh}`。不要把 original TRACE 错写成 group-specific mean `ν_g`；`ν_g` 只属于历史 working draft，不属于 original TRACE。

Preserved semantics：marginal probit interpretation、open-tail TRACE calibration。Removed/hidden 用 ghost outline，不用红色 deletion wall。

---

# 下一轮真正建议生成的图片

## Prompt E1 — Lineage View / 方法谱系视图

**生成方式：附上已接受的 B 图作为 visual reference；不要把 B 当作局部 edit。要求重新生成完整 Lineage screen，同时严格保留 B 的 app shell、暗色 palette、toolbar density、左/右栏宽度、字体与控件风格。**

请设计 Asteria 2.x 的 `Lineage` view。它不是模型内部的微观 Architecture graph，而是回答“当前方法从哪些方法继承、扩展、替换或借鉴了什么”。

当前 Project 为 `CAT-TRACE`，顶部 View 选中 `Lineage`。左侧 Views 保留 Architecture / Lineage / Evidence / Narrative / Data / Code，但 Lineage 高亮。中央 canvas 改为方法级谱系，不铺满普通符号节点。

请用少量但有意义的方法级实体形成清楚的谱系：

- `TRACE / Infinite JSDM`：open-ended species list、TRACE tail calibration、marginal probit backbone；
- `HMSC`：trait / taxonomy / phylogeny structured borrowing 的生态解释来源；
- `bigMVP / high-dimensional multivariate binary response`：marginal-first / two-stage computational inspiration；
- `Sparse Bayesian Infinite Factor Models`：MGP factor shrinkage；
- `CAT-TRACE`：当前选中节点。

关系必须有语义而不是普通箭头，例如 `extends`, `borrows structure from`, `computationally inspired by`, `preserves`。不要暗示 CAT-TRACE 是简单把 TRACE 与 HMSC 拼接。

选中 `CAT-TRACE` 后，右侧 Inspector 显示：

- Lineage role / method summary；
- `Extends`: TRACE open-tail setting；
- `Borrows interpretation`: trait/taxonomy/phylogeny hierarchy where identity exists；
- `Computational inspiration`: marginal-first high-dimensional binary inference；
- `Preserves`: marginal probit interpretation / TRACE tail calibration；
- `Changes`: finite catalogue + grouped open tail + structured residual-dependence stage；
- links to Architecture and Evidence views。

中央布局应像“科学方法谱系图”，允许轻微横向时间/演化方向，但不要做成 Git commit graph、论文 citation network 或时间轴 PPT。节点数量控制在 6–10 个，留足空白。

暗色背景继续沿用 Quiet Celestial Dark，但星点比 B 更弱；视觉焦点是关系与 selected method，不是背景。

---

## Prompt E2 — Evidence View / 研究证据闭环

**生成方式：同样附上 B 作为 visual reference，重新生成完整 Evidence screen。不要从 C/D 连续编辑。**

请设计 Asteria 2.x 的 `Evidence` view。核心问题不是“模型由什么组成”，而是“一个研究主张被哪些理论、模拟实验、真实数据、实现证据支持，还有什么缺口”。

当前 Project 为 `CAT-TRACE`，顶部 View 选中 `Evidence`，左侧 Evidence 高亮。中心不使用 Architecture 的 Observation→Prediction 分层，而使用 **claim-centered evidence graph**。

选择一个当前可以合理表示的主张作为 selected claim：

`Grouped open-tail richness remains finite under TRACE-calibrated group tails while preserving marginal probit interpretation.`

围绕它放置少量证据节点：

- Theory / theorem：group-specific open-tail richness calibration；
- Proof dependency：TRACE Gaussian-probit identity + tail asymptotics；
- Simulation S1A：finite-p oracle calibration；
- Simulation S1B：fitted grouped-open-tail recovery / coverage；
- Real data: Finland fungi（TRACE continuity + grouped-tail case）；
- Implementation evidence：explicit vs aggregated zero-slot equivalence test；
- Limitation / open gap：future marked-discovery distributional theorem still pending。

South-West Australia plants 与 Malagasy arthropods 可以作为其他 claim 的弱化/折叠节点存在，但不要把 GSMc 放进第一篇论文主证据链。

Evidence edge types至少区分 `supports`, `tests`, `validates implementation`, `limited by`, `pending`。不要把所有边画成一种颜色；也不要做成绿色通过墙。

右侧 Claim Inspector 显示：Claim statement、Status、Supporting evidence、Counter/limitation、Affected variants、Linked theorem/simulation/dataset/result、Missing evidence。支持状态必须克制，例如 `Supported`, `Partial`, `Pending`，不能假装自动证明数学正确。

整体像论文论证结构与 IDE trace 的结合，而不是 project-management dashboard。

---

## Prompt G — Inspector Detail Study / 右侧检查器细节

**生成方式：附 B 作为视觉母版，但要求重新生成一张 inspector-focused detail study；不要直接裁剪 B。**

只生成 Asteria 2.0 的右侧 Symbol/Object Inspector 详细设计研究图，放大到足够读清所有行。选中对象 `β^U_{gh}`，采用 Frozen V2 定义 `β^U_{gh}=ν+a_g+v^U_{gh}`。

必须包含：LaTeX symbol + canonical name + object kind；Meaning；Scope；Observed status；Indices `g,h`；Dimension `R^q`；Definition equation；Upstream / Downstream；Constraints；Where defined；Where used；Variant history；Provenance / source；有内容时才显示 code binding，不要为缺失字段堆一排空 section。

右侧栏高密度但不能拥挤，优先 typography、section rhythm、thin separators、small disclosure rows；不要把每一项都做成 rounded card。

---

## Prompt H — Architecture Outline + Layer Navigation Study / 左栏细节

**生成方式：附 B 作为视觉母版，重新生成左栏 detail study。**

左侧导航需同时容纳 Project/View switcher、Layers、Architecture Outline、当前 trace breadcrumb，但宽度节制。

Frozen V2 示例 Outline：

- Observation: `Y_raw`, `X`
- Measurement: `c(f)`, `g(f)`
- Latent: `z^K`, `z^U`
- Parameterization: `α^K`, `α^U`, `β^K`, `β^U`, `γ_0`, `π_g`, `γ_g`, `p_g`
- Inference
- Prediction: richness, catalogue discovery, open-tail discovery

点击 outline row 会定位 canvas；layer toggle 会过滤/聚焦；需要显示 selected / hover / collapsed / trace-related states。不要像文件管理器那么机械，也不要像 Notion tree 那么松散。

---

## Prompt F — Compact Desktop App / Tauri 方向（保留，但当前后置）

该 prompt **不作废**，但当前不建议生成。等 2.0 Web Architecture shell、Inspector、Trace 与至少一个 secondary view 接近稳定后，再根据真实 UI 生成桌面壳概念。

届时以最终 Web shell screenshot 作为 reference，而不是继续以早期 B 为唯一依据。目标仍是 Tauri-first、轻量窗口 chrome、本地文件与保存状态清楚、command-palette / keyboard-first workflow、原生打开/导出入口自然嵌入，不增加 Electron/VS Code 式重型 title bar。

---

## 当前建议顺序

1. 现在先生成 **E1 Lineage**；
2. 若 E1 方向合理，再生成 **E2 Evidence**；
3. G/H 只有当实现 Inspector/left rail 前还存在明显 layout 不确定性时再生成；
4. F desktop 暂缓；
5. 不再新增新的 Architecture 总览风格图，除非 A/B 两种主题都被否决。
