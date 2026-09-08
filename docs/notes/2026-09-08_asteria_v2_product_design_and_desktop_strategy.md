# Asteria 2.0 产品设计、交互与桌面化策略

日期：2026-09-08
性质：产品与平台参考。它不冻结具体像素布局；语义架构优先于视觉重设计。

## 1. 设计目标

Asteria 2.0 的视觉升级不能只是把 1.x 变得更“炫”。真正有价值的交互是让复杂统计结构变得容易理解：

- 点击一个量，关系马上可见；
- 从局部继续追踪，不需要手动在无限画布上找；
- 层级切换后，画面仍有稳定阅读顺序；
- 模型 variant 的变化一眼可辨；
- 长公式和解释仍可舒适阅读；
- 大图不因动画、阴影、全量重渲染而卡顿。

因此产品设计顺序是：**信息结构 → interaction states → visual system → motion → desktop shell**。

## 2. 推荐 app shell

当前 React Flow 主画布继续作为中心。2.0 默认信息架构建议为：

```text
┌──────────────────────────────────────────────────────────────┐
│ Top command bar: project / view / version / search / export │
├─────────────┬───────────────────────────────┬────────────────┤
│ Left rail   │                               │ Right inspector│
│ Project     │       Architecture Canvas     │ Symbol/Object  │
│ View        │                               │ Definition     │
│ Layers      │                               │ Trace / Usage  │
│ Outline     │                               │ Variant / Src  │
│             │                               │                │
└─────────────┴───────────────────────────────┴────────────────┘
```

不是所有左侧内容都永久展开。建议是窄 rail + 可展开 panel；中心 canvas 始终拥有最大面积。Story Outline 仍保留，但不和 Architecture Outline 混成一个列表。

精确 width、panel docking、toolbar 密度和 light/dark 色板先不锁死；使用 image prompt library 生成概念图后再决定。

## 3. 核心交互状态

### 3.1 Neutral state

- canvas 以 model layer 与关键实体为主；
- 边低对比、可读但不抢；
- inspector 显示当前 selected object；
- 用户可以平移/缩放/编辑。

### 3.2 Symbol Trace state

点击 canonical symbol 后：

1. 当前对象明显但克制地提亮；
2. direct parents 与 children 立即强调；
3. 关系边按方向给出短暂流动提示；
4. 非相关节点只轻微降低对比，不完全消失；
5. inspector 切到 Symbol/Trace；
6. 用户可点 `Expand upstream` / `Expand downstream` 递归一层；
7. `Esc` 或背景点击返回 neutral。

不建议一次递归展开全部图；复杂模型会造成视觉爆炸。

### 3.3 Layer Focus state

选择 `Observation`, `Parameterization`, `Inference`, `Prediction` 等层时：

- 当前层节点保持；
- 与前后邻层相连的 boundary nodes 可保留；
- camera 可轻微 fit；
- outline 同步滚动到该层；
- 不改变 node 的 canonical definition。

### 3.4 Formula Hover / Binding state

在 rich text 或 equation 中 hover/click 已绑定 token：

- 对应 symbol entity 在 canvas 中 pulse 一次；
- inspector 显示 symbol；
- `Where used` 可列出其他 formula/entity；
- 编辑模式下可重新绑定 token。

第一版不做全自动 LaTeX AST 编辑器。

### 3.5 Variant Diff state

切换版本时，不仅隐藏/显示 block：

- added：短暂出现/淡入；
- removed：显示 ghost/outline 或 diff panel 记录；
- modified definition：对象保持位置，definition 标记 changed；
- relation change：对应边短暂强调；
- unchanged：不做干扰动画。

## 4. Motion 规范

“Fancy JS”应服务理解。推荐 motion tokens：

- selection highlight：120–180ms；
- direct trace reveal：180–260ms；
- camera pan/zoom：220–350ms；
- panel open/close：160–220ms；
- variant diff：250–400ms；
- recursive trace 每层 delay 40–70ms，总时长要封顶。

只用 `transform`, `opacity`, SVG stroke/path emphasis、React Flow viewport animation、CSS/WAAPI 等轻量方式。不要默认引入：

- Three.js；
- 大型 physics engine；
- 持续粒子系统；
- 每帧 JS layout；
- 对所有 edge 持续 dash animation。

必须支持 `prefers-reduced-motion`。

## 5. 视觉系统方向

