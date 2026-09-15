# Asteria 远期 TODO：GitHub / Code Trace / Implementation Graph

日期：2026-09-15  
状态：**远期产品方向，仅记录 TODO；当前不实现，不作为 2.0 stable blocker。**

## 0. 想解决什么问题

Asteria 目前已经把“统计模型中的对象、符号、关系、证据”变成结构化 graph。更远期希望再回答一层问题：

> **论文/模型里的这个量，在真实代码里到底对应什么变量、在哪个函数里被定义或更新、被哪些函数使用、最后如何进入 likelihood / sampler / optimizer / prediction / diagnostic？**

例如点击 CAT-TRACE 的 $\beta^{\mathcal U}_{gh}$，除了看到数学定义和上下游关系，未来还应能看到：

- 在当前 GitHub repository / commit 中对应哪些代码变量或字段；
- 哪个函数初始化、采样、更新、变换或消费它；
- 哪些函数调用这些函数；
- 它最后进入哪些 likelihood / latent-score / prediction / diagnostic 路径；
- 有哪些单元测试 / simulation / regression test 覆盖这条实现；
- 最近哪次 commit 修改了这条实现；
- 一键跳到 GitHub 对应文件/函数，而不是只给一个容易漂移的行号。

这会把 Asteria 从“model architecture map”进一步扩展成：

> **scientific semantics ↔ concrete implementation 的双向 trace system。**

当前 `TODO.md` 已经为 `StatisticalSymbol` 预留了 `codeBindings?: CodeBinding[]`，并明确要求符号可以回答“R/C++ 参数名与文件位置”。本 TODO 只是把这个方向扩展成更完整的远期设计，不改变当前 2.0 schema 或 UI。

---

## 1. 不要把 scientific graph 和 code graph 混成一张图

长期应保持至少三层逻辑：

```text
Scientific semantic graph
  StatisticalSymbol / entity / typed relation / claim

Implementation graph
  repository / module / file / function / method / variable / field / config / test

Binding layer
  statistical entity <-> code entity
```

核心原则：

- scientific graph 仍是“模型是什么”的 canonical truth；
- code graph 回答“当前实现怎么做”；
- code 不应反过来自动改写数学定义；
- 一份科学对象可以绑定多个实现，例如 R prototype、C++ kernel、Python wrapper、GPU backend；
- 一个代码对象也可以服务多个 scientific objects；
- implementation binding 是 provenance / traceability，不等于 scientific correctness proof。

因此更适合在 Architecture Inspector 中增加 `Implementation` / `Code trace` 层，或提供局部 implementation trace，而不是把所有 function 都直接塞进 Architecture 主画布。

---

## 2. GitHub integration 的第一层能力

远期可连接 GitHub repository，并把项目固定到明确版本：

```text
repository
branch/ref
commit SHA
language(s)
root path / package / module
```

初期建议 **read-only**：

- 浏览 repository tree；
- 定位文件、函数、变量、tests；
- 打开 GitHub 文件/commit；
- 根据 commit 重新索引 implementation graph；
- 检测旧 binding 是否 stale。

私有仓库权限应继承 GitHub connector / app authorization；Asteria 不应默认把私有源码上传到第三方模型或外部服务。

---

## 3. Implementation graph 的建议粒度

不需要把 AST 每个 node 都变成 Asteria entity。只保留研究实现上有意义的 code objects：

```text
Repository
Module / Package
File
Function / Method
Class / Struct
Variable / Field / Parameter
Config / CLI option
Test / Fixture
Generated artifact (optional)
```

关系可以包括：

```text
defines
reads
writes
initializes
updates
samples
transforms
passes_to
returns
calls
constructs
implements
validated_by / tested_by
serializes_as
```

其中完整 call graph 应是 implementation graph 自己的关系，不应污染 scientific typed-relation ontology。

---

## 4. CodeBinding 不应只存“文件 + 行号”

行号非常容易随 commit 漂移。未来 binding 应同时支持人类导航信息与更稳定的 structural anchor。

一个可能的方向：

```ts
type CodeBinding = {
  id: string
  scientificEntityId: string

  repository: string
  ref?: string
  commit?: string
  language?: string

  path: string
  codeKind?: "variable" | "field" | "function" | "method" | "class" | "config" | "test"
  qualifiedName?: string
  displayName?: string

  role:
    | "definition"
    | "storage"
    | "initialization"
    | "update"
    | "sampling"
    | "transformation"
    | "consumption"
    | "diagnostic"
    | "test"

  span?: { startLine?: number; endLine?: number }
  structuralAnchor?: string
  codeFingerprint?: string

  source: "manual" | "manifest" | "static_analysis" | "agent_inferred" | "human_confirmed"
  confidence?: number
  status?: "verified" | "probable" | "stale" | "broken"
}
```

