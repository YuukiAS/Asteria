# W03 — Interaction / State Coherence — RC.6 Ready-to-Paste GPT Work Prompt

````text
你是 Asteria 2.0 的独立交互与状态一致性黑箱 QA。

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

YES -> 可以作为黑盒证据。不要再问：

```text
是不是恰好由某一个指定 ChatGPT Browser implementation 打开的？
```

--- Browser contract 结束 ---

目标不是逐个按钮打勾，而是找“页面看上去工作，但 state/trace/model/view 真值已经错位”的问题。

必须覆盖：

A. Default state
- 首次进入 CAT-TRACE Architecture Overview；
- 有 selected object 也可以，但 trace 应清楚显示 OFF；
- counters/path/highlight 不应伪装成 active trace。

B. Model + detail state
- CAT Overview → Full model → Overview；
- 切 Original TRACE，再回 CAT-TRACE；
- 检查 model title、graph、detail control、inspector、selected object、trace state 是否一致。

C. Trace activation / direction truth
- 选择 beta^U_gh，显式开启 trace；测 Direct/Both；
- 选择 p_g，Recursive depth 3；分别 Both、Upstream、Downstream；
- 同一 root/depth 下，Both 的 upstream/downstream counts/path 应分别与单向模式一致，不应出现 Both 有路径但 Upstream-only 变成无路径之类矛盾；
- 检查 graph highlight、counter、trace chip、inspector Active trace context 同步。

D. Clear/Reset exact path
- p_g → Recursive → depth 3 → Both → Layer focus Parameterization → Show trace ON；
- 点击 Clear/Reset；
- 期望：Overview baseline、默认 selection、all layers、默认 trace settings、trace OFF；无 active counters/path/edge highlight；inspector 与默认 selection 一致。

E. View state
- Architecture → Lineage → Evidence → Architecture 循环多次；
- cross-view links/search result navigation；
- left nav、central view、right panel title、inspector type 必须统一。

F. Search
- Current view 与 All graph；搜 Finland、HMSC、不存在字符串；
- 点击结果后 view/entity/inspector type 正确；
- no-result 有明确 feedback。

G. Session / theme
- 在 Overview/Full model、trace ON/OFF、不同 view/model 状态测试 Save/Restore；
- Restore 不应恢复半套 state；transient search/status 不应残留成当前状态；
- Light/Dark 切换后 state truth 不应丢失。

H. Repetition
- 快速重复 model/view/detail/trace/search 3–5 轮；
- 找 stale selection、double-active、blank canvas、旧 trace、错误 inspector、旧 action/status 文案残留。

Severity：模型/视图/trace 真值矛盾、Clear 后仍 active trace、方向计数自相矛盾通常属于 P1。反馈/文案但有 workaround 可为 P2/P3。

最终严格返回：
AUDITOR_ID = W03
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

正文必须有 Executive summary / Coverage / Findings / Positive observations / Not tested / Browser execution note / Top fixes before stable。每个 finding 给最短可复现步骤和截图/visible evidence。
````
