# 阶段 5 · 开发计划（Plan）· 阶段细则 ○

> 本文是九阶段中第 5 阶段（计划○简版）的执行细则。一句话：智能体换上「计划经理」角色（角色卡见 [../roles/role-5-plan.md](../roles/role-5-plan.md)），把已签字的技术方案拆成一叠用户看得懂的**开发票**（每票一件事＋可检查的完成标准），排出先后顺序与里程碑批次，登记可能卡住的风险，经**开发票批准**（L2）与 **G5-plan** 签字后进开发。
> 互引分工：职责/输入/输出/禁止事项见角色卡；闸门写回与 L2 双写见 [../state-protocol.md](../state-protocol.md)（G5 行）；L1 五选项/L2 草图档行为见 [../triggers.md](../triggers.md)；确认页呈现见 [../confirmation-pages.md](../confirmation-pages.md)。本文只写「这一阶段按什么顺序做、怎么拆、怎么算做完」。
> 纪律基线：[../disciplines/conduct.md](../disciplines/conduct.md)（C1–C7）。本阶段高频条款：C2 票标题大白话/清单 ≤1 屏、C3 拆票取舍属 L2 必经批准、C5 排期即成本预告、C7 已批准票不重拆。

## 0. 开场装载清单（顺序写死，不得跳过、不得凭记忆代替读盘）

| 序 | 必读 | 目的与检查点 |
|---|---|---|
| 1 | `idea2launch/state.json` | 确认 `current_stage=5`、G4-tech 最新状态＝`signed`、`project.tier`、未决缺口。**G4 未签＝禁止开工本阶段**（C6 不跳阶段），播报后引导回阶段 4 |
| 2 | [../roles/role-5-plan.md](../roles/role-5-plan.md) | 计划经理卡：三条禁止事项逐条入脑（禁一票全包、禁未批准就开工、禁模糊时间） |
| 3 | [../disciplines/conduct.md](../disciplines/conduct.md) | 七纪律基线 |
| 4 | 本文（stage-5-plan.md） | 执行序、拆票规则、完成判据 |
| 5 | 输入材料：`idea2launch/4-tech/技术方案.md`（**§六 里程碑切分**——排期骨架）＋`api-contract.md`（端点清单——拆票工作量参照）；`idea2launch/2-requirements/用户故事.md`（US 编号——排期挂载点，编号规约见 [../templates/user-stories.md](../templates/user-stories.md)）；`idea2launch/1-charter/评估报告.md`（红旗清单——风险登记继承源） | 拆票与排期的唯一事实来源 |

- **裁剪规则**：上下文预算不足时，1/3/4 不可裁，2 可只读「职责/禁止事项」两节，5 可先用阶段摘要卡、用时再读全文——裁了什么在开场播报中明示一句（[../triggers.md](../triggers.md) §四）。
- **显式开播播报**（triggers §一.3）：「现在进入**阶段 5·计划经理**：我会把技术方案拆成一张张『开发票』——每张票只做一件事、写清楚做完的标准，排好先后顺序，再列出可能卡住的点。票单由你批准后才开工。产出落在 `idea2launch/5-plan/`，最后由你签字才过关。」
- **成本预告**（C5）：拆票与排期约 1-2 轮会话；风险登记约半轮。以上为估计非承诺。
- 本阶段闸门标识：`G5-plan`（gate 命名见 [../state-protocol.md](../state-protocol.md) §2.3）。
- 术语首现翻译（C2）：开发票＝把开发工作拆成的一张张小任务单，每张写着做什么、怎么算做完——不是要花钱的那种发票；里程碑＝中途检查站，每到一个站都能停下来看看东西跑不跑得起来；风险登记＝提前写下的「可能卡住的点＋绕行办法」清单。

## 1. 执行序（四步，按序执行，不得跳步）

### 第①步 里程碑落位——技术方案 §六 是现成答案（不重切）

1. 读技术方案 §六 里程碑切分表（≥2 个、各挂 US 编号、做完的标志可核对——G4 已签字），直接作为排期骨架，**禁重切、禁增删里程碑**（C6 已签字产出不私改）。
2. 逐行核对三件事：里程碑挂的 US 编号真实存在（对照 [../templates/user-stories.md](../templates/user-stories.md) 编号规约与阶段 2 产出）；「做完的标志」可核对；US 全集没有漏网（每条 P0 故事至少落在某个里程碑里）。发现挂空（编号不存在/标志模糊/US 漏挂）→ 停下呈报用户，回阶段 4 补正（改已签字产出须重签），**不在本阶段顺手改**。

### 第②步 US 排期＋拆票

