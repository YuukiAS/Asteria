# Asteria GPT Work Parent Acceptance — RC.18

> **这是本轮唯一需要用户复制运行的 GPT Work prompt。**
>
> 不要分别启动 W01 / W05 / W06。它们在本 prompt 内作为独立 reviewer lane 执行，并由父级统一去重、合并 severity、给出 PASS/FAIL 和最小 re-review scope。

````text
你是 Asteria 2.0 RC.18 的独立 GPT Work 父级产品验收者。

TARGET_URL = https://asteria.httpwwwcardiacnexus-ukb.com/
EXPECTED_VERSION = 2.0.0-rc.18

本轮只有一次 GPT Work。你要在同一次 Work 中完成最小 reviewer 集合：

- Reviewer A / W01：Visual + scientific-product design，重点是 Quiet Connector、selection geometry、Full model readability。
- Reviewer B / W05：Responsive + accessibility + dense scientific UI，重点是 1366 light、keyboard/accessibility、Inspector top context。
- Reviewer C / W06：Release red-team / recovery regression，重点是 version/public URL/session/export/restore and no stable-release claim。

如果当前 GPT Work 支持真正独立的并行子任务/子上下文，请让 A/B/C 并行执行，并在三者完成前不要互相暴露结论。
如果不支持并行，则在同一次 Work 中 A -> B -> C 串行执行；每个 lane 开始时重新打开/观察真实 staging 页面，并且不得用前一个 lane 的判断替代本 lane 的重新检查。

你最终只返回一个父级报告。不要要求用户再运行第二个、第三个 prompt。

你不修改产品，不读取 Asteria repo，不读取源码，不读取旧审计报告/旧截图/实现说明。只通过真实 staging UI 判断。

本轮允许知道的背景只有：

- 当前候选应显示为 Asteria 2.0 / 2.0.0-rc.18；
- RC.18 的目标是 Quiet Connector visual system + trace-off selection stability + Full model readable reset；
- CAT-TRACE repository bridge 是 Asteria 侧 schema/validator/synthetic fixture；没有 live GitHub ingestion，不要把“没有 live bridge UI”记作本轮缺陷；
- 本轮没有授权改变 scientific truth、trace algorithm、session contract、Evidence truth 或发布 2.0.0 stable。

==================================================
Browser / UI 黑盒合规规则
==================================================

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

==================================================
共同严重度与通过标准
==================================================

P0：安全/隐私/严重数据或状态错误、产品整体无法打开。
P1：核心流程阻断、错误模型/状态、主要页面不可读/不可操作、版本错误。
P2：普通有经验用户在正常尺度稳定可见、明显降低科研工具成熟度/可读性/一致性的产品级问题。
P3：局部 polish。

核心 Architecture / Lineage / Evidence 若出现以下 P2，相关 reviewer 必须 FAIL，不允许 PASS + unresolved must-fix P2：

- node/card overlap；
- edge / arrow / relation label 覆盖 card 或主文字；
- primary symbol/title clipping；
- selection/trace 导致无意义全图漂移或僵硬 motion；
- 主阅读层 raw math / raw LaTeX；
- 系统性 generic AI copy；
- Lineage/Evidence graph grammar 明显难读；
- trace OFF default canvas 出现“箭头海 / 一排 > / 浮在线上的 relation text”；
- Full model 通过把 37 个节点缩成不可读 miniature 来假装 fit 成功。

父级最终 PASS 必须同时满足：

W01 = PASS
W05 = PASS
W06 = PASS
P0 = 0
P1 = 0
unresolved must-fix P2 = 0

==================================================
Reviewer A / W01 — Visual + scientific-product
==================================================

先做整屏 gestalt，再做 checklist。必须覆盖：

1. Fresh page/profile，确认 visible version = 2.0.0-rc.18。
2. CAT-TRACE Architecture Overview，1536x864，Dark，trace OFF。
3. CAT-TRACE Architecture Overview，1366x768，Light，trace OFF。
4. 连续点击：
   Open-tail occurrence
   -> Group open-tail intensity
   -> Open-tail slope
   -> Catalogue match
   每一步观察 canvas geometry、motion、right Inspector 顶部 context/help。
5. 在 trace OFF 下记录 selection sequence 是否只改变 selected card + Inspector；visible node count、共享 node geometry、edge geometry 不应变化。
6. Open-tail slope + Show trace：检查 active trace edges 是否只有小型 direction terminal，context edges 是否无箭头，是否没有线上 relation prose。
7. Full model + Reset：1536x864 与 1366x768。必须判断它是否是 readable exploration surface，不是 unreadable fit-all miniature。
8. Original TRACE Architecture：1536x864。
9. Lineage：1536x864 与 1366x768。默认应无 arrowhead、无 floating relation chips / edge labels；source card 可有简洁关系摘要。
10. Evidence：1536x864，至少点击 claim / dataset / limitation。默认 ordinary relations 应无 arrowhead、无 inline text；selection 只做 incident-edge emphasis。
11. Semantic Diff / Inspector 至少一屏数学表达式。
12. Advanced / Export 打开关闭一次，只判断是否破坏主 UI。

必须返回：

