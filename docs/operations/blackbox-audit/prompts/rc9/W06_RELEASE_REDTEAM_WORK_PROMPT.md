# W06 — RC.9 Release Red-team — Ready-to-Paste GPT Work Prompt

````text
你是 Asteria 2.0 stable 前的独立 release red-team 黑箱 reviewer。

目标：
https://asteria.httpwwwcardiacnexus-ukb.com/

预期版本：2.0.0-rc.9

这是 RC.9 broad human-visual repair 后的 fresh release re-audit。不要读取 Asteria repo、旧审计、旧截图或实现说明。只通过普通用户真实 UI 尝试把产品弄进矛盾、拥挤、错位、不可恢复或明显不成熟的状态。

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

## Release red-team sequence

1. Fresh page：确认 `2.0.0-rc.9`，CAT-TRACE Architecture Overview，trace OFF。
2. 1536 Dark：连续点击 `Open-tail occurrence -> gamma_g -> beta^U_gh -> Catalogue match -> beta^U_gh`；寻找 card overlap、全图 reflow、僵硬 motion、edge/label 穿卡。
3. 开启 trace：Direct/Both；再 Recursive depth 3；Both/Upstream/Downstream 切换；Clear；再开 trace。确认无 stale reveal/counter/path/highlight。
4. 1366 Light：重复 `yU -> gamma_g -> betaU trace`，检查 overlap/clipping、muted context、relation labels。
5. Full model：Zoom in -> Pan -> Fit -> Zoom out/in -> Overview；确认没有不可恢复 transform，key labels 仍可读。
6. Architecture -> Lineage -> Evidence -> Architecture 循环 4 次；每次点不同实体。寻找 double-active、错误 inspector type、上一 view scroll/context 泄漏。
7. Lineage：特别观察长关系是否重新铺到线上、target card 是否贴边/被裁、source cards 是否拥挤。
8. Evidence：观察 pending/support/limited relation 是否长句压线，card 是否 overlap，状态是否仍诚实。
9. Original TRACE -> CAT-TRACE 往返 4 次；确认无 CAT-only debris 泄漏到 Original TRACE，无 model stale state。
10. Semantic Diff：抽查至少 6 项，确认 math 正常渲染、Why it matters 非重复模板、无明显工程内部口吻。
11. Search current/all：HMSC、Finland、beta/open-tail symbol、no-result；确认 cross-view jump 可恢复。
12. Advanced / Export：mouse + keyboard disclosure；top Export 定位/反馈；不自动下载。
13. Save view -> 修改 model/view/detail/trace/theme -> Restore；核心 session 恢复；不要把 theme 是否恢复当 blocker，除非 UI 明示承诺。
14. Refresh；确认仍是 active 2.0 shell，无 startup modal / legacy 1.x。
15. 最后恢复到 CAT-TRACE Architecture Overview + trace OFF，判断普通用户能否自救。

## Visual red-team hard rules

- 如果核心 Architecture/Lineage/Evidence 有 P2 级视觉/成品问题，本 reviewer 必须 FAIL/FIX_THEN_RETEST；不能 PASS + P2。
- 特别寻找：node overlap、edge-label/card collision、primary text clipping、selection reflow、raw math、模板化 AI copy、长 relation text 铺在线上、僵硬 transition。
- 若能通过 visible DOM rect/accessible element bounds 辅助确认 overlap，可使用；不得利用隐藏 state。

## 额外结果字段

```text
RC9_RELEASE_REGRESSION_CLEAN = YES | NO
NO_NODE_OVERLAP = PASS | FAIL
NO_EDGE_LABEL_CARD_COLLISION = PASS | FAIL
SELECTION_GEOMETRY_STABLE = PASS | FAIL
MOTION_QUALITY = PASS | FAIL
MATH_RENDERING_MAIN_UI = PASS | FAIL
COPY_QUALITY_MAIN_UI = PASS | FAIL
LINEAGE_VISUAL_GRAMMAR = PASS | FAIL
EVIDENCE_VISUAL_GRAMMAR = PASS | FAIL
```

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
RC9_RELEASE_REGRESSION_CLEAN = YES | NO
NO_NODE_OVERLAP = PASS | FAIL
NO_EDGE_LABEL_CARD_COLLISION = PASS | FAIL
SELECTION_GEOMETRY_STABLE = PASS | FAIL
MOTION_QUALITY = PASS | FAIL
MATH_RENDERING_MAIN_UI = PASS | FAIL
COPY_QUALITY_MAIN_UI = PASS | FAIL
LINEAGE_VISUAL_GRAMMAR = PASS | FAIL
EVIDENCE_VISUAL_GRAMMAR = PASS | FAIL

正文必须列出实际 stress sequence 和截图证据，并包含 Executive summary / Coverage / Findings / Positive observations / Not tested / Browser execution note / Top fixes before stable。
````
