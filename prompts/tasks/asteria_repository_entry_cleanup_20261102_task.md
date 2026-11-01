---
task_id: asteria_repository_entry_cleanup_20261102
project: YuukiAS/Asteria
status: ready
executor: Codex
risk_level: medium
source_authority: current_user_request_2026-11-02
base_branch: refactor/asteria-product-family-boundary-20261101
cleanup_branch: chore/asteria-repository-entry-cleanup-20261102
target_branch: main
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: true
requires_human_approval: false
allowed_actions:
  - inspect current local and remote Git state, document references, tests, and fixed public entry status
  - preserve the frozen product-family boundary from the source branch
  - rewrite the repository README as the primary product-family entry
  - move active product-maintenance documents under docs/product after updating current references
  - narrow ROADMAP, TODO, and VERSIONING to distinct maintenance responsibilities
  - add focused path and repository-entry validation
  - update the authenticated GitHub repository About description without changing product implementation claims
  - run focused validation, build, cumulative regression, and risk-matched checks
  - commit and push the cleanup branch
  - integrate the cleanup branch into remote main by ordinary fast-forward while preserving published history
  - push and read back remote main
forbidden_actions:
  - modify src product behavior or user-visible UI
  - implement Atlas, Blueprint, shared Core, schemas, routes, data, or public services
  - change Architecture, Lineage, Evidence, Inspector, scientific truth, CAT-TRACE ontology, or v1 compatibility
  - change the fixed public hostname, repair Cloudflare 1033, deploy, or create a tunnel
  - reset, clean, restore, delete, stage, or commit pre-existing screenshot modifications
  - force-push, force-with-lease, squash away product-family history, rewrite history, or delete branches
expected_outputs:
  - README.md
  - docs/product/ROADMAP.md
  - docs/product/TODO.md
  - docs/product/VERSIONING.md
  - focused repository-entry and path validation
  - results/asteria_repository_entry_cleanup_20261102_result.md
stop_conditions:
  - document movement would break a live automation or contract without a safe current-reference update
  - integration would overwrite published main or product-family history
  - any change would require product-semantic redesign or runtime repair
---

# Objective

Make the GitHub repository entry concise and durable: a first-time reader must
understand Asteria, the current Asteria 2.0 implementation, the planned Atlas
and Blueprint product boundaries, current status, how to run the software, and
where to continue reading.

## Frozen product facts

- Asteria is the product-family name and currently hosts Asteria 2.0.
- Asteria 2.0 is the only implemented product surface.
- Atlas and Blueprint are planned and not implemented.
- No shared business Core exists; `src/architecture/` remains a current-product
  asset.
- The current version remains `2.0.0-rc.19`; stable has not been released.

## Documentation responsibility

- `README.md`: repository front door and concise navigation.
- `docs/product/ROADMAP.md`: current position plus near-, medium-, and long-term
  product direction.
- `docs/product/TODO.md`: only actionable future work and protected execution
  constraints.
- `docs/product/VERSIONING.md`: version meaning, compatibility, and release
  rules only.
- `CHANGELOG.md`: immutable chronological release history at the repository
  root.

Historical tasks, results, and notes may keep historical path text. Current
entry points, scripts, and live design references must use the new paths.

## Verification and integration

Validate repository-entry facts, Markdown links and moved paths, build, and the
cumulative regression suite. Browser screenshots are not required because this
task changes no UI; public 1033 is recorded but not repaired.

After verification, push the cleanup branch, read it back, then fast-forward
remote `main` from the verified cleanup branch. The pre-existing local-only
validator-hardening commits belong to an earlier task whose result recorded
`PUSH_STATUS = NOT_RUN_TASK_FORBIDS_EXTERNAL_UPLOAD`; preserve those local
commits without publishing or rewriting them. Read back remote `main`, its
README, product documents, result, commit identity, and GitHub About text.
