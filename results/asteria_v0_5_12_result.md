---
task_id: "asteria_v0_5_12"
version: "0.5.12"
status: "completed"
executor: "Codex"
risk_level: "low"
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Asteria v0.5.12 Result

## Summary

- Removed visible `PIN` wording from block version selectors.
- Fixed-version block headers now show the concrete version short label, such as `V1`, instead of `PINNED`.
- The inspector content-version dropdown now shows full version labels with short labels, such as `TRACE (V1)`.
- Block type changes now update background and border when the block still has the previous type defaults.
- Manual block background and border colors remain higher priority and are not overwritten by type changes.
- New block body content now starts empty so type-specific placeholders can appear while editing.

## Files Changed

- `CHANGELOG.md`
- `package.json`
- `package-lock.json`
- `results/asteria_v0_5_12_result.md`
- `src/components/BlockNode.tsx`
- `src/components/InspectorPanel.tsx`
- `src/lib/blockVersionState.ts`
- `src/lib/exportImport.ts`
- `src/store/useMapStore.ts`
- `src/types/map.ts`

## Verification

- `npm run build` - exit 0. TypeScript and Vite production build passed.
- `git diff --check` - exit 0. Only Windows line-ending conversion warnings were reported.
- Source scan confirmed current source no longer contains visible `PIN` / `PINNED` labels.
