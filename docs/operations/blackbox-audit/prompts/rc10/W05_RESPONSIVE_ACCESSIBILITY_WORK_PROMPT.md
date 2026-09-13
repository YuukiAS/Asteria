# W05 — RC.10 Responsive / Accessibility — Ready-to-Paste GPT Work Prompt

````text
你是 Asteria 2.0 的独立 responsive / accessibility / dense scientific UI 黑箱 reviewer。

目标：https://asteria.httpwwwcardiacnexus-ukb.com/
预期版本：2.0.0-rc.10

不要读取 repo、源码、旧报告、旧截图或实现说明。所有产品判断来自真实 staging UI。

以下 Browser contract 必须原样遵守：

# UI Black-Box Browser Contract

本文件是 GPT Work 黑盒 UI 审计的唯一 Browser 合规来源。最终发给 GPT Work 的 prompt 必须自动 inline 本文件全文；Work 不需要、也不得访问本仓库来读取它。

## 1. 首选 in-app Browser，但不是唯一合法实现
优先使用 ChatGPT Work 当前提供的 built-in / in-app Browser。如果它能正常完成真实 staging UI 操作，应优先使用。
## 2. 允许真实浏览器 UI fallback
如果 in-app Browser 没有暴露稳定操作接口、无法附着、反复控制失败，可以使用真实浏览器 UI automation fallback，例如 Browser plugin/helper、Playwright / playwright-core、Puppeteer、Chrome / Edge / Chromium、独立临时 browser profile、Node/Python helper script。使用这些工具本身不构成黑箱污染。
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

本轮 hard visual/responsive gate：核心 Architecture/Lineage/Evidence 只要出现 P2 级 overlap/clipping/readability 问题，必须 FAIL，不能 PASS+P2。

## 必须测试

A. CAT-TRACE Overview
- 1536×864 Dark；
- 1366×768 Light；
- 检查 page-level horizontal overflow、inspector/canvas balance、node/card overlap、primary text clipping。

B. CAT-TRACE Full model
- 1366×768 Fit；
- 1536×864 Fit；
- visible card bbox overlap count 必须为 0；
- primary symbol/title/badge 不能被邻卡遮挡；
- Zoom in / Pan / Fit 可用；
- 回 Overview 后无 stale transform。

C. Original TRACE
- 1366×768；
- 1536×864；
- 必须检查 observation/latent/parameterization/inference/target 全部 cards；
- node overlap count = 0；
- primary title clipping = 0。

D. Lineage
- 1366×768 与 1536×864；
- target card 距右边界有明确安全空间，不裁切；
- relation chips 不重叠、不压 card；
- connector 不穿 card 主体；
- source cards 对齐、secondary copy 可读；
- 整屏看起来像克制 provenance diagram，而不是汇流粗线。

E. Evidence
- 1366/1536 smoke；
- claim/proof/dataset/implementation/gap cards 不互压；
- status text 可读，不靠颜色；
- relation text 不遮 card。

F. Keyboard/accessibility
- fresh page 第一/第二 tab stops 仍是 Skip to canvas / Skip to inspector；
- model selector、Search、top actions、View tabs、Full-model controls 可键盘到达；
- focus ring 明确；
- compact top actions accessible names 存在；
- 不出现 scroll trap。

G. Advanced disclosure
- collapsed 时 Markdown / Schema V2 / preview / raw JSON / warnings 不可见；
- mouse / Enter / Space 能打开/关闭；
- top Export 能打开并定位。

125% browser zoom 如果真实 browser UI 可可靠设置则测试；做不到就明确 NOT_TESTED，不因此 block。

## Geometry fields

请尽可能通过真实可见元素的 bounding rect 辅助判断，并最终返回：

NO_NODE_OVERLAP = PASS | FAIL
NO_EDGE_LABEL_CARD_COLLISION = PASS | FAIL
NO_PRIMARY_TEXT_CLIPPING = PASS | FAIL
RESPONSIVE_1366 = PASS | FAIL
KEYBOARD_ACCESS = PASS | FAIL
LINEAGE_VISUAL_GRAMMAR = PASS | FAIL
EVIDENCE_VISUAL_GRAMMAR = PASS | FAIL

## Final result

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

正文必须包含 Executive Summary / Coverage / Findings / Positive Observations / Not Tested / Browser Execution Note / Top Fixes Before Stable，并列出 A-G 实际测试结果。
````
