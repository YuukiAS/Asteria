# W06 — RC.10 Release Red-team — Ready-to-Paste GPT Work Prompt

````text
你是 Asteria 2.0 stable 前的独立 release red-team 黑箱 reviewer。

目标：https://asteria.httpwwwcardiacnexus-ukb.com/
预期版本：2.0.0-rc.10

这是 RC.10 broad presentation repair 后的 fresh release-regression audit。不要读取 repo、源码、旧报告、旧截图或实现说明。只通过真实 UI 尝试把产品弄进不一致、不可恢复、视觉破损或 debug 泄漏状态。

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

Release visual rule：Architecture/Lineage/Evidence 如果出现 P2 级 overlap/clipping/graph-grammar/math/copy 问题，本轮必须 FAIL，不能 PASS+P2。

## Stress sequence

1. Fresh page 确认 `2.0.0-rc.10`、CAT-TRACE Architecture Overview、trace OFF。
2. 连续点击 `Open-tail occurrence -> Group open-tail intensity -> Open-tail slope -> Catalogue match`；检查已有节点是否跳位、动画是否僵硬。
3. 开 trace：Direct/Both -> Recursive depth 3 -> Upstream -> Downstream -> Clear -> reopen；确认无 stale highlight/path/reveal。
4. 切 Full model：Zoom in -> Pan -> Fit -> Zoom out/in；1366 与 1536 各看一次，确认无 node overlap、blank canvas、stale transform；回 Overview。
5. 切 Original TRACE -> CAT-TRACE -> Original TRACE -> CAT-TRACE 多轮；重点看 Original TRACE 1366/1536 是否出现 card overlap/clipping。
6. Architecture -> Lineage -> Evidence -> Architecture 循环至少 3 轮；不同节点之间 cross-view link；检查 inspector/view/model 不串台。
7. Lineage 整屏检查：source cards、target safe margin、connector、relation chips；不允许 target clipping、chip collision、粗线汇流结。
8. Evidence 点击 claim / dataset / limitation/pending theorem；检查 why/gap copy 不模板化，pending truth 不变。
9. Semantic Diff 至少看 6 项；数学必须正常渲染，Why it matters 不得统一模板。
10. Advanced / Export：closed -> mouse open/close -> keyboard Enter/Space open/close -> closed 状态点击 top Export；确认 collapsed content 真隐藏，top Export 能打开/定位/反馈且不自动下载。
11. Search：Current view / All graph，各测试 HMSC、Finland、不存在字符串；确认可恢复到 Architecture。
12. Save view -> 改 model/view/theme/detail/trace -> Restore；核心 session 恢复。
13. Refresh；确认仍是 Asteria 2.0 rc.10，无 startup modal、legacy 1.x、不可恢复状态。
14. 最终恢复 CAT-TRACE Architecture Overview + trace OFF，判断普通用户是否可以自救。

## Hard visual checks

请至少给出：

NO_NODE_OVERLAP = PASS | FAIL
NO_EDGE_LABEL_CARD_COLLISION = PASS | FAIL
SELECTION_GEOMETRY_STABLE = PASS | FAIL
MOTION_QUALITY = PASS | FAIL
MATH_RENDERING_MAIN_UI = PASS | FAIL
COPY_QUALITY_MAIN_UI = PASS | FAIL
LINEAGE_VISUAL_GRAMMAR = PASS | FAIL
EVIDENCE_VISUAL_GRAMMAR = PASS | FAIL
RC10_RELEASE_REGRESSION_CLEAN = YES | NO

## Final result

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

正文必须包含 Executive Summary / Coverage / Findings / Positive Observations / Not Tested / Browser Execution Note / Top Fixes Before Stable，并列出完整 stress sequence 与截图证据。
````
