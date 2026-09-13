# Asteria 2.0 GPT Work Black-box Audit

日期：2026-09-13  
固定验收入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`  
当前产品版本：`2.0.0-rc.9`  
当前验收阶段：`GPT_WORK_FULL_REAUDIT_W01_W06`

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

该文件不是第二套 Browser 规则，而是 stable 前的视觉质量 gate。Broad visual repair 后，W01/W04/W05/W06 必须显式覆盖整屏 gestalt、动态 selection、card/edge-label collision、clipping、math rendering、copy quality 和 motion 要求。

核心 Architecture/Lineage/Evidence 的视觉 P2 不得再以 `PASS + P2` 放行 stable；如果影响科研读图，应 FAIL/FIX_THEN_RETEST。

## Reviewer scopes

- `W01` Visual / scientific-product design：布局、数学可读性、graph visual grammar、theme、motion、gestalt quality。
- `W02` Statistical semantics：Original TRACE / CAT-TRACE scientific truth、symbol/relations、Evidence truth boundary、visible math correctness。
- `W03` Interaction / state coherence：model/view/trace/layer/search/export/theme/save-restore state truth，以及 selection/trace 前后 geometry stability。
- `W04` First-time researcher UX：首次理解、信息层级、stable-facing copy、AI/internal language cleanup。
- `W05` Responsive / accessibility：1366/1536、keyboard/focus/contrast/scroll/hit target、collision/clipping。
- `W06` Release red-team：正常用户 stress、恢复能力、motion/overlap/stale/double-active/blank/失效 disclosure 等。

## Acceptance Gate：先 Work，后用户

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

### Human override

如果用户最终人工验收发现明确 blocker：

```text
FINAL_HUMAN_ACCEPTANCE = FAIL
PREVIOUS_PASS_FOR_AFFECTED_SCOPE = INVALIDATED
STABLE_RELEASE = BLOCKED
```

必须把用户看到的问题转成 exact regression 和下一张 repair task；不能用“之前 Work 已 PASS”反驳。

## Dynamic reviewer selection

不要机械地每个 RC 都跑 W01–W06 六轮。

- broad architecture / ontology / scientific semantics / multi-surface repair：完整 W01–W06；
- narrow repair：只跑受影响 reviewer + W06；
- 上一 RC 已 PASS 且本轮没有触碰该 reviewer 核心 scope：可由 consolidated report 明确 carry forward。

Reviewer scope 映射：

```text
visual / layout / theme / graph grammar / motion -> W01
scientific semantics / math truth / evidence     -> W02
trace / state / session / geometry stability     -> W03
learnability / copy / first-use IA               -> W04
responsive / keyboard / accessibility            -> W05
any release repair                               -> W06
```

## 当前状态：RC.9 已完成，进入 full re-audit

RC.8 人工验收失败记录：

```text
docs/operations/acceptance/RC8_HUMAN_ACCEPTANCE_FAILURE_2026-09-13.md
```

RC.9 repair task / result / review：

```text
prompts/tasks/asteria_v2_rc9_human_visual_repair_task.md
results/asteria_v2_rc9_human_visual_repair/result.md
prompts/tasks/asteria_v2_rc9_human_visual_repair_review.md
```

RC.9 product commit：

```text
1afa2dd8d0d20bccf05c58eb7b5c6e48cc9deb9d
```

RC.9 result reports PASS for:

```text
NO_NODE_OVERLAP
NO_EDGE_LABEL_CARD_COLLISION
NO_PRIMARY_TEXT_CLIPPING
SELECTION_GEOMETRY_STABLE
MOTION_QUALITY
MATH_RENDERING_MAIN_UI
COPY_QUALITY_MAIN_UI
LINEAGE_VISUAL_GRAMMAR
EVIDENCE_VISUAL_GRAMMAR
```

Because RC.9 touches Architecture geometry/motion/edge grammar, Semantic Diff math/copy, Lineage/Evidence presentation and responsive visual behavior, it is a broad repair. Rebuild the full black-box baseline:

```text
W01 + W02 + W03 + W04 + W05 + W06
```

Plan:

```text
docs/operations/blackbox-audit/RC9_GPT_WORK_FULL_REAUDIT_PLAN_2026-09-13.md
```

Campaign:

```text
docs/operations/blackbox-audit/ASTERIA_RC9_GPT_WORK_CAMPAIGN.md
```

Ready-to-paste prompts:

```text
docs/operations/blackbox-audit/prompts/rc9/W01_VISUAL_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc9/W02_SEMANTICS_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc9/W03_STATE_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc9/W04_FIRST_TIME_UX_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc9/W05_RESPONSIVE_ACCESSIBILITY_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc9/W06_RELEASE_REDTEAM_WORK_PROMPT.md
```

Each reviewer must start fresh and must not receive RC.8 screenshots, RC.9 implementation result, source code, or another reviewer report.

## RC.9 full gate

```text
W01-W06 = PASS
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

## 历史审计

- RC.4：`reports/RC4_CONSOLIDATED_REPORT_2026-09-12.md`
- RC.5：`reports/RC5_REAUDIT_CONSOLIDATED_REPORT_2026-09-12.md`
- RC.6：`reports/RC6_REAUDIT_CONSOLIDATED_REPORT_2026-09-13.md`
- RC.7：`reports/RC7_TARGETED_REAUDIT_CONSOLIDATED_REPORT_2026-09-13.md`
- RC.8 GPT Work gate：`reports/RC8_FINAL_BLACKBOX_GATE_2026-09-13.md`
- RC.8 human failure：`../acceptance/RC8_HUMAN_ACCEPTANCE_FAILURE_2026-09-13.md`

当前 gate：**运行 RC.9 fresh W01–W06。全部通过后，再决定是否值得重新邀请用户做人工验收。**
