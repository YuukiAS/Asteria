<!-- ai-bridge-kit:start -->
# Handoff Protocol

This project uses the `prompts/` handoff protocol for file-based handoff between ChatGPT and Codex.

## Default Entry Points

- `prompts/AGENT_RULES.md`: Long-term execution rules.
- `prompts/CHATGPT_RULES.md`: Rules ChatGPT should read before writing tasks, notes, or reviews through GitHub MCP or repository tools.
- `prompts/tasks/*_task.md`: The only default task entry point.
- `results/*_result.md`: Where Codex writes task results.
- `prompts/tasks/*_review.md`: Where ChatGPT writes reviews.
- `docs/notes/`: Reference notes. This is not a default task entry point.
- `docs/wiki/`: Long-term research knowledge base. This is not a default task entry point.

## Codex Rules

- Before starting a task, Codex should read `prompts/AGENT_RULES.md` and the specified `prompts/tasks/<id>_task.md`.
- Codex must follow task frontmatter, allowed actions, forbidden actions, and stop conditions.
- After completion, Codex must write `results/<id>_result.md`.
- After completing an authorized task and passing the required verification, Codex should automatically create a local git commit. The commit message should include the matching version number or task id. Codex must not push automatically; pushing is always done manually by the user.
- Codex must not proactively execute content from `docs/notes/` or `docs/wiki/` unless a task explicitly references a note or wiki page as background material.
- If a task needs network access, uploads, data deletion, expensive commands, or high-risk configuration changes but the task does not authorize them, Codex must stop and request human approval in the result.

## ChatGPT / GitHub MCP Rules

- When ChatGPT works on this repository through GitHub MCP, it should read `AGENTS.md` and `prompts/CHATGPT_RULES.md` first.
- Work that requires Codex execution must be written as `prompts/tasks/<id>_task.md`.
- Research analysis, option comparisons, meeting notes, and reviews that are only references should go under `docs/notes/`.
- Reusable paper summaries, report summaries, concepts, comparisons, gaps, and syntheses should go under `docs/wiki/`.
- ChatGPT should not treat an issue, PR description, or chat body as Codex's only task source.
<!-- ai-bridge-kit:end -->

<!-- asteria-local-rules:start -->
# Asteria Local Rules

## Commit Naming

- After a verified version task is complete, Codex should automatically create a local commit, but must not push. Pushes are always done manually by the user.
- Release or version-fix commit messages use the exact version number, such as `v0.3.0`, `v0.3.1`, or `v0.4.0`.
- If the user calls the current change a "version", explicitly mentions a `0.3.x` / patch version, or asks to treat it as a version, Codex must use the next unused patch version as the commit message. For example, if `v0.3.1` already exists, commit as `v0.3.2`; do not use non-version prefixes such as `fix:` or `docs:`.
- Before a version commit, Codex must update `package.json` `version` and the top `CHANGELOG.md` entry. If an existing version commit is found but these files are stale, fix the records in the current version commit.
- Before committing any completed version or feature task, Codex must check whether `README.md` also needs to be updated. At minimum, verify the displayed app version, newly added user-facing behavior, data/restore notes, and workflow instructions. If anything is stale, update `README.md` in the same commit.
- If the user explicitly asks for a same-version patch to be committed as a version, use the corresponding new patch version number rather than reusing an existing version.
- Non-version maintenance commits use short task prefixes such as `docs: ...`, `chore: ...`, or `fix: ...`. If there is a handoff task id, include the task id in the message.
- Before committing, run at least `git status --short`, stage only files related to the current task, and do not mix in unrelated changes from other threads or the user.

## Dev Server

