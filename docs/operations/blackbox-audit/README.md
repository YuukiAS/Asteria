# Asteria 2.0 GPT Work Black-box Audit

日期：2026-09-13  
固定验收入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`  
当前产品版本：`2.0.0-rc.8`  
当前验收阶段：`USER_FINAL_HUMAN_ACCEPTANCE_READY`

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

## Dynamic reviewer selection

不要机械地每个 RC 都跑 W01–W06 六轮。

- broad architecture / ontology / scientific semantics / multi-surface repair：完整 W01–W06；
- narrow repair：只跑受影响 reviewer + W06；
- 上一 RC 已 PASS 且本轮没有触碰该 reviewer 核心 scope：可由 consolidated report 明确 carry forward。

Reviewer scope 映射：

```text
visual / layout / theme / graph grammar           -> W01
scientific semantics / ontology / evidence truth -> W02
trace / state / session / search coherence       -> W03
learnability / copy / first-use IA                -> W04
responsive / keyboard / accessibility            -> W05
any release repair                                -> W06
```

## 当前状态：RC.8 GPT Work gate 已通过

最终 gate report：

```text
docs/operations/blackbox-audit/reports/RC8_FINAL_BLACKBOX_GATE_2026-09-13.md
```

Fresh RC.8 targeted re-audit：

```text
W05 = PASS, P0/P1/P2/P3 = 0, RC8_LIGHT_TRACE_FINDING_CLOSED = YES
W06 = PASS, P0/P1/P2/P3 = 0, RC8_RELEASE_REGRESSION_CLEAN = YES
```

有效 carry-forward：

```text
W01 = PASS from RC.7
W02 = PASS from RC.6
W03 = PASS from RC.6
W04 = PASS from RC.6
```

RC.8 scope guard：

```text
REVIEWER_SCOPE_EXPANDED = NO
SCIENTIFIC_FIXTURES_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
```

因此当前结论：

```text
GPT_WORK_GATE = PASS
P0 = 0
P1 = 0
UNRESOLVED_MUST_FIX_P2 = 0
FINAL_HUMAN_ACCEPTANCE = READY
```

现在停止 GPT Work 与自动 polish。除非用户人工验收发现具体 blocker，不要创建 RC.9。

## 用户最终验收

使用：

```text
docs/operations/acceptance/ASTERIA_2_0_FINAL_HUMAN_ACCEPTANCE_2026-09-13.md
```

固定入口：

```text
https://asteria.httpwwwcardiacnexus-ukb.com/
```

若用户明确：

```text
FINAL_HUMAN_ACCEPTANCE = PASS
```

再执行：

```text
prompts/tasks/asteria_v2_release_task.md
```

将 RC.8 晋升为 `2.0.0` stable。未取得明确人工 PASS 前，不得自动发布 stable。

## 历史审计

- RC.4：`reports/RC4_CONSOLIDATED_REPORT_2026-09-12.md`
- RC.5：`reports/RC5_REAUDIT_CONSOLIDATED_REPORT_2026-09-12.md`
- RC.6：`reports/RC6_REAUDIT_CONSOLIDATED_REPORT_2026-09-13.md`
- RC.7：`reports/RC7_TARGETED_REAUDIT_CONSOLIDATED_REPORT_2026-09-13.md`
- RC.8 final gate：`reports/RC8_FINAL_BLACKBOX_GATE_2026-09-13.md`

## Severity

- `P0`：数据损坏、安全/隐私严重问题、产品完全不可用。
- `P1`：核心流程/科学真值/状态真值/关键可读性失败。
- `P2`：重要、有 workaround，但明显降低科研工具价值。
- `P3`：不阻塞使用的 polish。

当前 gate：**GPT Work 已通过；等待用户最终集中人工验收。**
