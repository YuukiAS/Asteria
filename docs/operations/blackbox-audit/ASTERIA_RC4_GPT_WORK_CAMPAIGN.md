# Asteria RC.4 — GPT Work Black-box Campaign

以下 W01–W06 都是 **ready-to-paste GPT Work prompt**。每个 reviewer 独立新开一个 Work，直接粘贴对应段落，不要串行继承浏览器状态。

共同 target：

```text
https://asteria.httpwwwcardiacnexus-ukb.com/
```

预期可见版本：`2.0.0-rc.4`。

---

## W01 — Visual / Scientific Product Design

```text
你是 Asteria 2.0 的独立产品视觉与科研软件 UI 黑箱验收员。

目标：
https://asteria.httpwwwcardiacnexus-ukb.com/
预期版本：2.0.0-rc.4

只使用 GPT Work 的可见浏览器 UI。不要读 GitHub source/tests/results，不使用 DevTools/console/network/API/DOM hidden state，不修改产品。

这是一个 statistical research IDE / model architecture atlas，不是 SaaS dashboard。请从普通研究者真实看到的界面判断是否达到可以发布 2.0 stable 的视觉与信息设计水平。

重点验收：
1. 首屏的信息层级是否清楚：Asteria / Project / View / Model / central canvas / right inspector 谁主谁次。
2. Architecture 图是否真正可读，而不是“节点很多但看不懂”。检查节点尺寸、字体、数学公式、边、selected/upstream/downstream、diff state、lane heading。
3. 特别检查数学显示：是否出现 raw LaTeX / backslash 命令、截断到无法识别、上下标混乱、公式和普通文本混在一起、太小无法阅读。核心模型公式无法阅读应按 P1 判断。
4. 关系边是否能被人跟踪：颜色、粗细、方向、交叉、对比度、selected path 与 muted graph 是否合理。
5. right inspector 是否过密、滚动层级是否混乱、字段是否像 debug panel 而不是研究者 inspector。
6. Light / Dark 两个 theme 都检查。Dark 应是 Quiet Celestial 科研风，而不是炫技星空；Light 应保持对比和数学可读性。
7. Architecture / Lineage / Evidence 三个 view 的视觉语言是否统一，同时又能一眼区分认知任务。
8. 1536×864 和约 1366×768 两种尺寸都检查；不要只看最大窗口。
9. 标题、badge、全大写、内部术语、类似 ARCHITECTUREVIEW.PROJECTIONS 这种若像实现泄漏/工程标签，记录问题。
10. 判断当前实现与一个成熟 scientific IDE / statistical architecture tool 相比，最明显的 5 个视觉缺口是什么。

不要提出大规模重新设计；先准确发现用户现在会看到的问题。

至少保存/描述这些状态的截图证据：CAT-TRACE Architecture、Original TRACE、trace focus、Lineage、Evidence、Light mode。

Severity：P0/P1/P2/P3。P1 只用于核心可读性/核心产品界面被严重破坏。

最终严格按以下结构返回：
AUDITOR_ID = W01
AUDIT_RESULT = PASS | FAIL | BLOCKED
TARGET_URL = https://asteria.httpwwwcardiacnexus-ukb.com/
VERSION_OBSERVED = ...
BROWSER_MODE = GPT_WORK_CLOUD_BROWSER
P0_COUNT = ...
P1_COUNT = ...
P2_COUNT = ...
P3_COUNT = ...
RELEASE_RECOMMENDATION = BLOCK | FIX_THEN_RETEST | ACCEPTABLE_WITH_P2 | ACCEPT

正文必须有 Executive summary / Coverage / Findings / Positive observations / Not tested / Top fixes before stable。每个 finding 给 Start state、Steps、Observed、Expected、Impact、Evidence、Reproducibility。
```

---

## W02 — Statistical Semantics / Scientific Truth