这里的字段只是设计草案，不应现在冻结。

关键是：

- `qualifiedName + AST/structural anchor + commit` 比纯行号稳定；
- 行号只负责跳转；
- commit 改变后 Asteria 应能提示 binding 需要 revalidate；
- inferred binding 必须和 human-confirmed binding 区分。

---

## 5. Asteria 最终应该能回答的 Code Trace 问题

选中一个 statistical symbol / entity 后，未来至少希望支持：

### Where implemented

- 在哪些 repository / files 中实现；
- 当前主要 backend 是哪个；
- 有哪些 alias / variable names。

### Where defined / initialized / updated

例如：

```text
β^U_gh
-> stored as beta_u
-> initialized in build_open_tail_state(...)
-> updated in update_open_tail_slopes(...)
```

### Where used

继续向下：

```text
update_open_tail_slopes
-> latent_open_tail_score
-> probit likelihood
-> richness calculation
```

### Function call trace

可以展开局部调用关系：

```text
fit_model
-> update_iteration
   -> update_open_tail_slopes
      -> ...
```

重点是围绕 selected scientific object 做局部 trace，不是把整个 GitHub repo 的 call graph 全部画出来。

### Tests / evidence

- 哪些 unit test 覆盖它；
- 哪些 simulation / regression test 间接验证它；
- Evidence view 中某个 implementation evidence 是否可反向打开相关 tests / code anchors。

### Change impact

未来可以考虑：

```text
commit changed function X
-> affects code binding of β^U_gh, γ_g
-> these participate in claim / simulation / theorem-supporting implementation path
```

这应是“impact hint”，不是自动断言 scientific claim 已被破坏。

---

## 6. GitHub 自动分析 + 显式 handoff：建议采用混合模式

不建议要求开发者手工维护完整 implementation graph，也不建议完全依赖 AI 猜。

比较合理的是：

```text
static analysis / code index
+ small explicit binding hints
+ agent-assisted inference
+ optional human confirmation
```

### 自动部分

未来可评估不同语言的 parser / language-service / code-index 能力，用于发现：

- functions / methods；
- definitions / references；
- imports；
- calls；
- basic read/write relationships；
- tests。

动态语言、R metaprogramming、C++ templates、Python dynamic dispatch 等都可能让 call graph 不完整，因此结果必须允许 `partial / probable`，不能假装绝对真值。

### 显式部分

开发 algorithm 的 Codex / human 最清楚“这个代码块实现的是哪个数学对象”。因此可以提供一个**很轻的 optional handoff**，只标研究上重要的 semantic anchors。

不要求：

- 变量名必须与论文符号一致；
- 每个函数都加 annotation；
- 每次 commit 都手填巨大 JSON；
- 为 Asteria 改变自然的代码结构。

---

## 7. 可探索的 lightweight manifest / protocol

未来可以评估在 repo 中支持类似：

```text
.asteria/implementation-map.json
```

名称暂不冻结。

这个 manifest 不负责描述全部源码，只提供少量高价值 anchor。例如：

```json
{
  "schemaVersion": "0.x",
  "project": "CAT-TRACE",
  "bindings": [
    {
      "entityId": "entity:cat-trace-frozen-v2:betaU_gh",
      "role": "update",
      "code": {
        "path": "src/open_tail.cpp",
        "symbol": "update_open_tail_slopes"
      }
    },
    {
      "entityId": "entity:cat-trace-frozen-v2:p_g",
      "role": "config",
      "code": {
        "path": "R/config.R",
        "symbol": "p_u_group"
      }
    }
  ]
}
```

设计原则：

1. **versioned JSON Schema**，但只约束数据交换，不强迫 code architecture；
2. 所有字段尽量 optional，允许逐步丰富；
3. stable scientific `entityId` 是连接点，代码内部命名可以自由；
4. manifest 是 hint / curated binding，不是 call graph 真值源；
5. call graph、references、line spans 由 Asteria / indexer 基于具体 commit 推导；
6. manifest 缺失时，Asteria 仍应能做静态分析 / AI-assisted matching；
7. manifest 存在时，Asteria 应优先把显式 binding 当高置信 anchor，再向外展开。

---

## 8. Codex development handoff 的远期方向

如果未来 Codex 负责实现统计算法，可以在**算法/科学语义发生实质修改时**产生一个轻量 Asteria handoff；不需要每个普通 UI commit 都产生。

一个可能的结构：

```json
{
  "asteriaImplementationHandoff": {
    "commit": "<sha>",
    "changedEntities": [
      "entity:cat-trace-frozen-v2:betaU_gh"
    ],
    "bindings": [
      {
        "entityId": "entity:cat-trace-frozen-v2:betaU_gh",
        "path": "src/open_tail.cpp",
        "symbol": "update_open_tail_slopes",
        "role": "update"
      }
    ],
    "tests": [
      "tests/test_open_tail.cpp"
    ],
    "notes": "grouped open-tail slope update"
  }
}
```

