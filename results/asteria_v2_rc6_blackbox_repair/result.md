# Asteria 2.0 RC.6 Black-box Repair Result

## Status

`STATUS = LOCAL_VERIFICATION_PASS_PENDING_PUBLIC_REFRESH`

Implemented `2.0.0-rc.6` acceptance repair for Architecture readability, root-relative trace truth, explicit trace activation, Evidence/Inspector researcher language, and Advanced/debug separation.

## Files Read

- `AGENTS.md`
- `prompts/AGENT_RULES.md`
- `prompts/tasks/asteria_v2_rc6_blackbox_repair_task.md`
- `docs/operations/blackbox-audit/UI_BLACKBOX_BROWSER_CONTRACT.md`
- `docs/operations/blackbox-audit/AUDIT_RESULT_CONTRACT.md`
- `docs/operations/blackbox-audit/reports/RC5_REAUDIT_CONSOLIDATED_REPORT_2026-09-12.md`
- `docs/notes/2026-09-12_asteria_acceptance_mode_public_refresh_contract.md`
- `docs/notes/2026-09-09_trace_and_cat_trace_reference_for_asteria_v2.md`
- `docs/design/accepted-concepts/README.md`
- `docs/design/accepted-concepts/A_light_architecture.png`
- `docs/design/accepted-concepts/B_dark_architecture.png`
- `docs/design/accepted-concepts/C_symbol_trace.png`
- `docs/design/accepted-concepts/D_variant_diff.png`
- `docs/design/accepted-concepts/E1_lineage.png`
- `docs/design/accepted-concepts/E2_evidence.png`

## Implementation Summary

- Added Architecture `Overview` / `Full model` progressive disclosure from the same canonical graph. CAT-TRACE Overview shows a readable canonical subset plus focus-aware direct context; Full model preserves all 37 canonical entities.
- Rewrote recursive trace semantics so upstream and downstream traverse independently from the root. `both` is now the union of same-depth upstream-only and downstream-only traversals without mid-path turns.
- Decoupled selection from active trace using explicit `traceEnabled` and `activeTraceSymbolId` session state. Default and Clear states keep `beta^U_gh` selected for inspection while trace remains OFF.
- Added canonical-supported `c(f) -> mathcal_U` `matched_to` relation for `c(f)=empty` and explicit indices metadata for indexed CAT-TRACE quantities.
- Rendered core canonical definitions with KaTeX presentation while preserving textual definitions/export truth.
- Promoted Semantic Diff before Advanced/debug, moved schema JSON and validation detail into default-collapsed `Advanced / Export & validation`, and improved researcher-facing Evidence Pending/gap language.
- Made Evidence/Lineage inspector headings object-type-aware, including `Dataset Inspector` for Finland fungi and `Pending` for marked discovery / pending dataset lines.
- Hardened light/dense readability with higher minimum contrast for muted graph context and larger Overview node text.

## Verification

- `npm run build` -> PASS
- `npm run test:regression` -> PASS
- `npm run test:architecture-rc6` -> PASS
- `npm run bench:architecture-g05` -> PASS
- `npm run test:browser` -> PASS
- `git diff --check` -> PASS

Browser screenshots:

- `results/asteria_v2_rc6_acceptance/screenshots/architecture-cat-trace-dark.png`
- `results/asteria_v2_rc6_acceptance/screenshots/architecture-cat-trace-dark-1366.png`
- `results/asteria_v2_rc6_acceptance/screenshots/architecture-cat-trace-light-1536.png`
- `results/asteria_v2_rc6_acceptance/screenshots/architecture-original-trace-dark.png`
- `results/asteria_v2_rc6_acceptance/screenshots/architecture-trace-focus.png`
- `results/asteria_v2_rc6_acceptance/screenshots/architecture-light.png`
- `results/asteria_v2_rc6_acceptance/screenshots/lineage-dark.png`
- `results/asteria_v2_rc6_acceptance/screenshots/evidence-dark.png`

Performance summary from `npm run bench:architecture-g05`:

```json
{
  "entityCount": 2200,
  "relationCount": 6200,
  "visibleProjectionCount": 260,
  "indexAverageMs": 2.662,
  "traceAverageMs": 2.706,
  "layerFocusAverageMs": 5.167
}
```

## Public Refresh

Public fixed-URL refresh is required after commit and push under `docs/notes/2026-09-12_asteria_acceptance_mode_public_refresh_contract.md`.

```text
PUBLIC_ACCEPTANCE_URL = https://asteria.httpwwwcardiacnexus-ukb.com/
PUBLIC_ACCEPTANCE_URL_REFRESHED = PENDING_COMMIT_PUSH
PUBLIC_ROOT_CHECK = PENDING_COMMIT_PUSH
PUBLIC_STATUS_CHECK = PENDING_COMMIT_PUSH
PUBLIC_BROWSER_SMOKE = PENDING_COMMIT_PUSH
PUBLIC_VERSION = PENDING_COMMIT_PUSH
```

## Next Action

`NEXT_ACTION = GPT_WORK_BLACKBOX_REAUDIT`
