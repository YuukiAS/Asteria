# Asteria Product Family Boundary

Date: 2026-11-02
Status: product-family boundary defined; Atlas and Blueprint product surfaces not implemented

## 1. Purpose

Asteria is evolving into a product family. The current active implementation
remains the existing Asteria 2.0 scientific architecture product for Original
TRACE and CAT-TRACE Frozen V2. Asteria Atlas and Asteria Blueprint are named
future product lines with independent domain authority; this document does not
turn either plan into a shipped feature.

This boundary follows one rule: keep Atlas and Blueprint semantically separate
until two real consumers demonstrate a stable common capability. Directory
symmetry, similar nouns, or the fact that both products may render nodes and
edges is not evidence for a shared business model.

## 2. Product family

| Product | Responsibility | Current repository state |
| --- | --- | --- |
| Asteria | Product-family name and home of the current Asteria 2.0 scientific architecture product. | Active implementation. |
| Asteria Atlas | Research domains and knowledge maps: scientific tasks, concepts, papers, statistical objects, evidence, method relations, and open structural questions. | Boundary only. No independent product surface or frozen schema exists here. |
| Asteria Blueprint | Complex-system design and implementation blueprints for Design Assurance: components, entry points, state, interfaces, flows, permissions, recovery, implementation locations, and acceptance evidence. | Boundary only. No independent product surface or frozen schema exists here. |

The family name does not imply that every product must live in one runtime, one
repository, one graph schema, or one release cycle.

## 3. Current Asteria 2.0 position

The protected, active product is the Asteria 2.0 Web application under
`src/app/`, `src/architecture/`, and `src/components/`. Its current product
semantics include:

- Architecture, Lineage, and Evidence as three projections of the current
  scientific semantic graph;
- statistical entities, symbols, typed relations, layers, trace, semantic diff,
  validation, and the current Inspector behavior;
- Original TRACE and CAT-TRACE Frozen V2 canonical fixtures;
- the read-only CAT-TRACE repository bridge and its scientific-evidence
  boundary;
- Save/Restore, export, viewport/layout behavior, and v1 migration
  compatibility.

These are current product assets. `src/architecture/` is not a product-neutral
Core merely because some files contain graph, selection, layout, validation, or
export logic. Its public types, relation taxonomy, session defaults, fixtures,
and presentation behavior currently change with Asteria 2.0 scientific-product
requirements.

This task therefore leaves the existing paths and imports intact. Current
Architecture is not renamed to Blueprint, and current Lineage or Evidence is
not relabeled as Atlas.

## 4. Atlas boundary and future import contract

Atlas is responsible for research-domain and knowledge-map content. Its
canonical knowledge content will live in an independent research-knowledge
repository, not inside the current CAT-TRACE Architecture schema.

The first Atlas phase is deliberately simple:

- canonical authoring format: Markdown/YAML;
- primary human reading and navigation surface: Obsidian;
- Asteria Web consumption: undecided until a real use case proves the need;
- current repository dependency: none.

If Asteria Web later consumes Atlas, the integration must be an explicit,
versioned import contract. An Atlas-owned domain model is translated by an
Atlas adapter into the narrow presentation/input form required by its consumer.
Atlas content must not import or pretend to be
`ArchitectureProjectV2`, CAT-TRACE typed relations, or the current Evidence
ontology. The adapter must preserve source identity and report unsupported or
lossy fields instead of silently coercing them.

This repository does not currently contain Atlas paper fixtures, a DII page, a
copied literature map, an Atlas Web route, or an Atlas schema.

## 5. Blueprint boundary and future import contract

Blueprint is responsible for reading complex-system design and implementation
blueprints in a Design Assurance workflow. Its authoritative design truth must
come from future frozen Design Assurance outputs. Blueprint does not invent the
system design it displays.

If Blueprint later enters Asteria, it must own an independent Blueprint domain
model and adapter. Component topology, interfaces, permissions, failure
recovery, implementation state, and acceptance evidence must not be added to
the current scientific ontology merely because both products may use graph-like
views. The current Asteria Architecture view is a statistical/scientific model
surface and is not automatically the future Blueprint product.

This repository does not currently contain a Blueprint schema, system fixture,
Inspector workflow, route, or public service.

## 6. Shared Core decision

### Core Gate

A capability may enter shared Asteria Core only when all five questions have a
specific, evidence-backed answer:

