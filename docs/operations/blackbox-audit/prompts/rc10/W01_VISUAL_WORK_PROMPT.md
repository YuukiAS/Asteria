# W01 — RC.10 Visual / Scientific Product — Ready-to-Paste GPT Work Prompt

````text
你是 Asteria 2.0 的独立 visual / scientific-product design 黑箱 reviewer。

目标：https://asteria.httpwwwcardiacnexus-ukb.com/
预期版本：2.0.0-rc.10

这是 RC.10 broad visual finish 后的 fresh audit。不要读取 Asteria repo、旧报告、旧截图、实现说明，也不要参考上一轮 reviewer 结论。只根据真实 staging UI 判断。

以下 Browser contract 必须原样遵守：

# UI Black-Box Browser Contract

本文件是 GPT Work 黑盒 UI 审计的唯一 Browser 合规来源。最终发给 GPT Work 的 prompt 必须自动 inline 本文件全文；Work 不需要、也不得访问本仓库来读取它。

## 1. 首选 in-app Browser，但不是唯一合法实现

优先使用 ChatGPT Work 当前提供的 built-in / in-app Browser。如果它能正常完成真实 staging UI 操作，应优先使用。

## 2. 允许真实浏览器 UI fallback

如果 in-app Browser 没有暴露稳定操作接口、无法附着、反复控制失败，可以使用真实浏览器 UI automation fallback，例如 Browser plugin/helper、Playwright / playwright-core、Puppeteer、Chrome / Edge / Chromium、独立临时 browser profile、Node/Python helper script。使用这些工具本身不构成黑箱污染。

## 3. fallback 必须仍然是 UI 黑盒

无论底层 Browser implementation 是什么，最终产品判断必须来自真实 staging 网站、浏览器正常渲染、普通用户可以看到/操作的前端 UI。允许导航、click、fill、select、check、keyboard、scroll、refresh、Back/Forward、截图和正常页面状态观察。

## 4. 严禁绕过 UI

禁止使用 Asteria 源码、GitHub、数据库、管理后台/直接查询、私有 API、direct HTTP API 代替页面流程、DevTools、Network/Console、React/Vue/Next 内部 state、hidden application state、localStorage/sessionStorage/IndexedDB/cookie 中普通 UI 不展示的信息、DOM/state mutation、调用内部 JS function 或绕过 validation。

核心规则：

```text
可以自动操作页面；
不能绕过页面。
```

## 5. DOM / accessibility 边界

允许为了定位真实 UI 控件读取 visible text、role、label、value、checked、disabled、href、select options、当前页面路径和 accessibility tree/index。允许用 selector / role / label / accessibility index 正常操作页面。不得利用隐藏 DOM 数据推导产品事实，也不得直接修改 DOM 代替正常用户操作。

## 6. Screenshot 证据

截图必须来自真实 staging 页面渲染结果。可以由 in-app Browser、Chrome、Edge、Chromium、Playwright 等生成。不要求必须是 founder 当前肉眼看到的那个窗口。

## 7. Browser timeout 与产品 bug 分离

click timeout、fill timeout、navigation wait timeout、Browser handle lost、accessibility snapshot timeout 首先是测试工具问题。发生后必须重新观察真实页面。如果页面实际上已经成功保存/跳转，则继续，不得记成产品缺陷。只有用户页面本身确实表现异常，才能记录 P1/P2/P3。

## 8. Browser fallback 不等于 contamination

使用 Playwright / Chrome / helper / accessibility / selector 本身：

```text
BLACK_BOX_CONTEXT_CONTAMINATED = NO
```

只有 Work 已经读取普通用户无法看到的内部实现信息，并可能影响后续判断时，才设为 YES。

## 9. 真正的 Browser blocker

不要因为 in-app Browser 一种接口失败就 block。只有：

```text
in-app Browser 无法工作
AND
合理的真实 Browser UI fallback 也无法工作
AND
无法通过任何真实浏览器继续 staging consumer UI
```

时才：

```text
BLOCKED_BY_BROWSER_ENVIRONMENT
```

## 10. 最终判据

每一个发现只问：

```text
这个现象是否能够仅通过真实网站的用户界面被观察或触发？
```

YES -> 可以作为黑盒证据。不要再问：

```text
是不是恰好由某一个指定 ChatGPT Browser implementation 打开的？
```

--- Browser contract 结束 ---

以下是本轮视觉成品 gate，必须执行：

# Asteria Visual Acceptance Contract

本合同要求 final visual audit 先做整屏 gestalt review，再做 checklist。必须同时判断 card/node overlap、edge/arrow/relation-label collision、primary symbol/title clipping、selection geometry stability、motion quality、Light/Dark 长时间阅读、main-UI math rendering、AI/internal copy、Architecture/Lineage/Evidence 各自 graph grammar。

核心 Architecture/Lineage/Evidence 若达到 P2 级视觉问题，必须 `FAIL / FIX_THEN_RETEST`，不得 `PASS + P2` 放行。

Mandatory states：
1. CAT-TRACE Architecture Overview，1536×864，Dark，trace OFF；
2. CAT-TRACE Architecture Overview，1366×768，Light，trace OFF；
3. 选择 `Open-tail occurrence` (`y^U_igh`)；
4. 选择 `Group open-tail intensity` (`gamma_g`)；
5. 选择/trace `Open-tail slope` (`beta^U_gh`)；
6. Full model + Fit；
7. Original TRACE Architecture；
8. Lineage；
9. Evidence；
10. Semantic Diff / inspector 中至少一屏包含数学表达式。

Geometry invariants：
- visible node bounding boxes 不得互相覆盖；
- edge/relation-chip 不得覆盖 node/card 主内容；
- primary symbol/title 必须完整可辨；
- selection/trace 前后共享节点应保持稳定位置；
- reveal context 可新增节点，但不得整体重排；
- Lineage/Evidence source/target card 要有安全边距。

