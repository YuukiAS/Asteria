---
id: asteria_v2_rc7_release_polish
title: Targeted RC.7 release polish for accessibility, light trace readability, disclosure, and Full-model reading controls
created_at: 2026-09-13
allow_code_change: true
allow_shell_command: true
allow_network: true
allow_external_upload: false
requires_human_approval: false
---

# Asteria 2.0 RC.7 — Targeted Release Polish

## 0. 目标

RC.6 已完成并通过 W02 scientific semantics、W03 interaction/state coherence、W01 visual 与 W04 first-time UX 的主 gate；剩余 FAIL 集中在 W05 accessibility/responsive 与 W06 disclosure/export red-team。

本任务是 **narrow release polish**，不是新一轮产品重构。

先读：

1. `AGENTS.md`
2. `prompts/AGENT_RULES.md`
3. `docs/operations/blackbox-audit/UI_BLACKBOX_BROWSER_CONTRACT.md`
4. `docs/operations/blackbox-audit/AUDIT_RESULT_CONTRACT.md`
5. `docs/operations/blackbox-audit/reports/RC6_REAUDIT_CONSOLIDATED_REPORT_2026-09-13.md`
6. `docs/notes/2026-09-12_asteria_acceptance_mode_public_refresh_contract.md`
7. `results/asteria_v2_rc6_blackbox_repair/result.md`
8. 当前 `App.tsx`, `ArchitectureWorkspace.tsx`, `ArchitectureReferencePanel.tsx`, session/styles/browser tests。

目标：

```text
version = 2.0.0-rc.7
commit = v2.0.0-rc.7
NEXT_ACTION = GPT_WORK_TARGETED_REAUDIT_W01_W05_W06
```

完成后不要要求用户人工验收，不要发布 `2.0.0` stable。

## 1. 严格边界

禁止：

- 修改 Original TRACE / CAT-TRACE Frozen V2 scientific definitions；
- 修改 canonical ontology / relation truth；
- 重写 recursive trace semantics；
- 改变 model/view/session persistence contract；
- 改 Evidence pending/support truth；
- 新增第三个 model；
- desktop/Tauri/Electron/Figma redesign；
- 恢复 1.x live UI；
- 改 fixed public URL / DNS / tunnel identity。

允许：

- keyboard/focus/accessibility 修复；
- CSS contrast/spacing/hit-target 修复；
- Full-model presentation-only viewport controls；
- Advanced/export disclosure state；
- topbar export feedback；
- selected/trace relation-label presentation；
- focused regression / Playwright coverage。

如果实现过程中发现必须修改 W02/W03/W04 的 semantic/state/IA 范围，停止扩张并在 result 标记 `REVIEWER_SCOPE_EXPANDED = YES`，说明原因；不要悄悄扩大任务。

## 2. P1 — Skip links 必须成为可靠键盘入口

当前 DOM 已有 `Skip to canvas / Skip to inspector`，但 W05 fresh keyboard audit 没有稳定观察到第一 Tab 落到可见 skip target。

要求：

1. skip links 是页面内容中最前的正常 tab stops；
2. fresh page 从 document/page content 开始按 Tab，第一/第二个可达 target 分别为 skip links（浏览器 chrome 自身不算页面内容）；
3. focus 时必须可见，不仅 `:focus-visible` 理论存在；可使用 `:focus` / `:focus-within` 的稳健组合；
4. `Skip to canvas` 后 focus 真正落到 `#asteria-canvas`；
5. `Skip to inspector` 后 focus 真正落到 `#asteria-inspector`；
6. target focus ring / visible focus state 明确；
7. 不用 hidden positive tabindex hack，不用脚本强抢初始 focus。

新增 exact Playwright regression：fresh context/page，依次 Tab，检查 activeElement/visible skip link，然后 Enter 并验证目标 focus。

## 3. P1 — Light theme trace-on readability

硬验收 viewport：`1366×768`。

在 CAT-TRACE Architecture Overview + Light + trace ON：

