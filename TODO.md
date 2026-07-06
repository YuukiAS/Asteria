# Asteria 0.2.x TODO

本文档取代已经完成的 V1 prompt，是 0.2.x 系列的路线图。0.2.x 的目标是让 Asteria 更适合手动组织不同研究版本、模型版本或图示版本下的内容，同时保持它是一个灵活的可视化思考工具，而不是固定流程管理器。

Codex 应先把本文档当作规划依据使用。改代码前必须读取 `AGENTS.md`、`prompts/AGENT_RULES.md`、`prompts/CHATGPT_RULES.md`、现有 V1/V1.1 result 文件（如果存在），以及 `.agents/skills/` 下相关前端技能文档。随后针对当前里程碑提出简洁实现计划。除非用户明确要求，不要实现无关的未来里程碑。

## 产品原则

Asteria 应保持为灵活的可视化思考工具。用户决定创建多少画布、分组和图示，也决定版本名称与版本含义。不要把任何具体研究项目、模型名称或领域术语硬编码成画布布局、版本列表、模板、默认分区或业务规则。可以在文档中把 `TRACE`、`TRACE+HMSC` 等作为示例名称，但实现必须允许用户自己定义版本。

0.2.x 的主要痛点不是缺少 block 分类，而是同一个概念 block 在不同版本中可能有不同标题和内容。例如同一个 `Prior for beta` block 可以在用户自定义的版本 A、版本 B、版本 C 中保存不同表述。0.2.x 因此优先处理：可自定义的版本化内容、全局版本切换、组/框架、显示密度、对齐、边清理和边的版本可见性。

## 可自定义版本

版本必须由用户在应用内定义，而不是在代码里固定成某几个研究名称。实现时可提供少量示例或初始占位，但用户必须可以重命名、增删和排序版本。

要求：

1. 版本数量上限暂定为 5 个用户自定义版本。
2. 每个版本至少包含：
   - 稳定 `id`，用于数据引用。
   - 用户可编辑 `label`，用于 UI 显示。
   - 可选短标签 `shortLabel`，用于 block 小徽标。
   - 创建和更新时间。
3. 应支持内部 `common` fallback，用于所有版本共享的内容。`common` 不是用户版本，不计入 5 个上限。
4. 应支持一个全局 `All` / overview 模式。`All` 不是用户版本，不计入 5 个上限。
5. 不要把 `TRACE`、`TRACE+HMSC`、`Marked TRACE` 或任何 HMSC/TRACE 相关字符串写成不可修改的默认业务逻辑。它们只能作为用户可能自己输入的示例。
6. 如果历史数据或导入 JSON 中已经存在固定版本键，应迁移到用户可编辑版本列表，并尽量保留 label 与内容。

建议结构：

```ts
type ModelVersion = {
  id: string
  label: string
  shortLabel?: string
  createdAt: string
  updatedAt: string
}

type BlockVariantKey = "common" | string
```

可使用等价结构，只要满足自定义版本、最多 5 个、导入导出兼容和旧数据安全迁移。

---

## 0.2.0 — Block variants 和全局版本切换

### 目标

实现版本感知的 block 内容。每个 block 应表现为一个概念槽位，可以根据全局选中的用户自定义版本显示不同标题和富文本内容。这比继续增加 block 类型更重要。

### 必需行为

1. 在顶部工具栏添加全局版本切换器，至少包含：
   - `All`
   - 用户定义的版本列表，最多 5 个。
2. 提供版本管理入口，允许用户新增、重命名、删除、排序版本。
3. `All` 模式应适合作总览。它可以显示每个 block 当前首选/default variant，并用小标记提示该 block 存在哪些版本内容；不要求同时展开所有版本内容。
4. 选择某个版本后，所有版本感知 block 应一起切换。用户不应逐个 block 手动切换。
5. 现有 V1/V1.1 block 必须安全迁移到 `common` 或默认 variant。不得丢失现有标题、富文本内容、颜色、状态、emoji、edge style 或位置。
6. 每个 block 应把布局/样式字段保留在 block 层级：位置、尺寸、背景色、边框色、文字色、node type、status、emojis。
7. 每个 block 应把版本特定的 title/content 存在 `variants` 对象中。

