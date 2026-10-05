# idea2launch · UI 设计规范子模块（modules/ui-spec）

> 第 3 阶段（设计）的随插件开源资产：一套全局 UI 设计规范＋配套工序，可独立于插件使用。
> 面向两类读者：**执行设计阶段的 LLM 智能体**、**想手改的设计贡献者**。

## 三件套结构

| 部分 | 文件 | 状态 |
|---|---|---|
| ① 全局 UI 设计规范 | `ui-spec.md`（主规范：token 三层/色彩/排印/间距/圆角阴影层级/动效/密度触控/图标插画 ＋ §9 新手默认 token 套装与风格预设 ＋ §10 LLM 生成原型 checklist）<br>`style-anchors.md`（风格方向库＋原型技术栈约束）<br>`components.md`（组件状态矩阵）<br>`interaction-a11y.md`（交互与可达性硬指标）<br>`review-checklist.md`（原型交付自检清单） | ✅ 已交付 |
| ② 页面设计做法 | `page-design.md`（PRD→页面清单→信息架构→布局选型→原型工序）、`prototype-spec.md`（单文件 HTML 原型技术规范）、`templates/prototype-template.html`（原型骨架模板）、`templates-registry.md`（页面模板库 v1：骨架×风格已验证组合，新页生成前先查） | ✅ 已交付 |
| ③ 可视化编辑层 | `visual-editor/`（GrapesJS 内核＋新手极简工具条：改文字/删除/上移下移/换图/token 预设切换/线性撤销/三视口预览/导出修改包＋`USAGE.md` 外行人使用卡） | ✅ 已交付 |

三件可独立使用：任何「PRD→原型」流程都可按下方装载顺序取用①②；原型交给用户后按 `visual-editor/USAGE.md` 三步完成可视修改。

## 出处声明

全局规范五件蒸馏自内部技能包 **frontend-design**（2026-10-01 汇编，未随本仓分发），一手来源：

| 来源 | 取什么 | 落在 |
|---|---|---|
| Vercel Web Interface Guidelines（100+ 条 agent 向 checklist） | 交互/可达性/表单/动效细节 | interaction-a11y.md |
| Anthropic frontend-design | 美学方向、排印、反 AI slop | style-anchors.md <!-- nosemgrep: detect-generic-ai-anthprop 文档署名非 API 用法 --> |
| Material 3 / Apple HIG / Fluent 2 / IBM Carbon / Ant Design 5 | token 数值锚点、色彩角色、密度 | ui-spec.md |
| W3C Design Tokens（2025.10 首个稳定版） | token 三层结构与落盘格式 | ui-spec.md §1 |
| Refactoring UI | 层级策略（边框优先于阴影）、灰阶、亲密性 | ui-spec.md §2/§5 |

开源版在移植基础上做了**「新手项目＋LLM 生成原型」**场景适配：

- 新增新手默认 token 套装与两套成品风格预设（ui-spec.md §9，变量同名可整块互换）；
- 新增 LLM 生成原型 checklist（ui-spec.md §10，10 条速查）；
- 风格方向库按新手常见场景裁剪为 5 个，组件/可达性清单按原型场景裁剪，评审清单新增原型专项（H 节）。

各文件头部注明各自取材面；本目录内文档即为唯一事实源，不依赖任何外部路径。

## 使用方式（第 3 阶段智能体按序装载）

1. **开工三问**：界面给谁用、什么场景（工具/内容/官网/电商/后台）？有无既有品牌与配色——有则从品牌推导 token，不另起？
2. **风格方向**：读 `style-anchors.md` 方向库，取 2–3 个候选（关键词＋字体＋配色＋形状）摊给用户拍板，**选定前不动手**；任务已明确指定方向或纯细节修缮时跳过并在交付注明。
3. **token 先行**：新手项目直接取 `ui-spec.md` §9 默认基座，或按拍板方向取对应风格预设，整块复制；有品牌则在基座上覆盖变量并复校对比度。
4. **生成原型**：单文件 HTML＋内联 CSS＋token 变量（禁框架/字体/图标 CDN，`file://` 双击可开）；组件状态逐个对照 `components.md`，交互硬指标对照 `interaction-a11y.md`，生成时过 `ui-spec.md` §10 十条速查；每个可编辑区块标 `data-pid="<page>-<block>-<seq>"`（如 `home-hero-01`）。
5. **交付自检**：跑 `review-checklist.md`，三视口（1440/768/375）截图逐张对照必过项，**禁抽检**；全过才交付。

## 手改须知（人类贡献者）

- 全部数值锚点（对比度 4.5:1、行高 ≥1.7、触控 44px、时长三档等）即本规范的本体价值；改动前先确认有更权威来源，并在该文件头部保留出处。
- token 预设块内变量名在基座与两套风格之间保持**同名**——可视化编辑层的 token 预设切换靠同名 CSS 变量整体替换，改名会破坏切换（新增变量须三套块同步加）。
- 改动后自检：过一遍 `review-checklist.md` 中与改动相关的必过项。
