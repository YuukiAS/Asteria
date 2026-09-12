# Asteria Black-box Audit Result Contract

每个 GPT Work reviewer 最终都必须按同一结构返回，方便后续合并。

Browser 合规必须以 `UI_BLACKBOX_BROWSER_CONTRACT.md` 为唯一来源。Browser implementation 不是结果真值；只要仍通过真实页面 UI 完成验收，使用 fallback 本身不算 contamination。

## Header

```text
AUDITOR_ID = W0X
AUDIT_RESULT = PASS | FAIL | BLOCKED
TARGET_URL = https://asteria.httpwwwcardiacnexus-ukb.com/
VERSION_OBSERVED = <visible version or UNKNOWN>
BROWSER_MODE = IN_APP | UI_AUTOMATION_FALLBACK | MIXED_UI
BLACK_BOX_CONTEXT_CONTAMINATED = YES | NO
BROWSER_BLOCKER = NONE | BLOCKED_BY_BROWSER_ENVIRONMENT
P0_COUNT = n
P1_COUNT = n
P2_COUNT = n
P3_COUNT = n
RELEASE_RECOMMENDATION = BLOCK | FIX_THEN_RETEST | ACCEPTABLE_WITH_P2 | ACCEPT
```

规则：

- `IN_APP`：全程使用 ChatGPT Work built-in / in-app Browser。
- `UI_AUTOMATION_FALLBACK`：in-app Browser 不稳定或不可用，改用真实浏览器 UI automation，如 Playwright / Chromium / Chrome / Edge / Browser helper。
- `MIXED_UI`：同一轮同时使用 in-app Browser 与合法 UI fallback。
- 使用 Playwright / selector / accessibility tree 来定位和操作真实可见控件，本身仍应记 `BLACK_BOX_CONTEXT_CONTAMINATED = NO`。
- 只有读取了普通用户不可见的内部实现信息，并可能影响后续判断，才设为 `YES`。
- 只有 in-app Browser 与合理真实-browser fallback 都无法继续真实 consumer UI 时，才允许 `BROWSER_BLOCKER = BLOCKED_BY_BROWSER_ENVIRONMENT`。

`PASS` 只代表该 reviewer 的指定范围没有发现 release-blocking defect；不是整个产品自动 PASS。

## Finding 格式

每个 finding 使用：

```text
ID: W0X-F01
Severity: P0 | P1 | P2 | P3
Surface: Architecture | Lineage | Evidence | Global shell | Search | Export | Session | Theme | Responsive | Other
Title: <一句话>

Start state:
...

Steps:
1. ...
2. ...

Observed:
...

Expected:
...

Impact:
...

Evidence:
<截图名称/描述 + 页面上可见文字或状态>

Reproducibility: ALWAYS | INTERMITTENT | ONCE
```

Browser timeout / handle lost / selector timeout 不能直接写成产品 finding。必须先重新观察真实页面，确认用户界面本身确实异常，再按 finding 记录。

## 报告正文顺序

1. `Executive summary`：3–8 句，说明这一路是否可验收。
2. `Coverage`：实际完成哪些操作；不要把没做的测试写成通过。
3. `Findings`：按 P0→P3 排序。
4. `Positive observations`：最多 5 条，只记录真正有效的地方。
5. `Not tested / safety boundary`。
6. `Browser execution note`：说明 in-app / fallback / mixed，以及是否 contamination；不要把工具故障混成产品 bug。
7. `Top fixes before stable`：最多 8 条，以用户影响排序，不猜实现方案。
8. Header 中的结构化结果块再次放在报告末尾。

## Severity 校准

### P0

仅用于严重数据损坏、安全/隐私问题或整体产品无法打开。不要滥用。

### P1

包括但不限于：

- Architecture / Lineage / Evidence 核心流程不能完成；
- Original TRACE / CAT-TRACE 切换出现明显错误模型内容或 stale state；
- 数学公式/符号的显示错误严重到用户无法理解核心模型；
- Evidence 把明确 pending 的研究状态错误显示为已完成；
- 主要页面在常规桌面 viewport 大面积不可读/不可操作；
- 页面版本不是本轮目标 RC。

### P2

重要可用性、视觉层级、术语、反馈、布局问题，存在 workaround 但明显降低科研工具价值。

### P3

细节 polish；不应把主观审美差异全部升成 P2。

## 禁止的报告写法

- 不写源码路径/root cause 猜测；
- 不写“看代码应该……”；
- 不因为一个按钮长得不好看就判 P1；
- 不因为不理解统计概念就自动判模型错误；
- 不用 concept image 中可能错误的公式作为科学真值；
- 不把 Playwright / Browser helper / selector 本身判成黑箱污染；
- 不把单纯 Browser timeout 判成产品 P1/P2/P3。
