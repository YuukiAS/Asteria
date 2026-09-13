# Asteria RC.8 final GPT Work black-box gate

日期：2026-09-13  
产品版本：`2.0.0-rc.8`  
固定验收入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`

## Gate 结论

RC.8 targeted re-audit 完成。

本轮 designated reviewers：

- `W05 Responsive / Accessibility`：PASS，P0=0，P1=0，P2=0，P3=0，`RC8_LIGHT_TRACE_FINDING_CLOSED = YES`；
- `W06 Release Red-team`：PASS，P0=0，P1=0，P2=0，P3=0，`RC8_RELEASE_REGRESSION_CLEAN = YES`。

有效 carry-forward：

- `W01 Visual / scientific-product design`：PASS from RC.7；RC.8 只修改了其与 W05 重复的 Light trace contrast finding，且 `REVIEWER_SCOPE_EXPANDED = NO`；
- `W02 Statistical semantics`：PASS from RC.6；RC.7/RC.8 均未修改 scientific fixtures / canonical relation truth；
- `W03 Interaction / state coherence`：PASS from RC.6；RC.7/RC.8 未修改 trace algorithm / session contract；
- `W04 First-time researcher UX`：PASS from RC.6；RC.7/RC.8 未扩大 first-use IA scope。

因此：

```text
GPT_WORK_GATE = PASS
P0 = 0
P1 = 0
UNRESOLVED_MUST_FIX_P2 = 0
BROWSER_BLOCKER = NONE
BLACK_BOX_CONTEXT_CONTAMINATED = NO
FINAL_HUMAN_ACCEPTANCE = READY
STABLE_RELEASE = WAITING_FOR_EXPLICIT_USER_ACCEPTANCE
```

## 已明确接受 / 延期到 2.0.x 的非阻断项

以下不阻塞 2.0 stable：

1. Lineage 在 1366 宽度下 selected target node 有轻微右侧 composition/cropping polish；
2. `Save view state` 当前不恢复 theme；当前 session contract 主要恢复 model/view/detail/trace；
3. 更强的 default reading mode、claim-specific Evidence closure copy、exact-symbol search ranking 等 UX 增强；
4. 125% browser zoom 未作为 hard gate，因部分 Work browser 环境无法可靠设置真实 browser zoom。

这些都不得在 final human acceptance 前自动扩成新的 RC repair，除非用户人工验收明确认为其中某项阻断发布。

## 已通过的核心 release surfaces

- Asteria 2.0 shell 直接启动，无 1.x startup/live UI；
- Original TRACE / CAT-TRACE Frozen V2 model switch；
- Architecture `Overview | Full model`；
- root-relative recursive trace，selection 与 active trace 分离；
- Clear/reset 后 trace OFF；
- CAT-TRACE `𝒦/𝒰` identity split、`c(f)=∅ -> 𝒰`、indices metadata；
- Lineage / Evidence typed multi-view navigation；
- Pending/support/limitation truth boundary；
- researcher-facing inspector / Semantic Diff / Advanced separation；
- cross-view search；
- keyboard skip links与 compact topbar accessibility；
- Full-model Zoom/Fit/Pan；
- Light/Dark 1366/1536 desktop readability；
- Advanced / Export disclosure与 top Export feedback；
- Save/Restore core session path；
- refresh / public fixed URL regression。

## 下一步

不再运行 GPT Work，也不再自动做 RC.9。

下一步唯一 gate：用户在固定公网 URL 做一次集中人工验收。

若用户明确：

```text
FINAL_HUMAN_ACCEPTANCE = PASS
```

再执行：

```text
prompts/tasks/asteria_v2_release_task.md
```

将已接受的 RC.8 晋升到 `2.0.0` stable。若用户发现实际 blocker，则只针对该 blocker 开窄修复，不顺手扩产品范围。