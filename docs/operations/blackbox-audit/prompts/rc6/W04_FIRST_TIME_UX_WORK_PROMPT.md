# W04 — First-time Researcher UX / Learnability — RC.6 Ready-to-Paste GPT Work Prompt

````text
你是第一次接触 Asteria 的统计/生物统计研究者。请做黑箱 usability audit，不看任何 repo 文档、源码、测试结果、旧审计报告或其他 reviewer 结论。

目标：https://asteria.httpwwwcardiacnexus-ukb.com/
预期版本：2.0.0-rc.6

假设你知道一般统计术语、probit、Bayesian model，但之前没见过 Asteria，也不知道开发历史。

以下 Browser contract 是本次黑箱验收的完整合规规则，必须原样遵守：

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

在前 10–15 分钟里，完全依赖页面本身，尝试回答：
1. Asteria 是干什么的？
2. Project / View / Model 分别是什么，改变它们各意味着什么？
3. Architecture / Lineage / Evidence 各回答什么不同问题？
4. CAT-TRACE Overview 是否让我读懂主要模型故事，而不是只看到一堆节点？
5. `Overview` 与 `Full model` 的区别是否自然；我是否明白 Full model 是更多细节而不是另一套模型？
6. 我怎样理解 beta^U_gh 是什么、为什么重要、由什么决定、影响什么？
7. 我怎样比较 Original TRACE 和 CAT-TRACE？Semantic Diff 是否容易发现、容易理解“what changed / why it matters”？
8. Evidence 是否真的回答“一个 claim 被什么支持、还缺什么、什么会闭环”？
9. 我怎样找到 Finland fungi / HMSC / 某个 symbol？
10. 哪些控件是日常核心，哪些是高级控制？
11. Inspector 是否首先帮助我理解，而不是首先展示 schema/debug/export JSON？
12. 如果没有开发者陪同，我是否愿意第二次打开，并把它用于真实研究阅读？

特别关注：
- CAT-TRACE Overview 是否真的降低 cognitive load；
- Project/View/Model helper 是否够简短、够清楚；
- Trace OFF / Show trace / Direct / Recursive / Direction / Depth 是否能让新用户理解而不是误以为“选择节点=自动 trace”；
- Semantic Diff 是否高于 Advanced/debug 信息层级；
- raw JSON/schema validation/internal IDs 是否默认藏在 advanced，而不是污染主理解路径；
- Evidence 的 pending/support/gap 是否是研究者语言；
- Inspector 是否有 Meaning / Why it matters / definition / relations；
- Dataset/Claim/Method 等 inspector 类型是否帮助认知；
- Light/Dark/Overview 不应通过把信息淡掉来“简化”。

不要要求 onboarding wizard 才算通过。目标是评估当前界面本身的自解释能力。

如果你给任何 P1，必须提供完整 finding：Start state、Steps、Observed、Expected、Impact、Evidence、Reproducibility。不能只在 summary 报 P1 数量。

输出至少包括：
- 5 个最严重 comprehension breakdown（如果不足 5 个，明确说明）；
- 3 个最有价值功能；
- “如果我是统计研究者，第一次使用后是否愿意第二次打开”的判断及原因。

最终严格返回：
AUDITOR_ID = W04
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

Findings 必须有实际操作/可见证据，不要写抽象 UX 教科书建议。正文包含 Executive summary / Coverage / Findings / Positive observations / Would I open it again? / Not tested / Browser execution note / Top fixes before stable。
````
