# Asteria RC.6 — GPT Work Black-box Campaign

状态：ready-to-run。  
目标版本：`2.0.0-rc.6`  
固定入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`

## Reviewer prompts

直接复制以下对应文件**全文**到六个独立 GPT Work。每个 Work fresh start，不继承其他 reviewer 的浏览器状态或结论。

```text
docs/operations/blackbox-audit/prompts/rc6/W01_VISUAL_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc6/W02_SEMANTICS_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc6/W03_STATE_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc6/W04_FIRST_TIME_UX_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc6/W05_RESPONSIVE_ACCESSIBILITY_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc6/W06_RELEASE_REDTEAM_WORK_PROMPT.md
```

六份 prompt 都已经完整 inline 当前：

```text
docs/operations/blackbox-audit/UI_BLACKBOX_BROWSER_CONTRACT.md
```

Work 不应访问 repo/source/tests/results/旧审计报告来获取 expected behavior。

## Parallel execution

W01–W06 可以并行运行。

- W01: Visual / scientific product design
- W02: Statistical semantics / scientific truth
- W03: Interaction / state coherence
- W04: First-time researcher UX / learnability
- W05: Responsive / accessibility
- W06: Release red-team

## Gate

全部报告返回后交给 ChatGPT consolidated triage。

只有：

```text
W01-W06 all PASS
P0 = 0
P1 = 0
unresolved must-fix P2 = 0
BLACK_BOX_CONTEXT_CONTAMINATED = NO for all
BROWSER_BLOCKER = NONE for all
```

才进入用户人工最终验收。

若 gate 失败，不让用户先肉眼验收；先生成集中 Codex repair task。
