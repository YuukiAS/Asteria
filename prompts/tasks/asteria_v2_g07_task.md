---
id: asteria_v2_g07
title: Prototype a lightweight desktop Asteria platform
created_at: 2026-09-08
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Goal G07 — Desktop Platform：优先 Tauri 2，而不是直接套 Electron

## 1. 执行时机

这是 2.x 平台化 Goal，不属于 G00–G05 自动核心链。只有 Web Architecture 核心已经稳定，并且用户明确要求开始 desktop app 时执行。

## 2. 目标

在不分叉产品功能的前提下，为 Windows/macOS 建立轻量 desktop prototype。默认技术路线是：

> **现有 React/Vite UI + 平台无关 architecture domain + Tauri 2 shell/adapters。**

Electron 不是默认方案。只有有明确证据证明 Tauri 无法满足关键需求时，才在 result 中提出 Electron fallback；不得同时维护两套 shell。

## 3. 必须先读

- `docs/notes/2026-09-08_asteria_v2_master_plan.md`
- `docs/notes/2026-09-08_asteria_v2_product_design_and_desktop_strategy.md`
- `docs/notes/2026-09-08_asteria_v2_image_prompt_library.md` 的 Prompt F
- `results/asteria_v2_g05_result.md`
- 若已执行 G06，则读取其 result
- 当前 persistence/import/export/keyboard/platform API 实现。

## 4. 先做平台抽象

在引入 desktop shell 前，确保 domain graph 无 browser-only API。抽象至少包括：

```ts
interface PersistenceAdapter { ... }
interface FileAdapter { ... }
interface PlatformCapabilities { ... }
```

Web adapter 保持：Dexie / shared HTTP / browser download-open workflow。

Desktop adapter 才负责：

- native open/save file dialog；
- local project file；
- native window state；
- menu/shortcut integration；
- 可选 automatic backup location。

Clipboard 若可直接共享 Web API，可不强行抽象；只有确有差异时再加。

## 5. Tauri 2 prototype

允许联网仅用于：

- 获取官方 Tauri 2 依赖/工具链；
- 查官方文档；
- 安装本项目所需的最小依赖。

禁止把项目数据上传到第三方服务。

Prototype 必须：

- 复用现有 React/Vite；
- 不复制一套 desktop-only UI；
- 支持打开/保存 schema-v2 project；
- 支持 export Markdown/JSON；
- 支持本地离线启动；
- Windows/macOS 至少在可用环境中验证一端 build，另一端建立 CI/文档或可验证配置；
- 保留 Web build。

## 6. 性能/体积验收

记录：

- cold start；
- idle memory；
- 打开 CAT reference 的时间；
- 打开 stress fixture 的时间；
- installer/app bundle 大小；
- native file save/load；
- Web 版相同核心操作的对照。

不预设伪精确阈值，但必须用证据判断是否满足“轻量、不卡”的方向。

如果 Tauri 系统 WebView 在公式/React Flow/TipTap 渲染上出现实质不一致，必须记录具体复现，再讨论 Electron；不能仅因为 Electron 熟悉就换。

## 7. 产品一致性

- desktop 不新增独有 model schema；
- desktop project 文件应与 Web schema-v2 JSON 互通；
- current fixed Web public link 不改变；
- local-first 仍是默认；
- shared-server 继续是 Web workflow，不要求 desktop 第一版复刻多人同步。

## 8. 设计

如果 desktop chrome 需要视觉概念，使用 image prompt library Prompt F。不要做 VS Code 式厚重 shell。Windows/macOS 的 window chrome/menus 可以有平台适配，但 canvas/inspector/design system 共享。

Figma 仅在此时 design system 已稳定、确实需要跨平台 token/spec 时使用。

## 9. 停止条件

遇到以下情况必须停止并报告：

- 需要签名证书、付费 developer account 或发布 credential；
- 需要修改生产部署；
- 需要 Electron fallback；
- 需要不可逆 project-file migration；
- 当前环境无法安全安装 Tauri/Rust prerequisites。

不要绕过 credential 或自动发布 installer。

## 10. Result

写：

```text
results/asteria_v2_g07_result.md
```

必须包含：adapter design、Tauri structure、build evidence、performance/size table、Web regression、平台差异、是否需要 Electron、后续签名/发布人工项、commit/push。