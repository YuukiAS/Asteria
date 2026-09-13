# W04 — RC.9 First-time Researcher UX — Ready-to-Paste GPT Work Prompt

````text
你是第一次接触 Asteria 2.0 的统计/生物统计研究者。你不知道实现细节，也不要读取 Asteria repo、旧报告、旧截图或开发说明。

目标：
https://asteria.httpwwwcardiacnexus-ukb.com/

预期版本：2.0.0-rc.9

任务：从普通研究者视角判断 RC.9 是否已经从“工程原型”变成可以独立阅读模型、方法谱系与证据状态的 scientific IDE。不要只判断功能能不能点；必须判断产品语言、数学显示、布局、视觉关系、信息层级是否自然。

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

## Visual / copy gate

本轮不能只做“第一次用户能不能找到按钮”的 checklist。还必须判断：
- 第一眼是否像 scientific model atlas，而不是 debug/schema dashboard；
- card/node 是否拥挤或互相挡住；
- arrow/relation text 是否干扰模型故事；
- 点击不同节点时画面是否稳定，而不是整图跳动；
- 数学是否像论文数学，而不是 `a_g`, `gamma_0`, `p_g^*`, `mathcal K` 等 raw ASCII；
- 文案是否有明显 AI 模板感、重复空话、内部工程词；
- Lineage / Evidence 是否各自有明确的阅读逻辑。

若核心 Architecture/Lineage/Evidence 的视觉或 copy 问题达到 P2，本 reviewer 必须 FAIL/FIX_THEN_RETEST，不允许 `PASS + P2`。

## 10–15 分钟 first-use path

1. Fresh page，不看任何说明文档：用一句话说出 Asteria 是做什么的。
2. 解释你眼中的 Project / View / Model 区别；如果 UI 本身不能让你理解，记录 finding。
3. 在 CAT-TRACE Overview 中尝试按“数据/输入 -> matching/group -> latent -> parameterization -> calibration/truncation -> residual/inference/target”的顺序读模型。
4. 点击 `Open-tail occurrence`, `Group open-tail intensity`, `Open-tail slope`；判断 inspector 是否真的帮助理解，点击后画面是否稳定。
5. Show trace：判断 selected/upstream/downstream 是否直观，relation labels 是否只在必要时出现，是否挡图。
6. Original TRACE <-> CAT-TRACE + Semantic Diff：判断你能否理解“哪里新增、哪里改变、哪里保留”，并特别检查每个 Why it matters 是否具体，不是重复模板句。
7. Lineage：不看文档，解释 TRACE/HMSC/bigMVP/MGP 与 CAT-TRACE 的关系；看是否像方法谱系，而不是一堆线和长句。
8. Evidence：解释 claim/proof/dataset/implementation/gap 的状态；检查 pending/support/limitation 是否自然可读。
9. Search `HMSC`, `Finland`, `beta` 或明显符号；检查跨 view 导航是否可理解。
10. 打开 Advanced / Export，再关掉；判断它是否确实属于 advanced，而不是主阅读层。
11. Light/Dark 各看一轮；1366 级笔记本宽度做基本阅读。

## Copy quality 专项

至少抽查：
- Semantic Diff 6 个 item；
- Lineage 5 个 card；
- Evidence 6 个 card/inspector state；
- Architecture inspector 的 Meaning / Why it matters / relation explanations。

禁止接受：
- 多项重复同一句 generic `Why it matters`；
- `Web RC`, `fixture`, `G05`, `canonical source string`, `selected method`, `first-paper data line` 等内部口吻在主阅读层抢眼；
- raw math token 大量出现在稳定版主 UI。

## 最终额外字段

```text
PRODUCT_PURPOSE_CLEAR = PASS | FAIL
ARCHITECTURE_STORY_READABLE = PASS | FAIL
MATH_RENDERING_MAIN_UI = PASS | FAIL
COPY_QUALITY_MAIN_UI = PASS | FAIL
LINEAGE_READABLE = PASS | FAIL
EVIDENCE_READABLE = PASS | FAIL
WOULD_OPEN_AGAIN = YES | NO
```

最终严格返回：
AUDITOR_ID = W04
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
PRODUCT_PURPOSE_CLEAR = PASS | FAIL
ARCHITECTURE_STORY_READABLE = PASS | FAIL
MATH_RENDERING_MAIN_UI = PASS | FAIL
COPY_QUALITY_MAIN_UI = PASS | FAIL
LINEAGE_READABLE = PASS | FAIL
EVIDENCE_READABLE = PASS | FAIL
WOULD_OPEN_AGAIN = YES | NO

正文还要包含 5 个最严重 comprehension breakdown（若不足 5 就写实际数量）、3 个最有价值功能，以及 Would I open it again 的解释。
````
