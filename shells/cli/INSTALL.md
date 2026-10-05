# 安装 idea2launch（通用 CLI 壳）

> 本壳＝`shells/cli/` 目录：`skills/idea2launch/SKILL.md` 薄入口＋`l3-hint.js`（L3 意图提示）＋`inject-global.js`（首次运行注入询问）＋`dryrun.mjs`（自检）＋本文档。
> **壳薄核厚**：薄入口只做注册与启动指引，全部工序逻辑在仓库的 `core/` 目录——安装时必须让 core 可达（两种安装法的差别就在这一步怎么达成）。
> 面向**任意具备「技能/提示词装载」能力的 CLI 智能体宿主**（能读 markdown 技能文件并按其执行的智能体终端均可接）。

## 前置条件

- 任一 CLI 智能体宿主：有技能目录或等价的系统提示注入点（下文统称「宿主技能目录」）；
- **Node.js ≥ 18** 且 `node` 在 PATH（`l3-hint.js`/`inject-global.js`/`dryrun.mjs` 以 `node` 运行；不装 Node 技能仍可用——L3 退化为薄入口 §5 的智能体每轮自查，注入询问退化为薄入口 §4 的手工三步）；
- 本仓库本体（`git clone <仓库地址>` 或下载解压），下文以 `<repo>` 指其根目录，以 `<宿主技能目录>` 指宿主装载技能的位置。

## 方式① 目录引用（推荐：更新只需 git pull）

让宿主直接引用仓库内的壳目录，core 靠薄入口探测链向上找到 `<repo>/core/`：

1. **符号链接法**：在 `<宿主技能目录>` 下建链接指到仓库技能目录——
   - Windows（管理员或开发者模式）：`mklink /D <宿主技能目录>\idea2launch <repo>\shells\cli\skills\idea2launch`
   - macOS/Linux：`ln -s <repo>/shells/cli/skills/idea2launch <宿主技能目录>/idea2launch`
2. **搜索路径法**（宿主支持配置技能搜索目录时）：把 `<repo>/shells/cli/skills` 加为宿主的技能搜索路径之一；
3. 重开宿主会话（技能清单在会话启动时装载）。

> 方式①下薄入口按 `<本文件所在目录>/../../../../core/SKILL.md`（上四级＝仓库根）命中 core；若宿主把技能**复制**进自己的缓存导致相对路径断了（症状：启动技能后提示「core 缺失」），改用方式②。

## 方式② 复制补全（合成自包含技能，安装位置无关）

在 `<宿主技能目录>` 下建 `idea2launch/` 目录，放入**四件**：

| 目标 | 来源 |
|---|---|
| `<宿主技能目录>/idea2launch/SKILL.md` | `<repo>/shells/cli/skills/idea2launch/SKILL.md` |
| `<宿主技能目录>/idea2launch/core/`（整目录） | `<repo>/core/` |
| `<宿主技能目录>/idea2launch/l3-hint.js` | `<repo>/shells/cli/l3-hint.js` |
| `<宿主技能目录>/idea2launch/inject-global.js` | `<repo>/shells/cli/inject-global.js` |

> 方式②是自包含的——宿主复制缓存、换机搬迁都不影响 core 探测（薄入口第 1 候选 `<本目录>/core/SKILL.md` 命中）；代价是 core 更新后需重做复制。

## L3 意图提示接线（三选一，按宿主能力）

L3 语义权威＝`core/references/triggers.md` §二 L3（检测开发意图 → 只提示、不自动执行）；壳只负责把它接到宿主上：

1. **宿主有提交前/提示前钩子机制** → 注册一条进程钩子：
   - 命令：`node <壳根>/l3-hint.js`（`<壳根>`＝方式①的 `<repo>/shells/cli` 或方式②的 `<宿主技能目录>/idea2launch`）；
   - 契约：stdin 收一个 JSON（`prompt` 字段，容错 `user_prompt`/`input`/`content`；`cwd` 字段可选，缺省用进程工作目录）；stdout 输出 ≤3 行提示追加进对话上下文；**永远 exit 0**（一切异常静默，绝不阻断用户输入）；
   - 建议超时 ≤10 秒（脚本本身毫秒级返回）。
2. **宿主无钩子机制** → 依赖两层：(a) 技能清单描述自带触发语义（frontmatter description，宿主把它暴露给模型）；(b) 技能装载后按薄入口 §5「每轮对话自查」执行。可选：把 §5 那三行自查规则写进宿主全局规则文件（配合下节 inject_global 选 on），让未装载技能时也有提示能力。
3. **完全手工** → 不接任何机制，用户显式说「启动 idea2launch」进入流程；L3 退化为 core/triggers.md 定义的智能体自查（行为一致，只是无钩子兜底）。

## inject_global 首次运行询问

技能开场（core/SKILL.md §0 第 3 件事）会自动调用本壳脚本；也可手工直接用：

```
node inject-global.js [项目根]                 # 交互终端：打印问题→读一行回答→写回
node inject-global.js [项目根] --answer on     # 非交互直答（on|off|ask）
```

行为要点（与 ZCode 壳 `first-run-ask.js` 同源同行为）：

