你是一个资深前端工程师。请为我实现一个本地优先的网页应用，用来做贝叶斯模型开发、论文阅读和组会汇报准备时的视觉 block map。这个应用第一版只需要在浏览器中运行，不需要后端、不需要登录、不需要多人协作。目标是让我可以在 Windows、macOS、iPad、安卓手机、iPhone 的浏览器中打开查看；编辑体验优先支持桌面端和 iPad，手机端第一版只要求能查看、缩放和平移，不要求完整编辑体验。

项目名称叫Asteria(来自星图、星群的感觉，适合“把复杂模型、prior、theorem、paper notes 连成一张知识星图”); 用 Vite + React + TypeScript + Tailwind CSS。无限画布、节点、连线和拖拽使用 @xyflow/react，也就是 React Flow。状态管理使用 Zustand。持久化使用 IndexedDB，建议用 Dexie。富文本编辑必须使用 Tiptap。数学公式渲染使用 KaTeX。第一版不要使用 Next.js、后端服务、数据库服务、登录、权限系统、多人协作、AI 功能或复杂云同步。请以稳定、本地可用、可导入导出为第一目标。

如果仓库里已有 AGENTS.md、README、前端规范、skills 或其他项目约定，请先阅读并遵守。如果当前仓库为空，请初始化 Vite React TypeScript 项目并配置 Tailwind。如果已有项目，请在现有结构上实现，不要无谓重构。开发过程中每完成关键里程碑都运行 npm run build，确保 TypeScript 和构建没有错误。不要频繁向我提问，除非遇到确实无法自行判断的阻塞问题；一般设计选择请直接做合理默认。

一、总体目标

我要一个可以自由放置 block、连接 block、编辑 block 内容和样式的网站。它要像一个专门为统计模型和论文阅读准备的视觉知识板，而不是普通 todo app。第一版必须实现以下核心能力：新增 block、拖拽 block、连接 block、修改 block 背景颜色、修改 block 边框颜色、修改 block 文字默认颜色、富文本编辑、选中文字后改颜色、选中文字后改字号、加粗、斜体、下划线、删除线、行内代码、链接、高亮、行内数学公式、块级数学公式、本地自动保存、刷新恢复、JSON 导入导出。

特别强调：第一版必须支持富文本编辑。不能只做 textarea + Markdown preview。用户必须能选中一段文字后，通过 toolbar 或 bubble menu 改颜色、字号、粗体、删除线等样式。

二、推荐依赖

请使用或安装以下核心依赖，具体版本以当前生态兼容为准：

vite
react
react-dom
typescript
tailwindcss
@xyflow/react
zustand
dexie
@tiptap/react
@tiptap/starter-kit
@tiptap/extension-text-style
@tiptap/extension-color
@tiptap/extension-highlight
@tiptap/extension-underline
@tiptap/extension-link
@tiptap/extension-text-align
@tiptap/extension-placeholder
@tiptap/extension-mathematics
katex

如果 @tiptap/extension-mathematics 的 API 与当前版本不同，请查阅已安装包的类型定义或官方用法，做兼容实现。目标不变：富文本编辑器里必须能插入并渲染 inline math 和 block math。

三、界面布局

应用打开后显示一个无限画布。顶部是 toolbar，中间是 canvas，右侧是 inspector panel。整体布局如下：

顶部 toolbar：包含新增 block、导入 JSON、导出 JSON、清空画布、适配视图、手动保存、保存状态显示。

中间 canvas：使用 React Flow。支持缩放、平移、拖拽 block、选择 block、选择 edge、连接 block、删除 block、删除 edge。画布背景可以是浅灰网格或点阵，但不要过度装饰。

右侧 inspector panel：没有选中对象时显示简短说明和快捷键；选中 block 时显示 block 属性编辑器和富文本编辑器；选中 edge 时显示 edge 属性编辑器。

UI 使用 Tailwind CSS，风格要简洁、干净、适合长时间看论文，不要使用强烈饱和背景。第一版只需要浅色模式，暗色模式留 TODO。

四、数据模型

请集中定义类型，建议放在 src/types/map.ts。核心类型如下，可根据 React Flow 类型适当调整：

