# 阶段 3 · 设计（Design）· 阶段细则 ●

> 本文是九阶段中第 3 阶段（设计●深度实现）的执行细则。一句话：智能体换上「设计师」角色（角色卡见 [../roles/role-3-design.md](../roles/role-3-design.md)），把阶段 2 签字的 PRD＋用户故事画成一套用户看得见、改得动的页面原型，连同 UI 规范采用记录一并 freeze 签字。
> **资产定位（先读）**：本阶段的工序与技术规范重资产已随插件交付在 `modules/ui-spec/`（全局 UI 规范＋页面设计做法＋原型技术规范＋可视化编辑层）。**本细则只做接线**：把这些资产串成本阶段执行序——一切工序判据、话术、技术约束以子模块对应文件为唯一事实源，本文不复制其正文（接缝 S3，角色卡禁止事项 2）；本文与子模块冲突时以更严者为准。
> 互引分工：职责/输入/输出/禁止事项见角色卡；闸门与写回见 [../state-protocol.md](../state-protocol.md)；装载顺序与五选项见 [../triggers.md](../triggers.md)；签字页呈现见 [../confirmation-pages.md](../confirmation-pages.md)。纪律基线：[../disciplines/conduct.md](../disciplines/conduct.md)（C1–C7），本阶段高频：C2 术语首现必译、C3 审美取舍升级用户、C5 成本预告、C6 不越层写技术实现。

## 0. 开场装载清单（顺序写死，不得跳过、不得凭记忆代替读盘）

| 序 | 必读 | 目的 |
|---|---|---|
| 1 | `idea2launch/state.json` | 确认 `current_stage=3`、`G2-requirements` 最新状态＝`signed`、`project.tier`、`open_gaps`（含阶段 2「以后再说」登记，读协议见 [../state-protocol.md](../state-protocol.md) §1）。**G2 未签＝禁止开工本阶段**（C6 不跳阶段），播报后引导回阶段 2 |
| 2 | [../roles/role-3-design.md](../roles/role-3-design.md) | 设计师卡：五条禁止事项逐条入脑（尤其禁风格未拍板就动手、禁分叉 ui-spec 另立事实源）；上下文预算不足可只读「职责/禁止事项」两节，裁剪须在开场播报一句留痕 |
| 3 | [../disciplines/conduct.md](../disciplines/conduct.md) | 七纪律基线（本阶段不涉代码，`engineering.md` 无需装载） |
| 4 | 本文（stage-3-design.md） | 接线执行序与完成判据 |
| 5 | [../../../modules/ui-spec/README.md](../../../modules/ui-spec/README.md) | 子模块导览＋「使用方式」五步装载序——**按下方分步装载纪律执行，禁一次全读** |

**分步装载纪律**（上下文纪律，硬条款）：第 5 项 ui-spec 子模块按 README「使用方式」五步**到哪步读哪件**：

- 开工三问（界面给谁用/什么场景/有无品牌）时：只读 README 该节；
- 摊风格候选时：读 `style-anchors.md` 风格方向库（取 2–3 个候选）；
- token 落定时：读 `ui-spec.md` §9（预设块整块取用，不读全文）；
- 逐页设计与生成原型时：读 `page-design.md` 布局库、`prototype-spec.md`、`templates/prototype-template.html`、`ui-spec.md` §10；**每页动手前先查 `templates-registry.md`**（页面模板库，适用即复制复用）；组件与可达性判据按页用时查 `components.md`、`interaction-a11y.md`；
- 交付自检时：读 `review-checklist.md`；
- 引导用户改稿时：读 `visual-editor/USAGE.md`（用户话术）＋ `visual-editor/EDITOR-SPEC.md`（智能体侧行为与边界）。

