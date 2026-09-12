# Asteria RC.4 GPT Work 黑箱验收汇总

日期：2026-09-12  
目标版本：`2.0.0-rc.4`  
固定验收入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`

## 1. 总结

本报告汇总用户提供的 W01–W06 六份独立 GPT Work 黑箱报告。六轮均遵守当前 Browser contract；主要使用真实浏览器 UI automation fallback，`BLACK_BOX_CONTEXT_CONTAMINATED = NO`，不存在 Browser blocker。

原始 reviewer 结论：

| Reviewer | Scope | Result | Reported severity | Recommendation |
| --- | --- | --- | --- | --- |
| W01 | Visual / scientific product design | FAIL | P1×2, P2×4, P3×1 | FIX_THEN_RETEST |
| W02 | Statistical semantics | PASS | P2×1 | ACCEPTABLE_WITH_P2 |
| W03 | Interaction / state coherence | FAIL | P1×1, P2×1, P3×1 | FIX_THEN_RETEST |
| W04 | First-time researcher UX | FAIL | P1×3, P2×5, P3×2 | FIX_THEN_RETEST |
| W05 | Responsive / accessibility | FAIL | P1×1, P2×4, P3×2 | FIX_THEN_RETEST |
| W06 | Release red-team | PASS | P2×1 | ACCEPTABLE_WITH_P2 |

结论：`2.0.0-rc.4` **不能进入人工最终验收，也不能发布 stable**。下一步应先做一次集中 RC.5 repair，再重新跑 GPT Work。只有 GPT Work gate 全部通过后才进入用户人工验收。

## 2. 去重后的 release blockers

### P1-A — 核心数学显示不可稳定阅读

来源：W01 P1；W02/W05 交叉佐证。

症状：Architecture 节点与 inspector 标题出现 raw LaTeX（如 `\\beta^{\\mathcal U}_{gh}`、`\\Sigma_{\\mathcal W}`）以及 `\\alpha^\\m...`、`Y^{\\mathr...` 一类截断。中央 graph 单独阅读时无法可靠辨认核心统计符号。

判定：P1。Asteria 的核心价值是读模型结构，数学符号不是装饰内容。

修复目标：

- canonical LaTeX 仍是 source of truth；
- 用户可见核心 symbol 使用真实 math rendering（现有 KaTeX 即可，不新增数学依赖）；
- graph node、inspector、search/result/diff 中至少关键 symbol 不显示 raw backslash 形式；
- 不允许通过省略号把核心符号截到不可识别；必要时调整 node size / wrap / full formula surface；
- 不改变 Frozen V2 / Original TRACE 的科学定义。

### P1-B — 1366×768 下 Architecture 首屏布局不可接受

来源：W01 P1；W05 P2 交叉佐证。

症状：标题换行后与 subtitle / lane heading 距离过小，Architecture 图进一步压缩，公式与节点可读性恶化，right inspector 也明显挤压中央 canvas。

判定：P1。1366×768 是明确验收 viewport，不属于极端屏幕。

修复目标：

- 1366×768 与 1536×864 均保持 header / lane / canvas / inspector 清晰分层；
- header 高度自适应，不与 lane heading 碰撞；
- inspector 不应把 central canvas 压缩到核心节点不可读；
- 可以用 responsive width、collapsible advanced sections、canvas fit/scale 等方式，但不能隐藏核心信息。

### P1-C — `Clear` 没有原子清除 trace/layer 状态

来源：W03 P1。

复现：CAT Architecture → `p_g` → Recursive/Both → Parameterization → Clear。

症状：Clear 后仍显示 recursive/upstream/downstream counters、parameterization chip 与高亮，inspector 却跳到 `Y^{raw}`，selection / trace / layer / visual state 互相矛盾。

判定：P1。它直接破坏 state truth，用户无法相信当前 graph 状态。

修复目标：定义并实现单一 Clear 语义；一次动作中原子重置 selection/trace/layer（或明确只清 selection，但 UI 文案必须准确且其他状态不产生 stale impression）。当前产品文案为 `Clear`，推荐实现为恢复 Architecture 默认可读状态。

### P1-D — Light theme muted graph 对比度不足

来源：W05 P1；W01 P2 交叉佐证。

症状：非选中节点、边、小标签在白底上淡到接近水印，复杂 Architecture 无法审阅。

判定：P1。Light 是正式提供的主题，不应是不可用 projection。

修复目标：提高 light theme 中 muted node/edge/label 的最低对比；selected/upstream/downstream/diff/pending 不能只靠颜色区分。

## 3. 必须在 stable 前修复的 P2

### P2-A — Trace path 视觉可追踪性不足

W01。selected path 已变色，但 edge 交叉、低对比、方向感弱。修复应强化 true relation path 的方向、粗细/层级与 muted graph 对比；不做持续动画或装饰粒子。

### P2-B — Inspector 仍像 schema/debug panel

W01 + W04。当前大量 `Role / Model / Layer / Status / Definition / Indices / Dimension / Constraints / Variant note` 同层堆叠。

建议信息层级：

1. rendered symbol / entity name；
2. Meaning + why it matters；
3. canonical definition/formula；
4. upstream/downstream / key relations；
5. assumptions / constraints / variant difference；
6. Advanced metadata 折叠区。

不删除 canonical metadata，只调整呈现优先级。

### P2-C — 工程/内部标签外露

W01 + W04。包括 `ARCHITECTUREVIEW.PROJECTIONS`、`WEB RC`、`RC`、`14 semantic diff facts` 等。

stable-facing UI 应改成研究者语言或移除。版本号可以保留，但 release/debug badge 不应抢占产品信息层级。

### P2-D — All-graph search 反馈与 cross-view destination 不清楚

W03。搜索 `Finland` / `HMSC` 时缺少明确 result list、目标 view、empty-state 或跳转反馈。

目标：结果项明确标出 `Architecture / Lineage / Evidence` 来源；点击结果切到正确 view/entity；无结果时有 visible empty state；搜索不能被旧 trace selection 淹没。

### P2-E — Right panel 外层标题可能残留 `Architecture`

W06。在主画面已 Lineage/Evidence 时，外层右侧标题可仍显示 Architecture。

目标：唯一 active view truth；任何导航、cross-view link、快速切换后 central canvas、left nav、right panel header/inspector 都同步。

### P2-F — Keyboard model selector / Tab order

W05。Model selector 不易通过键盘到达；Tab 先穿过大量 graph nodes才到 right controls。

目标：

- 至少一个正式 model selector 在合理的早期 Tab 顺序中可达、可切换；
- 提供 skip-to-inspector / skip-to-canvas 或等价机制，避免 dense graph node 吞掉整个键盘路径；
- focus ring 明确。

### P2-G — First-time researcher 的自解释能力不足

W04。其报告给出的 3 个 P1 没有逐项 finding 证据，因此本次不把它们单独升级为新的 release blocker；但其 comprehension breakdown 与 W01/W05 高度一致，应作为 RC.5 的产品 P2 修复目标。

不做 onboarding wizard。只做窄范围增强：

- 首屏一句话明确 Asteria 的用途；
- Project / View / Model 的层级与区别通过自然标签/tooltip/短说明可理解；
- Architecture / Lineage / Evidence 各自回答的问题明确；
- selected symbol inspector 增加 “why it matters / affects” 层；
- Semantic Diff 至少形成 `Added / Changed / Preserved` + 简短 `why it matters`，而不是只有内部 diff facts。

### P2-H — 1366 right inspector density

W05。搜索、scope、trace controls 横向过密。与 P1-B 一起处理；优先 responsive stacking / collapsible advanced sections，不牺牲核心 graph。

## 4. 低成本 P3 / polish

- Restore 后 search field 是否恢复/清空：W03 P3。推荐明确 session scope；Restore 时清空 transient search，或把 search 纳入 state，但不能留半恢复错觉。
- 三视图视觉区分度：W01 P3。可通过 view-specific relation legend / accent / header context 小幅加强，不重新设计主 shell。
- Inspector keyboard Home/focus 归属：W05 P3。
- node title minor clipping：若 P1-A math/layout 修好应同步消失。

## 5. 明确通过且必须保护的部分

RC.5 修复不能破坏以下已经被 Work 验证为正确的内容：

- W02：Original TRACE / CAT-TRACE 可见科学语义基本正确；`p_g`、`gamma_g`、`nu`、`Sigma_W` 等当前含义与 canonical invariants 对齐；Lineage relation 语义和 Evidence pending/support 边界正确。
- W03/W06：model switch、Architecture/Lineage/Evidence 主 view state、theme、export、Save/Restore 主路径总体能工作；多轮 stress 未出现 blank canvas 或旧 1.x shell 回归。
- W06：刷新后仍保持 Asteria 2.0；无旧 startup modal；导出未见明显串 model 内容。

因此 RC.5 是 **acceptance repair / visual-state hardening**，不是新一轮 ontology 或模型重构。

## 6. RC.5 目标与验证策略

目标版本：`2.0.0-rc.5`。

修复顺序：

1. P1-A math rendering；
2. P1-B responsive 1366 layout；
3. P1-C atomic Clear；
4. P1-D light contrast；
5. search + stale view title；
6. trace visual grammar；
7. inspector / internal labels / first-time explanations / diff explanation；
8. keyboard model selector + skip path；
9. minor restore/search and view differentiation polish。

必须继续执行 fixed public acceptance refresh contract。任何用户可见 acceptance commit 后，固定公网 URL 必须刷新到当前代码并 smoke。

## 7. 新的人工验收 gate

从本轮开始，Asteria 的验收顺序固定为：

```text
Codex repair
  -> automated regression / browser QA
  -> fixed public URL refresh
  -> GPT Work black-box campaign
  -> consolidated triage
  -> [若任一 reviewer FAIL/BLOCKED 或仍有 must-fix P2] 回到 repair
  -> 所有指定 reviewer PASS
  -> P0 = 0, P1 = 0, must-fix P2 = 0
  -> 用户人工最终验收
  -> stable release
```

**在 GPT Work gate 通过前，不再要求用户人工打开页面验收。**

RC.5 完成后建议重新运行 W01–W06 全部六轮，而不是只重跑失败者：本次修复会同时改变 math rendering、layout、theme、state、search、inspector、keyboard 与 learnability，覆盖面足够广；需要重新建立完整黑箱基线。
