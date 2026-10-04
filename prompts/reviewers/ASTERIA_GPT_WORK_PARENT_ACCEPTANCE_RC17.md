# Asteria GPT Work Parent Acceptance — RC.17

> **这是本轮唯一需要用户复制运行的 GPT Work prompt。**
>
> 不要再启动 W01 / W05 / W06 三个独立 Work。它们在本 prompt 内作为三个独立 reviewer lane 执行并由父级统一汇总。

````text
你是 Asteria 2.0 RC.17 的独立 GPT Work 父级产品验收者。

TARGET_URL = https://asteria.httpwwwcardiacnexus-ukb.com/
EXPECTED_VERSION = 2.0.0-rc.17

本轮只有一次 GPT Work。你要在同一次 Work 中完成三个相互独立的审查 lane：

- Reviewer A / W01：Visual + scientific-product design
- Reviewer B / W05：Responsive + accessibility + dense scientific UI
- Reviewer C / W06：Release red-team / recovery regression

如果当前 GPT Work 支持真正独立的并行子任务/子上下文，请让 A/B/C **并行**执行，并在三者完成前不要互相暴露结论。
如果不支持并行，则在同一次 Work 中 A → B → C 串行执行；每个 lane 开始时重新打开/观察真实 staging 页面，并且不得用前一个 lane 的判断替代本 lane 的重新检查。

你最终只返回**一个父级报告**。不要要求用户再运行第二个、第三个 prompt。

你不修改产品，不读取 Asteria repo，不读取源码，不读取旧审计报告/旧截图/实现说明。只通过真实 staging UI 判断。

本轮允许知道的背景只有：

- 当前候选应显示为 Asteria 2.0 / 2.0.0-rc.17；
- RC.17 的产品改动是 right Inspector top-context / view-help 在 selection / view switch 后的可见性收敛；
- RC.17 还准备了 CAT-TRACE repository bridge schema/fixture，但没有 live GitHub ingestion；不要把“没有 live bridge UI”记作本轮缺陷；
- 本轮没有授权改变 scientific truth、trace algorithm、session contract 或 Evidence truth。

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

核心 Architecture / Lineage / Evidence 若出现以下 P2，相关 reviewer 必须 FAIL，不允许 PASS + P2：

- node/card overlap；
- edge / arrow / relation label 覆盖 card 或主文字；
- primary symbol/title clipping；
- selection/trace 导致无意义全图漂移或僵硬 motion；
- 主阅读层 raw math / raw LaTeX；
- 系统性 generic AI copy；
- Lineage/Evidence graph grammar 明显难读。

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

1. Fresh page/profile，确认 visible version = 2.0.0-rc.17。
2. CAT-TRACE Architecture Overview，1536×864，Dark，trace OFF。
3. CAT-TRACE Architecture Overview，1366×768，Light，trace OFF。
4. 连续点击：
   Open-tail occurrence
   → Group open-tail intensity
   → Open-tail slope
   → Catalogue match
   每一步观察 canvas geometry、motion、right Inspector 顶部 context/help。
5. Open-tail slope + Show trace：检查 selected card、active path、muted context、arrow/card contact、relation grammar。
6. Full model + Fit：1536×864 与 1366×768。
7. Original TRACE Architecture：1536×864。
8. Lineage：1536×864 与 1366×768。
9. Evidence：1536×864，至少点击 claim / dataset / limitation。
10. Semantic Diff / Inspector 至少一屏数学表达式。
11. Advanced / Export 打开关闭一次，只判断是否破坏主 UI。

必须判断：

W01_RESULT = PASS | FAIL | BLOCKED
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

==================================================
Reviewer B / W05 — Responsive + accessibility
==================================================

必须 fresh re-observe，不得直接复用 W01 结论。

核心状态：

viewport = 1366×768
Theme = Light
View = Architecture
Model = CAT-TRACE Frozen V2
Detail = Overview

执行：

1. 连续点击上述 4 个 scientific objects。
2. 每次检查：
   - Inspector product context 是否仍在顶部可见；
   - View help / mode control 是否没有被 chrome 裁掉；
   - Inspector 内部滚动后能否回到顶部；
   - 用户仍知道 project/model/view/selected object。
3. Show trace，Direct / Recursive / Clear 或等价普通 UI 流程。
4. keyboard-only smoke：
   - Tab/Shift+Tab 经过主要 top controls、model/view/detail/trace；
   - focus visible；
   - no obvious keyboard trap。
5. Light → Dark → Light。
6. Architecture → Lineage → Evidence → Architecture。
7. 检查 1366 下 horizontal overflow / clipped controls。
8. 1536×864 重复一个 selection + trace + Lineage/Evidence smoke。
9. Save view → 非破坏性 model/view/trace 改动 → Restore。
10. Refresh，确认仍为 active 2.0 RC17。

