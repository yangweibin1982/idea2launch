---
name: frontend-design
description: 全局 UI 设计细节规范与前端设计工序。设计/新建/改造任何前端界面（页面、组件、设计 token、深浅主题、视觉细节）时使用：开工三问定边界、风格方向候选拍板、token 先行、组件与交互细节清单、三视口截图自检循环。蒸馏自 Vercel Web Interface Guidelines、Anthropic frontend-design、Material 3、Apple HIG、Ant Design、W3C Design Tokens、Refactoring UI（2026-10-01 汇编，一手来源实查）。
---

> **vendored 快照声明**：本文件是 idea2launch 维护者工作流仓同名技能的快照副本（来源仓私有，路径不出现），随 idea2launch 插件以 vendored 方式分发；快照版本/日期：2026-10-05（v1）。它不属于九阶段主流程，仅作为可选增强按挂点建议装载（注册表见 [../../../core/references/enhancements.md](../../../core/references/enhancements.md)）。同步仪式：维护者在每周进化周期做与源仓的漂移检查，以本头注的版本与日期为准；请勿手改本目录（升级时整体覆盖）。正文为快照原貌，仅对维护者私有栈引用做了脱敏（替换为通用表述）；references/ 附属文件随目录一同快照。

# frontend-design · 全局 UI 设计细节规范

一句话：让界面「像被设计过」——不是多装饰，而是每个细节都有一个决定，且全站决定一致。

## 来源（2026-10-01 蒸馏，标注取材面）

| 来源 | 取什么 | 落在 |
|---|---|---|
| Vercel Web Interface Guidelines（100+ 条，agent 向 checklist）| 交互/可达性/表单/动效/性能细节 | references/interaction-a11y.md |
| Anthropic frontend-design 技能（官方）| 美学方向、排印、反 AI slop | references/style-anchors.md |
| Material 3 / Apple HIG / Fluent 2 / IBM Carbon / Ant Design 5 | token 数值锚点、色彩角色、密度 | references/ui-spec.md |
| W3C Design Tokens（2025.10 首个稳定版）| token 三层结构与落盘格式 | references/ui-spec.md §1 |
| Refactoring UI | 层级策略（边框优先于阴影）、灰阶、亲密性 | references/ui-spec.md |
| 社区：UI UX Pro Max、Superdesign/agent-design-pack | 工序参考（先搜后做、方向多变体） | 本文件工序 |

## 工序（顺序不可颠倒）

1. **开工三问**：① 界面给谁用、什么场景（后台密集操作 / C 端内容 / 营销落地）？② 项目既有品牌、组件库、token 文件——**有则只扩展不另起**（唯一事实优先）？③ 平台与浏览器范围、中英文环境？
2. **风格方向摊候选**：读 `references/style-anchors.md` 方向库，取 2–3 个候选（关键词+字体+配色+形状组合）摊给用户拍板，**选定前不动手**。例外：任务已明确指定方向、或纯细节修缮，跳过并在交付注明。
3. **token 先行**：按 `references/ui-spec.md` §1 三层结构先落 primitive→semantic token；已有 token 文件只增量扩展。
4. **实现**：组件按 `references/components.md` 状态矩阵逐个过；交互与可达性按 `references/interaction-a11y.md` 硬指标；实现栈优先项目既有栈（见 style-anchors.md「实现栈默认」）。
5. **视觉自检循环（交付硬门）**：起浏览器隔离实例截图（用宿主的浏览器自动化能力，若有）——desktop 1440 / tablet 768 / mobile 375 三视口＋关键交互态（hover/focus/空态/错误态），逐张对照 `references/review-checklist.md` 必过项；缺陷先问「同样的结构还出现在哪」，修根因后复检。**禁抽检**。无浏览器环境时清单静态逐条全过，并在交付显式声明。
6. **交付**：token 文件＋组件代码＋自检记录；涉代码时按验证闭环收尾（在最终状态上跑构建/lint）。

## 硬规矩

1. **有 token 不写裸值**：颜色/间距/字号/圆角/阴影/时长一律 token 引用，禁 magic number。
2. **五态不全不出手**：default/hover/active/focus-visible/disabled；数据面另加 loading/empty/error。
3. **对比度是底线不是风格**：正文 4.5:1、大字（≥24px 或 ≥18.66px bold）与图形 3:1。
4. **反 AI slop**：禁默认蓝紫渐变、禁 emoji 当功能图标、禁原生 alert/confirm、禁 lorem ipsum 交付、禁「Inter＋紫渐变＋玻璃拟态」默认套餐。
5. **动效克制**：只动 transform/opacity，150–500ms，`prefers-reduced-motion` 全量降级。
6. **中文纪律**：正文行高 ≥1.7、禁斜体强调（用字重/颜色）、中西文间留空格、标点用全角。

references/ 按需读，不要一次全载入。