1. 按里程碑分批拆票（先主流程后补功能、每批收口都能跑起来看——对齐技术方案 §六 切分逻辑）。
2. 拆票三条底线（角色卡禁止事项 1）：一票只做一件事；标题大白话（用户不看术语也知道这张票干什么）；有可检查的完成标准（「能当场核对对错」口径同 C1）。
3. 每票必填四项（单票格式见 §2.1）：做什么／完成标准／关联（US-xxx，必要时 API-xx）／量级估计（「大约一轮会话」式，标注估计非承诺——C1/C5，禁模糊词）。
4. 票文件一票一份落 `idea2launch/5-plan/tickets/`（编号 T-001 起三位递增）；按模板 [../templates/schedule.md](../templates/schedule.md) 组装 `idea2launch/5-plan/排期.md` 汇总表（批次×里程碑×票×US）。
5. api-contract 端点全部有归宿：每张票覆盖的端点在「关联」列点清（骨架 A 无端点时改为数据键名）；有端点无票＝拆漏了，回本步补。

### 第③步 风险登记

1. **红旗继承**：评估报告红旗清单（判据唯一出处见 [../templates/assessment-report.md](../templates/assessment-report.md) 附录 A）中全部 **R3 普通红旗**逐条继承入 `idea2launch/5-plan/风险登记.md`；R1/R2 硬拦红旗不应走到这里——G1 已拦，若发现带 R1/R2 进入阶段 5，属状态异常，按 C7 停下呈报，禁继续拆票。
2. 并入技术方案 §七 风险与预案（预案可执行）；再补排期新增风险（依赖装不上、环境跑不起来、第三方服务变卦类）。每条三列：风险｜大白话后果｜绕行办法（可执行动作，禁「密切关注」类空话，C1）。
3. 总条数 ≤6：超出说明要先把最大的风险换成本阶段的动作，不是多写几行安慰。
4. 落 `idea2launch/5-plan/风险登记.md`；该文件是阶段 6 失败恢复与阶段 7 缺陷评估的参照（C7）。

### 第④步 双闸门：L2 `tickets-approval` ＋ G5-plan 计划签字

顺序写死（[../state-protocol.md](../state-protocol.md) §2.3 G5 行：先双写 `tickets-approval` 决策，闸门签字 → `signed`）：

**A. L2 决策 `tickets-approval`（开发票批准）**

1. 呈现票清单：每行＝票号｜标题｜US｜量级估计——**≤1 屏，超了分批呈现**（C2）；清单后带一句拆票逻辑（为什么这么切）。
2. **生产档**：按确认页规范给实质选项（「批准这版拆票」／「调整拆票——你说明怎么改」＋「其他」）；用户拍板后按七步写入法双写：先 `decisions.log` 追加一行（id=`tickets-approval`，`auto:false`，格式见 [../state-protocol.md](../state-protocol.md) §4.1），再写 `state.json` 的 `l2_decisions`（§2.4）。
3. **草图档**：自动采用推荐拆票并留痕——`auto:true`＋`rationale`（大白话推荐理由：为什么这么切对用户最省心）双写落盘，并向用户播报「已自动采用这版拆票，理由是＿＿，可随时改」；改＝重走本 L2（追加新条目，禁删旧条目）。
4. 拆票批准后变更＝方向变更（C6）：向用户说明影响面（阶段 6 开发全部受影响）后重走本 L2。

**B. L1 闸门 `G5-plan`（计划签字）**

1. 按确认页规范呈现，顺序不可倒：大白话摘要 ≤3 句（做了什么——拆票 N 张、排 M 个里程碑、风险 K 条；产出在哪——`idea2launch/5-plan/` 三件；下一步是什么——阶段 6 按票开发）＋**后果声明先于选项**（签字＝票清单与排期定稿进开发，此后改票＝改已签字产出须重签（C6）；退回＝留在阶段 5 按意见修改）＋**默认五选项**：看细节／改了再签／签字／退回／回退上一闸门（语义见 [../triggers.md](../triggers.md) L1）。
2. 写回（七步写入法，写路径唯一）：签字 → gates 追加 `G5-plan` `signed`、`current_stage=6`；退回 → 追加 `returned`（附原因）留阶段 5；回退上一闸门 → `G4-tech` 追加 `returned` 退回阶段 4。
3. **两档一致**：草图档只自动 L2（上述 A.3），G5 闸门仍须用户真人签，禁代签（C4 矩阵第 5 行）。
4. 连续两次退回 → 触 C3 红旗升级对齐，禁第三次硬交。
5. 签字后按生成项目 AGENTS.md 模板（[../templates/generated-project-AGENTS.md](../templates/generated-project-AGENTS.md) §4）的阶段台账规约追加「阶段 5 摘要卡」（AGENTS.md 尚未实例化——首次实例化在阶段 6 首个开发动作——本卡先按其注释模板记录，届时随台账补写）。

## 2. 拆票与排期规约

### 2.1 单票格式（内嵌规约，`tickets/` 内每票照此写）

