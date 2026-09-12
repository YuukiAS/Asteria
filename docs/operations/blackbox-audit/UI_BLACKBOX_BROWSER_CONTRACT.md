# Asteria UI Black-box Browser Contract

这是 Asteria 2.0 GPT Work 验收的唯一 black-box 浏览规则。

## Target

只验收固定公网产品：

```text
https://asteria.httpwwwcardiacnexus-ukb.com/
```

预期版本：`2.0.0-rc.4`。如果首屏观察到其他版本，记录 `P1 PUBLIC_VERSION_STALE`，不要用 localhost 或其他 URL 代替。

## 允许

- 使用 GPT Work / Cloud Browser 正常打开网页；
- 使用普通鼠标、键盘、滚动、浏览器缩放、窗口尺寸调整；
- 点击页面内正常可见控件；
- 截图作为证据；
- 使用页面本身公开的 Search / Export / Save / Restore / theme / model / view / trace / layer 等功能；
- Export 仅用于读取导出结果，不修改 server；
- Save/Restore 仅在 UI 明确表明是当前 2.0 local/session state 时使用；如含义不清楚，跳过并记录 ambiguity。

## 禁止

黑箱 auditor 不得：

- 打开 GitHub `src/`、tests、results、commit diff 或实现代码来找答案；
- 使用 DevTools、console、Network panel、React inspector、DOM hidden state 或 accessibility tree 中用户不可见内容作为 bug 证据；
- 直接请求 `/api/...` 或其他内部 endpoint；
- 查询数据库、本地文件、IndexedDB/localStorage 内容；
- 修改 URL query/hash 以进入隐藏状态；
- 写脚本、Playwright、JavaScript 注入、自动化 selector 来代替普通 UI 操作；
- 修改或修复产品；
- 创建、覆盖或删除 shared/public product data；
- 因为知道 repo 实现而推断用户看不到的 bug。

## Evidence 原则

每个 finding 必须来自可复现的可见现象，并至少包含：

1. 起始状态；
2. 正常用户操作步骤；
3. Observed；
4. Expected；
5. 用户影响；
6. screenshot / visible-state evidence。

不要用“代码大概是……”作为 root cause。黑箱报告只写产品症状；修复阶段由 Codex 再定位源码。

## 修改隔离

多个 GPT Work reviewer 并行运行，必须保持只读/非破坏性。不要互相依赖前一轮的浏览器状态或报告。

如果某项测试需要明显改变公共数据或无法确认是否会覆盖他人状态，标记 `NOT_TESTED_SAFETY_BOUNDARY`，不要尝试。

## 截图

优先保存：

- 首屏；
- finding 发生后的状态；
- 与前后状态对比时的两个关键状态；
- responsive / theme 差异。

截图应能让没有运行浏览器的人直接理解问题。