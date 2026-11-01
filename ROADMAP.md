# Asteria Product Roadmap

更新时间：2026-11-02
状态：Asteria 2.0 Web 当前候选为 `2.0.0-rc.19`。未发布 `2.0.0` stable。Asteria Atlas 与 Asteria Blueprint 已划定产品边界，但尚未实现独立产品界面。

## 0. 当前候选

Asteria 2.0 是 active Web product shell，用一份 canonical semantic graph 支撑 Architecture / Lineage / Evidence 三个 projection。当前正式候选：

```text
CURRENT_CANDIDATE = 2.0.0-rc.19
STABLE_RELEASED = NO
NEXT_ACCEPTANCE_GATE = GPT_WORK_TARGETED_ACCEPTANCE
```

`2.0.0-rc.19` 保留既有科学语义、交互和兼容性合同，并让 Architecture、Lineage、Evidence 使用当前 layout-first 图形呈现机制。Architecture / Lineage / Evidence 的设计 authority 仍是：

1. 当前产品语义和项目规则；
2. `docs/design/SCIENTIFIC_GRAPH_VISUAL_SYSTEM.md`；
3. accepted A/B/C/D/E1/E2 concepts；
4. 未被上述规范替代的 production grammar。

没有 canonical Asteria Figma；Figma 不是当前发布门槛。

## 1. 产品族边界

Asteria 后续按产品族理解，但当前可用产品没有因此改变：

- **Asteria 2.0**：当前正式实现，负责现有科学模型 Architecture、Lineage、Evidence、trace、semantic diff、Inspector、导出、会话状态与 CAT-TRACE 只读仓库桥接。
- **Asteria Atlas**：规划中的科研领域与知识地图产品。第一阶段的权威内容位于独立科研知识仓库，采用 Markdown/YAML，并以 Obsidian 作为主要人工阅读入口。本仓库尚未实现 Atlas Web、Atlas schema 或 Atlas 数据。
- **Asteria Blueprint**：规划中的复杂系统设计与实施蓝图产品。其权威设计真值必须来自未来冻结的 Design Assurance 产物。本仓库尚未实现 Blueprint schema、工作流或界面。

Atlas 与 Blueprint 默认独立。当前没有任何运行时模块满足两边都已真实消费、语义相同、生命周期相同、变化原因相同的条件，因此本阶段不建立共享业务 Core，也不创建占位 `src/core/`、`src/atlas/` 或 `src/blueprint/`。完整规则见 [`docs/design/ASTERIA_PRODUCT_FAMILY_BOUNDARY.md`](docs/design/ASTERIA_PRODUCT_FAMILY_BOUNDARY.md)。

## 2. 当前 Asteria 2.0 产品边界

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

## 3. Current 2.0 Surfaces

Architecture answers how Original TRACE and CAT-TRACE Frozen V2 are structured: symbols, definitions, relations, semantic diff, layer focus, direct/recursive trace, validation, export, Save/Restore, and Inspector.

Lineage is method provenance, not a generic graph. Its first stable set connects TRACE, HMSC, bigMVP, sparse factor / MGP, and CAT-TRACE through typed relation grammar.

Evidence is claim-centered and distinguishes support, pending evidence, limitation, implementation evidence, and closure gaps. Asteria displays evidence status; it does not infer scientific truth from code.

## 4. Acceptance Gate

The next release step is targeted GPT Work acceptance, then ChatGPT consolidated triage, then final human acceptance. Do not ask for user manual QA before GPT Work passes.

Minimum expected GPT Work reviewer set for the current RC.19 candidate:

```text
W01 visual/product design
W05 responsive/accessibility
W06 release red-team
```

W01/W05/W06 remain the current RC.19 parent-campaign scope recorded by the release workflow. A documentation-only product-family boundary change does not itself create a new UI acceptance claim. W02 is not required unless a later change touches visible scientific semantics/math meaning. W03 is not required unless a later change touches trace/state/session/search behavior.

## 5. CAT-TRACE Repository Bridge

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

## 6. Stable Release Boundary

Do not publish `2.0.0` stable until:

```text
all designated GPT Work reviewers PASS
P0 = 0
P1 = 0
unresolved must-fix P2 = 0
user final human acceptance = PASS
```

Stable release, deployment/publishing decisions, and any new public link remain separate gates.
