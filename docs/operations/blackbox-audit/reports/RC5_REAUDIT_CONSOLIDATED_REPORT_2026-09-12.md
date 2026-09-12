# Asteria RC.5 GPT Work re-audit 汇总

日期：2026-09-12  
目标版本：`2.0.0-rc.5`  
固定验收入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`

## 1. Gate 结论

RC.5 的六轮 fresh GPT Work 黑箱 re-audit 全部完成，均满足 Browser contract，`BLACK_BOX_CONTEXT_CONTAMINATED = NO`，无 Browser blocker。

| Reviewer | Scope | Result | Severity | Recommendation |
| --- | --- | --- | --- | --- |
| W01 | Visual / scientific product design | FAIL | P1×1, P2×4, P3×1 | BLOCK |
| W02 | Statistical semantics | FAIL | P2×1, P3×2 | FIX_THEN_RETEST |
| W03 | Interaction / state coherence | FAIL | P1×2, P2×2, P3×1 | FIX_THEN_RETEST |
| W04 | First-time researcher UX | FAIL | P2×6, P3×3 | FIX_THEN_RETEST |
| W05 | Responsive / accessibility | FAIL | P2×2, P3×1 | FIX_THEN_RETEST |
| W06 | Release red-team | FAIL | P2×1 | ACCEPTABLE_WITH_P2 |

因此：

```text
GPT_WORK_GATE = FAIL
FINAL_HUMAN_ACCEPTANCE = NOT_READY
STABLE_RELEASE = BLOCKED
NEXT_VERSION = 2.0.0-rc.6
```

这轮比 RC.4 有明显进步：1366 header/lane collision、keyboard model selector、cross-view search、right-panel title、基础 KaTeX symbol rendering 均有改善；但核心 Architecture 的“可读性 + trace 真值”仍未达到 stable gate。

## 2. 去重后的 P1 release blockers

### P1-A — CAT-TRACE Architecture 默认 projection 仍过密，核心图在 1536/1366 不能可靠阅读

来源：W01 P1；W04/W05 多项 P2 交叉佐证。

症状：CAT-TRACE 全图同时展示过多节点、边和 diff badge。即使公式符号已用 KaTeX，中央画布仍需要用户依赖 inspector 才能读懂。1366×768 更明显；Light mode 的 muted context 进一步降低可读性。

判定：P1。Asteria 的核心产品价值是“读模型架构”，不能把完整 canonical graph 一次性缩成一张难以阅读的总览。

RC.6 目标不是删语义，而是增加 **projection-level progressive disclosure**：

- Architecture 默认使用 `Overview` detail；
- 提供 `Full model` detail；
- Overview 只投影主科学骨架，隐藏辅助模块细节；
- 选择/trace 某核心对象时，可临时 reveal 其必要 dependency/context；
- Full model 仍可看到全部 canonical entities/relations；
- 不新增伪造 semantic entities，不改变 canonical graph truth。

### P1-B — Recursive trace 的方向语义错误

来源：W03 P1-2。

症状：`p_g` Recursive/Both 显示大量 upstream/downstream；切到 Upstream 后却变成 0/0，Both 与单向结果无法解释一致。

源码审计确认当前递归 traversal 在 `both` 模式下会在每一个中间节点再次同时沿 incoming/outgoing 扩张，导致路径可以“转向”，因此 `upstreamEntityIds/downstreamEntityIds` 不是相对 root 的严格方向集合。

RC.6 必须改成：

```text
upstream(root)   = 只沿 incoming 递归
 downstream(root) = 只沿 outgoing 递归
 both(root)       = upstream(root) ∪ downstream(root)