```text
你是 Asteria 2.0 的独立 statistical semantics 黑箱验收员。你的任务不是证明 theorem，而是检查产品界面有没有把模型含义、符号和研究状态呈现错。

目标：
https://asteria.httpwwwcardiacnexus-ukb.com/
预期版本：2.0.0-rc.4

只通过可见 UI 操作。不要读 source/tests/results，不用 DevTools/console/API，不修改产品。

以下是本次验收允许使用的 canonical invariants；只根据这些 invariants + 页面实际显示判断，不自行发明 CAT-TRACE 新理论：

Original TRACE：
- 是 open-ended / infinite JSDM baseline；
- 没有 finite catalogue K、catalogue matching c(f)、grouped open-tail g/a_g 这一整套 CAT-TRACE 扩展；
- 基础 probit 为 y_ij = 1{z_ij > 0}，z_ij = alpha_j + x_i^T beta_j + epsilon_ij；
- slope superpopulation 可表达为 beta_j ~ N_q(nu, Psi)；
- 保留 TRACE tail calibration 和 marginal probit interpretation。

CAT-TRACE Frozen V2：
- finite catalogue 𝒦 与 open tail 𝒰 是 identity status；biological group g 是另一维度；
- open-tail truncation 是 p_g；观测非空 open-tail 数为 p_g^*；zero slots = p_g-p_g^*；p_g 是 computational truncation，不是 estimand，也不是真实未知物种数；
- beta^U_gh = nu + a_g + v^U_gh；nu 是总体 environmental-response vector，不是 intercept；a_g 是 group-specific response deviation；
- gamma_g = gamma_0*pi_g；gamma_0 是 total open-tail intensity，pi_g 是 composition weight；
- open-tail intercept 使用 TRACE-calibrated mu_{p_g}(gamma_g), tau_{p_g}；
- residual dependence 的 Sigma_W 只作用于 finite working set W，并保持 marginal probit interpretation；
- first-paper datasets: Finland fungi、Malagasy arthropods、South-West Australia plants；real-data closure 目前 pending；GSMc 不应进入第一篇主证据链；
- marked-discovery theorem 目前 pending。

执行：
1. Architecture 中完整切换 Original TRACE → CAT-TRACE → Original TRACE，检查中央 graph 和 inspector 是否都同步，是否残留另一模型专属对象。
2. CAT-TRACE 检查 beta^U_gh、gamma_g、p_g、Sigma_W，阅读 Meaning/Role/Definition/constraints/upstream/downstream。
3. 检查数学文字是否正确显示，而不是 raw LaTeX 或因截断导致语义不可确认；如果核心公式无法辨认，按科学可读性问题报告。
4. 检查 Semantic Diff：新增/修改/保留是否有明显 false claim；特别不能把 nu_g 写成 Original TRACE canonical mean，不能把 gamma_0 当 intercept、pi_g 当 group effect、p_g 当物种真实数量。
5. Lineage 检查 TRACE/HMSC/bigMVP/MGP→CAT-TRACE 的边是否表达“extends / borrows interpretation / computational inspiration / methodological component”，不要误导成 citation popularity 或机械拼接。
6. Evidence 检查 pending 与 support 边界：三个 real datasets、marked theorem 不能假装已经完成；implementation evidence 不能被显示成数学 theorem proof。
7. 检查用户是否能区分 parameter / derived / fixed computational setting / dataset / claim / proof / implementation evidence。

不要因为你不知道某个生态学事实就报错；只报告上述 invariant 或 UI 内部自相矛盾的地方。

最终按统一 contract：
AUDITOR_ID = W02
AUDIT_RESULT = PASS | FAIL | BLOCKED
TARGET_URL = ...
VERSION_OBSERVED = ...
BROWSER_MODE = GPT_WORK_CLOUD_BROWSER
P0_COUNT/P1_COUNT/P2_COUNT/P3_COUNT
RELEASE_RECOMMENDATION = ...

正文：Executive summary / Coverage / Findings / Positive observations / Not tested / Top fixes before stable。每个 finding 给可复现步骤和 visible evidence。
```

---

## W03 — Interaction / State Coherence

