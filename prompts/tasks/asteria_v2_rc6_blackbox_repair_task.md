---
id: asteria_v2_rc6_blackbox_repair
title: Repair RC.5 re-audit findings and make Architecture readable/trustworthy
created_at: 2026-09-12
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Asteria 2.0 RC.6 — Architecture Readability + Trace Truth + Researcher-facing Repair

## 0. 目标

RC.5 已完成第二轮 W01–W06 GPT Work 黑箱验收，但 gate 仍失败。现在做一次集中的 `2.0.0-rc.6` acceptance repair。

先读：

1. `AGENTS.md`
2. `prompts/AGENT_RULES.md`
3. `docs/operations/blackbox-audit/UI_BLACKBOX_BROWSER_CONTRACT.md`
4. `docs/operations/blackbox-audit/AUDIT_RESULT_CONTRACT.md`
5. `docs/operations/blackbox-audit/reports/RC5_REAUDIT_CONSOLIDATED_REPORT_2026-09-12.md`
6. `docs/operations/blackbox-audit/reports/RC4_CONSOLIDATED_REPORT_2026-09-12.md`
7. `docs/notes/2026-09-12_asteria_acceptance_mode_public_refresh_contract.md`
8. `docs/notes/2026-09-09_trace_and_cat_trace_reference_for_asteria_v2.md`
9. `docs/design/accepted-concepts/README.md` + A/B/C/D/E1/E2
10. 当前 `trace.ts`, session, canonical fixtures, multi-view fixtures, Architecture workspace/reference panel/styles/tests。

目标：

```text
version = 2.0.0-rc.6
commit = v2.0.0-rc.6
NEXT_ACTION = GPT_WORK_BLACKBOX_REAUDIT
```

本任务完成后**不要要求用户人工验收**，不要发布 stable。

## 1. 边界

这是 acceptance repair，不扩研究/产品范围。

禁止：

- 新增第三个 model variant；
- 改 Original TRACE / CAT-TRACE Frozen V2 的 scientific truth；
- 扩展到 real-data closure / marked theorem 研究本身；
- desktop/Tauri/Electron；
- Figma redesign；
- 恢复 Asteria 1.x live UI；
- 改 DNS / tunnel identity / fixed public URL；
- 3D/particle/physics/sustained decorative animation；
- 为消除 validation warning 发明没有 canonical reference 支持的 semantic edge。

允许：

- projection-level progressive disclosure；
- session/view presentation state；
- trace algorithm correction；
- existing schema 的小型 optional display/presentation metadata；
- canonical fixture metadata consistency fixes；
- researcher-facing inspector/search/evidence/diff UI；
- CSS/responsive/light-theme hardening；
- focused regression / Playwright coverage。

## 2. P1-A — Architecture 必须从“全量缩略图”变成可读 projection

### 2.1 Detail level

Architecture 增加明确、researcher-facing 的 detail control：

```text
Overview | Full model
```

默认：`Overview`。

这不是第二套 semantic graph。两种 detail 都必须来自同一个 canonical entities / TypedRelations / ArchitectureView projection truth。

### 2.2 Overview 原则

CAT-TRACE Overview 必须：

- 显示主科学骨架，而不是全部 30+ entities 一次性挤在首屏；
- 1366×768 默认状态下建议可见 semantic nodes 不超过约 18 个；
- 必须仍能一眼理解：raw/matching → catalogue vs open-tail split → latent/probit → catalogue/open-tail parameterization → TRACE tail calibration/group truncation → residual dependence scope → inference/targets；
- `𝒦` 与 `𝒰` 两条 identity branch 均必须可见；
- `beta^U_gh`, `gamma_g`, `p_g`, `Sigma_W` 必须可直接找到；
- auxiliary trait/phylogeny/heterogeneity/factor internals 可默认隐藏，但 Full model 必须完整展示；
- 不通过删除 canonical entities/relations 来实现 Overview。

Original TRACE 本身较稀疏，可以让 Overview≈Full，只要行为一致。

### 2.3 Focus-aware reveal

在 Overview 中，当用户选择/trace 一个核心对象时，可以临时 reveal 被隐藏的 direct dependency/context nodes；Clear/reset 后恢复 Overview baseline。

禁止创建假的 summary semantic entity。若需要 section/group label，使用 view/presentation-only container，不进入 canonical entity graph。

### 2.4 可读尺寸

在 1536×864 与 1366×768：

