# Asteria 2.0 GPT Work Black-box Audit

日期：2026-09-13  
固定验收入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`
当前产品版本：`2.0.0-rc.7`
当前验收阶段：`GPT_WORK_TARGETED_REAUDIT_W01_W05_W06`

## 目的

Asteria 在 stable 前必须先经过独立 GPT Work 黑箱验收，再进入用户人工验收。自动 regression / Playwright 不能替代真实产品级验收。

所有结论必须来自普通用户通过真实网站 UI 实际看到、点击、切换、输入和导出的结果。

## Canonical Browser Contract

唯一 Browser 合规来源：

```text
docs/operations/blackbox-audit/UI_BLACKBOX_BROWSER_CONTRACT.md
```

最终发给任何 GPT Work 的 prompt 必须逐字 inline 当前全文。核心规则：

```text
可以自动操作页面；
不能绕过页面。
```

## Reviewer scopes

- `W01` Visual / scientific-product design：布局、数学可读性、graph visual grammar、theme、accepted concept fidelity。
- `W02` Statistical semantics：Original TRACE / CAT-TRACE scientific truth、symbol/relations、Evidence truth boundary。
- `W03` Interaction / state coherence：model/view/trace/layer/search/export/theme/save-restore state truth。
- `W04` First-time researcher UX：首次理解、信息层级、researcher-facing language。
- `W05` Responsive / accessibility：1366/1536、keyboard/focus/contrast/scroll/hit target。
- `W06` Release red-team：正常用户 stress、恢复能力、stale/double-active/blank/失效 disclosure 等。

## Acceptance Gate：先 Work，后人工

```text
Codex implementation / repair
  -> automated regression + browser QA
  -> refresh fixed public URL
  -> GPT Work black-box audit
  -> ChatGPT consolidated triage
  -> 如有 FAIL/BLOCKED 或 unresolved must-fix P2，继续 repair
  -> 所有 designated reviewer PASS
  -> P0 = 0, P1 = 0, unresolved must-fix P2 = 0
  -> 用户人工最终验收
  -> stable release
```

GPT Work gate 通过前，不要求用户人工打开页面。

## Dynamic reviewer selection：问题变少后缩减 Work 数量

不要机械地每个 RC 都跑 W01–W06 六轮。

### Full campaign

只有以下情况使用完整 W01–W06：

- broad architecture / ontology / scientific semantics 改动；
- 同时修改 math/layout/theme/state/search/inspector/accessibility 等多个 surface；
- 上一轮没有可靠 PASS baseline；
- consolidated triage 明确要求重建完整 baseline。

### Targeted campaign

如果 repair 范围窄，ChatGPT 必须只选择**受影响 reviewer + W06**。

推荐映射：

```text
visual / layout / theme / graph grammar           -> W01
scientific semantics / ontology / evidence truth -> W02
trace / state / session / search coherence       -> W03
learnability / copy / first-use IA                -> W04
responsive / keyboard / accessibility            -> W05
any release repair                                -> W06
```

### Carry-forward PASS

上一 RC 的 reviewer PASS 可以 carry forward 到下一 RC，但必须同时满足：

1. 本轮 repair 没有触碰其核心 scope；
2. consolidated report 明确记录 carry-forward；
3. Codex result 返回 touched surfaces / `REVIEWER_SCOPE_EXPANDED`；
4. 如果实现实际越界，立即把对应 reviewer 加回 re-audit。

这样既保持 gate 严格，又避免问题已经收敛后继续浪费 6 个 Work。

## 当前状态：RC.7 完成，进入 targeted re-audit

RC.6 re-audit 汇总：

```text
docs/operations/blackbox-audit/reports/RC6_REAUDIT_CONSOLIDATED_REPORT_2026-09-13.md
```

RC.7 repair task / review：

```text
prompts/tasks/asteria_v2_rc7_release_polish_task.md
prompts/tasks/asteria_v2_rc7_release_polish_review.md
```

RC.7 result：

```text
results/asteria_v2_rc7_release_polish/result.md
```

RC.7 报告：`REVIEWER_SCOPE_EXPANDED = NO`，因此 carry-forward：

```text
W02 PASS from RC.6
W03 PASS from RC.6
W04 PASS from RC.6
```

当前只需要 fresh targeted re-audit：

```text
W01 + W05 + W06
```

计划：

```text
docs/operations/blackbox-audit/RC7_TARGETED_REAUDIT_PLAN_2026-09-13.md
```

Ready-to-paste prompts：

```text
docs/operations/blackbox-audit/prompts/rc7/W01_VISUAL_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc7/W05_RESPONSIVE_ACCESSIBILITY_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc7/W06_RELEASE_REDTEAM_WORK_PROMPT.md
```

## Targeted gate

W01/W05/W06 必须全部：

```text
AUDIT_RESULT = PASS
BROWSER_BLOCKER = NONE
BLACK_BOX_CONTEXT_CONTAMINATED = NO
P0_COUNT = 0
P1_COUNT = 0
```

P2 必须由 ChatGPT consolidated triage 明确归类为 `must-fix before stable` 或 `accepted/deferred`。

如果三者全部 PASS，carry-forward 仍有效，且 unresolved must-fix P2 = 0，则进入用户人工最终验收。

如果只有一个/两个 reviewer 仍有窄问题，下一轮只修对应 surface，并只重跑受影响 reviewer + W06；不恢复六轮全跑，除非 repair 实际扩 scope。

## 历史审计

- RC.4：`reports/RC4_CONSOLIDATED_REPORT_2026-09-12.md`
- RC.5：`reports/RC5_REAUDIT_CONSOLIDATED_REPORT_2026-09-12.md`
- RC.6：`reports/RC6_REAUDIT_CONSOLIDATED_REPORT_2026-09-13.md`

## Severity

- `P0`：数据损坏、安全/隐私严重问题、产品完全不可用。
- `P1`：核心流程/科学真值/状态真值/关键可读性失败。
- `P2`：重要、有 workaround，但明显降低科研工具价值。
- `P3`：不阻塞使用的 polish。

当前 gate：**现在只跑 W01/W05/W06；三者 PASS、carry-forward 仍有效且 unresolved must-fix P2=0 后，才进入用户人工最终验收。**
