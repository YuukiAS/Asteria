---
id: asteria_v2_g01
title: Build Asteria 2.0 semantic kernel and v1 migration
created_at: 2026-09-08
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Goal G01 — 2.0 Semantic Kernel

完整执行规范：`docs/notes/goal_specs/asteria_v2_g01_goal_spec.md`。

前置：`results/asteria_v2_g00_result.md` 必须有 `G01_READY = YES`。先读 AGENTS、Agent Rules、VERSIONING、2.0 master plan、implementation audit、CAT-TRACE reference note 与 G00 result，然后执行 goal spec。参考 spec 的内嵌旧 frontmatter 不生效，本 task frontmatter 是唯一权限边界。

网络仅允许现有 GitHub origin 的普通 fetch/push；不下载依赖、不网页研究、不 force push、不改 deployment。

目标版本/提交：`2.0.0-alpha.1` / `v2.0.0-alpha.1`。必须写 `results/asteria_v2_g01_result.md`，末尾 `G02_READY = YES/NO`。