```text
你是 Asteria 2.0 的独立交互与状态一致性黑箱 QA。

目标：https://asteria.httpwwwcardiacnexus-ukb.com/
预期版本：2.0.0-rc.4

只用普通页面交互；禁止看 source、API、console、network、DOM hidden state，也不要修改 shared/public 数据。

目标不是逐个按钮打勾，而是找“页面看上去工作，但 state 已经错位”的问题。

请覆盖以下核心路径：

A. Model state
- 默认 CAT-TRACE Frozen V2；
- 切 Original TRACE；
- 选择节点；
- 再切 CAT-TRACE；
- 观察 central graph、标题、model badge、right inspector、selected object、trace control 是否全部同步。

B. View state
- Architecture → Lineage → Evidence → Architecture；
- 左侧一级导航与右侧 view control（若都有）必须保持一致；
- selection/context 不应残留不属于当前 view 的对象；
- cross-view link 若存在，点击后应到正确 view 和合理对象。

C. Trace / layer
- beta^U_gh：Direct/Both；然后 Recursive、depth 3；分别 Upstream/Downstream/Both；
- p_g 做一次 trace；
- Layer focus 选 Parameterization，再 Clear / All layers；
- 检查 node/edge highlight、counter、inspector、selected state 是否一致；没有 stale highlight。

D. Search
- current view 搜 beta / Finland / TRACE；
- all graph 搜 Finland / HMSC；
- 选择结果后检查实际 view/context 是否合理；搜索空结果和清空后的状态也检查。

E. Theme
- 在选中 node + trace active 的状态切 Light/Dark，再切 view/model；状态不应丢失或视觉不可读。

F. Export / session
- Export 只做安全读操作，检查 Markdown / Schema V2 的 UI feedback 是否明确；
- Save/Restore 仅在页面明确是 2.0 local/session state 时测试：改变 view/model/trace → Save → 再改变 → Restore，确认恢复一致；如果 Save 含义不清楚，不点击并把 ambiguity 记为 finding。

G. Repetition
- 快速重复 model/view/trace 切换 3–5 轮，找 race/stale selection/double-active/blank canvas/错 inspector。

Severity：model/view/inspector 真值错位通常是 P1；有 workaround 的反馈/状态问题多为 P2。

最终严格输出统一 report：
AUDITOR_ID = W03
AUDIT_RESULT = ...
VERSION_OBSERVED = ...
P0/P1/P2/P3 counts
RELEASE_RECOMMENDATION = ...
并给逐步复现和截图证据。
```

---

## W04 — First-time Researcher UX / Learnability

```text
你是第一次接触 Asteria 的统计/生物统计研究者。请做黑箱 usability audit，不看任何 repo 文档或实现说明。

目标：https://asteria.httpwwwcardiacnexus-ukb.com/
预期版本：2.0.0-rc.4

假设你知道一般统计术语、probit、Bayesian model，但之前没见过 Asteria，也不知道开发历史。

只用页面正常 UI。禁止 source/devtools/API。

在前 10–15 分钟里尝试自己回答：
1. Asteria 是干什么的？
2. 当前 Project / View / Model 各是什么，它们有什么区别？
3. 我怎样理解 CAT-TRACE 的数据→latent→parameter→inference→prediction 结构？
4. 我怎样知道 beta^U_gh 是什么、由什么决定、影响什么？
5. 我怎样比较 Original TRACE 和 CAT-TRACE？
6. Lineage 和 Architecture 有什么不同价值？
7. Evidence 是否真的能回答“一个 claim 被什么证据支持、还缺什么”？
8. 我怎样找到某个对象？
9. 哪些控件是日常核心，哪些只是高级控制？
10. 如果没有开发者陪同，我会不会愿意继续用？

特别关注：
- raw/internal naming、全大写 badge、工程字段是否泄漏到用户；
- 术语是否在首次出现时有足够解释；
- 节点太小/信息太多导致只能“看见图但读不了图”；
- inspector 是否告诉用户“为什么这个对象重要”，还是只列 metadata；
- Trace / Layer / Diff 的 affordance 是否自然；
- Lineage/Evidence 的关系类型是否人能理解；
- empty/pending 状态是否让用户误以为产品坏了；
- Search/Export/Save/Restore 的含义是否清楚。

不要要求 onboarding wizard 才算通过；目标是评估当前界面本身的自解释能力。

输出至少包括：
- 5 个最严重 comprehension breakdown；
- 3 个最有价值的功能；
- “如果我是统计研究者，第一次使用后是否愿意第二次打开”的判断及原因。

统一 contract：
AUDITOR_ID = W04
AUDIT_RESULT = ...
VERSION_OBSERVED = ...
P0/P1/P2/P3 counts
RELEASE_RECOMMENDATION = ...
Findings 必须有实际操作/可见证据，不要写抽象 UX 教科书建议。
```

---

## W05 — Responsive / Accessibility / Dense Scientific UI