建议结构：

```ts
type BlockVariant = {
  title: string
  contentJson: JSONContent
  contentHtml?: string
  updatedAt: string
}

type BlockData = {
  // 现有共享字段
  nodeType: BlockNodeType
  backgroundColor: string
  textColor: string
  borderColor: string
  width: number
  height: number
  showStatus?: boolean
  status?: BlockStatus
  emojis?: string[]

  // 新字段
  variants?: Partial<Record<BlockVariantKey, BlockVariant>>
  activeVariantKey?: BlockVariantKey

  // 迁移期可保留 legacy 字段，但长期 canonical 内容应转入 variants
  title?: string
  contentJson?: JSONContent
  contentHtml?: string
}
```

只要能保留同等行为和导入导出兼容性，也可以采用不同结构。

### Inspector 行为

1. Block inspector 应显示当前正在编辑哪个版本，或显示当前使用 `common` fallback。
2. 提供紧凑控件来添加、复制、删除 variant，例如：
   - 将当前内容复制到某个用户版本。
   - 从某个用户版本复制到当前版本。
   - 删除当前 block 在某个版本下的 variant。
3. 如果全局选中的版本没有该 block 的专属 variant，block 应 fallback 到 `common`，并在 inspector 中明确提示。
4. 在某个版本视图中编辑，应更新该版本的 variant。在 `All` 中编辑可以默认更新 `common`，除非用户在 inspector 中明确选择其他 variant。
5. 编辑一个版本时，不得覆盖另一个版本的内容。

### Canvas 行为

1. Block preview 应显示当前全局版本的内容，并 fallback 到 `common`。
2. Block 上可以显示细微的版本指示，例如用户版本的短标签或 `COMMON`，但应保持低干扰。
3. 如果一个 block 有多个 variants，可用小点或徽标提示可用版本。
4. 全局版本切换应足够快，并避免不必要的布局跳动。

### 持久化和导入导出

1. IndexedDB 持久化必须保留所有版本定义和 block variants。
2. JSON 导出/导入必须保留所有版本定义和 block variants。
3. 没有 `variants` 的 legacy JSON 必须仍可导入。
4. 如果某个 variant 格式异常，应 fallback 到 `common` 或空文档，并 `console.warn`。
5. 如果导入文件版本数超过 5 个，应保留前 5 个并警告，或要求用户手动选择保留哪些版本；不要静默丢弃。

### 验收标准

- 用户可自定义版本名称，最多 5 个。
- 全局版本切换器存在，并能更新所有 block。
- 一个 block 至少能保存两个不同版本内容。
- 编辑一个版本不会修改另一个版本。
- 旧保存数据仍可加载。
- 导出/导入保留版本定义和 variants。
- 构建通过。

---

## 0.2.1 — Groups / frames

### 目标

添加轻量 frame/group 区域，让相关 block 可以被视觉分组。这有助于组织 notation、model components、priors、results、caveats 等区域，但不得强制任何预定义画布结构。

### 必需行为

1. 添加 frame/group 对象，显示为带标题的大背景矩形。
2. Frame 应支持：
   - 标题
   - 背景色
   - 边框色
   - 透明度
   - lock/unlock
   - resize
   - move
3. Frame 应在视觉上位于普通 block 后方。
4. Frame 可以通过空间包含或显式 parent-child 关系包含 block。选择与 React Flow 最稳定的方案。
5. 移动 frame 时应能移动其中 block。如果这很难，先实现手动 `Attach selected blocks to frame`。
6. 锁定 frame 不应在编辑 block 时被误选中。
7. Frame 数据必须能持久化并导入导出。

