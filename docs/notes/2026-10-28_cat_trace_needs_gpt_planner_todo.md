# CAT-TRACE `NEEDS_GPT_PLANNER` 缺口总表

date: 2026-10-28
type: todo / cross-repository status note
status: reference; not an executable Codex task

## 0. 当前结论

截至 2026-10-28，CAT-TRACE 可核对到 **7 个实际进入或直接对应
`NEEDS_GPT_PLANNER` 的缺口记录**：

- 3 个仍属于当前 Planner 决策队列；
- 1 个旧执行记录已由后继任务承接，但同一可靠性根问题仍未关闭；
- 3 个 explicit-column 合同缺口已由后续合同提交明确关闭，保留在这里用于解释历史停机和防止回归。

当前仍待 Planner 决定的 3 个问题族是：

1. C04 formal reliability gate 在 Alpha、Beta 的固定 40k 上限后仍未通过；
2. C04-REF alpha-cloud coupling forensics 的 GH81-vs-`integrate()` numerical oracle 未通过；
3. explicit-column P13 oracle 在 built package 的 `R CMD check` 环境中不可访问。

本文件只记录状态、证据和缺失的决定，不替 GPT Planner 选择统计方法、接口、测试、
图表、替代算法、容差或性能方案。Asteria 若消费这些信息，只能把它作为
implementation provenance/status，不能据此改写 CAT-TRACE scientific truth。

## 1. 统计口径与证据边界

本次核对范围为：

- CAT-TRACE 当前 checkout `main@d5ea4e950fe178e3a9be5e17ddeea23dc3d19ee1`；
- `results/**` 中真实写出 `NEEDS_GPT_PLANNER` 的 executor result / manifest；
- 当前 `explicit-columns--prediction-and-progress` blocked run；
- 该任务用于关闭历史 blocked run 的权威合同提交。

没有把以下内容误计为真实缺口：

- task frontmatter 中仅声明“允许返回 `NEEDS_GPT_PLANNER`”的状态枚举；
- 合同里尚未触发的假设性 stop condition；
- 只写在旧提案、但没有 executor evidence 的设计方向。

当前 explicit-column result/MANIFEST 位于 CAT-TRACE ignored result tree，尚未提交；因此
本文件把它标为 working-tree evidence，并同时绑定其 task/plan base 与 oracle hash，
不把它伪装成已经发布的 CAT-TRACE commit evidence。

## 2. 缺口索引

| ID | 来源 | 实际触发点 | 当前状态 | 下一责任方 |
|---|---|---|---|---|
| NP-01 | Implementation Alpha / Task 017 | fixed F1 formal diagnostics 在 40k retained draws/chain 后失败 | `SUPERSEDED_EVIDENCE`; 后继由 Beta 承接，但根问题未闭合 | GPT Planner |
| NP-02 | Implementation Beta v1 / Task 018 | unchanged formal reliability gate 在 40k 后仍失败 | `OPEN` | GPT Planner |
| NP-03 | C04-REF alpha-cloud coupling forensics | GH81-vs-`integrate()` numerical oracle 未通过 | `OPEN` | GPT Planner |
| NP-04 | explicit-column 首次机械闭合 | oracle、边界、长表、错误、logger、测试、产物和执行命令未完全冻结 | `CLOSED_BY_CONTRACT` at `949e216` | none unless regression |
| NP-05 | explicit-column 残余歧义复核 | helper ownership、I/O failure injection、event fields、event count、time evidence path 仍不唯一 | `CLOSED_BY_CONTRACT` at `91cb031` | none unless regression |
| NP-06 | explicit-column zero-axis | `character(0)` dimname 要求与 base R canonical `NULL` 冲突 | `CLOSED_BY_CONTRACT` at `412fdb4`; evidence preservation at `9d9d6c2` | none unless regression |
| NP-07 | explicit-column built-package check | P13 repo-level oracle 不进入 `package/TRACE` tarball | `OPEN_CURRENT` | GPT Planner |

## 3. 当前 Planner 决策队列

### NP-02：C04 formal reliability successor route

#### 已证事实

Implementation Alpha 的固定 F1 formal run 在授权的
`10000 -> 20000 -> 40000` 路径结束后为
`CT_REFERENCE_DIAGNOSTIC_FAILED`：12 个 targets 中 9 个通过；失败项为
`group_share[g1]`、`group_share[g3]`、`psi`。该轮禁止修改 sampler kernel、width、
threshold、seed、DGP、prior 或 estimand。

