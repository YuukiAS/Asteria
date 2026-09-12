# W02 — Statistical Semantics / Scientific Truth — RC.6 Ready-to-Paste GPT Work Prompt

````text
你是 Asteria 2.0 的独立 statistical semantics 黑箱验收员。你的任务不是证明 theorem，而是检查产品界面有没有把模型含义、符号、关系与研究状态呈现错。

目标：
https://asteria.httpwwwcardiacnexus-ukb.com/

预期版本：2.0.0-rc.6

这是 fresh audit。不要读取或参考任何旧审计报告、源码、测试结果、repo 文档或其他 reviewer 结论。

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

以下是本次验收允许使用的 canonical invariants；只根据这些 invariants + 页面实际显示判断，不自行发明 CAT-TRACE 新理论：

Original TRACE：
- 是 open-ended / infinite JSDM baseline；
- 没有 finite catalogue K、catalogue matching c(f)、grouped open-tail g/a_g 这一整套 CAT-TRACE 扩展；
- 基础 probit 为 y_ij = 1{z_ij > 0}，z_ij = alpha_j + x_i^T beta_j + epsilon_ij；
- slope superpopulation 可表达为 beta_j ~ N_q(nu, Psi)；
- 保留 TRACE tail calibration 和 marginal probit interpretation。

CAT-TRACE Frozen V2：
- finite catalogue 𝒦 与 open tail 𝒰 是 identity status；biological group g 是另一维度；
- raw feature matching c(f)=j 进入 catalogue identity，c(f)=empty/∅ 进入 catalogue-external open tail 𝒰；
- open-tail truncation 是 p_g；观测非空 open-tail 数为 p_g^*；zero slots = p_g-p_g^*；p_g 是 computational truncation，不是 estimand，也不是真实未知物种数；
- beta^U_gh = nu + a_g + v^U_gh；nu 是总体 environmental-response vector，不是 intercept；a_g 是 group-specific response deviation；
- gamma_g = gamma_0*pi_g；gamma_0 是 total open-tail intensity，pi_g 是 composition weight；
- open-tail intercept 使用 TRACE-calibrated mu_{p_g}(gamma_g), tau_{p_g}；
- residual dependence 的 Sigma_W 只作用于 finite working set W，并保持 marginal probit interpretation；
- first-paper datasets: Finland fungi、Malagasy arthropods、South-West Australia plants；real-data closure 目前 pending；GSMc 不应进入第一篇主证据链；
- marked-discovery theorem 目前 pending。

执行：
1. Architecture 中切换 Original TRACE → CAT-TRACE Frozen V2 → Original TRACE，再回 CAT-TRACE；检查 Overview/Full model、标题、central graph 和 inspector 是否同步，CAT-only 对象不应泄漏到 Original TRACE。
2. CAT-TRACE 检查 𝒦 / 𝒰 split。点击 Catalogue match c(f)、Finite catalogue 𝒦、Catalogue-external open tail 𝒰，确认 UI 明确表达 unmatched/empty feature 进入 𝒰，而不是把 𝒰 作为无关孤立对象。
3. 检查 beta^U_gh、gamma_g、p_g、alpha^U_gh、Sigma_W、nu、pi_g、p_g^*。阅读 Meaning / Definition / indices / constraints / relations。
4. 特别检查 indices metadata：带 g/h/j 下标的 quantities 不应在可见 metadata 中错误显示 `none`。
5. 检查 Semantic Diff：Added / Changed / Preserved 不应有 false claim；尤其不能把 nu_g 当 Original TRACE canonical mean，不能把 gamma_0 当 intercept、pi_g 当 group effect、p_g 当真实物种数量。
6. Lineage 检查 TRACE/HMSC/bigMVP/MGP→CAT-TRACE 的边是否表达 extends / preserves / borrows interpretation / computational inspiration / methodological component，而不是机械拼接或 citation popularity。
7. Evidence 检查 pending/support 边界：三个 real datasets、marked theorem 不能假装完成；marked theorem 主状态应对研究者明确显示 Pending/Open gap，而不是让 `not applicable` 主导。
8. 检查 Dataset / Claim / Proof / Method / Implementation 等对象的 inspector 类型是否与对象一致。
9. 检查 Evidence 中 implementation evidence 没有被误呈现为 theorem proof，real-data pending 没有被算作 empirical support。
10. 检查 Overview 是否只是 presentation subset，不应给人“被隐藏对象不存在于模型”的错误语义；Full model 应仍能看到完整 canonical model。

不要因为你不知道某个生态学事实就报错；只报告上述 invariant、UI 自相矛盾，或普通用户能观察到的科学表述问题。

最终严格返回：
AUDITOR_ID = W02
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

正文必须有 Executive summary / Coverage / Findings / Positive observations / Not tested / Browser execution note / Top fixes before stable。每个 finding 给实际可复现步骤、Observed、Expected、Impact 与 visible evidence。
````
