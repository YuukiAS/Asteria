# Asteria RC.7 targeted GPT Work re-audit 汇总

日期：2026-09-13  
目标版本：`2.0.0-rc.7`  
固定验收入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`

## 1. Gate 结论

RC.7 按 narrow-repair 策略只重跑 W01 / W05 / W06；W02 / W03 / W04 沿用 RC.6 PASS。三轮均满足 Browser contract，`BLACK_BOX_CONTEXT_CONTAMINATED = NO`，无 Browser blocker。

| Reviewer | Scope | Result | Severity | Recommendation |
| --- | --- | --- | --- | --- |
| W01 | Visual / scientific product design | PASS | P2×1, P3×1 | ACCEPTABLE_WITH_P2 |
| W05 | Responsive / accessibility | FAIL | P2×1 | FIX_THEN_RETEST |
| W06 | Release red-team | PASS | P3×1 | ACCEPT |

Carry-forward：

- W02 scientific semantics = PASS from RC.6；
- W03 interaction/state coherence = PASS from RC.6；
- W04 first-time researcher UX = PASS from RC.6。

因此当前 gate：

```text
GPT_WORK_GATE = FAIL
FINAL_HUMAN_ACCEPTANCE = NOT_READY
STABLE_RELEASE = BLOCKED
NEXT_VERSION = 2.0.0-rc.8
```

问题已经收敛为一个明确、窄范围的 must-fix：**1366×768 Light theme + trace ON 时，muted graph context 的关系边/关系标签/部分上下文文字仍过淡。**

## 2. 唯一 must-fix P2

### P2-A — 1366×768 Light + trace ON muted context 对比仍不足

来源：W05 FAIL；W01 PASS 中报告了同一个 P2。

复现状态：

```text
Architecture
CAT-TRACE Frozen V2
Overview
1366×768
Light theme
选择一个核心节点（例如 Catalogue match）
Show trace = ON
```

观察：

- active node/path 可读；
- muted nodes 大体可读；
- 但 muted relation lines / relation labels / nearby context labels 仍接近 watermark；
- 长时间科研读图会丢失 active path 周围的上下文。

判定：stable 前 must-fix P2。原因不是审美，而是这是 W05 明确的 hard viewport + accessibility/readability acceptance state。

RC.8 只允许做 contrast/presentation patch：

- 提高 Light + trace ON 下 muted edge/context 的最低可读性；
- 保持 active path 仍明显高于 muted context；
- 保留 upstream dashed / downstream solid 等 non-color cue；
- 不把所有 relation label 永久打开；
- 不改变 relation truth、trace algorithm、projection、layout、session semantics。

实现时应特别检查 class overlap：active/selected relation 如果同时带有 muted class，不能因为祖先/group opacity 把本应可读的 relation label 再次整体淡化。

## 3. 明确接受 / 延期项

以下不阻塞 2.0 stable，不进入 RC.8 scope：

### W01 P3 — Lineage 1366 右侧 selected node 略裁切

仍可读，属于 composition polish。进入 `2.0.x` backlog。

### W06 P3 — Save view state 不恢复 theme

当前 Save/Restore 的主语义是 model/view/detail/trace session state；W06 已确认这些恢复正常。为了修这一 P3 去改变 session persistence contract 会重新触碰 W03 scope，收益不足。RC.8 不处理；后续若要让 theme 进入 Save/Restore，应作为独立 2.0.x UX decision。

## 4. Reviewer 数量进一步缩减

RC.8 是单一 CSS/presentation-level contrast 修复，不再运行 W01/W05/W06 三轮。

RC.7 W01 已 PASS，且它唯一的 P2 与 W05 FAIL 是**同一个 finding**。因此 RC.8 采用 finding-level 去重：

```text
Designated re-audit = W05 + W06
```

- W05：作为该重复 finding 中更严格、实际 FAIL 的 owner，重新验证 exact 1366 Light trace state；
- W06：任何 release repair 必跑，用于确认没有引入回归；
- W01：carry forward PASS，前提是 RC.8 只修改该 duplicated contrast finding，不触碰其他 visual/layout/graph surfaces。

如果 Codex 返回 `REVIEWER_SCOPE_EXPANDED = YES`，或修改了 layout / graph grammar / Lineage / Full-model controls，则必须把 W01 加回。

## 5. RC.8 gate

RC.8 完成后：

```text
W05 = PASS
W06 = PASS
W01 = carry-forward PASS from RC.7
W02/W03/W04 = carry-forward PASS from RC.6
P0 = 0
P1 = 0
unresolved must-fix P2 = 0
```

满足后，不再继续自动 polish；直接进入用户最终人工验收。
