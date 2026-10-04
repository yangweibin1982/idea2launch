# 阶段 9 · 轻运营（Operate）· 阶段细则 ○（M1 简版随行）

> 本文是九阶段中第 9 阶段（轻运营○简版，M1 随行交付）的执行细则。一句话：智能体换上「运营管家」角色（角色卡见 [../roles/role-9-operate.md](../roles/role-9-operate.md)），建一个反馈收集入口、写清「想改功能时怎么走」的迭代入口，向用户交代项目完整状态收尾——**本阶段无强制闸门**。
> 互引分工：职责/输入/输出/禁止事项见角色卡；G9 收尾写回见 [../state-protocol.md](../state-protocol.md)（G9 行：经用户确认后写一条 `skipped`，不写亦合法）；迭代意图只提示不自动动工见 [../triggers.md](../triggers.md) L3；确认页呈现见 [../confirmation-pages.md](../confirmation-pages.md)。本文只写「这一阶段按什么顺序做、反馈怎么路由、怎么算做完」。
> 纪律基线：[../disciplines/conduct.md](../disciplines/conduct.md)（C1–C7；本阶段无代码作业，迭代走回开发时再装 [../disciplines/engineering.md](../disciplines/engineering.md)）。本阶段高频条款：C3 一切迭代方向归用户、C6 禁静默改已交付代码、C5 两条迭代路径的成本差异讲清。

## 0. 开场装载清单（顺序写死，不得跳过、不得凭记忆代替读盘）

| 序 | 必读 | 目的与检查点 |
|---|---|---|
| 1 | `idea2launch/state.json` | 确认 `current_stage=9`、`G8-delivery`＝`signed`、`open_gaps` 全部条目（「以后再说」登记是迭代入口的存量输入）。**G8 未签＝禁止进入**（C6），播报后回阶段 8 |
| 2 | [../roles/role-9-operate.md](../roles/role-9-operate.md) | 运营管家卡：三条禁止逐条入脑（禁静默改已交付代码、禁自动执行迭代、禁承诺未实现功能） |
| 3 | [../disciplines/conduct.md](../disciplines/conduct.md) | 七纪律基线 |
| 4 | 本文（stage-9-operate.md） | 执行序、反馈路由、完成判据 |
| 5 | 输入材料：`idea2launch/8-delivery/` 全套＋用户手册（反馈入口与手册互指）；`2-requirements/PRD.md` 不做清单＋state.json 的 `open_gaps`（迭代候补池） | 迭代路由的依据 |

- **裁剪规则**：上下文预算不足时，1/3/4 不可裁，2 可只读「职责/禁止事项」两节，5 可延后到用时再读——裁了什么在开场播报中明示一句（[../triggers.md](../triggers.md) §四）。
- **显式开播播报**（triggers §一.3）：「现在进入**阶段 9·运营管家**：这是最后一站——我会给你建一个提意见的入口、写清楚以后想改功能该怎么走，然后把这个项目的完整状态跟你交代清楚。这一站没有强制签字闸门。」
- **成本预告**（C5）：建入口＋收尾交代约半轮到 1 轮会话。以上为估计非承诺。
- 本阶段闸门标识：`G9-operate`——**无强制闸门**（[../state-protocol.md](../state-protocol.md) §2.3 G9 行：收尾经用户确认后写 `skipped`，不写亦合法；**禁写 `signed`**——本阶段没有「签字通过」语义）。
- 术语首现翻译（C2）：迭代＝给已交付的应用改功能、加功能、修问题的下一轮；轻运营＝不上新功能，只接反馈、指路、陪跑；增量票＝在大项目里加做一小件事的单子，不动已经交付的主体。

## 1. 执行序（三步，按序执行）

### 第①步 建反馈入口

1. 落 `idea2launch/9-operate/反馈.md`，三要素：**怎么提**（会话里直接说；或双击反馈页填写、把生成的文本粘回会话）；**反馈会去哪**（§2 路由表）；**已收到过什么**（登记表，append-only：日期｜类型｜一句描述｜去向）。
2. 按模板 [../templates/feedback-page.md](../templates/feedback-page.md) 在用户项目生成 `反馈页.html`：静态页、双击可开、零外部依赖、**不联网不上传**（填的内容只留在用户机器上，生成文本由用户手动粘回会话——数据去向用户自主，C4 矩阵第 8 行同源）。用户选择不用页面、只在会话里说，同样合法（角色卡职责 1：手动记录或应用内反馈页约定，M1 从简）。
3. 反馈页与手册的指路关系写在 `反馈.md` 里；用户手册已交付不改——改已签字产出须重签（C6）。

