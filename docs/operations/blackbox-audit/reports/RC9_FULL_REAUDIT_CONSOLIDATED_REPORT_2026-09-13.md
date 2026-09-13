# Asteria RC.9 full GPT Work re-audit 汇总

日期：2026-09-13  
产品版本：`2.0.0-rc.9`  
固定入口：`https://asteria.httpwwwcardiacnexus-ukb.com/`

## Gate 结论

RC.9 full re-audit 未通过。

- W01 Visual = FAIL，P2×4，P3×2
- W02 Semantics = PASS，P3×1
- W03 State = PASS，无 finding
- W04 First-time UX = FAIL，P2×4，P3×3
- W05 Responsive/Accessibility = FAIL，P2×1，P3×2
- W06 Release red-team = FAIL，P2×1，P3×1

因此：

```text
GPT_WORK_GATE = FAIL
FINAL_HUMAN_ACCEPTANCE = NOT_READY
STABLE_RELEASE = BLOCKED
NEXT_VERSION = 2.0.0-rc.10
```

W02 / W03 证明 scientific truth 与核心 state machine 当前基本稳定；下一轮不得为视觉修复破坏它们。

## Must-fix 1 — Lineage 视觉语法仍不合格

用户人工截图与 W01 共同说明：当前 Lineage 虽然比 RC.8 少了长句，但仍不像成熟 scientific IDE。

主要问题：

- 4 条粗蓝曲线在 CAT-TRACE target 前汇成一团；
- TRACE->CAT-TRACE 的两条平行线几乎贴在一起；
- 箭头在 target 左缘形成过大的视觉结；
- `Borrows / Extends / Preserves / Inspired by / Uses` 仍以裸文字漂在线路中间；
- relation label 与 connector 没有统一的 chip/anchor 关系；
- target card 靠右并在部分 viewport 被裁切；
- source card 的 secondary role 仍有 `interpretation source / method source / methodological component` 这类 schema 味。

下一版必须采用明确的 presentation grammar，而不是继续微调当前 SVG text：

1. source cards 左列统一对齐；target card 放在右侧但保留至少 48–64px safe margin；
2. 同一 source-target pair 只画一条 visual connector；TRACE 的 `extends + preserves` 两条 typed relations以一个 connector + 两个小 relation chips 表达；
3. connector 细、克制，默认约 1.5–2px；选中时再增强；
4. 小箭头只出现在 target card 边界，不能几条线在 card 前形成巨大箭头结；
5. relation 文案用独立 HTML pill/chip，放在线路附近但不压在线上；
6. display copy 使用简短自然短语：`Extends`, `Preserves`, `Ecological hierarchy`, `Scalable probit`, `Factor shrinkage` 等；完整 typed relation 留 inspector；
7. 任何 label/card/edge 都不得越界或互相覆盖。

## Must-fix 2 — Architecture Full model / Original TRACE 仍有 overlap

W01/W05/W06 一致发现：

- Full model + Fit 在 1366/1536 下 parameterization 区多卡重叠；
- Original TRACE Architecture Overview 仍有核心节点重叠：`I_TRACE / R_i`, `tau_p / marginal probability`, `y_ij / z_ij` 等。

RC.10 必须把 Full model 和 Original TRACE 也纳入 deterministic non-overlap layout，而不是只保证 CAT-TRACE Overview。

建议：按 semantic layer 做固定 lane/slot packing，建立 presentation virtual canvas；Fit 是缩放 non-overlap canvas，而不是把所有节点重新 normalize 到有限 viewport 中。

Hard gate：1366×768 与 1536×864 下 `getBoundingClientRect()` 的 visible node overlap count 必须为 0。

## Must-fix 3 — Inspector / Semantic math 主阅读层仍有 raw 或碎裂公式

W01/W04 报告显示：

- canonical definition 在 inspector 中出现公式碎裂/堆叠；
- 可见主阅读层仍出现类似 `BETA^U_GH = NU + A_G + V^U_GH`、`GAMMA_G = GAMMA_0*PI_G` 的 ASCII math。

要求：

- canonical definition 使用真正 KaTeX block/inline math；
- 不 uppercase 数学 token；
- 公式容器 `white-space: nowrap` 或可横向滚动，不允许拆碎上下标；
- Semantic Diff / inspector / Evidence 主阅读层统一使用 structured math parts，而不是 raw canonical string；
- raw canonical source 只能进 Advanced/export。

## Must-fix 4 — Evidence / Why-it-matters / closure copy 仍模板化

W04 指出 Evidence 中多项 `Why it matters` 仍退化成“sits in validation layer…”的通用图结构描述；Closure gaps 也大量复用同一套模板。

要求按 entity kind + relation context 生成研究者解释：

- claim：该 claim 的科学含义、当前支持强度、缺口；
- proof：支持哪个 claim；
- dataset：为什么该数据线相关、当前为什么仍 pending；
- implementation：只说明实现验证，不冒充理论证明；
- limitation/open gap：具体缺什么、什么结果能 close。

禁止把 upstream/downstream relation count 当作 Why it matters 主文案。

## Must-fix 5 — Advanced / Export collapsed 状态与可见内容不一致

W04/W06 都观察到 collapsed / `Show export tools` 时，raw Schema/preview/warnings 仍可见或 disclosure state 与视觉不一致。

要求受控 disclosure 真正 conditional render/hidden：

```text
aria-expanded=false -> export controls / preview / JSON / warnings 不可见
aria-expanded=true  -> 完整显示
```

鼠标、Enter、Space 与 top Export 打开路径必须一致。

## Accepted/deferred

不阻塞 RC.10：

- 普通 Tab 穿过较多 graph nodes；skip links 已可用；
- 125% browser zoom 当前非 hard gate；
- Clear 后保留默认 selected object 可作为 inspector anchor，只要 trace 为 OFF 且文案明确；
- W02 的 validation warning 噪声作为 P3；若修 Advanced disclosure 可顺手降低主路径暴露，但不要改 scientific truth。

## Reviewer strategy after RC.10

RC.10 将修改 layout、Lineage/Evidence visual grammar、math/copy、Advanced disclosure，但不得修改 scientific truth 或 trace/session semantics。

若 result 明确：

```text
SCIENTIFIC_TRUTH_CHANGED = NO
TRACE_ALGORITHM_CHANGED = NO
SESSION_CONTRACT_CHANGED = NO
```

则下一轮指定：

```text
W01 + W02 + W04 + W05 + W06
```

W03 可 carry forward RC.9 PASS。

如果 RC.10 实际触碰 state/session/trace，必须把 W03 加回。