import type { Edge, Node } from "@xyflow/react"
import type { JSONContent } from "@tiptap/react"

export type BlockNodeType = "generic"

export type BlockData = {
  title: string
  contentJson: JSONContent
  contentHtml?: string
  backgroundColor: string
  textColor: string
  borderColor: string
  width: number
  height: number
  nodeType: BlockNodeType
  createdAt: string
  updatedAt: string
}

export type MapEdgeData = {
  label?: string
  color?: string
  createdAt: string
  updatedAt: string
}

export type MapViewport = {
  x: number
  y: number
  zoom: number
}

export type ExportedMap = {
  version: 1
  nodes: Node<BlockData>[]
  edges: Edge<MapEdgeData>[]
  viewport?: MapViewport
  updatedAt: string
}

BlockData 的 contentJson 是主数据，必须保存和导入导出。contentHtml 只能作为渲染缓存，不允许作为唯一数据源。未来可能扩展 nodeType，例如 prior、theorem、proof_gap、simulation、decision，但第一版只做 generic，不要过度设计复杂类型。

默认新 block 内容使用 Tiptap JSON：

{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "New block" }
      ]
    }
  ]
}

五、block 功能

每个 block 在画布上显示为一个矩形卡片。卡片顶部显示 title，下面显示富文本内容预览。block 必须支持拖拽、选择、调整宽高。第一版可以通过 inspector 输入 width 和 height 调整大小；如果能用拖拽 resize 更好，但不是第一优先级。每个 block 至少有上下左右四个连接点 handle，可以从任意 handle 拖线连接到另一个 block。

block 至少包含这些可编辑属性：title、contentJson、backgroundColor、textColor、borderColor、width、height。右侧 inspector 中必须可以修改这些属性。颜色输入同时支持 color picker 和手动 hex 输入。block 的默认宽度可以是 320，高度可以是 220。

画布中的 block preview 必须是只读预览，不要在画布 block 内直接启动可编辑 Tiptap。真正编辑只放在右侧 inspector panel 中。这样可以避免 React Flow 拖拽与富文本选择冲突。双击 block 时应选中该 block 并聚焦右侧富文本编辑器。

六、edge 功能

连接功能使用 React Flow handles。边默认使用 smoothstep 或 bezier。edge 数据结构至少包含 id、source、target、sourceHandle、targetHandle、label、color、createdAt、updatedAt。第一版必须能连接两个 block。选中 edge 后，右侧 inspector 显示 edge 编辑器，可以修改 label 和 color。edge 颜色应能实时反映到画布上。Delete 或 Backspace 可以删除选中的 edge。

七、富文本编辑器

右侧 inspector 中的 block 内容编辑必须使用 Tiptap。请实现 RichTextEditor、RichTextToolbar、RichTextBubbleMenu、FontSizeSelect、ColorPickerRow 等组件。Tiptap 扩展至少包括：

StarterKit
TextStyle
Color
Highlight.configure({ multicolor: true })
Underline
Link
TextAlign
Placeholder
Mathematics

toolbar 至少包含以下功能：

Bold
Italic
Underline
Strike
Inline code
Bullet list
Ordered list
Blockquote
Heading 1
Heading 2
Normal paragraph
Text color picker
Highlight color picker
Font size dropdown
Clear formatting
Link
Remove link
Inline math
Block math
Text align left
Text align center
Text align right

必须支持用户选中一段文字后点击 toolbar 改格式。不能要求用户手写 HTML 或 Markdown 来改颜色、字号、粗体、删除线。

八、Bubble Menu

必须实现 Tiptap Bubble Menu。用户在富文本编辑器中选中文字后，应出现一个悬浮小工具条。Bubble Menu 至少包含：

Bold
Italic
Strike
Text color
Highlight color
Font size

Bubble Menu 不需要复杂，但必须能证明“选中文字后直接改样式”这个核心需求已经完成。Bubble Menu 与固定 toolbar 可以共存。

九、字号功能

Tiptap 默认未必提供现成 FontSize 扩展。请自己实现一个简单的 FontSizeExtension，建议放在 src/editor/FontSizeExtension.ts。实现方式可以基于 TextStyle mark 的 globalAttributes 增加 fontSize 字段，渲染为：

