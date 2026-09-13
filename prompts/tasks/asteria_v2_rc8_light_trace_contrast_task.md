---
id: asteria_v2_rc8_light_trace_contrast
title: Final narrow RC.8 patch for 1366 Light trace-context readability
created_at: 2026-09-13
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Asteria 2.0 RC.8 — Final Light Trace Contrast Patch

## 0. 目标

RC.7 targeted re-audit 已高度收敛：W01 PASS、W06 PASS，只有 W05 因一个 P2 FAIL；W01 的唯一 P2 与 W05 是同一个 finding。

先读：

1. `AGENTS.md`
2. `prompts/AGENT_RULES.md`
3. `docs/operations/blackbox-audit/reports/RC7_TARGETED_REAUDIT_CONSOLIDATED_REPORT_2026-09-13.md`
4. `docs/operations/blackbox-audit/UI_BLACKBOX_BROWSER_CONTRACT.md`
5. `docs/notes/2026-09-12_asteria_acceptance_mode_public_refresh_contract.md`
6. `results/asteria_v2_rc7_release_polish/result.md`
7. 当前 `src/styles/index.css`, `ArchitectureWorkspace.tsx`, browser tests / RC.7 validation。

目标：

```text
version = 2.0.0-rc.8
commit = v2.0.0-rc.8
NEXT_ACTION = GPT_WORK_TARGETED_REAUDIT_W05_W06
```

本任务完成后不要要求用户人工验收，不要发布 `2.0.0` stable。

## 1. 严格窄范围

这是一个**单一 visual/accessibility contrast patch**。

允许修改：

- Light theme 下 Architecture trace-ON 的 muted node / edge / context-label presentation；
- active/selected relation label 在 light theme 下的 opacity / halo / stroke presentation；
- 与上述修复直接相关的 CSS；
- focused RC.8 static/browser regression；
- version / changelog / result / public smoke。

禁止修改：

- Original TRACE / CAT-TRACE scientific fixtures；
- canonical entities / relations / ontology；
- trace algorithm / upstream-downstream semantics；
- model/view/session state contract；
- Save/Restore theme semantics；
- Overview/Full model projection selection；
- Full-model zoom/pan controls；
- Lineage layout/cropping；
- Evidence truth/copy；
- search / inspector IA；
- desktop/Tauri/Figma；
- fixed public URL / DNS / tunnel identity。

如果实际修复必须超出上述 scope：

```text
REVIEWER_SCOPE_EXPANDED = YES
```

立即记录 touched surfaces；不要静默扩大。

## 2. 唯一 must-fix finding

Hard acceptance state：

```text
viewport = 1366×768
View = Architecture
Model = CAT-TRACE Frozen V2
Detail = Overview
Theme = Light
Select = Catalogue match（或等价核心节点）
Trace = ON
```

当前问题：active path 清楚，但 muted relation lines / relation labels / surrounding context 仍接近 watermark，降低科研读图舒适度。

### 2.1 目标

修复后必须同时满足：

- muted context 的 symbol / short label 可轻松读出；
- muted edge 仍可辨认其连接走向；
- 已经应该显示的 active/selected relation label 不因 muted/group opacity 再次被整体淡化；
- active selected/upstream/downstream path 仍明显强于 muted context；
- upstream dashed / downstream solid 等 non-color cue 保留；
- 不把所有 relation labels 永久显示；
- 不把所有 edges 提高到相同视觉权重；
- dark theme 不应因本 patch 变重。

### 2.2 优先检查 class overlap

当前 CSS 有 group-level muted opacity。请先验证是否存在如下组合：

```text
architecture-map-edge-muted + architecture-map-edge-selected
architecture-map-edge-muted + architecture-map-edge-trace
```

如果一个本应清楚的 selected/active label 被 ancestor/group muted opacity 二次削弱，优先通过 light-theme-specific override 解决，而不是扩大所有边的 label visibility。

可适当提高 Light theme 下：

- muted node minimum opacity / secondary text contrast；
- muted edge group/path minimum opacity；
- selected/trace label opacity 与 white/panel halo；