- 核心 rendered symbol 不得被缩成不可辨；
- core node symbol 建议视觉字号至少约 14px，secondary label 至少约 11px（可按现有 scale 等价实现）；
- node 的关键 math 不使用 ellipsis 截成未知符号；
- canvas 保留 pan/zoom/fit，但**不能要求用户先 zoom 才能读 Overview**；
- right inspector 不能把 Overview 压成缩略图。

## 3. P1-B — 修正 recursive trace 的方向算法

当前 `both` traversal 会在中间节点重新沿 incoming/outgoing 双向扩张，造成 root-relative direction 失真。

重写 trace semantics：

```text
upstream(root, depth)   = only recurse through incoming edges
 downstream(root, depth) = only recurse through outgoing edges
 both(root, depth)       = union of those two independent traversals
```

硬约束：

1. Both 的 `upstreamEntityIds` == 同 root/depth 的 Upstream-only set；
2. Both 的 `downstreamEntityIds` == 同 root/depth 的 Downstream-only set；
3. relation IDs 同理为两方向 union；
4. root 不计入 upstream/downstream counter；
5. 中间节点不能“转向”；
6. cycle 必须安全去重；
7. direct mode 仍是一 hop；
8. performance benchmark 不显著退化。

对 canonical `p_g` 加 exact focused regression。当前 graph 下 `p_g` 没有 canonical incoming dependency；不要为了让 upstream 非零而造边。

## 4. P1-C — Selection 与 Trace activation 解耦

RC.5 Clear 之所以视觉上仍像 active trace，是因为 selected default symbol 自动产生 direct trace。

新增显式 session state，例如：

```text
traceEnabled: boolean
```

或等价明确设计。

行为：

- 首次进入 Architecture：可以默认 selected `beta^U_gh` 给 inspector，但 `traceEnabled = false`；
- selected node 只表示当前 inspect/focus，不自动等于 active trace；
- Trace controls 应有明确 `Show trace` / `Trace on` affordance；
- 用户显式开启 trace，或在合理设计下改变 trace mode 后，可激活 trace；
- trace OFF 时：不显示 upstream/downstream counters、active trace chip、trace edge highlights；可以保留 selected-node cue；
- `Clear` 必须：恢复当前 model 的默认 selection + Overview baseline + all layers + default trace settings + `traceEnabled=false` + clear search/contextual status；
- Save/Restore 包含 traceEnabled；
- 切 model/view 时不得带入不属于新 context 的 active trace。

如果你认为 `Clear` 命名仍有歧义，可改为 `Reset view`，但必须同时更新 black-box browser tests 和 researcher-facing tooltip；不要保留两个语义重叠按钮。

## 5. P2-A — 让 `𝒰` 有 canonical-supported relation

当前 `mathcal_U` 是 orphan。Canonical note 已明确：

```text
c(f)=j -> catalogue identity j
c(f)=empty -> catalogue-external open tail
```

因此至少增加：

```text
c_f -> mathcal_U
relation type = matched_to（或同语义的现有 relation type）
label = empty/unmatched feature enters open tail
```

保留已有 `c_f -> mathcal_K`。

只增加有 canonical 文本依据的边；不要为了 validation 清零随意加 `𝒰 -> ...`。

## 6. P2-B — Canonical fixture indices metadata consistency

系统审计 Original TRACE / CAT-TRACE seeds 中“公式明确有下标，但 metadata indices 缺失”的情况。

至少修：

- `alpha^U_gh`, `beta^U_gh`, `v^U_gh`: `[g,h]`；
- `gamma_g`, `pi_g`, `p_g`, `p_g^*`: `[g]`；
- catalogue `alpha^K_j`, `beta^K_j`, `t_j`, `b^phy_j`, `v^K_j`: `[j]`；
- 其他 canonical notation 明确支持的 index。

不要写 generic LaTeX regex 自动猜 index；fixture 中显式声明。

加 regression 保证重点 symbols 不再显示 `Indices: none`。

## 7. P2-C — Evidence pending status 使用 researcher-facing 状态

`Marked discovery theorem` 的 research status 必须可见为 `Pending`。

不要把 research workflow status 强行等同 `observedStatus`。推荐 UI display status 从 evidence relation/constraints 派生：

- pending relation / `pending theorem` -> `Pending`；
- limitation -> `Open gap` / `Limited`（按现有 truth）；
- 不要改变“theorem 仍未完成”的 scientific state。

