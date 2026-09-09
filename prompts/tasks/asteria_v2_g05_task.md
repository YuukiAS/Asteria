---
id: asteria_v2_g05
title: Architecture performance and visual convergence RC gate
created_at: 2026-09-09
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Goal G05 — Architecture Performance & Visual Convergence

完整执行规范：`docs/notes/goal_specs/asteria_v2_g05_goal_spec.md`。

前置：`results/asteria_v2_g04_result.md` 必须有 `G05_READY = YES`。

先读 AGENTS/Agent Rules、`ROADMAP.md`、`VERSIONING.md`、2026-09-09 Web delivery plan、current implementation audit、accepted concepts README（若已导入）、G00 baseline 与 G04 result，再执行 spec。

参考 spec 的 frontmatter 不生效，本 task frontmatter 是唯一权限边界。网络仅允许现有 GitHub origin 普通 fetch/push；不得下载依赖、网页研究、force push 或改部署。若必须新增 dependency 才能完成，停止并报告 blocker。

目标版本/提交：`2.0.0-rc.1` / `v2.0.0-rc.1`。

必须写 `results/asteria_v2_g05_result.md`，最后：

```text
G06_READY = YES/NO
```

**G05 不再是最终用户验收点。G05 通过后自动进入 G06；不得在这里发布 `2.0.0` stable。**