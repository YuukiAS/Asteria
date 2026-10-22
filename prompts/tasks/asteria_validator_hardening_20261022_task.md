---
task_id: "asteria_validator_hardening_20261022"
project: "Asteria"
status: "ready"
executor: "Codex"
risk_level: "medium"
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
review_required: true
---

# Asteria：修复图形验收失明，保留科学真值与既有回归

## 精确入口和范围

准备基线为 `YuukiAS/Asteria main@193c033659a7612a99442763077217b130e9b756`，package 当前 `2.0.0-rc.19`。本任务为验收维护，不是 RC20、stable、重新设计科学图或公网发布。当前 RC19 layout-first 成果应保留；不复活旧 route-first 产品方案。

先读根 `AGENTS.md`、`prompts/AGENT_RULES.md`、`prompts/CHATGPT_RULES.md`、`TODO.md`、`prompts/tasks/asteria_v2_rc19_layout_first_graph_convergence_task.md`、其 `results/asteria--rc19-layout-first-graph-convergence/result.md` 和前一轮 `asteria_v2_rc18_parent_acceptance_review.md`。TODO 是方向背景，不授权大重构；旧 RC10 audit README 不能覆盖 RC19 实际任务。

本新增任务文档按用户本次明确的 GitHub 准备授权落位；未来源码实施必须在根规则指定的活动 `/home/yuukias/code/Asteria` 工作树完成，不因本提示词是 GitHub 文件就改用 Contents API 修源码。未登录核实该工作树的 dirty/owner/活动 Goal；执行前只读核实，不另建 checkout，不覆盖旧任务结果。

结果写 `results/asteria_validator_hardening_20261022_result.md`，审查写 `prompts/tasks/asteria_validator_hardening_20261022_review.md`；图形证据需要时写单一 `results/asteria_validator_hardening_20261022/VISUAL_REVIEW_PACK.md`。允许更改现有验收脚本、tests/browser、隔离控制样例、package 测试接线和必要结果文档；不得因此更改科学 fixture、trace/session 合同、部署配置、固定 URL 或版本号。若检测到产品缺陷，先留回归，再沿原产品任务已有批准范围修；超范围交原 Planner。

## 已核实的盲区及实施职责

