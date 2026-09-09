---
id: asteria_v2_g02
title: Build original TRACE and CAT-TRACE reference workspaces with Symbol Trace
created_at: 2026-09-09
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Goal G02 — Original TRACE + CAT-TRACE Frozen V2 + Canonical Symbols + Symbol Trace

完整执行规范：`docs/notes/goal_specs/asteria_v2_g02_goal_spec.md`。

前置：`results/asteria_v2_g01_result.md` 必须有 `G02_READY = YES`。

模型语义必须以：

`docs/notes/2026-09-09_trace_and_cat_trace_reference_for_asteria_v2.md`

为 Asteria fixture 入口。Original TRACE 只使用原论文真实结构；CAT-TRACE 使用 2026-09-09 Frozen V2。不要从旧 demo、2026-09-08 visual draft 或历史 grouped working draft 猜 notation。

先读 AGENTS/Agent Rules、当前 ROADMAP、VERSIONING、2026-09-09 Web delivery plan、G01 result，再执行 spec。

参考 spec 的内嵌 frontmatter 不生效，本 task frontmatter 是唯一权限边界。网络只允许现有 GitHub origin 正常 fetch/push；不下载依赖、不网页研究、不改部署。

目标版本/提交：`2.0.0-alpha.2` / `v2.0.0-alpha.2`。

必须写 `results/asteria_v2_g02_result.md`，末尾：

```text
G03_READY = YES/NO
```