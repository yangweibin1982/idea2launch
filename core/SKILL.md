---
name: idea2launch
description: 智能体应用新手向导——完全非技术的用户只带一个想法进来，智能体替代软件公司全角色，经 9 阶段向导（立项评估→需求→设计→技术→计划→开发→质量→交付→轻运营）交付可运行的 Web 应用＋全套文档。触发说明：用户显式启动（如「用 idea2launch 做一个…」「启动想法落地向导」）时进入；检测到用户表达开发/建应用意图但未显式启动时，仅提示本技能可用、不自动执行（L3 意图提示，零成本防误触发）。触发协议全量细则见 references/triggers.md（T2 交付）。
---

# idea2launch 主工序（状态机驱动的 9 阶段向导）

> 本文件是平台无关核心的主工序骨架：定义状态机总览、上下文装载协议与续跑协议。**各阶段执行细则不在本文件**——按下方总览表指针装载对应阶段细则文件。
>
> 纪律基线：执行任何阶段前，先读并遵守 `references/disciplines/conduct.md`（行为规范包·七纪律，T2 交付）。

## 0. 开工四件事（进入阶段 1 之前）

1. **资产盘点（简报）**：探测宿主七类能力——子代理、浏览器自动化、网络检索、知识服务、代码索引、伴生技能（`optional/companion-skills/`）、插件安装形态——每类一句大白话播报「**发现了什么→建议增强什么→影响是什么**」，整理成一页简报（≤1 屏，模板见 [references/templates/asset-inventory-brief.md](references/templates/asset-inventory-brief.md)），用户逐项拍板 adopt/skip（禁默认替用户开），选择落 `state.json` 的 `project.capabilities`。**零资产时明示「完全可用，以上全是可选增强」**。七类探测面与安装形态探测见 `references/triggers.md` 三；探测-建议-采纳协议与降级规则见 [references/enhancements.md](references/enhancements.md) 三/四（引用不复制）；检出方式②自包含副本安装时，简报顺带建议迁移方式①仓库引用（用户拒绝则尊重，不追问，C6）。
2. **能力探测**：探测宿主是否具备子代理机制 → 决定 `agent_mode`（multi/single）——探测动作已并入第 1 件盘点执行（七类探测面第①面），`agent_mode` 随盘点结果落 `state.json`；探测失败静默降级 single 并留痕。判定、试派与降级协议见 `references/triggers.md` 三（T2 交付，T3 扩为七类探测面）。
3. **注入询问**：首次运行询问是否注入宿主全局规则，落 `inject_global`（默认 `ask`，零侵入为默认）。
4. **建档与选档**：在用户项目根建 `idea2launch/state.json`（schema 见 [state.schema.json](state.schema.json)），请用户选双档（草图档/生产档）落 `project.tier`，并预告预计消耗。选档前先做**六维白话评分**——每维问用户一句大白话，按回答给档位推荐（**推荐非强制，用户拍板**）：
   - **想法清晰度**：三句话能讲清「给谁用、解决什么烦心事」吗？讲得清→可上生产档；还模糊→草图档先试想法。
   - **改动面**：从零做新东西，还是改已有的东西？动老东西更怕改坏→偏生产档。
   - **外部依赖**：要接第三方服务吗（支付/登录/短信推送）？接得越多越要多轮验证→偏生产档。
   - **数据风险**：应用管不管要紧数据（钱、健康记录、隐私）？管→安全备份都要更严→偏生产档。
   - **试错成本**：做错重来，亏的是几轮对话，还是真金白银/时间面子？亏不起→偏生产档。
   - **时间压力**：是「先看看效果」还是「下周就要用」？不急→草图档先跑；急→生产档一次做稳。
   - 六维答完汇总一句推荐＋理由（如「综合看建议生产档，因为你管钱、急用」），用户选哪档落哪档；预计消耗预告不变（C5）。

## 1. 九阶段状态机总览

产出均落**用户项目根**下 `idea2launch/` 目录；应用源码在用户项目根（`src/` 等由阶段 4 技术方案定）。

