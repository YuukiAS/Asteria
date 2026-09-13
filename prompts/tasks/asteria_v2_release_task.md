---
id: asteria_v2_release
title: Promote human-accepted Asteria 2.0 RC.8 to stable
created_at: 2026-09-13
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: true
---

# Final Release Goal — 用户最终验收后将 Asteria 2.0 RC.8 晋升为 stable

## 1. 触发条件

本任务**不得自动执行**。

只有同时满足以下条件才能运行：

1. fixed public URL 当前候选版本为 `2.0.0-rc.8`；
2. `docs/operations/blackbox-audit/reports/RC8_FINAL_BLACKBOX_GATE_2026-09-13.md` 记录：

```text
GPT_WORK_GATE = PASS
P0 = 0
P1 = 0
UNRESOLVED_MUST_FIX_P2 = 0
FINAL_HUMAN_ACCEPTANCE = READY
```

3. 用户已完成 `docs/operations/acceptance/ASTERIA_2_0_FINAL_HUMAN_ACCEPTANCE_2026-09-13.md` 的集中人工验收；
4. 当前用户在执行本任务前明确给出：

```text
FINAL_HUMAN_ACCEPTANCE = PASS
```

并明确要求发布 `2.0.0` stable。

若没有用户明确 PASS，立即停止，不得自行推断验收通过。

## 2. Release 原则

这是 **promotion / freeze task**，不是 feature task。

默认不得改变 RC.8 已验收的产品行为。只完成 stable 晋升、版本记录、release note、最终回归与固定公网刷新。

若在 release regression 中发现真实 P0/P1 或明显 must-fix P2：

- 不发布 stable；
- 记录 blocker；
- 停止并等待新的窄 repair task；
- 不在 release task 中临时扩功能或重构。

## 3. 必须保持不变

禁止顺手修改：

- Original TRACE / CAT-TRACE Frozen V2 scientific fixtures；
- canonical ontology / relations；
- recursive trace semantics；
- Evidence pending/support truth；
- Overview / Full model product design；
- Lineage / Evidence 信息架构；
- Save/Restore contract；
- desktop/Tauri/Electron；
- Figma redesign；
- fixed public URL / DNS / tunnel identity；
- legacy migration compatibility。

已接受/延期的 2.0.x backlog 不在本任务处理：Lineage 1366 小幅 composition、theme restore、进一步 onboarding/reading mode、claim-specific Evidence copy、exact-symbol search ranking 等。

## 4. Stable version work

将版本从 `2.0.0-rc.8` 晋升为：

```text
2.0.0
```

更新至少包括：

- `package.json`；
- lockfile；
- app visible version；
- `CHANGELOG.md`；
- `README.md`；
- `ROADMAP.md`；
- `VERSIONING.md`；
- 必要的 release/migration note。

Stable changelog 不需要重写所有 RC 历史；总结 2.0 的正式范围：

- active Asteria 2.0 Web shell；
- Original TRACE + CAT-TRACE Frozen V2；
- Architecture / Lineage / Evidence；
- canonical symbol registry / typed semantic relations；
- Overview / Full model；
- explicit symbol trace；
- Semantic Diff；
- search / export / validation / session state；
- v1 -> v2 compatibility migration；
- fixed public Web acceptance path。

## 5. Final regression gate

必须从 clean current `main` 运行完整 release verification。

至少：

```text
npm run build
npm run test:regression
npm run test:architecture-rc8
npm run bench:architecture-g05
npm run test:browser
git diff --check
```

并确认：

- V1 migration regression PASS；
- Original TRACE / CAT-TRACE canonical reference PASS；
- Architecture / Lineage / Evidence browser workflows PASS；
- trace / Overview / Full model PASS；
- W02 scientific invariants PASS；
- search / export / Save/Restore / refresh PASS；
- no active 1.x live UI；
- performance 无异常回退。

## 6. Stable commit / push

写：

```text
results/asteria_v2_release_result.md
```

记录：

- 用户验收依据；
- RC.8 black-box gate；
- stable version changes；
- 完整测试结果；
- performance summary；
- known accepted/deferred limitations；
- public URL refresh result。

然后：

```text
commit = v2.0.0
push origin/main
HEAD == origin/main
worktree clean
```

不要 force push / rewrite history / change remote。

## 7. Fixed public URL

发布 stable 后必须刷新同一个固定入口：

`https://asteria.httpwwwcardiacnexus-ukb.com/`

不得创建 quick tunnel / alternate URL / VPS proxy。

验证：

```text
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_ROOT_CHECK = PASS
PUBLIC_STATUS_CHECK = PASS
PUBLIC_BROWSER_SMOKE = PASS
PUBLIC_VERSION = 2.0.0
```

## 8. Stop condition

只有全部 release gate 通过，才能最终返回：

```text
ASTERIA_2_0_STABLE_RELEASED = YES
CURRENT_VERSION = 2.0.0
FINAL_COMMIT = <sha>
PUBLIC_VERSION = 2.0.0
```

然后停止。不要自动进入 desktop、2.1、多模型扩展或新的 product-design iteration。