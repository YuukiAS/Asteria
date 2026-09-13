# Asteria RC.9 GPT Work full re-audit campaign

Target: `https://asteria.httpwwwcardiacnexus-ukb.com/`  
Expected version: `2.0.0-rc.9`

RC.9 is a broad human-visual repair after RC.8 failed final human acceptance. Run six independent fresh GPT Work tasks in parallel using:

```text
docs/operations/blackbox-audit/prompts/rc9/W01_VISUAL_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc9/W02_SEMANTICS_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc9/W03_STATE_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc9/W04_FIRST_TIME_UX_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc9/W05_RESPONSIVE_ACCESSIBILITY_WORK_PROMPT.md
docs/operations/blackbox-audit/prompts/rc9/W06_RELEASE_REDTEAM_WORK_PROMPT.md
```

Each prompt is self-contained and inlines the canonical Browser contract. W01/W04/W05/W06 also enforce the post-human-failure visual/product-quality gate.

Do not provide Work with RC.8 screenshots, RC.9 implementation result, source code, or other reviewer findings.

Hard gate before returning to human acceptance:

```text
W01-W06 = PASS
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

A core Architecture/Lineage/Evidence visual P2 is a FAIL/FIX_THEN_RETEST for visual reviewers; it is not acceptable as `PASS + P2`.

After all six reports return, give them together to ChatGPT for consolidated triage. Do not let individual Work modify Asteria.