# Asteria 科学图验收器加固结果

验收器加固已经完成，但当前科学图没有通过加固后的产品门槛。过去被固定写成零的交叉计数，现在从真实静态几何和浏览器最终 SVG 路径中得到：Architecture Overview 为 9 对、Full model 为 47 对、Evidence 为 1 对。缺失、NaN、Infinity、无边和不适用不再冒充真实零；科学文件差异也改为从批准基线检查 committed、staged、unstaged 与 untracked 四个范围。当前候选没有修改产品图、科学 fixture、部署配置或版本号，因此这些交叉是被新观察器揭示的既有产品缺陷，不是本任务引入的视觉回归。

## 状态

- `VALIDATOR_HARDENING = COMPLETE`
- `VALIDATOR_CONTROL_SET = PASS`
- `PRODUCT_GATE = FAIL`
- `PRODUCER_VISUAL_QA = FAIL`
- `INDEPENDENT_OBSERVER_REVIEW = PENDING`
- `READY_FOR_GPT_WORK = NO`
- `READY_FOR_USER_ACCEPTANCE = NO`
- `APPROVED_SCIENTIFIC_BASELINE = 193c033659a7612a99442763077217b130e9b756`
- `THRESHOLD_AUTHORITY = prompts/tasks/asteria_v2_rc19_layout_first_graph_convergence_task.md §8`
- `SIMPLE_ARCH_EDGE_MAX_ROUTE_RATIO <= 1.30`
- `ARCH_EDGE_P95_ROUTE_RATIO <= 1.45`
- `IMPLEMENTATION_COMMIT = PENDING_LOCAL_COMMIT`
- `FINAL_EVIDENCE_COMMIT = PENDING_LOCAL_COMMIT`
- `PUSH_STATUS = NOT_RUN_TASK_FORBIDS_EXTERNAL_UPLOAD`
- `RESTART_OR_RECONNECT = NOT_REQUIRED`
- `VISUAL_REVIEW_PACK = results/asteria_validator_hardening_20261022/VISUAL_REVIEW_PACK.md`

这里的 `COMPLETE` 只表示本任务要求的验收器、控制集、正常 runner、证据清单和结果文档已经形成；它不把产品失败改写成通过，也不代替任务要求的独立观察器审查。

## 真实计数

| 项目 | 数量 | 计数口径 |
|---|---:|---|
| `NEW_VALIDATORS` | 0 | 没有新增独立专业检测类别；本轮修复既有 route gestalt 和科学真值保护的失明。 |
| `ENHANCED_VALIDATORS` | 3 | 静态 `routeGestalt`、浏览器 `rc19RouteGestalt`、`changedProtectedTruthFiles` 各计一次。 |
| `NEW_REGRESSION_CASES` | 13 | 12 个纯 Node 控制案例，加 1 个真实浏览器伪造自报指标案例；参数展开、截图与重复运行不重复计数。 |
| `REUSED_VALIDATORS` | 7 | 未改动并实际复用 4 个浏览器 geometry helper 与 3 个语义/bridge 命令。 |
| `MERGED_OR_RETIRED` | 0 | 没有足够证据安全删除旧检查；`test:architecture-rc19` 原命令保留为正常入口。 |

7 个复用检查是 `assertNoNodeOverlap`、`assertNoPrimaryTextClipping`、`assertNoEdgeLabelNodeCollision`、`assertLineagePresentationGeometry`、`test:architecture-kernel`、`test:canonical-trace` 和 `test:cat-trace-bridge`。它们在本轮没有被改写标准答案；浏览器 helper 由完整浏览器套件实际调用，三个命令均以退出码 0 完成。

## 三项增强分别解决什么

