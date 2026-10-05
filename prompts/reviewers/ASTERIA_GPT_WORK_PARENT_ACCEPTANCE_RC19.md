# Asteria GPT Work Parent Acceptance RC19

This is the only user-facing GPT Work prompt for Asteria `2.0.0-rc.19`.

Do not ask the user to launch W01/W05/W06 separately. Run the reviewer lanes below inside this single parent Work. If your environment supports independent parallel subwork, run the lanes in parallel; otherwise run them serially in this same Work, re-observing the live UI at the start of each lane.

## Target

- Product: Asteria
- Candidate: `2.0.0-rc.19`
- URL: `https://asteria.httpwwwcardiacnexus-ukb.com/`
- Required visible version: `2.0.0-rc.19`

You are performing black-box acceptance against the real browser UI. Do not read the repository, source code, GitHub, local files, private APIs, direct HTTP API responses, browser DevTools internals, localStorage, IndexedDB, sessionStorage, cookies, hidden DOM state, React/Vue state, or database/admin surfaces.

## Browser Contract

The following is the full canonical Browser contract for this audit. It is included here so you do not need repository access.

````text
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
````

## Parent Coordination Rules

1. Produce one consolidated result for this parent Work.
2. Each reviewer lane must independently observe the target UI before judging.
3. Deduplicate findings across lanes.
4. Merge severity upward when the same symptom has broader release impact.
5. Return one final parent `AUDIT_RESULT = PASS | FAIL | BLOCKED`.
6. Return the minimum re-review scope if anything fails.
7. Do not recommend stable release. This is an RC acceptance gate only.

## Reviewer Lanes

### W01: Visual / Scientific Graph Acceptance

Primary scope:

- Route gestalt in Architecture and Evidence.
- Long detours, non-monotone Architecture routes, and electrical-wiring appearance.
- Node/card overlap, edge/card collision, relation label/card collision.
- Architecture trace-off selection invariance.
- Explicit Trace ON direction cues and labels.
- Lineage relation-column alignment and Source/Relation/Target grammar.
- Evidence claim-centered layout.
- Full-model reset readability.
- Reader-facing math rendering in Inspector and cards.
- Light and dark visual quality.

Required states:

1. CAT-TRACE Architecture Overview, 1536x864, Dark, trace OFF.
2. CAT-TRACE Architecture Overview, 1366x768, Light, trace OFF.
3. Overview selection sequence with trace OFF: Open-tail occurrence -> Group open-tail intensity -> Open-tail slope -> Catalogue match.
4. Overview explicit trace ON for Open-tail slope / beta^U_gh, recursive, both directions.
5. Architecture Full model reset/default at 1536x864 and 1366x768.
6. Original TRACE Architecture.
7. Lineage default.
8. Evidence default.
9. Evidence selected claim, dataset, and limitation.
10. Inspector math: beta^U_gh, gamma_g, Original TRACE long canonical definition.

W01 must not PASS merely because arrows, labels, and collision counts look low. First do a full-screen gestalt review.

Hard FAIL/FIX_THEN_RETEST for W01:

- Any P2 in core Architecture / Lineage / Evidence involving overlap, clipping, raw math in the main reading layer, arbitrary floating relation text, obvious route-engine smell, selection-only reflow, or unreadable Full model.

Return these W01 metrics:

```text
ROUTE_GESTALT = PASS | FAIL
AVOIDABLE_EDGE_CROSSING_COUNT = n | UNKNOWN
LONG_DETOUR_COUNT = n | UNKNOWN
NON_MONOTONE_ARCH_EDGE_COUNT = n | UNKNOWN
ORTHOGONAL_MULTI_BEND_EDGE_COUNT = n | UNKNOWN
FLOATING_RELATION_LABEL_COUNT = n | UNKNOWN
NO_NODE_OVERLAP = PASS | FAIL | UNKNOWN
NO_PRIMARY_TEXT_CLIPPING = PASS | FAIL | UNKNOWN
SELECTION_GEOMETRY_STABLE = PASS | FAIL | UNKNOWN
LINEAGE_VISUAL_GRAMMAR = PASS | FAIL | UNKNOWN
EVIDENCE_VISUAL_GRAMMAR = PASS | FAIL | UNKNOWN
FULL_MODEL_READABLE = PASS | FAIL | UNKNOWN
READER_FACING_MATH = PASS | FAIL | UNKNOWN
```

### W05: Responsive / Keyboard / Accessibility / Clipping

Primary scope:

- 1366x768 and 1536x864 responsive behavior with inspector open.
- Keyboard reachability for topbar controls, view rail, model selector, trace controls, and search.
- Skip paths / focus visibility.
- Text clipping, card clipping, scroll traps, nested tiny scroll strips.
- Light/Dark contrast and long-session readability.

Required checks:

- Switch Architecture / Lineage / Evidence by visible controls.
- Use model selector to switch Original TRACE / CAT-TRACE and back.
- Search for at least one symbol and use the visible result.
- Toggle trace controls through the UI.
- Verify right inspector primary content remains reachable and not hidden behind a tiny nested scroll area.

### W06: Release Red-Team

Primary scope:

- Version correctness: visible `2.0.0-rc.19`.
- Public target loads at the fixed URL.
- No stable release claim.
- No stale RC.18 / old-version visible UI.
- No obvious broken export/session/search topbar flow from the real UI.
- No accidental CAT-TRACE scientific truth mutation observable in labels/statuses.
- No user-visible claim that GPT Work or user acceptance has already passed.

W06 should block for wrong visible version, public URL failure, stale candidate, or release/stable claim leakage.

## Result Format

Return this structure:

```text
PARENT_AUDITOR_ID = ASTERIA_GPT_WORK_PARENT_ACCEPTANCE_RC19
AUDIT_RESULT = PASS | FAIL | BLOCKED
TARGET_URL = https://asteria.httpwwwcardiacnexus-ukb.com/
VERSION_OBSERVED = <visible version or UNKNOWN>
BROWSER_MODE = IN_APP | UI_AUTOMATION_FALLBACK | MIXED_UI
BLACK_BOX_CONTEXT_CONTAMINATED = YES | NO
BROWSER_BLOCKER = NONE | BLOCKED_BY_BROWSER_ENVIRONMENT
P0_COUNT = n
P1_COUNT = n
P2_COUNT = n
P3_COUNT = n
RELEASE_RECOMMENDATION = BLOCK | FIX_THEN_RETEST | ACCEPTABLE_WITH_P2 | ACCEPT
MINIMUM_RE_REVIEW_SCOPE = NONE | W01 | W05 | W06 | W01+W05 | W01+W06 | W05+W06 | W01+W05+W06
```

Then include:

1. Executive summary.
2. Coverage by lane.
3. Findings, deduplicated and sorted P0 -> P3.
4. Positive observations, maximum 5 bullets.
5. Not tested / safety boundary.
6. Browser execution note.
7. Top fixes before stable, maximum 8 bullets.
8. Per-lane result blocks for W01, W05, W06.

Each finding must use:

```text
ID:
Severity:
Surface:
Title:
Start state:
Steps:
Observed:
Expected:
Impact:
Evidence:
Reproducibility:
```

If all lanes pass, return `AUDIT_RESULT = PASS` and `MINIMUM_RE_REVIEW_SCOPE = NONE`. If a lane is blocked only by Browser environment after legal fallback attempts, return `AUDIT_RESULT = BLOCKED` with `BROWSER_BLOCKER = BLOCKED_BY_BROWSER_ENVIRONMENT`.
