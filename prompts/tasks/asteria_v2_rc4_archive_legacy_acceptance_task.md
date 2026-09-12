---
id: asteria_v2_rc4_archive_legacy_acceptance
title: Make Asteria 2.0 the only active product shell and archive Asteria 1.x UI
created_at: 2026-09-12
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Asteria 2.0 RC.4 — Archive Legacy UI + Direct 2.0 Acceptance Entry

## 0. 用户意图

用户正在通过固定公网入口进行最终人工验收：

```text
https://asteria.httpwwwcardiacnexus-ukb.com/
```

当前 `2.0.0-rc.3` 打开后仍先进入 Asteria 1.x legacy canvas，并弹出 `Choose a starting version / Use shared version / New from scratch`。用户明确决定：**旧 1.x 产品界面不再作为 2.0 的可见入口，不保留隐藏 live mode；把它归档。Asteria 2.0 打开后直接进入新的 Architecture / Lineage / Evidence 产品。**

本任务是最终 acceptance navigation/product-shell 修复，不扩 ontology，不新增模型，不进入 desktop。

目标版本：

```text
2.0.0-rc.4
```

目标 commit：

```text
v2.0.0-rc.4
```

## 1. 必须先读

1. `AGENTS.md`
2. `prompts/AGENT_RULES.md`
3. `ROADMAP.md`
4. `VERSIONING.md`
5. `docs/notes/2026-09-09_asteria_v2_web_delivery_plan.md`
6. `docs/notes/2026-09-11_asteria_v2_rc2_acceptance_audit.md`
7. `results/asteria_v2_rc3_acceptance/result.md`
8. `docs/notes/2026-09-12_asteria_acceptance_mode_public_refresh_contract.md`
9. 当前 `src/app/App.tsx`
10. `src/architecture/session.tsx`
11. `src/components/ArchitectureWorkspace.tsx`
12. `src/components/ArchitectureReferencePanel.tsx`
13. 当前 legacy Canvas / Toolbar / Inspector / Story / persistence UI 及相关 tests。

Acceptance concept A/B/C/D/E1/E2 仍是 visual / interaction reference；科学真值仍来自 canonical references，不从截图抄公式/citation/status。

## 2. 产品边界：2.0 是唯一 active shell

最终 active Web app 必须满足：

```text
Asteria 2.0
Project: CAT-TRACE
View: Architecture | Lineage | Evidence
Model (Architecture): Original TRACE | CAT-TRACE Frozen V2
```

默认首次打开：

```text
Project = CAT-TRACE
View = Architecture
Model = CAT-TRACE Frozen V2
Selected symbol = beta^U_gh
Theme = existing saved theme, otherwise dark
```

如果存在有效的 Asteria 2.0 local view state，可恢复上次的 2.0 view/model/selection；但**绝不能因此回到 Asteria 1.x canvas**。

## 3. 删除 active legacy startup flow

从 active app 中彻底移除：

- `Choose a starting version`；
- `Use shared version` / `New from scratch` startup chooser；
- 1.x shared/local workspace 决策作为 app 启动 gate；
- 默认旧 React Flow block canvas；
- 旧 `Move / Edit / Zoom / New block / Equation / Fit / Clean` 这一套主产品 toolbar；
- 旧 Inspector / Story 作为顶层 active product tabs；
- 任何能让用户重新进入 live Asteria 1.x 编辑器的隐藏按钮、query param、tab 或兼容入口。

打开 fixed public URL 后，用户第一屏就必须是 Asteria 2.0，不允许先点任何 legacy chooser。

## 4. Archive Asteria 1.x UI，不做 hidden live mode

先做真实 dependency inventory，然后将**不再被 2.0 active runtime 使用的 1.x UI/runtime files**从 active `src/` 路径移出，归档到：

```text
archive/asteria-v1-ui/
```

建议保留原相对目录层级，并新增：

```text
archive/asteria-v1-ui/README.md
```

README 必须说明：

- `v1.0.0` commit 是完整历史冻结点；
- 此目录只是历史源代码归档，不参与当前 build；
- Asteria 2.0 不提供 live legacy canvas；
- 如需追溯完整旧产品，以 git tag/commit `v1.0.0` 为准。

