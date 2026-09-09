---
id: asteria_v2_core_autonomous
title: Autonomously deliver Asteria 1.0 freeze through Asteria 2.0 final Web RC
created_at: 2026-09-09
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Asteria 2.0 Core Autonomous Goal — 从 accepted concepts 一路开发到最终 Web RC

## 0. 用户意图

用户有多个研究和开发项目，没有时间逐阶段盯 Asteria。除非出现真正的 blocker，本任务应自主推进：

1. 先把用户提供的 A/B/C/D/E1/E2 六张 accepted concept 图片归档进 repo；
2. 冻结现有 1.x 为 `1.0.0`；
3. 重构 Asteria 2.0 semantic kernel；
4. 首先实现 **Original TRACE** 与 **CAT-TRACE Frozen V2** 两个 canonical model variants；
5. 完成 Architecture / Symbol Trace / Semantic Diff；
6. 完成 Lineage / Evidence multi-view；
7. 做 performance、browser、visual fidelity QA；
8. 到 `2.0.0-rc.2` 后停止，交给用户做一次集中最终验收。

常规 schema、组件、store、CSS、测试、布局与重构决策不要询问用户。不能为了“自动化”降低质量；任何 gate 未通过就修复或停止，不能跳过失败阶段继续做后面功能。

当前仍以 **Web 版本** 为交付目标。Tauri/Electron desktop、Figma full workflow、AI 自动建图都不阻塞本任务。

## 1. 开始前：只做一次 accepted concept 归档

用户会把以下六张图片作为本任务附件或明确的本地输入提供：

```text
Asteria2_A.png
Asteria2_B.png
Asteria2_C.png
Asteria2_D.png
Asteria2_E1.png
Asteria2_E2.png
```

先确认六张都可读取。只在任务附件、用户明确给出的路径、当前工作区附近或常见 Downloads 输入位置寻找这些**精确 basename**；不要为了找图扫描整个磁盘，也不要联网重新下载/生成。

把原图按字节复制到：

```text
docs/design/accepted-concepts/
  A_light_architecture.png
  B_dark_architecture.png
  C_symbol_trace.png
  D_variant_diff.png
  E1_lineage.png
  E2_evidence.png
  README.md
```

`README.md` 记录：

- A = Light Architecture reference；
- B = Quiet Celestial Dark Architecture/shell reference；
- C = Symbol Trace interaction reference；
- D = Original TRACE → CAT-TRACE semantic diff visual reference；
- E1 = Lineage information architecture reference；
- E2 = Evidence information architecture reference；
- 图片只决定 visual / interaction language，不是数学、citation、result status 的 source of truth；
- 任何图片内公式、作者、状态或数值与 canonical references 冲突时必须忽略图片内容。

不要修改、重编码或压缩原图。如果六张图缺任何一张，**在写代码前停止**，结果中列出缺失 basename。用户只需要补缺图，不需要重新规划任务。

完成归档后，图片与 README 作为本次第一笔独立 maintenance commit 提交并普通 push；不要把它们混到 G00 版本 commit。

## 2. 当前唯一执行链

accepted concept 归档完成后，按顺序执行：

```text
G00  prompts/tasks/asteria_v2_g00_task.md
  ↓
G01  prompts/tasks/asteria_v2_g01_task.md
  ↓
G02  prompts/tasks/asteria_v2_g02_task.md
  ↓
G03  prompts/tasks/asteria_v2_g03_task.md
  ↓
G04  prompts/tasks/asteria_v2_g04_task.md
  ↓
G05  prompts/tasks/asteria_v2_g05_task.md
  ↓
G06  prompts/tasks/asteria_v2_g06_task.md
  ↓
STOP FOR FINAL USER ACCEPTANCE
```

**不要自动执行 G07 desktop 或 `asteria_v2_release_task.md`。不要自动发布 `2.0.0` stable。**

