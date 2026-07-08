# TODO — Presentation Outline 与 Markdown Story Deck 导出

本 TODO 记录 Asteria 下一步要做的功能方向。请 Codex 先进入 plan mode，先读规则、理解当前实现，再给出简洁实施计划。计划清楚后再实现。不要直接进入大规模改代码。

## 1. 背景与判断

老师反馈：当前思维导图式展示会“跳来跳去”，信息密度太高，不利于组会汇报。Asteria 现在适合研究阶段组织想法，但不适合作为最终汇报形式。

因此下一步不要做浏览器内的 online presentation，也不要做“点一下跳到下一个 block”的 canvas 演示模式。那种模式本质上仍然是在高密度画布中移动视角，只解决“怎么跳转”，没有解决“怎么降低密度、形成线性叙事”。

更合理的方向是：Asteria 负责把网状研究画布整理成线性讲稿骨架；正式展示交给后续 PPT/PDF 工作流。

核心目标：实现一个可以选择 block / group，指定顺序，并导出为 Markdown story deck 的功能。后续用户可以把导出的 Markdown 交给 GPT、Codex 或专门的 slides skill，制作低密度、美观、适合科研汇报的 PPT/PDF。

## 2. 产品原则

Asteria 不要变成 PPT 编辑器。Asteria 的角色是研究画布与线性讲稿之间的桥。

网状画布用于思考，Markdown story deck 用于转化为正式汇报。导出内容应当强调线性叙事、低密度、清晰主线，而不是把所有 block 内容无差别堆出来。

默认导出的内容应适合进一步生成科研 slides：一页一个主信息、公式可保留、speaker notes 可保留，但正文不要过密。

## 3. 本任务目标

实现 `Presentation Outline` 或 `Story Export` 功能：

1. 用户可以从画布中选择 block 或 group/frame，加入一个可排序的 outline。
2. outline 定义导出顺序，不用于网页端播放。
3. 用户可以给每个 outline 条目设置 slide title、导出密度、notes。
4. 用户可以按照当前全局版本或指定版本解析 block 内容。
5. 用户可以导出一个结构良好的 Markdown 文件，用于后续制作 PPT/PDF。
6. 导出的 Markdown 应包含一段可直接交给 GPT/Codex/slides skill 的生成提示词。

## 4. 明确不做

本任务不做：

1. 不做浏览器内 presentation / slideshow 模式。
2. 不做按空格跳转 block 的 canvas 演示。
3. 不做 `.pptx` 直接导出。
4. 不做 PDF 直接导出。
5. 不做复杂 PPT 排版引擎。
6. 不做 AI 自动总结或自动生成 slide 文案，除非用户后续单独要求。
7. 不做云同步、多用户协作。
8. 不做对画布视觉系统的大改。
9. 不做新的 block type 系统。
10. 不做 presentation-specific per-version layout。

## 5. 交互设计

建议新增一个右侧或可折叠面板，名称可以是：

```text
Story Outline
```

或

```text
Export Outline
```

面板应支持：

1. `Add selected to outline`：把当前选中的 block 或 group 加入 outline。
2. 拖拽排序 outline 条目。
3. 删除 outline 条目。
4. 重命名条目的 slide title。
5. 设置每个条目的导出密度。
6. 给每个条目添加 speaker notes。
7. 点击 outline 条目时，可以在画布上选中或定位到对应 block/group，方便检查来源。
8. 支持 `Export Markdown`。

不要求做复杂动画、播放、全屏。

## 6. Outline 条目类型

第一版至少支持 block。若 group/frame 已经稳定，支持 group/frame 更好。

建议数据结构类似：

```ts
type StoryOutlineItemType = "block" | "group"

type StoryExportDensity = "title_only" | "summary" | "full"

type StoryOutlineItem = {
  id: string
  sourceId: string
  sourceType: StoryOutlineItemType
  slideTitle?: string
  density: StoryExportDensity
  speakerNotes?: string
  createdAt: string
  updatedAt: string
}
```

如果当前 store 不方便扩展，可以先保存在 local state / persisted map state 中，但要保证刷新后不丢失。更理想的是把 outline 存进导出的 map JSON。

## 7. 导出密度

每个 outline item 应支持三个导出密度：

```text
Title only
Summary
Full content
```

默认使用 `Summary`，因为老师已经反馈不喜欢密度太高。

### Title only

只导出标题、block type、版本来源、极短注释。适合后续让 GPT/Codex 自行扩展为 slide。

### Summary

导出标题、block type、当前解析后的核心内容摘要、关键公式、speaker notes。若目前没有自动摘要功能，就不要调用 AI，可以先导出 block 正文的前若干段或前若干字符，并标注为 `Draft content`。不要在本任务中实现 AI summarization。

### Full content

导出完整 rich text 内容转换成 Markdown，适合需要保留全部笔记时使用。

## 8. 版本解析

导出 Markdown 时必须明确版本。

