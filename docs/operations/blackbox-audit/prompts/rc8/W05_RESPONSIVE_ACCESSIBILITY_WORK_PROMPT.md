# W05 — RC.8 Responsive / Accessibility — Ready-to-Paste GPT Work Prompt

````text
你是 Asteria 2.0 的独立 responsive + accessibility + dense scientific UI 黑箱 reviewer。

目标：
https://asteria.httpwwwcardiacnexus-ukb.com/

预期版本：2.0.0-rc.8

这是 RC.8 的 targeted re-audit。不要读取 Asteria repo、旧审计报告、旧截图或旧 reviewer 结论。必须 fresh start。

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

本轮只验证 RC.8 唯一 must-fix finding，不重新做完整 W05。

必须执行 exact hard state：

1. fresh page/profile 打开目标站点，确认 visible version = `2.0.0-rc.8`。
2. viewport 调整为约 `1366×768`。
3. View = Architecture。
4. Model = CAT-TRACE Frozen V2。
5. Detail = Overview。
6. Theme = Light。
7. 选择 `Catalogue match`；如果正常 UI 中该节点难以准确选择，可选择另一个具有明确上下游关系的核心节点，但报告中写明实际对象。
8. 打开 `Show trace`。
9. 在真实页面判断：
   - muted node 的 symbol / short label 是否容易辨认；
   - muted relation lines 是否仍能看出连接方向/走向；
   - muted relation/context labels 是否仍接近 watermark；
   - selected/upstream/downstream path 是否明显强于 muted context；
   - upstream/downstream 的非纯颜色 cue 是否仍然存在；
   - active/selected relation labels 是否清楚，没有被 muted group opacity 二次淡化。
10. 保存/描述这一 exact Light trace-ON 状态截图。
11. 保持同一选择与 trace，切 Dark，保存/描述对照截图；确认 RC.8 没把 dark graph 整体变重或层级打平。
12. 最后做一个最小 smoke：trace OFF → ON、Light → Dark → Light，页面应保持可操作，无 blank canvas / stale highlight。

判定重点：
- 这次不是要求 muted context 与 active path 一样强；
- muted context 可以退后，但必须是“次要且可读”，不能是“接近水印、需要费力猜”；
- active path 必须继续明显主导；
- 只有这个 exact finding 是否关闭，决定本轮 W05 PASS/FAIL。

不要因为未测试 125% zoom 而 FAIL；本轮不要求 125% zoom。
不要重新审科学语义、session、search、Full-model controls、Lineage/Evidence。

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

正文至少包含 Executive summary / Coverage / Findings / Positive observations / Not tested / Browser execution note / Top fixes before stable，并明确回答：`RC8_LIGHT_TRACE_FINDING_CLOSED = YES | NO`。
````
