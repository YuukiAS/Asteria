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
- connector terminal 与 card contact 是 geometry contract，不是仅靠 CSS 修饰；
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

### 2.3 Arrowhead / connector terminal

Asteria stable-facing graph 的 canonical arrowhead 是**细的 open chevron**，不是实心三角。

默认规范：

```text
shape: open chevron / V-shaped terminal
visual size: 5.5–7 CSS px
fill: none
stroke: context-stroke
stroke-linecap: round
stroke-linejoin: round
vector-effect: non-scaling-stroke
```

推荐 SVG 形状可类似：

```text
M 0 0 L 6 3 L 0 6
```

硬规则：

- Architecture / Lineage / Evidence 不使用 filled-triangle marker；
- active/selected 状态不得放大 arrowhead，只改变 edge stroke / opacity / color；
- arrow tip 必须触达 target border，且不能伸入 card body；
- 多条 fan-in relation 的 terminal 必须分离，不形成蓝色粗结；
- ordinary arrowhead 比 active edge 更弱，不抢 card 焦点；
- arrowhead 不因 viewport/viewBox 非均匀缩放改变视觉比例；
- 不允许一个 view 使用实心三角、另一个 view 使用另一种箭头造成品牌不一致。

### 2.4 Card-contact contract：connector 只能“点接触” card

这是 stable hard rule。

- source connector 只能从一个明确 source port 离开；
- target connector 只能由 arrow tip 在一个明确 target port 接触 card；
- 除 source departure 与 target terminal stub 外，connector body 与 source/target card border 保持至少约 6 CSS px 视觉间距；
- 禁止 connector 沿 card border 平行贴行、贴着 card 边走一段后才出现 arrowhead；
- 禁止 connector 在 card corner 外侧绕半圈再接入；
- final target stub 推荐 12–20 CSS px，并近似垂直于 target side；
- source departure stub 同样应近似垂直离开 source side；
- terminal tangent 与 target-side inward normal 的夹角应尽量 <= 15°，不得“擦边进入”；
- path 任何非 terminal 部分不得穿入 card body；
- 同一 card 多 ports 必须有安全间距，不得叠为一束。

视觉判断标准：用户应一眼看成“线从 card A 出发，在 card B 边界以一个清楚箭头结束”，而不是“线粘在 card 上”。

### 2.5 Port side policy

Port side 不应只取最近几何点，而应服务关系流向：

- 明显 left→right relation：优先 source right / target left；
- 明显 right→left relation：优先 source left / target right；
- 同列或近同列上下关系：优先 source bottom/top 与 target top/bottom；
- 只有 obstacle routing 确实需要时才改变 side；
- 即使改变 side，也必须保持 terminal stub 垂直接触 card；
- 不允许为了少走几像素而选择导致 border-hug 的 side。

### 2.6 Color

- Accent 只强调当前 selection / active path；
- ordinary structure 使用低饱和中性/单一蓝色；
- Evidence 的 support/pending/limitation 可以有语义色，但必须同时有文字状态；
- 不以颜色作为唯一语义编码。

---

## 3. Architecture visual grammar

Architecture 回答“统计模型如何从 observation 走到 latent / parameter / inference / target”。其视觉语言必须优先表达 layered model flow。

### 3.1 Layout

- semantic layer 决定主 x lane；
- lane 内独立 vertical packing；
- Full model 可增加 virtual canvas height/subcolumns，但不能打乱 lane order；
- Overview/Full model 都必须在 inspector-open 的真实 content box 内保留 card safe margin；
- 1366×768 与 1536×864 均不得 clip card。

### 3.2 Routing hierarchy

Architecture 禁止退化成“电路板/线路图”。Routing 优先级：

1. simple cross-lane edge、无 obstacle：轻微 S-shaped cubic Bezier，保持单调主方向；
2. 需要避障：rounded orthogonal route，优先 1–2 个 bend；corner radius 10–16 CSS px；
3. 复杂 fallback：obstacle-aware grid/A* route，但必须经过 simplification + rounded rendering。

禁止：

- 默认所有 edge 都用硬 90° M/L polyline；
- 为了避障做超长 top/bottom detour，除非没有局部路线；
- source→target 明明接近却绕完整个 canvas；
- selected/trace 时重新改变 route geometry；
- edge 为了避障而沿 source/target card 边界长距离贴行。

### 3.3 Route scoring

候选 route 不能取“第一个不撞 card 的路径”。必须综合评分：

