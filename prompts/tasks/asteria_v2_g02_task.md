---
id: asteria_v2_g02
title: Build CAT-TRACE reference workspace and Symbol Trace
created_at: 2026-09-08
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Goal G02 — CAT-TRACE Reference + Canonical Symbols + Symbol Trace

完整执行规范：`docs/notes/goal_specs/asteria_v2_g02_goal_spec.md`。

前置：`results/asteria_v2_g01_result.md` 必须有 `G02_READY = YES`。必须以 `docs/notes/2026-09-08_cat_trace_reference_architecture_for_asteria_v2.md` 为 canonical model fixture，不得从旧 demo 猜 notation。先读 AGENTS/Agent Rules/master plan/product strategy/G01 result 后执行 spec。

参考 spec 的内嵌旧 frontmatter 不生效，本 task frontmatter 是唯一权限边界。网络只允许现有 GitHub origin 普通 fetch/push；不下载依赖、不网页研究、不改部署。

目标版本/提交：`2.0.0-alpha.2` / `v2.0.0-alpha.2`。必须写 `results/asteria_v2_g02_result.md`，末尾 `G03_READY = YES/NO`。