- muted nodes 仍能读 symbol / short label；
- muted edges 仍能看出上下文连接；
- selected/upstream/downstream 与 unrelated context 有明显层级，但 unrelated context 不接近 watermark；
- relation labels 不因 light theme 消失；
- 保持 non-color cue：upstream dashed、downstream solid/double/等价；
- 不通过把所有 graph elements 变成同一强度来解决。

保存 dark/light 同状态截图做 browser evidence。

## 4. P2 — Advanced / Export & validation 必须可靠展开

当前 native disclosure 在 W06 中 mouse/triangle/Enter/Space 均未稳定展开。

要求：

- 将该区域改为明确受控 disclosure，推荐 `button` + `aria-expanded` + `aria-controls` + collapsible region；
- 默认 closed；
- click / Enter / Space 都能打开和关闭；
- open 后 Markdown / Schema V2 / warnings / preview 可见；
- closed 时 raw JSON/schema detail 不进入主理解路径；
- accessibility tree 中能看到 expanded state；
- 不影响独立的 `Advanced metadata` disclosure，除非低成本统一交互实现。

Playwright 必须按 W06 最短路径测试 mouse + keyboard 两种打开方式。

## 5. P2/P3 — Top Export 必须有真实可见反馈

当前 topbar `Export` 不应只是 programmatically click 一个折叠区内部按钮。

目标行为建议：

1. 点击 topbar `Export`；
2. 自动展开 `Advanced / Export & validation`；
3. 将 inspector 滚动/聚焦到 Export 区；
4. 默认选择当前 export mode（不强制切换格式）；
5. 显示可见 status，如 `Export tools opened` 或等价；
6. 不自动下载，不产生破坏性副作用。

如果 inspector 当前 collapsed，允许先展开 inspector，再定位 export 区。

## 6. P2 — Compact top actions accessible names + hit targets

在 1366 compact layout：

- Search / Export / Save / Restore 无论视觉文字是否隐藏，都必须有显式 `aria-label`；
- inspector/theme 已有 label 的继续保留；
- compact action clickable/focusable box 尽量达到至少 `40×40` CSS px；
- focus ring 清楚；
- 不让 header 因此发生横向 overflow。

Playwright/DOM accessibility regression 检查按钮 accessible name。

## 7. P2 — Full model 可发现的局部阅读 controls

Full model 可以密，但必须可读。

在 Architecture canvas 增加小型 presentation-only controls：

```text
Zoom out | Fit | Zoom in
```

并提供可理解的 pan 行为：

- pointer drag pan，或等价显式 pan implementation；
- 当 zoom > fit 时可以移动查看局部；
- controls 有 aria-label / tooltip；
- keyboard 可以操作 zoom buttons；
- `Fit` 恢复 canonical viewport；
- transform 只属于 view presentation，不修改 entity/projection coordinates / relations；
- 切 model / view / Overview↔Full 时重置或合理迁移 viewport，不出现 stale transform；
- Overview 默认仍自动 fit/readable，不要求用户使用 controls。

1366 Full model browser test：Zoom in → pan 到另一局部 → Fit，确认 graph 可恢复。

## 8. P2 — context helper label/value spacing

修复 researcher helper / context cards 中 label-value 粘连：

- Project / View / Model 使用明确的 block/grid spacing；
- 不出现 `ProjectCurrent`, `ViewArchitecture`, `ModelArchitecture` 的视觉效果；
- 保持当前解释内容，不增加 onboarding wizard。

## 9. P2 — selected / trace relation label readability

只优化 presentation，不改 relation truth：

- selected/active trace edges 的 label 可见且归属清楚；
- label 尽量避开明显交叉点；
- 使用 canvas-colored halo/background 或等价增强，而不是永久显示所有关系标签；
- non-active graph 不重新变成满屏文字。

W01 关注的 `estimated by` / Lineage/Evidence dense labels 至少在 active selection 上应更易追踪。

## 10. Full-model clipping 低成本处理

不需要为了 Full model 重新布局整个 graph。

