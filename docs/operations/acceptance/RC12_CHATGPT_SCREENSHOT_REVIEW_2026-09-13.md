# Asteria RC.12 ChatGPT Screenshot Review

日期：2026-09-13  
候选版本：`2.0.0-rc.12`

## Verdict

```text
DEVELOPER_SCREENSHOT_REVIEW = FAIL
NEXT_VERSION = 2.0.0-rc.13
GPT_WORK = NOT_YET
HUMAN_ACCEPTANCE = NOT_YET
```

RC.12 比 RC.11 明显进步：Architecture edge 不再像 viewBox 放大的粗蓝带，selected node 成为更明确的视觉焦点；Lineage/Evidence 也比早期版本干净。但直接查看 RC.12 round-2 developer screenshots 后，仍能看到一些属于通用 graph-presentation mechanism 的问题，不值得现在启动 GPT Work，也不应让用户做下一轮人工验收。

截图来源：

```text
results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round2-cat-overview-selected-1536.png
results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round2-cat-overview-trace-1366.png
results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round2-cat-full-fit-1536.png
results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round2-lineage-1536.png
results/asteria_v2_rc12_edge_visual_selfqa/screenshots/round2-evidence-1536.png
```

## 1. Architecture Overview：edge weight 已改善，但 routing / hierarchy 仍可继续收口

正向：

- ordinary / active edge 粗细已经进入合理区间；
- selected `beta^U_gh` card 比 active edge 更显眼；
- 1536 dark overview 不再有 RC.11 那种“荧光笔式”粗边。

仍需处理的通用问题：

- 多条 active relations 在 selected node 周围形成放射式汇聚，虽然不再粗，但仍偏“graph engine”而不是经过排版的 scientific diagram；
- edge 端点/side-port 仍来自简单百分比偏移，没有真正使用 card rectangle 的边界几何；
- edge crossing / fan-in 没有 routing policy，复杂状态下会自然退化成 hairball。

结论：不要继续针对 `beta^U_gh` 单独调线，而应做 reusable boundary-port + routing policy。

## 2. Architecture Full model：核心问题是 generic packing，不是 CAT-TRACE 某几个节点

当前 `packFullArchitectureNodes` 虽然保证了 no-overlap，但本质上仍是：

- 先按 semantic lane 排序；
- 再把所有节点按全局 8-column × 5-row grid 顺序塞入。

这会导致 semantic lane 只参与排序，不真正决定 x lane。截图中 Full model 的 card 几何整齐，但关系线大量跨列、交叉，模型结构并没有因为 non-overlap 就变得更容易读。

需要升级为通用的 lane-aware virtual canvas：

- semantic layer 决定主 x lane；
- lane 内根据节点数动态排 vertical slots/subcolumns；
- virtual canvas 高度可增长；
- Fit 只缩放 non-overlap virtual canvas，不重新破坏 lane semantics；
- routing 使用 node rect boundary ports。

这应同时适用于 CAT-TRACE、Original TRACE 以及以后其它统计模型，而不是只给两个 example 写坐标。

## 3. Lineage：目前截图仍暴露 fixed-coordinate presentation 的根本问题

当前实现把：

- source card y；
- connector target `port`；
- relation chip `left/top`；
- connector endpoint x

全部写成固定百分比。

截图中因此出现明显语义断裂：

- HMSC / MGP 等 connector 的 arrowhead 看起来悬在 target card 左侧，没有真正落到 target card 边界；
- 不同 connector 的 target ports 与实际 target card 高度无关；
- chips 是独立绝对定位，看起来只是“放在线附近”，不是由对应 connector geometry 派生。

这是 generic provenance diagram engine 的问题，不是 HMSC/TRACE 这四个名字的问题。

下一版必须改成：

- source/target card 实际 rect 驱动 connector endpoints；
- target ports 在 target rect 内均匀分配；
- arrowhead 必须触达 target card 边界；
- relation chip 位置由 connector path/midpoint 派生，而不是写死百分比；
- source 数量变化后仍能工作。

## 4. Evidence：整体可用，但仍应吃到通用 routing 改善

Evidence 目前整体比 Lineage 更接近可接受：节点间距、信息层级、selected claim 都清楚。

但其 relation rendering 仍依赖同一类通用 graph edge geometry。下一版不需要重做 Evidence 信息架构；只需要确保新的 reusable boundary-port/routing helper 不让 Evidence 回退，并保持：

- selected node 是主焦点；
- relation edge 不抢视觉；
- support/pending/limitation truth 不变。

## 5. Developer self-QA workflow 仍需加强

RC.12 result 自己给出了：

```text
SELF_VISUAL_QA = PASS
```

但 round-2 Lineage screenshot 中 connector 没真正落到 target card 这件事仍是一眼可见。

因此长期规则增加：example 只是诊断 fixture；visual bug 必须优先修底层通用机制，并至少用另一结构 fixture/stress case 验证，而不是只让当前 example screenshot 过关。

对应长期规则已加入：

```text
prompts/AGENT_RULES.md
```

## RC.13 scope

RC.13 应是 generic graph-presentation foundation repair：

1. reusable node-boundary port computation；
2. lane-aware architecture packing / virtual canvas；
3. generic edge routing / fan-in policy；
4. generic provenance connector geometry + path-anchored relation chips；
5. Evidence regression；
6. developer screenshot self-QA + non-CAT generic fixture/stress validation。

不修改 scientific truth、trace semantics、session contract、Evidence truth。