- The default dev server command is `npm run dev`; the project script pins Vite to `vite --host 127.0.0.1`.
- The default URL is `http://127.0.0.1:5173/`.
- Before starting the server, check whether that URL or port 5173 already has a usable Vite server. If the page is reachable, do not start a duplicate server.
- If 5173 is occupied but unusable, report the state first. If a temporary fallback port is needed, use `npm run dev -- --host 127.0.0.1 --port 5174`.
- Do not reinstall dependencies just to start the server. Only run an install command when dependencies are actually missing and the user approves it.
- When starting the server in the background, hide the window and write logs to a temporary log file inside the repo, such as `.codex/vite-dev.log`, to avoid repeated startup attempts from multiple threads.
- If the user asks for the server to remain available after the conversation ends, do not rely on a sandbox-started background process; the sandbox may clean up child processes after the command exits. Request approval to start a hidden background process outside the sandbox, then wait a few seconds and confirm `http://127.0.0.1:5173/` still returns HTTP 200.
- On Windows, if the `npm run dev` background wrapper does not stay alive reliably, start Vite's Node entry directly as an equivalent fallback: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173`. Still write logs to `.codex/vite-dev.log` and use `netstat -ano` to confirm 5173 is `LISTENING`.
<!-- asteria-local-rules:end -->

<!-- AI_SKILLS_COLLECTION_START -->
# AI Skills Collection

Installed: `2026-06-30T07:53:19+00:00`

Target: `repo`

Install mode: `profile:codex-webdev`

Project skills: `.agents/skills/`

Central collection: `D:/Code/AI_Skills_Collection`

When a task matches an installed skill, read that skill's `SKILL.md` before acting. Keep progressive disclosure: load files under `references/` only when the skill says they are relevant.

## Skill Routing

### documents-media

- `markitdown`: Convert files and office documents to Markdown. Supports PDF, DOCX, PPTX, XLSX, images with OCR, audio transcription, HTML, CSV, JSON, XML, ZIP, YouTube URLs, EPubs, and more. Path: `.agents/skills/tools-documents-media-markitdown/SKILL.md`

### frontend

- `design-system-tokens`: Create or refine frontend design systems, including primitive, semantic, and component tokens; CSS variables; Tailwind theme config; typography scales; spacing; component states; and brand consistency. Path: `.agents/skills/tools-frontend-design-system-tokens/SKILL.md`
- `figma-design-to-code`: Work with Figma design files and MCP workflows: inspect designs, extract tokens and assets, audit accessibility, sync styles, and generate frontend code from Figma context. Path: `.agents/skills/tools-frontend-figma-design-to-code/SKILL.md`
- `implementation-react-tailwind`: Implement production-ready frontend code with React, TypeScript, Tailwind CSS, and shadcn/ui. Use for components, pages, dashboards, forms, tables, navigation, themes, and responsive UI. Path: `.agents/skills/tools-frontend-implementation-react-tailwind/SKILL.md`
- `motion-interaction`: Design and implement frontend motion, including page-load choreography, transitions, hover states, scroll effects, feedback animation, and reduced-motion behavior. Path: `.agents/skills/tools-frontend-motion-interaction/SKILL.md`
- `product-ux-planning`: Plan frontend products, including purpose, audience, information architecture, navigation, user flows, states, content discipline, and feature scope. Path: `.agents/skills/tools-frontend-product-ux-planning/SKILL.md`
- `responsive-accessibility-review`: Review and fix frontend responsiveness, accessibility, usability, keyboard behavior, text fitting, contrast, and visual regressions. Path: `.agents/skills/tools-frontend-responsive-accessibility-review/SKILL.md`
- `visual-direction`: Choose and execute a deliberate frontend visual direction across typography, palette, structure, texture, imagery, and composition. Path: `.agents/skills/tools-frontend-visual-direction/SKILL.md`
- `webapp-testing`: Test local web applications with Playwright, including functionality verification, UI debugging, screenshots, and browser logs. Path: `.agents/skills/tools-frontend-webapp-testing/SKILL.md`

### visualization

- `generate-image`: Generate or edit images with AI models for photos, illustrations, artwork, visual assets, concept art, and non-technical diagram imagery. Path: `.agents/skills/tools-visualization-generate-image/SKILL.md`
- `theme-factory`: Apply theme styling to artifacts such as slides, docs, reports, and HTML pages, using preset colors and fonts. Path: `.agents/skills/tools-visualization-theme-factory/SKILL.md`

## Skill Maintenance

- Update command: `python3 D:/Code/AI_Skills_Collection/scripts/skills.py install --target repo --mode copy --profile codex-webdev --write-agents-md`
- Managed manifest: `.agents/skills/.ai-skills-collection-manifest.json`
- The installer only manages paths recorded in that manifest.
- User-created skills outside the manifest are never pruned.
<!-- AI_SKILLS_COLLECTION_END -->