- 裁剪规则：1/3/4 不可裁，2 可只读两节，5 按上述分步即天然裁剪——裁了什么在开场播报中明示一句（[../triggers.md](../triggers.md) §四）。
- **显式开播播报**（triggers.md §一.4）：「现在进入**阶段 3·设计师**：我会把你的需求画成能亲眼看到、亲手改的页面样品（行话叫原型——看起来和真应用几乎一样、能点能看，但还不能真用），你满意并签字后才进入开发准备。产出落在 `idea2launch/3-design/`。」
- 本阶段闸门标识：`G3-design`（gate 命名见 [../state-protocol.md](../state-protocol.md) §2.3）。
- 术语首现翻译（C2）：IA（信息架构）＝页面之间谁从哪进、谁是主入口的关系地图；token＝界面里颜色、字号、间距这些数值的「统一命名」，改一处全站跟着变；freeze＝定稿封存，定下来不再动，再改就算变更。

## 1. 执行序（五步，与 page-design.md 工序五步一一对应）

> 五步的完整工序（动作明细/产出模板/完成判据/防呆话术）以 [../../../modules/ui-spec/page-design.md](../../../modules/ui-spec/page-design.md) 为唯一事实源；本节只写**本阶段特有的接线动作＋指针**，逐步对应其「步骤 1–5」，不复制其正文。

**开工前提**（缺一不开工）：`G2-requirements` 已签（PRD＋用户故事在 `idea2launch/2-requirements/`）。风格方向与 token 基座拍板在本序第③步开步完成（即 page-design 步骤 3 的输入要求「已拍板的 token 预设与风格方向」在本阶段的落点），此后到 freeze 不再回头讨论配色与风格。

### 第①步 页面清单

- 工序动作（页面判据/大白话职责/主要动作/来源故事/页面名定名）全按 page-design 步骤 1；本阶段接线点唯二：
  1. **输入锚定**：PRD 功能清单（F-xx 编号）＋用户故事（`US-001` 起三位递增编号，规约见 [../templates/user-stories.md](../templates/user-stories.md)，来自阶段 2 第 4 步产出）——每页「来源故事」列必须落 US-xxx 编号，页面↔故事双向可查，无来源的页面按 page-design 防呆删掉或回 PRD 补故事；
  2. **产出落位**：页面清单表随会话呈现给用户过目；定稿随第③步设计方案一并归档 `idea2launch/3-design/`（freeze 时属签字物之一）。

### 第②步 信息架构确认（过程硬闸）

- IA 文本树画法、两条硬规则（每页有入口/首页 ≤2 击可达）与**用户确认话术**全按 page-design 步骤 2——**用户没确认，不进第③步**。
- 本阶段特有：此确认是**过程硬闸**，不是 state.json 写回事件（写事件只有闸门/L2 决策两类，[../state-protocol.md](../state-protocol.md) §2.1）——确认留痕在会话，不写 gates。

### 第③步 逐页设计＋L2 UI 方向拍板

1. **开步先落 L2 `ui-direction` 拍板**（本阶段三处 L2 之一，[../triggers.md](../triggers.md) L2 表）：
   - 从 `style-anchors.md` 风格方向库取 **2–3 个候选**（关键词＋字体＋配色＋形状四要素成套摊选，一次一屏，C2），**选定前不动手**（角色卡禁止事项 1）；
   - 草图档（`project.tier=draft`）自动采用推荐项并留痕：`auto=true`＋`rationale` 必填，向用户播报「已自动采用 X，理由是…，可随时改」（[../state-protocol.md](../state-protocol.md) §2.4）；
   - 拍板双写落档：decisions.log 先追加一行、state.json `l2_decisions` 后写（格式与顺序见 [../state-protocol.md](../state-protocol.md) §4，先 log 后 state）。
2. **token 基座**：按拍板方向取 `ui-spec.md` §9 三套预设之一**整块复制**（有品牌则推导覆盖并复校对比度）——不删变量、不改变量名（可视化编辑层的 token 预设切换依赖同名约定，`prototype-spec.md` §2）。
3. **逐页三件事**（选骨架/绑风格/填内容）：布局库五类骨架选型判据、真实文案三优先级、data-pid 区块规划全按 page-design 步骤 3；每页动手前先查 `modules/ui-spec/templates-registry.md`（模板库检索四步：适用即复制复用改文案，不适用再从零生成）；本阶段特有红线：页面设计只定「长什么样」，**禁出现技术实现**（语言/框架/数据库/部署，C6 不越层——那是阶段 4 的事）。

