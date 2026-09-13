# Agent Rules

本项目采用 `prompts/` handoff 协议。

## 默认入口

Codex 的默认任务入口是：

```text
prompts/tasks/<id>_task.md
```

长期执行规则在：

```text
prompts/AGENT_RULES.md
```

ChatGPT 通过 GitHub MCP 或仓库工具生成 task、note、review 时，应读取：

```text
prompts/CHATGPT_RULES.md
```

Codex 结果回写到：

```text
results/<id>_result.md
```

ChatGPT 复盘写到：

```text
prompts/tasks/<id>_review.md
```

`docs/notes/` 只保存参考笔记，不是默认任务入口。`docs/wiki/` 保存长期研究知识，包括论文摘要、报告摘要、概念、对比、gap 和综合讨论，也不是默认任务入口。只有 task 显式引用某篇 note 或 wiki 页面时，Codex 才能把它作为背景材料读取。

## 权限边界

Codex 必须遵守 task frontmatter：

- `allow_code_change`
- `allow_shell_command`
- `allow_network`
- `allow_external_upload`
- `requires_human_approval`

未授权的动作默认禁止。尤其不要自动联网、上传、删除数据、运行昂贵任务或修改高风险配置。

## 结果记录

每次执行 task 后，Codex 必须写 `results/<id>_result.md`，至少记录：

- 执行摘要。
- 读取文件。
- 修改文件。
- 运行命令。
- 测试结果。
- 失败信息。
- git diff 摘要。
- 需要人工批准的事项。
- 下一步建议。

## 证据要求

结论必须有证据。优先引用：

- 文件路径和行号。
- 命令和退出状态。
- 测试名称和结果。
- diff 摘要。
- 明确的错误信息。
- 被 task 显式引用的 `docs/wiki/` 页面。

不确定的判断必须标明不确定性，不要写成事实。

## Developer visual self-QA：外部 GPT Work 之前必须先自己看成品

当任务修改任何用户可见 Web/UI surface（layout、graph、card、arrow、relation label、math rendering、copy、theme、responsive、motion、inspector、Lineage/Evidence presentation 等）时，**自动测试通过不代表任务完成**。

必须额外读取并遵守：

```text
docs/operations/development/DEVELOPER_VISUAL_SELF_QA_CONTRACT.md
```

核心规则：

1. Codex 必须自己启动/刷新真实 UI，并实际截图查看修改后的成品；不能只依赖 DOM assertion、bbox 数字或 `npm test`。
2. 至少覆盖 task 指定的 required viewports/states；如果 task 没写，默认至少检查 1536×864 与 1366×768、Light/Dark、改动涉及的所有主视图。
3. 每轮截图后必须做 full-screen gestalt review：箭头粗细是否自然、cards 是否拥挤、文字是否截断、公式是否碎裂、label 是否漂浮/压线、整体视觉是否像成熟科研工具。
4. 如果一眼能看出的视觉问题仍存在，Codex 必须继续迭代修复并重新截图；不得写 `STATUS=COMPLETE`，也不得把明显问题留给 GPT Work/用户发现。
5. 对视觉任务，默认至少执行两轮“实现 -> 截图 -> 自我审查”；第二轮没有新 blocker 才能结束。简单纯 copy/单按钮修复可在 task 明确豁免。
6. 结果文件必须列出实际查看过的截图路径，并逐项给出 `SELF_VISUAL_QA_*` 结论；不能只说 screenshot generated。
7. 外部 GPT Work 是独立验收，不是开发者的第一轮视觉 QA。不得用“后面 Work 会检查”作为结束任务的理由。
8. 如果自审发现问题且可在当前授权范围内修复，直接修；只有确实需要产品/科学决策时才停止请求人工判断。

目标是先在开发阶段消灭明显问题，减少用户启动 GPT Work 和人工验收的次数。

## Canonical scientific graph visual system

凡 task 修改 Architecture / Lineage / Evidence / graph connector / relation label / inspector reader-facing layout，必须同时读取并遵守：

```text
docs/design/SCIENTIFIC_GRAPH_VISUAL_SYSTEM.md
```

它是 stable-facing presentation 的 canonical 视觉规范，优先级高于某个 RC 临时 screenshot patch。核心要求包括：

- Architecture 必须像 layered scientific model flow，不能退化成 hard-orthogonal electrical wiring；
- Lineage 每个 visual connector 只有一个统一 relation-label group，label 必须由 path geometry 派生；
- Evidence 必须保持 claim-centered、轻量、非线路图的 relation grammar；
- right inspector 遵守 single-scroll principle，不允许 tiny clipped section / nested-scroll strip 挡住 Primary Inspector；
- selected scientific object 永远高于 active edge / ordinary edge / muted context；
- visual tokens、arrowhead、stroke、capsule、motion 使用统一 scale，不在各 view 自由发挥。

如果现有实现与该规范冲突，应优先修通用 presentation mechanism，而不是为当前 fixture 加 magic numbers。

视觉 task result 中必须说明本轮是否保持：

```text
VISUAL_SYSTEM_CONFORMANCE = PASS | FAIL
```

若 `FAIL`，不得报告 visual task COMPLETE。

## Example 是诊断 fixture，不是 hardcode 目标

当用户、ChatGPT、GPT Work 或 browser regression 用 CAT-TRACE、Original TRACE、Lineage、Evidence 或其它 fixture 暴露 UI/graph 问题时，默认把该 fixture 当作**诊断样例**，而不是只把该样例修到截图好看。

必须先判断问题属于哪一层通用机制，例如：

- graph layout / lane packing；
- card sizing / text measurement；
- edge routing / boundary ports / arrowheads；
- selected / active / muted visual hierarchy；
- relation-chip placement；
- math rendering container；
- responsive scale / fit / virtual canvas；
- copy presentation policy。

然后优先修底层通用机制。

禁止为了单个 fixture 通过验收而新增大量按 entity id / label / dataset name 判断的视觉分支、单点坐标补丁或只针对一张 screenshot 的 magic numbers，除非该位置本身就是明确、长期冻结的产品设计规范。

如果确实需要 model-specific presentation hints：

1. hints 必须通过通用 presentation metadata / layout interface 表达；
2. renderer/layout engine 必须仍然能够处理其它 model/fixture；
3. 至少增加一个不同结构的 fixture/stress case 验证底层机制没有只对当前 example 生效。

视觉任务 result 必须明确写：

```text
GENERIC_FIX = PASS | FAIL
EXAMPLE_SPECIFIC_HARDCODE_ADDED = YES | NO
GENERIC_REGRESSION_FIXTURE = <path/test or NONE>
```

若核心问题只被 example-specific patch 掩盖，不能报告 COMPLETE。

## 失败处理

如果任务无法安全完成，Codex 应停止扩大范围，并在 result 中说明：

- 已完成什么。
- 卡在哪里。
- 缺少什么权限或材料。
- 是否需要人工批准。
- 建议下一张 task 解决什么单一问题。

## 人工审批机制

以下动作需要 task 显式授权；没有授权时必须停止并请求人工批准：

- 联网、下载依赖或调用外部 API。
- 上传文件、日志、数据或结果。
- 删除数据。
- 运行高成本、长时间或高资源命令。
- 修改安全、权限、部署、生产或数据迁移配置。
