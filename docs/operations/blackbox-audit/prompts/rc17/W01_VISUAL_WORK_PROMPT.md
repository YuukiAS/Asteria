# W01 - RC.17 Visual / Product Design Targeted Acceptance - Ready-to-Paste GPT Work Prompt

````text
你是 Asteria 2.0 的独立 visual / scientific-product black-box reviewer。

目标：https://asteria.httpwwwcardiacnexus-ukb.com/
预期版本：2.0.0-rc.17

这是 RC.17 的 targeted acceptance，不是完整 W01-W06 六开。不要读取 Asteria repo、源码、旧报告、旧截图、实现说明，也不要参考上一轮 reviewer 结论。只根据真实 staging UI 判断。

本轮背景只允许知道：
- RC.17 保留 RC.16 的 connector-contact visual system。
- RC.17 修复右侧 Inspector top-context 在 selection / view switch 后可能被顶部 chrome 截断的问题。
- RC.17 新增 CAT-TRACE repository bridge schema/fixture，但该 bridge 目前不是用户可见 live ingestion 功能。
- 不能把 implementation binding 当作科学证明；不要审 CAT-TRACE 科学真值。

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

## Visual acceptance hard rules

先做整屏 gestalt review，再做 checklist。核心 Architecture / Lineage / Evidence 的视觉问题如果达到 P2，必须：

```text
AUDIT_RESULT = FAIL
RELEASE_RECOMMENDATION = FIX_THEN_RETEST
```

不得 `PASS + P2` 放行。

必须检查：

- node/card overlap；
- edge/arrow/relation-label 是否穿 card 或遮住内容；
- primary label/symbol 是否完整；
- selection/trace 是否导致已有 nodes 无意义漂移；
- motion 是否克制；
- user-facing math 是否正常；
- graph 是否像科学图，而不是自动 graph engine / hairball；
- Lineage / Evidence graph grammar 是否仍清楚克制；
- 右侧 Inspector 的 product context、view-help、核心 controls 是否完整可见。

## 本轮 mandatory states

1. Fresh page/profile 打开，确认 visible version = `2.0.0-rc.17`。
2. CAT-TRACE Architecture Overview，1536×864，Dark，trace OFF。
3. CAT-TRACE Architecture Overview，1366×768，Light，trace OFF。
4. 连续点击至少 4 个对象：`Open-tail occurrence`、`Group open-tail intensity`、`Open-tail slope`、`Catalogue match`。每次都观察右侧 Inspector 顶部 context/help 是否被截断或半滚出。
5. 选择 `Open-tail slope` 后打开 Show trace，检查 selected card、active path、muted context 和 right Inspector。
6. 切换右侧 view/control 可见状态：Architecture / Lineage / Evidence 三个 first-level views 各观察一次 Inspector 顶部是否完整可见。
7. CAT Full model + Fit，在 1536×864 与 1366×768 都检查整体 graph grammar。
8. Original TRACE Architecture，1536×864，检查模型切换没有让视觉系统退化。
9. Lineage，1536×864 与 1366×768，检查 connector/contact、relation chips、target focus。
10. Evidence，1536×864，至少点击 claim / dataset / limitation 各一个。
11. Semantic Diff / Inspector 中至少一屏包含数学表达式。
12. Advanced / Export 打开关闭一次，只检查 presentation 是否没有遮挡或破坏主 UI。

## 你必须给出的判断字段

```text
RC17_VISUAL_TARGETED_ACCEPTANCE = PASS | FAIL
INSPECTOR_TOP_CONTEXT_VISIBLE = PASS | FAIL
ARCH_OVERVIEW_GESTALT = PASS | FAIL
ARCH_FULL_GESTALT = PASS | FAIL
ORIGINAL_TRACE_VISUAL_REGRESSION = PASS | FAIL
LINEAGE_VISUAL_GRAMMAR = PASS | FAIL
EVIDENCE_VISUAL_GRAMMAR = PASS | FAIL
NO_NODE_OVERLAP = PASS | FAIL
NO_EDGE_LABEL_CARD_COLLISION = PASS | FAIL
NO_PRIMARY_TEXT_CLIPPING = PASS | FAIL
SELECTION_GEOMETRY_STABLE = PASS | FAIL
MOTION_QUALITY = PASS | FAIL
MATH_RENDERING_MAIN_UI = PASS | FAIL
```

## Final result contract

返回：

AUDITOR_ID = W01
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

正文包含 Executive summary / Coverage / Findings / Positive observations / Not tested / Browser execution note / Top fixes before stable。

如果核心 Architecture / Lineage / Evidence 存在 P2 visual defect，AUDIT_RESULT 必须 FAIL。
````
