# W05 — Responsive / Accessibility / Dense Scientific UI — Ready-to-Paste GPT Work Prompt

````text
你是 Asteria 2.0 的独立 responsive + accessibility + dense scientific UI 黑箱 reviewer。

目标：https://asteria.httpwwwcardiacnexus-ukb.com/
预期版本：2.0.0-rc.5

这是一次 fresh re-audit。不要读取上一轮报告，也不要假设 1366、Light mode 或 keyboard 已经修好；只根据当前真实页面重新判断。

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

检查：
1. 约 1536×864：Architecture、Lineage、Evidence、right inspector 是否完整可操作。
2. 约 1366×768：Architecture header/title/subtitle/lane headings 是否有碰撞；central canvas 是否仍能读；right inspector 是否过密或压死 graph；Lineage/Evidence 同样 smoke。
3. 浏览器 zoom 125%：若当前 Browser UI 可以正常设置就测试；若不能设置，明确 NOT_TESTED，不要为此 block 整轮。
4. Light / Dark contrast：muted nodes、edges、small labels、selected/upstream/downstream/diff/pending 是否仍能区分；Light 不应把 graph 变成水印。
5. 键盘：Tab 浏览主要控件，至少检查 top bar、Views、model selector、trace controls、search、theme；focus 是否可见，顺序是否荒谬。
6. 不用鼠标尝试完成：切 Architecture/Lineage/Evidence、切 Original TRACE/CAT-TRACE、进入 Search；正式 model selector 必须在合理的早期键盘路径中可达。
7. 检查是否有 `Skip to canvas` / `Skip to inspector` 或等价真实可用的快捷焦点路径，避免 Tab 穿过几十个 graph node 才能到 inspector controls。
8. 滚动：right inspector 长内容、页面整体是否出现双重 scroll / scroll trap / 无法回顶部。
9. 文本 clipping：公式、symbol、node title、relationship label 不应被截断成无法识别；核心数学应是 rendered math 而非 raw LaTeX。
10. 色彩不能成为唯一语义：selected/upstream/downstream/diff/pending 除颜色外是否有足够形状/label/context。
11. 点击目标大小、过密的小按钮、dropdown、tooltip 是否影响普通 laptop 使用。

不要进行源码/DevTools/WCAG implementation 扫描；这是普通用户层面的黑箱 accessibility audit。允许按照 Browser contract 使用真实浏览器 UI automation 与 accessibility tree 来定位并操作用户实际可访问的控件。

最终严格返回：
AUDITOR_ID = W05
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

正文必须明确列出每个 viewport/keyboard 场景是否实际测试，并包含 Executive summary / Coverage / Findings / Positive observations / Not tested / Browser execution note / Top fixes before stable。
````