G05 已不再是用户验收点；G05 通过后自动继续 G06。G06 是最终 Web RC gate。

## 3. 必须先读

在任何代码修改前读：

1. `AGENTS.md`
2. `prompts/AGENT_RULES.md`
3. `prompts/CHATGPT_RULES.md`
4. `ROADMAP.md`
5. `VERSIONING.md`
6. `docs/notes/2026-09-09_asteria_v2_web_delivery_plan.md`
7. `docs/notes/2026-09-09_trace_and_cat_trace_reference_for_asteria_v2.md`
8. `docs/notes/2026-09-08_asteria_v2_current_implementation_audit.md`
9. `docs/notes/2026-09-08_asteria_v2_product_design_and_desktop_strategy.md`
10. `docs/design/accepted-concepts/README.md`
11. G00–G06 active task/spec files。

旧的 `2026-09-08_cat_trace_reference_architecture_for_asteria_v2.md` 与早期 image prompt 是历史参考；如与 2026-09-09 reference 冲突，以 2026-09-09 为准。

如果用户同时附上 Original TRACE paper/supplement 或 `CAT_TRACE_CANONICAL_NOTATION_AND_ARCHITECTURE_20260909.pdf`，可用来只读核对模型，但不要把 PDF 视觉排版当 app layout，也不要擅自修改源研究文件。

## 4. 可恢复执行

检查：

```text
results/asteria_v2_g00_result.md
...
results/asteria_v2_g06_result.md
results/asteria_v2_core_autonomous_result.md
```

已完成 Goal 只有在以下证据同时成立时才跳过：

- matching result 存在；
- gate = READY/YES；
- matching version/commit 存在；
- remote branch 已包含该 commit；
- 后续 repo 没有明确回滚该功能。

否则从第一个不完整 Goal 继续。

如果 session/context 不够，一次只在一个完整 Goal commit + push 后暂停；下次重新执行同一个 task 应从 clean boundary 自动恢复，不要求用户重新说明路线。

## 5. 权限边界

本文件是本 Codex session 的 active task entry，执行权限以本 frontmatter 为准。

`allow_network: true` **只**授权：

- 对现有 GitHub origin 正常 `git fetch`（确有需要时）；
- 对现有 origin 普通 `git push`。

不授权：

- 网页研究；
- 任意外部 API；
- npm dependency 下载；
- telemetry；
- 外部上传；
- force push / force-with-lease；
- 删除 remote branch/tag；
- 修改 git remote；
- 改 fixed public URL / Cloudflare / production infrastructure。

不要因为 sandbox `.git` 写权限问题改用临时 clone 或 GitHub contents API；遵守 `AGENTS.md` 的 active worktree + approved local git escalation rule。

如果真正需要新增 dependency 且 lockfile/本地 node_modules 没有，停止并报告 blocker，不擅自联网安装。

## 6. 两个 model variants 是首批产品真值

### 6.1 Original TRACE

严格参考原 TRACE 论文。至少保护：

```text
y_ij = 1{z_ij > 0}
z_ij = alpha_j + x_i^T beta_j + epsilon_ij
alpha_j ~ TRACE-calibrated N(mu_p(gamma), tau_p^2)
beta_j ~ N_q(nu, Psi)
```

以及原论文真实的 marginal probit / richness / dependence semantics。

不得把 CAT-TRACE 历史 working draft 的 `nu_g`、finite catalogue、grouped tail 结构倒灌进 Original TRACE。

### 6.2 CAT-TRACE Frozen V2

严格以 2026-09-09 reference 为准，至少保护：

