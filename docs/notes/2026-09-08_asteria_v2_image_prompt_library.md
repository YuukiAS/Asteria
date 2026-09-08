# Asteria 2.0 GPT Image 概念图 Prompt Library

日期：2026-09-08
用途：当 2.0 的具体 shell/layout 或交互视觉不确定时，先生成 production-oriented app concept，再让 Codex基于选定方向实现。这里的 prompt 不是产品 schema，也不授权直接重构代码。

## 通用要求

所有 prompt 默认追加以下约束：

- 这是统计研究工具，不是 SaaS 营销 dashboard；
- 主体必须是可交互模型架构 canvas，不能被卡片网格淹没；
- 需要展示真实数学公式与符号，例如 `β^U_{gh}`, `γ_g = γ_0 π_g`, `Σ_W`，公式可读；
- 左侧是轻量 project/view/layer/outline navigation，中心是 canvas，右侧是 object/symbol inspector；
- toolbar 必须克制；
- 不要 hero、营销文案、fake metrics、badge wall、bento grid；
- 视觉应像高级科研软件、IDE 与科学图谱的结合；
- code-native UI controls，不能把整张截图当成未来 raster UI；
- 16:10 桌面比例，优先 1440×900 或 1600×1000；
- 需要清楚显示 canvas nodes、semantic edges、selected state、inspector typography、toolbar density；
- 动效请通过静态画面中的 motion cues 表达，不要设计依赖 3D/粒子系统的效果。

---

## Prompt A — Light Scientific Atlas / 主架构视图

请设计 Asteria 2.0 的完整桌面主界面概念图。产品是“统计模型架构地图”：研究者用它理解和编辑复杂统计模型的符号、层级、依赖、假设、推断和预测目标。

视觉方向：高端 scientific atlas + modern IDE，明亮但不是纯办公软件。背景接近干净白纸或非常浅的冷灰，中心 canvas 有极轻的点阵/坐标感。不要大量圆角卡片堆叠。

必须包含：

1. 顶部窄 command bar：Project `CAT-TRACE`、View `Architecture`、Model Variant、Search、Export、Save；
2. 左侧窄 rail：Views、Layers、Architecture Outline，当前层 `Parameterization` 选中；
3. 中央主 canvas：按 Observation → Measurement → Latent → Parameterization → Inference → Prediction 形成自然空间层级，但不要画成僵硬流程图；
4. canvas 中有轻量数学节点：`Y_raw`, `c(f)`, `y^U_{igh}`, `z^U_{igh}`, `β^U_{gh}`, `ν`, `a_g`, `γ_g`, `Σ_W`, future discovery；
5. typed edges 使用少量不同 line treatment，视觉克制；
6. `β^U_{gh}` 被选中，直接上游 `ν`, `a_g`, `v^U_{gh}` 与下游 occurrence/richness 轻微高亮；
7. 右侧 inspector 详细显示：Meaning、Role `Parameter`、Dimension `R^q`、Indices `g,h`、Definition `ν+a_g+v^U_{gh}`、Where defined、Where used、Variant change；
8. 画面要有明显的专业排版层次和足够空白，像成熟科研软件，不像原型。

不要出现人物、插画、营销插图。不要使用大面积渐变卡片。图中数学符号要清晰。

---

## Prompt B — Quiet Celestial Dark / 暗色主架构视图

设计同一个 Asteria 2.0 主界面的暗色版本，保留现有 Asteria “celestial”品牌记忆，但必须非常克制。

背景是深蓝黑的科学绘图空间，只允许极轻微星图/点阵纹理；不能有游戏感、赛博朋克 neon 或大面积 glow。节点像精密科学标注，主要依靠 typography、细线、层级和留白识别。

中央 canvas 展示 CAT-TRACE 模型架构，selected symbol 为 `γ_g`。需要清楚表现它是 derived quantity：`γ_0` 与 `π_g` 的两条上游关系汇入 `γ_g`，再进入 open-tail intercept calibration 与 group richness。右侧 inspector 明确写：Definition `γ_g = γ_0 π_g`；Status `Derived`；不要出现 independent prior 字段。

左侧 layer/outline 与顶部 toolbar 都保持低密度。关系高亮可以用极细的 amber/ice-blue accent，但最多两种强调色。整体像顶级统计软件，而不是科幻数据可视化。

---

## Prompt C — Symbol Trace Focus State / 局部追踪

生成 Asteria 2.0 的“Symbol Trace”交互状态完整屏幕概念图。

场景：用户点击 `p_{U,g}`。主 canvas 原本有复杂 CAT-TRACE graph，但 focus state 只突出与该符号直接相关的对象：`K^obs_{U,g}`、zero-slot bookkeeping、`μ_p(γ_g)`、open-tail intercept、truncation stability diagnostic。其他节点仍可见但轻微降低对比，不要完全消失。