```markdown
### T-{{三位序号}}｜{{标题（大白话，禁术语堆砌）}}

- **做什么**：{{一两句话，说清改哪里、加什么}}
- **完成标准（可核对）**：{{逐条列出，每条能当场核对对错；尽量直接引用 US-xxx 验收标准的「假如／当／那么」}}
- **关联**：{{US-xxx／API-xx（骨架 A 改数据键名）}}
- **量级估计**：大约 {{N}} 轮会话（估计非承诺）
```

### 2.2 排期表（模板 [../templates/schedule.md](../templates/schedule.md)）

- 批次总表一行一个里程碑：批次｜里程碑｜包含票号｜包含 US｜做完的标志（沿用技术方案 §六）｜量级估计。
- 票清单逐票一行，与 `tickets/` 目录文件一一对应——多一张少一张都算账实不符（C1）。
- 呈现纪律：给用户看的清单 ≤1 屏；术语首现必译；估尽量级不给日历日期（日期会撒谎，量级不会——估计非承诺，C1/C5）。

## 3. 完成判据（机械可判定；在用户项目根执行，全过才进闸门）

| # | 判据 | 机械检查（grep，bash） | 通过线 |
|---|---|---|---|
| 1 | 三件产出在盘 | `ls idea2launch/5-plan/`；`ls idea2launch/5-plan/tickets/` | 排期.md＋风险登记.md 在盘；tickets/ 文件数 ≥2 且与排期票清单行数一致 |
| 2 | 每票挂真实 US | `grep -oh "US-[0-9]\{3\}" idea2launch/5-plan/tickets/* | sort -u` 与 `idea2launch/2-requirements/用户故事.md` 编号对照 | 票内 US 编号全部存在于用户故事；零编造 |
| 3 | 每票有量级估计 | `grep -L "估计非承诺" idea2launch/5-plan/tickets/*` | 输出为空（每票都带估计＋非承诺声明） |
| 4 | 端点有归宿 | 对照 `idea2launch/4-tech/api-contract.md` 端点编号与票「关联」列 | 每端点至少落在一张票（「本地完成·无端点」类归属其所属功能的票） |
| 5 | 风险登记含继承 | `grep -c "R3" idea2launch/5-plan/风险登记.md` 对照评估报告红旗 R3 条数 | 评估报告几条 R3 登记至少几条（评估报告「未发现」时，登记须在盘且注明继承源为空＋新增排期风险） |
| 6 | L2 双写留痕 | `grep -c "tickets-approval" idea2launch/decisions.log`；对照 `state.json` l2_decisions | log ≥1 行且与 l2_decisions 最新条目一致（§4.3 对账口径）；`auto` 与档位匹配 |
| 7 | 闸门写回 | gates 最新一条 `G5-plan` 的 status ∈ {signed, returned} | 这是进入阶段 6 的唯一凭据 |

- 判据 1–6 在**呈现闸门前**全绿；判据 7 随第④步发生。不全绿＝阶段未完成，禁呈现闸门。
- 「完成」的口径＝`G5-plan` 签字（`signed`）落盘；签字前排期与票均为草稿（C4 矩阵第 2 行）。

## 4. 与其他协议的衔接

- 角色卡：[../roles/role-5-plan.md](../roles/role-5-plan.md)——本文不重复其职责/禁止事项，冲突时以纪律包与角色卡为准。
- 状态读写：L2 双写与七步写入法 [../state-protocol.md](../state-protocol.md) §2.2/§2.4/§4；G5 语义与播报用语（「开发计划已批准」）§2.3；中断对账 §4.3。
- 触发与装载：[../triggers.md](../triggers.md)（本文 §0 即装载协议在阶段 5 的展开）；L1 五选项与 L2 草图档行为见其二。
- 确认页：[../confirmation-pages.md](../confirmation-pages.md)——L2 实质选项与 L1 五选项的呈现结构。
- 上游输入：里程碑切分＝技术方案 §六（[../templates/tech-plan.md](../templates/tech-plan.md)）；US 编号规约 [../templates/user-stories.md](../templates/user-stories.md)（阶段 2 产出，见 [stage-2-requirements.md](stage-2-requirements.md) 第 4 步）；红旗判据唯一出处＝评估报告附录 A（[../templates/assessment-report.md](../templates/assessment-report.md)）。
- 下游去向：票清单→阶段 6 逐票开发（[stage-6-build.md](stage-6-build.md)）；风险登记→阶段 6 失败恢复与阶段 7 缺陷评估参照；排期批次→G6-build 里程碑验收节奏。
- 中断续跑：任一步中断 → 开场读 state.json＋检查 `idea2launch/5-plan/` 已有物；已批准票不重拆（角色卡 C7），未批准票续打磨；L2 双写中断按 [../state-protocol.md](../state-protocol.md) §4.3 对账补齐。
