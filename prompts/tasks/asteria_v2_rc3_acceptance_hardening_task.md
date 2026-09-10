---
id: asteria_v2_rc3_acceptance_hardening
title: Harden Asteria 2.0 RC2 into a genuinely acceptance-ready RC3
created_at: 2026-09-11
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Asteria 2.0 RC.3 Acceptance Hardening Goal

## 0. 任务目的

`2.0.0-rc.2` 已完成 G00–G06 的既定 gate，但后续源码审计发现：中央 Architecture / Lineage / Evidence canvas 仍保留若干 fixture/demo renderer 痕迹，尚未完全由 canonical graph、view projections 与 typed relations 驱动。

本任务不是新一轮产品开发，也不是重新设计 Asteria。目标是做一次**窄范围最终验收硬化**，把已经完成的数据架构真正贯通到中央用户界面，然后生成可追溯的最终验收证据。

目标版本：`2.0.0-rc.3`。

完成后才允许返回：

```text
ASTERIA_V2_WEB_RC_READY_FOR_USER_ACCEPTANCE = YES
NEXT_ACTION = FINAL_USER_ACCEPTANCE
```

不得自动发布 `2.0.0` stable。

## 1. 开始前必须读

1. `AGENTS.md`
2. `prompts/AGENT_RULES.md`
3. `prompts/CHATGPT_RULES.md`
4. `ROADMAP.md`
5. `VERSIONING.md`
6. `docs/notes/2026-09-09_asteria_v2_web_delivery_plan.md`
7. `docs/notes/2026-09-11_asteria_v2_rc2_acceptance_audit.md`
8. `docs/notes/2026-09-09_trace_and_cat_trace_reference_for_asteria_v2.md`
9. `docs/design/accepted-concepts/README.md`
10. A/B/C/D/E1/E2 accepted concept images
11. `results/asteria_v2_g05_result.md`
12. `results/asteria_v2_g06_result.md`
13. 当前 `ArchitectureWorkspace.tsx`、`ArchitectureReferencePanel.tsx`、architecture types/schema/projection/trace/fixtures、browser tests。

如果 repo/当前 Codex 环境提供 frontend app builder / React best practices / frontend testing-debugging skill，优先读取并使用；但 accepted concepts 已经是 design direction，不允许重新发散新 shell。

## 2. 权限与边界

允许：

- 修改 Asteria 当前 Web 前端、architecture domain、tests、scripts、docs、results；
- 使用现有 npm dependencies；
- 使用已安装 Playwright / Playwright Chromium；
- 对现有 `origin/main` 普通 fetch/pull/commit/push；
- 生成 browser QA screenshot；
- 将本任务最终验收所需的**精简 screenshot evidence** 保存并提交到 repo。

不允许：

- 新 npm dependency；
- force push / force-with-lease；
- 新 branch / PR；
- 修改 git remote；
- 改 fixed public URL / DNS / Cloudflare infrastructure；
- 进入 desktop/Tauri/Electron；
- AI 自动建图；
- 新模型 ontology 或第三个正式 model variant；
- 修改 CAT-TRACE 科学模型定义；
- 把 accepted concept 图片中的公式/citation/status 当 source of truth。

## 3. P0：消除中央 workspace 的双重 source of truth

当前源码中存在以下 acceptance blocker：

```text
stageSymbols
methodPositions
evidencePositions
hard-coded SVG path d="..."
ArchitectureWorkspace 固定 catTraceFrozenV2Project
```

这些不能继续作为最终 RC 的中央 graph 真值。

### 必须达到

中央 workspace 的 node、position、edge 必须来自：

```text
active canonical project/model
+ active ArchitectureView
+ ArchitectureView.projections
+ TypedRelation
```

而不是 component 内第二套手写 graph。

允许保留少量纯 presentation helper，但任何 node identity、source/target、relation type 或 canonical position 都不能存在两套互相独立的真值。

### Renderer 选择

优先评估复用现有 `@xyflow/react` 做轻量 semantic projection，因为它已经是现有 dependency，并适合 node/edge/pan/zoom/selection。

如果继续使用 DOM + SVG 更安全，也可以，但必须做到：

- nodes 从 current view projections 生成；
- edges 从 current project relations 中筛选 source/target 均在 current view 的关系生成；
- edge geometry 根据 source/target rendered positions 计算；
- relation ID/type 可定位到 DOM/test；
- 不保留固定装饰性路径假装 semantic relation。

不得为了本任务引入新 graph library。

## 4. P0：Original TRACE 与 CAT-TRACE 真正同步到中央 Architecture

首批两个正式模型仍只有：

1. Original TRACE；
2. CAT-TRACE Frozen V2。

当前 model switch 不得只改变右侧 Inspector。

建立一个单一 active model state，使以下部分完全同步：

- central Architecture canvas；
- Inspector；
- Symbol Trace；
- Architecture Outline；
- export；
- validation；
- semantic diff context；
- save/restore view state。

### Browser 可观察要求

