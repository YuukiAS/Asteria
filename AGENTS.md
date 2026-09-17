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
- After completing an authorized task and passing the required verification, Codex should automatically create a local git commit. The commit message should include the matching version number or task id. Codex must not push automatically unless an explicit instruction or repository standing authorization permits it.
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

- After a verified version task is complete, Codex should automatically create a local commit, but must not push unless an explicit instruction or repository standing authorization permits it.
- Release or version-fix commit messages use the exact version number, such as `v0.3.0`, `v0.3.1`, or `v0.4.0`.
- If the user calls the current change a "version", explicitly mentions a `0.3.x` / patch version, or asks to treat it as a version, Codex must use the next unused patch version as the commit message. For example, if `v0.3.1` already exists, commit as `v0.3.2`; do not use non-version prefixes such as `fix:` or `docs:`.
- Before a version commit, Codex must update `package.json` `version` and the top `CHANGELOG.md` entry. If an existing version commit is found but these files are stale, fix the records in the current version commit.
- Before committing any completed version or feature task, Codex must check whether `README.md` also needs to be updated. At minimum, verify the displayed app version, newly added user-facing behavior, data/restore notes, and workflow instructions. If anything is stale, update `README.md` in the same commit.
- After every completed version/update, Codex must ensure the public/external link is updated when deployment or external publishing is authorized. If the required push, deploy, upload, or link refresh is not authorized, Codex must record the external-link update as a pending manual action in the result or final response.
- External-link updates must use the existing fixed public entry point for this project. Do not create a new temporary public URL, quick tunnel, alternate hosting project, or replacement external link unless the user explicitly asks for a new link. If the fixed entry point or its proxy command cannot be identified, stop and report that blocker instead of substituting another link.
- If the user explicitly asks for a same-version patch to be committed as a version, use the corresponding new patch version number rather than reusing an existing version.
- Non-version maintenance commits use short task prefixes such as `docs: ...`, `chore: ...`, or `fix: ...`. If there is a handoff task id, include the task id in the message.
- Before committing, run at least `git status --short`, stage only files related to the current task, and do not mix in unrelated changes from other threads or the user.

## Fixed External Link

- The fixed public Asteria entry point is `https://asteria.httpwwwcardiacnexus-ukb.com/`. Do not replace it with a random `trycloudflare.com` URL, quick tunnel, alternate hostname, alternate hosting project, or GitHub Pages/static export unless the user explicitly asks for a new external link.
- Runtime/tunnel/dev-server mechanics are owned by `docs/operations/development/RUNTIME_OPERATIONS.md`. Read that file before starting, restarting, diagnosing, or repairing the shared server, fixed tunnel, background connector, token location, status checks, or Cloudflare 1033 recovery.
- Root authority remains: use the fixed public entry point, do not create quick tunnels or alternate public links as a workaround, never print/commit/copy tunnel tokens, and verify the public page plus `/api/asteria/status` after an authorized runtime repair.

## GPT Work / UI Black-Box Browser Contract

- Asteria 的 GPT Work / Cloud Browser / UI 黑箱审计只有一个 Browser 合规真值源：`docs/operations/blackbox-audit/UI_BLACKBOX_BROWSER_CONTRACT.md`。
- ChatGPT 每次制定、更新、拆分、重跑或交付任何 Asteria GPT Work 黑箱 prompt 前，必须先读取该文件；只要该文件仍是项目 contract，就必须把**该文件当前全文逐字 inline 到最终发给 GPT Work 的 prompt**。只写文件路径、摘要或“请遵守该文件”不合规。
- 核心规则始终是：`可以自动操作页面；不能绕过页面。`
- Browser fallback、timeout、contamination、result-field mechanics 由 canonical Browser contract 负责，不在 root 维护第二份规则。
- Developer visual self-QA、scientific graph / trace 规则和 generic-fix 入口继续从 `prompts/AGENT_RULES.md` 读取。