### 第④步 原型生成（含素材选型）

- 技术约束全按 [../../../modules/ui-spec/prototype-spec.md](../../../modules/ui-spec/prototype-spec.md)：每页一个单文件 HTML 落 `idea2launch/3-design/<page>.html`、内联 CSS＋token 变量、零外部依赖（禁框架/字体/图标 CDN 与任何网络请求）、禁 `<script>`、data-pid 结构纪律与 GrapesJS 兼容约束（其 §3/§4）；生成起点复制 `templates/prototype-template.html`。
- 生成时自检 `ui-spec.md` §10 十条速查；**交付前自检 `review-checklist.md` A–H 逐条＋三视口（1440/768/375）截图逐张看过，禁抽检**（角色卡禁止事项 3），全过才交用户。
- 先一页后批量（来源故事最多的一页先过方向）与断网双击实测，按 page-design 步骤 4 防呆执行。
- **素材选型**：逐页设计若出现图标/插画/非常规字体需求，生成前按本文 §2 替查拍板；无此类需求则记一句「本项目无此类素材需求」跳过，禁为查而查（C5）。

### 第⑤步 用户可视编辑与回传收口

- **编辑引导**：话术按 [../../../modules/ui-spec/visual-editor/USAGE.md](../../../modules/ui-spec/visual-editor/USAGE.md) 三步卡口径原样转述（page-design 步骤 5 动作 A 已有智能体口播版），不自由发挥；不想动手的用户走文字指挥（通道 B）。
- **回传收口**（通道 A 主流程，行为规格见 `visual-editor/EDITOR-SPEC.md` §7）：用户说「原型改好了」→ 智能体**验件**（`3-design/` 必须有 `edited.html`＋`edits.json` 两文件，缺件先问不猜）→ **diff 对账**（edits.json 逐条对照 edited.html 与原稿，发现日志之外的改动→列出请用户确认）→ 无异议后 `edited.html` 覆盖为该页正式 `<page>.html`、`edits.json` 归档 `3-design/edits/<page>-<日期>.json` → 全部页面确认完毕转 §3 freeze。
- 编辑器新增区块的 `<page>-new-<seq>` 临时编号：freeze 时智能体重整编号再归档（`EDITOR-SPEC.md` §5）。

## 2. 素材选型实例（research-funnel 触发点落地）

本节即 [../research-funnel.md](../research-funnel.md) §1 触发点表「阶段 3 · 设计（素材选型）」行的细则实例：四步法全按该文执行，本节只定**这一阶段的查什么与约束判据**。

1. **需求化**（research-funnel §2 第①步）：判据优先级＝用户明说约束 > 本插件规范约束（原型＝单文件 HTML＋内联 CSS＋token 变量＋零外部依赖，`prototype-spec.md` §1——**素材不得引入任何 CDN、字体文件、图标字体或网络请求**）> 智能体常识。检索问题按三类提炼：
   - **图标库**：约束下可选形态只有「开源图标集＋逐枚复制 SVG 源码内联进原型」。查：license 允许嵌入与修改（MIT/CC0 类）、风格家族统一（线宽/圆角一致）、维护活跃度（机械事实：最近发布/提交日期）。
   - **插画风格**：口径按 `ui-spec.md`（简洁几何 SVG 占位，线宽与配色家族和图标一致）。查：候选风格参考与开源插画来源、能否内联 SVG 复现、主色能否映射到 token 语义变量。
   - **字体栈**：规范已锁**系统字体栈**（零外部请求，`ui-spec.md` §9）——本类一般**无需外查**，收敛为核对目标用户设备覆盖即可；用户明确提出品牌字体需求时，如实告知「原型阶段用系统栈、工程阶段再做字体子集化」（`ui-spec.md` §3 口径），诉求登记 `open_gaps`（[../state-protocol.md](../state-protocol.md) §5）。
