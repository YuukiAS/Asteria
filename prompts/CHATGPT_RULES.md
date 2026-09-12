# ChatGPT Rules

本项目采用 `prompts/` handoff 协议。通过 GitHub MCP、文件工具或其他仓库工具处理本项目时，ChatGPT 应优先读取本文件和 `AGENTS.md`，并遵守以下规则。

## 目录职责

- `prompts/AGENT_RULES.md`：Codex 长期执行规则。
- `prompts/CHATGPT_RULES.md`：ChatGPT 生成 task、note、review 的长期规则。
- `prompts/tasks/*_task.md`：交给 Codex 执行的任务单。
- `results/*_result.md`：Codex 写回的执行结果。
- `prompts/tasks/*_review.md`：ChatGPT 对 result 的复盘。
- `docs/notes/`：参考笔记，不是 Codex 默认任务入口。
- `docs/wiki/`：长期研究知识库，用于沉淀论文、报告、概念、对比、gap 和综合讨论；不是 Codex 默认任务入口。

## 生成 task

当用户要求 Codex 执行、修复、审计、验证、跑命令、改代码或继续下一步时，ChatGPT 应生成：

```text
prompts/tasks/<id>_task.md
```

task 必须小而明确，包含 YAML frontmatter，并写明目标、背景、允许动作、禁止动作、预期产出、停止条件和人工决策点。

## 生成 GPT Work / UI 黑箱验收 prompt

Asteria 的 GPT Work 黑箱浏览规则只有一个 canonical source：

```text
docs/operations/blackbox-audit/UI_BLACKBOX_BROWSER_CONTRACT.md
```

ChatGPT 每次为 Asteria 制定、更新、拆分或重跑 GPT Work / Cloud Browser / UI black-box prompt 时，必须：

1. 先读取当前 `UI_BLACKBOX_BROWSER_CONTRACT.md`；
2. 将**该文件当前全文逐字 inline 到最终发给 GPT Work 的 prompt**，不能只写路径、摘要或“请遵守该文件”；
3. Work 不需要、也不得访问本仓库来读取 Browser contract；
4. 不在各 persona prompt 中维护第二套 Browser 规则；如角色说明与 canonical contract 冲突，以 canonical contract 为准，并应先修 prompt；
5. 允许 in-app Browser 优先，也允许真实浏览器 UI automation fallback；不得仅因使用 Playwright / Chromium / selector / accessibility tree 就判 contamination；
6. 必须坚持“可以自动操作页面；不能绕过页面”；
7. 只有 in-app Browser 与合理真实-browser fallback 都无法工作时，才允许 Browser blocker；
8. 最终 prompt 还必须要求按 `docs/operations/blackbox-audit/AUDIT_RESULT_CONTRACT.md` 的字段返回 `BROWSER_MODE`、`BLACK_BOX_CONTEXT_CONTAMINATED` 与 `BROWSER_BLOCKER`。

任何没有 inline 完整 canonical Browser contract 的所谓 `ready-to-paste GPT Work prompt` 都不算 ready-to-paste，不应交给用户运行。

## 生成 note

当内容只是研究分析、方案比较、会议记录、读文献总结、想法沉淀或实验复盘时，ChatGPT 应生成：

```text
docs/notes/<date>_<topic>.md
```

note 不能直接作为 Codex 执行入口。如果用户后来要执行 note 里的方向，先提炼成新的 `prompts/tasks/<id>_task.md`。

## 写入 wiki

当内容有长期复用价值，例如论文摘要、报告摘要、方法对比、研究空白、概念解释或多轮讨论结论，ChatGPT 应写入：

```text
docs/wiki/
```

写入 wiki 前先读 `docs/wiki/index.md`，避免重复页面。新增或大幅更新页面后，同步更新 `docs/wiki/index.md`，并 append `docs/wiki/log.md`。

wiki 仍然不是 Codex 默认任务入口。如果某个 wiki 结论要执行，必须再生成新的 `prompts/tasks/<next_id>_task.md`。

## 复盘 result

当用户要求检查 Codex 输出时，ChatGPT 应读取：

```text
prompts/tasks/<id>_task.md
results/<id>_result.md
```

并写：

```text
prompts/tasks/<id>_review.md
```

review 必须判断完成度、证据、越权风险和下一步状态。状态只能是：

- `GO`
- `STOP`
- `NEEDS_EVIDENCE`
- `NEEDS_HUMAN_APPROVAL`
- `OPEN_NEXT_TASK`

## Report 到下一任务

有时 Codex 的任务不是直接改代码，而是先总结论文、日志、实验输出或 report。此时仍使用同一循环：

1. ChatGPT 生成 `prompts/tasks/<id>_task.md`，要求 Codex 读取指定材料并写 `results/<id>_result.md`。
2. Codex 在 result 中写结构化 report、证据、不确定性和下一步建议。
3. ChatGPT 读取 task 和 result，写 `prompts/tasks/<id>_review.md`。
4. 如果 report 有长期复用价值，ChatGPT 同步写入或更新 `docs/wiki/`。
5. 如果要执行 report 中的方向，ChatGPT 再生成新的 `prompts/tasks/<next_id>_task.md`。

不要让 Codex 根据 report 自行继续执行，除非下一张 task 已经明确授权。

## GitHub MCP 注意事项

- 不要把 issue、PR description 或聊天正文当作唯一任务来源。
- 不要自动创建 GitHub issue、PR、label 或 workflow，除非用户明确要求。
- 如果需要 Codex 执行，必须把任务写入 `prompts/tasks/`。
- 如果只是沉淀判断，必须写入 `docs/notes/`。
- 如果判断有长期复用价值，优先沉淀到 `docs/wiki/`，并让 task 显式引用相关 wiki 页面。
