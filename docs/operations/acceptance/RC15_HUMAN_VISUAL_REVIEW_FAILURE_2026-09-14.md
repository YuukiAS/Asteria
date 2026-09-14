# Asteria RC.15 Human Visual Review Failure

日期：2026-09-14  
候选版本：`2.0.0-rc.15`

## Verdict

```text
FINAL_HUMAN_ACCEPTANCE = FAIL
PREVIOUS_VISUAL_SELF_QA = INVALIDATED_FOR_CONNECTOR_FINISH
STABLE_RELEASE = BLOCKED
NEXT_VERSION = 2.0.0-rc.16
GPT_WORK = NOT_YET
```

用户在 fixed public URL 强制刷新后仍直接观察到 connector finish 不成熟。截图明确显示页面版本为 `2.0.0-rc.15`，因此这不是 browser cache/stale deployment，而是当前实现本身。

## Human-visible blockers

### 1. Arrowhead 仍显得生硬

Architecture / Lineage / Evidence 继续使用 filled triangular SVG marker。当前代码示例：

- Architecture marker：`markerWidth=8`, `markerHeight=8`, filled triangle；
- Lineage marker：`markerWidth=9`, `markerHeight=9`, filled triangle。

虽然 RC.12–15 已解决 stroke 粗细、endpoint 对齐、routing coordinate-space 等问题，但 filled triangle 本身仍像 generic graph/flowchart，而不是克制的 scientific atlas terminal。

### 2. Lineage multi-relation label grammar 仍生硬

当前 `RelationLabelGroup` 对 TRACE 的 `Extends` / `Preserves` 使用 literal `|` divider：

```text
Extends | Preserves
```

代码中存在显式：

```text
<span className="lineage-relation-divider">|</span>
```

这正是截图中一眼可见的僵硬竖线，不是缓存或 screenshot artifact。

同时当前 label group 使用 outer bordered capsule，再在内部包 bordered chip part，视觉上形成 nested-pill hierarchy；这与 scientific figure 中轻量 relation annotation 的目标不一致。

### 3. 视觉规范此前仍然 under-specified

RC.15 的 `SCIENTIFIC_GRAPH_VISUAL_SYSTEM.md` 规定了 arrow 尺寸和 relation group，但没有明确：

- 禁止 filled triangle；
- canonical terminal shape；
- multi relation 禁止 literal separator；
- label group 不得 outer pill + inner pills 双层边框。

因此 Codex 可以在形式上“conform”但仍产生用户一眼不满意的 visual finish。

该规范已在本轮更新，新增：

- canonical open-chevron arrow terminal；
- no filled triangle；
- active/ordinary arrowhead 同尺寸；
- Lineage multi relation 用 peer capsules + gap，不使用 `|` / `/`；
- relation label group container 只负责定位，不绘制第二层 outer capsule；
- stable visual anti-patterns。

## Scope decision

RC.16 应是**窄范围 connector-terminal / relation-label finish**，不是再次重写 routing/layout。

保护 RC.15 已经改善并通过的部分：

- route geometry / lane packing；
- responsive coordinate space；
- target boundary endpoint；
- Architecture / Evidence card layout；
- Inspector single-scroll / primary inspector visibility；
- scientific truth / trace / session / Evidence truth。

RC.16 只处理：

1. shared canonical open-chevron marker；
2. Architecture / Lineage / Evidence arrow finish；
3. Lineage relation-label group inner grammar；
4. path-label clearance / alignment；
5. developer screenshot self-QA。

完成后先 `CHATGPT_REVIEW_DEVELOPER_SCREENSHOTS`，不要启动 GPT Work。