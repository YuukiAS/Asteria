---
id: asteria_v2_g00
title: Freeze Asteria 1.x baseline before 2.0
created_at: 2026-09-08
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Goal G00 — 冻结 Asteria 1.x，建立 2.0 基线

完整执行规范：

```text
docs/notes/goal_specs/asteria_v2_g00_goal_spec.md
```

先读 `AGENTS.md`、`prompts/AGENT_RULES.md`、`VERSIONING.md`、2.0 master plan / current implementation audit，再逐条执行上述 Goal spec。该 spec 是参考规范，其内嵌旧 frontmatter 不作为本次权限来源；**本 task frontmatter 是唯一权限边界**。

网络权限仅用于现有 GitHub origin 的普通 fetch/push；不得网页研究、下载依赖、上传数据、修改 remote、force push 或改变固定公网部署。

目标版本与提交：`1.0.0` / `v1.0.0`。必须写 `results/asteria_v2_g00_result.md`，并以 `G01_READY = YES/NO` 结束。只有全部兼容 fixture、build、regression、baseline gate 通过才允许 push 并标 YES。