但最终以真实 1366 UI 截图为准，不以某个固定 opacity 数值为目标。

## 3. 明确不处理的 finding

以下已 triage 为 accepted/deferred，不要顺手修改：

- W01 P3：Lineage 1366 selected target 轻微右侧裁切；
- W06 P3：Save view state 不恢复 theme。

二者进入 2.0.x backlog，不阻塞 stable。

## 4. Regression

新增：

```text
npm run test:architecture-rc8
```

至少验证：

- package/app version = `2.0.0-rc.8`；
- light trace muted-context dedicated CSS 仍存在；
- active/selected trace-label light-theme override 不被 muted opacity吞掉；
- dark-theme trace styles没有被全局提亮；
- no scientific fixture / trace algorithm / session contract changes；
- legacy 1.x active UI remains absent。

Playwright 增加 exact focused case：

1. fresh page；
2. viewport 1366×768；
3. CAT-TRACE / Architecture / Overview；
4. Light；
5. select Catalogue match；
6. Show trace；
7. 保存 `rc8-light-trace-on-1366.png`；
8. 同状态 Dark 保存对照；
9. 检查 active path 与 muted context 均可见，且 active path 层级更高；
10. 做一轮 W06 minimal smoke：model/view/trace/export/save/restore/refresh 不回归。

如果可以稳定取得 computed style，可作为辅助 regression；不要用 computed style 替代真实截图/浏览器判断。

运行：

```text
npm run build
npm run test:regression
npm run test:architecture-rc8
npm run test:browser
git diff --check
```

性能代码没有改动时，不强制重跑完整 benchmark；如果改动超出纯 CSS/presentation，则补跑 `npm run bench:architecture-g05`。

## 5. Version / result / commit

更新：

- `package.json`, lockfile -> `2.0.0-rc.8`；
- `CHANGELOG.md`；
- `README.md` 如当前版本展示需要；
- `ROADMAP.md` / `VERSIONING.md` 仅在确有必要时更新；
- 写 `results/asteria_v2_rc8_light_trace_contrast/result.md`。

完成后：

```text
commit = v2.0.0-rc.8
push origin/main
HEAD == origin/main
worktree clean
```

## 6. Fixed public URL gate

严格执行：

`docs/notes/2026-09-12_asteria_acceptance_mode_public_refresh_contract.md`

必须确认：

```text
PUBLIC_ACCEPTANCE_URL = https://asteria.httpwwwcardiacnexus-ukb.com/
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_ROOT_CHECK = PASS
PUBLIC_STATUS_CHECK = PASS
PUBLIC_BROWSER_SMOKE = PASS
PUBLIC_VERSION = 2.0.0-rc.8
```

不要创建 quick tunnel / alternate URL / VPS proxy。

## 7. 修复后的 reviewer 数量

本轮问题已收敛到单一、重复 finding，因此 RC.8 后只跑：

```text
W05 + W06
```

不再跑 W01：RC.7 W01 已 PASS，其唯一 P2 与 W05 blocker 相同，由更严格的 W05 exact-state re-audit 负责验证。

Carry-forward：

```text
W01 PASS from RC.7
W02 PASS from RC.6
W03 PASS from RC.6
W04 PASS from RC.6
```

前提：

```text
REVIEWER_SCOPE_EXPANDED = NO
```

如果 scope expanded，下一轮 reviewer 必须按 touched surfaces 加回。

最终返回：

```text
STATUS = COMPLETE
CURRENT_VERSION = 2.0.0-rc.8
FINAL_COMMIT = ...
LIGHT_TRACE_CONTEXT_READABILITY = PASS
ACTIVE_TRACE_HIERARCHY_PRESERVED = PASS
DARK_THEME_UNCHANGED = PASS
SCIENTIFIC_FIXTURES_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
REVIEWER_SCOPE_EXPANDED = NO | YES
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_BROWSER_SMOKE = PASS
NEXT_ACTION = GPT_WORK_TARGETED_REAUDIT_W05_W06
```

只有真实 hard blocker 才允许提前停止。