```text
score = path_length
      + bend_penalty
      + backward_x_penalty
      + detour_penalty
      + third_party_proximity_penalty
      + port_crowding_penalty
      + edge_edge_crossing_penalty
      + card_border_hug_penalty
      + terminal_angle_penalty
      + region_change_penalty
```

其中：

- left-to-right Architecture 的 backward-x movement 高 penalty；
- 明明可以留在上半区/下半区的 relation，不应无故跨越到另一半再回来；
- 已有 routed edges 是 soft obstacles：可避免的 edge-edge crossing 应被显著惩罚；
- 靠近 card 边缘但不终止的 path segment 应有高 penalty。

### 3.4 Fan-in / fan-out

- 同一 target 多入边使用稳定分离 ports；
- ports 在 target border 安全范围均匀分布；
- active fan-in 不能形成 starburst；
- 同一 source 多出边也应分离 source ports；
- edge 不穿第三方 card；
- fan-in/fan-out 的 terminal stubs 必须保持可分辨，不得贴着 card border 平行堆叠。

### 3.5 Relation labels

- Overview 默认不铺满 edge text；
- 只在 selected/trace 或真正必要的关系上显示 concise label；
- label 使用统一 relation capsule，不直接裸 SVG text 压在线上；
- capsule 与对应 route 有明确空间归属。

### 3.6 Architecture arrow hierarchy

- ordinary edge 使用 canonical open-chevron terminal；
- active/trace edge 保持同尺寸 arrowhead，不做“更大箭头”强调；
- selected card 的 border/fill 是第一视觉焦点；
- dense fan-in 时 ordinary context arrowhead 可更淡，但不能丢失方向。

### 3.7 Architecture screenshot hard checks

任何 stable-facing Architecture screenshot 都必须人工检查：

- 是否存在 connector 沿 selected/neighbor card 边缘贴行；
- 是否存在箭头终点落在错误 side/corner；
- 是否存在可避免的 edge-edge crossing；
- 是否存在本可局部连接却跨半屏/跨上下区域的大绕行；
- endpoint 是否是单点接触而不是一段线“粘”在 card 上。

---

## 4. Lineage visual grammar

Lineage 是 method provenance figure，不是 generic graph。视觉目标是干净、平衡、一眼看出 source → CAT-TRACE。

### 4.1 Source / target

- sources 左列对齐，间距均匀；
- target 位于右侧中部，保持 >= 48px safe margin；
- source 数量 3/4/6 时机制不变；
- connector 必须实际连接 source border 与 target border；
- source departure 与 target terminal 必须遵守 card-contact contract。

### 4.2 Connector

- 每个 source-target pair 只画 1 条 visual connector；
- 多 typed relations 通过一个 relation-label group 表达；
- connector 使用柔和 cubic curve；不同 target ports 分离；
- 不允许 floating arrowhead；
- terminal 使用 canonical open chevron；
- final 12–20px 应清楚朝 target border 收束，不允许擦着 target border 滑行。

### 4.3 Relation label group

- 每条 visual connector 只有一个 relation-label-group；
- group 锚定于 connector arc-length 45–55%；
- group 沿 path normal 偏移 8–12px，默认选择 screen-up / visually open 一侧；
- collision 时统一 flip；
- viewport resize 后 label group 必须跟随 path。

单 relation：

```text
[ Ecological hierarchy ]
```

多 relation：

```text
[ Extends ]  [ Preserves ]
```

硬规则：

- 多 relation 使用同一 group 内 peer capsules，4–6px gap；
- 禁止 literal `|`、`/`、竖线 separator；
- 禁止外层大 capsule + 内层小 capsule；
- group 自身只负责定位；
- 每个 chip 使用同一 radius/border/padding/font/shadow；
- single/multi relation 视觉一致；
- group 不得压在线上；
- 不允许一个 chip 贴线、另一个 chip 游离。

建议 display copy：

```text
HMSC   -> [ Ecological hierarchy ]
TRACE  -> [ Extends ] [ Preserves ]
bigMVP -> [ Scalable probit ]
MGP    -> [ Factor shrinkage ]
```

完整 typed relation 留 inspector。

---

## 5. Evidence visual grammar

Evidence 是 claim-centered evidence map。目标是让用户先看 claim，再看 support / pending / gap。

### 5.1 Layout

- claim 是视觉锚点；
- proof / dataset / implementation / limitation / pending theorem 围绕 claim 分组；
- selected claim/object 必须最醒目。

### 5.2 Edge

- Evidence edge 比 Architecture 更轻；
- simple relation 优先 soft curve；必要时 rounded orthogonal；
- 禁止电路图式大段直角长线；
- 不在画布上显示长 relation sentence；
- direction terminal 使用 canonical open chevron；
- 必须遵守全局 card-contact contract：Evidence 尤其禁止 connector 沿 dataset/claim/limitation card 的边缘向上/向下贴行。

