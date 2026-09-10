# Result asteria_v2_core_autonomous

AUTONOMOUS_CHAIN_STATUS = RUNNING

## Accepted Concept Archive

Commit:

```text
d75f3509c1d3741937902d99233b7bf0780cb46c docs: archive Asteria 2.0 accepted concepts
```

Remote alignment was verified:

```text
git rev-parse HEAD
d75f3509c1d3741937902d99233b7bf0780cb46c

git ls-remote origin refs/heads/main
d75f3509c1d3741937902d99233b7bf0780cb46c refs/heads/main
```

Archived files:

```text
docs/design/accepted-concepts/A_light_architecture.png
docs/design/accepted-concepts/B_dark_architecture.png
docs/design/accepted-concepts/C_symbol_trace.png
docs/design/accepted-concepts/D_variant_diff.png
docs/design/accepted-concepts/E1_lineage.png
docs/design/accepted-concepts/E2_evidence.png
docs/design/accepted-concepts/README.md
```

All six PNG files were readable and reported as `1586 x 992`, 8-bit RGB, non-interlaced.

## Completed Goals

### G00

Status: completed locally before `v1.0.0` commit.

Result:

```text
results/asteria_v2_g00_result.md
G01_READY = YES
```

Tests:

```text
npm run build: exit 0
npm run test:legacy-roundtrip: exit 0
npm run test:search: exit 0
npm run test:edges: exit 0
npm run test:block-usability: exit 0
npm run test:rich-text: exit 0
npm run test:image-links: exit 0
npm run test:shared-server: exit 0
npm run test:shared-save: exit 0
npm run test:restore-safety: exit 0
npm run test:regression: exit 0, real 2.31s
npm run bench:v1-baseline: exit 0
git diff --check: exit 0
```

Version commit SHA is reported after the `v1.0.0` commit/push operation.

## Model Fixture Correctness

G00 did not implement canonical model variants. It only froze the 1.x legacy map baseline and compatibility fixture.

## Browser QA

Not required for G00. Browser QA begins in later goals, especially G05/G06.

## Performance Summary

G00 baseline:

```json
{"scenario":{"label":"small","nodes":24,"edges":40},"normalizeAverageMs":0.313,"projectionAverageMs":0.122,"historySignatureAverageMs":0.24,"historySignatureBytes":50864}
{"scenario":{"label":"medium","nodes":160,"edges":360},"normalizeAverageMs":2.588,"projectionAverageMs":0.426,"historySignatureAverageMs":2.059,"historySignatureBytes":384011}
{"scenario":{"label":"large","nodes":720,"edges":1800},"normalizeAverageMs":9.878,"projectionAverageMs":1.544,"historySignatureAverageMs":10.003,"historySignatureBytes":1820018}
{"distAssetBytes":2496409}
```

## Accepted-Concept Fidelity Summary

Accepted concepts are archived and documented. G00 intentionally did not implement visual convergence.

## Remaining Issues

- Vite large chunk warning remains as baseline evidence for G05.

NEXT_GOAL = G01
