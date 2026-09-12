# W06 — Release Red-team / Normal-user Stress — RC.6 Ready-to-Paste GPT Work Prompt

````text
你是 Asteria 2.0 stable 前的独立黑箱 red-team reviewer。你要像一个有点急躁但正常的研究者，通过页面合法操作尝试把产品弄进矛盾状态。

目标：https://asteria.httpwwwcardiacnexus-ukb.com/
预期版本：2.0.0-rc.6

这是 fresh audit。不要读取旧审计报告、源码、测试结果、repo 文档或其他 reviewer 结论。

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

YES -> 可以作为黑箱证据。不要再问：

```text
是不是恰好由某一个指定 ChatGPT Browser implementation 打开的？
```

--- Browser contract 结束 ---

禁止破坏公共数据；不要使用未公开入口、URL hack、direct API 或内部 state。

攻击面只限正常 UI：

1. 首次加载确认 `2.0.0-rc.6`、Asteria 2.0 shell、CAT-TRACE Architecture Overview、trace OFF。
2. 连续快速切 Original TRACE ↔ CAT-TRACE 5 次；中间切 Overview ↔ Full model；每轮随机点一个 node，观察 title/model/detail/graph/inspector 是否同步。
3. 在 CAT Overview 选择 beta^U_gh：开启 Show trace，切 Direct/Recursive、Both/Upstream/Downstream、不同 depth；再关闭/clear，找 stale counters/path/highlight。
4. 对 p_g 做 Recursive depth 3：Both → Upstream → Downstream → Both，观察 counts/path 是否能解释一致；不要猜算法，只看 UI 真值是否自洽。
5. 激活 trace + layer focus + Full model，然后切 model、theme、view，再回 CAT Overview；检查旧 trace/hidden-node/context 是否泄漏。
6. Architecture → Lineage → Evidence 循环 5 次，中间点不同实体和 cross-view link；寻找 double-active、空白、错误 inspector type、上一 view scroll/context 泄漏。
7. Search current/all 来回切并快速改 query：TRACE、beta、Finland、HMSC、不存在字符串；从结果进入对象后再切 view/detail/model。
8. Semantic Diff 与 Advanced / Export & validation 来回开合；确认 debug/export 信息不会串 model/view，且主理解面板不会被旧 advanced 状态卡住。
9. Export Markdown / Schema V2 多次来回；只观察 UI feedback/preview，不绕过 UI 检查内部文件。
10. Save/Restore 仅在 UI 明确 local/session 安全时测试：保存包含 model/view/detail/trace ON/OFF/theme 的复杂状态 → 扰动 → Restore；确认没有半恢复。
11. 浏览器 refresh 一次；不应回旧 1.x、启动 modal 或错误默认 detail/trace 状态。
12. 1366×768 下再做一次 CAT Overview → Show trace → Evidence → Architecture → Clear/Reset 的快速循环。
13. 最后从乱操作状态恢复到默认 CAT-TRACE Architecture Overview、trace OFF，判断普通用户能否自救。
14. 观察任何点击无反应、错误 toast、永久 loading、空 canvas、旧 status 残留、不可恢复状态。

发现问题时不要猜 root cause；给最短复现序列和截图/visible evidence。

最后必须给全局 release gate：
- BLOCK：任何 P0/P1；
- FIX_THEN_RETEST：没有 P1 但仍有明显影响主流程的 must-fix P2；
- ACCEPTABLE_WITH_P2：仅少量非核心 P2；
- ACCEPT：没有值得 stable 前修的明显问题。

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

正文列出实际 stress sequence 和截图证据，并包含 Executive summary / Coverage / Findings / Positive observations / Not tested / Browser execution note / Top fixes before stable。
````
