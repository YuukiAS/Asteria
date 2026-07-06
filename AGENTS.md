<!-- ai-bridge-kit:start -->
# Handoff Protocol

本项目采用 `prompts/` handoff 协议，用于 ChatGPT 和 Codex 之间的文件化交接。

## 默认入口

- `prompts/AGENT_RULES.md`：长期执行规则。
- `prompts/CHATGPT_RULES.md`：ChatGPT 通过 GitHub MCP 或仓库工具写 task、note、review 时应读取的规则。
- `prompts/tasks/*_task.md`：唯一默认任务入口。
- `prompts/tasks/*_result.md`：Codex 的结果回写位置。
- `prompts/tasks/*_review.md`：ChatGPT 的复盘位置。
- `docs/notes/`：参考笔记目录，不是默认任务入口。
- `docs/wiki/`：长期研究知识库，不是默认任务入口。

## Codex 行为规则

- Codex 开始任务前应读取 `prompts/AGENT_RULES.md` 和指定的 `prompts/tasks/<id>_task.md`。
- Codex 必须遵守 task frontmatter、允许动作、禁止动作和停止条件。
- Codex 完成后必须写 `prompts/tasks/<id>_result.md`。
- Codex 完成已授权任务并通过必要验证后，应自动创建本地 git commit；commit message 应包含对应版本号或任务 id。Codex 不应自动 push，push 由用户手动执行。
- Codex 不应主动执行 `docs/notes/` 或 `docs/wiki/` 中的内容，除非任务单显式引用某篇 note 或 wiki 页面作为背景材料。
- 如果任务需要联网、上传、删除数据、运行昂贵命令或修改高风险配置，但 task 没有授权，Codex 必须停止并在 result 中请求人工批准。

## ChatGPT / GitHub MCP 行为规则

- ChatGPT 通过 GitHub MCP 处理本仓库时，应先读取 `AGENTS.md` 和 `prompts/CHATGPT_RULES.md`。
- 需要 Codex 执行的内容必须写成 `prompts/tasks/<id>_task.md`。
- 只作参考的研究分析、方案比较、会议记录和复盘应写到 `docs/notes/`。
- 有长期复用价值的论文摘要、报告摘要、概念、对比、gap 和综合讨论应写到 `docs/wiki/`。
- ChatGPT 不应把 issue、PR description 或聊天正文当作 Codex 的唯一任务来源。
<!-- ai-bridge-kit:end -->

<!-- asteria-local-rules:start -->
# Asteria Local Rules

## Commit Naming

- 完成已验证的版本任务后，Codex 应自动创建本地 commit，但不得自动 push；push 始终由用户手动完成。
- 版本发布或版本修复的 commit message 使用精确版本号：`v0.3.0`、`v0.3.1`、`v0.4.0`。
- 同一版本内的补丁如果用户明确要求作为版本提交，也使用对应的新 patch 版本号，不要复用已经存在的版本号。
- 非版本化维护提交使用简短任务前缀：`docs: ...`、`chore: ...`、`fix: ...`；如果有 handoff task id，message 应包含 task id。
- 提交前至少确认 `git status --short`，只 stage 当前任务相关文件，不要把其他 thread 或用户的未相关改动混入 commit。

## Dev Server

- 默认开发服务器命令是 `npm run dev`，项目脚本已固定 `vite --host 127.0.0.1`。
- 默认访问地址是 `http://127.0.0.1:5173/`。
- 启动前先检查该地址或 5173 端口是否已有可用 Vite server；如果页面可访问，不要重复启动服务器。
- 如果 5173 已被占用但不可用，先报告状态；需要临时备用端口时使用 `npm run dev -- --host 127.0.0.1 --port 5174`。
- 不要为启动服务器而重新安装依赖；只有依赖确实缺失且用户批准后才运行安装命令。
- 后台启动时应隐藏窗口，并把日志写到 repo 内的临时日志文件，例如 `.codex/vite-dev.log`，避免多个 thread 反复尝试同一启动路径。
<!-- asteria-local-rules:end -->

