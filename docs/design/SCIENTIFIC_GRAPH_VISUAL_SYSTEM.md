# Asteria Scientific Graph Visual System

日期：2026-09-14  
状态：stable-facing canonical visual specification

本文件定义 Asteria Architecture / Lineage / Evidence / Inspector 的统一成品视觉规范。它约束 presentation，不改变 scientific truth、ontology、typed relations 或 evidence status。

核心目标：Asteria 必须看起来像经过编辑排版的 scientific atlas / statistical IDE，而不是自动 graph engine、流程图软件、线路图或 debug dashboard。

## 1. 总原则

### 1.1 信息层级

任何主视图必须满足：

```text
selected/current scientific object
> active relation / trace
> ordinary model structure
> muted/context structure
> implementation/debug metadata
```

不能让 connector、arrowhead、relation label、toolbar 或 debug/status 比当前科学对象更抢眼。

### 1.2 Geometry 与 style 分离

- layout/routing 决定节点与路径几何；
- visual grammar 决定 stroke、曲率、arrowhead、label、颜色、selected/muted 状态；
- 不允许为了视觉调优修改 canonical relation truth；
- 不允许按 entity id 给单个例子打 presentation 补丁；model-specific hints 必须通过通用 metadata/interface 表达。

### 1.3 Example 只是 fixture

CAT-TRACE、Original TRACE、当前 4-source Lineage 与当前 Evidence 都只是验收 fixture。视觉机制必须同时通过 synthetic 3/4/6-source provenance fixture、不同 lane density graph fixture 与 1366/1536 viewport。

---

## 2. 全局设计 tokens

### 2.1 Card

- 普通 scientific card：圆角 7–9px；1px neutral border；极轻 shadow；不使用强 glassmorphism。
- selected card：accent border + subtle accent background；selected card 必须比 active edge 更醒目。
- 主标题/数学符号必须完整可读；禁止 stable-facing card 依赖 ellipsis / line-clamp。
- card 内文字至少保留 10–12px horizontal padding。

### 2.2 Connector stroke

所有 SVG connector 必须使用稳定 CSS-pixel 视觉宽度；若 viewBox/transform 存在，优先 `vector-effect: non-scaling-stroke` 或等价机制。

推荐范围：

```text
Architecture ordinary        1.15–1.40px
Architecture active/trace    1.70–1.95px
Architecture muted           0.95–1.15px
Lineage ordinary             1.25–1.50px
Lineage selected             1.65–1.85px
Evidence ordinary            1.05–1.30px
Evidence selected/support    1.55–1.80px
```

active/base 视觉比例通常不超过约 1.45；禁止“荧光笔式”粗边。

### 2.3 Arrowhead

- arrowhead 必须小于 card 文本视觉权重；
- 推荐 6–8 CSS px 视觉尺寸；
- arrow tip 必须触达 target border；
- 多条 fan-in relation 的 arrowhead 必须分离，不形成蓝色粗结；
- arrowhead 不因 viewport/viewBox 非均匀缩放改变视觉比例。

### 2.4 Color

- Accent 只强调当前 selection / active path；
- ordinary structure 使用低饱和中性/单一蓝色；
- Evidence 的 support/pending/limitation 可以有语义色，但必须同时有文字状态；
- 不以颜色作为唯一语义编码。

---

## 3. Architecture visual grammar

Architecture 回答“统计模型如何从 observation 走到 latent / parameter / inference / target”。其视觉语言必须优先表达 **layered model flow**。

### 3.1 Layout

- semantic layer 决定主 x lane；
- lane 内独立 vertical packing；
- Full model 可增加 virtual canvas height/subcolumns，但不能打乱 lane order；
- Overview/Full model 都必须在 inspector-open 的真实 content box 内保留 card safe margin；
- 1366×768 与 1536×864 均不得 clip card。

### 3.2 Routing hierarchy

Architecture 禁止退化成“电路板/线路图”。Routing 优先级：

1. **Simple cross-lane edge，无 obstacle**：使用轻微 S-shaped cubic Bezier，保持左→右单调。
2. **需要绕 obstacle**：使用 rounded orthogonal route，优先 1–2 个 bend；corner radius 10–16 CSS px。
3. **复杂 fallback**：obstacle-aware grid/A* route，但必须经过 visual simplification 与 rounded-corner rendering。

禁止：

- 默认所有 edge 都用硬 90° `M/L` polyline；
- 为了避障做超长 top/bottom detour，除非没有局部路线；
- source→target 明明接近却绕完整个 canvas；
- selected/trace 时重新改变 route geometry。

### 3.3 Route scoring

候选 route 不能取“第一个不撞 card 的路径”。必须综合评分：

```text
score = path_length
      + bend_penalty
      + backward_x_penalty
      + detour_penalty
      + third_party_proximity_penalty
      + port_crowding_penalty
```

对 left-to-right architecture，backward-x movement 应有高 penalty。视觉上优先短、单调、少转弯。

### 3.4 Fan-in / fan-out

- 同一 target 多入边使用稳定分离 ports；
- ports 在 target border 安全范围均匀分布；
- active fan-in 不能形成 starburst；
- 同一 source 多出边也应分离 source ports；
- edge 不穿第三方 card。

### 3.5 Relation labels

- Overview 默认不铺满 edge text；
- 只在 selected/trace 或真正必要的关系上显示 concise label；
- label 使用统一 `relation capsule` 样式，不直接裸 SVG text 压在线上；
- capsule 与对应 route 有明确空间归属。

---

## 4. Lineage visual grammar