<span style="font-size: 18px">text</span>

需要提供命令：

setFontSize(size: string)
unsetFontSize()

字号 dropdown 至少包含：

12px
14px
16px
18px
20px
24px
28px
32px

默认字号可以是 14px 或 16px。选中文字后改字号必须生效，并在保存、刷新、导出、导入后保留。

十、颜色功能

文字颜色使用 Tiptap Color + TextStyle。高亮颜色使用 Highlight extension，并开启 multicolor。block 背景色、block 边框色、block 默认文字色与富文本内部文字颜色是不同层级，不要混淆。

palette 放到 src/constants/palette.ts，不要写死在组件里。第一版 palette 至少包含：

#111827
#374151
#6b7280
#ef4444
#f97316
#eab308
#22c55e
#06b6d4
#3b82f6
#8b5cf6
#ec4899
#f9fafb
#fef3c7
#dbeafe
#dcfce7
#fce7f3
#e5e7eb

颜色输入必须同时支持 palette 点击和手动输入 hex。手动输入非法 hex 时不要崩溃，可以暂时不应用或显示简单错误状态。

十一、数学公式

数学公式是第一版必须功能。Tiptap 中需要支持 inline math 和 block math，并使用 KaTeX 渲染。必须引入 KaTeX CSS。

用户插入公式的方式至少包括：

点击 Inline math 按钮，弹出 prompt 或一个小输入框，输入 LaTeX，例如：

\beta_j \sim N_q(\nu,\Psi)

插入 inline math node。

点击 Block math 按钮，弹出 prompt 或一个小输入框，输入 LaTeX，例如：

\begin{aligned}
y_{ij} &= \mathbb{I}(z_{ij}>0),\\
z_{ij} &= \alpha_j+x_i^\top\beta_j+\varepsilon_{ij}.
\end{aligned}

插入 block math node。

用户直接粘贴或输入常见 Markdown 风格公式时，尽量自动转换：

同一行中的 $$\beta_j$$ 应转成 inline math。

独立成行的块公式：

$$
\alpha^U_{hg}\mid \gamma_g,p_{U,g}\sim N\{\mu_{p_{U,g}}(\gamma_g),\tau^2_{p_{U,g}}\}
$$

应转为 block math。

如果 Tiptap 官方默认使用 $$$...$$$ 表示 block math，也要额外兼容独立成行的 $$...$$。请实现一个 mathPasteHandler 或 preprocessPastedMath 函数，建议放在 src/editor/mathPasteHandler.ts。粘贴文本时扫描：

如果 $$...$$ 出现在同一行且该行还有普通文字，转 inline math。
如果 $$ 独立成行并包裹多行内容，转 block math。
如果是 $$$...$$$，转 block math。
不要为了这个功能破坏普通美元符号文本。

至少在代码注释中写出这些测试样例，并尽量用轻量函数测试或手动验证。

十二、富文本预览

画布中的 block preview 必须显示富文本和公式，不允许显示 JSON 或源码。实现方式可以二选一：

优先方案：保存 contentHtml，block preview 用 dangerouslySetInnerHTML 渲染经过处理的 HTML，同时确保公式的 HTML/CSS 能正常显示。

备选方案：使用 read-only Tiptap renderer 或 generateHTML 从 contentJson 渲染。

需要注意安全：这是本地个人工具，不需要完整安全系统，但不要允许 script 标签执行。可以在生成或渲染 HTML 前移除 script 标签。若实现 sanitizer 成本较高，至少写一个简单 stripScriptTags 函数，并在 TODO 中标注未来用 DOMPurify 或 rehype-sanitize 改进。

十三、React Flow 与富文本冲突处理

画布节点内部不要直接编辑富文本。画布上只显示只读预览。用户要编辑内容时，选中 block，在右侧 inspector 编辑。block preview 内部的鼠标事件不要影响 React Flow 拖拽。需要保证以下行为：

拖拽 block 时不会选中文字。
选中 block 后右侧显示编辑器。
在右侧编辑器中选中文字改样式不会拖动画布。
在右侧编辑器中按 Delete/Backspace 不会删除 block。
双击 block 可以聚焦右侧编辑器。
双击画布空白处新增 block。