## Acceptance Gate: GPT Work Before Human Review

Asteria 的 release / RC 验收顺序固定为：

```text
Codex implementation / repair
  -> automated regression + browser QA
  -> refresh fixed public URL
  -> GPT Work black-box campaign
  -> ChatGPT consolidated triage
  -> 如有 reviewer FAIL/BLOCKED 或 unresolved must-fix P2，继续 repair
  -> 所有 designated GPT Work reviewers PASS
  -> P0 = 0, P1 = 0, unresolved must-fix P2 = 0
  -> user final human acceptance
  -> stable release
```

- 在 GPT Work gate 通过前，不要要求用户打开页面做人工验收。先让独立 GPT Work 找出明显问题，避免浪费用户时间。
- “所有 reviewer PASS” 是硬 gate：当前 campaign 的每个指定 reviewer 都必须返回 `AUDIT_RESULT = PASS`。PASS 可以包含少量 P2/P3，但 ChatGPT consolidated triage 必须把每个 P2 明确归类为 `must-fix` 或 `accepted/deferred`；只要还有 unresolved must-fix P2，就不能进入人工验收。
- 一次 repair 如果广泛影响 math/layout/theme/state/search/inspector/accessibility 等多个 surface，应重跑完整 campaign。只有窄修复才可以由 consolidated triage 明确指定只重跑受影响 reviewer + release red-team。
- 用户人工验收是 GPT Work 全部通过后的最终产品判断，不是替代黑箱 QA 的步骤。

## Verification And Regression Coverage

- Every code fix must include or update relevant automated validation or regression coverage before it is considered complete. Run the matching checks before committing. If automated coverage is not feasible for a fix, document the reason and any manual verification performed in the result file.
- For every bug fix, prepare a corresponding regression script by adding or updating an `npm run test:*` command and a focused script under `scripts/` whenever feasible. The script must directly exercise the reported failure mode and assert that the bug does not recur; generic smoke checks are not enough. Do not treat code edits alone, manual clicking alone, or a passing build alone as sufficient regression coverage.
- Keep a cumulative regression entry point such as `npm run test:regression` current. Before every future version commit, run the new/changed fix-specific script and the cumulative regression script so older fixed issues are rechecked. If a scripted check is genuinely infeasible, document the exception, reason, and manual verification evidence in the matching `results/*_result.md` file before committing.

## Dev / Runtime Operations

- Development server, shared runtime, fixed tunnel, background connector,
  Windows fallback and status-check mechanics are owned by
  `docs/operations/development/RUNTIME_OPERATIONS.md`.
- Root invariant: do not start duplicate servers, do not reinstall dependencies
  merely to start a server, and do not substitute a temporary public URL for the
  fixed Asteria entry point unless the user explicitly asks.

## Git push standing authorization

For this repository, ordinary `git push` commands are permanently authorized and must not be sent to manual approval, Auto-review, Guardian, or another approval reviewer.

After completing requested work, validation, and a normal commit, the agent may push the current branch to the existing origin without asking for separate confirmation.

This authorization does not permit the agent to autonomously use force push, force-with-lease, delete remote branches or tags, rewrite published history, or change Git remotes. Those operations still require an explicit user instruction.

### Local git operation rule

All source changes for this repository must stay in the active `/home/yuukias/code/Asteria` worktree.

In the Codex Desktop workspace sandbox, `.git` may be protected as read-only. If `git status`, `git add`, `git commit`, `git fetch`, or `git push` needs to write Git index, lock, credential, or remote-tracking ref files, use the approved local git escalation path for the active `/home/yuukias/code/Asteria` worktree instead of changing the workflow.

Do not replace the normal local commit/push workflow with a temporary clone, GitHub connector contents-API commit, or other remote-only update path merely because sandboxed `.git` writes are blocked. Those alternatives are allowed only when the user explicitly requests that mechanism after being told it will not use the current worktree's local Git history.
<!-- asteria-local-rules:end -->
