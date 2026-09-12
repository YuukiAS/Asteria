# Result asteria_v2_rc4_archive_legacy_acceptance

STATUS = LOCAL_VERIFICATION_PASS_PENDING_PUBLIC_REFRESH
CURRENT_VERSION = 2.0.0-rc.4

## Scope

This result records the RC.4 acceptance fix that makes Asteria 2.0 the only active Web product shell.

## Completed

- Replaced the active root render tree with the Asteria 2.0 shell: top command bar, Architecture / Lineage / Evidence workspace, and Architecture reference panel.
- Removed active Asteria 1.x startup chooser behavior and old shared/local workspace startup gate from the app entry.
- Removed the old live Canvas / Toolbar / Inspector / Story product surface from active `src/components`.
- Removed the `Legacy V1` compatibility button from the active 2.0 panel; v1 compatibility now remains test/fixture/parser only.
- Added validated 2.0 session initialization from the scoped `asteria-v2-rc-view-state` key, with CAT-TRACE Architecture / CAT-TRACE Frozen V2 / `beta^U_gh` as the no-state default.
- Archived retired 1.x live UI/runtime source under `archive/asteria-v1-ui/`.
- Updated README, ROADMAP, VERSIONING, CHANGELOG, package version, regression scripts, browser suite, and screenshots for RC.4.

## Legacy Live UI

LEGACY_LIVE_UI = REMOVED_FROM_ACTIVE_APP

Archived source:

```text
archive/asteria-v1-ui/
```

The archive is historical reference only. It is not imported by the active Asteria 2.0 build and does not provide a hidden live legacy canvas mode.

## Legacy Migration Compatibility

LEGACY_MIGRATION_COMPATIBILITY = PRESERVED

Active compatibility retained:

- v1 payload/type definitions
- v1 import normalization/parser
- `legacyV1FreezeMap`
- `migrateV1MapToArchitectureProjectV2`
- legacy migration round-trip regression

## Local Verification

```text
npm run test:architecture-rc4
PASS
```

```text
npm run build
PASS
```

```text
npm run test:regression
PASS
```

Validated regression chain:

```text
test:legacy-roundtrip
test:architecture-kernel
test:canonical-trace
test:architecture-g03
test:architecture-g04
test:architecture-g05
test:architecture-g06
test:architecture-rc3
test:architecture-rc4
test:shared-server
```

```text
npm run test:browser
PASS
3 passed
```

Browser QA generated:

```text
results/asteria_v2_rc4_acceptance/screenshots/architecture-cat-trace-dark.png
results/asteria_v2_rc4_acceptance/screenshots/architecture-original-trace-dark.png
results/asteria_v2_rc4_acceptance/screenshots/architecture-trace-focus.png
results/asteria_v2_rc4_acceptance/screenshots/lineage-dark.png
results/asteria_v2_rc4_acceptance/screenshots/evidence-dark.png
results/asteria_v2_rc4_acceptance/screenshots/architecture-light.png
```

```text
git diff --check
PASS
```

## Public Refresh

Per `docs/notes/2026-09-12_asteria_acceptance_mode_public_refresh_contract.md`, the fixed public URL refresh and smoke must be performed after the `v2.0.0-rc.4` commit is pushed and `HEAD == origin/main`.

Public evidence is therefore recorded in the final operator response for this task after push.