右侧 inspector 必须用自然语言明确：

- Role: fixed computational setting；
- Meaning: open-tail truncation；
- Not an estimand；
- Warning: not the true unknown species count；
- Used in: intercept calibration, zero-slot aggregation, finite-p sensitivity。

顶部出现 compact trace controls：Direct / Recursive、Upstream / Downstream、Clear Trace。不要设计成巨型 toolbar。

画面要让人一眼看懂“点击符号后连接会活起来”，可以用短段高亮路径、箭头方向、层级边亮度来暗示 motion。

---

## Prompt D — Variant Semantic Diff State

设计 Asteria 2.0 的模型 variant diff 界面，比较 `TRACE` 与 `Catalogue-aware CAT-TRACE`。

要求：

- 同一 canvas 尽量保持稳定空间位置，不显示两张完全重复的图；
- added entities：`K`, `c(f)`, finite catalogue intercept, catalogue discovery target，使用克制的新增标记；
- modified definition：`β^U` 从旧 group-specific mean 变为 `ν+a_g+v^U_{gh}`，在 inspector 中展示 before/after；
- preserved semantics：marginal probit interpretation、open-tail TRACE calibration，可在右侧 diff summary 中列出；
- removed/hidden 内容使用 ghost outline，而不是鲜红删除墙；
- 顶部 variant control 明确但不占空间；
- 视觉上像代码 diff 与科学模型图的结合。

不要做成 GitHub PR 页面；仍然以 canvas 为主。

---

## Prompt E — Multi-view Project Shell

设计 Asteria 2.x 的项目级多视图 shell，展示同一个 `CAT-TRACE` project 下的 `Architecture`, `Lineage`, `Evidence` 三个 view tab，但当前仍以 Architecture 为主。

要求强调：三个 view 共享同一个 entity graph，但拥有独立 layout。左侧 view switcher 清晰；不要在一张 canvas 里画三个巨大区域。

Architecture：微观符号/层级；Lineage：TRACE、HMSC、CAT-TRACE 等方法级节点；Evidence：Claim → Theorem / Simulation / Dataset / Result 的证据闭环。右侧 inspector 根据当前 view 切换解释，但保持同一设计语言。

画面主要用于探索 information architecture，不要过度添加功能。

---

## Prompt F — Compact Desktop App / Tauri 方向

设计 Asteria 2.x 的原生桌面窗口概念图，目标平台 Windows 11 与 macOS，假设使用 Tauri shell 承载同一 React/Vite app。

重点：

- 窗口 chrome 紧凑；
- 本地文件项目名与保存状态清楚；
- 支持 command palette、keyboard-first workflow；
- 主 canvas、left rail、right inspector 与 Web 版一致；
- 原生文件打开/导出入口自然嵌入，不要增加 Electron/VS Code 式重型 title bar；
- 视觉保持 scientific atlas；
- 不展示任何额外 Node console、terminal 或 dev tools。

概念要让人感觉这是一个轻量、快速、离线可用的科研桌面工具，而不是把网页简单套进厚重壳。

---

## Prompt G — Inspector Detail Study

只生成 Asteria 2.0 的右侧 Symbol/Object Inspector 详细设计研究图，放大到足够读清所有行。

选中对象 `β^U_{gh}`，必须包含：

- header：LaTeX symbol + canonical name + object kind；
- Meaning；
- Scope；
- Observed status；
- Indices；
- Dimension / Domain；
- Definition equation；
- Upstream / Downstream link rows；
- Constraints；
- Where defined；
- Where used；
- Variant history；
- Provenance / source；
- optional code binding 占位，但不要强制显示为空的 section。

设计为高级 IDE inspector / scientific object browser；高密度但不能拥挤，分组线和 typography 优先于套卡片。

---

## Prompt H — Architecture Outline + Layer Navigation Study

生成左侧导航区的详细概念图。需要同时容纳：Project/View switcher、Layers、Architecture Outline、当前 trace breadcrumb，但宽度要节制。

Outline 示例：

- Observed data
  - `Y_raw`
  - `X`
- Measurement
  - `c(f)`
  - `g(f)`
- Latent model
  - `z_K`
  - `z_U`
- Parameters
  - `α_K`
  - `α_U`
  - `β_K`
  - `β_U`
- Inference
- Targets
  - richness
  - future discovery

点击 outline row 会定位 canvas；layer toggle 会过滤/聚焦。需要表现 selected/hover/collapsed states。不要像文件管理器那么机械，也不要像 Notion tree 那么松散。

---

## 使用建议

若需要真正重设计 2.0 shell，优先生成 A/B/C/D 四张：Light、Dark、Symbol Trace、Variant Diff。只有主方向满意后，再生成 G/H 细节。不要先生成十几张风格各异的图再选；同一轮应保持一致的 palette、spacing、typography、icon treatment 与 canvas anatomy。