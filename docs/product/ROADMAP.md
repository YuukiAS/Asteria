# Asteria 产品路线图

更新时间：2026-11-02

Asteria 已按产品族划定长期边界，但当前唯一已经实现的产品仍是 Asteria 2.0。当前候选版本为 `2.0.0-rc.19`，`2.0.0` stable 尚未发布。

产品族的权威边界见 [Asteria Product Family Boundary](../design/ASTERIA_PRODUCT_FAMILY_BOUNDARY.md)。本路线图只说明产品所处阶段和方向，不保存具体执行任务。

## 当前阶段

### Asteria 2.0

Asteria 2.0 是当前 Web 产品，使用一份科学语义图支撑 Architecture、Lineage 和 Evidence 三个视图。当前已实现的范围包括：

- Original TRACE 与 CAT-TRACE Frozen V2；
- 科学实体、符号、typed relations、模型层级与视图投影；
- Inspector、trace、semantic diff、search、export 与会话 Save/Restore；
- v1 导入兼容；
- CAT-TRACE 只读 repository bridge 的 schema、验证器与 synthetic pinned-commit fixture。

当前仍是 release candidate。stable 发布必须依次通过当前自动化门槛、指定 GPT Work 审查、问题归并处理和用户最终验收。

### Asteria Atlas

Atlas 已冻结产品职责，尚未实现。第一阶段将使用独立科研知识仓库，以 Markdown/YAML 保存真实知识内容，并以 Obsidian 作为主要人工阅读入口。是否需要 Asteria Web 展示，要等真实内容与使用需求出现后再决定。

### Asteria Blueprint

Blueprint 已冻结产品职责，尚未实现。它面向复杂系统设计与实施蓝图，必须等待 Design Assurance 的权威设计合同成熟后再设计自己的 domain model 和 adapter。

## 近期方向

1. 保持 `2.0.0-rc.19` 的产品语义、兼容性与固定公网入口不变，按现有验收合同处理 release candidate 的剩余门槛。
2. 为 Asteria Atlas 创建独立知识仓库，并产生第一份真实、版本化的 Markdown/YAML 内容集。
3. 保持 Atlas、Blueprint 与当前 Asteria 2.0 的业务语义分离；没有第二个真实消费者前，不抽取共享业务 Core。

## 中期方向

- 基于真实 Atlas 内容集评估一份只做设计的 import/adapter contract；没有真实样本时不实现 Atlas Web。
- 以真实 CAT-TRACE implementation commit 推进只读 bridge 的高价值 bindings、staleness validation 和 Inspector 中的 implementation evidence；代码证据不得改写科学真值。
- Blueprint 只在 Design Assurance 权威合同冻结后启动独立建模，不复用当前科学 relation taxonomy 或 Evidence ontology 充当捷径。

## 长期方向

- Atlas 可独立扩展科研领域与知识地图，不要求 Blueprint 同步改变业务模型。
- Blueprint 可独立表达组件、接口、权限、状态、失败恢复和验收证据，不污染 Atlas 的科研 ontology。
- 只有两个真实产品出现稳定重复，且语义、生命周期和变化原因一致时，才评估极薄的共享 Core。
- Asteria 2.x 可继续探索 GitHub / Code Trace / Implementation Graph，但它不是当前 stable blocker，也不自动成为 Atlas 或 Blueprint 的共享能力。

## 明确不属于当前工作

- Atlas Web、Atlas schema、DII 页面或虚构论文数据；
- Blueprint schema、Design Assurance 工作流或系统样例；
- `src/core/`、万能 graph/evidence/Inspector ontology 或 monorepo 重构；
- 以产品族命名为理由重写当前 Architecture、Lineage、Evidence 或 CAT-TRACE 科学真值；
- 新公网域名、临时 tunnel 或替代部署入口。
