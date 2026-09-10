---
id: asteria_v2_g05_browser_unblock
title: Bootstrap browser QA and resume Asteria 2.0 Web RC
created_at: 2026-09-10
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Asteria 2.0 G05 Browser QA Unblock + Resume Goal

## 0. 目的

当前 autonomous chain 已完成并推送 G00–G04，停在 `2.0.0-beta.2`。唯一已确认 blocker 是当前 CUHK Workstation WSL Codex session 没有 Browser/Playwright/Chromium，因此无法满足 G05/G06 的真实 browser QA gate。

本任务只负责解除这个环境 blocker，然后从 G05 继续原有 Asteria 2.0 Web 主链。**不要把代码迁移到 Windows-native repo，不要重开另一套产品实现。WSL worktree 继续是 source-of-truth。**

目标执行链：

```text
Browser QA bootstrap
  -> G05 Architecture Performance & Visual Convergence
  -> v2.0.0-rc.1
  -> G06 Architecture + Lineage + Evidence / Final Web RC
  -> v2.0.0-rc.2
  -> STOP FOR FINAL USER ACCEPTANCE
```

最终仍不得自动发布 `2.0.0` stable。

## 1. 必须先读

- `AGENTS.md`
- `prompts/AGENT_RULES.md`
- `prompts/CHATGPT_RULES.md`
- `ROADMAP.md`
- `VERSIONING.md`
- `prompts/tasks/asteria_v2_core_autonomous_task.md`
- `prompts/tasks/asteria_v2_g05_task.md`
- `docs/notes/goal_specs/asteria_v2_g05_goal_spec.md`
- `prompts/tasks/asteria_v2_g06_task.md`
- `docs/notes/goal_specs/asteria_v2_g06_goal_spec.md`
- `results/asteria_v2_core_autonomous_result.md`
- `results/asteria_v2_g04_result.md`
- Build Web Apps / frontend testing-debugging / React best-practices skills if they are available in this Codex session.

先确认 `main`、`origin/main` 和 worktree 状态。保护 unrelated dirty work。

## 2. Browser 路由优先级

### 2.1 如果当前 session 已有 Browser tool/skill

优先按 frontend-testing-debugging skill 使用 Browser。不要再安装 Playwright。

### 2.2 如果 Browser 仍然 absent

这已是当前已确认环境。允许使用 regular Playwright fallback，并记录：

```text
BROWSER_PATH = PLAYWRIGHT_FALLBACK
BROWSER_PLUGIN_REASON = Browser tool/skill not available in current WSL Codex session
```

为了避免用户持续人工盯批准，本任务**明确预授权一次、范围严格受限的 QA tooling bootstrap**。

允许的新增开发依赖仅为：

```text
@playwright/test
```

允许：

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

以及等价的、只针对当前 lockfile/package manager 的 npm/Playwright 命令。网络只允许 npm 官方 registry 及 Playwright 官方 browser artifact 下载所必需的请求，再加原任务已经允许的现有 GitHub origin fetch/push。

禁止借此安装 Puppeteer、Selenium、通用浏览器自动化框架、桌面自动化工具或无关 npm 包。

Playwright browser binary 写入正常用户 cache，不提交到 repo。

如果 `npx playwright install chromium` 成功但 Chromium 因缺少 Linux shared libraries 无法启动：

1. 先输出 Playwright/loader 报告的**准确缺失依赖**；
2. 不自行使用通用 `sudo apt install ...`；
3. 若当前 Host Policy/Auto-review 已有安全、明确的 Playwright dependency bootstrap 能力，可使用 Playwright 官方的精确 `install-deps chromium` 路径；
4. 否则只在这里停止，返回 `NEEDS_ONE_TIME_OS_DEPENDENCY_SETUP`，不要转去 Windows 重写项目。

## 3. QA tooling 应成为可重复的开发资产

如果走 Playwright fallback，应把最小可重复 QA 基础设施纳入 G05：

- `@playwright/test` devDependency + lockfile；
- 一个克制的 Playwright config；
- 必要的 `npm run test:e2e` / `test:browser` 脚本；
- G05 真实流程所需的 focused e2e/smoke tests。

不要提交 browser binary、巨大截图 cache、trace archive 或 HTML report。截图与临时证据默认写 repo 外；只有 G05/G06 spec 明确要求 committed evidence 时才写入 tracked artifacts。

