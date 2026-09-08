---
id: asteria_v2_g01
title: Build Asteria 2.0 semantic kernel and v1 migration
created_at: 2026-09-08
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Goal G01 — 2.0 Semantic Kernel：schema、normalized graph 与 V1 migration

## 1. 前置条件

只在 `results/asteria_v2_g00_result.md` 明确写有：

```text
G01_READY = YES
```

时开始。否则停止。

目标版本：`2.0.0-alpha.1`。

本 Goal 只建立 2.0 的稳定 domain 层和 migration，不进行大幅 UI 重设计。

## 2. 必须先读

1. `AGENTS.md`
2. `prompts/AGENT_RULES.md`
3. `VERSIONING.md`
4. `docs/notes/2026-09-08_asteria_v2_master_plan.md`
5. `docs/notes/2026-09-08_asteria_v2_current_implementation_audit.md`
6. `docs/notes/2026-09-08_cat_trace_reference_architecture_for_asteria_v2.md`
7. `results/asteria_v2_g00_result.md`
8. 当前 `src/types/map.ts`, `src/lib/exportImport.ts`, persistence/restore 相关代码。

## 3. 核心目标

新增平台无关的 2.0 semantic kernel。推荐目录：

```text
src/architecture/
  types.ts
  schema.ts
  migration.ts
  graphIndex.ts
  selectors.ts
  validationTypes.ts
  fixtures/
```

文件名可按仓库风格调整，但职责必须分离。

### 3.1 Canonical project object

实现版本化 V2 project，例如：

```ts
type ArchitectureProjectV2 = {
  schemaVersion: string
  project: ProjectMetadata
  entities: Record<string, StatisticalEntity>
  symbols: Record<string, StatisticalSymbol>
  relations: Record<string, TypedRelation>
  variants: Record<string, SemanticVariant>
  views: Record<string, ArchitectureView>
  updatedAt: string
}
```

具体字段应结合代码类型系统做最小、可扩展设计，不要一次把 TODO 的全部 optional ontology 暴露给 UI。

### 3.2 Normalized graph

必须满足：

- entity/symbol/relation 有稳定 ID；
- typed relation 是关系真值；
- upstream/downstream 不以多个冗余数组同时持久化；
- 建立 adjacency index / query helper；
- graph query 不依赖 React 或浏览器 API；
- 同一 entity 可被多个 view 投影。

### 3.3 View projection model

V2 view 至少能保存：

- projected entity/symbol refs；
- node positions / size / collapsed/local visibility；
- viewport；
- layer/filter presentation metadata。

domain definition 与 layout 不应混成同一个对象。

### 3.4 V1 → V2 migration

实现显式 migration：

```text
ExportedMap v1 -> ArchitectureProjectV2
```

原则：

- 旧 block 的 title/rich text/symbol rows/variants/style/layout/story 信息不能静默丢失；
- 不根据 block 标题猜“这是 parameter / theorem / causal relation”；
- 无可靠 semantic type 时标成 generic/legacy/unresolved；
- 旧 visual edge 保留 presentation 与 label，但 semantic relation 可为 unresolved；
- 保存 migration provenance/version；
- migration 必须 deterministic。

不要把 migration 写成一次性脚本；它是 2.x 长期兼容 API。

## 4. 允许动作

- 新增 architecture domain/types/tests；
- 最小改动 import/export/persistence，让 2.0 alpha 可以保存/读取 V2 fixture；
- 增加开发用 schema viewer/debug output，但不把机器字段直接污染主 UI；
- 重构必要的纯函数；
- 更新 package/README/CHANGELOG 到 `2.0.0-alpha.1`；
- commit/push。

## 5. 禁止动作

- 不实现完整 Symbol Inspector；
- 不实现 recursive trace UI；
- 不实现多 tab Lineage/Evidence；
- 不自动解析整篇 LaTeX；
- 不自动把旧 edge 猜成 causal/depends_on；
- 不删除 V1 normalizer/fixture；
- 不改固定公网部署；
- 不增加后端数据库或云服务；
- 不引入 Electron/Tauri。

## 6. 测试

必须新增并纳入回归：

1. `v1 -> v2` migration golden test；
2. stable ID / deterministic migration；
3. unknown legacy fields 保留/安全降级；
4. graph adjacency/query；
5. same entity in multiple views 不复制 definition；
6. serialize -> deserialize V2 round-trip；
7. G00 legacy fixture 仍可导入；
8. Story/variant/presentation legacy payload 不静默丢失。

运行全部历史 regression + build。

## 7. 性能约束

本 Goal 即使没有 UI，也要避免未来结构性慢路径：

- graph lookup 使用 record/Map/index，而不是 recursive `.find()` over arrays；
- query helper 对同一 snapshot 可复用 index；
- migration 可线性遍历，不做明显 O(N²) 字符串配对；
- 不在 canonical object 中保存巨大派生 cache；cache 是 runtime index。

记录 synthetic 2,000 entities / 5,000 relations 的 schema load + index build 粗略 benchmark，作为后续 gate 参考。

## 8. 退出门槛

1. G00 legacy regression 全部保持；
2. V2 schema 可独立于 React 使用；
3. migration deterministic；
4. V1 content/presentation 无静默丢失；
5. graph index/query 测试通过；
6. synthetic graph 没有明显 O(N²) 退化；
7. package/README/CHANGELOG 为 `2.0.0-alpha.1`；
8. commit message：`v2.0.0-alpha.1`；
9. push 成功。

## 9. 停止条件

若 migration 无法在不破坏 V1 内容的前提下完成，或者必须做不可逆 schema 覆盖，停止并在 result 中给出最小复现，不得继续 G02。

## 10. Result

写：

```text
results/asteria_v2_g01_result.md
```

末尾必须给：

```text
G02_READY = YES/NO
```

并记录 schemaVersion、migration strategy、fixture、benchmark、测试、commit/push。