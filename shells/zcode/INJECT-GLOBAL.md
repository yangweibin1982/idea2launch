# INJECT-GLOBAL · 首次运行注入询问流程（双宿主）

> 对应 G1 决策 10：**零侵入为默认；首次运行询问是否注入宿主全局规则，配置 `inject_global: ask|on|off`（默认 ask）**。
> 字段的机器可读定义：`core/state.schema.json` 的 `inject_global`（required 字段，enum `ask|on|off`，schema 默认语义 ask）。
> 三个取值的含义：**on**＝把 idea2launch 工作规范摘要与指针写入宿主全局规则（每次会话生效，侵入宿主配置）；**off**＝零侵入，规范只在流程内按阶段装载；**ask**＝每个新项目首次运行时再问一次。

## 一、共同约定（两宿主一致）

1. **决定记录在两处**：
   - 标记文件：用户项目根 `idea2launch/.inject-global-answer`（无扩展名文本文件，内容为一行 `on`／`off`／`ask`）——用于「是否还需要问」的快速判据；
   - `idea2launch/state.json` 的 `inject_global` 字段——schema required，是权威记录。
2. **写时机与写路径**：注入询问发生在建档（开工四件事第 4 步，W0）**之前**；标记文件随时可写；`state.json` 的 `inject_global` 随 W0 建档落入首版。若 state.json 已存在（事后改配置），经用户确认后按 `core/references/state-protocol.md` §2.2 七步写入法最小改写该字段即可——该字段本身就是留痕，不另写 `decisions.log`。
3. **state.json 未建档时禁止创建半截 state.json**：只写标记文件，答案在建档时从标记读入并落入 `inject_global`（半截状态文件会触发读协议的损坏恢复流程）。
4. **询问呈现**：按 `core/references/confirmation-pages.md`「CLI 宿主」规范——大白话摘要＋后果声明前置＋选项式提问；禁倒计时、禁弱化否定选项；直接回车/不选＝`ask`（schema 默认，属配置缺省值，不是诱导性默认项）。
5. **「on」的实际注入物**：工作规范**摘要＋文件指针**（`core/references/disciplines/conduct.md` 七纪律要点、`references/disciplines/engineering.md` 工程基线要点），**不整包复制**；注入前向用户展示将写入的内容与目标文件路径，注入后复述写了什么、写到哪。宿主全局规则的文件名因宿主而异（ZCode/通用 CLI 宿主常见为 `AGENTS.md`），以用户确认为准。
6. **反悔与重问**：删除 `idea2launch/.inject-global-answer` 后重跑首次运行流程即可重新询问；直接改 `state.json` 的 `inject_global` 字段（经用户确认）亦可，标记文件与 state 字段不一致时以 state 为准。

## 二、ZCode 壳（本壳）的流程

纯 markdown 壳无法执行代码，本流程落地为**技能开场三步指令**（见 `skills/idea2launch/SKILL.md` §3），由智能体在会话中执行：

| 步 | 动作 | 细节 |
|---|---|---|
| 1 | 查标记 | 读 `<用户项目根>/idea2launch/.inject-global-answer`；存在 → 读出答案，跳第 3 步 |
| 2 | 问用户 | 按 confirmation-pages.md 规范提问（问题文案见 SKILL.md §3 第 2 步，含 on/off/ask 三选项与各自后果） |
| 3 | 写回 | 答案写标记文件；state.json 已建档 → 七步写入法改 `inject_global` 字段，未建档 → 只写标记（建档 W0 时落字段）；选 on → 按上文第 5 条执行注入 |

ZCode 壳的 L3 意图提示钩子（`hooks/l3-intent-hint.js`）与本流程无耦合——询问只发生在技能被显式启动后的开场，钩子只在会话外提示插件可用。

## 三、通用 CLI 壳（参考实现）

`hooks/first-run-ask.js` 是同一逻辑的可运行参考实现，供 M2 CLI 壳与手工使用者复用：

```
node hooks/first-run-ask.js [项目根] [--answer on|off|ask]
```

- 无标记＋有 `--answer` → 记录：写标记文件；state.json 存在则合并 `inject_global` 字段（tmp 写入→读回自检→原子改名，七步写入法的缩影），不存在则只写标记并提示「建档时落入」。
- 无标记＋无 `--answer`＋交互终端（TTY）→ 打印问题，读一行回答（回车＝ask），再走记录分支。
- 无标记＋无 `--answer`＋非交互环境（管道/重定向）→ 只打印问题，**不写任何文件**，提示在交互终端重跑（询问保持开放，不猜答案）。
- 已有标记 → 打印已有答案即返回（幂等，不重写）；重问先删标记。
- 非法 `--answer` 值 → 退出码 1＋用法提示，不写任何文件。
- 本脚本**只记录决定**：选 on 时的实际注入由调用方（智能体或用户）按第一节第 5 条执行——注入物与目标文件因宿主而异，脚本不越权写宿主全局文件。

两宿主行为一致性：检测面（标记文件→询问→写回标记＋schema 字段）、默认值（ask）、未建档时的克制（不造半截 state.json）、注入物形态（摘要＋指针）完全一致；差异仅在执行者（ZCode＝智能体按指令执行，CLI＝本脚本执行）。