导出设置中至少支持：

```text
Use current global version
Use All / base view
Use a selected version
```

如果当前实现已有版本继承逻辑，则导出时应使用 resolver 得到当前版本实际显示的内容，并在 metadata 中标记来源：

```text
Version: V3
Source: inherits V2
```

如果版本继承逻辑尚未完成，则先使用当前已有的 version resolver，并在 TODO/result 中说明限制。

导出正文只放当前解析后的内容，不要把所有版本内容都堆进一个 slide。其他版本信息可以放在 metadata 或 notes 中。

## 9. Markdown 导出格式

导出的 Markdown 应该是线性 story deck，不是原始 block dump。

建议格式：

```markdown
# <Deck Title>

Generated from Asteria.
Version view: <current version / selected version>
Export density: <mixed / summary / full>

## Slide 1 — <Slide Title>

Source: <BlockType> / <Original block title>
Version: <V3 · Marked TRACE>
Variant source: <Own / Inherits V2 / Base legacy>

Main message:
<低密度正文或摘要>

Key formulas:
<公式，如有>

Speaker notes:
<speaker notes，如有>

Related blocks:
<可选，列出用户手动填或自动从连接边推断的相关 block，第一版可省略>

---

## Slide 2 — <Slide Title>
...
```

如果 rich text 到 Markdown 的转换已有工具，就复用现有工具；如果没有，先实现一个保守转换，至少保留：

1. 标题文本。
2. 普通段落。
3. bullet / ordered list。
4. bold / italic 尽量保留。
5. inline math 和 block math。
6. code text。
7. links 尽量保留。

如果某些 Tiptap 节点暂时无法可靠转换，允许降级为纯文本，但要避免丢内容。

## 10. Key formulas 提取

第一版不需要复杂公式解析。可以采用简单规则：

1. 如果内容里有 block math 节点，放入 `Key formulas`。
2. 如果没有 block math，但有 inline math，可以保留在正文中。
3. 不要为了公式提取而破坏原始内容。

如果公式提取太复杂，先把所有内容放进 `Main message`，并在 result 中说明下一步可以优化。

## 11. Speaker notes

每个 outline item 应允许用户手动写 speaker notes。Notes 不应该显示在 canvas block 本体里，应该属于 story outline。

导出时 speaker notes 单独放在对应 slide section 下。后续制作 PPT 时可以把它们转成演讲备注，而不是 slide 主体。

## 12. Deck-level 信息

导出前可以有一个简单设置区：

1. Deck title。
2. Export version view。
3. Default density。
4. Include speaker notes: yes/no。
5. Include source metadata: yes/no。
6. Include PPT generation prompt: yes/no。

第一版 UI 要简单，不要做复杂 modal。可以使用现有右侧 panel 或 toolbar button 打开一个轻量导出面板。

## 13. PPT generation prompt

Markdown 文件末尾建议自动附加一段提示词，方便后续交给 GPT/Codex/slides skill。

建议内容：

```markdown
---

# Prompt for generating research slides

Please convert the story deck above into a low-density academic presentation.

Requirements:
- One slide should communicate one main idea.
- Keep slide text sparse and readable.
- Preserve mathematical notation in LaTeX.
- Move detailed explanations to speaker notes.
- Use diagrams where helpful, especially for model decomposition and workflow.
- Use a clean academic style suitable for a statistics/ecology research group meeting.
- Do not copy all Markdown text onto slides.
- Prefer concise slide titles that state the message.
```

可以是英文，因为后续生成科研 PPT 通常更适合英文。其余 UI 与 TODO 仍以中文为主。

## 14. 与版本继承功能的关系

如果 sequential variant inheritance 已经实现，本任务应复用它：

1. 导出当前版本实际显示内容。
2. 标记 `Own / Inherits V1 / Inherits V2 / Hidden / Base legacy`。
3. Hidden block 不应进入某个 concrete version 的导出，除非用户在 All mode 或明确选择 include hidden。

如果 sequential variant inheritance 尚未实现，本任务不要强行重构版本系统。应在 plan 中说明：

1. 当前导出使用现有 resolver。
2. 版本继承完成后，Markdown export 应切换到新的 central resolver。
3. 不要复制一套新的版本解析逻辑。

## 15. 与 group/frame 的关系

如果 group/frame 已经稳定，outline item 可以支持 group/frame。Group 导出时可以：

1. 使用 group title 作为 slide title。
2. 收集 group 内 blocks 的标题作为 `Contained blocks`。
3. 默认只导出 group-level summary 或 block titles，不要把 group 内全部内容堆到一页。

如果 group/frame 还不稳定，第一版只支持 block，并在 result 中说明。

## 16. UI 细节建议

Story Outline 面板应尽量紧凑：

```text
Story Outline
[Add selected]
[Export Markdown]

1. Motivation                 Summary
2. TRACE baseline             Summary
3. Catalogue decomposition    Summary
4. Open-tail marked TRACE     Full
5. Theorem targets            Summary
```

