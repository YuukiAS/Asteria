# Asteria RC.15 Human Visual Review Failure

日期：2026-09-14  
候选版本：`2.0.0-rc.15`

## Verdict

```text
FINAL_HUMAN_ACCEPTANCE = FAIL
PREVIOUS_VISUAL_SELF_QA = INVALIDATED_FOR_CONNECTOR_AND_ROUTE_FINISH
STABLE_RELEASE = BLOCKED
NEXT_VERSION = 2.0.0-rc.16
GPT_WORK = NOT_YET
```

用户在 fixed public URL 强制刷新后确认页面为 `2.0.0-rc.15`。因此以下问题不是 cache/stale deployment，而是当前实现本身。

本次重新仔细审查了三张主截图：Architecture、Lineage、Evidence。之前仅把问题归结为 filled arrowhead 与 `Extends | Preserves` divider 过窄；实际还有更重要的 connector-contact / route-quality 问题。

## 1. Architecture：不是只有箭头形状问题

### 1.1 多条 connector 在 card 周围有“贴边/擦边”感

截图中 selected `beta^U_gh` 周围多条 relation 在进入/离开相邻 card 时，terminal segment 与 card side 的关系不够干净：

- 有的 path 在 card 附近先沿边平行运行，再出现 terminal；
- 多条入边在同一局部区域拥挤，虽然 bbox 不碰撞，但视觉上像 route engine 自动拼接；
- edge endpoint 正确并不等于 contact grammar 正确。

Stable-facing 要求：只有 final arrow tip 在 target border 单点接触；final 12–20px terminal stub 近似垂直 target side；其它 path body 保持 clearance。

### 1.2 route scoring 缺少 edge-edge crossing / border-hug / terminal-angle 约束

RC.15 route scoring 已考虑 length、bend、backward movement、detour、third-party proximity、port penalty，但截图仍显示 route 选择主要以“避开 card”为目标，不足以保证 editorial graph quality。

下一轮 route scoring 必须加入：

```text
edge_edge_crossing_penalty
card_border_hug_penalty
terminal_angle_penalty
region_change_penalty
```

并把已 routed edges 当作 soft obstacles。

## 2. Lineage：箭头与 relation label 都需要统一 finish

### 2.1 Filled triangle 仍然像 generic flowchart

Architecture / Lineage / Evidence 仍使用 filled triangular marker。下一版统一改为小型 open-chevron terminal。

### 2.2 TRACE multi-relation label 使用 literal pipe

当前稳定界面显示：

```text
Extends | Preserves
```

代码里真的渲染 literal `|`。这不是字体问题，而是 presentation grammar 错误。

必须改为同一 path-derived group 中两个平级 capsule：

```text
[ Extends ]  [ Preserves ]
```

outer group 只负责定位，不再画第二层 pill。

### 2.3 每个 connector 的 label 与 path 需要一致 normal-offset policy

所有 relation label 必须统一按 path arc-length + tangent/normal 派生，不得一个贴线、一个漂远。

## 3. Evidence：当前最明显的 route-quality blocker

用户截图中有多个一眼可见问题，不能再用 `EDGE_CARD_INTERSECTION_COUNT=0` 掩盖。

### 3.1 Connector 沿 card border 长距离贴行

典型例子：South-West Australia plants 与 Zero slots remain model information 的关系。

当前路线在 source/target card 附近出现长 vertical segment 与 card side 几乎重合，然后才转向/出现 arrow。视觉上像“线粘在 card 上”，而不是从一个明确 port 离开、在另一个明确 port 结束。

同类问题也出现在右侧 Marked discovery theorem / Real-data closure gap 的竖向关系附近。

必须建立 hard contact rule：

- source 只在单一 source port 离开；
- target 只由 arrow tip 单点接触；
- non-terminal path 不得在 card 6px clearance zone 内长距离运行；
- terminal tangent 应近似 card normal，而不是平行擦边。

### 3.2 可避免的 crossing / corridor 选择不自然

Evidence 下半区的 relation 明明可以在下方 corridor 内完成，却存在无意义跨区/绕行；route engine 当前没有把 edge-edge crossing 与 region change 作为主要 penalty。

要求：

- bottom-to-bottom relation 优先留在 bottom corridor；
- top-to-top relation 优先留在 top corridor；
- 已有 routed edge 作为 soft obstacle；
- 可避免的 crossing 必须为 0。

### 3.3 Arrow endpoint / side selection 必须和 relation geometry 一致

不能只断言 endpoint 坐标落在 card rect 上。还要检查：

- target side 是否符合 source→target 相对位置；
- final segment 是否近似垂直 target side；
- source departure 是否近似垂直 source side；
- arrow 是否真正指向 relation target，而不是 card corner/错误 side。

## 4. 左下角 `Theory / implementation / datasets / limitation / pending` 是什么

这只是 `ArchitectureWorkspace` footer 里对 Evidence view 硬编码的静态类别字符串，不是实际 legend、不是交互控件，也没有新增科学信息。

同样 Lineage footer 还有：

```text
Extends / preserves / borrows / computational inspiration
```

右下又有 `Evidence relation legend` / `Lineage relation legend` placeholder，形成重复 UI 噪音。

Stable 决策：

- 删除 Lineage / Evidence 左侧 raw category footer string；
- 删除无实际内容的 right-side legend placeholder；
- 如果未来需要 legend，必须做真正有 swatch/语义说明的 compact legend；
- Architecture footer 只保留确实有用的 state，不保留 debug-like count/category summary。

## 5. Workflow defect

RC.15 result 报：

```text
VISUAL_SYSTEM_CONFORMANCE = PASS
SELF_VISUAL_QA = PASS
```

但上述问题在整屏截图中肉眼可见，说明 developer self-QA 仍过度依赖：

- bbox overlap = 0；
- endpoint error = 0；
- path 不穿 card；

而没有检查 terminal contact quality、border-hug、avoidable crossing、corridor choice 与 footer product meaning。

因此已同步更新：

```text
docs/design/SCIENTIFIC_GRAPH_VISUAL_SYSTEM.md
docs/operations/development/DEVELOPER_VISUAL_SELF_QA_CONTRACT.md
```

新增 hard metrics：

```text
EDGE_CARD_BORDER_HUG_COUNT = 0
NONTERMINAL_CARD_CLEARANCE_FAIL_COUNT = 0
TERMINAL_NORMAL_ANGLE_FAIL_COUNT = 0
AVOIDABLE_EDGE_EDGE_CROSSING_COUNT = 0
STATIC_CATEGORY_FOOTER_COUNT = 0
```

## 6. RC.16 scope decision

RC.16 不再只是“换箭头 + 去 pipe”。它是 narrow-but-complete connector / route-contact finish：

1. canonical open-chevron terminal；
2. source/target normal terminal stubs；
3. card-border-hug elimination；
4. edge-edge crossing / corridor-aware route scoring；
5. Lineage peer-capsule relation group；
6. static footer / placeholder legend cleanup；
7. screenshot-level self-QA。

仍保护：

- scientific truth；
- trace algorithm；
- session contract；
- Architecture lane layout / Full model packing；
- Evidence ontology / claim truth；
- Inspector IA。

完成后先 `CHATGPT_REVIEW_DEVELOPER_SCREENSHOTS`，不启动 GPT Work。