### 第②步 写迭代入口（两条路＋触发确认规则）

1. **小改动路**（改一处文案/修一个小问题/调一个样式）：立增量票，按 [stage-5-plan.md](stage-5-plan.md)（拆票批准 L2）→ [stage-6-build.md](stage-6-build.md)（开发＋里程碑验收）→ [stage-7-quality.md](stage-7-quality.md)（实测）走——**改动经闸门**；波及已签字产出（PRD/原型/技术方案描述的行为）时重签对应闸门（C6）。
2. **新功能路**（加功能/方向变化）：回 [stage-2-requirements.md](stage-2-requirements.md) 增量走（新增用户故事 → 受影响阶段依次重走）；PRD 不做清单与 `open_gaps` 里的「以后再说」条目是天然候补池（[../state-protocol.md](../state-protocol.md) §5）——逐条列出让用户挑，禁智能体自行挑单开工（C3）。
3. **触发确认规则**：任何迭代改动必须用户发起或确认——检测到「继续做/加功能/顺手改一下」类意图，只提示可做动作与后果，不擅自动工（[../triggers.md](../triggers.md) L3；角色卡禁止事项 2）。已交付代码的任何改动都算迭代，禁静默修（角色卡禁止事项 1）。
4. 成本差异一句话（C5）：小改动大约 1-2 轮会话；新功能从阶段 2 起步，消耗与功能体量成正比——均估计非承诺。写进 `反馈.md` 末尾。
5. **迭代盘点**（`open_gaps` 批量裁决；裁决＝对记下的每件未决事给个说法，细则见 [../gap-workbench.md](../gap-workbench.md)）：用户想启动下一轮迭代（或说「处理一下之前记的事」）→ 读 `state.json` 的 `open_gaps` 全部 `open` 条目，按 [../gap-workbench.md](../gap-workbench.md) 裁决页逐条走四选项（现在就办／登记到下一期／知情带过／撤销，一次一缺口、禁默认选中）；裁决为「登记到下一期」的条目构成**迭代清单**。用户正式启动下一轮迭代时，迭代清单作为阶段 2 增量需求的正式输入——回 [stage-2-requirements.md](stage-2-requirements.md) 增量流程（对齐 [../triggers.md](../triggers.md) L3「加功能类」），逐条让用户挑、禁自行挑单开工（C3）。落盘走 [../gap-workbench.md](../gap-workbench.md) §4 两条写路径：本阶段无强制闸门，批量裁决默认走 W2「用户拍板」路径（先 log 后 state，七步写入法）；恰逢第③步 G9 收尾写回时也可随该闸门事件同笔联动（W1）。

### 第③步 收尾与完结留痕（G9 无强制闸门）

1. 向用户交代项目完整状态（与 `state.json` 逐项对账，C1）：九阶段走完；闸门史一览翻译成大白话（「你的需求文档、设计、技术方案、开发计划都已确认，每个里程碑验收过、你本人验收过、交付签收过」）；文档在哪（`idea2launch/` 目录导览）；想改找谁（第②步两条路）。播报用语按 [../state-protocol.md](../state-protocol.md) §2.3（「进入轻运营」）。
2. `open_gaps` 逐条问用户「现在处理还是先放着」：处理的走 [../gap-workbench.md](../gap-workbench.md) 裁决页四选项（含按 §2 路由的「现在就办」与转下一期的「登记到下一期」，见第②步 5）；先放着的保持 `open`；明确放弃／当时记错的按裁决关闭（`status=closed`＋`note`，[../state-protocol.md](../state-protocol.md) §5；落盘见 [../gap-workbench.md](../gap-workbench.md) §4）。
3. 收尾写回（经用户确认，七步写入法）：gates 追加 `G9-operate` `skipped`（`note` 记完结状态一句话）；用户不想留记录则不写——两种都合法（[../state-protocol.md](../state-protocol.md) §2.3 G9 行）。
4. 本阶段之后流程不再自动推进：用户带反馈回来时按 §2 路由；重入先读 state.json、反馈入口已建不重建（角色卡 C7）。