| 原有对象 | 动作与当前问题 | 校准和旧能力保护 |
|---|---|---|
| `scripts/validate-architecture-rc19.mjs:routeGestalt` | REPAIR_HARNESS/ENHANCE：`avoidableEdgeCrossingCount` 和 `floatingRelationLabelCount` 直接赋 0；缺 routeRatio/routeScore 又回 0，没测量看似最好。A40/A41 | 用实际几何/标签测量替代常量；无数据、NaN、Infinity、缺边和不适用分开；good 无冲突、bad 真实交叉/漂浮、missing 无测量、unchanged 合法共享端点/关系列均要覆盖。不能把任意相交都称“可避免”，该专业定义先沿已批准标准确认。 |
| `tests/browser/asteria-v2-rc.spec.ts:rc19RouteGestalt` | REPAIR_HARNESS/ADD_CASE：交叉计数同样常量 0，多项只读应用自报 data-route 属性；当前真实浮动标签检查要保留。A43 | 从最终 SVG path/实际屏幕坐标/可见卡片与标签边界独立核验；变造自报指标但保持坏渲染仍应拒绝。SVG/HTML 同坐标系，含缩放/Inspector 宽度。 |
| `changedProtectedTruthFiles` | ENHANCE：当前无基准 `git diff --name-only --` 漏掉 staged 和 committed 变更。A33/A42 | 冻结批准科学基线 SHA，与完整候选比较，再检查 index/worktree；在隔离临时测试 repo 检查未暂存/暂存/已提交/无改动/基线缺失，不在真实仓改科学文件造坏例。clean tree 不等科学未变。 |
| 已有 browser geometry/assert helpers 与 `test:architecture-kernel`、`test:canonical-trace`、`test:cat-trace-bridge` | REUSE/ADD_CASE：真实关系、方向、Clear、Save/Restore、跨视图搜索、trace OFF 普通选择不重排。A03/A08/A09/A12/A14/A15/A19/A34 | 保留 assertNoNodeOverlap、assertNoPrimaryTextClipping、assertNoEdgeLabelNodeCollision、assertLineagePresentationGeometry 的真观察；Both 是根出/入可达集合之并，不沿中途任意反向游走。 |
| 图形/数学/响应式/键盘与整屏 producer QA | ENHANCE/ADD_CASE：A01/A02/A04–A07/A10/A11/A13/A16–A18/A20–A32/A35–A38/AX01–AX05 | 卡片/箭头实际接触、Full model 可读 reset、Original TRACE、Lineage/Evidence、Light/Dark 与祖先 opacity；KaTeX 存在不等数学能读，tooltip 不补主标题截断。保留 RC13 通用布局的正确能力，修验收而非一概否定。 |
| RC 累积回归与结果归档 | MERGE/RETIRE 仅有证据才执行；A39/A44/A45/A47 | 按稳定用户性质去重，逐项给旧坏例/原保护迁移表，保持 `npm run test:regression` 正常入口；不能为省时删失败测试，不能按 RC 继续无限新增同义脚本。 |
| `capture-architecture-rc19-selfqa.mjs`、现有 Parent 与公开 smoke | REUSE/ENHANCE 结果身份与消费；A36/A38/A46 | exact candidate 的截图、静态/浏览器检查、独立 Work、用户结论各自保留。旧 Work PASS 被当前用户反证推翻时失效，不跨候选复用。 |

## 标准冲突必须明确处理

当前 RC19 任务 §8 写 `SIMPLE_ARCH_EDGE_MAX_ROUTE_RATIO <= 1.30`、`ARCH_EDGE_P95_ROUTE_RATIO <= 1.45`；当前静态脚本使用 max 1.45、p95 1.35，浏览器 max 1.45。先找已批准后续修订与独立 review，确定权威门槛和几何定义。没有正式替代证据就保留原冻结要求并显式报告偏差；不得挑最宽数值或把阈值改成当前产物恰好能过。标准争议只暂停该判定，新测量、反例及其他既定保护继续实施。

`routeGestalt` 等新测量/严重假绿修复须独立审查观察器及其控制集；执行者只能报告自检。不能用“没有改科学文件”的自述 carry forward W02，必须给批准基线到候选的可复核 diff 与行为影响范围。

## 可直接执行的步骤

