---
id: asteria_v2_g00
title: Freeze Asteria 1.x baseline before 2.0
created_at: 2026-09-08
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Goal G00 — 冻结 Asteria 1.x，建立 2.0 基线

## 1. 目标

把当前 Asteria 产品代正式冻结为 `1.0.0`，建立兼容性与性能基线，然后停止在 1.x 主数据模型上继续叠加新架构功能。

本 Goal **不实现 Asteria 2.0 semantic graph**。它只负责确认“我们从什么稳定状态出发”，以便后续 2.0 migration 有可信 oracle。

完成后，下一任务是 `prompts/tasks/asteria_v2_g01_task.md`。

## 2. 必须先读

按顺序读取：

1. `AGENTS.md`
2. `prompts/AGENT_RULES.md`
3. `prompts/CHATGPT_RULES.md`
4. `VERSIONING.md`
5. `docs/notes/2026-09-08_asteria_v2_master_plan.md`
6. `docs/notes/2026-09-08_asteria_v2_current_implementation_audit.md`
7. `README.md`
8. `package.json`
9. `src/types/map.ts`
10. `src/lib/exportImport.ts`
11. `src/lib/restoreSafety.ts`
12. `src/store/useMapStore.ts`
13. 所有现有 `npm run test:*` regression scripts。

## 3. 允许动作

- 修改版本记录、README、CHANGELOG；
- 增加 1.x canonical fixture / legacy export fixture；
- 增加不会改变产品语义的 regression tests；
- 增加只读 benchmark / profiling script；
- 修复本 Goal 新测试暴露的**确定性兼容 bug**，但必须最小化范围并单独记录；
- 运行本地 build/test/benchmark；
- 完成验证后 commit 并 push 当前 branch 到既有 origin。仓库已有普通 push standing authorization。

## 4. 禁止动作

- 不新增 canonical symbol registry；
- 不新增 typed semantic relations；
- 不新增 multi-view；
- 不重写 store；
- 不改固定公网入口、Cloudflare、shared runtime 或部署配置；
- 不下载新依赖；
- 不删除旧 map migration 逻辑；
- 不借 1.0.0 名义做视觉重设计。

## 5. 需要完成的工作

### 5.1 版本冻结

- 将 package 版本从当前 pre-1.0 状态正式更新为 `1.0.0`；
- CHANGELOG 顶部新增 `1.0.0`，明确这是“legacy research canvas generation freeze”；
- README 将当前 app version 更新为 `1.0.0`，并简短写明 2.0 semantic architecture 已进入后续开发，但 1.x map 继续兼容。

提交信息按仓库 version 规则使用：

```text
v1.0.0
```

### 5.2 兼容 fixture

新增至少一份 deterministic 1.x map fixture，覆盖：

- rich text + inline/display math；
- Symbol entries；
- edge visual style；
- model versions / inherited variants；
- Story Outline；
- viewport；
- group/frame（若现有 fixture 支持）；
- fixed/local/shared serialization 中与 schema 相关的字段。

fixture 不应包含真实私密项目数据。

### 5.3 Round-trip regression

增加测试：

```text
v1 fixture -> normalize/import -> export -> normalize
```

必须验证语义相关字段与 presentation 字段没有无故丢失。允许时间戳等明确 non-semantic 字段按当前实现变化，但测试必须说明。

### 5.4 当前性能基线

建立一个只读 benchmark fixture，不做优化，至少测量：

- 小图 / 中图 / 较大图的 map normalization；
- Canvas projection 相关纯函数（能单独测的部分）；
- history snapshot / signature 的规模增长；
- build bundle size 记录；
- 现有 regression 总耗时。

若浏览器 profiling 不容易自动化，本阶段允许只记录可复现的 Node/TS benchmark 与代码风险，不要为了 profiling 引入重型工具。

目标是为 G05 提供前后比较，不是制定虚假的绝对性能承诺。

## 6. 验证

至少运行：

```bash
npm run build
npm run test:search
npm run test:edges
npm run test:block-usability
npm run test:rich-text
npm run test:image-links
npm run test:shared-server
npm run test:shared-save
npm run test:regression
```

以及本 Goal 新增的 fixture/benchmark 命令。

如果某条历史命令已经被仓库替换，使用当前等价命令并在 result 中写清楚。

## 7. 退出门槛

只有全部满足才算完成：

1. `1.0.0` 版本记录一致；
2. 现有 build/regression 通过；
3. legacy fixture 可 round-trip；
4. benchmark 可重复执行；
5. 没有 2.0 功能偷跑进本 Goal；
6. `git diff` 只包含本任务文件；
7. commit `v1.0.0` 已创建并正常 push。

## 8. 停止条件

遇到以下任一情况立即停止，不进入 G01：

- 现有 regression 在未修改 2.0 代码前就不可解释地失败；
- fixture 暴露旧数据会被不可逆丢失；
- 需要改部署/生产基础设施才能完成；
- 工作树存在不属于本任务且会被覆盖的用户修改。

不要自行“先做 G01 再回来修”。

## 9. Result

写：

```text
results/asteria_v2_g00_result.md
```

必须包含：读取文件、修改文件、测试与 exit code、baseline 数值、兼容 fixture 路径、commit SHA、push 结果、未解决风险、`G01_READY = YES/NO`。