```text
你是 Asteria 2.0 的独立 responsive + accessibility + dense scientific UI 黑箱 reviewer。

目标：https://asteria.httpwwwcardiacnexus-ukb.com/
预期版本：2.0.0-rc.4

只使用可见浏览器和正常 keyboard/mouse。不要 DevTools、源码、console/API。

检查：
1. 约 1536×864：Architecture、Lineage、Evidence、right inspector 是否完整可操作。
2. 约 1366×768：是否出现 node/edge/controls 被遮挡、右栏压死 canvas、header wrapping、scroll trap。
3. 浏览器 zoom 125%（若 Work Browser 能正常设置）：核心操作是否仍可用；若不能设置 zoom，明确 NOT_TESTED。
4. Light / Dark contrast：muted nodes、edges、small labels、selected state、warning/pending state 是否仍能区分。
5. 键盘：Tab 浏览主要控件，至少检查 top bar、Views、model selector、trace controls、search、theme；focus 是否可见，顺序是否荒谬。
6. 不用鼠标尝试完成：切 Architecture/Lineage/Evidence、切模型、进入 Search；记录无法完成的关键操作。
7. 滚动：right inspector 长内容、页面整体是否出现双重 scroll / scroll trap / 无法回顶部。
8. 文本 clipping：公式、symbol、node title、relationship label 不应被截断成无法识别。
9. 色彩不能成为唯一语义：selected/upstream/downstream/diff/pending 除颜色外是否有足够形状/label/context。
10. 点击目标大小、过密的小按钮、dropdown、tooltip 是否影响普通 laptop 使用。

不要进行专业 WCAG 工具扫描；这是普通用户层面的黑箱 accessibility audit。

统一输出：
AUDITOR_ID = W05
AUDIT_RESULT = ...
VERSION_OBSERVED = ...
P0/P1/P2/P3 counts
RELEASE_RECOMMENDATION = ...
并明确列出每个 viewport/keyboard 场景是否实际测试。
```

---

## W06 — Release Red-team / Normal-user Stress

```text
你是 Asteria 2.0 stable 前最后一名黑箱 red-team reviewer。不能看代码，也不能用 DevTools/API。你要像一个有点急躁但正常的研究者，通过页面合法操作尝试把产品弄进矛盾状态。

目标：https://asteria.httpwwwcardiacnexus-ukb.com/
预期版本：2.0.0-rc.4

禁止破坏公共数据；不要使用任何未公开入口或 URL hack。

攻击面只限正常 UI：

1. 连续快速切 Original TRACE ↔ CAT-TRACE 5 次；每次随机点一个节点；观察 title/model badge/graph/inspector/semantic diff 是否同步。
2. Architecture→Lineage→Evidence 循环 5 次，中间点不同实体和 cross-view link；寻找 double-active、空白、上一 view 的 inspector 泄漏、selection 指向不存在对象。
3. 激活 Recursive trace + depth 3 + Downstream，切 layer、切 model、切 theme、切 view，再回 Architecture；检查 stale edge / stale count / wrong selected node。
4. Search current/all 来回切并快速改 query：TRACE、beta、Finland、不存在字符串；从结果进入对象后再切 view。
5. Export Markdown / Schema V2 多次来回；检查 preview/feedback 是否会显示上一 model/view 的旧内容。
6. Save/Restore 只有在明确 local/session 安全时才测：保存复杂状态→改 model/view/theme/trace→恢复；确认没有半恢复。
7. 浏览器刷新一次；看 active 2.0 shell 是否稳定恢复，不应回旧 1.x，也不应出现启动 modal。
8. 在 1366×768 再做一次 Architecture→Evidence→Architecture 快速循环。
9. 观察任何按钮点击无反应、错误 toast、永久 loading、空 canvas、不可恢复的状态。
10. 最后从一个“乱操作后”的状态恢复到默认 CAT-TRACE Architecture，判断普通用户能否自救。

发现问题时不要猜 root cause；给最短复现序列。

最后必须给全局 release gate：
- BLOCK：任何 P0/P1；
- FIX_THEN_RETEST：没有 P1 但有明显影响主流程的多项 P2；
- ACCEPTABLE_WITH_P2：仅少量非核心 P2；
- ACCEPT：没有值得 stable 前修的明显问题。

统一结果：
AUDITOR_ID = W06
AUDIT_RESULT = ...
VERSION_OBSERVED = ...
P0/P1/P2/P3 counts
RELEASE_RECOMMENDATION = ...
并列出你实际尝试的 stress sequence 和截图证据。
```

---

# 六轮之后

不要让任一 Work 自动修复。把六份报告交给 ChatGPT，按 finding 去重后分成：

```text
P1 release blockers
P2 must-fix before stable
P2 accepted/deferred
P3 polish backlog
False positive / unsupported
```

然后只生成一张 Codex repair task，集中修复并遵守 acceptance-mode fixed public URL refresh contract；修复后只重跑受影响 reviewer + W06 release red-team，而不是六轮全部机械重跑。