`observedStatus = not_applicable` 如仍有内部意义，只放 Advanced metadata，不作为研究者主状态。

## 8. P2-D — Inspector 必须按对象与 trace context 说人话

### 8.1 Inspector type

根据 selected entity kind 显示：

- Symbol Inspector
- Dataset Inspector
- Claim Inspector
- Method Inspector
- Proof Inspector
- Implementation Inspector
- Limitation/Open-gap Inspector
- 其他必要类型

`Finland fungi` 不能再显示 `CLAIM INSPECTOR`。

### 8.2 Direct relation vs active trace

明确分开：

- `Direct relations`：canonical one-hop structure；
- `Active trace`：只在 traceEnabled 时显示，并反映当前 mode/direction/depth。

`Why it matters` 不要拿 direct relation count 冒充 recursive trace summary。

### 8.3 Formula rendering

核心 canonical definition/formula 使用可读 math rendering。若现有 `definition` 是 plain canonical text，可加最小 optional `definitionLatex` / presentation formula，不改变原 definition/export truth。

至少修 `beta^U_gh = nu + a_g + v^U_gh` 等核心公式。

### 8.4 Scroll context

active view 或 selected entity 改变时，right inspector scroll 回 explanatory top；不要把上一对象中段 scroll 继承给新对象。

## 9. P2-E/F/G — 主理解路径去 debug 化

### 9.1 Export & validation

把 raw schema JSON、internal IDs、rule details 放入默认折叠的：

```text
Advanced / Export & validation
```

主 inspector 只保留 researcher-readable warning summary。

### 9.2 Semantic Diff

Semantic Diff 必须在 Advanced/debug 之前，作为 Original TRACE ↔ CAT-TRACE 正式比较工具：

- Added
- Changed
- Preserved
- 每项优先 `What changed` + `Why it matters`

减少重复的 generic sentence。

### 9.3 Project / View / Model helper

顶部用短 helper/tooltip 解释：

- Project：研究工作空间；
- View：回答哪类问题（Architecture / Lineage / Evidence）；
- Model：Architecture 中当前查看的 model variant。

不做 onboarding wizard。

### 9.4 Evidence language

把机器状态转换成研究者语言，例如：

- `support 1, gaps 2` -> `1 supporting item · 2 open gaps`；
- `supported_with_limits` -> `Supported with limits`；
- gap 显示 `What is missing` / `What would close this`，仅从现有 pending relations/limitations 派生。

## 10. P2-H — Light mode / dense labels / action targets

即使 Overview 降密，Light mode 仍必须单独验收：

- muted node/edge/label 不能接近水印；
- unrelated graph context 可降低层级，但 minimum contrast 仍可读；
- selected/upstream/downstream 必须有 line weight/border/label 等非纯色 cue；
- 1366 下关键 label 不普遍 clipping；
- compact top actions 尽量使用约 40px 的可点击区域；
- 保持 dark Quiet Celestial，不把所有边变得同样重。

## 11. P2-I — Action/status 生命周期

`Architecture view reset`, `Opened HMSC framework` 等操作反馈不能跨后续 navigation/model/view 长期残留。

实现为：

- 新 action 覆盖旧 status；
- navigation/model/view change 清理不再相关的 status；或
- 短生命周期 toast/status（无持续动画要求）。

状态反馈不是 canonical session truth。

## 12. 低成本 view differentiation

不重做三套 UI。只允许低成本增强：

- Architecture：layer/structure accent；
- Lineage：relation-type legend / lineage accent；
- Evidence：support/pending/gap legend / evidence accent。

统一 shell 保持一致。

## 13. Automated regression

新增：

```text
npm run test:architecture-rc6
```

至少断言：

1. Architecture has Overview / Full model detail state；
2. Overview uses canonical graph subset and Full model preserves full projected entity set；
3. `mathcal_U` no longer orphan via canonical-supported c(f) relation；
4. indexed metadata for alphaU/gamma_g/p_g/pi_g/etc correct；
5. marked theorem researcher-facing status = Pending；
6. recursive upstream/downstream semantics obey independent directional traversal invariant；
7. Both sets == upstream-only/downstream-only sets at same depth；
8. traceEnabled=false after default/Clear；
9. Clear removes active trace counters/path/highlights；
10. Evidence dataset inspector type is Dataset；
11. no legacy 1.x active UI；
12. W02 scientific invariants preserved。