Lineage 是 **method provenance figure**，不是 generic graph。视觉目标是干净、平衡、一眼看出 source → CAT-TRACE。

### 4.1 Source / target

- sources 左列对齐，间距均匀；
- target 位于右侧中部，保持 >= 48px safe margin；
- source 数量 3/4/6 时布局机制不变；
- connector 必须实际连接 source border 与 target border。

### 4.2 Connector

- 每个 source-target pair 只画 1 条 visual connector；
- 多 typed relations 通过一个 relation-label group 表达，不重复画平行线；
- connector 使用柔和 cubic curve；不同 target ports 分离；
- 不允许 floating arrowhead。

### 4.3 Relation label group

Lineage 所有 relation 文案必须使用**同一种格式**：

- 每条 visual connector 只有一个 `relation-label-group`；
- group 锚定于该 connector 的 arc-length 45–55% 位置；
- group 沿 path normal 偏移 8–12px；
- 单 relation：一个 capsule；
- 多 relation（例如 TRACE：Extends + Preserves）：在同一个 group 中并排/紧凑堆叠两个 chips；
- group 有统一背景、border、font、padding、shadow；
- 禁止一个 chip 贴线、另一个 chip 游离在别处；
- viewport resize 后 label group 必须跟随 path，而不是固定 left/top 百分比。

建议 display copy：

```text
HMSC   -> Ecological hierarchy
TRACE  -> Extends | Preserves
bigMVP -> Scalable probit
MGP    -> Factor shrinkage
```

完整 typed relation 留 inspector。

---

## 5. Evidence visual grammar

Evidence 是 **claim-centered evidence map**。目标是让用户先看 claim，再看 support / pending / gap。

### 5.1 Layout

- claim 应成为视觉锚点；
- proof / dataset / implementation / limitation / pending theorem 围绕 claim 分组；
- 不要求和 Architecture 共用完全相同的 lane 视觉；
- selected claim/object 必须最醒目。

### 5.2 Edge

- Evidence edge 比 Architecture 更轻；
- simple relation 优先 soft curve 或 rounded orthogonal；
- 禁止电路图式大段直角长线；
- 不在画布上显示长 relation sentence；
- support/pending/limitation 真值可通过色彩 + inspector/status 表达。

### 5.3 Copy

- claim / proof / dataset / limitation copy 必须是研究者语言；
- 不出现 graph topology count 作为主解释；
- pending 不可视觉包装成 completed support。

---

## 6. Inspector visual grammar

右侧 Inspector 是阅读面板，不是第二个画布。

### 6.1 Single-scroll principle

- 右侧整个 inspector 只有一个主 vertical scroll；
- 公式块可有局部 horizontal scroll；
- 除明确的长 search-result/list 外，禁止 nested vertical scrollbar；
- 禁止出现高度被压成 10–30px 的“半截 section / tiny scrollbar strip”。

### 6.2 信息顺序

所有 view 统一：

```text
Asteria / context summary
View tabs
View help
Search
Primary inspector
Secondary relations / closure / advanced
Session / export
```

非 Architecture view 不得在 Search 与 Claim/Method Inspector 之间插入一个重复的 mini graph/canvas。

### 6.3 Primary inspector visibility

- Search 无展开结果时，Claim/Method Inspector 应紧接 Search，间隔约 12–16px；
- primary inspector 标题和第一块 Meaning 必须首屏可见；
- 不允许被一个 collapsed/squeezed current-view grid 挡住。

### 6.4 Math

- canonical definition 是独立 reader-facing formula block；
- KaTeX 横向完整；长公式只在公式块内部横向滚动；
- inspector 本身不得 horizontal overflow。

---

## 7. Motion

- graph geometry 不使用 `transition: all`；
- selection 只改变 opacity / border / fill / stroke / shadow；
- route geometry 不因 selection/trace 改变；
- 轻量过渡 100–180ms；
- 不出现 card 滑动、整图重排、arrowhead 跳动。

---

## 8. Responsive rules

Required acceptance sizes：

```text
1536×864
1366×768
```

在 inspector open 状态：

- canvas content box 必须作为 layout input；
- card safe margin >= 20px；Lineage target right safe margin >= 48px；
- resize 1536 -> 1366 -> 1536 后 connectors、chips、ports 必须重新对齐；
- 无 page-level horizontal overflow；
- primary scientific cards 不 clip。

---

## 9. Automated + visual acceptance

自动测试至少直接测：

```text
NODE_OVERLAP_COUNT = 0
EDGE_CARD_INTERSECTION_COUNT = 0
FLOATING_ARROWHEAD_COUNT = 0
TARGET_PORT_COLLAPSE_COUNT = 0
PRIMARY_TEXT_CLIPPED_COUNT = 0
INSPECTOR_TINY_SECTION_COUNT = 0
NESTED_VERTICAL_SCROLLBAR_COUNT = 0
```

但数字 PASS 不能替代截图 review。Developer self-QA 必须至少两轮，并逐张判断：

- 是否像 scientific atlas；
- 是否出现 electrical-wiring / auto-layout graph 感；
- relation labels 是否统一 attach；
- inspector 是否干净；
- selected scientific object 是否永远是第一视觉焦点。

## 10. Stable gate

任何一个核心 view 若出现以下任一项，stable-facing visual gate = FAIL：

- hard 90° wiring 成为主视觉；
- floating arrowhead；
- relation labels 格式不统一或与 path 失联；
- card clipping/overlap；
- inspector tiny clipped section / nested scrollbar；
- raw/broken math；
- generic AI/debug copy；
- selected node 不再是第一视觉焦点。
