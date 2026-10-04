# Asteria current state and CAT-TRACE bridge plan — 2026-10-04

## 0. Executive status

Asteria is not at a blank-slate stage. The active product is already the 2.0 Web shell and the repository is currently at `2.0.0-rc.16`.

What is already implemented:

- one canonical semantic graph with Architecture / Lineage / Evidence projections;
- formal Original TRACE and CAT-TRACE Frozen V2 model fixtures;
- first-class symbols, typed relations, layers, semantic diff, trace, search, validation and export;
- Overview / Full model, direct / recursive upstream/downstream trace, layer focus and inspector;
- public fixed acceptance URL and browser regression;
- 2,200-entity / 6,200-relation performance fixture;
- legacy 1.x migration compatibility with the old live canvas archived;
- canonical scientific graph visual system and RC.16 connector/contact regression.

Current product caveat:

- RC.16 has developer self-QA and automated browser evidence, but the 2.0 stable release gate was never closed after RC.16.
- The old acceptance process consumed too much manual iteration. The newly released Frontend Design plugin should now become the normal design-convergence coordinator instead of continuing one-off visual patching.

## 1. Frontend Design authority now available

Current external design workflow authority:

- AI_Skills_Collection repository release: `5.3.1`
- web-development plugin: `0.3`
- normal entry: `frontend-visual-systems`
- routing mode: coordinator-first

For Asteria this means:

- use the Frontend Design coordinator first;
- classify Asteria as a research-product frontend and choose only required delegates;
- no-Figma is valid because Asteria already has durable authority: accepted A/B/C/D/E1/E2 concepts, `docs/design/SCIENTIFIC_GRAPH_VISUAL_SYSTEM.md`, and current production grammar;
- the coordinator may use product-ux, visual direction, design tokens, research-product frontend, responsive/accessibility, motion and webapp testing as needed;
- project scientific semantics remain stricter authority than generic frontend advice.

## 2. What remains before Asteria 2.0 stable

The remaining product work should be treated as one convergence round, not another chain of micro-RCs.

### A. Whole-product frontend convergence

Review the actual RC.16 surface as a product:

- Architecture Overview / Full model;
- CAT-TRACE and Original TRACE;
- selection and trace states;
- Lineage;
- Evidence;
- Inspector;
- Semantic Diff;
- Search / Export / Save / Restore;
- 1536×864 and 1366×768;
- Light / Dark;
- motion and interaction rhythm.

The goal is not “all tests pass”; it is that producer self-QA reports no obvious P1/P2 product-design defect on the exact candidate.

### B. Minimal independent release gate

After producer convergence:

- only the reviewer scopes actually affected by the final frontend convergence should run;
- at minimum W01 visual + W06 release red-team;
- add W04/W05 only if the convergence touched first-use IA or responsive/accessibility substantially;
- W02/W03 can carry forward if scientific semantics / state contracts were untouched.

### C. Final user acceptance

Only after the independent gate is clean should the user spend time on a short final acceptance and permit `2.0.0` stable.

## 3. Current CAT-TRACE implementation readiness

The current CAT-TRACE repo is already useful as a first real Asteria integration source, but only if Asteria displays implementation maturity honestly.

Current implementation facts:

- C00 software baseline: implemented;
- C01 probit numerical primitives + Newton/Laplace kernel: implemented and tested;
- C02 synthetic data/identity contract: implemented and tested;
- real-data C02 contracts: not closed;
- C04 finite-p Albert-Chib reference engine: implemented and repeatedly debugged, but the formal combined reliability gate is still not closed;
- C03 production profile engine: blocked by GAP-01 / GAP-04;
- anonymous zero-slot production integral: still open blocker;
- C05/C06/C08/C09/C10 remain later/blocked.

Therefore the first Asteria↔CAT-TRACE connection must support implementation state such as:

`PLANNED | IMPLEMENTED | TESTED | AUDITED | BLOCKED`

and must not present C03+ as implemented.

## 4. Asteria is not yet connected to CAT-TRACE as a live repository

Today CAT-TRACE appears in Asteria through internal canonical fixtures. Asteria does not yet:

- ingest a CAT-TRACE repository manifest;
- resolve bindings to an exact CAT-TRACE commit;
- show file/function/variable/test bindings;
- track binding staleness;
- construct a local implementation/call graph;
- open live GitHub code anchors from semantic objects.

The schema contains only early placeholders and validation hooks; the full CodeBinding protocol remains a TODO.

## 5. Recommended bridge sequence

Do not jump directly to full GitHub call-graph analysis.

### Bridge B0 — protocol and fixture

In Asteria:

- freeze a small versioned bridge schema;
- add parser/validator;
- add a synthetic implementation-binding fixture;
- add status and stale/broken semantics;
- do not touch CAT-TRACE yet.

### Bridge B1 — first real CAT-TRACE manifest

In CAT-TRACE:

- emit a small machine-readable manifest pinned to an exact commit;
- bind only stable high-value objects first, for example C01/C02 and selected C04 functions/tests;
- explicitly mark blocked/planned objects;
- no requirement that code variable names match LaTeX.

### Bridge B2 — Asteria read-only ingestion

Asteria loads the CAT-TRACE manifest and shows in the Inspector:

- repository + commit;
- where implemented;
- function / variable aliases;
- role: definition / initialization / update / sampling / consumption / diagnostic / test;
- implementation status;
- tests;
- GitHub jump links;
- stale/broken warnings.

This is enough to say “Asteria is connected to CAT-TRACE” at MVP level.

### Bridge B3 — local code trace

Then add optional code indexing/static analysis around the explicit anchors:

- definitions/references;
- local calls;
- selected read/write relationships;
- test links;
- local impact hints.

This is a later 2.x capability and is not required for the first real bridge.

## 6. Time estimate

Assuming no new design blocker:

- Frontend Design convergence + targeted browser evidence: roughly 1–2 focused Codex hours.
- Minimal independent re-audit + final human acceptance + stable release: roughly another 30–60 minutes of elapsed interaction.
- Bridge B0 + B1 + B2 to a credible CAT-TRACE MVP: roughly 3–6 focused engineering hours, likely 2–3 bounded goals.
- B3 richer function-call/read-write tracing: roughly another 1–2 focused days depending on language coverage and how much static analysis is required.

So the practical answer is:

- Asteria 2.0 stable should be close: one concentrated convergence cycle, not weeks.
- A real read-only CAT-TRACE connection is also close: plausibly the same day after stable, or the next focused workday.
- Full GitHub/code-call trace is a later layer and should not block the first CAT-TRACE connection.

## 7. Next goal

The next task should do two things and stop:

1. use the released Frontend Design coordinator to converge Asteria RC.16 into the next release candidate and prepare the smallest independent acceptance gate;
2. perform a read-only CAT-TRACE bridge readiness audit and freeze the exact B0/B1/B2 protocol plan, without yet mutating CAT-TRACE.

That keeps product convergence and integration planning synchronized while avoiding premature cross-repo implementation.
