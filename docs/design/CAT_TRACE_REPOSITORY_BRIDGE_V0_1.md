# CAT-TRACE Repository Bridge V0.1

日期：2026-10-04
状态：B0/B1/B2 design frozen for Asteria-side prototype

## 0. Scope

This bridge connects Asteria scientific entities to a read-only CAT-TRACE repository manifest. It does not modify CAT-TRACE, does not infer new scientific truth from code, and does not require a full call graph.

Audited source:

```text
repository = YuukiAS/CAT-TRACE
branch = main
commit = 628ed400670140c8557234e5c49bf3526d241214
local_readonly_checkout = /home/yuukias/code/CAT-TRACE
```

CAT-TRACE status from current source:

```text
C00 = IMPLEMENTED
C01 = IMPLEMENTED_AND_TESTED
C02_SYNTHETIC = IMPLEMENTED_AND_TESTED
C02_REAL_DATA = NOT_CLOSED
C04-REF v0.1.2 = IMPLEMENTED / TESTED / FORMAL_COMBINED_RELIABILITY_FAILED
C03 = BLOCKED_BY_GAP_01_AND_GAP_04
ZERO_SLOT_BLOCKER_CLOSED = NO
```

## 1. B0 Interchange Identity

A bridge manifest must identify:

- `schemaId`: `asteria.cat_trace.repository_bridge`
- `schemaVersion`: `0.1.0`
- `sourceRepository.owner`: `YuukiAS`
- `sourceRepository.name`: `CAT-TRACE`
- `sourceRepository.url`: `https://github.com/YuukiAS/CAT-TRACE`
- `sourceRepository.defaultBranch`: `main`
- `sourceRepository.commit`: exact 40-character commit SHA
- `scientificProjectId`: `CAT-TRACE`
- `modelVariantId`: `cat-trace-frozen-v2`
- optional `generatedAt`

The manifest must not contain secret paths, private absolute paths, local usernames, tokens, or environment-dependent locations. All code and evidence paths are repository-relative.

## 2. B0 Implementation Binding

Each binding supports at least:

- stable `entityId`;
- `role`;
- repository-relative `path`;
- `codeKind`;
- `qualifiedName` when available;
- optional `testRefs`;
- `source`: `manual | manifest | static_analysis | agent_inferred | human_confirmed`;
- optional `confidence`;
- `implementationState`: `PLANNED | IMPLEMENTED | TESTED | AUDITED | BLOCKED`;
- exact `commit`;
- optional `ref`;
- optional `structuralAnchor` / `codeFingerprint`;
- `bindingStatus`: `CURRENT | STALE | BROKEN | UNKNOWN`.

Line numbers are not persistent identity. They may be used later for navigation hints, but the bridge identity is commit + relative path + qualified name + structural anchor/fingerprint.

## 3. B0 Evidence Boundary

Implementation binding is not scientific proof.

Code can show where a concept is implemented, tested, blocked, or stale. Code cannot automatically update Asteria scientific definitions, claims, theorem status, typed relations, or Evidence closure.

Current C04 can be represented as implemented/tested with reliability limitations, not as a fully reliable reference. C03 and later blocked modules must display `BLOCKED` or `PLANNED` honestly.

## 4. B1 First CAT-TRACE Manifest Scope

The first real CAT-TRACE manifest should bind only selected high-value anchors.

C01:

- `package/TRACE/src/ct_math.cpp` / `ct_probit_tail_terms`
- `package/TRACE/src/ct_probit.cpp` / `ct_probit_laplace`
- tests: `test-math-stability.R`, `test-probit-gradient.R`

C02 synthetic:

- `package/TRACE/R/cat-trace-data.R` / `validate_cat_trace_data`
- `ct_r_make_sparse_binary`
- `ct_r_fit_x_recipe`
- `ct_r_apply_x_recipe`
- `ct_r_align_features`
- `package/TRACE/R/cat-trace-fingerprint.R` / `ct_r_canonical_hash`
- tests: `test-data-contract.R`, `test-reproducibility.R`

C04-REF:

- `package/TRACE/R/cat-trace-reference.R` / `ref_ct_fit`
- `ct_default_ref_control`
- `ct_ref_fixture_F1`
- selected interweaving / diagnostic functions such as `ref_ct_interweave_eta_collapsed_contrast`
- tests: `test-reference-engine.R`, `test-reference-beta-v1.R`, `test-reference-c04-ref-v0-1-1.R`, `test-reference-c04-ref-v0-1-2.R`

Status objects:

- C03 production grouped open-tail inference: `BLOCKED`
- GAP-01 anonymous zero-slot production integrator: `BLOCKED`
- GAP-04 formal preregistration: `BLOCKED`
- real-data C02: `PLANNED`

Full call graph, static indexing, live GitHub API ingestion, and impact analysis are out of scope for V0.1.

## 5. B2 Asteria Ingestion Plan

Later Asteria-side modules should add:

- schema/types: `src/architecture/repositoryBridge.ts`
- parser/validator: fail-closed manifest validation
- importer: load manifest into an Asteria-side repository bridge registry
- status/staleness validator: compare manifest commit/ref and binding anchors
- Inspector Implementation section: display bindings, status, tests, limitations
- GitHub jump link: construct repository links only from URL + commit + relative path
- tests/fixtures: synthetic fixture first, then real CAT-TRACE manifest fixture

Definition of first real CAT-TRACE connection:

> Asteria can load a CAT-TRACE manifest pinned to a commit and show verified code bindings/status/tests for selected scientific entities, with blocked/unimplemented entities honestly marked.

## 6. Current Asteria B0 Prototype

Implemented in Asteria only:

```text
src/architecture/repositoryBridge.ts
scripts/validate-cat-trace-bridge.mjs
```

Prototype status:

```text
BRIDGE_SCHEMA_PROTOTYPE = PASS
LIVE_GITHUB_API_INGESTION = NOT_INCLUDED
CAT_TRACE_REPO_MUTATION = NO
CALL_GRAPH_STATIC_ANALYSIS = NOT_INCLUDED
SCIENTIFIC_TRUTH_CHANGED = NO
```
