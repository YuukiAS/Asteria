# Asteria 2.0 GPT Work Black-box Audit

日期：2026-09-12  
当前固定验收入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`

## 目的

Asteria 在 stable 前必须先经过独立 GPT Work 黑箱验收，再进入用户人工验收。自动 regression / Playwright 只能证明实现没有明显技术回归，不能替代真实产品级验收。

多个互相独立的 GPT Work reviewer 从不同角度直接操作固定公网产品。本 campaign 不修改产品，不读实现源码，不读数据库，不调用内部 API，不使用 DevTools/console/network panel，不根据代码猜 bug。所有结论必须来自普通用户在页面上实际看到、点击、切换、输入和导出的结果。

## Canonical Browser Contract

唯一 Browser 合规来源：

```text
docs/operations/blackbox-audit/UI_BLACKBOX_BROWSER_CONTRACT.md
```

最终发给任何 GPT Work 的 prompt 必须**逐字 inline 该文件当前全文**。Work 不需要、也不得访问 repo 来读取 Browser contract。只给文件路径、摘要或“请遵守该文件”不合规。

核心原则：

```text
可以自动操作页面；
不能绕过页面。
```

首选 ChatGPT Work built-in / in-app Browser；如果它没有稳定接口、无法附着或反复控制失败，允许 Playwright / playwright-core / Puppeteer / Chrome / Edge / Chromium / Browser helper / 临时 browser profile / Node/Python helper 等真实浏览器 UI fallback。fallback 本身不算 contamination。

只有 in-app Browser 与合理真实-browser fallback 都无法继续真实 consumer UI 时，才允许 `BLOCKED_BY_BROWSER_ENVIRONMENT`。

## 并行 reviewer

- `W01` Visual / scientific-product design：版式、数学可读性、graph visual grammar、accepted concept fidelity。
- `W02` Statistical semantics：Original TRACE / CAT-TRACE 的可见科学语义、符号、关系、模型切换与 Evidence 边界。
- `W03` Interaction / state coherence：model/view/trace/layer/search/export/theme/save-restore 的状态一致性。
- `W04` First-time researcher UX：不看说明书时是否能理解产品、导航、术语和核心价值。
- `W05` Responsive / accessibility：1536×864、1366×768、zoom/keyboard/scroll/contrast 等可用性。
- `W06` Release red-team：通过正常用户操作故意寻找 stale state、空白、错配、失效按钮、重复切换后的异常，并给 release gate 判断。

六个 reviewer 应彼此独立运行，避免前一个 reviewer 的结论污染后一个 reviewer。

## Acceptance Gate：先 Work，后人工

Asteria 的 release/RC 验收顺序固定为：

```text
Codex implementation / repair
  -> automated regression + browser QA
  -> refresh fixed public URL
  -> GPT Work black-box campaign
  -> ChatGPT consolidated triage
  -> 如有 FAIL/BLOCKED 或 unresolved must-fix P2，继续 repair
  -> 所有 designated reviewer PASS
  -> P0 = 0, P1 = 0, unresolved must-fix P2 = 0
  -> 用户人工最终验收
  -> stable release
```

**在 GPT Work gate 通过前，不再要求用户人工打开页面验收。** 这样先让独立 Work 找出明显问题，避免用户重复浪费时间。

“All reviewer PASS” 是硬 gate。PASS 可以带少量 P2/P3，但 consolidated triage 必须把每个 P2 明确归类为 `must-fix` 或 `accepted/deferred`；只要还有 unresolved must-fix P2，就不能进入人工验收。

若 repair 广泛影响 math/layout/theme/state/search/inspector/accessibility 等多个 surface，应重跑完整 W01–W06 campaign。只有窄修复才允许只重跑受影响 reviewer + W06。

## 当前 RC.4 黑箱结论

六轮 RC.4 报告已汇总到：

```text
docs/operations/blackbox-audit/reports/RC4_CONSOLIDATED_REPORT_2026-09-12.md
```

当前结论：RC.4 不满足人工验收 gate。下一张 repair task：

```text
prompts/tasks/asteria_v2_rc5_blackbox_repair_task.md
```

RC.5 修复范围覆盖 math rendering、1366 responsive、Clear state truth、light contrast、trace readability、search cross-view、right header sync、inspector hierarchy、stable-facing wording、first-time comprehension 与 keyboard navigation。

RC.5 public refresh 后，应重跑完整 W01–W06，重新建立黑箱基线。

## 使用方式

1. 每个 GPT Work 新开独立任务。
2. ChatGPT 先读取当前 `UI_BLACKBOX_BROWSER_CONTRACT.md` 与 `AUDIT_RESULT_CONTRACT.md`。
3. 生成对应 persona prompt，并把 Browser contract 全文逐字 inline 到每一份最终 prompt。
4. 不需要把 repo source 提供给 Work；Work 不应读取 Asteria repo。
5. Work 最终必须按 `AUDIT_RESULT_CONTRACT.md` 返回 `BROWSER_MODE`、`BLACK_BOX_CONTEXT_CONTAMINATED`、`BROWSER_BLOCKER`、P0–P3 与 release recommendation。
6. 报告完成后交回 ChatGPT 做 consolidated triage；不要让某一个 Work 自行修改 Asteria。

## Reference 边界

视觉 reviewer 可以把 `docs/design/accepted-concepts/` 下 A/B/C/D/E1/E2 作为设计 reference，但 concept image 不是数学、citation 或 result-status 真值。

科学 reviewer 的 expected invariants 应直接 inline 到对应 prompt；不要让 Work 为获取 expected behavior 去读取 repo。

## Severity

- `P0`：数据损坏、安全/隐私严重问题、产品完全不可用。
- `P1`：核心 Architecture/Lineage/Evidence 流程不可完成、科学含义明显错误、模型切换或状态真值错误、严重可读性问题使核心模型无法理解。
- `P2`：重要但有 workaround 的交互、视觉、术语、布局、状态反馈问题。
- `P3`：不阻塞使用的 polish / consistency / minor accessibility 问题。
