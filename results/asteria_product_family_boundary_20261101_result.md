# Asteria 产品族边界收敛结果

日期：2026-11-02

任务：`asteria_product_family_boundary_20261101`

分支：`refactor/asteria-product-family-boundary-20261101`

状态：`PARTIAL_COMPLETE`（代码与文档目标已完成；固定公网入口因既有运行时中断无法通过 smoke）

## 结论

本轮已把 Asteria、Asteria Atlas 与 Asteria Blueprint 的长期边界写入正式设计文档，并同步 README、ROADMAP 与 TODO。当前可用产品仍然是 `2.0.0-rc.19` 的 Asteria 2.0 科学模型架构产品；Atlas 与 Blueprint 只有边界和未来接入原则，没有被描述或实现成可用产品。

没有移动、重命名或改写现有产品源码，没有创建 `src/core/`、`src/atlas/` 或 `src/blueprint/`。当前没有两个真实消费者，因此没有任何运行时能力通过 Core Gate；本轮最重要的收敛结果是保留现有产品资产，并明确拒绝提前建立万能图、本体、Evidence 或 Inspector。

## 提交身份

- `BASELINE_COMMIT = 60ba27a38324980beea78d4c07b7b28abda522cf`
- `BASELINE_REF = origin/main`
- `FINAL_IMPLEMENTATION_COMMIT = a93fcbf466724b269a6c30435cbc7f2fec0cd235`
- `FORMAL_VERSION = 2.0.0-rc.19`（未改版本，未发布 stable）
- `FIXED_PUBLIC_ENTRY = https://asteria.httpwwwcardiacnexus-ukb.com/`（未改地址，未新增域名或 tunnel）

结果文件本身作为交付证据在实现提交之后单独提交；分支最终 tip 由 Git/远端分支记录，避免在文件中制造自引用提交哈希。

## 修改文件

- `docs/design/ASTERIA_PRODUCT_FAMILY_BOUNDARY.md`
- `README.md`
- `ROADMAP.md`
- `TODO.md`
- `package.json`
- `scripts/validate-product-family-boundary.mjs`
- `prompts/tasks/asteria_product_family_boundary_20261101_task.md`
- `results/asteria_product_family_boundary_20261101_result.md`

没有修改 `src/app/`、`src/architecture/`、`src/components/`、`src/styles/`、`src/fixtures/`、CAT-TRACE ontology、当前 UI 或 release version。

## 当前产品边界

- **Asteria 2.0**：当前正式实现。现有 Architecture、Lineage、Evidence、科学实体与符号、typed relations、trace、semantic diff、Inspector、Save/Restore、export、viewport/layout、v1 compatibility 与 CAT-TRACE repository bridge 都是受保护的当前产品资产。
- **Asteria Atlas**：只冻结产品职责和未来接入合同。canonical knowledge content 将来自独立科研知识仓库，第一阶段使用 Markdown/YAML，Obsidian 是主要人工阅读入口。当前没有 Atlas Web、schema、路由、论文样例或 DII 页面。
- **Asteria Blueprint**：只冻结产品职责和未来接入合同。authoritative design truth 必须来自未来 Design Assurance 的冻结产物；未来若接入，应使用独立 Blueprint domain model / adapter。当前没有 Blueprint schema、工作流、路由或界面。

## ACCEPTED_SHARED_CORE

`NONE`（0 项）。

原因不是否认未来复用，而是当前 Atlas 与 Blueprint 都还不是两个真实软件消费者。现有候选无法通过 Core Gate 第 1 项，也无法说明删除共享层后会产生的具体重复或一致性风险，因此不应创建共享运行时层。

## REJECTED_PREMATURE_ABSTRACTIONS

| 候选 | 本轮决定 | 原因 |
| --- | --- | --- |
| `ArchitectureProjectV2` 与当前科学实体 schema | 留在当前产品 | Atlas / Blueprint 语义与变化原因未证明相同。 |
| 当前 `RelationType` | 留在当前产品 | 科研关系不等于系统接口、权限、状态和恢复关系。 |
| 当前 Evidence ontology / closure status | 留在当前产品 | 论文与科研证据不等于 Design Assurance 的运行/验收证据。 |
| Universal Inspector / session / search | 拒绝 | 没有第二个真实工作流；共享后只会引入产品条件分支。 |
| Universal graph / node / edge model | 拒绝 | 图形外形相似不能证明业务语义相同。 |
| viewport、pan/zoom、selection、layout、export primitives | 暂留原处 | 属于较强的低语义候选，但尚无第二消费者或真实重复。 |
| validation primitives / CAT-TRACE bridge | 留在当前产品 | 当前规则与科学证据边界高度绑定。 |
| `RenderedMath` / presentation tokens | 暂留原处 | 可能复用，但没有 Atlas 与 Blueprint 实现证据。 |

