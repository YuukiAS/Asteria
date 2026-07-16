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
- Always run dev-server commands from the repository root so Vite resolves the local `package.json` and `vite.config.ts` correctly. If launching through a wrapper, background runner, or sandboxed environment, make the working directory explicit before running `npm run dev`.
- Before starting the server, check whether that URL or port 5173 already has a usable Vite server. If the page is reachable, do not start a duplicate server.
- If 5173 is occupied but unusable, report the state first. If a temporary fallback port is needed, use `npm run dev -- --host 127.0.0.1 --port 5174`.
- Do not reinstall dependencies just to start the server. Only run an install command when dependencies are actually missing and the user approves it.
- If startup fails with a Vite temp-file or permission error, first retry `npm run dev` in a normal foreground terminal session from the repo root. Treat this as a way to distinguish a project problem from a constrained environment that blocks Vite from writing temporary config files.
- When starting the server in the background, hide the window and write logs to a temporary log file inside the repo, such as `.codex/vite-dev.log`, to avoid repeated startup attempts from multiple threads.
- If the user asks for the server to remain available after the conversation ends, do not rely on a sandbox-started background process; the sandbox may clean up child processes after the command exits. Request approval to start a hidden background process outside the sandbox, then wait a few seconds and confirm `http://127.0.0.1:5173/` still returns HTTP 200.
- On Windows, if the `npm run dev` background wrapper does not stay alive reliably, start Vite's Node entry directly as an equivalent fallback: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173`. Still write logs to `.codex/vite-dev.log` and use `netstat -ano` to confirm 5173 is `LISTENING`.
<!-- asteria-local-rules:end -->