十四、持久化

持久化必须可靠。使用 IndexedDB，建议 Dexie。nodes、edges、viewport、updatedAt 都应保存。每次 nodes 或 edges 或 viewport 或 contentJson 变化后，debounce 500ms 自动保存到 IndexedDB。页面刷新后自动恢复。顶部显示保存状态：

Saved
Unsaved
Saving
Error

Ctrl/Cmd+S 手动保存。保存失败时不要静默失败，应在 console.error 记录，并在 toolbar 显示 Error。

十五、JSON 导入导出

提供导出 JSON 功能。导出的结构为：

{
  "version": 1,
  "nodes": [...],
  "edges": [...],
  "viewport": { "x": 0, "y": 0, "zoom": 1 },
  "updatedAt": "..."
}

导出文件名建议为：

trace-map-YYYYMMDD-HHMM.json

提供导入 JSON 功能。导入前校验 version、nodes、edges 的基本结构。导入后替换当前画布并自动保存。导入时如果发现旧格式，例如 block 只有 content 字符串没有 contentJson，则把旧 content 包装成默认 paragraph text，或做简单 migration。不要因为一个 block 内容异常导致整个导入失败；失败 block 用 fallback 内容，并 console.warn。

清空画布前需要 confirm。导入 JSON 替换当前画布前也需要 confirm。

十六、快捷键

第一版至少支持：

Delete 或 Backspace：删除选中的 block 或 edge。
Ctrl/Cmd+S：手动保存。
Ctrl/Cmd+E：导出 JSON。
Esc：取消选择。
双击画布空白处：新增 block。
双击 block：聚焦右侧 content 编辑器。

必须处理焦点问题。当焦点在 Tiptap editor、title input、color input、link prompt 或任何表单输入中时，Delete/Backspace 只能编辑文本，绝不能删除 block 或 edge。Ctrl/Cmd+S 可以阻止浏览器默认保存网页，并触发应用保存。Esc 如果有局部弹窗或 bubble menu，优先关闭局部 UI；否则取消画布选择。

十七、建议文件结构

请尽量按如下结构组织代码。若项目已有结构，可以合理调整，但不要把所有逻辑塞进 App.tsx。

src/
  app/
    App.tsx
  components/
    Toolbar.tsx
    Canvas.tsx
    InspectorPanel.tsx
    BlockNode.tsx
    RichTextEditor.tsx
    RichTextToolbar.tsx
    RichTextBubbleMenu.tsx
    RichTextPreview.tsx
    ColorPickerRow.tsx
    FontSizeSelect.tsx
    EdgeInspector.tsx
  editor/
    createEditorExtensions.ts
    FontSizeExtension.ts
    mathPasteHandler.ts
    editorUtils.ts
  store/
    useMapStore.ts
  lib/
    db.ts
    exportImport.ts
    ids.ts
    sanitize.ts
    time.ts
  constants/
    palette.ts
    fontSizes.ts
  types/
    map.ts
  styles/
    index.css

十八、状态管理

Zustand store 至少需要管理：

nodes
edges
selectedNodeId
selectedEdgeId
viewport
saveStatus
lastSavedAt

actions 至少包括：

addBlock(position?)
updateBlock(id, patch)
deleteSelected()
deleteBlock(id)
addEdge(edge)
updateEdge(id, patch)
deleteEdge(id)
setSelectedNode(id?)
setSelectedEdge(id?)
setViewport(viewport)
clearMap()
loadMap(exportedMap)
saveNow()
markUnsaved()

React Flow 的 onNodesChange、onEdgesChange、onConnect 要接入 store，并触发自动保存。Tiptap editor update 时调用 updateBlock 更新 contentJson 和 contentHtml。

十九、样式要求

block 需要有圆角、边框、轻微阴影。选中 block 时边框或 outline 明显。block title 与 content preview 层级清晰。content preview 中公式不要溢出严重；必要时 block 内部可以 overflow auto。右侧 inspector 宽度建议 360–440px。顶部 toolbar 高度保持紧凑。

