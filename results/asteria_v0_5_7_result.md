---
task_id: "asteria_v0_5_7"
version: "0.5.7"
status: "completed"
executor: "Codex"
risk_level: "medium"
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Asteria v0.5.7 Result

## Summary

- Replaced the old undifferentiated title-side variant dots with a dynamic `VersionStrip`.
- The strip follows the current `modelVersions` order instead of hard-coding TRACE-specific examples.
- Added visible `AUTO`, `PINNED`, and `DEFAULT` fallback badges in block headers.
- Updated the inspector version selector to show `AUTO: follow global version` and `PIN <version>`.
- Switched variant naming to the canonical `default`, while preserving legacy import compatibility.
- Included the updated `TODO.md` in this version commit.
- Renamed legacy result files from old V1-style names to their matching 0.x version filenames.

## Files Read

- `TODO.md`
- `src/components/BlockNode.tsx`
- `src/components/InspectorPanel.tsx`
- `src/styles/index.css`
- `src/store/useMapStore.ts`
- `src/lib/exportImport.ts`
- `src/constants/versioning.ts`
- `src/types/map.ts`

## Files Changed

- `TODO.md`
- `CHANGELOG.md`
- `package.json`
- `package-lock.json`
- `src/components/BlockNode.tsx`
- `src/components/InspectorPanel.tsx`
- `src/components/VersionStrip.tsx`
- `src/constants/versioning.ts`
- `src/lib/blockVersionState.ts`
- `src/lib/demo.ts`
- `src/lib/exportImport.ts`
- `src/store/useMapStore.ts`
- `src/styles/index.css`
- `src/types/map.ts`
- `results/asteria_v0_5_7_result.md`
- `results/asteria_v0_1_0_result.md`
- `results/asteria_v0_1_5_result.md`

## Implementation Notes

- Added `resolveBlockVersionState` to centralize requested/rendered variant, AUTO/PINNED state, default fallback, and tooltip text.
- Added `VersionStrip`, which renders one marker per current model version in toolbar order.
- Filled markers indicate that a block has a dedicated variant for that version; empty markers indicate fallback to default.
- Active markers use a ring/scale treatment, so state is not color-only.
- Toolbar global version switching no longer rewrites every block's variant pin state.
- `defaultVariantKey` is now the canonical default variant key. Legacy saved/imported variant keys are mapped into `default` during normalization.
- Removed the old alternate default naming from user-visible and source-level text.

## Verification

- `npm run build` - exit 0. TypeScript and Vite production build passed.
- `git diff --check` - exit 0. Only Windows line-ending conversion warnings were reported.
- Legacy default-name scan across `src`, `TODO.md`, and `CHANGELOG.md` - exit 1, confirming no matches.
- `rg` checks confirmed `VersionStrip`, `AUTO`, `PINNED`, `DEFAULT`, `defaultVariantKey`, and `0.5.7` updates are present.

## Acceptance Criteria Passed

- Old blue dots are replaced by a version strip.
- The strip shows actual configured model versions in order.
- Existing/missing variants and active requested version are visually distinguishable.
- AUTO/PINNED state is visible.
- Default fallback is visible and described in tooltips.
- Block type badges remain intact.
- Existing saved maps still normalize through the export/import path.
- Build passes.

## Known Issues

- Browser/manual smoke testing was not completed because Playwright Chromium is not installed locally.
- The strip uses a fixed five-color cycle for configured versions; user-customizable version colors remain out of scope.

## Recommended Next Task

- Add browser automation coverage for global switching, pinning, fallback, and long-title header layout once local Playwright browsers are available.
