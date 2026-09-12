---
id: asteria_v2_rc5_blackbox_repair
title: Repair RC.4 black-box findings before final human acceptance
created_at: 2026-09-12
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Asteria 2.0 RC.5 — Consolidated Black-box Repair

## 0. 背景与目标

RC.4 已完成六轮 GPT Work 黑箱验收。当前不是新增产品范围，而是修复已经被真实固定公网 UI 观察到的问题。

先读：

1. `AGENTS.md`
2. `prompts/AGENT_RULES.md`
3. `docs/operations/blackbox-audit/UI_BLACKBOX_BROWSER_CONTRACT.md`
4. `docs/operations/blackbox-audit/AUDIT_RESULT_CONTRACT.md`
5. `docs/operations/blackbox-audit/reports/RC4_CONSOLIDATED_REPORT_2026-09-12.md`
6. `docs/notes/2026-09-12_asteria_acceptance_mode_public_refresh_contract.md`
7. `docs/design/accepted-concepts/README.md`
8. A/B/C/D/E1/E2 accepted concepts
9. 当前 Architecture session/workspace/reference panel/styles/browser tests。

目标版本：

```text
2.0.0-rc.5
```

目标 commit：

```text
v2.0.0-rc.5
```

本任务完成后**不要要求用户人工验收**。下一步必须先重新跑 W01–W06 GPT Work 黑箱 campaign；只有全部 reviewer PASS 后才允许进入人工验收。

## 1. 严格边界

本任务是 acceptance repair，不是重新设计 Asteria。

禁止：

- 新增第三个 model variant；
- 改变 Original TRACE / CAT-TRACE Frozen V2 的 canonical 科学定义；
- 扩 ontology；
- 进入 real-data research closure 或 theorem work；
- desktop/Tauri/Electron；
- Figma redesign；
- 改固定公网 URL / DNS / Cloudflare tunnel identity；
- 恢复任何 Asteria 1.x live UI；
- 为视觉修复引入 3D/particle/physics 或 sustained animation。

允许：

- 重构 component / CSS / session UI state；
- 使用现有 KaTeX；
- 调整 projection node presentation/size/layout；
- 新增 focused regression / Playwright cases；
- 调整 inspector 信息层级、search UI、keyboard/accessibility；
- 更新 README/CHANGELOG/ROADMAP/VERSIONING/result。

## 2. P1-A — 修复核心数学显示

当前黑箱证据显示核心节点/inspector 会出现 raw LaTeX 与不可识别截断。

要求：

1. graph node 的 canonical mathematical symbol 使用真实数学排版，不向用户暴露 `\\mathcal`, `\\Sigma`, `\\beta` 等 raw command；
2. inspector 选中对象标题同样使用 rendered math；
3. search results / semantic diff / relation surfaces 中若展示 symbol，也应保持统一数学呈现；
4. canonical LaTeX string 仍保存在数据层，不把 display HTML 当 source of truth；
5. 使用 repo 已有 `katex`，不要引入第二套 math library；
6. 核心符号不得用 `...` 截成不可辨认；需要时允许：
   - node min-width / width 按 symbol 类型调整；
   - formula 单独一行；
   - label wrap；
   - visible full-form tooltip/popover（普通 UI）；
7. 必须确保 Original TRACE / CAT-TRACE 的公式文本没有被视觉层修改语义。

至少重点验收：

```text
y_ij
z_ij
alpha_j
beta_j
nu
Psi
Y^raw
K / K_n / U / G / W
beta^U_gh
gamma_g
gamma_0
pi_g
p_g
p_g^*
Sigma_W
```

新增 regression：核心数学表面存在 KaTeX-rendered DOM/accessible label，并防止关键 Architecture 节点回到 raw backslash 文本。

## 3. P1-B — 1366×768 responsive acceptance

1366×768 是硬验收 viewport。

要求：

- Architecture title/subtitle/lane headings 不重叠、不贴得像同一行；
- header 高度随 wrap 自适应；
- central canvas 保持足够可读面积；
- right inspector 在 1366 宽度不能压死 graph；
- inspector controls 在窄桌面合理 stack/wrap；
- CAT-TRACE 的核心 node 不因 viewport 变窄而普遍不可读；
- Lineage/Evidence 同样 smoke。

不要通过隐藏核心节点或删除信息来“通过 responsive”。

Playwright 必须覆盖 `1536x864` 与 `1366x768`，并保存对应截图。

## 4. P1-C — 统一 Clear 语义并原子重置 state

