# Asteria Next 来源清单

本清单固定截至 2026-10-28 已核对的远端来源。`latest relevant commit` 是本次核对时该研究分支或成果路径的固定提交，不表示提交内容已被 Asteria 采用。

## AI_Research_Toolkit

Repository：[YuukiAS/AI_Research_Toolkit](https://github.com/YuukiAS/AI_Research_Toolkit)

### R2 系统展示

| 来源 ID | branch | latest relevant commit | result root | primary files | prototype path | current completeness | role in final convergence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ART-R2-G6` | `research/complex-system-showcase-20261026-r2-gpt6` | [`1508994fd3b4e478d5a39c569d42cb87460de77e`](https://github.com/YuukiAS/AI_Research_Toolkit/commit/1508994fd3b4e478d5a39c569d42cb87460de77e) | [`docs/research/complex-system-showcase-20261026/r2/gpt6/`](https://github.com/YuukiAS/AI_Research_Toolkit/tree/1508994fd3b4e478d5a39c569d42cb87460de77e/docs/research/complex-system-showcase-20261026/r2/gpt6) | `RESULT.md`, `DESIGN.md`, `ARCHITECTURE_MODEL.md`, `RESEARCH.md`, `QA.md`, `ACCEPTANCE.md`, `COPY_REVIEW.md`, `COPY_EDITORIAL_AUDIT.tsv` | `docs/research/complex-system-showcase-20261026/r2/gpt6/prototype/` | 研究、原型、截图、浏览器与编辑审查材料完整；未测真机与读屏器，未实施或部署 DA | 历史产品/交互候选；为整体拓扑、关系探索和路径叙事提供输入，不是正式基线 |
| `ART-R2-G56` | `research/complex-system-showcase-20261026-r2-gpt56` | [`a76aafa6d48eb9b947d5683cae35aa3e41141c96`](https://github.com/YuukiAS/AI_Research_Toolkit/commit/a76aafa6d48eb9b947d5683cae35aa3e41141c96) | [`docs/research/complex-system-showcase-20261026/r2/gpt56/`](https://github.com/YuukiAS/AI_Research_Toolkit/tree/a76aafa6d48eb9b947d5683cae35aa3e41141c96/docs/research/complex-system-showcase-20261026/r2/gpt56) | `RESULT.md`, `DESIGN.md`, `ARCHITECTURE_MODEL.md`, `ACCEPTANCE.md`, `COPY_EDITORIAL_AUDIT.tsv` | `docs/research/complex-system-showcase-20261026/r2/gpt56/prototype/` | 研究、原型、截图和浏览器验收完整；DA 实施、入口接线和跨插件消费未完成 | 历史产品/交互候选；为状态表达、分层与移动端路径阅读提供输入，不是正式基线 |
| `ART-R2-COMPARE` | `research/complex-system-showcase-20261026-r2-comparison` | [`515c66acd5aa0c972ef5b0e97e336894d1932a8c`](https://github.com/YuukiAS/AI_Research_Toolkit/commit/515c66acd5aa0c972ef5b0e97e336894d1932a8c) | [`docs/research/complex-system-showcase-20261026/r2/comparison/`](https://github.com/YuukiAS/AI_Research_Toolkit/tree/515c66acd5aa0c972ef5b0e97e336894d1932a8c/docs/research/complex-system-showcase-20261026/r2/comparison) | `COMPARISON.md`, `comparison.html`, `metrics.json`, 两组桌面与移动截图 | 无独立新原型；比较对象为两条 R2 分支 | 本地 A/B 比较与截图证据完整；只比较 R2 原型，不能证明生产接线 | 历史比较证据；其“赢家/基线”建议不自动继承为 Asteria Next 决定 |

### GPT Work 内容与编辑审查

| 来源 ID | branch | latest relevant commit | result root | primary files | prototype path | current completeness | role in final convergence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ART-EDITORIAL` | `research/complex-system-showcase-20261027-work-editorial-audit` | [`ce8442b799e0096b79367da701289255bfa23bd3`](https://github.com/YuukiAS/AI_Research_Toolkit/commit/ce8442b799e0096b79367da701289255bfa23bd3) | [`docs/research/complex-system-showcase-20261026/r2/editorial-audit/`](https://github.com/YuukiAS/AI_Research_Toolkit/tree/ce8442b799e0096b79367da701289255bfa23bd3/docs/research/complex-system-showcase-20261026/r2/editorial-audit) | `EDITORIAL_AND_CURATION_AUDIT.md`, `VISIBLE_CONTENT_AUDIT.tsv`, `REGRESSION_CASES.tsv`, `PLUGIN_REALITY_CHECK.md`, `QA_RESULTS.json`, `REMOTE_READBACK.md` | `before/gpt6/`, `before/gpt56/`, `revised/gpt6/`, `revised/gpt56/`; screenshots in `screenshots/before/` and `screenshots/after/` | 720 项可见内容审计、26 个回归案例、before/after 和远端回读完整 | whole-product 内容、编辑取舍和真实 before/after 证据；不定义 Asteria 架构 |

### Architecture Evolution

| 来源 ID | branch | latest relevant commit | result root | primary files | prototype path | current completeness | role in final convergence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ART-ARCH-A` | `research/architecture-evolution-system-20261027-pro-a` | [`c733aa065d9ad102a64bb5f5f55453cd31a7e7bc`](https://github.com/YuukiAS/AI_Research_Toolkit/commit/c733aa065d9ad102a64bb5f5f55453cd31a7e7bc) | [`docs/research/architecture-evolution-system-20261027/pro-a/`](https://github.com/YuukiAS/AI_Research_Toolkit/tree/c733aa065d9ad102a64bb5f5f55453cd31a7e7bc/docs/research/architecture-evolution-system-20261027/pro-a) | `RESULT.md`, `PRODUCT_AND_INFORMATION_ARCHITECTURE.md`, `ARCHITECTURE_DESIGN_METHOD.md`, `SOURCE_OF_TRUTH_AND_IMPLEMENTATION_BINDING.md`, `VERSION_AND_EVOLUTION_MODEL.md`, `THREE_PROJECT_STRESS_TEST.md`, `OPEN_SOURCE_RESEARCH.md`, `IMPLEMENTATION_OPTIONS.md` | `docs/research/architecture-evolution-system-20261027/pro-a/prototype/` | 产品模型、方法、来源/版本方案、三项目压力测试、原型与 QA 完整；未做真实用户实验或生产接线 | 机制、来源绑定、修订、漂移和 Freeze 的候选输入；不直接成为 Asteria design |
| `ART-ARCH-B` | `research/architecture-evolution-system-20261027-pro-b` | [`4322881023b40f70352d5cc380c585d90098fb12`](https://github.com/YuukiAS/AI_Research_Toolkit/commit/4322881023b40f70352d5cc380c585d90098fb12) | [`docs/research/architecture-evolution-system-20261027/pro-b/`](https://github.com/YuukiAS/AI_Research_Toolkit/tree/4322881023b40f70352d5cc380c585d90098fb12/docs/research/architecture-evolution-system-20261027/pro-b) | `RESULT.md`, `PRODUCT_AND_INFORMATION_ARCHITECTURE.md`, `ARCHITECTURE_DESIGN_METHOD.md`, `SEMANTIC_MODEL.md`, `SOURCE_OF_TRUTH_AND_IMPLEMENTATION_BINDING.md`, `VERSION_AND_EVOLUTION_MODEL.md`, `THREE_PROJECT_STRESS_TEST.md`, `OPEN_SOURCE_RESEARCH.md`, `IMPLEMENTATION_OPTIONS.md`, `VALIDATION_REPORT.json` | `docs/research/architecture-evolution-system-20261027/pro-b/prototype/` | 研究、语义模型、账本样例、校验、原型和截图完整；仍是研究候选 | 另一条机制、账本、状态轴、版本与来源候选输入；不直接成为 Asteria design |

### Asteria Next convergence

| 来源 ID | branch | latest relevant commit | result root | primary files | prototype path | current completeness | role in final convergence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ART-NEXT-A` | `research/asteria-next-convergence-20261027-pro-a` | [`c5abae6983c292825b233270de7c8ea53034e548`](https://github.com/YuukiAS/AI_Research_Toolkit/commit/c5abae6983c292825b233270de7c8ea53034e548) | [`docs/research/asteria-next-convergence-20261027/pro-a/`](https://github.com/YuukiAS/AI_Research_Toolkit/tree/c5abae6983c292825b233270de7c8ea53034e548/docs/research/asteria-next-convergence-20261027/pro-a) | `RESULT.md`, `ASTERIA_NEXT_CANONICAL_SPEC.md`, `SEMANTIC_MODEL.md`, `CONVERGENCE_DECISION_MATRIX.md`, `SOURCE_BINDING_AND_EVIDENCE.md`, `VERSION_EVOLUTION_AND_DRIFT.md`, `ARCHITECTURE_DESIGN_AND_FREEZE.md`, `FOUR_REFERENCE_PROJECTS.md`, `VISUAL_SYSTEM.md`, `OPEN_SOURCE_ADOPTION.md`, `CONTENT_AND_TASTE_AUDIT.md`, `CODEX_HANDOFF_CONTRACT.md` | `docs/research/asteria-next-convergence-20261027/pro-a/prototype/`; QA in `pro-a/qa/` | 单一候选、原型、模型测试、浏览器/主题/移动端检查和内容审查完整；明确等待 GPT Work 比较与 Chat 裁决 | 完整 convergence 候选之一；文件名中的 canonical 只属于该候选，不代表 Asteria 已采纳 |
| `ART-NEXT-B` | `research/asteria-next-convergence-20261027-pro-b` | [`2703428bc9b080b809adb96b5fa93f3f51fef590`](https://github.com/YuukiAS/AI_Research_Toolkit/commit/2703428bc9b080b809adb96b5fa93f3f51fef590) | [`docs/research/asteria-next-convergence-20261027/pro-b/`](https://github.com/YuukiAS/AI_Research_Toolkit/tree/2703428bc9b080b809adb96b5fa93f3f51fef590/docs/research/asteria-next-convergence-20261027/pro-b) | 仅 `WRITE_ACCESS_CHECK.md` | 未发现 | 不完整：远端分支只有写入检查；没有结果、设计、原型或 QA | 预期的独立 convergence 候选入口；现有材料不足以参与最终比较，不推测未推送内容 |

## AI_Skills_Collection

Repository：[YuukiAS/AI_Skills_Collection](https://github.com/YuukiAS/AI_Skills_Collection)

这里记录与 Asteria 用户可见质量直接相关的证据入口，不复制 Skill 正文。

| 来源 ID | branch | latest relevant commit | result/evidence root | primary files | current completeness | role in Asteria Next research |
| --- | --- | --- | --- | --- | --- | --- |
| `SKILLS-CLEAR-WRITING` | `main` | production skill 最近相关提交 [`fd79c4be54fc50bd66d9a51bbc1e681f361f6a77`](https://github.com/YuukiAS/AI_Skills_Collection/commit/fd79c4be54fc50bd66d9a51bbc1e681f361f6a77)；release closure [`699fa2ed167270450c2e380a452cb40f39b95393`](https://github.com/YuukiAS/AI_Skills_Collection/commit/699fa2ed167270450c2e380a452cb40f39b95393) | `results/055_clear_writing_release_convergence/` | `FINAL_REPORT.md`, `FINAL_CANDIDATE_DESIGNATION_C6.md`, `text_review/`, `g7_fresh_batch/`; current production entry under `plugins/codex/plugins/writing-style/skills/` | release evidence complete；个别历史 fresh item 的 source defect 保留在记录中 | 核对中文可读性、事实保真和读者面对表达；不决定产品内容是否应存在 |
| `SKILLS-PRODUCT-UI-COPY` | `main` | final report [`4718b224fb6fed9311f9d6376105f8c5af348f85`](https://github.com/YuukiAS/AI_Skills_Collection/commit/4718b224fb6fed9311f9d6376105f8c5af348f85)；production skill [`53d42f621864a779f93de7e8a81007ef73ed55cc`](https://github.com/YuukiAS/AI_Skills_Collection/commit/53d42f621864a779f93de7e8a81007ef73ed55cc) | `results/product-ui-copy--cross-plugin-production-integration/` | `FINAL_REPORT.md`, `rendered_acceptance/`, `human_acceptance/`, `human_acceptance_cuhk_date/`; `plugins/codex/plugins/writing-style/skills/product-ui-copy/SKILL.md` | central integration evidence complete；不代表所有 consumer project 已接入 | 核对界面文案、受保护产品含义、真实渲染和跨 surface 表达 |
| `SKILLS-FRONTEND-DESIGN` | `main` | final report [`7e8fb80edbbbaa5ba5bb07250a6eac5c4576949b`](https://github.com/YuukiAS/AI_Skills_Collection/commit/7e8fb80edbbbaa5ba5bb07250a6eac5c4576949b)；production entry 最近相关提交 [`53d42f621864a779f93de7e8a81007ef73ed55cc`](https://github.com/YuukiAS/AI_Skills_Collection/commit/53d42f621864a779f93de7e8a81007ef73ed55cc) | `results/web-development--frontend-design-production-consolidation/` | `FINAL_REPORT.md`, `validation/`, `replay/`, `final_candidate_identity.json`; `plugins/codex/plugins/web-development/skills/visual/SKILL.md` | coordinator-first integration 和回放证据完整；不证明所有未来界面的产品质量 | 核对 whole-product 视觉、真实 surface、producer self-QA 与可交付性 |
| `SKILLS-ARTIFACT-CURATION-TODO` | `main` | [`39f8a2c363fad72f5b164f28b76ff9fd8c400628`](https://github.com/YuukiAS/AI_Skills_Collection/commit/39f8a2c363fad72f5b164f28b76ff9fd8c400628) | `docs/skill-todos/` | [`artifact-content-design.md`](https://github.com/YuukiAS/AI_Skills_Collection/blob/39f8a2c363fad72f5b164f28b76ff9fd8c400628/docs/skill-todos/artifact-content-design.md)；相关 `docs/plugin-todos/writing-style.md` 和 `docs/plugin-todos/web-development.md` | `PRELIMINARY ONLY` / TODO；尚未形成 production Skill contract | 提供内容准入、压缩、降级、删除、留白和整件作品审查的研究问题；不得写成已实现规则 |
| `SKILLS-CURATION-EVIDENCE` | `research/complex-system-editorial-curation-evidence-20261027-work` | [`fd6e8300ea848b96a01c1cff588086fe980a2787`](https://github.com/YuukiAS/AI_Skills_Collection/commit/fd6e8300ea848b96a01c1cff588086fe980a2787) | [`docs/design/reader-facing-artifact-quality/evidence/`](https://github.com/YuukiAS/AI_Skills_Collection/tree/fd6e8300ea848b96a01c1cff588086fe980a2787/docs/design/reader-facing-artifact-quality/evidence) | `COMPLEX_SYSTEM_SHOWCASE_EDITORIAL_CURATION_EVIDENCE_2026-10-27.md`, `COMPLEX_SYSTEM_SHOWCASE_REGRESSION_CASES_2026-10-27.tsv`, `COMPLEX_SYSTEM_SHOWCASE_REMOTE_READBACK_2026-10-27.md`; additions in `docs/plugin-todos/writing-style.md` and `docs/plugin-todos/web-development.md` | research evidence 与远端回读完整；branch 相对当前 `main` 已分叉，内容尚不是 production contract | 把 R2 的 720 项可见内容审计、26 个回归案例和 whole-product 取舍提炼为后续研究证据 |

## Before/after 与 whole-product 证据定位

需要查看真实修改前后差异时，优先按以下固定入口回到原始材料：

- 页面与实现快照：`ART-EDITORIAL` 的 `before/gpt6/`、`before/gpt56/`、`revised/gpt6/`、`revised/gpt56/`。
- 同状态截图：`ART-EDITORIAL` 的 `screenshots/before/` 与 `screenshots/after/`，索引为 `screenshots/README.md`。
- 逐项内容取舍：`ART-EDITORIAL/VISIBLE_CONTENT_AUDIT.tsv`。
- whole-product 分析与跨模型回归：`ART-EDITORIAL/EDITORIAL_AND_CURATION_AUDIT.md`、`REGRESSION_CASES.tsv`。
- 跨 Skill 研究证据：`SKILLS-CURATION-EVIDENCE` 的 evidence Markdown 与 regression TSV。

以上材料仍以原 repository 和 exact commit 为权威；Asteria 不保存其副本。
