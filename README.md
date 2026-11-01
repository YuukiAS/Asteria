# Asteria

Asteria is a family of tools for turning complex scientific and system
structures into readable, traceable maps.

The current implementation is **Asteria 2.0**, a Web product for statistical
and scientific architecture maps. Asteria Atlas and Asteria Blueprint are
planned product lines with defined boundaries, but neither is implemented as a
product surface in this repository.

Current version: `2.0.0-rc.19` · Stable `2.0.0`: not released

## Product family

| Product | Purpose | Status |
| --- | --- | --- |
| Asteria 2.0 | Statistical and scientific Architecture, Lineage, and Evidence maps | Active release candidate |
| Asteria Atlas | Research-domain knowledge maps | Planned; the first phase uses an independent Markdown/YAML knowledge repository with Obsidian |
| Asteria Blueprint | Complex-system design and implementation blueprints | Planned; awaits authoritative Design Assurance contracts |

There is no shared business Core today. The current `src/architecture/`
schema, relation taxonomy, Evidence semantics, Inspector, session behavior, and
CAT-TRACE bridge belong to Asteria 2.0. Future sharing requires two real
consumers with the same semantics, lifecycle, and change reasons.

## Current implementation: Asteria 2.0

Asteria 2.0 currently provides:

- **Architecture** for statistical entities, symbols, typed relations, model
  layers, Original TRACE / CAT-TRACE Frozen V2 comparison, and semantic diff;
- **Lineage** for method provenance;
- **Evidence** for claims, support, limitations, implementation evidence, and
  unresolved gaps;
- an Inspector, direct and recursive trace, search, export, Save/Restore of the
  2.0 view session, and v1 import compatibility;
- a read-only CAT-TRACE repository-bridge contract with synthetic pinned-commit
  validation.

Atlas has no Web route, schema, data fixture, or public service here. Blueprint
has no schema, workflow, route, or public service here. Current Architecture is
not Blueprint, and current Lineage / Evidence are not Atlas.

## Run locally

```bash
npm install
npm run dev
```

The local development server opens at `http://127.0.0.1:5173/`.

The fixed public acceptance entry remains:

```text
https://asteria.httpwwwcardiacnexus-ukb.com/
```

Public availability is an operational state, not a product-family capability
claim. Shared-server, tunnel, and Cloudflare recovery procedures live in
[`docs/operations/development/RUNTIME_OPERATIONS.md`](docs/operations/development/RUNTIME_OPERATIONS.md).

## Verify

```bash
npm run build
npm run test:product-family-boundary
npm run test:repository-entry
npm run test:regression
npm run test:browser
```

The cumulative regression protects Asteria 1.x import compatibility, the
Asteria 2.0 semantic graph, Original TRACE and CAT-TRACE fixtures, Architecture
/ Lineage / Evidence behavior, the repository bridge, and RC-specific
regressions.

## Read next

| Topic | Document |
| --- | --- |
| Product-family authority | [Asteria Product Family Boundary](docs/design/ASTERIA_PRODUCT_FAMILY_BOUNDARY.md) |
| Product direction | [Product Roadmap](docs/product/ROADMAP.md) |
| Actionable future work | [Product TODO](docs/product/TODO.md) |
| Version and compatibility rules | [Versioning](docs/product/VERSIONING.md) |
| Release history | [Changelog](CHANGELOG.md) |
| Scientific graph presentation | [Scientific Graph Visual System](docs/design/SCIENTIFIC_GRAPH_VISUAL_SYSTEM.md) |
| Runtime operations | [Runtime Operations](docs/operations/development/RUNTIME_OPERATIONS.md) |
| Agent and handoff rules | [AGENTS.md](AGENTS.md) and [Agent Rules](prompts/AGENT_RULES.md) |

## Repository layout

- `src/`: active Asteria 2.0 application and compatibility code.
- `tests/` and `scripts/`: browser, regression, validation, build, and runtime
  tooling.
- `docs/product/`: active roadmap, actionable TODO, and version rules.
- `docs/design/`: long-lived product and visual contracts.
- `docs/operations/`: runtime and acceptance operations.
- `prompts/` and `results/`: file-based task handoff and execution evidence.
- `archive/asteria-v1-ui/`: retired Asteria 1.x live UI/runtime source; it is
  historical reference, not part of the active build.

`v1.0.0` remains the frozen compatibility baseline. Active code retains the v1
payload, fixture, migration, and regression paths required to import historical
maps into Asteria 2.0.
