---
id: asteria_v2_g06
title: Shared graph with Architecture, Lineage, and Evidence views
created_at: 2026-09-08
allow_code_change: true
allow_shell_command: true
allow_network: false
allow_external_upload: false
requires_human_approval: false
---

# Goal G06 — Multi-view Projection：Architecture / Lineage / Evidence

## 1. 执行时机

这是 2.x 后续 Goal，**不属于 G00–G05 自动核心链**。只有 2.0 RC 已通过用户验收或用户明确要求继续多视图时执行。

推荐目标版本：`2.1.0-alpha.1`，除非当时版本计划另有正式决定。

## 2. 目标

实现“一个 canonical graph，多种独立 view projection”：

- Architecture：模型内部符号、层级、参数、假设、推断；
- Lineage：方法/模型/论文之间的继承、推广、替换、放松；
- Evidence：Claim → theorem/simulation/dataset/result/ablation/reference/limitation 的证据闭环。

三个 view 共享实体定义，但布局、默认粒度、filters 与 inspector context 独立。

## 3. 必须先读

- `docs/notes/2026-09-08_asteria_v2_master_plan.md`
- `docs/notes/2026-09-08_asteria_v2_product_design_and_desktop_strategy.md`
- `docs/notes/2026-09-08_asteria_v2_image_prompt_library.md` 的 Prompt E
- `results/asteria_v2_g05_result.md`
- 当时 stable/RC 的 schema、view projection、variant 实现。

## 4. 核心原则

1. 不复制三份 project graph；
2. 同一 entity 的 definition/provenance 只存一份；
3. 每个 view 有独立 projection/layout；
4. Architecture 不塞论文级 lineage 节点；
5. Lineage 不铺满微观 symbol；
6. Evidence 以 claim 为中心，而不是 dataset 文件浏览器；
7. Story Outline 仍是线性叙事输出，不成为第四个同构 view。

## 5. Architecture view

保留 2.0 已有能力，不做破坏性重写。只把它正式放进 multi-view shell。

## 6. Lineage view

第一版节点粒度限制为：method/model/paper/algorithm/prior family/major extension。

关系至少包括：

- extends；
- generalizes；
- replaces；
- relaxes；
- borrows_from；
- computationally_inspired_by。

不要自动从 citation 猜 relation；没有人工/fixture 明确关系就 unresolved。

CAT-TRACE demo 可以表示 TRACE、HMSC、bigMVP、factor shrinkage 等方法来源，但不要把整篇 paper bibliography 全导入。

## 7. Evidence view

以 Claim entity 为中心。第一版允许连接：

- theorem/proposition；
- simulation；
- real dataset/result；
- ablation；
- reference；
- limitation；
- implementation evidence。

重点不是“证据越多越好”，而是能看到：

- claim 是否完全没有 support；
- support 是 theory 还是 empirical；
- 哪个 limitation 限制 claim；
- 哪个 model variant / code version 产生结果。

Validation 只提示 closure gap，不评价论文是否科学正确。

## 8. View switching

- 切 view 不改变 canonical graph；
- 保存各自 viewport/layout；
- selection 可在有对应 projection 时跨 view 保留；
- 无 projection 时 inspector 仍可显示 entity，并允许 `Show in current view`；
- 不自动把 Architecture 的全部 symbols 丢进 Lineage/Evidence。

## 9. UI / design

如果 multi-view shell 需要明显 layout 调整，优先用 image prompt library Prompt E 生成概念方向，再实现。若当时有明确 design system，可以使用 Figma 作为 component/token specification；Figma 不是 graph 真值。

## 10. 性能

- 每个 view 只渲染自己的 projection；
- view switch 不重建整个 domain graph；
- large Evidence graph 支持 filter/outline，不要求一屏铺完；
- selector 与 index 继续遵循 G05 性能边界。

## 11. 测试与退出门槛

至少验证：

- same entity across two views shares definition；
- independent layout persistence；
- view switching；
- selection/projection behavior；
- Lineage relation types；
- claim-evidence closure warnings；
- CAT demo；
- V1 migration/Architecture/Story regression；
- stress fixture。

完成后写 `results/asteria_v2_g06_result.md`，commit/push，并明确 `MULTIVIEW_READY = YES/NO`。