## 是否移动现有代码

`MOVED_EXISTING_SOURCE_MODULES = 0`

没有移动。目录对称本身不产生当前能力收益，反而会制造 import 扰动和“产品已经实现”的错误暗示。采用文档先冻结边界、未来由真实消费者通过 adapter 接入的方式，保留所有稳定路径与 import compatibility。

## 当前 Asteria 行为保护结果

- 受保护源码目录 diff：无变化。
- 当前版本：仍为 `2.0.0-rc.19`。
- 固定公网地址：仍为原地址。
- UI / graph / Inspector / motion / responsive surface：无任务修改。
- 科学真值、CAT-TRACE ontology 与 bridge 语义：无任务修改。
- `VISUAL_REVIEW_PACK = NOT_APPLICABLE`：本轮没有用户可见 UI 变化，因此不制造新的截图验收或 GPT Work campaign。

## 验证结果

修改前基线：

- `npm run build`：PASS。
- `npm run test:regression`：PASS。
- `npm run test:browser`：PASS，18/18。
- `npm run smoke:public-rc19`：FAIL；固定公网入口返回 Cloudflare Error 1033。

修改后：

- `npm run test:product-family-boundary`：PASS。
- `npm run build`：PASS。
- `npm run test:regression`：PASS；已把产品族边界合同加入累计入口，原有 legacy、architecture、CAT-TRACE bridge、RC3–RC19 与 shared-server 验证保持通过。
- `npm run test:browser`：PASS，18/18。
- `git diff --quiet -- src/app src/architecture src/components src/styles src/fixtures`：PASS；受保护源码无任务 diff。
- `npm run smoke:public-rc19`：FAIL；与基线相同，固定公网入口仍返回 Cloudflare Error 1033。

只读运行时诊断显示 `127.0.0.1:5174` 无服务响应，固定 tunnel `ac0c0293-15b3-4971-b6f5-35c9e984111a` 无 active connection，且当前用户进程中没有 Asteria server/tunnel。任务明确不授权部署、启动共享运行时或修复生产 tunnel，因此没有把该失败改写成 PASS。

浏览器验证会覆盖 17 张已跟踪的历史 PNG。它们在基线运行后出现本地修改，本轮未暂存、未提交、未推送。自动恢复被执行安全策略拒绝，因此保留为明确的本地测试生成噪声，不纳入任务交付。

## Atlas 当前状态

`BOUNDARY_ONLY_NOT_IMPLEMENTED`

已冻结独立知识仓库、Markdown/YAML、Obsidian 和未来 adapter/import contract 原则；没有创建虚假数据、Atlas Web 或当前 Architecture schema 依赖。

## Blueprint 当前状态

`BOUNDARY_ONLY_NOT_IMPLEMENTED`

已冻结 Design Assurance 权威来源和独立 domain model / adapter 原则；没有把当前 Architecture 重命名为 Blueprint，也没有实现业务 schema。

## 下一项唯一建议动作

等独立 Atlas 知识仓库出现第一份真实、版本化的 Markdown/YAML 内容集后，创建一项仅做设计的 Atlas 导入适配合同任务；在这份真实样本出现前，不抽取 Core，也不实现 Atlas Web。

固定公网入口的 1033 是独立运行时运维问题。如需恢复，应另行按 `docs/operations/development/RUNTIME_OPERATIONS.md` 明确授权处理，不能与产品族边界任务混为同一项产品动作。

## 最终状态

```text
PRODUCT_FAMILY_BOUNDARY = COMPLETE
CURRENT_PRODUCT_REGRESSION = PASS
PROTECTED_SOURCE_CHANGED = NO
ACCEPTED_SHARED_CORE = NONE
ATLAS_IMPLEMENTED = NO
BLUEPRINT_IMPLEMENTED = NO
PUBLIC_ENTRY_SMOKE = BLOCKED_PREEXISTING_RUNTIME_1033
GOAL_ACHIEVED = PARTIAL
COMPLETE = NO
READY_FOR_USER_REVIEW = NO
```