1. 建立现有检查职责→历史 ID→源码→正常命令的小表，冻结上述 good/bad/missing/unchanged 控制集。先跑纯 Node 的旧盲区反例，确认输入能检验漏检而非断言源码字面。
2. 在原脚本内修测量及基线范围，必要时提取复用 helper；不要新建通用图形验收平台。校准 path 交叉、标签偏移、屏幕 transform 和缺 metric；加入不同结构的 synthetic graph，不能只为 CAT-TRACE 特判 entity IDs。
3. 接入原 `npm run test:architecture-rc19` 和 `npm run test:regression`；当按稳定语义归并时保留旧命令兼容或明确替代去向。对 parser/基线保护可先低成本运行；浏览器需要真实本地 UI，不能把 server-side layout 结果当成真实屏幕。
4. 受影响图形浏览器矩阵至少覆盖 1536×864 / 1366×768、Light/Dark、Architecture Overview/Full reset、CAT 与 Original TRACE、Lineage 3/6-source、Evidence 和开/关 Inspector。对 trace OFF 连续选择核对节点集合不变、坐标/路径稳定；具体容差用原冻结合同。再测 explicit Trace 的正确方向/可读上下文。
5. 按仓库阶梯运行聚焦检查、`npm run test:regression`、`npm run test:browser`、`npm run build`；涉及性能/bridge 时补既有 `bench:architecture-g05`/`test:cat-trace-bridge`。未具备浏览器环境不能报全链通过。记录合并前后覆盖/耗时，不能凭脚本数称增强。
6. 若触及用户 UI，先按当前正式 AI Skills Maintainer / Frontend Design / Bridge 入口核版本与 project validate，遵守 stale session 要求；再遵守 `SCIENTIFIC_GRAPH_VISUAL_SYSTEM.md`、`DEVELOPER_VISUAL_SELF_QA_CONTRACT.md`、`VISUAL_ACCEPTANCE_CONTRACT.md`。至少两轮实际看图，不用数值代替整屏读图。纯验收代码维护不自动触发产品设计重做/插件更新。
7. 标准、golden、观察器变化交原独立途径审核；若需要产品 Work，只保留一个现有 canonical Parent。准备新 ready-to-paste 黑盒 Parent 时必须读取并全文逐字 inline 当时 `UI_BLACKBOX_BROWSER_CONTRACT.md`，不得只贴路径。本文件是 Codex 实施任务，六仓协调 Critic 也是实施包评审，二者均不是产品黑盒 Parent。
8. reviewer 范围按真实触及面选择：broad visual/semantic 变化扩全范围，窄变更用受影响 lane 加 release red-team；旧 PASS 的 carry-forward 有明确依据。P0/P1 和 unresolved must-fix P2 未清不能进最终用户验收，不能让用户替 producer 做首轮看图。

## 副作用、停止和结果入口

本任务不授权启动/重启 shared server、Cloudflare/tunnel、修改固定公网部署或发布 stable；本地检查若需已有运行服务，先读 `docs/operations/development/RUNTIME_OPERATIONS.md` 并避免重复 server。正式固定 URL 是 `https://asteria.httpwwwcardiacnexus-ukb.com/`，不可临时换 URL 求过审。缺合法浏览器/部署身份只报告未证，继续纯代码校准；需要标准决策时沿原 NEEDS_GPT_PLANNER/NEEDS_EVIDENCE，不自行放宽。

根规则允许验后普通提交，执行前检查 staged diff 和当前发布授权；本次准备不等于产品部署授权，GitHub 文档提交不证明远程工作树 clean。结果必须说明完整候选 SHA、受保护科学基线、测试/观察器版本、真实截图及批准来源。

未来 adapter 推荐从本任务结果及其引用的既有 Playwright 原生报告和 `ROUTE_GESTALT` JSON 读取，固定一份结果清单入口，不重写几何/科学逻辑。逐项输出 observed/missing/未适用与原因；真实零和未测量不能同值。保留原始截图与测量坐标证据、标准版本和变更失效条件。

## 执行方法、准入与成本

本文件是准备完成的实施包，不是本轮已执行、独立批准或产品通过的证明。用户将本任务交给当前合法 Codex 执行入口后，在已有授权和专业标准内 IMPLEMENT：回读本仓规则与当前任务 → 核对下列已有程序及当前调用关系 → 先冻结适用的 good/bad/missing/unchanged 输入与预期 → 增强原程序或加案例 → 接入原正常 runner → 运行当前合法目标 → 按产品/观察器/环境/标准归因修复 → 重跑受影响检查 → 写真实结果。发现历史失败先核当前源码与证据；没有复现不得擅改已修产品。

动作仅取 REUSE、ENHANCE、ADD_CASE、NEW、REPAIR_HARNESS、MERGE/RETIRE、BLOCKED_REAL_EVIDENCE。NEW 必须证明观察对象或失败含义确实不同，说明现有程序为什么不能承担；同类检查缺样例只 ADD_CASE，误报漏报先 REPAIR_HARNESS。合并/退休须保留旧坏例、旧正确行为和消费者去向，不设新增数量配额。

