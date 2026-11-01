# Asteria 产品待办

更新日期：2026-11-02

本文只保留尚未完成、未来需要单独任务执行的事项。历史版本过程、已经实现的 Asteria 2.0 schema 和旧 RC 修复记录不再留在 active TODO；它们分别由 `CHANGELOG.md`、`results/`、`prompts/tasks/` 和 `docs/notes/` 保存。

任何事项进入实现前，都必须有独立 task、明确权限、兼容性计划和相应回归验证。

## 下一项唯一建议动作

- [ ] 创建独立的 Asteria Atlas 知识仓库，并提交第一份真实、版本化的 Markdown/YAML 内容集；Obsidian 作为第一阶段的主要人工阅读入口。

这一步只建立真实内容来源，不实现 Atlas Web，不复制虚假论文数据，也不从当前 `ArchitectureProjectV2` 推导 Atlas schema。

## Asteria 2.0

### 发布与兼容

- [ ] 按现有 release contract 完成当前候选的剩余自动化、指定 GPT Work 审查、问题归并和用户最终验收；在所有门槛通过前不发布 `2.0.0` stable。
- [ ] 持续保留 v1 payload、parser、freeze fixture、migration 与 `npm run test:legacy-roundtrip`，至少到一个稳定 2.x 版本之后再评估兼容策略。
- [ ] 保持固定公网入口与 `/api/asteria/status` 合同；运行时恢复必须使用既有固定 tunnel，不得以临时 URL 替代。

### CAT-TRACE repository bridge

- [ ] 基于真实 CAT-TRACE commit 创建最小只读 manifest，只绑定高价值实现锚点，并明确标记 blocked、planned、stale 与 unsupported 状态。
- [ ] 在独立任务中设计并验证只读 ingestion、commit identity、staleness check 和 Inspector implementation evidence；implementation binding 不得被当作科学证明。
- [ ] 是否增加局部 Code Trace，等真实 manifest 和使用需求出现后再决定；不以完整 call graph 作为第一阶段门槛。

### 科学模型产品方向

- [ ] 新增统计领域或模型时，继续使用结构化实体、符号、typed relations、Architecture / Lineage / Evidence 投影和明确 evidence status，不恢复成无类型的大画布。
- [ ] 任何扩展必须同时保护贝叶斯、频率学派、因果推断、优化与流程型方法的表达能力；先验不能成为所有未知参数的必填结构。
- [ ] 结构校验只能报告可解释的 warning、gap 或 stale binding，不得自动宣称数学正确、因果识别成立或证据闭环。
- [ ] 机器可读 JSON 继续作为 canonical exchange format；Markdown/LaTeX 是可读投影，不能反向成为唯一真值。

## Atlas 后续入口

只有第一份真实 Atlas Markdown/YAML 内容集出现后，才可以创建下一张设计任务，用真实样本回答：

- canonical content 的最小字段和版本身份；
- Asteria Web 是否存在真实消费场景；
- import/adapter 如何保留来源并报告 unsupported 或 lossy 字段；
- 哪些基础能力确实与另一个真实产品重复。

在此之前，不创建 Atlas Web、Atlas schema、DII 页面、示例论文图或占位 `src/atlas/`。

## Asteria Blueprint 后续入口

- [ ] 等 Design Assurance 冻结权威设计合同后，再创建独立 Blueprint domain-model 设计任务。
- [ ] Blueprint 必须消费权威设计产物，不自行发明系统设计；权限、失败恢复、实施状态和验收证据保持 Blueprint 专属。

在权威合同出现前，不创建 Blueprint schema、系统 fixture、Inspector workflow、路由或占位 `src/blueprint/`。当前 Architecture 不重命名为 Blueprint。

## 长期保护条件

- 不把当前 `src/architecture/`、`RelationType`、Evidence ontology、Inspector 或 CAT-TRACE bridge 提升为产品族共享 Core。
- 不创建 `UniversalNode`、`UniversalEdge`、`UniversalEvidence` 或 `UniversalInspector`。
- 只有 Atlas 和 Blueprint 都成为真实消费者，并通过五项 Core Gate 后，才允许抽取共享能力。
- 不删除或压扁 v1 compatibility、当前模型 variants、科学 fixture、semantic diff、trace 或 session contract。
- 不把 Asteria 做成 PPT/PDF 编辑器、IDE、完整 theorem prover 或自动科学真值生成器。

完成历史和设计背景可从以下入口追溯：

- [产品路线图](ROADMAP.md)
- [产品族边界](../design/ASTERIA_PRODUCT_FAMILY_BOUNDARY.md)
- [CAT-TRACE Repository Bridge V0.1](../design/CAT_TRACE_REPOSITORY_BRIDGE_V0_1.md)
- [历史研究与设计笔记](../notes/)
- [版本历史](../../CHANGELOG.md)