<!-- AI_SKILLS_COLLECTION_START -->
# AI Skills Collection

Installed: `2026-06-30T07:53:19+00:00`
Target: `repo`
Install mode: `profile:codex-webdev`
Project skills: `.agents/skills/`
Central collection: `D:/Code/AI_Skills_Collection`

When a task matches an installed skill, read that skill's `SKILL.md` before acting. Keep progressive disclosure: load `references/` only when the skill says they are relevant.

## Skill Routing

### documents-media
- `markitdown`: Convert files and office documents to Markdown. Supports PDF, DOCX, PPTX, XLSX, images (with OCR), audio (with transcription), HTML, CSV, JSON, XML, ZIP, YouTube URLs, EPubs and more. Path: `.agents/skills/tools-documents-media-markitdown/SKILL.md`

### frontend
- `design-system-tokens`: Create or refine frontend design systems: primitive, semantic, and component tokens; CSS variables; Tailwind theme config; typography scales; spacing; component states; brand consistency. Use when making reusable UI s... Path: `.agents/skills/tools-frontend-design-system-tokens/SKILL.md`
- `figma-design-to-code`: Work with Figma design files and MCP workflows: inspect designs, extract tokens/assets, audit accessibility, sync styles, and generate frontend code from Figma context. Use when Figma, design handoff, or design-to-cod... Path: `.agents/skills/tools-frontend-figma-design-to-code/SKILL.md`
- `implementation-react-tailwind`: Implement production-ready frontend code with React, TypeScript, Tailwind CSS, and shadcn/ui. Use for components, pages, dashboards, forms, tables, navigation, themes, and responsive UI implementation. Path: `.agents/skills/tools-frontend-implementation-react-tailwind/SKILL.md`
- `motion-interaction`: Design and implement frontend motion: page-load choreography, transitions, hover states, scroll effects, feedback animation, and reduced-motion behavior. Use when adding or reviewing animation and interaction polish. Path: `.agents/skills/tools-frontend-motion-interaction/SKILL.md`
- `product-ux-planning`: Plan frontend products before implementation: purpose, audience, information architecture, navigation, user flows, states, content discipline, and feature scope. Use when starting a new app/page, redesigning UX, or re... Path: `.agents/skills/tools-frontend-product-ux-planning/SKILL.md`
- `responsive-accessibility-review`: Review and fix frontend responsiveness, accessibility, usability, keyboard behavior, text fitting, contrast, and visual regressions. Use before shipping UI or when asked to improve UX quality. Path: `.agents/skills/tools-frontend-responsive-accessibility-review/SKILL.md`
- `visual-direction`: Choose and execute a deliberate frontend visual direction across typography, palette, structure, texture, imagery, and composition. Use when designing or restyling frontend UI and avoiding generic AI-looking output. Path: `.agents/skills/tools-frontend-visual-direction/SKILL.md`
- `webapp-testing`: Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs. Path: `.agents/skills/tools-frontend-webapp-testing/SKILL.md`

### visualization
- `generate-image`: Generate or edit images using AI models (FLUX, Nano Banana 2). Use for general-purpose image generation including photos, illustrations, artwork, visual assets, concept art, and any image that is not a technical diagr... Path: `.agents/skills/tools-visualization-generate-image/SKILL.md`
- `theme-factory`: Toolkit for styling artifacts with a theme. These artifacts can be slides, docs, reportings, HTML landing pages, etc. There are 10 pre-set themes with colors/fonts that you can apply to any artifact that has been crea... Path: `.agents/skills/tools-visualization-theme-factory/SKILL.md`

## Skill Maintenance

- Update command: `python3 D:/Code/AI_Skills_Collection/scripts/skills.py install --target repo --mode copy --profile codex-webdev --write-agents-md`
- Managed manifest: `.agents/skills/.ai-skills-collection-manifest.json`
- The installer only manages paths recorded in that manifest.
- User-created skills outside the manifest are never pruned.
<!-- AI_SKILLS_COLLECTION_END -->
