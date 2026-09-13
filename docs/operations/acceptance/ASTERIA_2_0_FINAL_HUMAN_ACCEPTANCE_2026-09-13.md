# Asteria 2.0 final human acceptance

日期：2026-09-13  
候选版本：`2.0.0-rc.8`  
固定入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`

## 目标

GPT Work black-box gate 已通过。此处不再让用户重复做技术 QA；人工验收只判断：这个产品是否已经达到你愿意正式称为 Asteria 2.0 的程度。

建议总耗时：5–10 分钟。

## 最终人工验收清单

### 1. 第一眼

打开固定公网入口后确认：

- 直接进入 Asteria 2.0；
- 默认是 `CAT-TRACE / Architecture / CAT-TRACE Frozen V2 / Overview`；
- 没有 1.x startup modal / legacy canvas；
- 第一眼像 scientific model atlas，而不是开发 debug dashboard。

### 2. Architecture

在 CAT-TRACE Overview：

- 主要模型故事能够读懂；
- `𝒦`、`𝒰`、`β^U_gh`、`γ_g`、`p_g`、`Σ_W` 能找到；
- Inspector 的 Meaning / Why it matters / canonical definition 读起来合理；
- 点 `Show trace`，确认 selected/upstream/downstream 的视觉层级自然；
- `Clear/Reset` 后 trace 真正关闭。

切 `Full model`：

- 接受它更密；
- Zoom / Fit / Pan 足以查看局部；
- 回 Overview 后恢复为干净状态。

### 3. Original TRACE ↔ CAT-TRACE

切到 Original TRACE，再切回 CAT-TRACE：

- 中央 Architecture 明显是两个不同模型；
- Original TRACE 不出现 CAT-only catalogue/grouped-tail objects；
- Semantic Diff 对“新增 / 修改 / 保留”有实际帮助。

### 4. Lineage / Evidence

Lineage：

- 能一眼理解 TRACE / HMSC / bigMVP / factor/MGP 与 CAT-TRACE 的关系；
- 不像 citation popularity graph，也不暗示机械拼接。

Evidence：

- claim / proof / implementation / datasets / gaps 分得清；
- Finland fungi、Malagasy arthropods、South-West Australia plants 仍保持 pending real-data closure；
- marked discovery theorem 仍是 Pending；
- 没有假装研究结果已经完成。

### 5. 日常使用感

快速检查：

- Search 能找到对象、跨 view 导航自然；
- Dark / Light 都可接受；
- Advanced / Export 默认不干扰，但需要时能打开；
- Save/Restore 核心 model/view/detail/trace state 可用；
- 1366 级别普通笔记本宽度没有明显难用。

## 不应阻塞 2.0 stable 的已知项

除非你本人实际使用时觉得明显不可接受，否则以下不再自动返工：

- 1366 Lineage selected target 的轻微边缘 composition；
- Save/Restore 不恢复 theme；
- 更强 onboarding / reading mode；
- claim-specific Evidence 文案进一步细化；
- exact-symbol search ranking；
- desktop/Tauri/Electron。

## 最终判定

如果整体满意，回复：

```text
FINAL_HUMAN_ACCEPTANCE = PASS
```

然后执行 `prompts/tasks/asteria_v2_release_task.md`，仅将 RC.8 晋升为 `2.0.0` stable，不新增功能。

如果发现阻断问题，回复：

```text
FINAL_HUMAN_ACCEPTANCE = FAIL
BLOCKER = <一句话描述>
```

只针对该 blocker 开下一张窄 repair task。