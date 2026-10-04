# W05 - RC.17 Responsive / Accessibility Targeted Acceptance - Ready-to-Paste GPT Work Prompt

````text
你是 Asteria 2.0 的独立 responsive + accessibility + dense scientific UI 黑箱 reviewer。

目标：https://asteria.httpwwwcardiacnexus-ukb.com/
预期版本：2.0.0-rc.17

这是 RC.17 的 targeted acceptance。不要读取 Asteria repo、源码、旧审计报告、旧截图或旧 reviewer 结论。必须 fresh start，只通过真实页面 UI 判断。

本轮加入 W05 的原因：RC.17 修复了 right Inspector 在 selection / view switch 后的 scroll/top-context 可见性问题，属于 responsive/viewport/keyboard-accessible reading surface 的风险范围。

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

## 本轮 scope

只验证 RC.17 responsive/accessibility 风险，不重新审科学语义。

必须执行：

1. Fresh page/profile 打开目标站点，确认 visible version = `2.0.0-rc.17`。
2. viewport = 1366×768；Theme = Light；View = Architecture；Model = CAT-TRACE Frozen V2；Detail = Overview。
3. 连续点击至少 4 个对象：`Open-tail occurrence`、`Group open-tail intensity`、`Open-tail slope`、`Catalogue match`。每次检查：
   - 右侧 Inspector 的 product context 是否仍在顶部可见；
   - View help / mode control 是否没有被顶部 chrome 裁掉；
   - Inspector 内部滚动是否不会把用户困在下方 content；
   - focus/selection 后用户仍知道当前项目、模型、view、selected object。
4. 同一 viewport 打开 Show trace，再切 Direct / Recursive / Clear 或等价 UI 流程；检查 right Inspector 顶部 context 与 controls 是否可恢复。
5. keyboard-only smoke：用 Tab/Shift+Tab 至少经过 model/view/detail/trace/top-level controls，确认 focus visible、无明显 trap、无不可恢复跳焦。
6. Theme Light -> Dark -> Light，selection 和 right Inspector top context 不应错位或消失。
7. View = Lineage，再 View = Evidence，再回 Architecture；1366×768 下检查 right panel/top controls 没有水平 overflow、遮挡或被截断。
8. viewport = 1536×864；重复一个 selection + trace + Lineage/Evidence smoke，确认修复没有只适配 1366。
9. Save view -> 做一次非破坏性 model/view/trace 改动 -> Restore；确认主 session 路径可恢复。不要把 theme 是否被 Save/Restore 恢复当 blocker。
10. Refresh 一次；确认仍为 active 2.0 shell、版本仍是 RC17。

重点找：
- Inspector top context 在 dense viewport 被截断、遮住、半滚出；
- view/help controls 因 scroll reset 失效而不可恢复；
- keyboard/focus 进入右侧 panel 后无法返回主要 controls；
- 1366×768 Light/Dark 出现 horizontal overflow 或主控件不可操作；
- trace / view switch / restore 导致 right panel stale state。

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

正文至少包含 Executive summary / Coverage / Findings / Positive observations / Not tested / Browser execution note / Top fixes before stable，并明确回答：

```text
RC17_RESPONSIVE_ACCESSIBILITY_TARGETED_ACCEPTANCE = PASS | FAIL
INSPECTOR_TOP_CONTEXT_DENSE_VIEWPORT = PASS | FAIL
KEYBOARD_FOCUS_SMOKE = PASS | FAIL
RIGHT_PANEL_SCROLL_RECOVERY = PASS | FAIL
```
````
