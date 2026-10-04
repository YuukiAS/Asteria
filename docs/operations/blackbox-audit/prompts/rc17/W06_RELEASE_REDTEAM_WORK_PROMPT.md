# W06 - RC.17 Release Red-team Targeted Acceptance - Ready-to-Paste GPT Work Prompt

````text
你是 Asteria 2.0 stable 前的独立黑箱 release red-team reviewer。

目标：https://asteria.httpwwwcardiacnexus-ukb.com/
预期版本：2.0.0-rc.17

这是 RC.17 的 targeted release-regression acceptance，不是完整 W01-W06 六开。不要读取 Asteria repo、旧审计报告、旧截图或旧 reviewer 结论。只通过普通用户真实 UI 做 fresh stress。

本轮背景只允许知道：
- RC.17 是 release candidate，不是 stable。
- RC.17 修复 right Inspector top-context visibility。
- RC.17 新增 CAT-TRACE repository bridge schema/validator/fixture，但不暴露 live GitHub ingestion，也不改变 scientific truth。

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

请执行：

1. Fresh page/profile 打开，确认 `2.0.0-rc.17`、CAT-TRACE Architecture Overview、trace OFF。
2. 1366×768 Light：选择核心节点，Show trace ON/OFF/ON，Clear/Reset 一次；确认无 blank canvas、无 stale highlight、right Inspector top context 可恢复。
3. 1536×864 Dark：重复一个 selection + trace smoke；确认没有只修 Light/dense viewport。
4. Architecture -> Lineage -> Evidence -> Architecture 一轮；确认 view/inspector/model 不串台。
5. Original TRACE -> CAT-TRACE 一轮；确认 model switch 可恢复。
6. Search：搜索一个 visible scientific symbol/name，进入结果后确认 selection 与 Inspector 匹配。不要用源码或隐藏数据判断。
7. Advanced / Export 打开关闭；点击顶部 Export；确认仍会定位/打开 Export 区并出现可见反馈，不自动下载。
8. Save view -> 做一次非破坏性 model/view/trace 改动 -> Restore；确认主 session 路径可恢复。不要把 theme 是否被 Save/Restore 恢复当 blocker。
9. Refresh 一次；确认仍为 active 2.0 shell、无 startup modal、无 legacy 1.x。
10. 观察普通用户是否能从任意测试中间状态恢复到 CAT-TRACE Architecture Overview + trace OFF。

重点找：
- RC17 fix 导致 session/search/export/view/model 基本流程回归；
- right Inspector context 在真实 red-team flow 中重新被裁掉；
- release candidate 版本错误或 fixed URL 没更新；
- visible UI 暗示 stable 已发布；
- bridge wording 如果出现在 UI 中，不得暗示 CAT-TRACE implementation binding 是 scientific proof。

不要重新审 W02 科学语义，除非真实 UI 明显把 pending/blocker 显示成 completed/proven。不要要求 live GitHub ingestion；本轮 bridge 只是 schema/fixture readiness。

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

正文包含 Executive summary / Coverage / Findings / Positive observations / Not tested / Browser execution note / Top fixes before stable，并明确回答：

```text
RC17_RELEASE_REGRESSION_CLEAN = YES | NO
FIXED_PUBLIC_URL_UPDATED = YES | NO
STABLE_RELEASE_CLAIM_VISIBLE = YES | NO
```
````
