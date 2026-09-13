# W06 — RC.7 Release Red-team — Ready-to-Paste GPT Work Prompt

````text
你是 Asteria 2.0 stable 前的独立黑箱 release red-team reviewer。

目标：
https://asteria.httpwwwcardiacnexus-ukb.com/

预期版本：2.0.0-rc.7

这是 RC.7 的 targeted re-audit。不要读取 Asteria repo、旧审计报告或旧截图。只通过普通用户真实 UI 尝试把产品弄进矛盾状态。

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

本轮重点 stress RC.7 改过的 disclosure/export/focus/full-model controls，同时做最小 release-regression smoke。

请执行：

1. Fresh page 确认 `2.0.0-rc.7`、CAT-TRACE Architecture Overview、trace OFF。
2. 选择 Open-tail slope；滚动到 `Advanced / Export & validation`。
3. 用鼠标点击 disclosure 打开/关闭一次；确认 open 后 Markdown / Schema V2 / warnings / preview 可见。
4. 再用 keyboard focus + Enter/Space 打开/关闭一次；expanded/collapsed 状态必须清楚。
5. 在 Advanced 关闭状态点击顶部 `Export`：应自动打开/定位 Export 区，并出现可见反馈，如 `Export tools opened` 或等价；不应自动下载。
6. 切 Full model：Zoom in → pointer drag pan → Fit → Zoom out/Zoom in，确认没有卡死、空画布、不可恢复 transform；回 Overview 后不残留 stale transform。
7. 1366×768 + Light + trace ON 做一次 smoke，确认 UI 仍可操作，没有因 contrast/focus polish 产生新的 stale selection 或错 view。
8. 快速 Architecture → Lineage → Evidence → Architecture 两轮；再切 Original TRACE → CAT-TRACE；确认 inspector/view/model 不串台。
9. Search current/all 各做一次（例如 HMSC / Finland / 不存在字符串）；确认基本 cross-view navigation 未回归。
10. Save view → 改 model/view/theme/trace → Restore；确认主 session 路径仍可恢复。
11. Refresh 一次；确认不回旧 1.x、不出现 startup modal、不出现不可恢复状态。
12. 最后恢复到 CAT-TRACE Architecture Overview + trace OFF，判断普通用户能否自救。

特别关注：
- disclosure 点击无反应；
- Export 没反馈或定位错区域；
- Full-model reading controls 让 canvas transform 卡住；
- focus/skip 改动导致按钮失效；
- 1366 light polish 造成 selection/trace/view state 回归。

不要重新审 CAT-TRACE 科学语义；本轮不是 W02。只有真实 UI 出现明显科学错误时才报告。

最终严格返回：
AUDITOR_ID = W06
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

正文必须列出实际 stress sequence 和截图证据，并包含 Executive summary / Coverage / Findings / Positive observations / Not tested / Browser execution note / Top fixes before stable。
````