这不是把 Playwright 变成 production dependency；它只属于开发/QA。

## 4. G05 必须真正继续，而不是只证明浏览器能开

Browser/Playwright smoke 通过后，立即继续执行 `asteria_v2_g05_task.md` 与其 goal spec 的全部内容，包括：

- performance/stress evidence；
- Zustand/render hot-path 收敛；
- projection/history/heavy component 优化；
- Architecture interaction polish；
- A/B/C/D accepted-concept fidelity；
- Original TRACE / CAT-TRACE browser flow；
- trace / layer / outline / binding / semantic diff；
- export；
- legacy import；
- Story；
- save/restore；
- desktop + narrower laptop viewport；
- console health / screenshot evidence / interaction proof。

Browser QA 失败时应先修真正产品问题并重跑，不要把“浏览器能启动”当成 G05 通过。

G05 完成后按原版本规则提交并 push：

```text
2.0.0-rc.1
commit: v2.0.0-rc.1
G06_READY = YES
```

## 5. G05 通过后自动进入 G06

不要等待用户中途验收。继续执行 G06：

- Architecture / Lineage / Evidence 共享 canonical graph；
- independent layouts/projections；
- cross-view selection/links；
- method-level Lineage；
- claim-centered Evidence；
- accepted E1/E2 visual fidelity；
- browser QA；
- regression/performance；
- legacy compatibility。

使用 G05 已建立的 Browser/Playwright QA 路径，不重复更换测试框架。

G06 完成后提交并 push：

```text
2.0.0-rc.2
commit: v2.0.0-rc.2
ASTERIA_V2_WEB_RC_READY_FOR_USER_ACCEPTANCE = YES/NO
NEXT_ACTION = FINAL_USER_ACCEPTANCE
```

然后停止。

## 6. Product Design / Figma

- 如果 Product Design / frontend-app-builder skill 已可用，可用于 accepted-concept implementation inventory、design token 提取、mismatch ledger 和真实截图对照。
- 它**不能替代 browser QA**。
- Figma 仍非前置条件。不要因为 Browser blocker 改去 Figma，也不要重新设计 shell。

## 7. 不要切到 Windows-native 开发

当前 blocker 是 QA runtime 缺失，不是 WSL 代码执行能力不足。禁止为了 G05：

- 在 Windows 另 clone 一份 Asteria；
- 把 node_modules / build toolchain 迁到 Windows；
- 建立第二套 source-of-truth；
- 因 Windows/WSL path 差异改产品代码；
- 用手工打开浏览器截图冒充自动 browser QA。

若未来需要 Windows desktop browser 作为额外人工/Browser-use 验收，可以针对 WSL dev server 建安全端口访问，但那不是本任务完成 G05/G06 的首选路径。

## 8. 网络与 Git 边界

除本文件第 2 节明确授权的 npm/Playwright QA bootstrap 外，恢复原 autonomous task 的网络边界：只允许现有 GitHub origin 普通 fetch/push。

仍禁止：

- force push / force-with-lease；
- branch/tag deletion；
- remote mutation；
- fixed public URL / Cloudflare / production infra 修改；
- 任意网页研究或外部 API；
- 外部上传；
- 无关依赖下载。

## 9. 最终返回

最终只在 G06 完成或真实 hard blocker 时停止。若成功，至少返回：

```text
BROWSER_PATH =
PLAYWRIGHT_VERSION =
CHROMIUM_SMOKE = PASS/FAIL
G05_VERSION =
G05_COMMIT =
G06_VERSION =
G06_COMMIT =
AUTONOMOUS_CHAIN_STATUS = COMPLETE_THROUGH_FINAL_WEB_RC
ASTERIA_V2_WEB_RC_READY_FOR_USER_ACCEPTANCE = YES/NO
NEXT_ACTION = FINAL_USER_ACCEPTANCE
```

若只能因 Linux runtime dependency 停止：

```text
AUTONOMOUS_CHAIN_STATUS = NEEDS_ONE_TIME_OS_DEPENDENCY_SETUP
MISSING_OS_DEPENDENCIES = ...
EXACT_SAFE_COMMAND = ...
NEXT_GOAL = G05
```

除此以外，不因为 ordinary UI/CSS/layout/QA 修复询问用户。