### 可选行为

1. 折叠/展开 frame。
2. 隐藏/显示 frame 内所有 block。
3. 在 frame 层内 send to back / bring forward。

### 不在范围内

不要实现强制画布模板、自动生成的研究项目分区或固定版本相关 sections。

### 验收标准

- 用户可以创建 frame。
- 用户可以把 block 视觉放进 frame。
- Frame 可移动/resize，且不破坏 block 位置。
- Frame 可锁定，避免误操作。
- 导出/导入和刷新后保留 frame。

---

## 0.2.2 — 显示密度模式

### 目标

让图在自学、整理和组会展示中更易读。Block 不应总是必须显示完整富文本内容。

### 必需行为

1. 添加 per-block 显示模式：

```ts
type BlockDisplayMode = "full" | "compact" | "title_only"
```

2. `full`：当前行为，必要时可滚动显示富文本预览。
3. `compact`：显示标题、type badge、status/emoji/version 指示和短预览。限制高度或行数，数学内容不能破坏布局。
4. `title_only`：只显示标题、type badge、status/emoji/version 指示。
5. 添加顶部工具栏级别的全局显示密度 override：
   - `Use block settings`
   - `Full`
   - `Compact`
   - `Title only`
6. 全局 override 不应永久覆盖 per-block 设置，除非用户明确选择持久化操作。
7. Per-block display mode 必须持久化。

### 验收标准

- 用户可用 compact/title-only 做密集总览。
- 切换全局显示密度即时生效。
- 富文本内容不会因为显示模式被删除或修改。
- 导出/导入和刷新后保留 per-block display mode。

---

## 0.2.3 — 对齐、分布、网格吸附和 micro-straighten

### 背景

画布视觉上是无限的，但 React Flow 节点仍有有限世界坐标。对齐通过修改选中节点的 `position.x` 和 `position.y` 完成，不需要有限画布边界。

### 目标

提升图的整洁度。应用应帮助用户对齐 block，并修复因节点几乎但没有完全对齐而导致的轻微 edge 歪斜。

### 必需对齐工具

添加 multi-select layout 工具。如果多选尚不可靠，先实现或改进多选。

必需命令：

1. 左对齐
2. 右对齐
3. 顶部对齐
4. 底部对齐
5. 水平中心对齐
6. 垂直中心对齐
7. 水平分布
8. 垂直分布
9. 选中 block 吸附到网格
10. 所有 block 吸附到网格

建议网格大小为 8px 或 10px，并放在 constants 中可配置。

### Micro-straighten 工具

添加一个命令，例如 `Straighten near-axis edges` 或 `Clean up micro-misalignment`。

UI 要求：

1. Micro-straighten 必须放在顶部工具栏。
2. 它应作为按钮出现，位置在 `Fit` 和 `Save` 之间。
3. 按钮应使用通用文案和图标，不应出现任何具体研究版本或领域名称。

功能目的：

修复本来应当视觉上水平或垂直的 edge 中的细小偏差。它只能做小坐标调整，不能重新组织整张图。

建议算法：

1. 对每条可见 edge，计算 source 和 target anchor 的世界坐标。
2. 如果 edge 基本垂直，且 `abs(sourceX - targetX) <= tolerance`，调整其中一个端点 node 的 `x`，使 anchor 对齐。
3. 如果 edge 基本水平，且 `abs(sourceY - targetY) <= tolerance`，调整其中一个端点 node 的 `y`，使 anchor 对齐。
4. 使用小 tolerance，例如 6–12px。
5. 不要改变明显对角线或用户有意弯曲的 edge。
6. 不要移动锁定 frame，或锁定 frame 内的 block，除非用户明确允许。
7. 如果存在选中 node/edge，优先只作用于选中对象；否则全局作用。
8. 如果多个 edge 对同一个 node 给出冲突的小调整，使用 median/最小调整，或跳过该 node 并在 console 中警告。