- finite catalogue `mathcal K`, `K=|mathcal K|`, `mathcal K_n`；
- deterministic `c(f)` 与 `g(f)`；
- `p_g`, `p_g^*`, `p_g-p_g^*`；
- `y^U_igh` 的 `i,g,h` index order；
- `beta^U_gh = nu + a_g + v^U_gh`；
- `nu` 是总体 environment-response vector，不是 intercept；
- `gamma_g = gamma_0*pi_g`，其中 `gamma_0` 是 total open-tail intensity，`pi_g` 是 composition weight；
- `alpha^U_gh | gamma_g,p_g ~ N(mu_{p_g}(gamma_g),tau_{p_g}^2)`；
- `a_g` sum-to-zero；
- `C_tax` 与 `C_phy` 语义区分；
- residual factor index `d=1,...,H`；
- `Sigma_W` 只在 finite working set；
- catalogue/open-tail discovery decomposition；
- `p_g` not estimand / not true unknown species count。

第一批用户可见 canonical variants 只有这两个。历史 grouped-tail 可以存在为内部测试/未来 variant，但不要在首发 UI 变成第三个正式选择。

## 7. Accepted concepts 是实现规格，不是灵感板

### A/B — Architecture shell

- B 为 dark 主方向；A 为 light projection；
- toolbar、left rail、canvas、right inspector 的空间层级保持类似；
- 主体是 canvas；
- current `public/backgrounds/asteria-celestial-map.png` 优先复用/淡化；
- B 的星点强度上限只是参考，真实实现更克制也可以；
- 不做 SaaS dashboard / bento grid。

### C — Symbol Trace

- selected symbol + upstream/downstream path 联动；
- unrelated graph 降对比但不消失；
- compact Direct/Recursive + Upstream/Downstream controls；
- inspector 与 canvas selection 同步；
- motion 只辅助理解路径。

### D — Semantic Diff

- single stable canvas；
- Added / Modified / Preserved / Hidden；
- before/after Inspector；
- ghost removed/absent；
- 不做 GitHub PR UI；
- 数学必须改用 current two-variant canonical truth。

### E1 — Lineage

- method-level nodes；
- relation semantics；
- CAT-TRACE selected Method Inspector；
- cross-view links；
- 不做普通 citation network。

### E2 — Evidence

- claim-centered graph；
- theory/proof/simulation/real-data/implementation/open-gap 可区分；
- Claim Inspector；
- pending/limitation 是一等 relation；
- 不做 project-management status dashboard。

概念图内作者名、公式、citation、simulation status、real-data status 不可直接复制；seed truth 来自 repo references/results。

## 8. Product Design / frontend skills

如果当前 Codex 环境有 Build Web Apps 或等价 frontend skills，G05/G06 必须优先读取：

- frontend app builder / product design；
- React best practices；
- frontend testing/debugging。

用途：

- 从 accepted concepts 提取 design tokens；
- 建 implementation inventory；
- 组件边界；
- browser screenshot fidelity QA；
- responsive / typography / icon / interaction polish；
- React hot-path 性能约束。

不要用 product-design skill 重新发散新 shell。Accepted concepts 已经是 active design spec。

### Figma

默认**不使用**。只有真实实现后出现明确影响多个组件的 token/component ambiguity，并且可用 Figma connector 能直接降低歧义时才使用。没有 Figma 不构成任何 blocker，也不要为了“更完整流程”主动把所有界面再画一遍。

## 9. 每个 Goal 的执行协议

对 G00–G06 每一阶段：

1. 读取该 Goal task + spec；
2. 确认上一 Goal gate；
3. `git status --short`，保护 unrelated work；
4. 实现当前 Goal，不提前塞后续 ontology/function；
5. 为 bug/fix 添加聚焦 regression；
6. 跑该 Goal 规定的 build/regression/browser/performance checks；
7. 写 `results/asteria_v2_g0X_result.md`；
8. 检查 diff，只 stage 当前 Goal；
9. 更新 package/version/changelog/readme（按 AGENTS/version rules）；
10. 创建该 Goal 的版本 commit；
11. 普通 push；
12. 核实 HEAD 与 remote 对齐；
13. gate = YES 才继续下一个 Goal。

