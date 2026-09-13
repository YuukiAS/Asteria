# Asteria 2.0 RC.8 Light Trace Contrast Result

## Status

`STATUS = COMPLETE`

Implemented the final narrow `2.0.0-rc.8` contrast patch for the exact W05/W01 repeated finding: 1366x768 CAT-TRACE Architecture Overview in Light theme with trace ON.

## Files Read

- `AGENTS.md`
- `prompts/AGENT_RULES.md`
- `prompts/tasks/asteria_v2_rc8_light_trace_contrast_task.md`
- `docs/operations/blackbox-audit/reports/RC7_TARGETED_REAUDIT_CONSOLIDATED_REPORT_2026-09-13.md`
- `docs/operations/blackbox-audit/UI_BLACKBOX_BROWSER_CONTRACT.md`
- `docs/notes/2026-09-12_asteria_acceptance_mode_public_refresh_contract.md`
- `results/asteria_v2_rc7_release_polish/result.md`
- Current `src/styles/index.css`, `ArchitectureWorkspace.tsx`, browser tests, package scripts, and version docs.

## Implementation Summary

- Raised only Light-theme muted graph context readability: muted nodes, muted relation groups, and muted relation paths are no longer close to watermark in the hard 1366 trace-ON state.
- Added explicit Light-theme overrides for `architecture-map-edge-muted + architecture-map-edge-selected` and `architecture-map-edge-muted + architecture-map-edge-trace` so selected/active labels are not double-dimmed by group opacity.
- Preserved active selected/upstream/downstream hierarchy by keeping active/selected paths and labels stronger than muted context.
- Left dark-theme edge weights unchanged; no global dark muted-edge brightening was added.
- Added `npm run test:architecture-rc8`, `npm run smoke:public-rc8`, and an exact Playwright case for 1366 Light CAT-TRACE Architecture Overview with `c_f` / Catalogue match selected and trace enabled.

## Scope Guard

```text
REVIEWER_SCOPE_EXPANDED = NO
SCIENTIFIC_FIXTURES_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
DARK_THEME_UNCHANGED = YES
```

`npm run test:architecture-rc8` asserts that `src/architecture/fixtures`, `src/architecture/trace.ts`, `src/architecture/session.ts`, `src/architecture/viewProjection.ts`, and `src/components/ArchitectureWorkspace.tsx` are unchanged in the RC.8 worktree diff.

## Verification

```text
npm run build -> PASS
npm run test:regression -> PASS
npm run test:architecture-rc8 -> PASS
npm run test:browser -> PASS
git diff --check -> PASS
```

`npm run bench:architecture-g05` was not rerun because the production change is CSS/presentation-only and does not touch algorithm, projection, session, or performance code.

Browser mode:

```text
BROWSER_MODE = UI_AUTOMATION_FALLBACK
BROWSER_PLUGIN = NOT_AVAILABLE_IN_CURRENT_SESSION
BLACK_BOX_CONTEXT_CONTAMINATED = NO
BROWSER_BLOCKER = NONE
```

Focused browser evidence:

- `/tmp/asteria-browser-qa/rc8-light-trace-on-1366.png`
- `/tmp/asteria-browser-qa/rc8-dark-trace-on-1366.png`
- `results/asteria_v2_rc8_acceptance/screenshots/architecture-cat-trace-dark.png`
- `results/asteria_v2_rc8_acceptance/screenshots/architecture-cat-trace-light-1536.png`
- `results/asteria_v2_rc8_acceptance/screenshots/architecture-cat-trace-dark-1366.png`
- `results/asteria_v2_rc8_acceptance/screenshots/architecture-light.png`
- `results/asteria_v2_rc8_acceptance/screenshots/architecture-trace-focus.png`
- `results/asteria_v2_rc8_acceptance/screenshots/architecture-original-trace-dark.png`
- `results/asteria_v2_rc8_acceptance/screenshots/lineage-dark.png`
- `results/asteria_v2_rc8_acceptance/screenshots/evidence-dark.png`

## Fixed Public URL Gate

Fixed public URL verification must be performed after the `v2.0.0-rc.8` commit is pushed to `origin/main` under `docs/notes/2026-09-12_asteria_acceptance_mode_public_refresh_contract.md`.

```text
PUBLIC_ACCEPTANCE_URL = https://asteria.httpwwwcardiacnexus-ukb.com/
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_ROOT_CHECK = PASS
PUBLIC_STATUS_CHECK = PASS
PUBLIC_BROWSER_SMOKE = PASS
PUBLIC_VERSION = 2.0.0-rc.8
```

## Required Final Fields

```text
LIGHT_TRACE_CONTEXT_READABILITY = PASS
ACTIVE_TRACE_HIERARCHY_PRESERVED = PASS
DARK_THEME_UNCHANGED = PASS
SCIENTIFIC_FIXTURES_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
REVIEWER_SCOPE_EXPANDED = NO
NEXT_ACTION = GPT_WORK_TARGETED_REAUDIT_W05_W06
```