应优先归档/移出 active bundle 的对象包括但不限于：旧 Canvas、旧 top Toolbar、旧 block Inspector、旧 Story UI、旧 startup/shared chooser 及只服务这些 live flows 的组件。

**不要盲目搬迁仍被 2.0 schema migration/tests 依赖的底层类型或数据兼容代码。**

以下内容允许继续留在 active source 作为 compatibility layer，而不是 live UI：

- v1 payload/type definitions（若 v1→v2 migration 需要）；
- `migrateV1ToV2` / legacy import parser；
- regression fixtures；
- compatibility tests；
- 必要的 archive readers。

原则：

> **保留 migration compatibility，不保留 legacy product surface。**

## 5. 建立真正的 Asteria 2.0 Root Shell

重构 `App.tsx`（或新增清晰 root shell component）使 active render tree 只围绕：

- `ArchitectureSessionProvider`；
- Asteria 2.0 top command bar；
- 2.0 left view rail / navigation；
- central `ArchitectureWorkspace`；
- right `ArchitectureReferencePanel` / context inspector。

### 5.1 顶部 command bar

不需要重新发散设计；沿 accepted B/E1/E2 方向收口即可。至少应清楚显示：

- Asteria 2.0 + current version；
- Project = CAT-TRACE；
- current View；
- current Model（Architecture 时）；
- Search；
- Export；
- theme toggle；
- Save/Restore 仅指 2.0 view/session state，不再指旧 shared canvas map。

不要把 1.x toolbar 控件继续混进来。

### 5.2 Views

Architecture / Lineage / Evidence 必须是一级导航。

- Architecture：显示 Original TRACE / CAT-TRACE canonical model selector；
- Lineage：method-level map；
- Evidence：claim-centered graph；
- view switch 后中央 graph 与右 inspector 使用同一 session state。

### 5.3 2.0 session persistence

使用现有 `ArchitectureSession` 的 local state 机制，整理为稳定的 2.0 session restore：

- active view；
- active model；
- selected entity/symbol；
- trace mode/direction/depth；
- focused layer；
- theme（现有机制即可）。

首次无 state 时按本任务第 2 节默认值进入。

不要求本任务建立多人共享的 schema-v2 backend；不要因为移除旧 shared-map chooser 又重造一个 persistence backend。

## 6. Legacy import 的处理

Asteria 1.x live UI 被 archive 后，仍应保留 v1→v2 migration regression。

如果当前 2.0 UI 中存在 `Legacy V1` compatibility test/button，只允许以下两种处理之一：

1. 改成明确的 `Import legacy Asteria 1.x file` → migration into 2.0；或
2. 如果当前实际还没有安全、真实的用户文件导入闭环，就从主 UI 移除，仅保留 migration test/fixture。

不要保留一个会把用户重新带回旧 Canvas 的 compatibility button。

## 7. Shared server / fixed public URL

`scripts/asteria-server.mjs` 目前同时承担 fixed public origin 与旧 shared-map API。

本任务不要因为 archive 1.x UI 而破坏 fixed public origin。

允许：

- 保留旧 `/api/asteria/map` compatibility endpoint，只要 active 2.0 UI 完全不依赖它；
- 在 README/代码注释中标记其为 legacy compatibility API。

不要求在 RC.4 删除该 API；避免为了清理旧 UI扩大到 deployment/data migration。

## 8. 验收期间 PUBLIC URL REFRESH 是硬 gate

严格执行：

```text
docs/notes/2026-09-12_asteria_acceptance_mode_public_refresh_contract.md
```

特别强调：**本任务完成后的用户验收对象是固定公网 URL，不是 localhost。**

每个本轮用户可见代码 commit 完成后，必须确保 fixed public URL 已加载最新代码；最终 version commit 后必须再次执行完整 refresh + verification。

固定入口只有：

```text
https://asteria.httpwwwcardiacnexus-ukb.com/
```

不要创建 quick tunnel / alternate URL / VPS proxy。

如果 shared server 需要重启，使用 `AGENTS.md` 已冻结的现有命令；如果 tunnel 已健康，不要重启 tunnel。

最终必须使用 Playwright/Browser **直接对 fixed public URL** 做 smoke，而不是只对 localhost。

