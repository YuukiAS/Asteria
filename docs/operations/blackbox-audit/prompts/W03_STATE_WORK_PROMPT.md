# W03 — Interaction / State Coherence — Ready-to-Paste GPT Work Prompt

```text
你是 Asteria 2.0 的独立交互与状态一致性黑箱 QA。

目标：https://asteria.httpwwwcardiacnexus-ukb.com/
预期版本：2.0.0-rc.5

这是一次 fresh re-audit。不要假设 RC.4 的任何问题已经修好，也不要读取上一轮报告；只根据当前真实页面重新判断。

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

可以自动操作页面；
不能绕过页面。

## 5. DOM / accessibility 边界

允许为了定位真实 UI 控件读取 visible text、role、label、value、checked、disabled、href、select options、当前页面路径和 accessibility tree/index。允许用 selector / role / label / accessibility index 正常操作页面。不得利用隐藏 DOM 数据推导产品事实，也不得直接修改 DOM 代替正常用户操作。

## 6. Screenshot 证据

截图必须来自真实 staging 页面渲染结果。可以由 in-app Browser、Chrome、Edge、Chromium、Playwright 等生成。不要求必须是 founder 当前肉眼看到的那个窗口。

## 7. Browser timeout 与产品 bug 分离

click timeout、fill timeout、navigation wait timeout、Browser handle lost、accessibility snapshot timeout 首先是测试工具问题。发生后必须重新观察真实页面。如果页面实际上已经成功保存/跳转，则继续，不得记成产品缺陷。只有用户页面本身确实表现异常，才能记录 P1/P2/P3。

## 8. Browser fallback 不等于 contamination

使用 Playwright / Chrome / helper / accessibility / selector 本身：

BLACK_BOX_CONTEXT_CONTAMINATED = NO

只有 Work 已经读取普通用户无法看到的内部实现信息，并可能影响后续判断时，才设为 YES。

## 9. 真正的 Browser blocker

不要因为 in-app Browser 一种接口失败就 block。只有：

in-app Browser 无法工作
AND
合理的真实 Browser UI fallback 也无法工作
AND
无法通过任何真实浏览器继续 staging consumer UI

时才：

BLOCKED_BY_BROWSER_ENVIRONMENT

## 10. 最终判据

每一个发现只问：

这个现象是否能够仅通过真实网站的用户界面被观察或触发？

YES -> 可以作为黑盒证据。不要再问：

是不是恰好由某一个指定 ChatGPT Browser implementation 打开的？

--- Browser contract 结束 ---

目标不是逐个按钮打勾，而是找“页面看上去工作，但 state 已经错位”的问题。

请覆盖以下核心路径：

A. Model state
- 默认 CAT-TRACE Frozen V2；
- 切 Original TRACE；
- 选择节点；
- 再切 CAT-TRACE；
- 观察 central graph、标题、model badge、right inspector、selected object、trace control 是否全部同步。

B. View state
- Architecture → Lineage → Evidence → Architecture；
- 左侧一级导航与右侧 view control（若都有）必须保持一致；
- selection/context 不应残留不属于当前 view 的对象；
- cross-view link 若存在，点击后应到正确 view 和合理对象。

C. Trace / layer
- beta^U_gh：Direct/Both；然后 Recursive、depth 3；分别 Upstream/Downstream/Both；
- p_g 做一次 trace；
- Layer focus 选 Parameterization，再 Clear / All layers；
- 检查 node/edge highlight、counter、inspector、selected state 是否一致；没有 stale highlight。
- 特别重新验证 Clear：从 `p_g + Recursive/Both + Parameterization` 点击 Clear 后，selection/trace/layer/counter/chip/inspector 必须同时回到当前 model 的默认可读状态。

D. Search
- current view 搜 beta / Finland / TRACE；
- all graph 搜 Finland / HMSC；
- `Finland` 应有清晰结果并能进入 Evidence；`HMSC` 应能进入 Lineage；
- 不存在字符串应出现明确 empty state；
- 选择结果后检查 actual view/context/nav/inspector 是否同步。

E. Theme
- 在选中 node + trace active 的状态切 Light/Dark，再切 view/model；状态不应丢失或视觉不可读。

F. Export / session
- Export 只做安全读操作，检查 Markdown / Schema V2 的 UI feedback 是否明确；
- Save/Restore 仅在页面明确是 2.0 local/session state 时测试：改变 view/model/trace → Save → 再改变并输入 transient search → Restore，确认核心 session 恢复且 transient search 不留下半恢复错觉。

G. Repetition
- 快速重复 model/view/trace 切换 3–5 轮，找 race/stale selection/double-active/blank canvas/错 inspector；
- 特别观察 right outer panel header 是否与当前 Architecture / Lineage / Evidence 一致。

Severity：model/view/inspector 真值错位通常是 P1；有 workaround 的反馈/状态问题多为 P2。

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

正文必须有 Executive summary / Coverage / Findings / Positive observations / Not tested / Browser execution note / Top fixes before stable，并给逐步复现和截图证据。
```
