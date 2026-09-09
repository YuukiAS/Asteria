---
id: asteria_v2_g06
title: Build Architecture, Lineage, and Evidence multi-view final Web RC
created_at: 2026-09-09
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Goal G06 — Architecture + Lineage + Evidence / Final Web RC

完整执行规范：`docs/notes/goal_specs/asteria_v2_g06_goal_spec.md`。

前置：`results/asteria_v2_g05_result.md` 必须有 `G06_READY = YES`。

G06 现在属于 Asteria 2.0 Web 主链，不再后置到 2.1。目标是把同一 canonical graph 投影为 Architecture / Lineage / Evidence 三个独立 view，并按 accepted E1/E2 视觉方向完成最终浏览器 RC。

先读 AGENTS/Agent Rules、`ROADMAP.md`、`VERSIONING.md`、2026-09-09 Web delivery plan、TRACE/CAT-TRACE canonical reference、accepted concepts README 与 E1/E2、G05 result，再执行 spec。

参考 spec 的 frontmatter 不生效，本 task frontmatter 是唯一权限边界。网络只允许现有 GitHub origin 普通 fetch/push；不得下载依赖、网页研究、force push 或改部署。

目标版本/提交：`2.0.0-rc.2` / `v2.0.0-rc.2`。

必须写 `results/asteria_v2_g06_result.md`，最后：

```text
ASTERIA_V2_WEB_RC_READY_FOR_USER_ACCEPTANCE = YES/NO
NEXT_ACTION = FINAL_USER_ACCEPTANCE
```

**不得自动发布 `2.0.0` stable；G06 完成后停止等待用户最终验收。**