1. 静态 `routeGestalt` 防止 A40/A41 中“交叉和浮动标签直接写零、缺测量也回零”的真实假绿；它由 `npm run test:architecture-rc19` 调用，并由 `npm run test:regression` 累积消费；交叉+浮动标签、missing、NaN、Infinity、no-data 坏例均被识别，同时合法共享端点、稳定 relation column 与零冲突合成图保持通过；证据见 `validator-run.json` 的 `controls` 与 `static.ROUTE_GESTALT`。
2. 浏览器 `rc19RouteGestalt` 防止 A43 中只信应用自报 `data-route-*` 而不看最终屏幕的假绿；正常入口从最终 SVG path 的 `getTotalLength/getPointAtLength`、`getScreenCTM`、节点 lane 与实际可见标签读取几何；注入两条真实交叉路径和浮动 `<text>`、同时把自报指标伪造成零的浏览器坏例仍被拒绝，而真实 Lineage relation column、共享端点与无浮动标签行为继续受保护；证据见 `browser-falsified-metrics-control` 和 `browser.ROUTE_GESTALT`。
3. 科学真值保护防止 A33/A42 中无基准 `git diff --name-only --` 漏掉 staged 和 committed 变更；正常 RC19 runner 以 `193c033659a7612a99442763077217b130e9b756` 为批准基线，再分别检查 committed、index、worktree 与 untracked；隔离临时仓中的 unstaged、staged、committed、baseline missing 坏例都被识别，clean/unchanged 正例保持通过；当前真实候选结果为 `status=unchanged`、`changedFiles=[]`。

辅助 runner `scripts/run-architecture-rc19-validation.mjs` 只负责编排和保存原生结果，不算新专业验收器。它让控制集、静态观察器、浏览器伪造指标控制和产品门槛彼此独立执行，即使产品门槛失败也会留下完整 JSON，而不是在第一个非零退出后丢失证据。

## 当前产品的实际测量

| 视图 | 边数 | 可避免交叉对 | long detour | non-monotone | orthogonal multi-bend | 浮动标签 | max / p95 route ratio |
|---|---:|---:|---:|---:|---:|---:|---:|
| Architecture Overview（浏览器） | 13 | 9 | 0 | 0 | 0 | 0 | 1.236 / 1.236 |
| Architecture Full model（浏览器） | 34 | 47 | 0 | 0 | 0 | 0 | 1.233 / 1.233 |
| Evidence（浏览器） | 8 | 1 | 0 | 0 | 0 | 0 | 1.131 / 1.131 |
| Lineage（浏览器） | 0 个 Architecture SVG edge | `not_applicable` | `not_applicable` | `not_applicable` | `not_applicable` | 0 | `not_applicable` |

Lineage 同时观察到 4 个稳定 relation-column 卡片。这里的 `null/not_applicable` 是明确的适用性结果，不是零。当前产品的 missing、NaN、Infinity edge geometry 数均为 0。

静态观察器测得 Overview 9 对、Full 55 对、Evidence 1 对；静态曲线采样与浏览器实际屏幕坐标对 Full 的交叉对数不同，因此产品结论以真实浏览器的 47 对为权威，静态 55 对保留为独立预检信号，不把两者强行抹平。两条 route ratio 门槛均通过，产品失败来自交叉数非零。

## 实际运行

| 命令 | 退出码 | 结果 |
|---|---:|---|
| `npm run test:validator-hardening` | 0 | 12/12 控制案例通过。 |
| `npm run test:architecture-rc19` | 1 | 控制集通过；静态与浏览器都正确检出产品交叉，整体按门槛失败。 |
| `npx playwright test --grep "RC19 validator hardening"` | 0 | 1/1；伪造 `data-route` 的坏渲染被拒绝。 |
| `npm run test:architecture-kernel` | 0 | 既有 architecture kernel 与 v1 migration 通过。 |
| `npm run test:canonical-trace` | 0 | Original TRACE、CAT-TRACE Frozen V2 与 direct trace 通过。 |
| `npm run test:cat-trace-bridge` | 0 | bridge schema 0.1.0、6 bindings、3 status objects 通过；原有 `C03=BLOCKED` 语义保留。 |
| `npm run test:regression` | 1 | RC3–RC18 及此前累计检查通过；到 RC19 正确检出交叉后停止，后续 `test:shared-server` 未执行。 |
| `npm run test:browser` | 1 | 19 项中 18 通过、1 项（RC19 产品门槛）因 9/47/1 个交叉对失败；新增 falsified-metrics 案例通过。 |
| `ASTERIA_SELF_QA_DIR=results/asteria_validator_hardening_20261022/screenshots npm run capture:architecture-rc19` | 0 | 生成并人工检查 16 张当前候选截图。 |
| `npm run build` | 0 | TypeScript 与 Vite production build 完成。 |
| `git diff --check` | 0 | 无空白错误。 |
| `ai-bridge validate` | 0 | Bridge project validation：0 errors，44 个既有 legacy warnings。 |

