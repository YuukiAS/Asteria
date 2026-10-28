# Asteria Next 研究入口

本目录为 Asteria Next 产品研究提供稳定入口。它只回答三个问题：已有研究在哪里、每份材料目前处于什么状态、后续正式收敛应从哪里开始。这里不复制外部原型、截图、审计表或项目源码，也不在本次整理中裁决 Asteria Next 的最终方案。

## 研究范围

与 Asteria Next 产品直接相关的材料分为三组：

- R2 系统展示研究：探索完整系统拓扑、节点与关系、正常与失败路径、移动端阅读和内容表达。
- Architecture Evolution 研究：探索机制下钻、实现绑定、版本与修订、语义差异、漂移和 Architecture Freeze。
- Asteria Next convergence：尝试把前两组能力收敛到 Asteria 语义与产品边界内，供后续独立比较和正式裁决。

R2 与 Architecture Evolution 的成果都是历史候选或输入证据，不是现行 Asteria design。convergence 分支中的文件即使自称 `CANONICAL_SPEC`，也只代表该分支作者给出的单一候选；在 GPT Work 最终比较和 Chat 最终裁决完成前，不具有 Asteria 正式 canonical 权威。

`AI_Skills_Collection` 中的 Clear Writing、Product UI Copy、Frontend Design、Artifact Curation 研究及 whole-product 审查证据，用来帮助后续收敛者核对可见内容、产品文案、整体验收和取舍质量。它们不是 Asteria 产品语义或架构的第二事实源。

## 来源权威

原始研究继续以各自 repository、branch 和 exact commit 为 source of truth。本目录只保存精确入口、候选状态和证据路由：

- [SOURCE_MANIFEST.md](SOURCE_MANIFEST.md)：仓库、分支、固定提交、结果根目录和主要文件。
- [CANDIDATE_INDEX.md](CANDIDATE_INDEX.md)：按研究阶段查看候选及完整度。
- [EVIDENCE_INDEX.md](EVIDENCE_INDEX.md)：按待裁决能力查找原始证据。
- [STATUS.md](STATUS.md)：截至 2026-10-28 的事实状态和未完成事项。

后续引用应优先使用 manifest 中的 exact commit。branch 仅用于说明研究来源与继续跟踪，不应替代固定提交。

## 明确排除的上层研究

`AI_Research_Toolkit` 还存在以下 `architecture-production-protocol-*` 分支：

- `research/architecture-production-protocol-20261027-pro-a`，提交 `6c3092e0ec88ebb11e7d085cfa1b51a0c0c5644e`
- `research/architecture-production-protocol-20261027-pro-b`，提交 `cb1aebea147fd5b953c9cad987e4811d901b85e7`
- `research/architecture-production-protocol-20261027-work`，提交 `a637f02c3fce7dac90ad61a363f1c59a7d8ec843`

它们研究的是跨项目架构生产方法，不是 Asteria 产品设计。本目录只记录其存在，不把其正文、原型或结论纳入 Asteria canonical design inputs。

## 后续正式收敛入口

正式收敛应从 [STATUS.md](STATUS.md) 确认输入是否齐备，再按 [CANDIDATE_INDEX.md](CANDIDATE_INDEX.md) 找到各候选，并按 [EVIDENCE_INDEX.md](EVIDENCE_INDEX.md) 回到原始材料裁决具体能力。任何正式 design、implementation 或迁移仍需单独授权，并应在 Asteria 自身的正式设计与实现流程中产生；不要直接把本目录或任一外部分支改称正式方案。