- key symbol 保持 rendered math；
- long human-readable label 允许两行 + title/tooltip；
- Zoom controls 提供局部阅读能力；
- 不要求 1366 fit-to-screen 状态能直接读完全部 37 nodes。

## 11. 明确 defer 的 RC.6 PASS reviewer 建议

本任务不要顺手扩范围处理：

- W04 更强 reading-mode 默认；
- claim-specific Evidence closure copy；
- exact-symbol search ranking；
- 125% browser zoom；
- 其他非阻断 onboarding/polish。

这些进入 2.0.x backlog，除非修当前 blocker 时不可避免。

## 12. Regression

新增：

```text
npm run test:architecture-rc7
```

至少覆盖：

- version = rc.7；
- skip links present, first-tab semantics supported by markup/styles；
- compact top actions have aria-labels；
- Advanced/export controlled disclosure exists with aria-expanded；
- Full-model zoom/fit controls exist and presentation transform is non-semantic；
- no scientific fixture / trace algorithm changes beyond incidental formatting；
- legacy 1.x active UI remains absent。

Playwright 至少覆盖：

1. fresh page first/second Tab skip links + target focus；
2. 1366 CAT Overview Light trace OFF/ON screenshots；
3. compact top action accessible names and dimensions；
4. Advanced/export mouse disclosure；
5. Advanced/export keyboard disclosure；
6. top Export opens/focuses advanced export surface + visible feedback；
7. Full model Zoom in / pan / Fit；
8. context helper spacing screenshot；
9. active trace relation-label screenshot；
10. W06 basic stress smoke：model/view/trace/search/save/restore/refresh 不回归。

运行：

```text
npm run build
npm run test:regression
npm run test:architecture-rc7
npm run bench:architecture-g05
npm run test:browser
git diff --check
```

## 13. Version / result / commit

更新：

- `package.json`, lockfile -> `2.0.0-rc.7`；
- `CHANGELOG.md`；
- `README.md`；
- `ROADMAP.md` / `VERSIONING.md` 如需要；
- 写 `results/asteria_v2_rc7_release_polish/result.md`。

完成后：

```text
commit = v2.0.0-rc.7
push origin/main
HEAD == origin/main
worktree clean
```

## 14. Fixed public URL gate

严格执行：

`docs/notes/2026-09-12_asteria_acceptance_mode_public_refresh_contract.md`

必须确认：

```text
PUBLIC_ACCEPTANCE_URL = https://asteria.httpwwwcardiacnexus-ukb.com/
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_ROOT_CHECK = PASS
PUBLIC_STATUS_CHECK = PASS
PUBLIC_BROWSER_SMOKE = PASS
PUBLIC_VERSION = 2.0.0-rc.7
```

不要创建 quick tunnel / alternate URL / VPS proxy。

## 15. 完成后下一步

这是窄修复，因此完成后**不要再要求六个 GPT Work**。

预期 targeted re-audit：

```text
W01 + W05 + W06
```

W02/W03/W04 的 RC.6 PASS 可以 carry forward，前提是：

```text
REVIEWER_SCOPE_EXPANDED = NO
```

最终返回：

```text
STATUS = COMPLETE
CURRENT_VERSION = 2.0.0-rc.7
FINAL_COMMIT = ...
SKIP_LINKS = PASS
LIGHT_TRACE_READABILITY = PASS
ADVANCED_EXPORT_DISCLOSURE = PASS
TOP_EXPORT_FEEDBACK = PASS
TOPBAR_ACCESSIBLE_NAMES = PASS
FULL_MODEL_READING_CONTROLS = PASS
CONTEXT_HELPER_SPACING = PASS
TRACE_RELATION_LABELS = PASS
REVIEWER_SCOPE_EXPANDED = NO | YES
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES
PUBLIC_BROWSER_SMOKE = PASS
NEXT_ACTION = GPT_WORK_TARGETED_REAUDIT_W01_W05_W06
```

只有真实 hard blocker 才允许提前停止。