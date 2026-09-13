# Asteria 2.0 GPT Work Black-box Audit

日期：2026-09-13  
固定验收入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`  
当前产品版本：`2.0.0-rc.10`  
当前验收阶段：`RC10_WAVE_A_FAILED -> RC11_READER_FINISH`

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

该 contract 现在明确包含：

- scientific card label 不得 line-clamp / ellipsis；
- canonical formula 不能只“存在 KaTeX”，必须真实横向完整可读，不能碎裂成纵向 glyph；
- Architecture `Why it matters` 不得以 layer / upstream-downstream relation count 作为主说明。

Lineage / Evidence 视觉语法：

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

## Dynamic reviewer selection

不要机械地每个 RC 都跑 W01–W06 六轮。

```text
visual / layout / theme / graph grammar / motion -> W01
scientific semantics / math truth / evidence     -> W02
trace / state / session / geometry stability     -> W03
learnability / copy / first-use IA               -> W04
responsive / keyboard / accessibility            -> W05
any release repair                               -> W06
```

- broad multi-surface repair：完整或接近完整 re-audit；
- narrow repair：只跑受影响 reviewer + W06；
- 上一 RC 已 PASS 且本轮没有触碰其核心 scope，可 carry forward。

## 当前状态：RC.10 Wave A 未通过

Wave A：

```text
W01 = FAIL
W04 = FAIL
W05 = FAIL
W06 = PASS
```

因此按 staged strategy **没有运行 W02**。W03 继续 carry forward RC.9 PASS。

正式汇总：

```text
docs/operations/blackbox-audit/reports/RC10_WAVE_A_REAUDIT_CONSOLIDATED_REPORT_2026-09-13.md
```

剩余 must-fix 已高度收敛到 Architecture 主阅读层：

1. Inspector canonical definition KaTeX 视觉碎裂；
2. CAT Architecture human-readable card labels 被 line-clamp/ellipsis；
3. Architecture `Why it matters` 仍用 graph topology / relation counts，而不是统计意义。

Lineage、Evidence、node overlap、edge collision、selection geometry、motion、Advanced disclosure 当前均已有 PASS 证据，RC.11 必须保护这些 surface。

## 当前唯一 repair task

```text
prompts/tasks/asteria_v2_rc11_reader_finish_task.md
```

目标版本：`2.0.0-rc.11`。

若 RC.11 result 明确：

```text
SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
LINEAGE_LAYOUT_CHANGED = NO
EVIDENCE_LAYOUT_CHANGED = NO
```

则 RC.11 先运行：

```text
Wave A = W01 + W04 + W05 + W06
```

只有 Wave A 全 PASS，再运行：

```text
Wave B = W02 Statistical semantics
```

W03 继续 carry forward RC.9 PASS。

当前 gate：**先完成 RC.11；在 RC.11 GPT Work 通过前，不再邀请用户人工验收。**