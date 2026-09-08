---
id: asteria_v2_g04
title: Add architecture export, structural validation, and semantic variant diff
created_at: 2026-09-08
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Goal G04 — Architecture Export + Validation + Semantic Variant Diff

完整执行规范：`docs/notes/goal_specs/asteria_v2_g04_goal_spec.md`。

前置：`results/asteria_v2_g03_result.md` 必须有 `G04_READY = YES`。先读 AGENTS/Agent Rules/master plan/CAT reference/G03 result，再执行 spec。参考 spec 的内嵌旧 frontmatter 不生效，本 task frontmatter 是唯一权限边界。

网络仅允许现有 GitHub origin 普通 fetch/push；不得下载依赖、网页研究、force push 或修改固定公网部署。

目标版本/提交：`2.0.0-beta.2` / `v2.0.0-beta.2`。必须写 `results/asteria_v2_g04_result.md`，末尾 `G05_READY = YES/NO`。