当前 black-box finding：`p_g` + Recursive/Both + Parameterization 后点击 Clear，trace counters/highlights/chips 仍残留，selection 却跳到 `Y^raw`。

定义当前 `Clear` 为：

```text
恢复当前 Architecture model 的默认可读状态
```

一次操作中应原子完成：

- selected symbol/entity -> 当前 model 默认 selection；
- trace mode -> `direct`；
- direction -> `both`；
- depth -> 默认值；
- layer focus -> `all`；
- stale highlighted relation IDs -> 清除/重算；
- counter/chip -> 与新 state 同步；
- inspector -> 与默认 selection 同步。

如果产品中存在其他 reset/clear button，命名要避免语义冲突。

新增 focused state regression + Playwright exact reproduction。

## 5. P1-D — Light theme 可读性

要求：

- light mode 中 muted node、edge、small label 仍可辨；
- selected/upstream/downstream/diff/pending 有非纯颜色 cue（例如 border style/label/icon/line weight）；
- 不把所有 muted 内容做成接近水印；
- 保持 dark mode Quiet Celestial，不因 light 修复破坏 dark。

Playwright 保存同一 CAT Architecture selection/trace 在 dark/light 的对照截图。

## 6. P2-A — Trace path visual grammar

在不改变 relation truth 的前提下提升真正 trace path 的可读性：

- active edge 与 unrelated edge 层级明显；
- 有明确方向感（arrowhead 或等价视觉）；
- upstream/downstream 至少可通过 line treatment / label / legend 区分，不只靠相近颜色；
- edge crossing 不应让 selected path 消失；
- recursive trace 仍保持性能与 reduced-motion 约束。

不新增持续动画。

## 7. P2-B/C/G — Inspector、工程标签、首次理解

### Inspector hierarchy

调整为研究者优先，而不是 schema dump：

1. rendered symbol/entity + human-readable name；
2. `Meaning`；
3. `Why it matters` / affects（基于现有 graph relations/canonical role，不能编造研究结论）；
4. canonical definition/formula；
5. key upstream/downstream or context relations；
6. assumptions/constraints/variant difference；
7. `Advanced metadata` 折叠区：role/model/layer/status/indices/dimension/provenance-like details。

不删除 metadata，只降低默认视觉权重。

### Stable-facing language

从普通 UI 移除或改写：

- `ARCHITECTUREVIEW.PROJECTIONS`；
- `WEB RC` / standalone `RC` badge（版本号本身可保留）；
- `14 semantic diff facts` 等实现/调试语气；
- 其他暴露 schema/object 名称而研究者不需要知道的 internal strings。

### First-time comprehension

不做 onboarding wizard。用当前 shell 的小改动解决：

- Asteria 标题附近一句话说明产品目的；
- Project / View / Model 标签清楚、必要时有 tooltip/short helper；
- Architecture / Lineage / Evidence 各自用一句话说明回答的问题；
- Semantic Diff 改成用户能读懂的 `Added / Changed / Preserved`，每类给简短 `why it matters`；
- 不复制 concept image 中的错误公式/作者/citation/status。

## 8. P2-D — All-graph search

要求：

- 搜索结果有明确 visible list；
- 每项标注所在 view/category；
- 点击 `Finland fungi` 可进入 Evidence 对应 entity；
- 点击 `HMSC framework` 可进入 Lineage 对应 entity；
- 当前 view 搜不到时显示 explicit empty state；
- all-graph 搜索不能只是更新输入框却不给导航结果；
- search result selection 后 central view / left nav / right panel / inspector 同步。

新增 Playwright：`Finland`、`HMSC`、不存在字符串。

## 9. P2-E — right panel view title stale

任何：

- left rail 切换；
- right view control 切换；
- cross-view link；
- search result cross-view navigation；
- 快速循环；

之后，central view、left nav、right outer header、inspector type 必须来自同一个 active view state。

新增 W06 最短复现路径的 regression。

## 10. P2-F — Keyboard model selector / dense graph navigation

要求：

- 至少一个正式 model selector 在 top-level keyboard 顺序中早期可到达；
- 可用 Enter/Space/Arrow 或原生 select 方式完成 Original TRACE ↔ CAT-TRACE；
- focus ring 清晰；
- 不要求 Tab 穿过几十个 graph node 才能到 search/trace/inspector；
- 增加 `Skip to canvas` / `Skip to inspector` 或等价快捷焦点路径；
- Architecture/Lineage/Evidence 一级导航继续键盘可达。

不要为了测试而用 hidden accessibility hacks；普通用户应真实可用。

