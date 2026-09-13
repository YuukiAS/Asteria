# W01 — RC.13 Generic Graph Presentation Visual Audit — Ready-to-Paste GPT Work Prompt

````text
你是 Asteria 2.0 的独立 visual / scientific-product black-box reviewer。

目标：https://asteria.httpwwwcardiacnexus-ukb.com/
预期版本：2.0.0-rc.13

这是 RC.13 generic graph-presentation foundation 后的 fresh audit。不要读取 Asteria repo、源码、旧报告、旧截图、实现说明，也不要参考上一轮 reviewer 结论。只根据真实 staging UI 判断。

你的任务不是检查 CAT-TRACE 某几个节点是否“刚好修好”，而是判断当前通用 graph-presentation mechanism 是否已经像成熟 scientific diagram system：layout、routing、boundary ports、fan-in、arrowhead、relation chips、visual hierarchy 是否在不同结构下都成立。

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
- Lineage connector 是否真正落到 target card 边界；
- relation chips 是否明显属于对应 connector，而不是漂浮在附近；
- selected card 是否始终是第一视觉焦点。

## 本轮 mandatory states

### A. CAT Architecture Overview

1. 1536×864 Dark，trace OFF；
2. 1366×768 Light，trace OFF；
3. 连续点击至少：Open-tail occurrence -> Group open-tail intensity -> Open-tail slope -> Catalogue match；
4. Open-tail slope + Show trace；
5. 判断 existing cards 是否稳定、edges 是否出现星爆/hairball、active edge 是否压过 selected card。

### B. CAT Full model

分别在：

- 1536×864；
- 1366×768；

进入 Full model + Fit。

必须判断：

- semantic layers 是否仍形成清楚的 left-to-right locality；
- 是否只是“卡片不重叠，但边乱成一团”；
- edge 是否大量跨越无关 layer/card；
- 是否有 connector 穿第三方 card；
- Fit 后是否仍能理解模型结构，而不是只能靠逐个点击。

### C. Original TRACE smoke

- 1536×864；
- 切 Original TRACE，检查 generic layout/routing 是否同样成立；
- 不允许为了 CAT-TRACE 好看而让另一个 model 回退。

### D. Lineage — 本轮最关键

在 1536×864 与 1366×768 都检查。

必须明确回答：

1. source cards -> CAT-TRACE target 是否一眼清楚；
2. 每一条 connector 的 arrowhead 是否真正触达 target card 左边界，而不是悬在空中；
3. 多个 target ports 是否明显分开，而不是几条线汇到同一点；
4. relation chips 是否跟随/归属于对应 connector；
5. chip 是否漂浮得像独立 annotation；
6. connector 是否穿 source/target card；
7. source 数量为当前 4 个时整体是否自然、克制，不像 Sankey/debug graph；
8. target 是否有足够右侧安全空间。

任何 floating arrowhead / chip-path disconnection / target-port collapse 达到影响读图的 P2，必须 FAIL。

### E. Evidence regression

- 1536×864；
- selected claim / dataset / limitation 至少各点一个；
- 不要求重做 Evidence IA，只检查新 routing foundation 是否让它退化；
- selected claim 应保持主焦点，edge 不抢视觉，support/pending/limitation 仍可辨。

### F. Motion / resize smoke

- 在 Architecture 与 Lineage 中 resize 1536 -> 1366 -> 1536；
- 不允许 connector endpoint 与 card 边界脱节；
- 不允许 relation chip 留在旧位置；
- 不允许图突然大范围跳动。

## 你必须给出的判断字段

```text
GENERIC_GRAPH_PRESENTATION = PASS | FAIL
ARCH_OVERVIEW_GESTALT = PASS | FAIL
ARCH_FULL_LANE_LOCALITY = PASS | FAIL
ARCH_FULL_HAIRBALL = PASS | FAIL
EDGE_CARD_INTERSECTION = PASS | FAIL
FLOATING_ARROWHEAD = PASS | FAIL
TARGET_PORT_SEPARATION = PASS | FAIL
LINEAGE_CONNECTOR_TOUCH_TARGET = PASS | FAIL
LINEAGE_CHIP_PATH_ASSOCIATION = PASS | FAIL
LINEAGE_GESTALT = PASS | FAIL
EVIDENCE_ROUTING_REGRESSION = PASS | FAIL
SELECTION_GEOMETRY_STABLE = PASS | FAIL
MOTION_QUALITY = PASS | FAIL
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

并包含：Executive Summary / Coverage / Findings / Positive Observations / Not Tested / Browser Execution Note / Top Fixes Before Stable。

如果核心 Architecture / Lineage / Evidence 存在 P2 visual defect，AUDIT_RESULT 必须 FAIL。
````
