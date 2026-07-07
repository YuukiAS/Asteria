---
task_id: "asteria_v0_5_8"
version: "0.5.8"
status: "completed"
executor: "Codex"
risk_level: "low"
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Asteria v0.5.8 Result

## Summary

- Removed the separate `DEFAULT` fallback pill from canvas block headers.
- Kept `AUTO` and `PINNED` as the only primary visible block version mode badges.
- Left fallback state visible through empty version-strip markers and explanatory tooltips.
- Changed version strip marker text to fixed numeric positions, so versions named `V1`, `V2`, and `V3` display as `1`, `2`, and `3` instead of all becoming `V`.

## Files Changed

- `CHANGELOG.md`
- `package.json`
- `package-lock.json`
- `src/components/BlockNode.tsx`
- `src/components/VersionStrip.tsx`
- `src/lib/blockVersionState.ts`
- `src/styles/index.css`
- `results/asteria_v0_5_8_result.md`

## Verification

- `npm run build` - exit 0. TypeScript and Vite production build passed.
- `git diff --check` - exit 0. Only Windows line-ending conversion warnings were reported.
- `rg -n "versionShortLabel|version-badge-default|DEFAULT" src/components src/lib src/styles` - exit 1, confirming the old truncated-label helper and separate default fallback badge are gone.