1. Do Atlas and Blueprint both have a concrete, current use case?
2. Does the object have the same meaning in both products?
3. Does it change for the same reasons and on the same lifecycle?
4. Does sharing remove real duplication without adding product conditionals?
5. What concrete duplication or consistency risk appears if the layer is
   removed?

If a proposal can only say that both products may need it later, it does not
pass.

### ACCEPTED_SHARED_CORE

None at this stage. Atlas and Blueprint do not yet exist as two real software
consumers, so no runtime module can pass Core Gate question 1 or demonstrate
the removal risk required by question 5. Existing toolchain dependencies such
as TypeScript, React, Vite, and package scripts remain platform choices, not an
Asteria business Core.

No `src/core/` directory is created by this boundary task. A thin Core remains
an allowed future outcome; it becomes justified only after observed duplication
between two concrete implementations.

### REJECTED_PREMATURE_ABSTRACTIONS

| Candidate | Decision | Core Gate reason |
| --- | --- | --- |
| `ArchitectureProjectV2` and the current statistical entity schema | Keep in the current Asteria 2.0 product. | Atlas and Blueprint do not share its semantics or change reasons; question 2 and question 3 fail. |
| Current `RelationType` taxonomy | Keep product-specific. | Scientific dependency/provenance relations are not the same as system interface, permission, state, or recovery relations; question 2 fails. |
| Evidence ontology and closure status | Keep product-specific. | Paper/theorem/dataset evidence and Design Assurance execution/acceptance evidence have different authority and lifecycle; questions 2 and 3 fail. |
| Universal Inspector or session/search workflow | Reject. | No second implemented workflow exists, and a shared Inspector would require product branches; questions 1 and 4 fail. |
| Universal graph/node/edge model | Reject. | Similar rendering shapes do not establish shared domain meaning; questions 1, 2, and 5 fail. |
| Current graph presentation, viewport, pan/zoom, selection, layout, and export helpers | Leave where they are and reassess later. | These are the strongest low-semantic candidates, but there is no second consumer or measured duplicate today; questions 1 and 5 fail. |
| Current validation primitives and CAT-TRACE repository bridge | Keep product-specific. | Their rules and evidence boundary are tied to the current scientific product; questions 2 and 3 fail. |
| `RenderedMath` and presentation tokens | Leave in the current product. | Reuse is plausible but not demonstrated by Atlas and Blueprint implementations; questions 1 and 5 fail. |

"Rejected" means "not shared now", not "never reusable". Each candidate may
be reconsidered when evidence changes.

## 7. Repository boundary

The current repository boundary is intentionally asymmetric:

```text
src/
  app/             # active Asteria 2.0 shell
  architecture/    # current scientific-product domain and behavior
  components/      # current product UI and presentation
```

There are no placeholder `core`, `atlas`, or `blueprint` source namespaces.
Empty directories and speculative interfaces would suggest implementation or
stability that does not exist. When a real Atlas or Blueprint implementation
arrives, it should receive an explicit product namespace and own domain model;
only observed stable duplication may then move into Core.

`pnpm-workspace.yaml` does not require a monorepo split. Package boundaries,
deployments, and public hostnames remain separate decisions.

## 8. Dependency rules

Future product work must preserve these dependency directions:

```text
Atlas canonical content -> Atlas domain model -> Atlas adapter -> consumer
Blueprint authority     -> Blueprint domain model -> Blueprint adapter -> consumer
```

- Atlas does not depend on the current CAT-TRACE Architecture schema.
- Blueprint does not depend on the current scientific relation or Evidence
  ontology.
- Current Asteria 2.0 does not import planned Atlas or Blueprint modules.
- Adapters translate at product boundaries and must not mutate source truth.
- Shared Core must not contain `if atlas` / `if blueprint` business branches.

## 9. Future convergence rule

Further extraction is allowed only after a second real consumer exists. The
proposal must identify both call sites, the duplicated behavior, identical
semantics, identical lifecycle, the expected consistency risk, and regression
coverage before moving code. The extraction must preserve existing import
compatibility or provide a tested migration path.

If Atlas and Blueprint evolve differently, their implementations remain
separate. A small or empty shared Core is an acceptable steady state.

## 10. Release and public-entry boundary

This document is architecture maintenance, not a product release. It does not
change `2.0.0-rc.19`, publish `2.0.0` stable, add an Atlas or Blueprint host, or
change the fixed Asteria entry point:

```text
https://asteria.httpwwwcardiacnexus-ukb.com/
```

Atlas and Blueprint must not be described as supported product surfaces until
their own implementation and acceptance evidence exist.
