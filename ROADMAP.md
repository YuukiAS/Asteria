# Asteria Product Roadmap

更新时间：2026-10-04
状态：Asteria 2.0 Web 当前候选为 `2.0.0-rc.17`。未发布 `2.0.0` stable。

## 0. 当前候选

Asteria 2.0 是 active Web product shell，用一份 canonical semantic graph 支撑 Architecture / Lineage / Evidence 三个 projection。当前正式候选：

```text
CURRENT_CANDIDATE = 2.0.0-rc.17
STABLE_RELEASED = NO
NEXT_ACCEPTANCE_GATE = GPT_WORK_TARGETED_ACCEPTANCE
```

`2.0.0-rc.17` 保留 RC.16 的 scientific graph visual system 与 connector-contact finish，并修复 Frontend Design convergence 中发现的右侧 Inspector top-context 截断问题。Architecture / Lineage / Evidence 的设计 authority 仍是：

1. 当前产品语义和项目规则；
2. `docs/design/SCIENTIFIC_GRAPH_VISUAL_SYSTEM.md`；
3. accepted A/B/C/D/E1/E2 concepts；
4. 未被上述规范替代的 production grammar。

没有 canonical Asteria Figma；Figma 不是当前发布门槛。

## 1. Product Boundary

Asteria 不再定位为“无限画布笔记工具”。2.0 的核心产品是：

> 一个可以理解、追踪、比较和验证统计模型结构的交互式研究地图。

Active source of truth：

```text
entities
symbols
typed relations
semantic variants
view projections
validation state
repository bridge manifests
```

旧 Asteria 1.x React Flow / TipTap / Dexie live canvas 已冻结为 `v1.0.0` compatibility baseline；active source 只保留 v1 -> v2 migration 所需兼容层。

## 2. Current 2.0 Surfaces

Architecture answers how Original TRACE and CAT-TRACE Frozen V2 are structured: symbols, definitions, relations, semantic diff, layer focus, direct/recursive trace, validation, export, Save/Restore, and Inspector.

Lineage is method provenance, not a generic graph. Its first stable set connects TRACE, HMSC, bigMVP, sparse factor / MGP, and CAT-TRACE through typed relation grammar.

Evidence is claim-centered and distinguishes support, pending evidence, limitation, implementation evidence, and closure gaps. Asteria displays evidence status; it does not infer scientific truth from code.

## 3. Acceptance Gate

The next release step is targeted GPT Work acceptance, then ChatGPT consolidated triage, then final human acceptance. Do not ask for user manual QA before GPT Work passes.

Minimum expected GPT Work reviewer set for the current RC.17 candidate:

```text
W01 visual/product design
W05 responsive/accessibility
W06 release red-team
```

W05 is included because RC.17 touched Inspector scroll/viewport behavior. W02 is not required unless a later change touches visible scientific semantics/math meaning. W03 is not required unless a later change touches trace/state/session/search behavior.

## 4. CAT-TRACE Repository Bridge

The first repository bridge is intentionally small and read-only.

### B0 Current Asteria Prototype

Asteria now has a bridge schema, parser/validator, and synthetic CAT-TRACE bridge fixture:

```text
src/architecture/repositoryBridge.ts
scripts/validate-cat-trace-bridge.mjs
```

B0 freezes:

- repository identity and exact commit pin;
- scientific project id and model variant id;
- implementation bindings with stable entity IDs, relative paths, code kind, qualified names, source, confidence, implementation state, commit/ref, structural anchors, and staleness status;
- status objects for blocked/planned modules;
- an explicit evidence boundary that implementation binding is not scientific proof.

### B1 First Real CAT-TRACE Manifest

The first actual CAT-TRACE manifest should bind only high-value anchors:

- C01 probit numerical primitives and Laplace kernel;
- C02 synthetic data/fingerprint/feature-alignment contract functions;
- selected C04-REF reference functions and tests;
- blocker/status objects for C03, GAP-01, GAP-04, and real-data C02.

It does not require a full call graph.

### B2 Asteria Read-Only Ingestion

The first real connection means:

> Asteria can load a CAT-TRACE manifest pinned to a commit and show verified code bindings/status/tests for selected scientific entities, with blocked/unimplemented entities honestly marked.

Later Asteria modules should add importer, staleness validation, Inspector Implementation sections, GitHub jump links, and manifest fixtures/tests.

### B3 Later Code Trace

GitHub/code-call trace is later 2.x work:

- local/static definitions and references;
- selected calls/read/write relationships;
- test links;
- stale/broken binding revalidation;
- code-change impact hints.

B3 must not block the first B0/B1/B2 connection.

## 5. Stable Release Boundary

Do not publish `2.0.0` stable until:

```text
all designated GPT Work reviewers PASS
P0 = 0
P1 = 0
unresolved must-fix P2 = 0
user final human acceptance = PASS
```

Stable release, deployment/publishing decisions, and any new public link remain separate gates.