Implementation Beta v1 保持 same-F1 identity，并完成 Helmert/stable-share/nonfinite-target
repair、independent correctness oracle、exact NC interweaving 和 mechanics smoke；但 formal
40k gate 仍为 `CT_REFERENCE_DIAGNOSTIC_FAILED`。失败项为
`group_share[g2]`、`group_share[g3]`、`nu_plus_a[g3]`。

#### 尚缺决定

Planner 需要为任何 successor execution 冻结新的统计/算法合同与验收路径。当前证据不授权：

- 扩展到 80k/160k；
- 改 seed、重画 DGP；
- 改 prior、threshold、tuning 或 sampler；
- 把 diagnostic-failure artifacts 当作成功结果。

NP-01 保留为 Alpha 的原始停机证据；NP-02 是同一可靠性问题族中较新的 formal evidence。
不能因为 Beta 已执行，就把 formal reliability gate 标成已关闭。

#### 证据

- CAT-TRACE commit `d4241d2b41c718c5d43f3e9ea0ed96e08e78260a`
  (`results/017_cat_trace_implementation_alpha/result.md`)
- CAT-TRACE commit `f77fbc3a0a6b05ab8265fadd018d6b076f40445f`
  (`results/018_cat_trace_implementation_beta_v1/result.md`)

### NP-03：C04-REF numerical oracle / mechanism-forensics successor

#### 已证事实

v0.1.2 short diagnostic experiment 完成 wrapper identity、2000 transition rows、20/20 valid
profile probes 和固定图表/汇总。alpha-marginalized profile 比 fixed-xi profile 更宽的 probe
fraction 为 `1.0000`，但合同结论仍为
`PROFILE_WIDENING_CONSISTENT = INCONCLUSIVE`。

12 个 GH81-vs-`integrate()` candidate checks 没有通过 frozen numerical oracle，因此：

- `NUMERICAL_ORACLE_PASS = NO`；
- `MECHANISM_EXPERIMENT_COMPLETE = NO`；
- `V0_1_3_DESIGN_AUTHORIZED = NO`；
- `NEXT_OWNER = GPT_PLANNER`。

#### 尚缺决定

Planner 需要先冻结 successor numerical/forensics contract，才能继续解释机制或改变 production
sampler。当前证据不授权临场提高 GH order、放宽 tolerance、设计 v0.1.3、重跑 formal MCMC
或修改 model/prior。

#### 证据

- CAT-TRACE commit `1b2e971f55b9556eb1941135f9383f770fe582e0`
  (`results/c04-ref--alpha-cloud-coupling-forensics/result.md`)
- 同目录 `diagnostics/gh_integrate_crosscheck.csv`

### NP-07：explicit-column P13 oracle 的 package/check 可达性

#### 已证事实

当前恢复执行已经完成：

- targeted prediction：246 PASS；
- logger tests：46 PASS；
- isolation：13 PASS；
- full testthat：510 PASS，0 FAIL/WARN/SKIP；
- source-safe `R CMD build`：成功；
- `R CMD check --no-manual`：1 ERROR、3 WARNING、3 NOTE。

唯一 ERROR 来自 P13：built tarball 的测试环境找不到
`docs/implementation/oracles/EXPLICIT_COLUMN_PREDICTION_REFERENCE.csv`。

冲突是机械且真实的：

1. P13 必须按 `case_id` 读取 repo 外层 20-row oracle CSV；
2. 固定 build 输入只有 `package/TRACE/`，repo 外层 `docs/` 不会进入 tarball；
3. 当前允许文件清单没有授权 package-internal oracle copy/package data；
4. 固定 check 命令没有传入 repo root 或 oracle path；
5. check 在临时目录运行，不能靠相对路径访问原 repo `docs/`。

当前 oracle CSV SHA-256 仍为：

```text
fc85ce0c25b9826b3e7ac3526009addd811140380ea87dd8de34c49eb1e2c391
```

#### 尚缺决定

Planner 必须冻结一种路径，并同步修订允许文件、测试和 check 合同。当前 blocked result
已经列出四类候选，但本 TODO 不替 Planner 推荐或选择：

1. 授权 package-internal oracle copy，并冻结路径与一致性检查；
2. 授权把 20-row oracle 嵌入 test file；
3. 修订固定 check command，显式传入 read-only oracle path；
4. 明确 P13 只在 repo-level targeted/full regression 执行，并冻结 built-package check 的等价规则。