Tiptap 编辑器需要有基本排版样式，包括 paragraph margin、heading 样式、blockquote 样式、list 样式、code 样式、link 样式、math block 样式。请在 CSS 中写清楚 `.ProseMirror` 和 preview 内容的样式。

二十、第一版验收标准

完成后请逐项自查以下标准：

1. npm install 后能正常安装依赖。
2. npm run dev 能打开应用。
3. npm run build 无 TypeScript 错误。
4. 可以新增 block。
5. 可以拖拽 block。
6. 可以连接两个 block。
7. 可以选中 block 并在右侧 inspector 修改 title。
8. 可以修改 block 背景色。
9. 可以修改 block 边框色。
10. 可以修改 block 默认文字色。
11. 可以在右侧富文本编辑器中选中文字后加粗。
12. 可以选中文字后斜体。
13. 可以选中文字后下划线。
14. 可以选中文字后删除线。
15. 可以选中文字后修改文字颜色。
16. 可以选中文字后修改高亮颜色。
17. 可以选中文字后修改字号。
18. Bubble Menu 在选中文字后出现，并至少支持加粗、斜体、删除线、颜色、高亮、字号。
19. 可以插入行内公式并正常渲染。
20. 可以插入块公式并正常渲染。
21. 可以粘贴常见 $$...$$ 公式并尽量自动转换。
22. 画布 block preview 能显示富文本、颜色、字号、删除线和公式。
23. 刷新页面后 block、edge、富文本格式、颜色、字号、公式仍然保留。
24. 可以导出 JSON。
25. 清空后可以从 JSON 导入恢复。
26. 可以选中 edge 并修改 label 和 color。
27. Delete 删除节点或边正常。
28. 在 Tiptap 编辑器、title input、color input 中按 Delete/Backspace 不会误删节点。
29. Ctrl/Cmd+S 可以保存。
30. Ctrl/Cmd+E 可以导出。
31. Esc 可以取消选择。
32. 页面没有明显 console error。
33. 保存状态 Saved / Unsaved / Saving / Error 能正常变化。

二十一、开发顺序

请按这个顺序开发，避免一开始陷入复杂细节：

第一步，搭建 Vite + React + TypeScript + Tailwind 基础项目，确保 build 通过。

第二步，接入 React Flow，实现画布、新增 block、拖拽 block、连接 block、选择 block、选择 edge、删除选中对象。

第三步，实现 Zustand store 和基本数据类型。

第四步，实现 IndexedDB 自动保存、刷新恢复、保存状态。

第五步，实现右侧 inspector，可以编辑 block 标题、背景色、文字默认色、边框色、宽高。

第六步，接入 Tiptap 富文本编辑器，用 contentJson 作为主存储。

第七步，实现 RichTextToolbar，包括粗体、斜体、下划线、删除线、列表、引用、标题、链接。

第八步，实现文字颜色、高亮颜色和字号，包括自定义 FontSizeExtension。

第九步，实现 Bubble Menu。

第十步，实现数学公式，包括 inline math、block math、KaTeX CSS、粘贴兼容逻辑。

第十一步，实现 block 富文本预览，确保画布里显示的是渲染结果，不是 JSON。

第十二步，实现 JSON 导入导出、清空确认、导入校验和 migration。

第十三步，完善快捷键和焦点冲突处理。

第十四步，整理样式，运行 build，按验收标准逐项检查。

二十二、不要做的事情

第一版不要做账号。
第一版不要做云同步。
第一版不要做多人协作。
第一版不要做评论系统。
第一版不要做复杂权限。
第一版不要做 AI 总结。
第一版不要做 PDF 阅读器。
第一版不要做 Latex 文档自动生成。
第一版不要做复杂 block 类型系统。
第一版不要做移动端完整编辑器。
第一版不要在画布 block 内直接编辑富文本。
第一版不要为了美观加入复杂动画。
第一版不要用后端服务。
第一版不要引入 Google Workspace 或任何外部云文档服务。

二十三、第二版 TODO，可以写在 README 但不要现在实现

后续可以考虑：