### 5.3 Crossing / corridor policy

Evidence 中常见关系不是统一 left→right，因此要按局部 source/target 几何选 corridor：

- 同一视觉行的对象优先留在该行附近；
- 下方 dataset → 下方 claim 若需要绕中间 card，优先使用下方 corridor，不应无故跨到上半区；
- 右侧竖向 theorem/limitation relation 应使用清楚的上下 terminal，不沿 card 左/右边界长距离贴行；
- 已有 edge 作为 soft obstacle，避免可避免的 crossing；
- route scoring 必须考虑 edge_edge_crossing_penalty 与 region_change_penalty。

### 5.4 Evidence footer / legend policy

Stable Evidence canvas 不显示模糊的静态字符串：

```text
Theory / implementation / datasets / limitation / pending
```

这不是有效 legend，只是类别罗列，会增加 UI 噪音。

规则：

- 如果 card 自身已有 kind/status 文本，则默认不需要底部静态类别 footer；
- 若确实需要 legend，必须是可解释的 compact legend（带视觉 swatch/状态含义），放在明确 legend control/section；
- 不得同时出现左侧 raw category string 与右侧 `Evidence relation legend` 这种重复 placeholder；
- Lineage 同理，不显示 `Extends / preserves / borrows / computational inspiration` 这类静态 footer string。

### 5.5 Copy

- claim / proof / dataset / limitation copy 必须是研究者语言；
- 不出现 graph topology count 作为主解释；
- pending 不可视觉包装成 completed support。

---

## 6. Inspector visual grammar

右侧 Inspector 是阅读面板，不是第二个画布。

### 6.1 Single-scroll principle

- 右侧整个 inspector 只有一个主 vertical scroll；
- 公式块可有局部 horizontal scroll；
- 除明确长 search-result/list 外，禁止 nested vertical scrollbar；
- 禁止高度被压成 10–30px 的半截 section / tiny scrollbar strip。

### 6.2 信息顺序

```text
Asteria / context summary
View tabs
View help
Search
Primary inspector
Secondary relations / closure / advanced
Session / export
```

非 Architecture view 不得在 Search 与 Claim/Method Inspector 之间插入重复 mini graph/canvas。

### 6.3 Primary inspector visibility

- Search 无展开结果时，Claim/Method Inspector 应紧接 Search，间隔约 12–16px；
- primary inspector 标题和第一块 Meaning 必须首屏可见。

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

## 8. Stable visual anti-patterns

以下任一项在 stable-facing screenshot 中出现，都视为视觉规范失败：

- filled triangular arrowhead 抢视觉；
- 同一 view arrowhead 形状/大小不一致；
- relation group 使用 literal `|` / `/` separator；
- outer capsule 中再嵌套 inner capsules；
- relation label 直接压在 connector stroke 上；
- selected/active edge 比 selected card 更抢眼；
- connector terminal 悬空或钻入 target card body；
- connector 沿 card border 长距离贴行；
- final segment 与 target side 几乎平行，形成“擦边进入”；
- 非 terminal path 在 source/target card 6px clearance zone 内长距离运行；
- 可避免的 edge-edge crossing；
- 本可留在下方/上方 corridor 的 relation 无故跨区再返回；
- Lineage single/multi relation 使用不同 label grammar；
- Evidence/Architecture 为强调 active relation 放大 arrowhead；
- stable research view 底部出现无解释的 raw category footer string；
- 只因 automated bbox/endpoint test PASS 就忽略一眼可见的 connector/label 粗糙感。

Developer self-QA 与 W01 必须对这些 anti-pattern 做 screenshot-level judgement，不能只检查 DOM 属性。

---

## 9. Geometry hard metrics for developer QA

视觉任务涉及 connector/routing 时，至少报告：

```text
EDGE_CARD_BORDER_HUG_COUNT = 0
NONTERMINAL_CARD_CLEARANCE_FAIL_COUNT = 0
TERMINAL_NORMAL_ANGLE_FAIL_COUNT = 0
ARROW_CARD_PENETRATION_COUNT = 0
FLOATING_ARROWHEAD_COUNT = 0
PORT_COLLAPSE_COUNT = 0
AVOIDABLE_EDGE_EDGE_CROSSING_COUNT = 0
STATIC_CATEGORY_FOOTER_COUNT = 0
```

这些指标不能替代截图审美判断，但任何一个非零都不能报 visual COMPLETE。