专业标准沿本仓有效合同。既有冻结标准内的低成本小回归继续使用原授权；新专业判断、阈值/golden/来源/观察器变化、严重假绿、产品和验收器实质联动修改，须由已有独立 Reviewer/Verifier/GPT Work 途径批准相应候选与控制集。候选作者不能同时改标准答案制造通过。独立审查不由本执行会话自签，不默认创建 subagent、远程任务、schedule 或第二评审平台。本专项提供一份六仓协调审查入口；各仓单独裁定，任一仓等待不阻其他仓。实际高影响权限仍由用户决定，审查通过不能代替授权。

开始时核 repository/branch/HEAD、git status 与 git worktree list、当前 Goal/已存在任务和 owner。本文 SHA 是读取基线，不是要求回退：HEAD 前进时比较差异并记录新的实际起点；同范围新增代码要纳入，标准或权限变更则停依赖部分。不得切换/新建分支、重置、stash、restore/clean、覆盖既有 Goal、修改别的任务结果或抢占其运行资源。脏工作只记录归属，无法确认的文件不动；无权或无法查看远程工作树时记录未核实，不能声称无冲突。

只修改下列项目范围内的验收逻辑、测试、隔离 fixtures、必要 runner 接线和本任务结果。产品 bug 必须先有复现回归，且仅在现有明确批准的产品代码范围修复；其他产品改动交回原 owner，不把本验收任务扩成新产品设计。不得修改根规则、生产配置、发布状态、现有 Goal、中央 DA、Bridge 或 AI Skills 源码。

先运行最便宜、最相关的检查；共享状态/格式/runner 变更扩展到受影响旧能力，收口再跑项目规定的累计阶梯。不为文档变化打开真实产品或全量设备。沿原预算，不新增付费 API，不无限重复相同失败；第二次相同失败且无新证据时先判断根因，保存具体恢复点。缺账号、设备、现场权限或独立结论只停依赖路径，可合法的程序/隔离样本工作继续。未运行、跳过、崩溃、超时和缺证据分别报告，退出 0 不自动等于专业通过。

## 未来 Delivery Assurance 的薄适配

本专项消费已通过的 DA 设计原则，完全不依赖其 P0、Hook、共享核心或最终签发。复用本仓现有 JSON/报告；只补确实缺失的信息：稳定检查名、适用对象与候选身份、标准来源/版本、实际 argv/正常入口、逐项原生结果和原因、原始证据路径、检查/观察器版本及失效条件、历史来源 ID。本仓 PASS/FAIL/未证语义可在未来映射 PASS/FAIL/UNKNOWN。

正常 runner 必须实际产生并保存逐项结果，当前 Executor 实际读取失败并修复；原结果入口必须保留缺项和未证范围，不能只写自评 READY。这是项目内结果消费，不宣称已实现 DA 的正常 host 结束拦截。未来薄 adapter 从本任务指定的单一既有结果入口读取并转换；不实现 da/2 GateDescriptor/ProjectAdapter 全协议、激活服务、通用控制器或新状态数据库。停用未来 DA 时项目检查仍可直接运行。

## 交付与真实计数（由实施 Codex 填写，禁止预填）

在本任务指定的结果文件中，用实际 diff、正常 runner 调用和原始运行记录填：

- NEW_VALIDATORS：真正新增独立检测语义且已接入正常 runner 的类别数。
- ENHANCED_VALIDATORS：实际增强的原验收器数；同一验收器改多处只计一次。
- NEW_REGRESSION_CASES：实际新增且已运行的代表性案例数；参数展开、重跑、截图和辅助文件不重复计数。
- REUSED_VALIDATORS：未修改而实际复用的既有检查数。
- MERGED_OR_RETIRED：数量、旧名称、替代者、所有旧坏例与受保护行为去向。
- ACTUALLY_RUN：检查名、完整命令、退出码、逐项结果、当前代码/产物/运行身份和原始证据。
- NOT_RUN_OR_UNKNOWN：未跑的准确范围、缺少的账号/设备/权限/独立结论或阶段前提，以及同任务恢复入口。
- HISTORICAL_COVERAGE：下列所有原始 source_scoped_id 逐项对应当前已证缺陷、历史已修待回归、可靠保护、观察器缺陷、正式替代、环境待验或仅担忧；写动作、检查路径、运行证据或未证原因。不能删除 ID，也不能将历史条数当当前缺陷数。
- FUTURE_DA_ADAPTER_ENTRY：一个推荐结果入口、原生数据格式、候选绑定及现有消费者；标明未来只转换、不重写专业逻辑。