`test:browser` 会按旧脚本行为覆盖 RC11 已跟踪截图；本轮运行产生的 17 个非目标二进制差异已按本轮开始时的干净 `HEAD` 精确还原，未纳入任务改动。

原始正常 runner 记录在 `results/asteria_validator_hardening_20261022/validator-run.json`，schema 为 `asteria.validator-run/1`。16 张整屏证据和逐图人工观察见 `VISUAL_REVIEW_PACK.md`。

## 修改与未修改范围

已修改：RC19 静态观察器、RC19 Playwright 观察器及坏例、共享几何/科学真值 helper、正常 runner、package 测试接线、本任务 JSON/截图/结果文档。

未修改：`src/` 产品代码、科学 fixtures、trace/session/repository bridge/schema/validation 合同、版本号、`CHANGELOG.md`、`README.md`、部署配置、固定公网 URL、shared server、Cloudflare/tunnel、中央 Delivery Assurance 与插件源码。README 已检查；本任务没有改变用户入口或产品行为，不需要同步修改。一次局部产品排序试验使交叉更差，已在进入最终候选前撤销，最终 `src/` 无差异。

## 未运行或仍未知

- 独立 Reviewer/Verifier 尚未审查新观察器、控制集、阈值采用和交叉专业定义；执行者只报告自检，不能自签 `INDEPENDENT_OBSERVER_REVIEW=PASS`。恢复入口是当前任务结果、`validator-run.json` 和本地实现提交。
- 没有运行 GPT Work 黑箱 campaign，因为当前 producer 自检和产品门槛已失败；此时创建产品 PASS campaign 会违反既定验收顺序。
- 没有运行 `test:shared-server`：累计回归在 RC19 正确失败后短路，而且任务不授权启动/重启 shared server。
- 没有访问、刷新或发布固定公网 URL；本地浏览器证据不能外推为公网候选身份。
- 没有重放 AX01/AX02 当年的 exact Work 候选与 reviewer 分歧；只对当前候选执行了对应 Light/Dark、trace、响应式和整屏检查。
- `codex plugin list --json` 因当前只读运行环境无法创建 PATH alias 而超时；当前 session 暴露的正式 skill manifest 与本机 release 文件显示 `ai-skills-core 0.5`、`web-development 0.4`、Bridge Kit `0.9.3`，但未把该失败命令包装成“动态列表已核实”。没有更新插件，因此无需新 session。

## 52 条历史登记的当前去向