```

不得在中间节点从 downstream path 再反向沿 incoming 扩张，或反之。Both 的 upstream/downstream counts 必须分别与同 depth 的 Upstream-only / Downstream-only 一致。

### P1-C — Clear / reset 仍产生“默认 selection 自带 trace”的假清空状态

来源：W03 P1-1；W06 P2。

当前 session reset 虽会把 mode/direction/depth/layer 恢复默认，但随后默认 selection 仍自动计算 direct trace，因此 counters、trace chip、edges、inspector 看起来仍处于 active trace。

RC.6 需要把 `selection` 与 `active trace` 解耦，引入显式 trace activation state。目标行为：

- 默认可以有一个选中对象用于 inspector；
- 默认/刚 Clear 后 **trace = OFF**；
- trace counters/path chip/edge highlight 在 trace OFF 时隐藏或明确显示 inactive；
- 调整 Direct/Recursive/Direction/Depth 或显式开始 Trace 时才激活 trace；
- Clear 后不允许留下旧 path/counter/highlight；
- Save/Restore 必须包含 trace activation state。

## 3. Stable 前必须修复的 P2

### P2-A — `mathcal U` 是孤立语义对象

W02。`Catalogue-external open tail / 𝒰` 当前无 upstream/downstream relation，validation 也报 orphan。

Canonical reference 已明确：`c(f)=j` 映射 catalogue identity，`c(f)=empty` 进入 catalogue-external open tail。因此 RC.6 可以且应增加**有文本依据的**关系：

```text
c(f) -> 𝒰
relation = matched_to (or equivalent existing relation type)
label = empty/unmatched feature enters open tail
```

不要为了消除 warning 发明没有 canonical 支持的额外边。

### P2-B — indexed quantities 的 metadata 不一致

W02。`gamma_g`, `p_g`, `alpha^U_gh` 等公式明显带 `g/h`，但 Advanced metadata 显示 `Indices: none`。

RC.6 应系统审计当前两个 canonical fixtures，显式补全已由 canonical notation 支持的 indices，例如：

- `alpha^U_gh`, `beta^U_gh`, `v^U_gh`: `g,h`；
- `gamma_g`, `pi_g`, `p_g`, `p_g^*`, zero-slot multiplicity: `g`（zero-slot 若 UI 把其视为 group quantity）；
- catalogue `*_j`: `j`；
- 不从 LaTeX 字符串自动猜测未知 index。

### P2-C — marked-discovery pending 状态在 inspector 中显示成 `not applicable`

W02。Evidence 的 closure gap/constraint 已正确写 pending，但通用 status 字段显示 `not applicable`。

不要把 research workflow status 硬塞进 observation-status ontology。UI 应为 Evidence entity 派生 researcher-facing status：若有 pending relation / `pending theorem` constraint，则显示 `Pending`；Advanced metadata 如需保留 observed-status 可放次级位置。

### P2-D — Inspector object type / trace context 不一致

W03 + W01。

- Evidence dataset `Finland fungi` 被标成 `CLAIM INSPECTOR`；
- recursive trace 时 `Why it matters` 仍描述 direct relations，和当前 trace counter 混淆；
- view/entity 切换后 inspector scroll 可能停在旧中段；
- canonical definition 部分公式仍是 plain linear text。

RC.6 要求：

- header 由 entity kind 推导：Dataset / Claim / Method / Symbol / Proof / Implementation / Limitation 等；
- `Direct relations` 与 `Active trace context` 分开命名；
- view/entity 改变时 inspector scroll 回 explanatory top；
- 核心 formula/definition 使用可读数学排版；如现有 `definition` 不是 LaTeX，可新增最小 optional display-latex 字段或等价 presentation metadata，不改变 canonical textual definition。

### P2-E — Export / Validation 工程信息进入主理解路径

W04/W01。

当前 raw JSON、`schemaVersion`, internal IDs、validation rule details 太靠前。RC.6 应：

- 把 raw JSON / schema validation 放入默认折叠的 `Advanced / Export & validation`；
- researcher-facing warnings 只显示可行动、可理解的摘要；
- Semantic Diff 提升到 Advanced 之前，作为正式比较工作流；
- `schema-v2 fixtures`, stable symbol ID 等内部措辞移入 advanced/debug 文案。

### P2-F — Semantic Diff / Evidence 缺少研究者语言

W04。

- Diff `Added / Changed / Preserved` 已有，但 explanation 重复且过抽象；
- Evidence `supported_with_limits`, `support 1`, `gaps 2`, `pending dataset line` 仍偏机器语言。

要求：

- Diff 每项优先说明具体“what changed / why it matters”；
- Evidence 展示 `1 supporting item · 2 open gaps` 等自然语言；
- gap 写清 `What is missing` / `What would close this`，但只能基于已有 pending relation，不发明研究结果。

### P2-G — Project / View / Model 首次理解仍不够明确

W04。增加窄范围 header helper / tooltip：

- Project = 当前研究工作空间；
- View = 当前问题视角（structure / lineage / evidence）；
- Model = Architecture 中被比较/查看的模型变体。

不做 onboarding wizard。

### P2-H — Light mode 与 dense scientific labels 仍偏弱

W01/W05。RC.5 虽有改善但仍 FAIL。RC.6 在新的 Overview detail 基础上进一步：

- 提高 light muted text/edge minimum contrast；
- 不相关 context 仍可淡化，但不能淡到“水印”；
- selected/upstream/downstream 保持非纯颜色 cue；
- 1366 下避免核心 label clipping；
- top compact icon hit target 尽量达到约 40px，同时不破坏布局。

### P2-I — status/action 文案跨上下文残留

W03。`Architecture view reset` / `Opened HMSC framework` 会在后续 view/model 中继续显示。

将其改为短生命周期 toast/status，或在任何新的 navigation/model/view/search action 时替换/清除；不能把旧操作反馈伪装成当前状态。

## 4. 可接受/延期的低优先级项

以下不单独阻塞 stable，但若 RC.6 顺手可低成本改善：

- 三视图可通过 header accent / relation legend 做轻微区分；不重做三套 UI。
- 125% browser zoom 本轮未测，不因测试工具限制 block；1366 与 keyboard 是硬 gate。
- P3 级 top icon polish、empty-state suggestion 可随本轮修复吸收。

## 5. 必须保护的已通过部分

RC.6 不得破坏：

- Original TRACE / CAT-TRACE model switch 主体同步；
- `beta^U_gh`, `nu`, `gamma_g`, `p_g`, `Sigma_W` 的 Frozen V2 科学含义；
- Lineage 关系语义；
- Evidence 对三个 first-paper datasets、real-data closure、marked theorem 的 pending 边界；
- All-graph `Finland` / `HMSC` cross-view navigation；
- keyboard skip links / early model selector；
- legacy 1.x UI 不回归；
- fixed public URL deployment path。

## 6. RC.6 re-audit 计划

RC.6 属于广泛 acceptance repair，因为会影响 Architecture projection、trace semantics、light theme、inspector/evidence/diff。因此修复后再次完整重跑 W01–W06。

Gate 仍为：

```text
W01-W06 all PASS
P0 = 0
P1 = 0
unresolved must-fix P2 = 0
```

在该 gate 通过前，不要求用户人工验收。