---
id: asteria_v2_core_autonomous
title: Autonomously build Asteria 1.0 freeze through 2.0 RC
created_at: 2026-09-08
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Asteria 2.0 Core Autonomous Goal

## 0. 用户意图

用户没有时间逐个盯 Asteria 2.0 开发。此任务的目的就是把常规工程决策交给 Codex，自主沿既定 gate 从当前 1.x 一路推进到 `2.0.0-rc.1`，用户只在最后做一次产品验收。

这不是“为了自动化而降低质量”。每一阶段仍必须完整测试、写 result、commit、push。任何 gate 未过就停止，不能继续后面的 Goal 来掩盖问题。

## 1. 唯一执行链

按顺序执行：

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
STOP FOR FINAL USER ACCEPTANCE
```

**不要自动执行 G06、G07 或 `asteria_v2_release_task.md`。**

## 2. 开始前必须读

1. `AGENTS.md`
2. `prompts/AGENT_RULES.md`
3. `prompts/CHATGPT_RULES.md`
4. `VERSIONING.md`
5. `docs/notes/2026-09-08_asteria_v2_master_plan.md`
6. `docs/notes/2026-09-08_asteria_v2_current_implementation_audit.md`
7. `docs/notes/2026-09-08_cat_trace_reference_architecture_for_asteria_v2.md`
8. `docs/notes/2026-09-08_asteria_v2_product_design_and_desktop_strategy.md`
9. G00–G05 task files。

然后检查 `results/asteria_v2_g00_result.md` ... `g05_result.md` 是否已有已验证完成阶段。本任务必须**可恢复**：已完成且 result + commit/remote evidence 成立的 Goal 不重复做，从第一个未完成 Goal 继续。

## 3. 权限解释

本文件是本次 Codex session 的唯一 active task entry，执行权限以本 frontmatter 为准。

- `allow_network: true` 只授权：对**现有 GitHub origin**执行正常 `git fetch`（若确有需要核对远端）和普通 `git push`；
- 不授权网页研究、任意 API、依赖下载、遥测、外部上传；
- 子 Goal 文件若作为 standalone task 使用时按其自身 frontmatter；本 orchestrator 读取它们作为阶段规范时，不得因此扩大本文件明确限制的网络范围；
- 不 force push、不 force-with-lease、不改 remote、不删 branch/tag；
- 不改 fixed public URL、Cloudflare 或 production deployment；
- 不上传 fixture/data 到第三方。

若某阶段确实需要新增 npm dependency，而现有 lockfile 不具备，需要联网下载，则停止并记录 blocker；不要擅自扩大网络权限。

## 4. 每个 Goal 的执行协议

对 G00–G05 每一阶段：

1. 读取该 Goal task；
2. 确认上一 Goal 的 READY gate；
3. `git status --short`，保护 unrelated work；
4. 实现该 Goal，不提前做后续功能；
5. 运行该 Goal 要求的全部测试；
6. 写对应 `results/asteria_v2_g0X_result.md`；
7. 再次检查 diff，只 stage 当前 Goal 文件；
8. 按该 Goal 的 version commit message 提交；
9. 普通 push 到既有 origin；
10. 核实 HEAD 与 remote branch 对齐；
11. 只有 result 中 READY = YES 才继续下一 Goal。

每个阶段形成独立 commit，不能把 G01–G05 squash 成一个巨大提交。

## 5. 决策自主权

以下事项由 Codex自行决定，不询问用户：

- 文件拆分；
- TypeScript interface 的具体 optional 字段；
- selector/helper 名称；
- test fixture 组织；
- CSS 的轻量细节；
- 轻量 motion 的 easing/duration；
- 不改变用户 workflow 的小型 UI placement；
- 内部 benchmark 实现；
- 合理的 refactor 顺序。

判断标准依次是：correctness、V1 compatibility、performance、maintainability、interaction clarity、visual polish。

## 6. 仅以下情况停止等待用户/新任务

1. 需要不可逆数据迁移；
2. 需要改变 fixed public URL / production infra；
3. 需要 credential、付费服务或 dependency download；
4. 出现两个互斥产品方向，无法通过兼容层同时支持，并会永久改变用户工作方式；
5. 某 Goal correctness/performance gate 失败且合理修复尝试后仍失败；
6. 工作树有 unrelated dirty changes，继续会覆盖；
7. G05 已完成，进入最终用户验收。

视觉 layout 仅有“多个都可以”的情况**不是停止理由**：core 阶段保留现有 shell，按 design note 做最小稳定方案；image prompt library 留给最终视觉大改。

## 7. CAT-TRACE 是模型架构 acceptance reference

G02 起必须以：

```text
docs/notes/2026-09-08_cat_trace_reference_architecture_for_asteria_v2.md
```

为 canonical fixture 入口。

不要凭历史 demo 猜 notation。特别保护：

- `y^U_{igh}` index order；
- `β^U_{gh}=ν+a_g+v^U_{gh}`；
- `γ_g=γ_0π_g` 是 derived；
- `p_{U,g}` 是 computational truncation，不是 estimand；
- `a_g` 有 sum-to-zero constraint；
- residual factor index `d`；
- `Σ_W` 只在 finite working set；
- residual dependence 不改变 unit-variance marginal probit mean。

## 8. 性能红线

任何阶段不得：

- 把整个 semantic project 作为 React Flow nodes；
- 为每个微观 symbol 默认创建 TipTap heavy block；
- recursive trace 每次全文扫描 rich text；
- 继续扩大核心组件全 store `useMapStore()` subscription；
- 为一次 layout drag 复制完整 semantic graph；
- 用持续 JS animation/3D/particles 掩盖交互延迟。

G05 必须有 baseline vs RC evidence。

## 9. 视觉与 Product Design

Core 自动链不要求用户中途选 layout。默认保留当前 app shell，并完成 semantic interaction。

若 G05 判断 shell 确实需要明显重设计：

- 不在本自动链内强行 redesign；
- 在 result 中引用 `docs/notes/2026-09-08_asteria_v2_image_prompt_library.md`，列出最值得生成的 2–4 张 concept prompts；
- `ASTERIA_V2_RC_READY_FOR_USER_ACCEPTANCE` 可以在功能/性能满足时为 YES，同时明确视觉 redesign 属于后续可选项；
- Figma 只在最终 visual direction 已选定且需要 component/token spec 时考虑。

## 10. 会话/上下文不足时的恢复规则

如果因为执行环境、会话长度或工具限制无法在一次 session 完成 G00–G05：

- 只在一个 Goal 完整通过并 commit/push 后停；
- 不留下半个 Goal 的含混状态；
- 在当前 Goal result 或 `results/asteria_v2_core_autonomous_result.md` 写：

```text
AUTONOMOUS_CHAIN_STATUS = PAUSED_AT_CLEAN_BOUNDARY
NEXT_GOAL = G0X
```

下次重新运行**同一个** `asteria_v2_core_autonomous_task.md`，它应读取已有 result/commit 并从 `NEXT_GOAL` 自动继续，不需要用户重新规划。

## 11. 最终 Result

除各阶段 result 外，维护：

```text
results/asteria_v2_core_autonomous_result.md
```

记录：

- 已完成 Goal 列表；
- 每阶段 version/commit；
- remote 对齐状态；
- 当前测试总览；
- 性能摘要；
- 未解决 blocker；
- 下一步。

G05 完成时最后必须写：

```text
AUTONOMOUS_CHAIN_STATUS = COMPLETE_THROUGH_RC
ASTERIA_V2_RC_READY_FOR_USER_ACCEPTANCE = YES/NO
NEXT_ACTION = FINAL_USER_ACCEPTANCE
```