2. **替查与呈现**（第②③步）：候选 2–4 个；对照表固定六列（候选｜它是什么｜优点｜缺点/约束｜费用｜来源链接＋检索日期）、≤1 屏、每行必带来源；表后给推荐项＋一句理由，**理由必须引用表中事实**（research-funnel §2 第③步 4）。查不到如实记「未查到＋查了什么途径」，禁编造（C1）。
3. **拍板落档**（第④步分派表，已定）：用户拍板后按 research-funnel §2 第④步分派表「阶段 3 素材」行执行——decisions.log JSONL 追加一条（格式 [../state-protocol.md](../state-protocol.md) §4.1）＋ state.json `l2_decisions` 双写（先 log 后 state）；确认页签字后生效。**草图档**按 research-funnel §1 档位差异：候选减半至 2 个、一轮检索即止。用户都不满意→「都不选＋补条件再查一轮」按分派表同节处理。

## 3. 闸门与 freeze（G3-design）

1. **签字物三件**（[../state-protocol.md](../state-protocol.md) §2.3 G3-design 行）：
   - **原型全套**：`idea2launch/3-design/<page>.html` × N＋`edits/` 归档＋页面清单/IA 树/逐页设计方案；
   - **UI 规范 freeze**：本项目**采用记录**落 `3-design/ui-spec/`——采用哪套 §9 预设、哪个风格方向、素材选型结论，各带指向 `modules/ui-spec/` 的指针；只记「采用了哪套」，**禁复制规范正文**（防分叉事实源，角色卡禁止事项 2）；
   - **事件流归档件**：`edits/*.json` 逐页在盘（schema 见 §4 判据 5c）。
2. **freeze 语义（C6）**：freeze 后再改原型＝变更——走「改了再签」：说明改动→改→重过第④步自检→重新呈现本闸门重签；不静默改稿。
3. **闸门呈现**：按 [../confirmation-pages.md](../confirmation-pages.md) 共同要素——大白话摘要 ≤3 句＋后果声明（先于选项：签字＝设计与界面规范定稿进技术方案；退回＝留在阶段 3 按意见修改）＋默认五选项（含回退上一闸门，语义见 [../triggers.md](../triggers.md) L1）；附三视口截图与 review-checklist 自检结果（角色卡职责 5）。
4. **写回**：七步写入法（[../state-protocol.md](../state-protocol.md) §2.2）——签字→`G3-design` 追加 `signed`、`current_stage=4`；退回→`returned`＋原因（**已拍板的 `ui-direction` 保留**，换方向才按 §2.4 追加新决策条目）。同一闸门连续两次退回触 C3 红旗升级，禁第三次硬交。
5. 五选项必须出自用户之口，禁代签（C3/C4）；用户要看细节→展示原型关键页或自检结果后回到本闸门重新给五选项。

## 4. 完成判据（机械可判定，1–7 全过才进闸门；8 随闸门发生）

1. **页面清单**：每行四列齐全（页面名/大白话职责/主要动作/来源故事 US-xxx）；来源故事里的每个 US 编号能在 `idea2launch/2-requirements/用户故事.md` 中找到（`grep -c "US-"` 对照可判定）；
2. **IA 硬闸**：两条硬规则核查通过＋用户确认留痕在会话；
3. **L2 拍板落档**：decisions.log 有 `ui-direction` 行、state.json `l2_decisions` 同 id 最新条目在（草图档条目 `auto=true` 且 `rationale` 非空）；
4. **原型全套**：`3-design/` 文件数＝清单页数；每文件零外部依赖且过 `ui-spec.md` §10 十条；`review-checklist.md` A–H 全过且运行时间晚于最后一次编辑；三视口截图逐张留痕；断网 `file://` 双击实测过；
5. **编辑层增补判据**（三条，全指针化）：
   - a. **往返保真**：至少一份生成原型经编辑层「载入→导出」实测，CSS 变量与 var()/data-pid/@media/DOM 语义保留——验证方法＝`.squad/idea2launch/spike-v1/` 的 A1–A5 断言（`verify.mjs`，与 `modules/ui-spec/visual-editor/test/verify-editor.mjs` 同款方法），逐项 PASS 留痕；
   - b. **可视编辑闭环 UAT 走通**：按 `visual-editor/USAGE.md` 三步卡剧本完成一轮真实闭环「载入→改→导出修改包→拖回 `3-design/`→说『原型改好了』→diff→归档」（通道 B 文字指挥等效），留痕；
   - c. **事件流合 schema**：归档的 `edits/*.json` 逐条核——`seq` 从 1 连续自增、`pid` 非空（元素 pid 或 `__theme__`/`__global__` 占位）、`action` 在八值枚举内；schema 权威定义＝`modules/ui-spec/visual-editor/EDITOR-SPEC.md` §6；