选择 Original TRACE 后：

- 中央标题/模型状态显示 Original TRACE；
- CAT-TRACE-only nodes，例如 `c(f)`, `a_g`, `gamma_g`, `p_g`, `beta^U_gh` 不得继续作为当前模型节点留在中央 graph；
- Original TRACE 的 `y_ij`, `z_ij`, `alpha_j`, `beta_j`, `nu`, `Psi`, tail calibration / richness 等当前 fixture 对象正确显示；
- Inspector/Outline/trace 与中央 graph 一致。

切回 CAT-TRACE 后恢复 Frozen V2 graph。

不要通过隐藏 DOM + 改标题伪造切换；测试必须检查当前 projection identity。

## 5. P0：真实 relation edge 渲染与 Trace path 联动

### Architecture

每条 visible semantic edge 必须绑定真实 `TypedRelation.id` 与 `type`。

点击 `beta^U_gh` 后至少验证：

- `nu -> beta^U_gh` / `a_g -> beta^U_gh` / `v^U_gh -> beta^U_gh` 的真实依赖关系进入 trace；
- downstream relation 进入 open-tail latent/occurrence/richness 相关对象；
- direct/recursive、upstream/downstream/both 控制真实改变 highlighted relation set；
- unrelated edges 降对比但不消失；
- edge direction 可读；
- reduced-motion 下不依赖动画才能理解状态。

点击 `p_g` 后真实 relation path 至少涵盖 zero-slot bookkeeping、tail/intercept calibration、finite-p/truncation diagnostic 中 fixture 已定义的关系。

### Lineage

中央 visible edges 必须一一来源于 lineage typed relations，例如：

- TRACE -> CAT-TRACE: `extends` / `preserves`；
- HMSC -> CAT-TRACE: `borrows_interpretation_from`；
- bigMVP -> CAT-TRACE: `computationally_inspired_by`；
- MGP -> CAT-TRACE: `uses_methodological_component_from`。

不要把同一 source/target 的多种 relation 无脑画成五条重叠线。可以聚合 presentation，但 inspector/test 必须保留完整 relation truth。

### Evidence

中央 visible edges 必须来自 evidence typed relations：

- proof -> claim；
- implementation -> claim；
- stress/test -> claim；
- dataset pending -> claim；
- limitation/pending -> claim/gap。

`pending` / `limited_by` 必须视觉上与 support relation 有克制但明确的区别。

## 6. P1：真正使用 ViewProjectionNode.position

`ArchitectureView.projections` 已经存在，不允许中央 renderer 继续忽略它。

至少保证：

- current view node position 来自 projection；
- current view viewport 若存在则作为初始/restore state；
- Lineage/Evidence 各自布局独立；
- model/view switch 不互相污染 position；
- current save/restore 至少保存当前 active model/view/selection/filter/viewport；
- 如果本任务安全加入 node drag，则只修改 view projection position，不修改 entity definition；若 drag 会扩大风险，可不作为 RC.3 必需功能，但 architecture data/render contract 必须已经正确。

增加 deterministic regression：修改 fixture 某 projection position 后，rendered layout evidence 必须相应改变，防止 component 再次偷塞 hard-coded position。

## 7. P1：Central workspace 与 Inspector 共享 selection/view/model state

当前通过多个 component local state + custom event 拼接的方式容易漂移。

本任务应收敛成一个清楚的 single-source session state。实现方式由 Codex 自主选择：

- React context；
- 现有 Zustand 中独立、窄范围的 semantic workspace slice；
- 其他等价轻量方案。

不要因此让 Canvas/Inspector broad-subscribe 整个 legacy store。

必须覆盖：

- view switch；
- model switch；
- symbol/entity selection；
- cross-view link；
- search result selection；
- restore state。

中央与右栏永远显示同一个 active view/model/selection。

## 8. P1：Semantic Diff 最低视觉闭环

不要求重新实现一个复杂 Git diff canvas，但当前 D concept 的核心必须兑现：

- single stable Architecture canvas；
- base = Original TRACE，target = CAT-TRACE Frozen V2；
- added / modified / preserved / absent/hidden 状态至少能在中央 graph 或与中央 graph 强绑定的 overlay 中定位；
- Inspector 显示 before/after 或对应 semantic fact；
- 不只在下方列表里出现文字，而中央 graph 完全无响应。

不允许为了 diff 复制两整张 graph。

## 9. Browser QA 必须升级

继续使用现有 Playwright，不重新安装 browser。

现有文本断言全部保留，并新增至少以下 acceptance assertions：

### Model-stage synchronization

- click Original TRACE -> central project/model identity 变更；
- CAT-only nodes 不在 active central projection；
- TRACE nodes/relations 存在；
- switch back CAT -> exact reverse。

### Relation truth

- rendered edge 数量/ID/type 对应 current view projected relations；
- Lineage/Evidence 不允许存在没有 relation ID 的 semantic-looking static edges；
- selected relation/peer 可由 Inspector/Canvas 双向定位。