每个新增/增强项目必须写一条完整中文：“它防什么过去的真实错误；何时由哪个正常命令调用；哪个坏例被识别；保护哪项正确行为；证据在哪里”。机械检查通过、原生成品通过、独立审查通过分别报告。NEW_VALIDATORS=0 可以正确；程序存在、fixture 绿或旧审查通过不能算当前产品通过。结果还须写修改/未修改范围、验证限制、commit/push 状态及是否需重启/重连；未经授权不执行重启或发布。

## 共同来源

[六仓主任务](https://github.com/YuukiAS/AI_Research_Toolkit/blob/research/software-production-decision-20261013/docs/research/software-production/23_SIX_REPO_VALIDATOR_SPRINT_20261022/GPT_WORK_MASTER_PROMPT.md)；同研究分支 `22_DELIVERY_ASSURANCE_GLOBAL_WORK_RESEARCH_20261022/WORK_OUTPUT/` 的 02、03（E4–E8、R1-AR02、F4、R2）、04、06 仅给兼容方向；`12_COMPLEX_DELIVERY_REQUIREMENTS_INTAKE_20261015/11_RAW_CASES_ONLY_NO_SOLUTION_MAPPINGS.csv` 与 `22_DELIVERY_ASSURANCE_GLOBAL_WORK_RESEARCH_20261022/WORK_OUTPUT/05_HISTORICAL_COVERAGE.csv` 给历史原 ID 和设计映射，不能当当前运行证明。研究仓 main 的 `COMPLEX_SYSTEM_DESIGN_GUIDE.md` 与 AI_Skills_Collection main 的 `docs/workflows/{PLANNER_ROLE_CONTRACT,CRITIC_ROLE_CONTRACT,PLUGIN_CAPABILITY_GATE_POLICY}.md` 保留独立准入和专业边界；不引入它们的中央实施工程。


## 52 条历史登记逐项交付

以下原摘要与原登记状态只提供历史取证线索；审计文本中的“本轮实测”属于当时研究，不是本准备任务运行。原引用见研究仓 04_SIX_REPO_AUDIT/ASTERIA.md，晚到补充见 raw CSV 的 source_path/source_line。

- `Asteria:A01`：核心数学符号原始LaTeX/截断，图不能独立读懂。[R4 P1-A]（原登记：历史）
- `Asteria:A02`：1366屏下标题/副标题/lane挤压，Inspector占去中央读图空间。[R4 P1-B/P2-H]（原登记：历史）
- `Asteria:A03`：Clear 后递归计数、layer和高亮残留，Inspector却切到另一个对象。[R4 P1-C]（原登记：历史状态矛盾）
- `Asteria:A04`：Light主题非选中节点/边像水印，trace开启后上下文不可读。[R4 P1-D；R5 P2-H；R6 P1-B]（原登记：多轮历史复发）
- `Asteria:A05`：活跃追踪路径交叉、方向和层级不清。[R4 P2-A；R6 P2-F]（原登记：历史）
- `Asteria:A06`：Inspector像schema调试面板，同层堆满字段。[R4 P2-B]（原登记：历史信息架构错误）
- `Asteria:A07`：发布/工程标识、内部ID、验证细节、raw JSON进入主阅读层。[R4 P2-C；R5 P2-E]（原登记：历史）
- `Asteria:A08`：跨图搜索缺结果来源/空状态/跳转反馈，旧trace掩盖结果。[R4 P2-D]（原登记：历史）
- `Asteria:A09`：视图已Lineage/Evidence，右侧外层仍叫Architecture。[R4 P2-E]（原登记：历史）
- `Asteria:A10`：model selector键盘难到达，Tab穿越大量节点才到控制区。[R4 P2-F]（原登记：历史）
- `Asteria:A11`：新研究者不理解Project/View/Model及三个视角用途。[R4 P2-G；R5 P2-G]（原登记：历史认知问题）
- `Asteria:A12`：Restore后搜索和旧状态半恢复，操作提示跨新上下文残留。[R4 P3；R5 P2-I]（原登记：历史）
- `Asteria:A13`：全图同时塞入过多节点、边、徽章，虽能渲染仍无法读模型。[R5 P1-A]（原登记：历史产品方向问题）
- `Asteria:A14`：Recursive/Both在中途同时走入边和出边，方向集合错误。[R5 P1-B]（原登记：历史真实算法缺陷）
- `Asteria:A15`：清空后默认选中又自动激活trace，形成假清空。[R5 P1-C]（原登记：历史）
- `Asteria:A16`：开放尾对象被列为孤立，必要关系缺失。[R5 P2-A]（原登记：历史科学来源/图关系问题）
- `Asteria:A17`：公式带分组/列索引，元数据却显示无索引。[R5 P2-B]（原登记：历史）
- `Asteria:A18`：证据或定理待完成却显示“不适用”。[R5 P2-C]（原登记：历史语义错位）
- `Asteria:A19`：数据集被叫Claim Inspector，递归上下文却显示直接关系说明，切对象仍停在旧滚动位置。[R5 P2-D]（原登记：历史）
- `Asteria:A20`：Why it matters、Evidence缺口和Diff解释都是图拓扑/数量模板，不是科学意义。[R5 P2-F；R9 Must-fix4；R10 Must-fix3]（原登记：多轮历史复发）
- `Asteria:A21`：skip links在可访问性树里却不是可靠首个可见Tab入口。[R6 P1-A]（原登记：历史）
- `Asteria:A22`：Advanced折叠控件鼠标、Enter/Space都不可靠。[R6 P2-A]（原登记：历史真实交互失败）
- `Asteria:A23`：顶部Export只触发隐藏动作，用户无反馈。[R6 P2-B]（原登记：历史）
- `Asteria:A24`：紧凑顶部按钮无可访问名称、目标太小。[R6 P2-C]（原登记：历史）
- `Asteria:A25`：Full model没有可发现的局部缩放/平移/复位；Fit仅缩成一张极小海报。[R6 P2-D；R17]（原登记：历史）
- `Asteria:A26`：label/value贴在一起，如ProjectCurrent。[R6 P2-E]（原登记：历史）
- `Asteria:A27`：Lineage多条粗曲线/平行线在目标前形成巨大结，关系文字漂在线上。[R9 Must-fix1]（原登记：历史整体关系语法失败）
- `Asteria:A28`：Lineage目标靠右裁切、source副标题仍是schema语言。[R9]（原登记：历史）
- `Asteria:A29`：只优化CAT总览，Full model及Original TRACE节点仍重叠。[R9 Must-fix2]（原登记：历史覆盖偏差）
- `Asteria:A30`：数学转为大写ASCII或KaTeX在容器内碎裂成竖排。[R9 Must-fix3；R10 Must-fix1]（原登记：历史，依赖存在不代表效果）
- `Asteria:A31`：Advanced显示已折叠但rawJSON/警告仍可见。[R9 Must-fix5]（原登记：历史）
- `Asteria:A32`：主科学卡片使用line-clamp/省略号，核心名称不可识别。[R10 Must-fix2]（原登记：历史设计允许的信息丢失）
- `Asteria:A33`：“没有碰科学真值”的执行者报告被用于复用旧专业审查。[R6、R9、R10 复审策略]（原登记：条件性有效做法，证明链须补全）
- `Asteria:A34`：trace关闭时普通选择仍改变可见节点/布局，违背“只更新Inspector”。[R17 Root cause]（原登记：历史可复现）
- `Asteria:A35`：使用固定虚拟画布和高度推导缩放，Fit不依实际render范围。[R17 Full-model fit]（原登记：历史根因）
- `Asteria:A36`：Work未充分发现全局箭头/标签噪音，用户截图推翻受影响通过。[R17 Human override]（原登记：历史审查漏检）
- `Asteria:A37`：去箭头、去标签仍未解决长绕行/蛇形曲线，route-first架构本身错误。[R18]（原登记：历史关键架构失败）
- `Asteria:A38`：RC18生产者自评零问题、完整回归通过，后续独立W01仍失败且用户指出更大问题。[R18；OUT18]（原登记：历史实际证据冲突）
- `Asteria:A39`：RC19结果记录修改若干旧RC验证器后测试通过。[OUT19]（原登记：当前报告事实；不据此指控作弊）
- `Asteria:A40`：`routeGestalt`的交叉数和浮动标签数直接赋0。[AS]（原登记：当前源码缺口；本轮提取函数负例已执行）
- `Asteria:A41`：routeRatio/routeScore缺失被当0，可让没有测量的数据看似最佳。[AS]（原登记：当前提取函数实测）
- `Asteria:A42`：科学文件保护用无基准`git diff --name-only --`，暂存和已提交修改不在检查内。[AS]（原登记：当前缺口；本轮临时Git实验验证）
- `Asteria:A43`：浏览器 `rc19RouteGestalt`仍把交叉计数置0；部分路径只依应用自己暴露的data-route指标。[AB 约2250行后]（原登记：当前源码观察，未运行全浏览器suite）
- `Asteria:A44`：测试文件/命令按RC不断累加，旧断言随新实现改写，可能形成昂贵而失真的“累计保护”。[AJ；OUT19]（原登记：当前结构事实及维护风险，未测耗时）
- `Asteria:A45`：审计目录README还写RC10，而当前package/有效任务是RC19。[AR；AJ]（原登记：当前文档状态不一致）
- `Asteria:A46`：测试/截图成功和公开URL刷新被混成可发布成品。[OUT19；AV]（原登记：来源已要求分层，实际消费仍须验证）
- `Asteria:A47`：低严重度/部分未测条件被机械扩大为每轮六路重审。[R6 §下一轮；R10 §策略]（原登记：已有正确裁剪经验）
- `Asteria:AX01`：RC7同一Light+trace对比问题，W01给PASS+P2而W05给FAIL；祖先opacity可把active label再次淡化。[A7]（原登记：LATE_EVIDENCE_HISTORICAL_NOT_REPLAYED）
- `Asteria:AX02`：RC8全部指定Work通过后，用户仍一眼发现六类图/动效/遮挡/数学/模板文案问题。[A8、AH8]（原登记：LATE_EVIDENCE_HISTORICAL_NOT_REPLAYED）
- `Asteria:AX03`：RC13内部virtual targetPort正确，屏幕上箭头却不接卡片：SVG缩放，HTML固定virtual px，不在同一响应式坐标系。[A13]（原登记：LATE_EVIDENCE_HISTORICAL_NOT_REPLAYED）
- `Asteria:AX04`：1366开启Inspector后，百分比节点中心与固定px卡片宽度组合越界；只移三个特殊节点不能泛化。[A13]（原登记：LATE_EVIDENCE_HISTORICAL_NOT_REPLAYED）
- `Asteria:AX05`：RC13通用布局本身比旧方式好，失败集中在响应式整合；全部推翻会丢正面能力。[A13]（原登记：LATE_EVIDENCE_HISTORICAL_NOT_REPLAYED）