6. **素材选型留痕**：触发过的类各有结论（选定或「未查到＋途径」），对照表每行带来源链接＋检索日期，拍板已落 decisions.log；未触发的类有「无此类需求」一句记录；
7. **规范修订清单裁决**：`idea2launch/3-design/spec-amendments.md` 存在时，清单逐条已裁决、无 open 残留（每条状态 ∈ {采纳, 下轮再议, 维持原规范}；机制见 [../../../modules/ui-spec/page-design.md](../../../modules/ui-spec/page-design.md)「决策反哺」节）——有 open 残留禁 freeze；
8. **闸门写回**：gates 有 `G3-design` 最新条目（status ∈ {signed, returned}）——签字落盘是进入阶段 4 的唯一凭据。

## 5. 与其他协议的衔接

- **角色卡**：[../roles/role-3-design.md](../roles/role-3-design.md)——本文不重复其职责/禁止事项，冲突时以纪律包与角色卡为准。
- **状态读写**：闸门写回与 freeze 语义 [../state-protocol.md](../state-protocol.md) §2.2/§2.3；L2 双写 §2.4/§4；放弃与重启 §1；缺口登记 §5（闸门退回原因不进 open_gaps）。
- **触发与装载**：[../triggers.md](../triggers.md)（本文 §0 即其装载协议在阶段 3 的展开；L1 五选项见其二；L2 `ui-direction` 见其 L2 表；用户中途「加一页/换风格」按 L3 加功能类与方向变更处理——L2 定稿后再变＝方向变更，须重走该 L2 并评估影响面）。
- **确认页**：[../confirmation-pages.md](../confirmation-pages.md)。
- **调研漏斗**：[../research-funnel.md](../research-funnel.md)（§1 触发点表阶段 3 行＋§2 四步法；成本预告与轮次控制按其 §4 衔接 conduct.md C5）。
- **上游输入（阶段 2）**：`idea2launch/2-requirements/PRD.md`（功能清单 F-xx、不做清单）＋`用户故事.md`（US-001 起编号，规约见 [../templates/user-stories.md](../templates/user-stories.md)，工序出处 [stage-2-requirements.md](stage-2-requirements.md) 第 4 步）——页面来源故事用 US 编号回溯；「以后再说」缺口在本阶段冒出相关诉求时按 triggers.md L3 处理，不静默纳入。
- **下游出口**：阶段 4 技术方案按 **data-pid 引用**原型区块、阶段 6 改组件先查 pid、阶段 7 UAT 按「页面＋区块」组织、阶段 9 新需求先定位 pid——接缝细则以 page-design「第 3 阶段工序与其他阶段的接缝」节为唯一事实源，本文不复制。
- **用户预期管理（编辑层已知边界，口径见 `modules/ui-spec/visual-editor/EDITOR-SPEC.md` §8）**：引导用户编辑时把以下边界提前讲清，防 freeze 闸门纠纷——①整体风格调整（预设/色板/圆角/密度）不可撤销，改字/删/挪/换图可撤；②导出以当前画布为准（删了又撤销再导出：文件里元素在、日志有删记录——对账以文件为准、日志为操作历史）；③本地图片内嵌单张 ≤2MB；④编辑器暂无「新增区块」入口，要加东西告诉智能体来改；⑤首次导出浏览器可能询问「允许下载多个文件」，允许即可。已知边界全文以 EDITOR-SPEC §8 为唯一事实源，本节只列向用户播报的最小集。
- **中断续跑**（C7）：任一步中断→开场按装载协议读 state.json＋检查 `3-design/` 已有原型/自检记录/edits 归档，续做不重画；原型文件损坏如实告知并提议恢复（角色卡纪律 C7）。
