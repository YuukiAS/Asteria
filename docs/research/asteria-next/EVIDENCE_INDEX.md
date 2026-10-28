# Asteria Next 能力证据索引

本页按能力路由原始材料。每一项只说明“若要裁决，应去看哪里”，不表示 Asteria 已采用相应方案。来源 ID、exact commit 和固定结果根目录见 [SOURCE_MANIFEST.md](SOURCE_MANIFEST.md)。

| 待裁决能力 | 优先查看的原始材料 | 用途边界 |
| --- | --- | --- |
| 系统整体拓扑 | `ART-R2-G6/ARCHITECTURE_MODEL.md`、`DESIGN.md`、prototype；`ART-R2-G56/ARCHITECTURE_MODEL.md`、prototype；`ART-NEXT-A/ASTERIA_NEXT_CANONICAL_SPEC.md`、`VISUAL_SYSTEM.md`、prototype | 比较整体可读性、系统边界和投影方式；不从截图反推正式语义 |
| 节点/关系探索 | 两条 R2 prototype 与 `ACCEPTANCE.md`；`ART-NEXT-A/SEMANTIC_MODEL.md`、prototype、`qa/` | 核对节点、关系、载荷、消费者、选择与邻域探索；原型交互不证明生产数据绑定 |
| mechanism drill-down | `ART-ARCH-A/THREE_PROJECT_STRESS_TEST.md`、`PRODUCT_AND_INFORMATION_ARCHITECTURE.md`；`ART-ARCH-B/SEMANTIC_MODEL.md`、`THREE_PROJECT_STRESS_TEST.md`；`ART-NEXT-A/FOUR_REFERENCE_PROJECTS.md`、prototype | 比较机制的步骤、状态、算法、公式和内容类型；不把统一 renderer 当作统一机制 |
| implementation/source binding | `ART-ARCH-A/SOURCE_OF_TRUTH_AND_IMPLEMENTATION_BINDING.md`；`ART-ARCH-B/SOURCE_OF_TRUTH_AND_IMPLEMENTATION_BINDING.md`；`ART-NEXT-A/SOURCE_BINDING_AND_EVIDENCE.md`、`sources/SOURCE_FACTS.md`、`sources/mica-relation-consumer-audit.md` | 裁决固定锚点、符号、消费者、证据适用性和原仓库权威；非空链接不等于行为已验证 |
| version/revision | 两条 Architecture Evolution 的 `VERSION_AND_EVOLUTION_MODEL.md`；`ART-NEXT-A/VERSION_EVOLUTION_AND_DRIFT.md` | 裁决何时形成 meaningful revision、如何保存原因和不变项；不把每个 Git commit 自动升级为架构版本 |
| semantic diff | `ART-ARCH-A/VERSION_AND_EVOLUTION_MODEL.md` 与 prototype；`ART-ARCH-B/VERSION_AND_EVOLUTION_MODEL.md`、`example-ledger.json` 与 prototype；`ART-NEXT-A/VERSION_EVOLUTION_AND_DRIFT.md`、prototype、`qa/audit-final-diff-visual.json` | 比较旧/新对象与关系、删除项、影响范围和移动端表达；图上着色不替代语义定义 |
| drift | 两条 Architecture Evolution 的来源绑定与版本文档；`ART-NEXT-A/SOURCE_BINDING_AND_EVIDENCE.md`、`VERSION_EVOLUTION_AND_DRIFT.md` | 裁决设计到实现、实现到设计的漂移与证据失效；不宣称已存在通用自动解析 |
| Architecture Freeze | `ART-ARCH-A/ARCHITECTURE_DESIGN_METHOD.md`；`ART-ARCH-B/ARCHITECTURE_DESIGN_METHOD.md`；`ART-NEXT-A/ARCHITECTURE_DESIGN_AND_FREEZE.md`、`CODEX_HANDOFF_CONTRACT.md` | 裁决冻结前的机械检查、专业判断、开放问题和实现责任；不把候选合同直接变成 Asteria 生产规则 |
| DA reference | 两条 R2 全部成果；两条 Architecture Evolution 的 `THREE_PROJECT_STRESS_TEST.md`；`ART-NEXT-A/FOUR_REFERENCE_PROJECTS.md`、`sources/da-design-history.md` | 检查 design-only、正常/失败/恢复/保护路径和合法空实现；不虚构 DA package 或生产接线 |
| Mica reference | 两条 Architecture Evolution 的 `THREE_PROJECT_STRESS_TEST.md`；`ART-NEXT-A/FOUR_REFERENCE_PROJECTS.md`、`sources/SOURCE_FACTS.md`、`sources/asteria-mica-facts.json`、`sources/mica-historical-anchors.json`、`sources/mica-typing-hotpath.json`、`sources/mica-relation-consumer-audit.md` | 检查真实 file/function/selector/test、状态与事件、历史锚点和消费者证据；现有检查不等于当前在线 ChatGPT 或目标设备全验收 |
| CAT-TRACE reference | 两条 Architecture Evolution 的 `THREE_PROJECT_STRESS_TEST.md`；`ART-NEXT-A/FOUR_REFERENCE_PROJECTS.md`、`SEMANTIC_MODEL.md`、prototype 与 CAT 相关 QA 截图 | 检查公式、算法、oracle、撤销路线、开放 blocker 与科学/软件演进；本轮没有重跑科研计算，也不复制 CAT-TRACE 源码 |
| STAT5060 Tutorial artifact-validation reference | `ART-NEXT-A/FOUR_REFERENCE_PROJECTS.md`、`SEMANTIC_MODEL.md`、prototype 与 Tutorial 相关 QA/截图 | 检查 artifact、页面、requirement、finding、历史修复和证据失效；不复制课件，也不把局部修复写成整套产品通过 |
| Clear Writing | `SKILLS-CLEAR-WRITING` 的 `FINAL_REPORT.md`、候选 designation、text review 与 fresh batch；`ART-EDITORIAL` 的逐项可见内容记录 | 裁决读者面对中文、保真、引用和证据边界；不负责决定页面应展示哪些内容 |
| Artifact Curation | `SKILLS-ARTIFACT-CURATION-TODO/artifact-content-design.md`；`SKILLS-CURATION-EVIDENCE`；`ART-EDITORIAL/EDITORIAL_AND_CURATION_AUDIT.md`、`VISIBLE_CONTENT_AUDIT.tsv`、`REGRESSION_CASES.tsv` | 研究内容准入、压缩、移位、删除、留白与整件作品审查；当前仍是 preliminary/TODO，不是 production contract |
| whole-product visual/taste evidence | `ART-EDITORIAL` 的 before/revised、before/after screenshots 与 whole-product audit；`ART-NEXT-A/CONTENT_AND_TASTE_AUDIT.md`、`VISUAL_SYSTEM.md`、`qa/producer-issue-log.tsv`、`qa/rendered-content.tsv`；`SKILLS-FRONTEND-DESIGN` | 查看真实页面的层级、密度、冗余、焦点和 producer self-QA；局部组件通过不代表整件产品通过 |
| mobile | 两条 R2 的 mobile previews 与 `ACCEPTANCE.md`；两条 Architecture Evolution prototype mobile 截图/测试；`ART-NEXT-A/VISUAL_SYSTEM.md`、prototype 与 mobile QA | 比较“完整图缩放”和“路径优先/清单优先”等候选表达；不替代真机和辅助技术验收 |
| light/dark theme | `ART-NEXT-A/VISUAL_SYSTEM.md`、prototype、`qa/audit-r6-theme.json`、`qa/offline-and-code-theme.json` 及双主题截图 | 核对图层、焦点、关系、代码、公式和 diff 的双主题表现；只适用于固定候选原型 |
| open-source adoption | `ART-ARCH-A/OPEN_SOURCE_RESEARCH.md`、`IMPLEMENTATION_OPTIONS.md`；`ART-ARCH-B/OPEN_SOURCE_RESEARCH.md`、`IMPLEMENTATION_OPTIONS.md`；`ART-NEXT-A/OPEN_SOURCE_ADOPTION.md`、prototype lockfile 与 `THIRD_PARTY_NOTICES.md` | 裁决成熟工具的直接采用、思想借鉴与不采用；不要把调查过的工具写成已经集成 |

## 使用规则

1. 先在 [SOURCE_MANIFEST.md](SOURCE_MANIFEST.md) 固定 repository、branch、commit 和 root。
2. 再打开本表列出的原始文件、原型或证据，不引用 Asteria 内的摘要代替原文。
3. 发现来源分支继续变化时，新增经过核对的 exact commit；不要静默把旧链接改成 branch tip。
4. 裁决结果应进入后续正式 Asteria design 流程。本索引本身永远只是入口。
