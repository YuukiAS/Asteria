# Asteria 版本规则

更新时间：2026-11-02

本文只定义版本身份、兼容承诺和发布规则。产品方向见 [ROADMAP.md](ROADMAP.md)，具体未来工作见 [TODO.md](TODO.md)。

## 当前版本

- 当前应用版本：`2.0.0-rc.19`。
- `2.0.0` stable：尚未发布。
- 版本号权威来源：`package.json`；每次版本提交必须同步 `CHANGELOG.md`、应用显示版本和 README 当前状态。

## 代际含义

### Asteria 1.x

`v1.0.0` 是历史“可编辑研究画布”的冻结兼容基线。旧 live UI/runtime source 已归档到 `archive/asteria-v1-ui/`，不再作为 active product shell。

1.x 的 payload、parser、freeze fixture、migration 与回归入口仍是 2.x 的兼容合同。至少在一个稳定 2.x 版本发布并经过真实迁移验证前，不得删除这些路径。

### Asteria 2.x

2.x 是当前统计与科学模型架构产品线。Architecture、Lineage 和 Evidence 共享当前 Asteria 2.0 的 canonical scientific graph；这项产品内合同不外推为 Atlas / Blueprint 的共享本体。

当前 2.0 预发布历史以 `CHANGELOG.md` 为准，本文件不重复保存每个 alpha、beta 和 RC 的功能清单。

## 产品族版本边界

- `Asteria` 是产品族名称，也是当前 Asteria 2.0 所在仓库。
- Asteria Atlas 尚未实现，不继承 `2.0.0-rc.19` 的产品版本身份。未来独立仓库和发布节奏由 Atlas 的真实内容合同决定。
- Asteria Blueprint 尚未实现，不继承当前 2.0 schema 或版本号。未来版本从 Design Assurance 权威合同和独立实现开始定义。
- 共享工具或 Core 只有在真实抽取后才决定是否拥有独立版本；目录规划不构成版本实体。

## 发布规则

### 普通维护

纯文档、验证、内部边界或仓库维护如果不改变用户可见能力，不提升应用版本，也不伪装成产品发布。提交信息使用任务 id 或清楚的 `docs:` / `chore:` 前缀。

### Release candidate

新的 RC 必须对应用户可见产品或正式验收合同变化，并同步：

1. `package.json` 版本；
2. 应用显示版本；
3. `CHANGELOG.md` 顶部条目；
4. README 当前状态；
5. 对应专项验证与累计 regression；
6. 固定公网入口的授权刷新与验证；
7. 仓库规定的截图、自审和 GPT Work 门槛（若涉及 UI）。

### Stable 2.0.0

只有以下条件全部成立，才允许发布 `2.0.0` stable：

```text
all designated GPT Work reviewers PASS
P0 = 0
P1 = 0
unresolved must-fix P2 = 0
user final human acceptance = PASS
```

构建通过、局部 smoke、单个 reviewer PASS 或文档整理都不能单独触发 stable。

## 兼容承诺

1. v1 map 必须继续可导入 2.x；legacy export 只能是明确兼容投影，不能反向成为 2.x canonical truth。
2. Original TRACE 与 CAT-TRACE Frozen V2 的科学身份、typed relations 和 variant 语义只能由对应科学与产品合同修改。
3. 当前固定公网入口和 shared-server health API 继续存在；版本变化不以更换 hostname 或部署方式为前提。
4. accepted concept images 和视觉截图是呈现/验收证据，不是数学、文献或结果真值。
5. 文档路径移动不得改变版本状态；历史 task、result 和 note 中的旧路径文本可以作为当时证据保留。