## 14. Browser QA

Playwright 必须至少覆盖：

1. CAT Overview dark 1536×864；
2. CAT Overview dark 1366×768；
3. CAT Overview light 1366×768；
4. Full model toggle and return to Overview；
5. Original TRACE model switch；
6. default selected betaU with trace OFF；
7. enable direct trace on betaU；
8. `p_g` Recursive depth3 Both -> Upstream -> Downstream：counts/set behavior consistent；
9. `p_g` trace + Parameterization -> Clear：trace OFF, no counters/path/highlight, Overview baseline restored；
10. click `𝒰` and verify non-orphan relation context；
11. Finland all-graph search -> Evidence -> Dataset Inspector；
12. marked theorem -> visible Pending；
13. inspector scroll reset across entity/view navigation；
14. Semantic Diff visible before Advanced/validation；
15. raw JSON hidden by default, advanced drawer works；
16. Light contrast screenshot；
17. keyboard skip/model/view navigation remains good；
18. refresh / Save / Restore including traceEnabled；
19. no framework overlay / unexplained page error。

保存 RC.6 screenshots 到：

```text
results/asteria_v2_rc6_acceptance/screenshots/
```

## 15. Performance

Overview 不应降低现有 large-graph kernel 性能。继续运行：

```text
npm run bench:architecture-g05
```

Full model 与 trace indexing 不能回退到 component-local hard-coded graph truth。

## 16. Full verification

运行：

```text
npm run build
npm run test:regression
npm run test:architecture-rc6
npm run bench:architecture-g05
npm run test:browser
git diff --check
```

全部 PASS 才可 version commit。

## 17. Version / docs / result

更新：

- `package.json` + lockfile -> `2.0.0-rc.6`；
- `CHANGELOG.md`；
- `README.md`；
- `ROADMAP.md`；
- `VERSIONING.md`；
- 写 `results/asteria_v2_rc6_blackbox_repair/result.md`。

Commit / push：

```text
commit = v2.0.0-rc.6
push origin/main
HEAD == origin/main
worktree clean
```

## 18. Fixed public acceptance URL 是硬 gate

严格执行：

```text
docs/notes/2026-09-12_asteria_acceptance_mode_public_refresh_contract.md
```

固定 URL：

```text
https://asteria.httpwwwcardiacnexus-ukb.com/
```

如果本任务拆成多个 user-visible acceptance commit，每个 commit 都必须刷新 fixed public URL。建议尽量做成一个完整 RC.6 version commit，减少无意义 refresh，但不能绕过最终 public smoke。

最终必须：

```text
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_ROOT_CHECK = PASS
PUBLIC_STATUS_CHECK = PASS
PUBLIC_BROWSER_SMOKE = PASS
PUBLIC_VERSION = 2.0.0-rc.6
```

禁止 quick tunnel / alternate URL / VPS proxy。

## 19. 完成后仍然不要人工验收

完成后：

```text
NEXT_ACTION = GPT_WORK_BLACKBOX_REAUDIT
```

因为 RC.6 广泛影响 Architecture projection、trace semantics、inspector、theme 和 Evidence，因此下一轮重新跑完整 W01–W06。

只有全部 Work PASS 且 consolidated triage 无 must-fix P2 后，才允许进入用户人工最终验收。

最终返回：

```text
STATUS = COMPLETE
CURRENT_VERSION = 2.0.0-rc.6
FINAL_COMMIT = ...
OVERVIEW_READABILITY = PASS
FULL_MODEL_PRESERVED = PASS
TRACE_DIRECTION_TRUTH = PASS
TRACE_CLEAR_OFF_STATE = PASS
OPEN_TAIL_U_RELATION = PASS
INDEX_METADATA = PASS
EVIDENCE_PENDING_STATUS = PASS
INSPECTOR_TYPE_CONTEXT = PASS
ADVANCED_DEBUG_SEPARATION = PASS
SEMANTIC_DIFF_FIRST_CLASS = PASS
LIGHT_MODE_READABILITY = PASS
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_BROWSER_SMOKE = PASS
NEXT_ACTION = GPT_WORK_BLACKBOX_REAUDIT
```

只有以下 hard blocker 可提前停止：unrelated dirty work 会被覆盖；scientific/correctness regression 无法合理修复；fixed public URL 无法恢复且需要修改 infra identity；或任务要求会不可避免破坏 canonical truth。