建议保留 Asteria 的“celestial / scientific atlas”身份，但减少 1.x 中可能出现的“所有东西都是卡片”的感觉。

原则：

- canvas 本身是视觉主角；
- layer 可以用非常轻的 band / label / spatial zoning 表达，而不是大框套大框；
- semantic node 分成轻量节点与说明 block 两种视觉密度；
- 公式节点要像科研排版，不像 dashboard metric card；
- inspector 更像 IDE/object browser，而不是 form dashboard；
- edge type 通过 line treatment + subtle icon/label 表达，不能用十几种颜色；
- dark mode 可以有非常轻的星图/深蓝背景；light mode 更像纸张/科学图谱。

## 6. Image-first 设计流程

如果某一轮需要明显改 shell/layout，先用 `docs/notes/2026-09-08_asteria_v2_image_prompt_library.md` 生成完整 app concept，而不是先让 Codex凭感觉改 CSS。

建议流程：

1. 生成 3 套 primary-screen concepts；
2. 对 Symbol Trace / Variant Diff / Layer Focus 各生成 1 个 state；
3. 用当前功能清单检查是否漏掉 toolbar、canvas、inspector、outline；
4. 选一个方向后提取 design tokens；
5. 再实现；
6. 浏览器 screenshot 与 concept 对照验证。

用户时间有限，因此**只有大幅 layout 分歧**才需要中途人工选择。一般组件细节由 Codex按已选方向自行收敛。

## 7. Figma 何时有价值

Figma 不是当前必需步骤。

优先不使用 Figma 的情况：

- 语义 schema 尚未稳定；
- 只是在现有 shell 内新增 inspector/trace；
- interaction state 比静态像素稿更重要；
- Codex能通过 image concept + browser screenshot 直接实现。

考虑使用 Figma 的情况：

- 2.0 shell 已基本确定，需要固定 spacing/component/token；
- 需要大量 reusable inspector rows / menus / dialogs；
- desktop 与 web 要共享明确 design system；
- 最终视觉验收需要可编辑设计源。

即使使用 Figma，canonical statistical schema 仍在代码/JSON 中，不以 Figma 图层作为模型语义来源。

## 8. Web 与 desktop 的共同核心

2.0 domain code 必须保持纯 TypeScript、平台无关：

```text
src/architecture/*       # pure domain/schema/index/validation
src/features/*           # React UI
src/platform/web/*       # Dexie/shared API/browser file
src/platform/desktop/*   # future Tauri adapter
```

不要在 entity/schema 层调用 `window`, `indexedDB`, `navigator.clipboard` 或 Tauri API。

推荐 adapter：

```ts
interface PersistenceAdapter {
  loadProject(): Promise<ArchitectureProjectV2 | null>
  saveProject(project: ArchitectureProjectV2): Promise<void>
  createBackup(project: ArchitectureProjectV2): Promise<string>
  listBackups(): Promise<BackupMeta[]>
}

interface FileAdapter {
  openJson(): Promise<string | null>
  saveText(name: string, content: string): Promise<void>
}
```

## 9. 桌面方案判断

### 首选：Tauri 2

理由：

- 现有 React/Vite UI 可直接复用；
- 依赖系统 WebView，通常比 Electron 的 bundled Chromium 更轻；
- 可以只为文件系统、窗口、原生菜单、自动更新等能力增加 Rust command/plugin；
- Asteria 不是需要 Node runtime 的 IDE，因此没有必要为了少数 native API 把整个 Chromium/Node 一起打包。

### Electron 作为 fallback

只有出现以下硬需求才重新评估：

- 必须绑定特定 Node-only library；
- 必须保证完全一致的 Chromium rendering，而系统 WebView 差异不可接受；
- Tauri 对某个关键 PDF/窗口/插件能力长期不满足。

### 不建议

不要同时维护 Electron 与 Tauri 两套 desktop shell。Web core + 一套 desktop adapter 足够。

## 10. Desktop release 不阻塞 2.0

2.0 stable 首先要证明“统计架构地图”本身值得用。桌面化属于 2.x 平台层，建议在以下条件满足后进入：

- schema v2 已稳定；
- local import/export 稳定；
- persistence adapter 已抽象；
- 关键 keyboard workflow 已稳定；
- browser version 已无明显性能问题。

桌面 prototype 的验收重点是：启动速度、内存、文件打开/保存、窗口恢复、快捷键、离线运行和 installer 体积；不是新增另一套功能。