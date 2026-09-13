# W01 — RC.9 Visual / Scientific Product Design — Ready-to-Paste GPT Work Prompt

````text
你是 Asteria 2.0 stable 前的独立 visual / scientific-product design 黑箱 reviewer。

目标：
https://asteria.httpwwwcardiacnexus-ukb.com/

预期版本：2.0.0-rc.9

这是 RC.9 在最终人工验收失败后的 fresh full re-audit。不要读取 Asteria repo、RC.8/RC.9 implementation report、旧审计报告或旧截图。所有产品判断必须来自真实网站 UI。

以下 Browser contract 必须原样遵守：

# UI Black-Box Browser Contract

本文件是 GPT Work 黑盒 UI 审计的唯一 Browser 合规来源。最终发给 GPT Work 的 prompt 必须自动 inline 本文件全文；Work 不需要、也不得访问本仓库来读取它。

## 1. 首选 in-app Browser，但不是唯一合法实现

优先使用 ChatGPT Work 当前提供的 built-in / in-app Browser。如果它能正常完成真实 staging UI 操作，应优先使用。

## 2. 允许真实浏览器 UI fallback

如果 in-app Browser 没有暴露稳定操作接口、无法附着、反复控制失败，可以使用真实浏览器 UI automation fallback，例如 Browser plugin/helper、Playwright / playwright-core、Puppeteer、Chrome / Edge / Chromium、独立临时 browser profile、Node/Python helper script。使用这些工具本身不构成黑盒污染。

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

以下是本轮新的 Visual Acceptance Contract，必须按成品标准执行，不得只做 checklist：

# Asteria Visual Acceptance Contract

1. 先做整屏 gestalt review，再做逐项测试。必须判断 card/node overlap、edge/arrow/relation label 穿插、主文字 clipping、selection 后无意义 reflow、僵硬 motion、Light/Dark 长时间阅读、主 UI raw math、模板化 AI 语言、Architecture/Lineage/Evidence graph grammar。
2. 核心 Architecture/Lineage/Evidence 的上述问题如果达到 P2，本 reviewer 必须 FAIL/FIX_THEN_RETEST；不得 `PASS + P2` 放行 stable。
3. 必须审查这些状态：
   - CAT-TRACE Architecture Overview 1536×864 Dark trace OFF；
   - CAT-TRACE Architecture Overview 1366×768 Light trace OFF；
   - select Open-tail occurrence `y^U_igh`；
   - select Group open-tail intensity `gamma_g`；
   - select/trace Open-tail slope `beta^U_gh`；
   - Full model + Fit；
   - Original TRACE Architecture；
   - Lineage；
   - Evidence；
   - Semantic Diff / inspector 中至少一屏数学表达式。
4. visible node bounding boxes 不得互相覆盖；edge label 不得覆盖 card 主内容；primary symbol/title 必须完整可辨；selection/trace 前后共享节点必须保持稳定位置；Lineage/Evidence target/source card 要有安全边距。
5. relation label 不得以大号裸文字压在线上；默认图不应满屏 relation 文本；Architecture 仅 selected/active trace 必要状态显示少量 concise relation labels；Lineage/Evidence 长关系应进 inspector/legend 或短 tag。
6. 禁止 graph geometry 使用 `transition: all` 类效果。连续点击至少 3 个不同节点，观察是否只发生轻量 opacity/border/background/stroke 过渡，而不是整张图滑动/跳动。
7. 主阅读区数学必须统一渲染。Semantic Diff、Evidence、Inspector、relation explanation 中不得以 `a_g`, `gamma_0`, `p_g^*`, `mathcal K`, `beta^...` 这类 raw ASCII/LaTeX 作为主显示。
8. Copy quality：不得大量重复 generic 模板句；Semantic Diff 每项 `Why it matters` 要说明具体统计意义；stable-facing 主 UI 避免 `Web RC`, `fixture`, `G05`, `canonical source string`, `selected method` 等工程口吻；Lineage relation copy 要短、自然；Evidence 使用研究者自然语言。
9. 再次进入 human acceptance 前，本轮必须给出：

```text
NO_NODE_OVERLAP = PASS/FAIL
NO_EDGE_LABEL_CARD_COLLISION = PASS/FAIL
NO_PRIMARY_TEXT_CLIPPING = PASS/FAIL
SELECTION_GEOMETRY_STABLE = PASS/FAIL
MOTION_QUALITY = PASS/FAIL
MATH_RENDERING_MAIN_UI = PASS/FAIL
COPY_QUALITY_MAIN_UI = PASS/FAIL
LINEAGE_VISUAL_GRAMMAR = PASS/FAIL
EVIDENCE_VISUAL_GRAMMAR = PASS/FAIL
```

## 必须执行的视觉路径

A. Architecture baseline
- 1536×864 Dark / Overview / trace OFF；整屏审查。
- 1366×768 Light / Overview / trace OFF；整屏审查。
- 核心主故事必须能看到 `Y^raw`, observed covariate vector `x_i`, `c(f)`, `𝒦`, `𝒰`, `y^U_igh`, `z^U_igh`, `alpha^U_gh`, `beta^U_gh`, `gamma_g`, `p_g`, `Sigma_W`, target。

B. Dynamic selection / motion
- 连续点击至少：`Open-tail occurrence` → `Group open-tail intensity` → `Open-tail slope` → `Catalogue match` → Clear → `Open-tail slope` + Show trace。
- 比较共享节点位置；如果整张图明显重新排布、滑动或跳动，记录 finding。
- 检查 reveal context 是否与已有 card overlap。

C. Edges / labels
- selected `y^U_igh`、selected `gamma_g`、trace `beta^U_gh` 三个状态分别检查。
- relation label 不应压在 card/主文字上；arrow/curve 不应穿过 card 主体。
- 默认非 active graph 不应显示满屏 relation text。

D. Full model
- Full model + Fit；接受它更密，但 key node/title 不得被遮住或不可读；Zoom/Fit/Pan 能支持局部阅读。

E. Original TRACE
- graph clean、没有 CAT-only visual debris；与 CAT-TRACE 明显不同但同一产品语言。

F. Lineage
- TRACE / HMSC / bigMVP / MGP / CAT-TRACE card 层级清楚；target 不贴边；关系文字不能横跨整屏曲线；长 provenance 进 inspector/legend。

G. Evidence
- claim/proof/dataset/implementation/gap 容易区分；pending/support/limited 关系不以长句铺在线上；card 不 overlap；没有工程内部命名抢主视觉。

H. Semantic Diff / Inspector
- 数学全部正常渲染；逐项 Why it matters 不是重复模板；检查至少 6 个 diff item。

## 结果规则

最终必须严格返回：

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

正文包含 Executive summary / Coverage / Findings / Positive observations / Not tested / Browser execution note / Top fixes before stable。

如果核心 Architecture/Lineage/Evidence 存在 P2 级 visual/product-quality defect，AUDIT_RESULT 必须 FAIL，不得 PASS + P2。
````