Edge/relation-label grammar：
- 禁止 relation type 以大号裸文字压在线条上；
- 默认图不应满屏 relation 文本；
- selected/active trace 只显示少量 concise labels；
- Lineage/Evidence 优先短 chip/legend/inspector；
- arrow/curve 不得穿过 card 主体或 node text。

Motion：
- selection/trace 不应让已有 cards 大范围移动；
- 只允许轻量 opacity/border/background/shadow/stroke 过渡；
- 连续点击至少 3 个节点观察动态，不得只看静态截图。

Math rendering：
- 主阅读层符号/公式/上下标统一数学渲染；
- Semantic Diff、Evidence、Inspector 中的数学也必须渲染；
- `mathcal`, `gamma_`, `beta^`, `p_g^*`, `a_g` 等 raw token 不得作为主显示；
- raw source 只能出现在 Advanced/export/debug。

Copy quality：
- `Why it matters` 不得多项重复 generic 模板；
- stable-facing 页面避免 Web RC / fixture / G05 / canonical source string / selected method 等内部口吻；
- Lineage relation copy 简短自然；
- Evidence 状态用研究者语言。

Final required visual fields：
```text
NO_NODE_OVERLAP
NO_EDGE_LABEL_CARD_COLLISION
NO_PRIMARY_TEXT_CLIPPING
SELECTION_GEOMETRY_STABLE
MOTION_QUALITY
MATH_RENDERING_MAIN_UI
COPY_QUALITY_MAIN_UI
LINEAGE_VISUAL_GRAMMAR
EVIDENCE_VISUAL_GRAMMAR
```

--- Visual acceptance contract 结束 ---

## 本轮必须做的实际检查

A. CAT Architecture Overview
- 1536×864 Dark；
- 1366×768 Light；
- 看整屏，不只看局部；
- 保存截图。

B. 连续 selection / motion
按顺序真实点击：
`Open-tail occurrence -> Group open-tail intensity -> Open-tail slope -> Catalogue match -> Open-tail slope + Show trace`
观察共享节点是否漂移、动画是否僵硬、reveal 是否导致整图重新排。

C. Full model
- 1366×768 Fit；
- 1536×864 Fit；
- 检查所有 visible cards 是否互相覆盖；
- primary symbol/title/badge 是否被邻卡遮挡；
- Zoom/Pan/Fit 是否足以局部阅读。

D. Original TRACE
- 1366×768；
- 1536×864；
- 必须检查 observation/latent/parameterization/inference/target 是否有 overlap、clipping 或 edge 穿卡。

E. Lineage
- 1366×768 与 1536×864；
- 第一眼是否清楚是 source methods -> CAT-TRACE；
- source cards 是否整齐；target 是否留右边距；
- connector 是否细、克制；
- TRACE 的 Extends/Preserves 是否通过 compact relation chips 而不是双粗线/漂浮文字；
- HMSC/bigMVP/MGP relation chips 是否自然附属于 connector；
- 不允许几条线在 target 前汇成粗蓝结；
- 不允许 relation chip/card collision 或 target clipping。

F. Evidence
- 看 claim/proof/dataset/implementation/gap 的视觉区分；
- relation/status 是否短、克制；
- 不允许长句铺在线路上；
- pending/limited 不得只靠颜色。

G. Inspector + Semantic Diff
- 检查 `beta^U_gh`, `gamma_g`, Original TRACE 核心定义；
- 公式是否完整正常 KaTeX 排版，不碎裂、不 uppercase raw ASCII；
- Semantic Diff 至少看 6 项，确认数学正常、Why it matters 每项具体，不是统一 AI 模板。

H. Advanced / Export
- closed 时 raw JSON/schema/warnings 不应继续可见；
- open 时才出现。

## Severity 特别规则

Architecture/Lineage/Evidence 的视觉成品问题如果达到 P2：

```text
AUDIT_RESULT = FAIL
RELEASE_RECOMMENDATION = FIX_THEN_RETEST
```

不能用 `PASS + P2` 绕过。

## 最终返回

AUDITOR_ID = W01
AUDIT_RESULT = PASS | FAIL | BLOCKED
TARGET_URL = https://asteria.httpwwwcardiacnexus-ukb.com/
VERSION_OBSERVED = ...
BROWSER_MODE = IN_APP | UI_AUTOMATION_FALLBACK | MIXED_UI
BLACK_BOX_CONTEXT_CONTAMINATED = YES | NO
BROWSER_BLOCKER = NONE | BLOCKED_BY_BROWSER_ENVIRONMENT
P0_COUNT = ...
P1_COUNT = ...
P2_COUNT = ...
P3_COUNT = ...
RELEASE_RECOMMENDATION = BLOCK | FIX_THEN_RETEST | ACCEPTABLE_WITH_P2 | ACCEPT
NO_NODE_OVERLAP = PASS | FAIL
NO_EDGE_LABEL_CARD_COLLISION = PASS | FAIL
NO_PRIMARY_TEXT_CLIPPING = PASS | FAIL
SELECTION_GEOMETRY_STABLE = PASS | FAIL
MOTION_QUALITY = PASS | FAIL
MATH_RENDERING_MAIN_UI = PASS | FAIL
COPY_QUALITY_MAIN_UI = PASS | FAIL
LINEAGE_VISUAL_GRAMMAR = PASS | FAIL
EVIDENCE_VISUAL_GRAMMAR = PASS | FAIL

正文必须包含 Executive Summary / Coverage / Findings / Positive Observations / Not Tested / Browser Execution Note / Top Fixes Before Stable，并逐一说明 A-H 的实际结果与截图证据。
````