W01_RESULT = PASS | FAIL | BLOCKED
ARCH_TRACE_OFF_ORDINARY_ARROWHEAD_COUNT = number
ARCH_TRACE_OFF_INLINE_EDGE_LABEL_COUNT = number
ARCH_TRACE_OFF_SELECTION_GEOMETRY_STABLE = PASS | FAIL
ARCH_TRACE_ON_CONTEXT_ARROWHEAD_COUNT = number
ARCH_TRACE_ON_ACTIVE_DIRECTION_TERMINAL = PASS | FAIL
ARCH_FULL_READABLE_RESET = PASS | FAIL
LINEAGE_FLOATING_EDGE_LABEL_COUNT = number
LINEAGE_DEFAULT_ARROWHEAD_COUNT = number
EVIDENCE_FLOATING_EDGE_LABEL_COUNT = number
EVIDENCE_DEFAULT_ORDINARY_ARROWHEAD_COUNT = number
NO_NODE_OVERLAP = PASS | FAIL
NO_PRIMARY_TEXT_CLIPPING = PASS | FAIL
MOTION_QUALITY = PASS | FAIL
MATH_RENDERING_MAIN_UI = PASS | FAIL

==================================================
Reviewer B / W05 — Responsive + accessibility
==================================================

必须 fresh re-observe，不得直接复用 W01 结论。

核心状态：

viewport = 1366x768
Theme = Light
View = Architecture
Model = CAT-TRACE Frozen V2
Detail = Overview

执行：

1. Fresh load，确认 version 2.0.0-rc.18。
2. Keyboard Tab 从首屏开始，确认 skip links、topbar actions、view controls、search/select 不被遮挡。
3. Architecture trace OFF：连续选择至少 3 个 nodes，确认 right Inspector top context/help 可见且 selection 不重排 canvas。
4. Show trace，切换 trace direction/depth；确认 active path 可读、context muted 仍可读、不出现默认箭头海。
5. Full model + Reset：确认 controls 可见、按钮文字不溢出、pan/zoom 语义可理解。
6. Lineage 1366 light：确认 cards、source summaries、connector endpoints 和 Inspector 不挤压。
7. Evidence 1366 light 或 dark：确认 claim/dataset/limitation selection 后 Inspector 可读。

必须返回：

W05_RESULT = PASS | FAIL | BLOCKED
VERSION_VISIBLE = PASS | FAIL
RESPONSIVE_1366_MAIN_SURFACES = PASS | FAIL
KEYBOARD_ACCESSIBILITY = PASS | FAIL
INSPECTOR_TOP_CONTEXT_VISIBLE = PASS | FAIL
BUTTON_TEXT_OVERFLOW_COUNT = number
READING_CONTROLS_USABLE = PASS | FAIL

==================================================
Reviewer C / W06 — Release red-team / recovery regression
==================================================

必须 fresh re-observe，不得直接复用 W01/W05 结论。

执行：

1. Fresh load fixed public URL，确认 version 2.0.0-rc.18，不得显示 2.0.0 stable。
2. 只通过 UI 检查 Architecture / Lineage / Evidence 基础导航。
3. Save view state -> 改变 view/selection -> Restore view state，确认不会破坏 RC18 quiet graph grammar。
4. Export / Advanced disclosure 打开关闭，不应把 debug/schema 文本塞进主阅读层。
5. Search current/all graph 至少一次；确认结果打开对应 UI surface。
6. Browser fallback 若需要可用，但不得读取源码或直接 API。

必须返回：

W06_RESULT = PASS | FAIL | BLOCKED
FIXED_PUBLIC_URL_OPEN = PASS | FAIL
VERSION_RC18_NOT_STABLE = PASS | FAIL
NAVIGATION_ARCH_LINEAGE_EVIDENCE = PASS | FAIL
SAVE_RESTORE_SESSION = PASS | FAIL
EXPORT_DISCLOSURE_SAFE = PASS | FAIL
SEARCH_FLOW = PASS | FAIL
SCIENTIFIC_TRUTH_SUSPECTED_CHANGE = YES | NO

==================================================
父级汇总要求
==================================================

父级必须：

1. 等 A/B/C 都完成。
2. 去重 findings。
3. 合并 severity：同一问题按最高 severity。
4. 明确每个 P2 是 must-fix 还是 accepted/deferred。默认视觉核心 P2 是 must-fix，除非有非常具体的产品理由。
5. 给出 FINAL_PARENT_RESULT = PASS | FAIL | BLOCKED。
6. 如果 FAIL，给出最小 re-review scope，不要默认要求 W01/W05/W06 全部重跑：
   - only W01 if pure visual graph grammar / Full model issue；
   - only W05 if pure responsive/accessibility issue；
   - only W06 if pure public/session/recovery issue；
   - W01+W05 only if visual issue is viewport/responsive-dependent；
   - W01+W06 only if fix touches public release surface and visual grammar；
   - full A/B/C only if fix changes shared architecture/session/theme/navigation behavior.

最终报告格式：

FINAL_PARENT_RESULT = PASS | FAIL | BLOCKED
W01_RESULT =
W05_RESULT =
W06_RESULT =
P0_COUNT =
P1_COUNT =
UNRESOLVED_MUST_FIX_P2_COUNT =
BLACK_BOX_CONTEXT_CONTAMINATED = YES | NO
BLOCKED_BY_BROWSER_ENVIRONMENT = YES | NO
MINIMUM_RE_REVIEW_SCOPE =

FINDINGS:
- [severity] [lane(s)] title
  Evidence:
  Impact:
  Required fix or accepted/deferred rationale:

SCREENSHOT_EVIDENCE:
- list screenshots captured or observed, with viewport/theme/state
````
