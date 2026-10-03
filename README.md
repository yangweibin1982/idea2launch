# idea2launch

**idea2launch** is an open-source agent plugin that takes a complete non-technical beginner from a raw idea to a **running web application plus full documentation**, through a 9-stage guided wizard where an AI agent plays every role of a software company — and every stage ends with a human sign-off gate.

> Status: M1 in development (skeleton in place; stage details land ticket by ticket). 中文说明见下方正文。

## Why

<!-- M1 交付后补：动机、市场对照与四项组合空白的英文版 -->

## Features

<!-- M1 交付后补：功能清单英文版 -->

- Idea due-diligence before any code (12-dimension advisory assessment)
- 9-stage wizard with sign-off gates and rollback
- Resumable across sessions via a single state file
- Draft tier / production tier

## Quick Start

<!-- M1 交付后补：安装与一键运行步骤（依赖 ZCode 壳 T9 交付） -->

## License

[MIT](LICENSE) — Copyright (c) 2026 idea2launch contributors

---

## 中文说明（正文）

### 项目一句话

**idea2launch** 是一个 MIT 开源插件：**智能体应用新手**（完全非技术）只带一个想法进来，智能体替代软件公司全角色（产品、架构、开发、测试、交付……），经 **9 阶段向导**交付**可运行的 Web 应用＋全套文档**（PRD／架构／测试／手册）。开工前先顾问式质疑你的想法，每阶段文档化＋人工签字闸门，跨会话可续跑。

### 九阶段向导

| 阶段 | 产出 | 闸门 |
|---|---|---|
| 1 立项评估 | 12 维评估报告＋红旗标记 | 「继续 / 调整 / 转草图档 / 放弃」 |
| 2 需求 | PRD＋用户故事 | PRD 签字 |
| 3 设计 | 可点原型＋UI 规范 | 原型＋UI 规范 freeze |
| 4 技术 | 技术方案＋API 契约 | 技术栈定稿＋方案签字 |
| 5 计划 | 排期＋任务票＋风险登记 | 票批准 |
| 6 开发 | 代码＋构建日志 | 里程碑验收（可攒批） |
| 7 质量 | 测试报告＋大白话 UAT 清单 | UAT 签字 |
| 8 交付 | 一键运行包＋手册＋上线检查单 | 交付确认＋「下一步可发布」提示 |
| 9 轻运营 | 反馈页＋迭代入口 | 无强制闸门 |

### 双档运行

- **草图档**：砍辩论与评审，关键决策自动采用推荐项并留痕——最快看到东西。
- **生产档**：全流程辩论、评审、逐票验收——认真做一个要上线的应用。
- 启动时预告预计消耗，你选档。

### 核心差异化

市场实查（2026-10）结论——四项组合空白，即本项目定位：

1. **想法质疑**：写代码前先做顾问式尽调（12 维评估＋红旗），不做明显不可行的事；
2. **外行人向导**：术语翻译、防呆确认、每步可回退、默认值友好，全程面向完全非技术用户；
3. **签字闸门**：9 个阶段闸门＋3 个关键决策点，人签字才前进，可退回可回滚；
4. **开源自托管**：纯 markdown 技能包＋状态文件，零运行时依赖，跑在你自己的智能体环境里。

对照组：开源 AI 软件公司类（MetaGPT/ChatDev/GPT Pilot/OpenHands）流程全但面向开发者；闭源外行人建应用类（Lovable/Bolt/v0/Replit Agent）有向导但闭源云托管、不质疑想法、无签字闸门。

### 架构

- `core/` 平台无关核心——纯 markdown 技能包（主工序状态机＋阶段细则＋角色卡＋规范包＋模板）＋状态机 schema；
- `modules/ui-spec/` 第 3 阶段（设计）子模块，可独立使用；
- `shells/` 双壳：ZCode 插件壳（M1）＋通用 CLI 壳（M2）；
- `docs/` 用户手册与贡献者文档。

### 当前状态

**M1 开发中**：仓库骨架与状态机 schema 已就位；9 阶段细则、角色卡、规范包、ZCode 壳按票序交付中。占位节（Why / Features / Quick Start 英文版）**M1 交付后补**。首次发布前会先用真实想法完整走通全流程（含中断续跑与双档实测）。
