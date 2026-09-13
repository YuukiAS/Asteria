# Asteria Visual Acceptance Contract

日期：2026-09-13

本文件不是 Browser 合规规则；Browser 合规仍以 `UI_BLACKBOX_BROWSER_CONTRACT.md` 为唯一来源。本文件定义 Asteria 在 stable 前的**视觉/交互成品验收标准**，用于避免“技术流程能完成，但画面一眼明显不成熟”仍被判 PASS。

## 1. Human override

用户人工验收发现的明确视觉 blocker 优先级高于此前 GPT Work PASS。出现 human blocker 后：

```text
HUMAN_ACCEPTANCE = FAIL
PREVIOUS_PASS_FOR_AFFECTED_SCOPE = INVALIDATED
```

不得因为此前 reviewer 已 PASS 而忽略或降级。

## 2. W01 / W04 / W05 最终验收不得只做 checklist

最终视觉验收必须先做整屏 gestalt review，再做逐项 checklist。至少同时判断：

- card/node 是否重叠；
- edge / arrow / relation label 是否穿过 card 或遮住主文字；
- primary label / symbol 是否被 clip、ellipsis 或其它元素挡住；
- selection / trace 前后已有节点是否发生无意义整体位移；
- 交互动画是否僵硬、夸张或像 debug transition；
- Light/Dark 是否都能长时间阅读；
- user-facing math 是否真正排版为数学，而不是 `a_g`, `gamma_0`, `p_g^*`, `mathcal K` 等 raw ASCII/LaTeX；
- canonical formula 是否是一个完整横向数学表达式，而不是 KaTeX 存在但 glyph/上下标被挤成纵向碎片；
- 文案是否存在大量重复模板、内部实现口吻、generic AI 句式；
- `Why it matters` 是否真正解释统计意义，而不是只报告 layer/upstream/downstream relation count；
- Architecture / Lineage / Evidence 是否各自有清楚、克制的 graph grammar。

核心 Architecture/Lineage/Evidence 的上述问题如果达到 P2，W01/W04/W05 不得以 `PASS + P2` 放行 stable；应返回 FAIL/FIX_THEN_RETEST。

## 3. Mandatory screenshot states

每次 broad visual repair 后，W01 prompt 必须要求 fresh browser 至少保存并逐张审查：

1. CAT-TRACE Architecture Overview，1536×864，Dark，trace OFF；
2. CAT-TRACE Architecture Overview，1366×768，Light，trace OFF；
3. Overview 中选择 `Open-tail occurrence` (`y^U_igh`)；
4. Overview 中选择 `Group open-tail intensity` (`gamma_g`)；
5. Overview 中选择/trace `Open-tail slope` (`beta^U_gh`)；
6. Full model + Fit；
7. Original TRACE Architecture；
8. Lineage；
9. Evidence；
10. Semantic Diff / inspector 中至少一屏包含数学表达式；
11. Inspector 中 `beta^U_gh` canonical definition；
12. Inspector 中 `gamma_g` canonical definition；
13. Original TRACE 至少一个长 canonical definition。

不能只检查默认首屏。

## 4. Geometry invariants

在 1536×864 与 1366×768 的 required states：

- visible node bounding boxes 不得互相覆盖；
- edge label bounding box 不得覆盖 node/card 的主要内容区；
- primary node title/symbol 必须完整可辨；
- stable-facing scientific card label 不得依赖 `line-clamp` / ellipsis；需要时允许 card 自适应宽高与 2–3 行自然换行；
- tooltip/title 只能辅助，不能替代主卡完整显示；
- selection/trace 开关前后，未新增/删除的共享节点应保持稳定位置；
- reveal context 可以新增节点，但不得通过重新归一化整个画布造成所有节点整体跳动；
- Lineage/Evidence 的 target/source card 必须留出安全边距，不贴 canvas 边缘。

自动 browser regression 应尽可能直接测 DOM/SVG bounding-box overlap，同时检查 primary label 自身是否被 CSS clamp/ellipsis 或容器高度裁切，而不是只看 screenshot 是否生成成功。

## 5. Edge / relation-label grammar

- 不允许把 relation type 以大号裸文字直接压在线条上并穿过图；
- 默认图不应显示满屏 relation 文本；
- Architecture 只在 selected/active trace 等必要状态显示少量 concise relation labels；
- Lineage/Evidence 优先使用短标签、legend、compact pill 或 inspector，而不是长句直接铺在曲线上；
- arrow/curve 应避开 card 主体，至少不得穿过 node text；
- 同一 view 内 edge label 字号、背景、halo、间距统一。

## 6. Motion / selection quality

- 禁止 `transition: all` 驱动 graph geometry；
- selection/trace 不应触发已有 card 在画布上大范围移动；
- 推荐仅对 opacity / border / background / shadow / stroke 做 100–180ms 的轻量过渡；
- 新 reveal context 可以淡入，但不要让主图重新排布后“滑动到新位置”；
- reviewer 必须真实连续点击至少 3 个不同节点，观察过渡，不得只比较静态截图。

## 7. Math rendering gate

研究者可见区域中：

- 符号、公式、上下标使用统一数学渲染；
- Semantic Diff、Evidence、Inspector、relation explanation 中出现数学对象时也必须渲染；
- raw canonical string 可以保留在 Advanced/export/debug，但不得成为主阅读层；
- browser regression / copy lint 应拦截主 UI 中 `mathcal `、`gamma_`、`beta^`、`p_g^*`、`a_g` 等明显 raw math token（仅允许在隐藏/Advanced canonical source 中存在）；
- 不能只断言 `.katex` 存在；必须检查真实公式截图与 bounding rect；
- canonical formula 必须作为一个连续的 reader-facing math box，不能被 `break-words`、窄 grid cell 或 flex 压缩成纵向碎片；
- 长公式允许在公式块内部水平滚动，但不得造成 inspector 整体 horizontal overflow；
- 至少验证 `beta^U_gh`、`gamma_g`、open-tail intercept calibration、Original TRACE latent equation / beta prior / alpha calibration、`Sigma_W` normalization。

## 8. Copy quality gate

主 UI 不得依赖重复的模板化说明，例如多项都重复同一句 `New ... structure ...`。必须：

- 每个 Semantic Diff item 的 `Why it matters` 对应具体统计含义；
- Architecture Inspector 的 `Why it matters` 不得以 “N upstream / downstream relations” 或 “sits in the X layer” 作为主要解释；
- stable-facing 页面避免 `Web RC`, `fixture`, `G05`, `source string`, `selected method` 等工程/内部措辞，除非位于 Advanced；
- Lineage relation copy 简短、自然，不在画布上写长句；
- Evidence 状态用研究者自然语言表达，不使用 schema/debug 口吻。

## 9. Final pre-human rule

在再次邀请用户做最终人工验收前，ChatGPT 必须确认：

```text
NO_NODE_OVERLAP = PASS
NO_EDGE_LABEL_CARD_COLLISION = PASS
NO_PRIMARY_TEXT_CLIPPING = PASS
SELECTION_GEOMETRY_STABLE = PASS
MOTION_QUALITY = PASS
MATH_RENDERING_MAIN_UI = PASS
FORMULA_FRAGMENTED_COUNT = 0
COPY_QUALITY_MAIN_UI = PASS
GENERIC_GRAPH_TOPOLOGY_WHY_COUNT = 0
LINEAGE_VISUAL_GRAMMAR = PASS
EVIDENCE_VISUAL_GRAMMAR = PASS
```

任何一项未知或失败，都不能再次声明 `FINAL_HUMAN_ACCEPTANCE = READY`。