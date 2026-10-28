# Asteria Next 候选索引

本页按研究阶段列出候选。它不比较优劣，也不把任何候选提升为 Asteria 正式设计。固定提交、完整来源字段和链接见 [SOURCE_MANIFEST.md](SOURCE_MANIFEST.md)。

## 1. R2 GPT-6

- 来源：`ART-R2-G6`
- 主要尝试解决：在同一产品入口呈现完整系统拓扑、节点和关系，并沿正常交付、失败返修与旧能力保护路径探索。
- 核心成果：`RESULT.md`、`DESIGN.md`、`ARCHITECTURE_MODEL.md`、`RESEARCH.md`、`QA.md`、`ACCEPTANCE.md`。
- Prototype：`docs/research/complex-system-showcase-20261026/r2/gpt6/prototype/`。
- 当前状态：历史研究候选，远端成果完整。
- 完整度：研究和原型完整；真机、读屏器、DA 实施与部署不在已完成范围。
- 候选边界：仍只是候选。R2 comparison 的历史建议不构成 Asteria Next 的最终决定。

## 2. R2 GPT-5.6

- 来源：`ART-R2-G56`
- 主要尝试解决：用固定语义布局表达完整架构、关系载荷、责任边界、状态层级和移动端路径阅读。
- 核心成果：`RESULT.md`、`DESIGN.md`、`ARCHITECTURE_MODEL.md`、`ACCEPTANCE.md`、`COPY_EDITORIAL_AUDIT.tsv`。
- Prototype：`docs/research/complex-system-showcase-20261026/r2/gpt56/prototype/`。
- 当前状态：历史研究候选，远端成果完整。
- 完整度：研究、原型、截图与浏览器验收完整；DA 实施、入口接线和跨插件消费未完成。
- 候选边界：仍只是候选，不是 Asteria design。

## 3. Architecture Evolution GPT-6 / Pro-A

- 来源：`ART-ARCH-A`
- 主要尝试解决：让系统拓扑、组件机制、实现锚点、证据、修订原因和局部历史能够一起阅读，同时保持 Git 与原仓库权威。
- 核心成果：`PRODUCT_AND_INFORMATION_ARCHITECTURE.md`、`ARCHITECTURE_DESIGN_METHOD.md`、`SOURCE_OF_TRUTH_AND_IMPLEMENTATION_BINDING.md`、`VERSION_AND_EVOLUTION_MODEL.md`、`THREE_PROJECT_STRESS_TEST.md`、`OPEN_SOURCE_RESEARCH.md`、`IMPLEMENTATION_OPTIONS.md`、`RESULT.md`。
- Prototype：`docs/research/architecture-evolution-system-20261027/pro-a/prototype/`。
- 当前状态：Architecture Evolution 历史候选，远端成果完整。
- 完整度：产品模型、方法、三项目映射、原型和 QA 完整；真实用户实验、通用导入与生产接线未完成。
- 候选边界：仍只是候选，其“最终建议”只属于该研究分支。

## 4. Architecture Evolution GPT-5.6 / Pro-B

- 来源：`ART-ARCH-B`
- 主要尝试解决：以轻量 Git 原生 Architecture Ledger 表达对象、机制、锚点、证据、问题、三条状态轴和有意义修订。
- 核心成果：`PRODUCT_AND_INFORMATION_ARCHITECTURE.md`、`ARCHITECTURE_DESIGN_METHOD.md`、`SEMANTIC_MODEL.md`、`SOURCE_OF_TRUTH_AND_IMPLEMENTATION_BINDING.md`、`VERSION_AND_EVOLUTION_MODEL.md`、`THREE_PROJECT_STRESS_TEST.md`、`OPEN_SOURCE_RESEARCH.md`、`IMPLEMENTATION_OPTIONS.md`、`VALIDATION_REPORT.json`、`RESULT.md`。
- Prototype：`docs/research/architecture-evolution-system-20261027/pro-b/prototype/`。
- 当前状态：Architecture Evolution 历史候选，远端成果完整。
- 完整度：研究、语义模型、校验、样例账本、原型和截图完整；仍未成为 Asteria 产品实现。
- 候选边界：仍只是候选，其 Architecture Ledger 建议没有获得 Asteria canonical 权威。

## 5. Asteria Next convergence Pro-A

- 来源：`ART-NEXT-A`
- 主要尝试解决：把 R2 与两条 Architecture Evolution 输入收敛到 Asteria 现有实体、关系、variant、projection 和 lineage 边界内，并覆盖 DA、Mica、CAT-TRACE 与 STAT5060 Tutorial 四类 reference。
- 核心成果：`ASTERIA_NEXT_CANONICAL_SPEC.md`、`SEMANTIC_MODEL.md`、`CONVERGENCE_DECISION_MATRIX.md`、`SOURCE_BINDING_AND_EVIDENCE.md`、`VERSION_EVOLUTION_AND_DRIFT.md`、`ARCHITECTURE_DESIGN_AND_FREEZE.md`、`FOUR_REFERENCE_PROJECTS.md`、`VISUAL_SYSTEM.md`、`OPEN_SOURCE_ADOPTION.md`、`CONTENT_AND_TASTE_AUDIT.md`、`RESULT.md`。
- Prototype：`docs/research/asteria-next-convergence-20261027/pro-a/prototype/`；验证证据在 `pro-a/qa/`。
- 当前状态：完整的 convergence 候选，等待 GPT Work 最终比较与 Chat 裁决。
- 完整度：候选规格、原型、模型测试、浏览器、主题、移动端和内容审查完整；没有实施正式 Asteria Next，也没有完成独立最终比较。
- 候选边界：仍只是候选。`ASTERIA_NEXT_CANONICAL_SPEC.md` 是候选内部文件名，不表示 Asteria 已作 canonical decision。

## 6. Asteria Next convergence Pro-B

- 来源：`ART-NEXT-B`
- 主要尝试解决：预期作为独立 convergence 候选；现有远端材料不足以确认其具体方案。
- 核心成果：远端只发现 `WRITE_ACCESS_CHECK.md`。
- Prototype：未发现。
- 当前状态：不完整；远端 branch 可见，但只有 write-access check。
- 完整度：没有可见 result、设计正文、prototype 或 QA，不能推断本地或未推送内容。
- 候选边界：当前不能参与完整候选比较，也不能据此作优劣判断。

## 辅助研究，不列为候选

`ART-R2-COMPARE` 是 R2 历史本地比较；`ART-EDITORIAL`、`SKILLS-CURATION-EVIDENCE` 是内容和 whole-product 证据。它们帮助后续裁决，但不是第 7 个产品候选。`architecture-production-protocol-*` 属于上层跨项目方法研究，也不列入 Asteria 产品候选。
