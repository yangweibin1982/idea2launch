# companion-skills/ · 伴生技能（vendored 快照）

> 本目录存放两件伴生技能的 vendored 快照：solution-research（方案设计调研漏斗）与 frontend-design（全局 UI 设计细节规范）。它们是九阶段主流程**之外**的深度增强——挂点由 [../../core/references/enhancements.md](../../core/references/enhancements.md) 注册表指认；**仅在资产盘点探测到「宿主可装载 markdown 技能」时才向用户建议采纳**，探测不到则静默跳过（降级规则见注册表第 4 节）。

| 目录 | 技能 | 相关挂点 |
|---|---|---|
| [solution-research/](solution-research/SKILL.md) | 渐进式调研漏斗——比 research-funnel 更深的市场/社区调研工序 | 阶段 4 选型（按需加深） |
| [frontend-design/](frontend-design/SKILL.md) | 全局 UI 设计细节规范＋三视口自检循环——比 modules/ui-spec 更细的设计工序 | 阶段 3 设计（按需加深） |

## 与插件内建件的关系（先用内建，按需加深）

- **solution-research ↔ research-funnel**：research-funnel 是主流程内建件（自包含、人人可用、产物对齐闸门），**永远先走它**；solution-research 只在用户想要更深调研（更多候选、更严剪枝闸、更长对比）时按需叠加，其产物仍回灌 research-funnel 的对照表与决策留痕。
- **frontend-design ↔ modules/ui-spec**：ui-spec 是阶段 3 闸门的内建规范（原型＝内联 CSS＋token 变量等硬约束以它为准）；frontend-design 提供更细的全局设计工序与细节清单，**不推翻 ui-spec 的任何硬约束**，冲突时以 ui-spec 为准。

## vendored 快照声明

- 两份快照的**来源为维护者的工作流仓（私有，路径不出现）**；每份 SKILL.md 正文顶部的头注标有快照版本与日期。frontend-design 为整目录快照（SKILL.md＋references/ 五个附属文件），附属文件随主文件同步。
- **装载方式**：宿主按各自 SKILL.md 的 name/description 常规装载触发即可——它们不参与九阶段的装载协议（「上下文装载协议」只读 core/references 与 modules/ui-spec），这正是「流程外增强」的含义。
- **同步仪式**：维护者在每周进化周期对本目录做一次与源仓的漂移检查（diff 正文与附属文件，确认脱敏点未被源仓更新带回来），有更新则重拷并刷新头注；请勿手改本目录——升级时会被整体覆盖。
- 复制时已对维护者私有栈引用做脱敏（替换为通用表述），其余为快照原貌。

## 个人域技能为何不随插件分发

维护者的技能库里还有一批个人域技能（特定领域资料、个人工作流类）。它们**明确不入**本目录，原因有二：**隐私**——个人域内容不代表插件面向的通用场景，夹带分发等于公开个人资料；**领域无关性**——对外部用户无用甚至误导（收到一堆与自己领域无关的规范）。本目录只收「任何新手都可能用得上」的通用能力技能。

## 两问两答

- **问：快照版本和插件版本是什么关系？** 答：相互独立——快照按维护者源仓的演进走（头注日期为准），不随插件版本号走；插件升级只保证快照可用，不承诺追平源仓最新。
- **问：两件都不要行不行？** 答：行——纯增强，简报里 skip 掉没有任何后果；内建件（research-funnel、modules/ui-spec）已覆盖主流程所需，伴生技能只是「想更深时的选修课」。