该工具不需要数学上完美。优先级是去掉可见小歪斜，同时不扰乱整张 map。

### 验收标准

- 多选 block 可以对齐。
- 多选 block 可以水平/垂直分布。
- Block 可以吸附到网格。
- 顶部工具栏中 `Fit` 和 `Save` 之间有 micro-straighten 按钮。
- 近似水平/垂直且只有微小偏差的 edge 可以通过一个命令校直。
- 该命令不会大幅移动 block。
- 构建通过。

---

## 0.2.4 — 版本感知 edge 可见性

### 目标

Edge 不需要语义类型，但应能设置只在某些用户自定义版本视图中出现。这样可以防止某个版本专用的 edge 干扰另一个版本视图。

### 必需行为

1. 添加可选 edge visibility：

```ts
type EdgeVisibility = "all" | string[]
```

或等价结构，其中 string[] 引用用户自定义版本 id。

2. Edge inspector 应允许用户选择：
   - 所有版本可见
   - 仅某些用户自定义版本可见
   - 任意版本组合，但最多来自当前 5 个用户版本
3. 全局版本切换应过滤可见 edge。
4. `All` 模式默认显示所有 edge，除非后续有更好的 overview 设计。
5. 这不是 semantic edge typing。不要添加 `depends_on`、`uses`、`proves` 等预定义含义。
6. 现有 edge 默认在所有版本中可见。
7. 导入导出和持久化必须保留 edge visibility。

### 可选行为

1. 版本特定 edge label。除非容易安全实现，否则推迟。
2. 版本特定 edge style。除非容易安全实现，否则推迟。

### 验收标准

- Edge 可以在一个版本中隐藏、另一个版本中显示。
- 旧 map 中的 edge 仍默认全部显示。
- 全局版本切换能正确过滤 edge。
- 导出/导入保留 edge visibility。

---

## 0.2.5 — 真实使用后的可用性 polish

只有在用户实际使用 0.2.0–0.2.4 后，才应规划本里程碑。

候选任务：

1. 按 block 标题、type、status、emoji 和版本可用性搜索/过滤。
2. 导出选中 block 或当前 viewport 为 SVG/PNG/PDF。
3. 导出选中 block 为 Markdown/HTML，用于组会 notes。
4. Minimap 改进。
5. 更好的键盘快捷键。
6. 选中 block 的快速样式 palette。
7. 更好的移动端只读模式。
8. PWA offline install。

除非用户明确调整优先级，不要在 0.2.0–0.2.4 之前实现这些。

---

## 当前优先级

1. `0.2.0`：可自定义版本、block variants 和全局版本切换。
2. `0.2.1`：Groups / frames。
3. `0.2.2`：显示密度模式。
4. `0.2.3`：对齐、分布、网格吸附和 micro-straighten。
5. `0.2.4`：版本感知 edge 可见性。
6. `0.2.5`：真实使用后的可用性 polish。

## 0.2.x 非目标

除非用户明确要求，不要实现以下内容：

1. 刚性的 workflow/project-management 系统。
2. 大型 block type taxonomy。
3. Semantic edge taxonomy。
4. 强制画布模板或自动生成的领域/版本专用 sections。
5. Cloud sync。
6. 多用户协作。
7. AI generation 或 summarization。
8. 完整移动端编辑 redesign。
9. 单独 backend。
10. 任何不可由用户修改的固定研究版本名称或领域模板。

## Result 协议

每个已实现里程碑应在以下位置创建 result 文件：

```text
prompts/tasks/<milestone_id>_result.md
```

Result 文件应包括：

1. Summary。
2. Files read。
3. Files modified。
4. Commands run and exit status。
5. Tests performed。
6. Acceptance criteria passed。
7. Known issues。
8. Recommended next milestone。

如果某个里程碑太大，应在最小 coherent subset 后停止，并明确报告剩余内容。
