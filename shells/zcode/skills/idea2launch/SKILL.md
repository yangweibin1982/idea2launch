---
name: idea2launch
description: 智能体应用新手向导——完全非技术的用户只带一个想法进来，智能体替代软件公司全角色，经 9 阶段向导（立项评估→需求→设计→技术→计划→开发→质量→交付→轻运营）交付可运行的 Web 应用＋全套文档。触发说明：用户显式启动（如「用 idea2launch 做一个…」「启动 idea2launch」）时进入；检测到开发/建应用意图但未显式启动时，仅提示可用、不自动执行（L3 意图提示，零成本防误触发，由本壳钩子承担）。
---

# idea2launch（ZCode 壳 · 薄入口）

> 壳薄核厚（架构接缝 S2）：本文件只做**注册与启动指引**，一切工序逻辑在平台无关核心 `core/`（SKILL.md 主工序＋九阶段细则＋角色卡＋规范包＋state 协议）。执行本技能＝先按 §1 定位 core，再完全遵循 core 的内容执行——本文件不重复、不覆盖任何工序逻辑。

## 1. 定位核心内容（按序探测，命中即停）

1. `<本文件所在目录>/core/SKILL.md` —— 「复制补全」安装法（INSTALL.md 方式②）后的布局；
2. `<本文件所在目录>/../../../../core/SKILL.md` —— 「仓库即插件」安装法（INSTALL.md 方式①，本地目录引用安装）后的布局；
3. 均未命中 → 询问用户 idea2launch 仓库的检出位置后按该路径装载；用户无法提供 → 按 INSTALL.md 指引补全。**core 缺失时禁止臆造流程**——只告诉用户如何补全安装，不开工。

## 2. 启动方式

- **显式启动**（「启动 idea2launch」「用 idea2launch 做一个…」）→ 装载 core/SKILL.md，从其 §0「开工四件事」开始（资产盘点 → 能力探测 → §3 注入询问 → 建档与选档）。
- **续跑**（用户项目根已有 `idea2launch/state.json`）→ 按 core/references/state-protocol.md §1 读协议播报当前阶段与可做动作，从断点继续；禁止重做已签字阶段。
- **L3 意图提示**由本壳钩子 `hooks/l3-intent-hint.js` 承担（检测开发意图 → 提示可用、不自动执行）；检测面与提示话术的语义定义见 core/references/triggers.md（宿主实现注记：核心定义检测面与话术，壳实现为提交前钩子，两者行为一致）。

## 3. 开场三步：inject_global 注入询问（G1 决策 10 的壳侧落地）

纯 markdown 壳无法执行代码，本节是给智能体的**指令**；通用 CLI 宿主的同款逻辑参考实现见插件内 `hooks/first-run-ask.js`，双宿主流程对照见插件内 `INJECT-GLOBAL.md`。

1. **查标记**：读用户项目根 `idea2launch/.inject-global-answer`（无扩展名文本文件，内容为一行 on/off/ask）。
   - 存在 → 读出答案，跳到第 3 步按答案执行。
2. **问用户**：按 core/references/confirmation-pages.md「CLI 宿主」规范提问（大白话摘要＋后果声明前置＋选项式提问；禁倒计时、禁弱化否定选项、无结构化提问能力时用编号列表）：
   > 摘要：idea2launch 默认零侵入——工作规范只在流程内按阶段装载，不碰你的宿主全局配置。
   > 后果：选「on」会把工作规范摘要与指针写入宿主全局规则文件（如 AGENTS.md），之后每次会话都生效（侵入宿主配置，可手工移除）；选「off」完全不写入；选「ask」则以后每个新项目首次运行时再问一次。
   >
   > 是否把 idea2launch 的工作规范注入宿主全局规则？
   > 1. on（注入）  2. off（不注入）  3. ask（以后每个项目再问）
   >
   > 不选直接回车＝ask（schema 默认值）。
3. **写回**：
   - 把答案写一行进 `idea2launch/.inject-global-answer`（目录不存在则先建目录）；
   - state.json **已建档** → 经用户确认后按 core/references/state-protocol.md §2.2 七步写入法最小改写其 `inject_global` 字段（schema required，取值枚举 ask|on|off；该字段本身即留痕，不另写 decisions.log）；
   - state.json **尚未建档** → 只写标记文件；答案会在 §0 第 4 步建档（W0）时落入 `inject_global` 字段；
   - 选 **on** → 执行注入：把工作规范摘要＋文件指针（core/references/disciplines/conduct.md 与 engineering.md 的要点）追加进宿主全局规则文件，**不整包复制**；注入前向用户展示将写入的内容与目标文件，注入后在回复中复述写了什么、写到了哪；
   - 选 **off / ask** → 不触碰任何宿主全局文件。