- 已有标记文件（`<项目根>/idea2launch/.inject-global-answer`）→ 打印已有答案即返回（幂等，不重写）；重问先删标记；
- `--answer` 直答 → 写标记文件；state.json 已建档则经 tmp 写入→读回自检→原子改名合并 `inject_global` 字段；未建档则**只写标记**（防半截 state.json，答案在建档 W0 时落字段）；
- 非交互环境且无 `--answer` → 只打印问题，**不写任何文件**（询问保持开放，不猜答案）；
- 非法 `--answer` 值 → 退出码 1＋用法提示，不写文件；
- 脚本**只记录决定**：选 on 的实际注入（工作规范摘要＋指针写入宿主全局规则，如 `AGENTS.md`，不整包复制）由智能体/用户执行——注入前展示将写内容与目标文件，注入后复述写了什么、写到哪。

## 安装后验证（五步，逐条可机械核对）

在 `<repo>` 目录执行（方式②安装者把第 1 步的路径换成宿主侧即可）：

1. **文件在位**：`ls <repo>/shells/cli` 应见 `l3-hint.js`、`inject-global.js`、`dryrun.mjs`、`INSTALL.md` 与 `skills/idea2launch/SKILL.md`；宿主技能列表能看到 **idea2launch** 条目。
2. **自检脚本全绿**：`node shells/cli/dryrun.mjs` → 输出全 PASS（覆盖探测链、L3 样例、注入询问、引用路径），末行 `0 failed`，退出码 0。
3. **L3 冒烟**（三连）：
   - `echo '{"prompt":"帮我做一个记账的小应用","cwd":"<某空目录>"}' | node shells/cli/l3-hint.js` → 输出 ≤3 行 `[idea2launch]` 提示（建议启动语）且退出码 0；
   - 同命令把 prompt 换成 `"继续用 idea2launch 做我的项目"` → **无输出**（白名单豁免）；
   - prompt 换成 `"今天天气怎么样"` → **无输出**（不命中静默）。
4. **注入询问冒烟**（两连，用临时空目录）：
   - `node shells/cli/inject-global.js <临时空目录>`（管道下＝非交互）→ 只打印问题与「未写入任何文件」提示，且临时目录**没有**生成 `idea2launch/`；
   - `node shells/cli/inject-global.js <临时空目录> --answer on` → 退出码 0，`<临时目录>/idea2launch/.inject-global-answer` 内容为 `on`。
5. **技能加载**：对宿主说「**启动 idea2launch**」→ 智能体按九阶段向导开场（能力探测→注入询问→建档选档），而不是当普通聊天闲聊；若提示 core 缺失，按方式②补复制 core。

## 与 ZCode 壳的对照（S2 壳薄核厚）

两壳成员一一对应，**行为一致、宿主接线不同**；一切工序逻辑都在共享的 `core/`，两壳均不复制工序正文。

| 成员 | ZCode 壳（`shells/zcode/`） | 通用 CLI 壳（`shells/cli/`） | 行为一致性 |
|---|---|---|---|
| 插件清单 | `.zcode-plugin/plugin.json`＋`marketplace.json` | 无（通用宿主无统一清单格式，由宿主各自机制注册技能目录） | —（接线差异，非行为差异） |
| 薄入口 | `skills/idea2launch/SKILL.md` | `skills/idea2launch/SKILL.md` | 同构：core 探测链（固定两级＋逐级上探＋指纹）、显式/续跑/L3 三启动方式、开场三步注入询问 |
| L3 意图提示 | `hooks/l3-intent-hint.js`（UserPromptSubmit 钩子） | `l3-hint.js`（stdin JSON 通用契约；无钩子宿主→薄入口 §5 自查） | 同源复制：KEYWORDS/WHITELIST/话术/≤3 行/永不阻断/fail-silent/cwd 穿越守卫逐项一致 |
| inject_global 询问 | `hooks/first-run-ask.js`（参考实现） | `inject-global.js`（泛化壳成员） | 同源复制：marker＋state.json 合并、`--answer`、非交互克制、幂等、退出码逐项一致 |
| 钩子注册 | `hooks/hooks.json`（`${CLAUDE_PLUGIN_ROOT}` 变量） | 无统一格式 → INSTALL.md「L3 接线」节给通用契约 | 接线差异 |
| 安装文档 | `INSTALL.md`（ZCode 市场向）＋`INJECT-GLOBAL.md` | `INSTALL.md`（本文件，通用宿主向；注入约定并入） | 双安装法＋验证清单同构；注入共同约定一致 |
| 自测 | `test/test-hooks.mjs` | `dryrun.mjs` | 全 PASS 才算交付，出口一致（exit 0/1） |

## 卸载

1. 删除宿主侧接线：方式①删符号链接/移除搜索路径，方式②删 `<宿主技能目录>/idea2launch/`；宿主有钩子注册的一并注销；
2. 清理注入残留：若注入询问选过 **on**，检查宿主全局规则文件（如 `AGENTS.md`）中 idea2launch 注入段并手工删除——选 off/ask 时本壳从不写宿主全局文件；
3. 各用户项目里的 `idea2launch/` 目录是项目进度档案（state.json 等），卸载壳不会删除它；确认不再需要时手工删除即可。

## 常见问题

| 症状 | 原因与处置 |
|---|---|
| 启动技能后提示「core 缺失」 | 宿主复制了技能、相对路径断了 → 改用方式②（复制 core 进技能目录） |
| 无 L3 提示 | 宿主无钩子机制且未接自查 → 按「L3 接线」第 2 条落地；或 `node` 不在 PATH |
| `inject-global.js` 只印问题不落盘 | 非交互环境的克制行为（设计如此）→ 用 `--answer on|off|ask` 直答，或在交互终端重跑 |
| 探测链命中了别的 core | 指纹校验未通过会自动跳过；仍异常时检查是否手工改动过 core/SKILL.md 的 frontmatter（`name: idea2launch`） |