仍然只把它理解为**handoff evidence**：

- Asteria ingestion 后自己校验 path / symbol 是否存在；
- 再与 static analysis 的 references / call graph 合并；
- 发现 handoff 与实际 code 不一致时标 stale/broken；
- 不因为 Codex 声称“implements X”就自动更新 scientific truth。

长期可以让 Asteria 把 stable entity IDs 和当前 bindings 反向提供给 Codex task，使开发者在实现时知道自己修改了哪些 scientific objects。

这样可能形成：

```text
Asteria semantic graph
-> Codex task gets relevant entity IDs / bindings
-> Codex changes implementation
-> lightweight implementation handoff
-> Asteria re-indexes repo
-> binding / call trace / tests are refreshed
```

这是值得探索的方向，但协议必须保持轻量，不应变成开发所有算法前必须填写的大型表格。

---

## 9. UI 形态的初步判断

优先考虑作为现有 Inspector / Trace 的扩展，而不是立刻新增第四个顶层 graph：

```text
Symbol Inspector
  Meaning
  Definition
  Relations
  Implementation
    GitHub bindings
    Where defined
    Where updated
    Where used
    Call trace
    Tests
    Last changed
```

必要时从 `Implementation` 展开局部 Code Trace canvas。

也可以支持反向入口：

```text
GitHub function / file
-> mapped scientific entities
-> related Architecture / Evidence objects
```

是否最终需要独立 `Implementation` 顶层 view，等真实使用后再决定，不在本 TODO 里冻结。

---

## 10. Staleness / versioning 必须是一等问题

代码和论文符号的绑定不能假装永久有效。

每条 binding 应可显示：

```text
Verified at commit abc123
Current HEAD def456
Status: verified / probable / stale / broken
```

当文件移动、函数改名、AST fingerprint 改变时：

- 尝试自动重定位；
- 若只能模糊匹配，降为 `probable`；
- 无法重定位则标 `stale/broken`；
- 不 silently 指向错误行号。

Asteria 中的 implementation trace 因此必须始终带 repository/ref/commit context。

---

## 11. 不应做什么

远期实现时避免以下方向：

- 把 Asteria 做成完整 IDE / GitHub clone；
- 把每个 AST node 都变成 scientific entity；
- 要求程序变量必须和论文 LaTeX 名称一致；
- 要求所有 Codex task 都维护 implementation manifest；
- 把 AI 推断的 code binding 当作 confirmed truth；
- 仅使用 file + line number 作为持久 binding；
- 把 implementation call graph 混进 scientific relation ontology；
- 因为代码实现变化自动改写 theorem / claim / model definition。

---

## 12. 远期分阶段建议（暂不绑定版本）

```text
A. Manual / curated code binding
   - GitHub repo/ref connection
   - selected entity -> file/function
   - open in GitHub

B. Code index / local call trace
   - definitions / references / calls / tests
   - implementation graph
   - stale binding detection

C. Optional manifest + Codex handoff
   - versioned lightweight JSON
   - changed scientific entity IDs
   - important code anchors / tests

D. Impact / diff trace
   - commit -> affected bindings
   - affected symbols / algorithms / implementation evidence

E. AI-assisted binding
   - suggest symbol<->code matches
   - explain confidence / evidence
   - require confirmation for high-impact mappings
```

不要现在决定具体 2.x/3.x 版本；等 2.0 stable、真实 CAT-TRACE code implementation 和至少一个不同领域 project 的使用经验后再拆正式设计 task。

---

## 13. 实现前必须重新回答的开放问题

- GitHub connector 只读索引够不够，还是 desktop/local clone 更适合 private research code？
- 多语言 repository（R + C++ + Python）如何统一 code symbol IDs？
- dynamic call graph 的 confidence 怎么表达？
- CodeBinding 是直接挂 `StatisticalSymbol`，还是挂更通用 `StatisticalEntity`？大概率后者更灵活。
- 同一个 scientific entity 多 backend / 多 algorithm variant 如何比较？
- commit diff 后如何廉价重建局部 code graph，而不是每次全仓索引？
- manifest / handoff 的稳定 schema 应多小才不会成为维护负担？
- Codex 是否只在“algorithmic/scientific implementation task”时产生 Asteria handoff？如何判断触发条件？
- implementation trace 是否最终需要独立 view，还是 Inspector + local trace 已经足够？
- 如何把 code tests 与 Evidence 中的 implementation evidence 连起来，而不把 test PASS 错当 scientific proof？

这些问题当前保留开放；本文件只是确定产品方向和设计边界。
