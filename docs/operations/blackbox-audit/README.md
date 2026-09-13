# Asteria 2.0 GPT Work Black-box Audit

日期：2026-09-13  
固定验收入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`  
当前产品版本：`2.0.0-rc.9`  
当前验收阶段：`RC9_REAUDIT_FAILED -> RC10_VISUAL_FINISH`

## 目的

Asteria 在 stable 前必须先经过独立 GPT Work 黑箱验收，再进入用户人工验收。自动 regression / Playwright 不能替代真实产品级验收；GPT Work PASS 也不能覆盖用户最终人工验收发现的明显 blocker。

所有黑箱结论必须来自普通用户通过真实网站 UI 实际看到、点击、切换、输入和导出的结果。

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

## Visual Acceptance Contract

视觉/交互成品标准：

```text
docs/operations/blackbox-audit/VISUAL_ACCEPTANCE_CONTRACT.md
```

Lineage / Evidence 进一步采用：

```text
docs/design/LINEAGE_EVIDENCE_VISUAL_GRAMMAR_SPEC.md
```

核心 Architecture/Lineage/Evidence 的视觉 P2 不得以 `PASS + P2` 放行 stable。

## Acceptance Gate

```text
Codex implementation / repair
  -> automated regression + browser QA
  -> refresh fixed public URL
  -> GPT Work black-box audit
  -> ChatGPT consolidated triage
  -> 如有 FAIL/BLOCKED 或 unresolved must-fix P2，继续 repair
  -> designated reviewers PASS
  -> P0 = 0, P1 = 0, unresolved must-fix P2 = 0
  -> 用户人工最终验收
  -> stable release
```

GPT Work gate 通过前，不要求用户人工打开页面。

### Human override

如果用户最终人工验收发现明确 blocker：

```text
FINAL_HUMAN_ACCEPTANCE = FAIL
PREVIOUS_PASS_FOR_AFFECTED_SCOPE = INVALIDATED
STABLE_RELEASE = BLOCKED
```

必须把用户看到的问题转成 exact regression 和下一张 repair task。

## Dynamic reviewer selection

不要机械地每个 RC 都跑 W01–W06 六轮。

- broad multi-surface repair：完整或接近完整 re-audit；
- narrow repair：只跑受影响 reviewer + W06；
- 上一 RC 已 PASS 且本轮没有触碰其核心 scope，可 carry forward。

Reviewer scope：

```text
visual / layout / theme / graph grammar / motion -> W01
scientific semantics / math truth / evidence     -> W02
trace / state / session / geometry stability     -> W03
learnability / copy / first-use IA               -> W04
responsive / keyboard / accessibility            -> W05
any release repair                               -> W06
```

## 当前状态：RC.9 re-audit 未通过

RC.9 full re-audit consolidated report：

```text
docs/operations/blackbox-audit/reports/RC9_FULL_REAUDIT_CONSOLIDATED_REPORT_2026-09-13.md
```

结果：

```text
W01 = FAIL
W02 = PASS
W03 = PASS
W04 = FAIL
W05 = FAIL
W06 = FAIL
```

剩余 must-fix 已收敛为：

- CAT Full model 1366/1536 overlap；
- Original TRACE Architecture overlap；
- Lineage connector / relation chip / target margin 视觉语法不合格；
- inspector / Semantic Diff 主阅读层数学仍有 raw/碎裂；
- Evidence Why-it-matters / closure copy 模板化；
- Advanced / Export collapsed 状态与实际可见内容不一致。

Lineage/Evidence dedicated visual grammar：

```text
docs/design/LINEAGE_EVIDENCE_VISUAL_GRAMMAR_SPEC.md
```

当前唯一 repair task：

```text
prompts/tasks/asteria_v2_rc10_visual_finish_task.md
```

目标版本：`2.0.0-rc.10`。

## RC.10 re-audit strategy

若 RC.10 result 明确：

```text
SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
```

则 targeted-but-broad re-audit：

```text
W01 + W02 + W04 + W05 + W06
```

W03 carry forward RC.9 PASS。

如果 RC.10 实际触碰 trace/session/state，则把 W03 加回。

当前 gate：**先完成 RC.10；在新一轮 GPT Work 通过前，不再邀请用户人工验收。**
