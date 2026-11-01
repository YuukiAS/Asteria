---
task_id: asteria_product_family_boundary_20261101
title: Asteria product-family boundary convergence
source_authority: current_user_request_2026-11-02
baseline_branch: origin/main
requested_branch: refactor/asteria-product-family-boundary-20261101
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: true
requires_human_approval: false
allowed_actions:
  - read current repository instructions, product documents, source boundaries, tests, validation, and public smoke entry
  - create the requested independent branch from latest origin/main
  - add product-family boundary documentation and narrowly scoped documentation validation
  - update README.md, ROADMAP.md, and TODO.md without changing product behavior
  - run build, regression, browser, and fixed-public-entry smoke validation
  - commit and push only task-owned files on the requested branch
forbidden_actions:
  - implement Atlas or Blueprint product surfaces, schemas, fixtures, or sample data
  - create a universal graph, evidence, relation, or inspector ontology
  - move or rename stable Asteria 2.0 source solely for directory symmetry
  - change CAT-TRACE scientific truth, ontology, bridge semantics, UI behavior, release version, or fixed public URL
  - deploy, restart production tunnel infrastructure, create alternate public URLs, force-push, or rewrite history
protected_surfaces:
  - src/architecture
  - src/components
  - src/app
  - CAT-TRACE fixtures and repository bridge
  - Architecture, Lineage, Evidence, Inspector, trace, semantic diff, Save/Restore, export, viewport, and layout behavior
  - v1 compatibility and current release contracts
expected_outputs:
  - docs/design/ASTERIA_PRODUCT_FAMILY_BOUNDARY.md
  - updated README.md, ROADMAP.md, and TODO.md
  - focused automated validation for the product-family documentation contract
  - results/asteria_product_family_boundary_20261101_result.md
stop_conditions:
  - any change would require inventing Atlas or Blueprint domain semantics
  - any change would require weakening existing regression or visual gates
  - unrelated dirty work appears in the task-owned paths
---

# Objective

Converge the repository boundary from a single-product description toward an
Asteria product family that can later contain Asteria Atlas and Asteria
Blueprint, while preserving the current Asteria 2.0 scientific architecture
product and CAT-TRACE assets exactly.

# Frozen product boundary

- The current active implementation remains Asteria 2.0: the existing
  CAT-TRACE / Original TRACE Architecture, Lineage, and Evidence product.
- Asteria Atlas is a planned research-domain and knowledge-map product. Its
  first phase remains an independent Markdown/YAML knowledge repository read
  primarily through Obsidian. No Atlas Web surface or domain schema is part of
  this task.
- Asteria Blueprint is a planned complex-system design and implementation
  blueprint product. Its authoritative truth must come from future frozen
  Design Assurance outputs. No Blueprint surface or domain schema is part of
  this task.
- Atlas and Blueprint are independent consumers by default. Shared Core accepts
  only capabilities that pass all five Core Gate questions with two real
  consumers and identical semantics, lifecycle, and change reasons.

# Core Gate

Every accepted shared capability must prove:

1. Atlas and Blueprint both have concrete current use cases.
2. The object has the same meaning for both products.
3. It changes for the same reasons in both products.
4. Sharing reduces duplication without product branches in Core.
5. Removing the shared layer would cause specific duplication or consistency
   risk.

The result must include `ACCEPTED_SHARED_CORE` and
`REJECTED_PREMATURE_ABSTRACTIONS` with item-level reasoning. An empty or very
thin accepted Core is a valid outcome.

# Implementation policy

Prefer documentation-first boundaries and stable import compatibility. Move an
existing module only when the move provides a concrete current capability or
consistency benefit. Do not create empty product namespaces or placeholder
business interfaces that can be mistaken for implemented products.

# Verification and delivery

Record the baseline commit and pre-change results. After changes, run build,
cumulative regression, complete browser tests, and the fixed public RC.19
smoke. Public smoke failure caused by pre-existing external infrastructure must
remain explicit and must not be converted into a product PASS. This task does
not authorize production tunnel restart.

Commit with a non-version maintenance message, push the requested branch, and
read back the remote branch's key files. Do not publish a stable release or
create a pull request.