| # | 阶段 | 产出目录（`idea2launch/` 下） | 闸门签字物 | 阶段细则文件 |
|---|---|---|---|---|
| 1 | 立项评估● | `1-charter/评估报告.md`（12 维打分＋红旗＋调研漏斗替查竞品） | 评估报告＋「继续/调整/转草图档/放弃」 | [references/stages/stage-1-charter.md](references/stages/stage-1-charter.md)（T3 交付） |
| 2 | 需求● | `2-requirements/PRD.md＋用户故事.md` | PRD 签字页 | [references/stages/stage-2-requirements.md](references/stages/stage-2-requirements.md)（T4 交付） |
| 3 | 设计● | `3-design/原型.html＋ui-spec/全套` | 原型＋UI 规范 freeze（复用 modules/ui-spec 闸门） | [references/stages/stage-3-design.md](references/stages/stage-3-design.md)（T5 交付） |
| 4 | 技术○ | `4-tech/技术方案.md＋api-contract.md` | 技术栈定稿（L2）＋方案签字 | [references/stages/stage-4-tech.md](references/stages/stage-4-tech.md)（T6 交付） |
| 5 | 计划○ | `5-plan/排期.md＋tickets/＋风险登记.md` | 票批准（L2） | [references/stages/stage-5-plan.md](references/stages/stage-5-plan.md)（T7 交付） |
| 6 | 开发○ | `6-build/`（代码＋构建日志） | 里程碑验收＋票完成汇报（可攒批） | [references/stages/stage-6-build.md](references/stages/stage-6-build.md)（T7 交付） |
| 7 | 质量○ | `7-quality/测试报告.md＋UAT清单.md`（大白话验收步骤） | UAT 签字 | [references/stages/stage-7-quality.md](references/stages/stage-7-quality.md)（T7 交付） |
| 8 | 交付○ | `8-delivery/运行包＋启动说明＋上线检查单.md＋用户手册.md`＋「下一步可发布」提示 | 交付确认 | [references/stages/stage-8-delivery.md](references/stages/stage-8-delivery.md)（T7 交付） |
| 9 | 轻运营○ | `9-operate/反馈.md＋迭代入口` | 无强制闸门 | [references/stages/stage-9-operate.md](references/stages/stage-9-operate.md)（T7 交付，M1 简版随行） |

- ●=M1 深度实现，○=M1 简版。
- 阶段 3（组件库方案）与阶段 4（框架/托管/数据库选型）内嵌**方案调研漏斗**：顾问替查 2-4 候选、大白话对照表、结论带来源链接与检索日期。细则见 `references/research-funnel.md`（T2/T5/T6 交付）。
- 角色扮演：单代理顺序扮演 9 角色（角色卡见 `references/roles/`，T2 交付）；`agent_mode=multi` 时可多代理并行＋辩论增强。
- 确认页呈现规范（双宿主：会话提问/HTML 页）见 `references/confirmation-pages.md`（T2 交付）。

## 2. 上下文装载协议（每阶段开场必做，写死）

每个阶段的开场固定四步，不得跳过、不得凭记忆代替读盘：

1. **读状态**：读 `idea2launch/state.json` → 确认 `current_stage`、`project.tier`、已签字闸门、未决缺口（`open_gaps`）。
2. **读细则**：读本阶段细则文件（§1 表指针）＋行为规范包 `references/disciplines/conduct.md`；涉代码/测试/安全时加读 `references/disciplines/engineering.md`（T2 交付，含凭据纪律：生成物不写凭据字面量，配置走环境变量/密钥服务）。
3. **执行阶段工序**：按该阶段细则执行（产出物落对应目录；过程遵守角色卡与规范包）。
4. **过闸门**：按确认页规范呈现大白话摘要＋后果 → 用户签字／退回／回退上一闸门；签字结果写回 `state.json`（`gates` 追加、`current_stage` 前进）。**写操作只经闸门/L2 确认后发生，写路径唯一。**

## 3. 跨会话续跑协议（一句话）

**任何会话开场：读 `idea2launch/state.json` → 向用户播报当前阶段与可做动作，从断点继续，不重做已签字阶段。**

读写细则（写路径唯一/快照回滚/原子写/gate 命名/decisions.log/open_gaps）见 [references/state-protocol.md](references/state-protocol.md)（T8 交付）；缺口分类、裁决页与裁决落盘见 [references/gap-workbench.md](references/gap-workbench.md)（M2 交付）。

## 4. 触发协议

显式启动、L3 意图提示（检测开发意图→提示不自动执行）、三层触发模型（L1 闸门 ×9 / L2 关键决策 ×3 / L3 意图提示）与能力探测协议（资产盘点七类探测面＋单/多代理判定）：全量细则见 [references/triggers.md](references/triggers.md)（T2/T3 已交付）。

## 5. 配套资产索引（T2 交付）

| 资产 | 位置 | 用途 |
|---|---|---|
| 角色卡 ×9 | `references/roles/` | 9 角色（职责/输入/输出/禁止事项/纪律） |
| 行为规范包 | `references/disciplines/conduct.md` | 七纪律＋自主度矩阵（每条带「为什么」） |
| 工程规范包 | `references/disciplines/engineering.md` | 代码/测试/安全基线/凭据纪律 |
| 产出模板 | `references/templates/` | 评估报告/PRD/用户故事/技术方案/排期/UAT 清单/上线检查单/用户手册/反馈页＋生成项目 AGENTS.md 模板＋资产盘点简报 |
| 方案调研漏斗 | `references/research-funnel.md` | 阶段 3/4 选型：顾问替查＋证据可见 |
| 触发与装载协议 | `references/triggers.md` | L1-L3 触发＋资产盘点七类探测面＋上下文装载协议 |
| 确认页规范 | `references/confirmation-pages.md` | 双宿主确认页 |