| ID | 当前分类 | 动作、证据或未证原因 |
|---|---|---|
| A01 | 可靠保护 | 复用数学/主文字裁切检查；RC10/RC11 浏览器项通过，当前 CAT/Original 截图可读。 |
| A02 | 可靠保护 | 1366×768 Light 整屏已复核；标题、lane 与 Inspector 未裁切，但交叉另按 A05/A13 失败。 |
| A03 | 可靠保护 | 完整浏览器 suite 的 Clear/状态链通过；未改该语义。 |
| A04 | 可靠保护 | 1366 Light trace on 截图人工复核，active/context 可辨；RC8 浏览器项通过。 |
| A05 | 当前已证缺陷 | 新浏览器观察器与截图确认 Overview 9、Full 47 个交叉对。 |
| A06 | 历史已修待独立回归 | 当前 Inspector 信息分组可读，截图与旧浏览器项通过；本轮未做新的信息架构专业审查。 |
| A07 | 可靠保护 | RC10/RC15 浏览器项通过，截图主阅读层未出现 raw JSON/内部 ID。 |
| A08 | 可靠保护 | G06/RC5 跨视图搜索与反馈检查通过。 |
| A09 | 可靠保护 | Lineage/Evidence 截图的外层标题与导航正确；G06 通过。 |
| A10 | 可靠保护 | RC7 键盘 selector/skip paths 浏览器项通过。 |
| A11 | 历史已修待独立回归 | Project/View/Model 和三视图说明在整屏可见；未做新研究者可用性实验。 |
| A12 | 可靠保护 | G05 本地 Save/Restore 与 RC 系列状态检查通过。 |
| A13 | 当前已证缺陷 | Full reset 虽无节点重叠/文字裁切，但 47 个交叉对使全图仍不可判通过。 |
| A14 | 可靠保护 | RC6 root-relative direction 与完整浏览器 trace 行为通过。 |
| A15 | 可靠保护 | RC18 trace OFF 选择序列保持 16 节点、0 px 位移、0 path change。 |
| A16 | 可靠保护 | canonical trace 与 RC6 open-tail relation 检查通过。 |
| A17 | 可靠保护 | RC10/RC11 公式与定义浏览器项通过，当前截图保留分组索引。 |
| A18 | 可靠保护 | G06 closure 状态保留 `pending` / `supported_with_limits`，未退化为“不适用”。 |
| A19 | 可靠保护 | Evidence 的 claim/dataset/limitation 三种选择截图显示 Inspector 类型正确切换；G06 通过。 |
| A20 | 历史已修待独立回归 | 当前 Evidence 意义/限制文案可见，RC11/RC15 项通过；未新做科学文案评审。 |
| A21 | 可靠保护 | RC7 skip links 首个可见 Tab 路径检查通过。 |
| A22 | 可靠保护 | RC7/RC10 的 disclosure/Advanced 交互检查通过。 |
| A23 | 可靠保护 | G05/RC7 Export disclosure 与反馈检查通过。 |
| A24 | 可靠保护 | RC7 compact actions 可访问性检查通过。 |
| A25 | 可靠保护 | Full reset 的 Zoom/Reset/Pan 可见；RC7、RC18 相关检查通过。 |
| A26 | 可靠保护 | 当前整屏中 Project/View/Model label/value 分隔清楚。 |
| A27 | 可靠保护 | 3/6-source 与真实 Lineage 截图无巨大结或浮动关系文字；geometry helper 通过。 |
| A28 | 可靠保护 | 1366/1536 Lineage target 未裁切，source 文案可读。 |
| A29 | 可靠保护但产品门槛失败 | CAT Full 与 Original TRACE 均有当前截图；节点不重叠，但 CAT Full 交叉仍失败。 |
| A30 | 可靠保护 | RC10/RC11 math 检查通过，当前符号未退化成大写 ASCII 或竖排。 |
| A31 | 可靠保护 | RC10 disclosure 检查通过，截图未见折叠外泄 raw JSON。 |
| A32 | 可靠保护 | `assertNoPrimaryTextClipping` 复用，RC11/RC18 通过，当前主卡标题完整。 |
| A33 | 观察器缺陷已修 | 不再接受执行者自述；批准基线到候选的四范围 diff 为 `unchanged`，独立复审仍待办。 |
| A34 | 可靠保护 | RC18 trace OFF 连续选择：16/16/16/16/16，最大位移 0，路径变化 0。 |
| A35 | 历史已修待独立回归 | Full reset 利用率 0.97、无重叠/裁切；本轮未修改产品 fit 算法。 |
| A36 | 审查缺口被当前流程纠正 | fresh screenshots 与 producer QA 明确报 FAIL，没有沿用旧 Work PASS；独立审查未开始。 |
| A37 | 当前部分通过、部分缺陷 | long detour=0、route ratio 通过，但 crossing 非零；不把“去箭头/标签”当作整体图通过。 |
| A38 | 审查缺口被当前流程纠正 | 当前执行者实际看完 16 张图并报告缺陷，没有以回归绿或自评零问题替代视觉结论。 |
| A39 | 正式替代/保留事实 | RC19 正常入口改为保存控制、静态、浏览器原生结果；不据旧报告指控作弊。 |
| A40 | 观察器缺陷已修 | 静态 crossing/label 改为实际测量；坏交叉+浮动标签控制被识别。 |
| A41 | 观察器缺陷已修 | missing/NaN/Infinity/no-data 分态，数字为 `null` 而不是 0；对应控制全部通过。 |
| A42 | 观察器缺陷已修 | baseline→candidate、staged、unstaged、untracked 全覆盖；隔离 Git 的四类坏例通过。 |
| A43 | 观察器缺陷已修 | 浏览器读取最终 path/CTM；伪造 `data-route` 仍被实际坏渲染击中。 |
| A44 | 仅担忧、未退休 | 保留累计入口和旧坏例；没有耗时/等价性证据支持删除 RC 脚本。新 runner 只归并 RC19 内部证据。 |
| A45 | 当前文档不一致、非本任务修改 | 旧 audit README 的 RC10 标签仍存在；它不覆盖当前 RC19 task/package 权威。 |
| A46 | 可靠分层 | 本地测试、截图、独立审查、公网发布分别报告；本轮未发布公网，也不称产品通过。 |
| A47 | 可靠流程约束 | 当前只要求受影响的观察器/控制集独立复审，没有机械创建六路 reviewer；结论仍待独立审查。 |
| AX01 | 当前部分重放 | 当前 1366 Light trace on/off 已看图，祖先 opacity 可读；历史 W01/W05 分歧的 exact candidate 未重放。 |
| AX02 | 历史证据未精确重放 | 当前用 16 张矩阵和实际观察器再次发现产品缺陷，但未重跑 RC8 的原 six-lane Work。 |
| AX03 | 可靠保护 | 浏览器用 `getScreenCTM` 统一 SVG/屏幕坐标，1366 responsive 与 endpoint helpers 通过。 |
| AX04 | 可靠保护 | 1366 Inspector 打开状态已截图，卡片在容器内；RC14 responsive check 通过。 |
| AX05 | 正面能力保留 | 通用 layered、Lineage 3/6-source fixtures 均无交叉/裁切，没有为 CAT entity ID 写特判或推翻 RC13 通用布局。 |

## 未来 Delivery Assurance 薄适配入口

`FUTURE_DA_ADAPTER_ENTRY = results/asteria_validator_hardening_20261022/validator-run.json`

该文件使用原生 JSON schema `asteria.validator-run/1`，记录候选 `HEAD`、worktree 状态及 diff SHA-256、批准科学基线、门槛来源、完整 argv/退出码/耗时、控制集、静态 `ROUTE_GESTALT`、浏览器 `ROUTE_GESTALT`、科学真值 diff 和 `overallStatus`。现有消费者是 `npm run test:architecture-rc19` 与 `npm run test:regression`。未来 adapter 只能把 observed/missing/not_applicable 和原生 PASS/FAIL 转换到上层协议，不得重写几何、阈值或科学保护逻辑。

## 下一步

先由既有独立 Reviewer/Verifier 审查观察器、控制集、`max<=1.30 / p95<=1.45` 来源与交叉定义。观察器获独立认可后，当前产品仍因 9/47/1 个交叉对需要回到原产品规划者确定布局修复范围；没有修复并重跑通过前，不进入 GPT Work 或用户最终验收。本任务不等待中央 Delivery Assurance，也没有为求通过放宽标准。
