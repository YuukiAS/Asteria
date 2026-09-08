---
id: asteria_v2_release
title: Promote accepted Asteria 2.0 RC to stable
created_at: 2026-09-08
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: true
---

# Final Release Goal — 用户验收后将 2.0 RC 晋升为 stable

## 1. 触发条件

本任务**不得自动执行**。只有用户已经人工验收 `2.0.0-rc.1`，并明确要求发布 `2.0.0` stable 后才能运行。

开始前确认：

```text
results/asteria_v2_g05_result.md
ASTERIA_V2_RC_READY_FOR_USER_ACCEPTANCE = YES
```

同时需要当前用户明确发布授权。

## 2. 目标

不再增加 feature。只完成：

- 处理用户最终验收发现的 P0/P1 release blocker；
- 跑完整 regression/performance/browser acceptance；
- 更新 package/README/CHANGELOG 为 `2.0.0`；
- 生成简洁 migration/release note；
- commit `v2.0.0`；
- push 到既有 origin。

如果固定公网入口的 source update/deploy 在当时已有明确授权，按 `AGENTS.md` 现有固定入口规则更新并验证；若没有授权，只记录 pending，不创建新 URL。

## 3. 禁止

- 不顺便做 G06 multi-view；
- 不顺便做 desktop；
- 不大改 design；
- 不改 schemaVersion 语义；
- 不做不可逆旧 map cleanup；
- 不 force push / rewrite history。

## 4. Stable release gate

必须重新通过：

- V1 migration；
- CAT-TRACE reference five symbol cases；
- typed relations/layers/outline；
- Markdown/JSON export；
- validation；
- semantic variant diff；
- frequentist + causal fixtures；
- stress/performance regression；
- Story/version/search/restore regression；
- browser core workflow。

## 5. Result

写：

```text
results/asteria_v2_release_result.md
```

记录用户验收依据、修复项、所有测试、version/commit/push、public-link 状态、known limitations，并最后写：

```text
ASTERIA_2_0_STABLE_RELEASED = YES/NO
```
