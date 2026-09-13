# Asteria RC.6 GPT Work re-audit 汇总

日期：2026-09-13  
目标版本：`2.0.0-rc.6`  
固定验收入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`

## 1. Gate 结论

RC.6 的 fresh GPT Work 黑箱结果：

| Reviewer | Scope | Result | Severity | Recommendation |
| --- | --- | --- | --- | --- |
| W01 | Visual / scientific product design | PASS | P2×4, P3×1 | ACCEPTABLE_WITH_P2 |
| W02 | Statistical semantics | PASS | none | ACCEPT |
| W03 | Interaction / state coherence | PASS | none | ACCEPT |
| W04 | First-time researcher UX | PASS | P2×3, P3×4 | ACCEPTABLE_WITH_P2 |
| W05 | Responsive / accessibility | FAIL | P1×2, P2×2, P3×1 | FIX_THEN_RETEST |
| W06 | Release red-team | FAIL | P2×1, P3×1 | ACCEPTABLE_WITH_P2 |

因此：

```text
GPT_WORK_GATE = FAIL
FINAL_HUMAN_ACCEPTANCE = NOT_READY
STABLE_RELEASE = BLOCKED
NEXT_VERSION = 2.0.0-rc.7
```

RC.6 相比 RC.5 已经跨过了最重要的结构性问题：W02 scientific semantics 与 W03 state/trace truth 都完全通过；W01 与 W04 也已经从 FAIL 变为 PASS。剩余问题集中在 accessibility、light-theme trace readability、Full-model reading controls 与 Advanced/export disclosure，属于明显更窄的 release polish。

## 2. RC.7 必须修复的 blockers

### P1-A — Skip links 不是可靠的第一键盘入口

来源：W05 P1。

现状：skip links 存在于 accessibility tree，但 fresh page / reset 后第一次 Tab 未稳定落到可见的 `Skip to canvas / Skip to inspector`。

修复目标：

- skip links 位于页面内容的首个正常 tab stops；
- keyboard Tab 后能可靠出现可见 focus target；
- 使用标准 anchor semantics，不依赖 hidden DOM hack；
- `Skip to canvas` 与 `Skip to inspector` 均真正移动 focus；
- 浏览器 regression 从 fresh page 开始断言第一、第二个 Tab target。

### P1-B — 1366 Light + trace ON 时 muted graph 过淡

来源：W05 P1；W01 P2 交叉佐证。

修复目标：

- 1366×768 light theme trace ON 时，muted nodes / edges / relation labels 仍可用于上下文定位；
- muted 不能接近 watermark；
- active trace 与 unrelated context 仍要有层级差；
- selected/upstream/downstream 继续使用非纯颜色 cue（border / dash / line weight / labels）。

## 3. RC.7 stable 前 must-fix P2

### P2-A — `Advanced / Export & validation` disclosure 不可靠

来源：W06。

鼠标、summary 三角、Enter/Space 都不能稳定展开。这是公开 UI 控件失效，必须修。

修复目标：

- 用可靠、明确的 disclosure control（推荐 controlled button + `aria-expanded` + region，而不是继续依赖当前失效状态）；
- mouse click / Enter / Space 全部可用；
- 展开后 Markdown / Schema V2 / validation preview 可见；
- 收起后不把 raw JSON 泄漏到主理解路径。

### P2-B — Top Export 缺乏明确可见反馈

来源：W06 P3，低成本随 disclosure 一起修。

要求：top `Export` 应打开/定位到 Export & validation 区域，或者显示清晰 visible feedback；不能只是内部触发隐藏按钮。

### P2-C — compact top actions accessible names / target size

来源：W05 P2。

- Search / Export / Save / Restore 在 compact 1366 布局中即使文本隐藏，也必须保留明确 accessible name；
- compact hit target 尽量达到至少约 40×40 px；
- focus ring 清楚。

### P2-D — Full model 缺少可发现的局部阅读工具

来源：W05 P2；W01 P2/P3 交叉佐证。

Full model 是用户主动进入的完整 canonical graph，允许 dense，但必须可读。

要求至少提供可见、键盘可达的：

```text
Fit | Zoom out | Zoom in
```

并提供一种明确 pan 方式（pointer-drag 或等价）。

- `Fit` 恢复 canonical viewport；
- zoom/pan 只影响 presentation，不改变 semantic graph；
- 切 model / detail / view 时避免把无效 transform 泄漏到新 context；
- 1366 下用户可以通过正常 UI 放大并阅读局部节点；
- Overview 默认仍保持自动可读，不要求先 zoom。

### P2-E — Inspector/helper label-value spacing

来源：W01 P2，W04 P3 交叉佐证。

修正 `ProjectCurrent`、`ViewArchitecture`、`ModelArchitecture` 一类视觉粘连。使用明确 label/value spacing 或 grid；不改变信息架构。

### P2-F — active relation label readability

来源：W01 P2。

不要求所有边永久显示标签。优先让 selected / active-trace relation label 有清楚归属：适当 halo/background、位置或 opacity；避免标签压在线交叉点上。

## 4. 已接受 / 延期到 2.0.x 的 P2/P3

以下来自已 PASS reviewer，当前不作为 RC.7 blocker：

- W04：默认 inspector 宽度 / 更强 reading-mode preference；当前 inspector 可折叠且 W01/W05 已确认主布局可用，作为 `2.0.x` reading-mode polish。
- W04：Evidence closure gap 更 claim-specific 的文案；W02 已确认 scientific truth / pending 边界正确，可后续继续改善。
- W04：精确符号搜索 ranking；当前正确对象可找到且 cross-view navigation 正常，不是 stable blocker。
- W04/W05：125% browser zoom 未测，工具限制不 block；1366 + keyboard 是本轮硬 gate。
- W01：Full model 本身保持高密度是允许的，只要 RC.7 提供正常的 local reading controls。
- 其他 P3 visual polish / toolbar prominence / empty-state suggestion 进入 2.0.x backlog。

## 5. 必须保护的 RC.6 PASS 证据

RC.7 是窄修复，不能破坏：

- W02：Original TRACE / CAT-TRACE scientific semantics、`𝒦/𝒰` split、`c(f)=∅ -> 𝒰`、indices、Evidence pending truth；
- W03：root-relative recursive trace、Clear trace-OFF、Save/Restore、cross-view/search state coherence；
- W04：Architecture/Lineage/Evidence 可理解、Semantic Diff 主路径、researcher-facing inspector；
- W01：Overview 在 1536/1366 已达到 PASS；
- legacy 1.x 不回归；
- fixed public URL / deployment path 不变。

## 6. 下一轮 reviewer 缩减

RC.7 只修改 visual/accessibility/disclosure/full-model presentation，不修改 scientific semantics、trace algorithm、model/view/session truth 或 first-time information architecture。

因此 RC.7 完成后**不再机械重跑六个 Work**。

指定 fresh re-audit：

```text
W01 — Visual / Scientific Product Design
W05 — Responsive / Accessibility
W06 — Release Red-team
```

Carry-forward PASS evidence：

```text
W02 — PASS from RC.6 (scientific semantics untouched)
W03 — PASS from RC.6 (state/trace semantics untouched)
W04 — PASS from RC.6 (broad learnability IA untouched; deferred P2 explicitly accepted)
```

如果 RC.7 实际实现越界修改了 W02/W03/W04 的范围，则对应 reviewer 必须重新加入 re-audit；Codex result 必须列出 touched surfaces 供 ChatGPT 判断。

RC.7 gate：

```text
W01 PASS
W05 PASS
W06 PASS
W02/W03/W04 carry-forward remains valid
P0 = 0
P1 = 0
unresolved must-fix P2 = 0
```

只有该 gate 通过后才进入用户人工最终验收。