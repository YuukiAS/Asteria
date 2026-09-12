# Asteria 2.0 GPT Work Black-box Audit

日期：2026-09-12
目标版本：`2.0.0-rc.4`
固定验收入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`

## 目的

这是 Asteria 2.0 stable 前的独立黑箱验收 campaign。用户已经确认仅靠自动 regression / Playwright 不能替代产品级验收，因此使用多个互相独立的 GPT Work reviewer，从不同角度直接操作固定公网产品。

本 campaign 不修改产品，不读实现源码，不读数据库，不调用内部 API，不使用 DevTools/console/network panel，不根据代码猜 bug。所有结论都必须来自普通用户在页面上实际看到、点击、切换、输入和导出的结果。

## 并行 reviewer

- `W01` Visual / scientific-product design：版式、数学可读性、graph visual grammar、accepted concept fidelity。
- `W02` Statistical semantics：Original TRACE / CAT-TRACE 的可见科学语义、符号、关系、模型切换与 Evidence 边界。
- `W03` Interaction / state coherence：model/view/trace/layer/search/export/theme/save-restore 的状态一致性。
- `W04` First-time researcher UX：不看说明书时是否能理解产品、导航、术语和核心价值。
- `W05` Responsive / accessibility：1536×864、1366×768、浏览器 zoom/keyboard/scroll/contrast 等可用性。
- `W06` Release red-team：通过正常用户操作故意寻找 stale state、空白、错配、失效按钮、重复切换后的异常，并给 release gate 判断。

六个 reviewer 应彼此独立运行，避免前一个 reviewer 的结论污染后一个 reviewer。

## 使用方式

1. 每个 GPT Work 新开独立任务。
2. 粘贴 `ASTERIA_RC4_GPT_WORK_CAMPAIGN.md` 中对应 W01–W06 prompt。
3. 不需要把 repo source 提供给 Work。
4. Work 必须遵守 `UI_BLACKBOX_BROWSER_CONTRACT.md` 和 `AUDIT_RESULT_CONTRACT.md`；campaign prompt 已内联关键规则，因此用户不需要额外解释。
5. 六份报告完成后，交回 ChatGPT 做 consolidated triage；不要让某一个 Work 自行修改 Asteria。

## Reference 边界

视觉 reviewer 可以把 `docs/design/accepted-concepts/` 下 A/B/C/D/E1/E2 作为设计 reference，但不能打开 `src/`、tests、results 或实现文档来解释页面为什么这样工作。

科学 reviewer 的 expected invariants 已直接写进 W02 prompt；不要从 concept image 抄公式、citation、result status。

## Severity

- `P0`：数据损坏、安全/隐私严重问题、产品完全不可用。
- `P1`：核心 Architecture/Lineage/Evidence 流程不可完成、科学含义明显错误、模型切换或状态真值错误、严重可读性问题使核心模型无法理解。
- `P2`：重要但有 workaround 的交互、视觉、术语、布局、状态反馈问题。
- `P3`：不阻塞使用的 polish / consistency / minor accessibility 问题。

stable `2.0.0` 至少要求：P0=0，P1=0；P2 必须逐项判断是否接受或修复。