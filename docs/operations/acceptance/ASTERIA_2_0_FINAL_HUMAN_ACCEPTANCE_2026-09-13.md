# Asteria 2.0 final human acceptance

日期：2026-09-13  
候选版本：`2.0.0-rc.8`  
固定入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`

## 当前状态

本次 RC.8 人工验收已经结束，结论：

```text
FINAL_HUMAN_ACCEPTANCE = FAIL
STABLE_RELEASE = BLOCKED
```

失败原因与证据已记录：

```text
docs/operations/acceptance/RC8_HUMAN_ACCEPTANCE_FAILURE_2026-09-13.md
```

主要 blocker：Architecture card/arrow/relation-label overlap、selection motion/reflow、主节点遮挡、Semantic Diff raw math 与模板化 AI copy、Lineage/Evidence graph label/arrow visual grammar。

当前修复入口：

```text
prompts/tasks/asteria_v2_rc9_human_visual_repair_task.md
```

在 RC.9 完成并重新通过 GPT Work visual/semantic/state/UX/responsive/red-team baseline 前，**不要再次要求用户执行本清单，也不要执行 stable release task**。

RC.9 后应生成新的 final human acceptance checklist，不复用 RC.8 这份已经失败的候选验收记录。