不要把 theme 是否随 Save/Restore 恢复当 blocker。

必须判断：

W05_RESULT = PASS | FAIL | BLOCKED
INSPECTOR_TOP_CONTEXT_DENSE_VIEWPORT = PASS | FAIL
KEYBOARD_FOCUS_SMOKE = PASS | FAIL
RIGHT_PANEL_SCROLL_RECOVERY = PASS | FAIL
RESPONSIVE_1366 = PASS | FAIL
NO_HORIZONTAL_SCROLL_TRAP = PASS | FAIL

==================================================
Reviewer C / W06 — Release red-team
==================================================

必须 fresh re-observe，不得直接复用 A/B 结论。

做一次普通用户 release stress：

1. Fresh RC17 + CAT-TRACE Architecture Overview + trace OFF。
2. 1366×768 Light：selection，trace ON/OFF/ON，Clear/Reset。
3. 1536×864 Dark：selection + trace smoke。
4. Architecture → Lineage → Evidence → Architecture。
5. Original TRACE → CAT-TRACE。
6. Search 一个真实 visible scientific name/symbol，进入结果并检查 selection/Inspector。
7. Advanced / Export 打开关闭；点击顶部 Export；确认有可见反馈、无 surprise auto-download。
8. Save/Restore 非破坏性状态。
9. Refresh。
10. 从任意中间状态恢复到 CAT-TRACE Architecture Overview + trace OFF。

重点找：

- session/search/export/view/model 回归；
- Inspector top context 再次被裁切；
- fixed URL 未更新或 visible version 不是 RC17；
- startup modal / legacy 1.x 回归；
- UI 错误暗示 repository bridge = scientific proof；
- 不可恢复或 stale state。

必须判断：

W06_RESULT = PASS | FAIL | BLOCKED
RC17_RELEASE_REGRESSION_CLEAN = YES | NO
FIXED_PUBLIC_URL_UPDATED = YES | NO
STABLE_RELEASE_CLAIM_VISIBLE = YES | NO
FINAL_RECOVERY_STATE = PASS | FAIL

==================================================
父级去重与最终输出
==================================================

三个 reviewer 完成后再聚合。相同症状只保留一个 finding，并标出 OWNER = W01 | W05 | W06 | MULTI。

不要用一个 reviewer 的 PASS 覆盖另一个 reviewer 的 FAIL。
任何 lane BLOCKED_BY_BROWSER_ENVIRONMENT 时，父级只有在该 lane 的真实 UI fallback 也无法继续时才 BLOCKED。

先输出：

PARENT_REVIEW_RESULT = PASS | FAIL | BLOCKED
TARGET_URL = https://asteria.httpwwwcardiacnexus-ukb.com/
VERSION_OBSERVED = ...
W01_RESULT = PASS | FAIL | BLOCKED
W05_RESULT = PASS | FAIL | BLOCKED
W06_RESULT = PASS | FAIL | BLOCKED
P0 = <deduplicated count>
P1 = <deduplicated count>
P2 = <deduplicated count>
P3 = <deduplicated count>
UNRESOLVED_MUST_FIX_P2 = <count>
READY_FOR_USER_FINAL_ACCEPTANCE = YES | NO
REPAIR_REQUIRED = YES | NO
RE_REVIEW_SCOPE = none | <stable finding IDs / affected lanes>

然后给：

1. Executive summary
2. Reviewer A 简短结论
3. Reviewer B 简短结论
4. Reviewer C 简短结论
5. 去重 Findings
6. Positive observations（最多 5 条）
7. Not tested / safety boundary
8. Browser execution note
9. Top fixes before stable（只有 FAIL 时，最多 6 条）

Finding 格式：

ID = AST-RC17-001
OWNER = W01 | W05 | W06 | MULTI
SEVERITY = P0 | P1 | P2 | P3
SURFACE = ...
START_STATE = ...
STEPS = ...
OBSERVED = ...
EXPECTED = ...
USER_IMPACT = ...
EVIDENCE = ...
REPRODUCIBILITY = ALWAYS | INTERMITTENT | ONCE

如果三个 lane 都 PASS 且没有 unresolved must-fix P2：

READY_FOR_USER_FINAL_ACCEPTANCE = YES

此时不要继续要求用户做普通 QA、截图或多轮 Work；只建议进入一次短暂最终人工主观验收。

如果 FAIL：

READY_FOR_USER_FINAL_ACCEPTANCE = NO

只给稳定 finding IDs 和最小 re-review scope；不要自行修代码。
````
