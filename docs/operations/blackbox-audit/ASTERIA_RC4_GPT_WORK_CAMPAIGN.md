# Asteria RC.4 — GPT Work Black-box Campaign

状态：ready-to-run。

共同 target：

```text
https://asteria.httpwwwcardiacnexus-ukb.com/
```

预期可见版本：`2.0.0-rc.4`。

## Canonical Browser policy

唯一 Browser 合规来源：

```text
docs/operations/blackbox-audit/UI_BLACKBOX_BROWSER_CONTRACT.md
```

所有最终发给 GPT Work 的 prompt 必须逐字 inline 该文件当前全文。Work 不需要、也不得访问 Asteria repo 来读取它。

当前 ready-to-paste prompts 已经按此规则生成在：

```text
docs/operations/blackbox-audit/prompts/
```

不要继续使用本文件旧版本中“只能 GPT Work Cloud Browser / 禁止 Playwright fallback”的历史 prompt 文本；那套 Browser 约束已被 canonical contract 替代。

## Reviewer prompts

### W01 — Visual / Scientific Product Design

```text
docs/operations/blackbox-audit/prompts/W01_VISUAL_WORK_PROMPT.md
```

重点：视觉层级、数学可读性、graph visual grammar、dark/light、accepted concept fidelity。

### W02 — Statistical Semantics / Scientific Truth

```text
docs/operations/blackbox-audit/prompts/W02_SEMANTICS_WORK_PROMPT.md
```

重点：Original TRACE / CAT-TRACE 可见科学语义、symbol definition、model switching、Lineage / Evidence truth boundary。

### W03 — Interaction / State Coherence

```text
docs/operations/blackbox-audit/prompts/W03_STATE_WORK_PROMPT.md
```

重点：model/view/trace/layer/search/export/theme/save-restore 的状态同步与 stale-state 问题。

### W04 — First-time Researcher UX / Learnability

```text
docs/operations/blackbox-audit/prompts/W04_FIRST_TIME_UX_WORK_PROMPT.md
```

重点：首次使用是否理解 Project/View/Model、Architecture/Lineage/Evidence 和核心科研价值。

### W05 — Responsive / Accessibility / Dense Scientific UI

```text
docs/operations/blackbox-audit/prompts/W05_RESPONSIVE_ACCESSIBILITY_WORK_PROMPT.md
```

重点：1536×864、1366×768、zoom、keyboard、focus、scroll、contrast、clipping、dense controls。

### W06 — Release Red-team / Normal-user Stress

```text
docs/operations/blackbox-audit/prompts/W06_RELEASE_REDTEAM_WORK_PROMPT.md
```

重点：正常用户范围内快速切 model/view/trace/search/export/session，寻找 stale/double-active/blank/不可恢复状态，并给最终 release gate。

## 并行执行

W01–W06 可以并行独立新开 GPT Work。不要串行继承浏览器状态、截图或前一 reviewer 的结论。

每个 Work 最终必须按：

```text
docs/operations/blackbox-audit/AUDIT_RESULT_CONTRACT.md
```

返回，至少包含：

```text
AUDITOR_ID
AUDIT_RESULT
TARGET_URL
VERSION_OBSERVED
BROWSER_MODE = IN_APP | UI_AUTOMATION_FALLBACK | MIXED_UI
BLACK_BOX_CONTEXT_CONTAMINATED = YES | NO
BROWSER_BLOCKER = NONE | BLOCKED_BY_BROWSER_ENVIRONMENT
P0_COUNT
P1_COUNT
P2_COUNT
P3_COUNT
RELEASE_RECOMMENDATION
```

## 六轮之后

不要让任何 Work 自动修改 Asteria。把六份报告交给 ChatGPT，按 finding 去重后分成：

```text
P1 release blockers
P2 must-fix before stable
P2 accepted/deferred
P3 polish backlog
False positive / unsupported
```

然后生成一张集中 Codex repair task。修复后遵守 acceptance-mode fixed public URL refresh contract，只重跑受影响 reviewer + W06，而不是六轮机械全重跑。
