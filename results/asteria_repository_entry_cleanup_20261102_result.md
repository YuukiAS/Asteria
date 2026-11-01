# Asteria 仓库入口收敛结果

结论：产品族边界已正式进入远端 `main`，仓库首页与长期产品文档入口已经收敛；当前 Asteria 2.0 代码、UI、运行时、测试资产和固定公网 hostname 均未改动。

## Git 身份

- `BASE_MAIN = 60ba27a38324980beea78d4c07b7b28abda522cf`
- `PRODUCT_FAMILY_SOURCE_BRANCH = refactor/asteria-product-family-boundary-20261101 @ 46252b963b22288f1f814cbd6cb26da9f6ebdc84`
- `CLEANUP_BRANCH = chore/asteria-repository-entry-cleanup-20261102`
- `FINAL_IMPLEMENTATION_COMMIT = 64796ee1fdd4556006d39672d8dc8bf566ad6a3d`
- `FINAL_MAIN = 64796ee1fdd4556006d39672d8dc8bf566ad6a3d`（本结果写入前的最终实现内容提交；结果文件后续仅增加交付证据）
- `MAIN_UPDATE = PASS`：远端 `main` 已从 `60ba27a` 普通 fast-forward 到 `64796ee`。

本地 `main` 原有两个未推送的 validator 提交，末端为 `913dc03b9355a43c06f05ccd89a6f125e91ddc7d`。它们属于另一项明确未获外部上传授权的工作，本任务未合并、未发布、未重写该分支。

## 仓库入口与文档职责

移动并重写了三份活跃产品维护文档：

- `ROADMAP.md` → `docs/product/ROADMAP.md`：只说明当前阶段、近期/中期/长期方向，以及明确不属于当前工作的内容。
- `TODO.md` → `docs/product/TODO.md`：只保留仍需实际执行的事项和必须持续保护的兼容约束。
- `VERSIONING.md` → `docs/product/VERSIONING.md`：只保留版本身份、发布规则和兼容策略。

移动前已搜索全仓引用；当前入口、验证脚本和有效文档链接已同步。历史 task/result/note 中的旧路径作为历史证据保留，没有为了修饰目录而改写。

根目录明确保留 `README.md`、`AGENTS.md`、`CHANGELOG.md`、`package.json`、lock/config 文件、`index.html`、`pnpm-workspace.yaml`、`src/`、`tests/`、`scripts/`、`public/`、`prompts/`、`results/`、`archive/` 与 `docs/`，因为它们仍承担仓库入口、构建、Agent、运行或证据职责。

`README.md` 现按“产品族是什么 → 当前真正实现什么 → 三条产品线状态 → 运行与验证 → 继续阅读”组织，并明确：

- 当前唯一已实现的产品是 Asteria 2.0，版本仍为 `2.0.0-rc.19`；
- Atlas 与 Blueprint 仅有边界，均未实现产品 surface；
- 当前没有共享业务 Core；
- 当前 Architecture 不等于 Blueprint，当前 Lineage / Evidence 不等于 Atlas。

GitHub About 已通过认证 CLI 更新并回读为：

> Asteria turns complex scientific and system structures into readable, traceable maps.

## 行为保护与验证

- `SRC_MODIFIED = NO`
- `UI_MODIFIED = NO`
- `VISUAL_REVIEW_PACK = NOT_APPLICABLE`
- `npm run test:product-family-boundary`：PASS
- `npm run test:repository-entry`：PASS；验证 3 份产品文档、6 个活跃 Markdown 入口、18 个本地链接、0 个根目录旧产品文档、0 个新产品源码 namespace。
- `npm run build`：PASS
- `npm run test:regression`：PASS；累计回归包含现有 RC 浏览器门槛。
- 独立 `npm run test:browser`：未另跑；本轮没有 UI 改动，累计回归已执行受保护的 RC 浏览器链。
- `git diff --check` 与 staged diff check：PASS
- 相对 `BASE_MAIN` 的 `src/` diff：空。

固定公网入口仍返回 HTTP `530` 的 Cloudflare Error 1033 页面。这是修改前已存在、任务明确排除的基础设施状态；本轮没有启动、重启或替换 tunnel，也没有修改 hostname。

## 预先存在的本地修改

工作树中仍有 17 张预先存在的 `results/asteria_v2_rc11_reader_finish/screenshots/` 图片修改。本任务没有覆盖、删除、暂存或提交它们；它们不在远端清理提交中。

## 产品状态

- Asteria 2.0：当前 active release candidate，现有 Architecture / Lineage / Evidence 行为保持不变。
- Asteria Atlas：边界已定义，尚未实现；第一阶段计划使用独立 Markdown/YAML 知识仓库与 Obsidian。
- Asteria Blueprint：边界已定义，尚未实现；等待 Design Assurance 权威合同成熟后再建模。

## 下一项唯一建议动作

创建独立的 Asteria Atlas 知识仓库，并产生第一份真实、版本化的 Markdown/YAML 内容集；本任务不实施该动作。