PWA 离线安装。
暗色模式。
block 类型：prior、theorem、proof gap、simulation、decision、paper note。
block 标签和搜索。
group/section/frame。
edge 类型：depends on、alternative to、proves、uses prior、postponed。
LaTeX 导出。
SVG/PDF 导出。
图片粘贴。
PDF 截图粘贴。
Obsidian Markdown 导出。
云同步。
版本历史。
自动布局。
小地图 minimap。
更复杂的移动端编辑。

二十四、完成后的输出

实现完成后，请给出简短总结，包括：

实现了哪些功能。
如何运行。
数据保存在哪里。
JSON 导入导出怎么用。
富文本和数学公式如何使用。
哪些是第二版 TODO。
运行了哪些检查，例如 npm run build。
如果某个验收项没有完成，必须明确说明，不要假装完成。



请在现有功能要求基础上，额外实现一套完整但克制的 UI/UX 视觉风格。这个项目不是普通任务管理工具，而是用于统计模型、贝叶斯 prior、theorem、proof gap、paper note 和 simulation plan 的视觉知识画布。请把界面做得像一个适合长期科研使用的专业工具，而不是 demo app。

整体设计方向参考 Notion、Linear、Figma canvas、Google Stitch 这类现代生产力工具，但不要照抄任何具体产品。关键词是：academic, calm, precise, canvas-based, information-dense but not crowded, low-saturation, long-reading friendly, technical, mathematical.

一、视觉基调

界面应以浅色模式为主。背景使用非常浅的冷灰色，不要纯白铺满全屏。画布背景可以使用 subtle dot grid 或 very light grid，颜色要淡，不要抢内容。右侧 inspector 使用白色或近白卡片背景，与 canvas 有轻微边界。顶部 toolbar 简洁，像专业工具，不像后台管理系统。

推荐基础颜色 token：

app background: #f6f7f9
canvas background: #f8fafc
panel background: #ffffff
toolbar background: rgba(255,255,255,0.86)
primary text: #111827
secondary text: #4b5563
muted text: #9ca3af
border: #e5e7eb
strong border: #cbd5e1
primary accent: #2563eb
primary accent soft: #dbeafe
danger: #dc2626
warning: #d97706
success: #16a34a

不要大面积使用高饱和蓝色。蓝色只用于选中态、主按钮和连接点。颜色应放在 constants 或 Tailwind theme 中，方便后续调整。

二、布局

整体采用三栏感，但不是传统 dashboard。顶部 toolbar 高度控制在 44–52px。左侧不需要复杂 sidebar，第一版顶部工具栏即可。中间 React Flow canvas 占据主要空间。右侧 inspector 固定宽度 400px 左右，最小 360px，最大 460px。右侧 panel 要清楚分区：Object、Appearance、Content、Metadata。

当没有选中对象时，右侧 panel 显示一个空状态页面，包括：
- 项目名
- 简短说明
- 快捷键
- 当前保存状态
- 一个“Create block”按钮

当选中 block 时，右侧 panel 显示：
- block title input
- node type badge，目前是 Generic
- appearance section：background, text, border, width, height
- content section：rich text toolbar + editor
- metadata section：createdAt, updatedAt

当选中 edge 时，右侧 panel 显示：
- edge label
- edge color
- source/target 简要信息
- delete edge 按钮

三、toolbar

顶部 toolbar 左侧显示应用名，例如 Asteria、Lattice 或 Traceboard，先用占位名 Asteria。旁边可以有一个小的保存状态指示器。中间或右侧放按钮：

New block
Fit view
Save
Export
Import
Clear

按钮风格要简洁，使用 small rounded buttons。主按钮 New block 可以用蓝色软背景，其余按钮用白色/灰色边框。危险操作 Clear 使用红色弱提示，不要默认大红。

四、block 视觉

block 是核心组件，要做得干净、易读。默认 block 尺寸为 340 x 220。block 背景默认为 #ffffff，边框 #e5e7eb，圆角 12px，轻微阴影。选中 block 时使用蓝色 outline 或 border，不能只靠阴影。

block 结构：
顶部 title 区域，高度约 36px，字体 14px 或 15px，font-weight 600。
title 左侧可以有一个小圆点或 type indicator。
content preview 区域 padding 12px，字体 13px 或 14px，line-height 1.45。
block 底部可以有 very subtle metadata line，但第一版可以不显示。