各 Goal 必须是独立 commit，不 squash 成一个巨大提交。

## 10. 决策自主权

无需询问用户：

- schema optional fields；
- TypeScript interface 细节；
- store/slice 文件拆分；
- selector/helper 命名；
- fixture 组织；
- test implementation；
- CSS spacing / radius / icon placement；
- 合理 motion duration/easing；
- internal benchmark；
- component extraction；
- light/dark token 实现；
- 两个同等合理的小布局选择；
- ordinary refactor 顺序。

判断优先级：

```text
statistical/model correctness
→ data compatibility
→ interaction correctness
→ performance
→ maintainability
→ accepted-design fidelity
→ visual polish
```

## 11. 性能红线

不得：

- 把整个 semantic project 直接当 React Flow nodes；
- 为每个 symbol/method/claim 默认创建重型 TipTap block；
- recursive trace 每次全文扫描 rich text；
- 继续扩大核心组件 full-store `useMapStore()` subscription；
- layout drag 复制完整 semantic graph；
- view switch 重建整个 canonical graph/index；
- 用持续 JS animation / WebGL / 3D / particles 掩盖延迟。

最终至少维护：

- 约 2,000 semantic entities / 5,000 relations fixture；
- 约 200–300 visible nodes / 500–800 edges 单 view fixture；
- trace/view-switch/search/outline 场景；
- rich-text typing 不引起无关大范围 rerender 的 evidence。

## 12. Evidence truthfulness 红线

Asteria 的 Evidence view 不能因为概念图“画得像完成了”就制造完成状态。

- theorem/proof 只按实际 repo/source 状态；
- simulation 没跑完就 `planned/pending`；
- real data 没结果就不能 `empirical support`；
- implementation equivalence test 只有真实 test passed 才 `validated`；
- future marked-discovery distributional theorem 保持 pending；
- 第一篇论文主 real-data chain = Finland fungi + Malagasy arthropods + South-West Australia plants；GSMc 后置。

## 13. 只在这些情况停止

1. accepted concept 六图不齐；
2. unrelated dirty changes 继续会覆盖；
3. 需要不可逆数据迁移；
4. 需要 credential、付费服务或 dependency download；
5. correctness/compatibility/performance gate 合理修复后仍失败；
6. 必须更换 frontend framework 才能继续；
7. 必须改变 fixed public URL / production infra；
8. accepted design 与技术约束发生无法兼容、且会永久改变核心 workflow 的冲突；
9. G06 已完成，进入最终用户验收。

普通视觉选择不是停止理由。

## 14. 会话中断恢复规则

如果因上下文、执行环境或时间无法一次完成 G00–G06：

- 只在一个 Goal 已完整 test + commit + push 后暂停；
- 不留下“半完成但没 result”的含混状态；
- 维护：

```text
results/asteria_v2_core_autonomous_result.md
```

暂停时写：

```text
AUTONOMOUS_CHAIN_STATUS = PAUSED_AT_CLEAN_BOUNDARY
NEXT_GOAL = G0X
```

下次重新执行同一 task，从 `NEXT_GOAL` 继续。

## 15. 最终 Result

除各阶段 result 外，持续维护：

```text
results/asteria_v2_core_autonomous_result.md
```

记录：

- accepted concept archive commit；
- completed Goals；
- version / commit / remote alignment；
- model fixture correctness；
- tests；
- browser QA；
- performance summary；
- visual fidelity summary；
- blockers；
- next action。

G06 完成时最后必须写：

```text
AUTONOMOUS_CHAIN_STATUS = COMPLETE_THROUGH_FINAL_WEB_RC
ASTERIA_V2_WEB_RC_READY_FOR_USER_ACCEPTANCE = YES/NO
CURRENT_VERSION = 2.0.0-rc.2
NEXT_ACTION = FINAL_USER_ACCEPTANCE
```

然后停止。不要自动发布 `2.0.0`，不要自动进入 desktop。