## 11. Minor state polish

### Restore/search

明确 Save/Restore 是 `view session`，不是所有 transient UI。推荐 Restore 后清空 transient search query/results，避免“恢复了 Architecture 但搜索框仍写 HMSC”的半恢复感。

### View differentiation

仅做低成本增强：relation legend / header context / evidence gap treatment 等；不要重新画三套视觉系统。

## 12. 必须保护的科学与功能真值

W02 已确认以下部分基本正确，RC.5 不得因视觉/UX修复破坏：

- Original TRACE 不含 CAT-TRACE finite catalogue/grouped-tail 扩展；
- `beta^U_gh = nu + a_g + v^U_gh`；
- `nu` 不是 intercept；
- `gamma_g = gamma_0*pi_g`；
- `p_g` 是 fixed computational truncation，不是 estimand/unknown species count；
- `Sigma_W` 限 finite working set；
- Lineage relation 语义；
- 三个 first-paper datasets pending；
- marked discovery theorem pending；
- GSMc 不进入主证据链。

所有 scientific regression 继续运行。

## 13. Automated verification

新增：

```text
npm run test:architecture-rc5
```

至少覆盖：

- math renderer / no raw critical LaTeX surface；
- Clear atomic state；
- search cross-view result truth；
- view header synchronization；
- active view/model selector semantics；
- no reintroduction of legacy 1.x surface。

Playwright 至少覆盖：

1. CAT Architecture dark 1536；
2. CAT Architecture light 1536；
3. CAT Architecture dark 1366；
4. Original TRACE；
5. `beta^U_gh` trace；
6. `p_g` Recursive/Both + Parameterization → Clear；
7. all graph `Finland` -> Evidence；
8. all graph `HMSC` -> Lineage；
9. no-result search；
10. fast view loop and right header sync；
11. keyboard model switch + skip path；
12. Save/Restore with transient search cleanup；
13. Lineage/Evidence smoke；
14. dark/light no framework overlay / no unexplained page error。

运行：

```text
npm run build
npm run test:regression
npm run test:architecture-rc5
npm run bench:architecture-g05
npm run test:browser
git diff --check
```

## 14. Version / result / commit

更新：

- `package.json` / lockfile -> `2.0.0-rc.5`；
- `CHANGELOG.md`；
- `README.md`；
- `ROADMAP.md` / `VERSIONING.md` 如需要；
- 写 `results/asteria_v2_rc5_blackbox_repair/result.md`。

完成测试后：

```text
commit = v2.0.0-rc.5
push origin/main
HEAD == origin/main
worktree clean
```

## 15. Fixed public URL 是交付 gate

严格执行：

```text
docs/notes/2026-09-12_asteria_acceptance_mode_public_refresh_contract.md
```

最终必须确认：

```text
PUBLIC_ACCEPTANCE_URL = https://asteria.httpwwwcardiacnexus-ukb.com/
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_ROOT_CHECK = PASS
PUBLIC_STATUS_CHECK = PASS
PUBLIC_BROWSER_SMOKE = PASS
PUBLIC_VERSION = 2.0.0-rc.5
```

不要创建 quick tunnel / alternate URL / VPS proxy。

## 16. 完成后不要请求人工验收

本任务的下一步固定为：

```text
NEXT_ACTION = GPT_WORK_BLACKBOX_REAUDIT
```

不要输出 `FINAL_USER_ACCEPTANCE`。

RC.5 public refresh 完成后停止，并返回：

```text
STATUS = COMPLETE
CURRENT_VERSION = 2.0.0-rc.5
FINAL_COMMIT = ...
P1_A_MATH_RENDERING = PASS
P1_B_1366_LAYOUT = PASS
P1_C_CLEAR_STATE = PASS
P1_D_LIGHT_CONTRAST = PASS
SEARCH_CROSS_VIEW = PASS
RIGHT_VIEW_HEADER_SYNC = PASS
KEYBOARD_MODEL_NAV = PASS
FIRST_TIME_UX_POLISH = PASS
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_BROWSER_SMOKE = PASS
NEXT_ACTION = GPT_WORK_BLACKBOX_REAUDIT
```

只有真实 hard blocker 才允许提前停止：

- unrelated dirty work 会被覆盖；
- correctness regression 无法合理修复；
- fixed public URL 无法恢复且必须改 infra；
- 需要未授权付费服务/credential；
- 现有技术栈无法实现且必须换框架。

普通 CSS、layout、component、accessibility、KaTeX 集成、search/clear state 修复由 Codex 自主完成，不询问用户。