block 内容如果太长，preview 区域使用 overflow hidden 或 overflow auto。公式不要导致整个 block 爆宽，数学内容可以横向滚动。行内公式应与文字自然对齐，块公式居中或左对齐均可，但要稳定。

五、连接点和边

React Flow handles 不要太大。默认隐藏或半透明，hover/selected 时明显。handle 颜色用 #2563eb。边默认颜色 #94a3b8，选中时 #2563eb。边使用 smoothstep，线条宽度 1.5px，选中时 2px。edge label 如果为空不显示；如果有 label，显示为小 pill，背景白色，边框浅灰。

六、富文本编辑器视觉

Tiptap editor 要像 Notion/Google Docs 的轻量版，不要像代码编辑器。编辑区域边框浅灰，圆角 10px，padding 12px，min-height 220px。聚焦时边框变蓝，但不要强烈发光。

固定 toolbar 使用两行或可换行 flex。按钮尺寸小而清楚，active 状态有浅蓝背景。颜色选择器可以用小圆色块 + hex input。字号选择使用 select。Bubble menu 要小，悬浮在选区附近，白色背景、浅阴影、圆角 8px。Bubble menu 不要遮挡文字太严重。

富文本默认样式：
paragraph margin: 0.4em 0
heading 1: 1.35em, font-weight 700
heading 2: 1.15em, font-weight 650
blockquote: left border #cbd5e1, muted text
code: #f3f4f6 background, mono font
link: #2563eb underline
math inline: natural vertical-align
math block: margin 0.75em 0, overflow-x auto

七、状态反馈

保存状态要可信。toolbar 上显示 Saved / Saving / Unsaved / Error。Saving 可以显示小 spinner 或文字。Error 用红色小字。不要用 alert 弹窗显示普通保存状态。

导入、清空这类危险操作必须 confirm。删除单个 block 可以直接 Delete，但按钮删除最好有轻微确认或明显危险样式。

八、响应式

桌面端优先。宽屏时右侧 inspector 固定显示。窄屏时 inspector 可以变成 overlay drawer 或暂时隐藏，但第一版至少不能布局崩溃。iPad 横屏应能正常使用。手机端第一版以查看为主：canvas 能缩放和平移，toolbar 和 inspector 可以简化。不要为了手机端牺牲桌面编辑体验。

九、空状态和示例内容

第一次打开应用时，如果 IndexedDB 没有数据，请自动创建 3 个示例 block 和 2 条连接线，用来展示效果。示例内容要与贝叶斯模型开发相关，例如：

Block 1 title: Open-tail TRACE
content 包含：
Open-tail columns use TRACE-calibrated intercepts.

行内公式：
$$\alpha^U_{hg}\mid\gamma_g,p_{U,g}$$ controls baseline rarity.

块公式：
$$
\mu_{p_{U,g}}(\gamma_g)
=
(1+\tau^2_{p_{U,g}})^{1/2}
\Phi^{-1}\left(\frac{\gamma_g}{\gamma_g+p_{U,g}}\right)
$$

Block 2 title: Catalogue component
content 包含：
Finite catalogue species use identity-aware borrowing, not extreme-value calibration.

Block 3 title: Residual copula
content 包含：
Residual factors enter the Gaussian copula, not the marginal mean.

块公式：
$$
\Omega_W=\Lambda_W\Lambda_W^\top+I,
\qquad
\Sigma_W=\operatorname{diag}(\Omega_W)^{-1/2}
\Omega_W
\operatorname{diag}(\Omega_W)^{-1/2}
$$

这三个示例 block 只在首次没有任何数据时创建。用户清空后不要反复自动创建，除非重新 reset demo。

十、实现注意

不要使用过度复杂的 UI library。Tailwind 足够。可以使用 lucide-react 图标，如果想加入小图标，但不要为了图标引入庞大库。组件结构要清晰，样式尽量可维护。不要把所有 className 写得混乱到不可读；必要时拆成小组件。

最终 UI 看起来应像一个可以长期使用的科研工具，而不是临时 hackathon demo。