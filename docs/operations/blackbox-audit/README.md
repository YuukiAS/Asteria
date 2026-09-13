# Asteria 2.0 GPT Work Black-box Audit

日期：2026-09-13  
固定验收入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`  
当前产品版本：`2.0.0-rc.10`  
当前验收阶段：`GPT_WORK_RC10_STAGED_REAUDIT`

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

## 当前状态：RC.10 已完成

RC.10 task / result / review：

```text
prompts/tasks/asteria_v2_rc10_visual_finish_task.md
results/asteria_v2_rc10_visual_finish/result.md
prompts/tasks/asteria_v2_rc10_visual_finish_review.md
```

Product commit：

```text
f5aa22a7866b65ce243d2b31ac26343df7d155a3
```

RC.10 result reports：

```text
CAT_FULL_NODE_OVERLAP_COUNT = 0
ORIGINAL_TRACE_NODE_OVERLAP_COUNT = 0
LINEAGE_TARGET_CLIPPED = NO
LINEAGE_RELATION_CHIP_COLLISION_COUNT = 0
EDGE_LABEL_CARD_COLLISION_COUNT = 0
PRIMARY_TEXT_CLIPPING = 0
MATH_RENDERING_MAIN_UI = PASS
COPY_QUALITY_MAIN_UI = PASS
ADVANCED_COLLAPSED_CONTENT_HIDDEN = PASS
LINEAGE_VISUAL_GRAMMAR = PASS
EVIDENCE_COPY_QUALITY = PASS
SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
REVIEWER_SCOPE_EXPANDED = NO
PUBLIC_VERSION = 2.0.0-rc.10
```

因此 W03 interaction/state 可以 carry forward RC.9 PASS。

## RC.10 staged re-audit

不要一次性跑六个，也不要一开始把 5 个全部跑掉。

计划：

```text
docs/operations/blackbox-audit/RC10_GPT_WORK_REAUDIT_PLAN_2026-09-13.md
```

Campaign：

```text
docs/operations/blackbox-audit/ASTERIA_RC10_GPT_WORK_CAMPAIGN.md
```

### Wave A — first

并行运行：

```text
W01 + W04 + W05 + W06
```

Ready-to-paste：

```text
docs/operations/blackbox-audit/prompts/rc10/W01_VISUAL_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc10/W04_FIRST_TIME_UX_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc10/W05_RESPONSIVE_ACCESSIBILITY_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc10/W06_RELEASE_REDTEAM_WORK_PROMPT.md
```

如果任意 Wave A reviewer FAIL/BLOCKED，或出现 unresolved core visual P2，立即停止；不要浪费 W02。

### Wave B — only if Wave A passes

再运行：

```text
W02 Statistical semantics
```

Ready-to-paste：

```text
docs/operations/blackbox-audit/prompts/rc10/W02_SEMANTICS_WORK_PROMPT.md
```

W02 负责确认 RC.10 的 math/copy/presentation cleanup 没有改变 scientific truth。

## RC.10 final gate

```text
W01 = PASS
W02 = PASS
W04 = PASS
W05 = PASS
W06 = PASS
W03 = carry-forward PASS from RC.9
BROWSER_BLOCKER = NONE
BLACK_BOX_CONTEXT_CONTAMINATED = NO
P0 = 0
P1 = 0
unresolved must-fix P2 = 0
NO_NODE_OVERLAP = PASS
NO_EDGE_LABEL_CARD_COLLISION = PASS
NO_PRIMARY_TEXT_CLIPPING = PASS
SELECTION_GEOMETRY_STABLE = PASS
MOTION_QUALITY = PASS
MATH_RENDERING_MAIN_UI = PASS
COPY_QUALITY_MAIN_UI = PASS
LINEAGE_VISUAL_GRAMMAR = PASS
EVIDENCE_VISUAL_GRAMMAR = PASS
```

任何一项未知或失败，都不能再次声明 `FINAL_HUMAN_ACCEPTANCE = READY`。

当前 gate：**先跑 Wave A W01/W04/W05/W06；只有 Wave A 通过后才跑 W02。**