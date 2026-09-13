# W02 — RC.10 Statistical Semantics — Ready-to-Paste GPT Work Prompt

````text
你是 Asteria 2.0 的独立 statistical-semantics 黑箱 reviewer。

目标：https://asteria.httpwwwcardiacnexus-ukb.com/
预期版本：2.0.0-rc.10

这是 RC.10 visual/math/copy repair 后的 fresh scientific-semantics regression audit。不要读取 repo、源码、旧报告、旧截图或实现说明。所有判断来自真实 UI；expected scientific invariants 仅以本 prompt 内内容为准。

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

## Canonical invariants

Original TRACE：
- `y_ij = 1{z_ij > 0}`；
- `z_ij = alpha_j + x_i^T beta_j + epsilon_ij`；
- unit marginal residual variance 下 marginal mean 为 `Phi(alpha_j + x_i^T beta_j)`；
- `alpha_j | gamma,p ~ N(mu_p(gamma), tau_p^2)`；
- `beta_j ~ N_q(nu,Psi)`；
- 不包含 finite catalogue `mathcal K`、`c(f)`、grouped open tail `g/a_g/pi_g`、catalogue/open-tail discovery split、`nu_g`。

CAT-TRACE Frozen V2：
- finite catalogue `mathcal K`, `K=|mathcal K|`, observed subset `mathcal K_n`；
- `c(f) in mathcal K union {empty}`，`c(f)=empty` 进入 catalogue-external open tail `mathcal U`；
- biological group space `mathcal G`，`g(f) in mathcal G`；
- open-tail `p_g` 是固定计算截断，不是 estimand/真实未知物种数；`p_g^*` 是 observed nonempty open-tail count；匿名 zero slots 是 likelihood information；
- catalogue occurrence `y^K_ij = 1{z^K_ij>0}`，open tail `y^U_igh = 1{z^U_igh>0}`；
- `nu` 是 overall environment-response vector，不是 intercept；
- `a_g` 是 group-specific response deviation，sum-to-zero；
- `beta^U_gh = nu + a_g + v^U_gh`；
- catalogue slope 可含 trait/relatedness/phylogeny modules，但只在真实输入存在时；
- catalogue intercept 是 finite hierarchy；open-tail intercept 使用 TRACE calibration；
- `gamma_g = gamma_0*pi_g`，其中 `gamma_0` total open-tail intensity，`pi_g` composition weight，`gamma_g` derived group intensity；三者都不是 intercept/group slope effect；
- residual dependence 只在 finite working set `mathcal W`，`Sigma_W` unit diagonal；匿名 zero slots 不进 species-specific residual network；
- marked-discovery theorem 仍 pending；real-data result 未完成时不能当 empirical support。

Lineage facts：
- TRACE = open-tail foundation；
- HMSC = ecological hierarchy / interpretation source；
- bigMVP = scalable multivariate probit computation inspiration；
- MGP = factor shrinkage idea；
- CAT-TRACE 不是机械 TRACE + HMSC merge。

Evidence facts：
- Finland fungi、Malagasy arthropods、South-West Australia plants 是 first-paper datasets，但当前真实结果仍 pending；
- real-data closure 是 limitation；
- implementation evidence 不等于 theorem proof；
- marked discovery theorem 仍 Pending。

## 必须测试

1. Original TRACE -> CAT-TRACE -> Original TRACE -> CAT-TRACE，检查 central graph / inspector / Semantic Diff 不串模。
2. Original TRACE 检查 latent equation、alpha calibration、beta prior、marginal probit mean；确认没有 CAT-only catalogue/grouped-tail content。
3. CAT-TRACE 检查 `mathcal K`, `mathcal U`, `c(f)`, `beta^U_gh`, `gamma_g`, `p_g`, `alpha^U_gh`, `Sigma_W`, `nu`, `pi_g`, `p_g^*`。
4. 检查 `c(f)=empty -> mathcal U` visible relation/explanation。
5. 检查 indexed metadata：`beta^U_gh/alpha^U_gh` 为 `g,h`，`gamma_g/pi_g/p_g/p_g^*` 为 `g`。
6. Inspector math：显示形式可以变漂亮，但科学含义不能改变；特别核对 beta/gamma/open-tail calibration/Original TRACE equations/Sigma normalization。
7. Semantic Diff：Added/Changed/Preserved 的 scientific claims 必须正确；copy cleanup 不得改错含义。
8. Lineage：dedicated visual grammar 可以合并 connector，但 typed scientific meaning不能改变；TRACE 的 Extends/Preserves 不能丢，HMSC/bigMVP/MGP 关系不能被改写成错误 claim。
9. Evidence：三个 datasets 仍 pending；real-data closure 仍 limitation；marked theorem Pending；implementation 不冒充 proof。
10. 检查 RC.10 为了“说人话/画好看”是否引入任何 scientific overclaim。

## Final result

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

正文必须包含 Executive Summary / Coverage / Findings / Positive Observations / Not Tested / Browser Execution Note / Top Fixes Before Stable。
````