## 9. Regression / Browser QA

新增专门 RC.4 regression，例如：

```text
npm run test:architecture-rc4
```

至少断言：

1. active `App.tsx` 不再 import/render legacy `Canvas`；
2. active app 不包含 startup chooser 文案 `Choose a starting version`；
3. active app 不包含 `Use shared version` / `New from scratch`；
4. active app 不存在 live legacy navigation；
5. fixed initial session = CAT-TRACE Architecture；
6. Original TRACE / CAT-TRACE selector 能真实改变 central projection；
7. Architecture / Lineage / Evidence 均可从第一层导航直接进入；
8. v1 migration regression 仍通过；
9. archived UI 不参与 production build/import graph。

### Playwright

现有 Playwright Chromium 已安装。扩展 browser suite：

- 打开 app 后无需任何 modal/button，直接看到 Asteria 2.0 Architecture；
- 首屏可见 CAT-TRACE Frozen V2；
- 切 Original TRACE；
- 切 Lineage；
- 切 Evidence；
- 回 Architecture；
- dark/light；
- 2.0 save/restore state；
- 断言页面上没有 legacy startup chooser；
- 断言没有旧 toolbar 的 primary controls。

本地 QA 通过后，再对 fixed public URL 重复最小 acceptance smoke。

## 10. Visual acceptance

不要重新设计产品。沿 B/E1/E2 已接受方向收口：

- dark Quiet Celestial shell；
- canvas 为主体；
- left rail / central graph / right inspector；
- toolbar 克制；
- 不出现旧 block-canvas controls；
- light mode 仍能使用。

生成最终 public acceptance screenshots（可覆盖旧 RC.3 screenshots），至少：

```text
results/asteria_v2_rc4_acceptance/screenshots/
  architecture-cat-trace-dark.png
  architecture-original-trace-dark.png
  lineage-dark.png
  evidence-dark.png
  architecture-light.png
```

截图必须来自当前 RC.4 UI；至少额外记录一张/一项 public fixed URL smoke evidence。

## 11. 测试与版本

至少执行：

```text
npm run build
npm run test:regression
npm run test:architecture-rc4
npm run bench:architecture-g05
npm run test:browser
git diff --check
```

更新：

- `package.json` / lockfile version；
- `CHANGELOG.md`；
- `README.md`；
- `ROADMAP.md`；
- `VERSIONING.md`；
- acceptance result。

写：

```text
results/asteria_v2_rc4_acceptance/result.md
```

## 12. Commit / push / public refresh

完成 gate 后：

1. version = `2.0.0-rc.4`；
2. commit = `v2.0.0-rc.4`；
3. 普通 push `origin/main`；
4. `HEAD == origin/main`；
5. worktree clean；
6. refresh fixed public URL；
7. public root/status/browser smoke 全 PASS；
8. 再停止等待用户验收。

最终 result 必须包含：

```text
STATUS = COMPLETE
CURRENT_VERSION = 2.0.0-rc.4
LEGACY_LIVE_UI = ARCHIVED
LEGACY_MIGRATION_COMPATIBILITY = PASS
PUBLIC_ACCEPTANCE_URL = https://asteria.httpwwwcardiacnexus-ukb.com/
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_ROOT_CHECK = PASS
PUBLIC_STATUS_CHECK = PASS
PUBLIC_BROWSER_SMOKE = PASS
PUBLIC_VERSION = 2.0.0-rc.4
ASTERIA_V2_WEB_RC_READY_FOR_USER_ACCEPTANCE = YES
NEXT_ACTION = FINAL_USER_ACCEPTANCE
```

## 13. 停止条件

只有以下情况允许在 RC.4 完成前停止：

- archive legacy UI 会不可避免破坏 v1→v2 migration data compatibility；
- fixed public URL / existing tunnel 无法恢复且需要改变 DNS/infra；
- correctness/regression 合理修复后仍失败；
- unrelated dirty work 会被覆盖。

普通组件拆分、CSS、导航布局、archive file list、测试组织由 Codex 自主决定，不询问用户。

**不要发布 `2.0.0` stable。RC.4 完成后仍需用户人工验收。**