每行可显示：

1. 序号。
2. slide title。
3. source type 小 badge。
4. density 小 badge。
5. 删除按钮。
6. 拖拽 handle。

点击条目展开编辑：

1. Slide title。
2. Density。
3. Speaker notes。
4. Source block title。
5. Source version state。

## 17. 文件下载

`Export Markdown` 应生成 `.md` 文件下载。

文件名建议：

```text
<deck-title>-asteria-story-<timestamp>.md
```

需要对文件名做 slugify，避免非法字符。

## 18. 持久化与导入导出

Story outline 应尽量随 map 一起保存和导出。建议给 `ExportedMap` 增加可选字段：

```ts
storyOutline?: StoryOutlineItem[]
storyDeckTitle?: string
```

兼容性要求：

1. 旧 map 可以正常加载。
2. 没有 storyOutline 时默认为空。
3. 导入旧 JSON 不报错。
4. 导出新 JSON 时保留 storyOutline。
5. Markdown 导出不改变 map 内容，除非用户编辑了 outline。

## 19. 可能涉及的文件

请 Codex plan mode 先检查实际文件结构，再决定修改位置。可能涉及：

- `src/types/map.ts`
- `src/store/useMapStore.ts`
- `src/lib/exportImport.ts`
- `src/components/InspectorPanel.tsx`
- `src/components/Toolbar.tsx` 或当前 toolbar 文件
- 新增 `src/components/StoryOutlinePanel.tsx`
- 新增 `src/lib/storyMarkdownExport.ts`
- 新增 `src/lib/tiptapToMarkdown.ts` 或复用现有转换逻辑
- `CHANGELOG.md`
- `package.json`

如果已有类似 markdown/export helper，请优先复用，不要重复造轮子。

## 20. 推荐任务编号与版本

当前 `package.json` 版本如果仍为 `0.5.10`，建议本任务使用：

```text
v0.5.11
```

如果本地已经有更新版本，请使用下一个 patch 版本。

若需要按照 handoff 协议生成正式 task 文件，建议：

```text
prompts/tasks/asteria_0_5_11_story_outline_markdown_export_task.md
```

结果文件：

```text
results/asteria_0_5_11_story_outline_markdown_export_result.md
```

## 21. Plan mode 要求

实现前先输出计划，计划应覆盖：

1. 当前 map/store/export 数据流。
2. outline 数据结构放在哪里。
3. 如何从 block/group 解析当前内容。
4. 如何做 rich text 到 Markdown 的转换。
5. 如何设计 UI，避免 right panel 过载。
6. 如何处理版本信息。
7. 如何持久化与导入导出。
8. 如何测试。
9. 哪些功能本轮不做。

计划必须明确哪些是第一版必须实现，哪些是后续优化。

## 22. 测试要求

至少运行：

1. TypeScript build。
2. Production build。
3. 浏览器手动 smoke test，如果当前环境支持。

手动测试场景：

1. 选择一个 block，加入 Story Outline。
2. 加入多个 block，拖拽排序。
3. 修改 slide title。
4. 修改 density。
5. 添加 speaker notes。
6. 导出 Markdown。
7. 检查 Markdown 是否按 outline 顺序排列。
8. 检查公式是否尽量保留。
9. 检查当前版本信息是否导出。
10. 刷新页面后 outline 不丢失。
11. 导出/import map 后 outline 不丢失。
12. 删除 source block 后 outline 中应有合理提示或自动清理，不应崩溃。
13. 旧 map 仍可加载。

## 23. 验收标准

本任务完成的标准：

1. 用户可以把选中的 block 加入 Story Outline。
2. Story Outline 可以排序、删除、编辑 slide title。
3. 每个 outline item 可以设置导出密度。
4. 每个 outline item 可以写 speaker notes。
5. 可以导出 `.md` 文件。
6. Markdown 是线性 story deck，而不是无序 block dump。
7. Markdown 包含 deck title、版本信息、source metadata、slide sections。
8. Markdown 能保留主要文本和公式。
9. Markdown 末尾可包含用于后续生成科研 PPT 的 prompt。
10. 不实现 online presentation / slideshow。
11. 不直接导出 pptx/pdf。
12. 旧地图兼容。
13. story outline 能持久化。
14. build 通过。
15. result 文件说明完成项、跳过项、已知问题和下一步建议。

## 24. 后续可能任务

本任务之后，可以再考虑：

1. 用 GPT/Codex/slides skill 将 Markdown story deck 生成正式 PPT。
2. 根据导出的 Markdown 自动建议 slide grouping。
3. 支持从 group/frame 自动生成 section。
4. 支持导出 Marp / Quarto slides。
5. 支持导出 speaker notes 到 PPT notes。
6. 支持一键复制 Markdown 到剪贴板。
7. 支持在 outline 中手动写 slide-level main message。

这些都不是本轮任务。