### Trace-edge truth

- `beta^U_gh` direct upstream edge IDs 与 trace result 相符；
- recursive mode 增加关系 closure；
- direction switch 改变 highlighted edge set；
- clear 恢复。

### Projection truth

- fixture/view projection position 变化可观察到 rendered position 变化；
- independent view positions 不串。

### Visual/responsive

至少：

- dark desktop 1536x864；
- dark laptop 1366x768；
- light desktop；
- Architecture CAT-TRACE；
- Architecture Original TRACE；
- Symbol Trace focus；
- Lineage；
- Evidence。

检查 clipping、overlap、unreadable labels、edge/node遮挡、Inspector overflow、toolbar density、canvas usable area。

## 10. Accepted concept fidelity

A/B/C/D/E1/E2 仍然是 active design spec。

RC.3 重点不是 pixel-perfect，而是把概念图中最关键的产品语义落实：

- A/B：真正以 canvas 为主体，light/dark shell 有一致层级；
- C：点击 symbol 后真实 edge path 联动；
- D：两个 model variant 的中央 graph 差异可见；
- E1：Lineage central edges 真正有语义；
- E2：Evidence central edges 真正体现 support/pending/limitation。

如果 frontend design skill 可用，建立 mismatch ledger。不要重新设计整个 UI。

## 11. Final acceptance artifact

创建：

```text
results/asteria_v2_rc3_acceptance/
  result.md
  screenshots/
    architecture-cat-trace-dark.png
    architecture-original-trace-dark.png
    architecture-trace-focus.png
    lineage-dark.png
    evidence-dark.png
    architecture-light.png
```

截图使用 Playwright 从真实运行页面产生。只保存上述精简最终证据，不把 trace/video/大量临时截图塞进 Git。

`result.md` 必须给出：

- version / commit；
- active renderer/data-flow architecture；
- model switch evidence；
- relation-driven canvas evidence；
- trace edge evidence；
- projection/layout evidence；
- semantic diff evidence；
- browser QA；
- performance；
- regression；
- remaining known limitations；
- screenshot index。

同时更新：

- `results/asteria_v2_core_autonomous_result.md`；
- `README.md`；
- `CHANGELOG.md`；
- `package.json` / lock version；
- 必要的 ROADMAP/VERSIONING 状态。

## 12. 性能不得回退

继续保持至少：

```text
~2200 semantic entities
~6200 relations
~260 visible projection
```

本任务重点是 renderer truth，不追求毫秒数字更低，但：

- graph indexing / trace / layer focus 不得数量级回退；
- main JS 不恢复 G04 的巨大单 chunk；
- view switch 不重建整个 semantic graph；
- relation-driven edge render 只处理当前 projected subgraph；
- 不把 heavy TipTap editor 挂到每个 semantic node。

如果性能变化超过合理波动，必须解释并修复。

## 13. 回归与命令

至少运行：

```text
npm run build
npm run test:regression
npm run test:architecture-g06
npm run bench:architecture-g05
npm run test:browser
git diff --check
```

新增一个聚焦 RC.3 regression，例如：

```text
npm run test:architecture-rc3
```

并加入 cumulative regression。

## 14. Commit / Push / Stop

所有 gate 通过后：

1. version -> `2.0.0-rc.3`；
2. commit message：`v2.0.0-rc.3`；
3. 普通 push 到现有 `origin/main`；
4. 确认 local HEAD == origin/main；
5. worktree clean；
6. 停止，不发布 stable。

最终输出：

```text
ASTERIA_V2_WEB_RC_READY_FOR_USER_ACCEPTANCE = YES/NO
CURRENT_VERSION = 2.0.0-rc.3
FINAL_COMMIT = ...
MODEL_STAGE_SYNC = PASS/FAIL
RELATION_DRIVEN_CANVAS = PASS/FAIL
TRACE_EDGE_LINKAGE = PASS/FAIL
VIEW_PROJECTION_TRUTH = PASS/FAIL
SEMANTIC_DIFF_VISUAL_LINKAGE = PASS/FAIL
BROWSER_QA = PASS/FAIL
REGRESSION = PASS/FAIL
PERFORMANCE = PASS/FAIL
ACCEPTANCE_SCREENSHOTS = ...
NEXT_ACTION = FINAL_USER_ACCEPTANCE / BLOCKED
```

只有上述核心项全部 PASS 才允许 `READY_FOR_USER_ACCEPTANCE = YES`。

## 15. 真实停止条件

只有以下情况停止并报告 blocker：

- unrelated dirty work 会被覆盖；
- canonical source 本身矛盾，无法判断 Original TRACE / CAT-TRACE 真值；
- renderer hardening 必须引入新 dependency；
- 为修复必须破坏 1.x compatibility；
- Playwright browser runtime 再次不可用且无法在现有已安装环境恢复；
- correctness/performance gate 合理修复后仍失败。

普通布局、CSS、边路由、节点尺寸、label placement 不属于人工决策点，Codex 自主完成。