在新合同前，不生成组会产物，不提交/推送 CAT-TRACE 当前实现，也不重跑已完成的三项
pre-modification baseline。

#### 证据

- CAT-TRACE working tree：
  `results/explicit-columns--prediction-and-progress/result.md`
- task base：`d5ea4e950fe178e3a9be5e17ddeea23dc3d19ee1`
- authoritative plan：`9d9d6c2f392d0f4be209dd808e82c0438909447b`

## 4. 已由合同关闭、但必须保留的缺口

### NP-04：explicit-column 首次机械闭合

初始合同不足以机械实现。Planner 在 `949e216efdb241557100e95eac1c1c6c1ba31aa3`
一次性补齐以下 10 类合同：

1. 20-row high-precision oracle case matrix、CSV schema、generator CLI 和 generation record；
2. primitive types、ID、empty object、dimnames、`q/M/J/K/U=0` 边界；
3. draw/summary long-table 的逐行语义、顺序与精确行数；
4. condition schema、error code 与 validation priority；
5. progress object、JSON fields/types/order/escaping；
6. logger state machine、cadence、terminal-event ownership 与 exact event sequence；
7. isolation fixture、logger unit matrix 与 Python validator；
8. P01-P13 exact prediction tests；
9. group-meeting CSV/PDF/PNG/中文摘要与 deterministic demo；
10. fixed execution commands、resource receipts、result/MANIFEST/Rd contract 与恢复规则。

状态：`CLOSED_BY_CONTRACT`。这些字段以后若再次缺失或互相冲突，应重新进入 Planner，
不能由 executor 选默认值。

### NP-05：首次闭合后的残余执行歧义

复核后仍发现 5 类不唯一行为，随后由
`91cb031aaefc0c083314e5027b8ac62031c064da` 关闭：

1. `.ct_r_stop_contract()` 只在 `cat-trace-predict.R` 定义一次；
2. logger append/flush/write 三层 helper 与两类 failure injection point；
3. `ct_r_progress_emit(fields=...)` 允许字段、non-null matrix、close/run_started 规则；
4. isolation successful log 的 exact event count 从错误的 27 修正为 29；
5. `/usr/bin/time -v` receipt 路径以及 targeted/full/build/check/demo 的固定命令。

状态：`CLOSED_BY_CONTRACT`。

### NP-06：base R zero-length axis 冲突

旧合同同时要求 logical empty IDs 为 `character(0)`，又要求长度为 0 的 matrix/array
axis dimname 为 `character(0)`；base R 会把后者 canonicalize 为 `NULL`，因此无法机械满足。

`412fdb494678143cc97efa3223d519d46fc44c36` 冻结唯一规则：

```text
logical empty IDs = character(0)
zero-length R dimname element = NULL
```

`9d9d6c2f392d0f4be209dd808e82c0438909447b` 又冻结已有 oracle、partial prediction、
result/MANIFEST 和三项 baseline 的复用规则。状态：`CLOSED_BY_CONTRACT`；当前实现和
targeted/full tests 已按新规则通过。

## 5. Asteria 侧 TODO

- [ ] 在 CAT-TRACE implementation provenance/status 中保留 NP-02、NP-03、NP-07 的
  Planner-owned / blocked 状态；不要显示为 audited、promoted 或 scientifically closed。
- [ ] NP-01 只作为 Alpha 原始 failure evidence；展示时与 NP-02 的较新 Beta evidence 串联，
  不重复声称两个独立根因。
- [ ] NP-04、NP-05、NP-06 只作为 resolved contract history；若未来输入 commit 早于对应
  closure commit，才提示 stale contract。
- [ ] 只有 CAT-TRACE 新 task 明确绑定新的 authoritative plan，且 executor 产生新 evidence
  后，才更新本表中的 open 状态。
- [ ] 不从 Asteria 反向生成统计修复、不自动修改 CAT-TRACE source、不把 bridge binding
  当作 scientific proof。

## 6. 如果以后要执行

这篇 note 不是 Codex task entry。任何一项后续实现都必须先由 GPT Planner 在 CAT-TRACE
写出或修订权威合同，再通过对应 `prompts/tasks/<task_key>.md` 绑定。Asteria 只能读取并
展示该状态，不承担 CAT-TRACE 统计规划。
