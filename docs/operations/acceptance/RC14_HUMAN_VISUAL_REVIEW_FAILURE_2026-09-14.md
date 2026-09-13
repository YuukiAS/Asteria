# Asteria RC.14 Human Visual Review Failure

日期：2026-09-14  
候选版本：`2.0.0-rc.14`

## Verdict

```text
HUMAN_ACCEPTANCE = FAIL
STABLE_RELEASE = BLOCKED
NEXT_VERSION = 2.0.0-rc.15
GPT_WORK = NOT_YET
```

RC.14 修复了 coordinate-space mismatch、floating Lineage arrowhead 与 1366 card clipping，但用户直接查看三张实际页面截图后仍能一眼发现成品级视觉问题。这说明继续逐 bug patch 已经不够，需要统一 scientific graph visual system。

## User-visible failures

### 1. Architecture 退化成“线路图”

当前 obstacle-aware router 大量输出硬 90° polyline。几何上避开 card，但视觉上出现：

- 大段横竖直线；
- 超长 top/bottom detour；
- 多个直角拐点；
- selected node 周围像 electrical wiring；
- model flow 被 route geometry 抢走注意力。

根因不是某几条 CAT-TRACE edge，而是 route candidate 选择与 rendering grammar：当前优先“第一个不撞障碍的 polyline”，没有把 path length、bend count、backtracking、detour 与 aesthetic simplicity 纳入统一 score。

### 2. Lineage relation labels 没有统一 attach grammar

虽然 connector 现在真正触达 target border，但关系文字仍表现不一致：

- 有的 chip 紧贴 path；
- 有的 chip 像漂在 path 附近；
- TRACE 的 `Extends` / `Preserves` 是两个独立位置，视觉上不像同一 source-target connector 的 relation group。

必须统一为一个 connector 对应一个 relation-label group；单 relation 一个 capsule，多 relation 在同一 group 内组合，位置从 path arc-length + normal offset 派生。

### 3. Evidence connector 仍有线路图感

Evidence 信息结构本身可用，但新 routing 也把多条 relation 变成硬直角长线。Evidence 应是 claim-centered evidence map，不应和电路图共享裸 orthogonal visual grammar。

### 4. Inspector 出现 tiny clipped section / nested-scroll 感

Evidence 截图中 Search 下方、Claim Inspector 上方出现一个高度极小、带 scrollbar/半截控件的区域。Primary Inspector 被挤到其下方。

这违反 reader-facing inspector 原则。非 Architecture view 不应在 Search 与 Primary Inspector 之间放一个重复 mini graph/canvas；整个右侧应遵循 single-scroll principle。

## Root cause direction

下一版不能再只修 endpoint、safe margin 或某条线。需要把：

- visual route style；
- edge scoring；
- relation-label grammar；
- inspector vertical IA；
- Architecture / Lineage / Evidence 三种 view-specific grammar

统一写入并实现 canonical visual specification：

```text
docs/design/SCIENTIFIC_GRAPH_VISUAL_SYSTEM.md
```

## RC.15 scope

RC.15 是 visual-system implementation，不修改 scientific truth：

1. Architecture route aesthetics：simple edge 用 soft cubic；obstacle route 用 rounded orthogonal；加入 length/bend/backtracking/detour scoring；
2. Lineage relation-label group：每 connector 一个统一 group，path-derived anchor；
3. Evidence 使用更轻的 soft routing，不出现 electrical-wiring 主视觉；
4. Inspector 单一 vertical scroll，移除/替换 non-Architecture duplicate mini canvas；Primary Inspector 紧跟 Search；
5. 两轮以上 developer screenshot self-QA；
6. 不启动 GPT Work，直到 ChatGPT 先看 developer screenshots。