## 2. 反馈路由表（写进 `反馈.md`，三条固定去向）

| 反馈类型 | 去向 | 留痕 |
|---|---|---|
| 问题（坏了/报错） | 先诊断：影响使用的走「小改动路」立票；涉数据的紧急问题当场与用户确认处理方式 | `反馈.md` 登记＋（立票时）票文件 |
| 建议（想改/想加） | 第②步两条路按体量分流；「以后再说」类入 `open_gaps` | `反馈.md` 登记＋state.json |
| 疑问（怎么用） | 对照用户手册解答；手册答不了的记「手册补充建议」，经用户同意后补（已交付文件变更须确认，C6） | `反馈.md` 登记 |

## 3. 完成判据（机械可判定；在用户项目根执行）

| # | 判据 | 机械检查（grep/test，bash） | 通过线 |
|---|---|---|---|
| 1 | 反馈入口在盘 | `test -f idea2launch/9-operate/反馈.md`；`grep -cE "怎么提|去哪" idea2launch/9-operate/反馈.md` | ≥2——三要素节齐全（怎么提/去哪/登记表） |
| 2 | 反馈页合规（若用户选择要页面） | `test -f 反馈页.html`；`grep -cE "https?://" 反馈页.html` | 页面在盘；http(s) 引用计数＝0（零外部依赖、file:// 可开）；用户选会话记录时本条豁免并在 `反馈.md` 注明 |
| 3 | 迭代入口两条路在盘 | `grep -c "阶段 2\|增量票" idea2launch/9-operate/反馈.md` | ≥2——两条路＋触发确认规则都写明 |
| 4 | G9 写回合规 | gates 中若有 `G9-operate` 条目：status ＝ `skipped` 且 `note` 非空 | 出现 `signed` ＝违规（本阶段无签字语义）；无条目亦合法 |
| 5 | 完结交代与盘一致 | 会话播报对照 state.json gates 史逐项核对 | 无夸大完成度（C1） |
| 6 | 迭代盘点裁决合规（若发生） | `grep -cE "\"id\": ?\"gap-" idea2launch/decisions.log`（裁决发生的轮次 ≥1）；gap 行数与本次置 `closed` 的条目数对照 state.json 核对；`grep -cE "\"auto\": ?true" idea2launch/decisions.log` ≤3（auto:true 仅限草图档三个固定 L2，缺口裁决行恒 false） | gap 行数＝closed 条目数；gap 行无 auto:true |

- 判据 1–3、5 在收尾交代前全绿；判据 4 随第③步发生；判据 6 仅在发生了迭代盘点裁决时检查——未裁决即无 gap 行，亦合规。「完成」的口径＝收尾交代完毕＋G9 写回合规（`skipped` 或无条目）。

## 4. 与其他协议的衔接

- 角色卡：[../roles/role-9-operate.md](../roles/role-9-operate.md)——本文不重复其职责/禁止事项，冲突时以纪律包与角色卡为准。
- 状态读写：G9 行（`skipped` 语义，无强制闸门）与 open_gaps §5 见 [../state-protocol.md](../state-protocol.md)；七步写入法 §2.2。
- 触发：迭代意图只提示不自动动工——[../triggers.md](../triggers.md) L3；确认页：[../confirmation-pages.md](../confirmation-pages.md)（收尾确认与手册补改确认）。
- 模板：[../templates/feedback-page.md](../templates/feedback-page.md)（反馈页唯一出处——零外部依赖约束见其文首注记）。
- 缺口裁决：缺口分类、裁决页四选项与两条写入路径见 [../gap-workbench.md](../gap-workbench.md)；第②步 5 的迭代盘点即其裁决时机 3（批量裁），迭代清单是阶段 2 增量的正式输入。
- 回环：小改动路→[stage-5-plan.md](stage-5-plan.md)；新功能路→[stage-2-requirements.md](stage-2-requirements.md)；改动涉代码时重新装载 [stage-6-build.md](stage-6-build.md) 与工程规范包——九阶段状态机自此闭环。
- 中断续跑：重入先读 state.json 确认项目状态；反馈入口已建不重建，从断点续（角色卡 C7）。
