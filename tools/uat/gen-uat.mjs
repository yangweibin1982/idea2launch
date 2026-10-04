#!/usr/bin/env node
/**
 * idea2launch · UAT 清单草稿生成器（gen-uat.mjs）
 *
 * 定位（先读这段再跑）：本脚本只做「机械抽取」——把用户项目
 * `idea2launch/2-requirements/PRD.md`（§三 功能清单、§四 核心流程）与
 * `idea2launch/2-requirements/用户故事.md`（每条故事的「假如／当／那么」验收标准）
 * 抽成 UAT 条目骨架，防止智能体编清单时漏条目。
 * 它不懂业务：抽出来的原文不是验收步骤，必须由智能体逐条润色成大白话
 * （打开什么→点什么，一次一步；应看到什么一眼能判断），再按参考库
 * core/references/templates/uat-checklist.md 组装成正式清单
 * （落用户项目 idea2launch/7-quality/UAT清单.md）。草稿禁直接交给用户（C1）。
 *
 * 用法：node gen-uat.mjs <用户项目根> [--out <输出文件>]
 *   不带 --out 时打到 stdout。例：node gen-uat.mjs . --out idea2launch/7-quality/UAT草稿.md
 * 依赖：仅 node 内置模块（node:fs / node:path），零第三方依赖。
 * 退出码：0＝草稿已产出；1＝输入有问题（缺文件／一条都没抽到／写文件失败），报错为一行大白话。
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SELF = "gen-uat.mjs";

/** 一行大白话报错＋非零退出（禁闪退堆栈） */
function die(msg) {
  console.error(`${SELF}：${msg}`);
  process.exit(1);
}

/** 去掉 {{...}} 占位符外壳，只留里面的字 */
function unwrap(s) {
  return String(s).replace(/\{\{([^}]*)\}\}/g, "$1").trim();
}

function readText(path, label) {
  try {
    return readFileSync(path, "utf8").replace(/^\uFEFF/, "");
  } catch {
    die(`找不到${label}：${path} —— 请在用户项目根运行，并确认阶段 2 的两份文件都在盘（idea2launch/2-requirements/）。`);
    return ""; // 不可达，仅为类型收窄
  }
}

// ---------- 通用解析 ----------

/** 按标题行切节：[{ heading, lines }] */
function splitSections(lines) {
  const sections = [];
  let cur = null;
  for (const line of lines) {
    if (/^#{1,6}\s+\S/.test(line)) {
      cur = { heading: line, lines: [] };
      sections.push(cur);
    } else if (cur) {
      cur.lines.push(line);
    }
  }
  return sections;
}

function findSection(sections, keyword) {
  return sections.find((s) => s.heading.includes(keyword));
}

/** 表格行拆单元格：`| a | b |` → ["a","b"]；分隔行/非表格行返回 null */
function tableCells(line) {
  const t = line.trim();
  if (!t.startsWith("|") || !t.endsWith("|")) return null;
  const cells = t.slice(1, -1).split("|").map((c) => c.trim());
  if (cells.every((c) => /^:?-{2,}:?$/.test(c))) return null; // 表头分隔行
  return cells;
}

// ---------- PRD 抽取 ----------

function parsePrd(text) {
  const lines = text.split(/\r?\n/);
  const sections = splitSections(lines);
  const out = { projectName: "", p0Features: [], steps: [], quirks: [], flowName: "" };

  const title = lines.find((l) => /^#\s+\S/.test(l));
  if (title) {
    const m = title.match(/^#\s+(.+?)(?:\s*·\s*产品需求文档.*)?$/);
    out.projectName = unwrap(m ? m[1] : title.replace(/^#\s+/, ""));
  }

  const secFeat = findSection(sections, "功能清单");
  if (secFeat) {
    for (const line of secFeat.lines) {
      const cells = tableCells(line);
      if (!cells || cells.length < 4) continue;
      if (!/^F-\d+/.test(cells[0])) continue;
      const prio = (cells.join(" ").match(/P[012]/) || [""])[0];
      out.p0Features.push({ id: cells[0], name: unwrap(cells[1]), prio });
    }
  }

  const secFlow = findSection(sections, "核心流程");
  if (secFlow) {
    let inQuirks = false;
    for (const raw of secFlow.lines) {
      const t = raw.trim();
      const flowM = t.match(/^\*\*主流程[：:]\s*(.+?)\*\*$/);
      if (flowM) {
        out.flowName = unwrap(flowM[1]);
        continue;
      }
      if (t.includes("出了岔子")) {
        inQuirks = true;
        continue;
      }
      const stepM = t.match(/^\d+[.、)）]\s*(.+)$/);
      if (stepM && !inQuirks) {
        out.steps.push(unwrap(stepM[1]));
        continue;
      }
      const bulletM = t.match(/^[-*]\s+(.+)$/);
      if (bulletM) {
        if (inQuirks) out.quirks.push(unwrap(bulletM[1]));
        else if (out.steps.length === 0) out.steps.push(unwrap(bulletM[1])); // 主流程用无序列表写的兜底
      }
    }
  }
  return out;
}

// ---------- 用户故事抽取 ----------

function parseStories(text) {
  const stories = [];
  let cur = null;
  let inAccept = false;
  for (const raw of text.split(/\r?\n/)) {
    const t = raw.trim();
    const headM = t.match(/^#{3,6}\s+(US-\d+)\s*[｜|]\s*(.+)$/);
    if (headM) {
      if (cur) stories.push(cur);
      cur = { id: headM[1], name: unwrap(headM[2]), prio: "", accept: [] };
      inAccept = false;
      continue;
    }
    if (!cur) continue;
    if (/^[-*]\s*\*\*优先级\*\*/.test(t)) {
      const m = t.match(/P[012]/);
      if (m) cur.prio = m[0];
      continue;
    }
    if (t.includes("验收标准")) {
      inAccept = true;
      continue;
    }
    if (inAccept) {
      if (/^[-*]\s*\*\*/.test(t)) {
        inAccept = false; // 下一个字段（如「来源」）——本卡验收标准结束
      } else {
        const m = t.match(/^[-*]\s+(.+)$/);
        if (m && /(假如|当|那么)/.test(m[1])) cur.accept.push(unwrap(m[1]));
      }
    }
  }
  if (cur) stories.push(cur);
  return stories;
}

// ---------- 草稿组装 ----------

function buildDraft(prd, stories, rootArg) {
  const p0Features = prd.p0Features.filter((f) => f.prio === "P0");
  const p0Stories = stories.filter((s) => s.prio === "P0");
  const p1Stories = stories.filter((s) => s.prio === "P1");
  const today = new Date().toISOString().slice(0, 10);
  const L = [];

  L.push(`# ${prd.projectName || "未命名项目"} · UAT 清单草稿（机械抽取——仅供润色，非正式清单）`);
  L.push("");
  L.push(`> 生成：\`node tools/uat/gen-uat.mjs ${rootArg}\`｜日期：${today}`);
  L.push("> 定位：本文件由脚本机械抽取生成，只保证「条目没漏」，不保证「句子能验收」。");
  L.push("> 下一步（必做）：智能体逐条润色——每条改写成「打开什么→点什么（一次一步）」＋「应看到什么（一眼能判断）」两列大白话，再按参考库 core/references/templates/uat-checklist.md 组装正式清单（落 idea2launch/7-quality/UAT清单.md）。本草稿禁直接交给用户、禁直接当正式清单（C1）。");
  L.push("");
  L.push("## 抽取概况（防漏对照）");
  L.push("");
  L.push("| 来源 | 抽到 | 对正式清单的要求 |");
  L.push("|---|---|---|");
  L.push(`| PRD §四 主流程 | ${prd.steps.length} 步 | 每步 ≥1 条清单条目${prd.steps.length === 0 ? "；**未抽到——PRD §四 格式可能被改过（须「1. 2. 3.」编号步），人工补条目**" : ""} |`);
  L.push(`| PRD §四 岔子场景 | ${prd.quirks.length} 条 | 至少 1 条进正式清单${prd.quirks.length === 0 ? "；**未抽到——人工补异常场景**" : ""} |`);
  L.push(`| PRD §三 P0 功能 | ${p0Features.length} 条${p0Features.length ? `（${p0Features.map((f) => f.id).join("、")}）` : ""} | 每条 P0 功能经 P0 故事覆盖到清单 |`);
  L.push(`| 用户故事 | P0 ×${p0Stories.length}，P1 ×${p1Stories.length} | 验收标准是「应看到什么」的事实依据；P0 全收，P1 按需 |`);
  L.push("");

  L.push("## 来源一：PRD §四 核心流程 → 条目骨架");
  L.push("");
  L.push(`### 主流程：${prd.flowName || "（未抽到流程名）"}`);
  L.push("");
  prd.steps.forEach((s, i) => L.push(`- [P-${i + 1}] 原文：${s}`));
  if (prd.steps.length === 0) L.push("-（未抽到主流程步骤——回查 PRD §四 是否按「1. 2. 3.」编号步书写）");
  L.push("");
  L.push("### 岔子场景");
  L.push("");
  prd.quirks.forEach((q, i) => L.push(`- [Q-${i + 1}] 原文：${q}`));
  if (prd.quirks.length === 0) L.push("-（未抽到岔子场景——回查 PRD §四「出了岔子怎么办」小节）");
  L.push("");

  L.push("## 来源二：用户故事验收标准 → 条目骨架");
  L.push("");
  for (const s of stories) {
    L.push(`### ${s.id}｜${s.name}（${s.prio || "优先级未标注"}）`);
    L.push("");
    s.accept.forEach((a, i) => L.push(`- [${s.id}-${String.fromCharCode(97 + i)}] 原文：${a}`));
    if (s.accept.length === 0) L.push("-（未抽到验收标准——回查该卡是否按「假如／当／那么」书写）");
    L.push("");
  }
  if (stories.length === 0) L.push("-（未抽到任何用户故事——回查 用户故事.md 是否按「### US-xxx｜名字」卡片书写）");

  L.push("## 润色提醒（给智能体，组装正式清单后删除本节）");
  L.push("");
  L.push("- 一步一行：原文一句话含多个动作的，拆成多条；每条一次一个动作链。");
  L.push("- 每条必须有可判断的「应看到什么」——禁「体验流畅」类没法核对的词（C1）。");
  L.push("- 异常场景至少 1 条进正式清单（上面的岔子全抽出来了，挑适用者）。");
  L.push("- 术语零残留（C2）：抽出来的原文带着「假如／当／那么」没关系，润色成「打开什么→点什么」。");
  L.push("- 对照「抽取概况」逐行核对覆盖面，再按 uat-checklist.md 模板组装。");
  L.push("");
  return L.join("\n");
}

// ---------- 入口 ----------

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === "-h" || args[0] === "--help") {
  console.log("用法：node gen-uat.mjs <用户项目根> [--out <输出文件>]");
  console.log("  例：node gen-uat.mjs . --out idea2launch/7-quality/UAT草稿.md");
  console.log("  不带 --out 时打到 stdout。脚本只做机械抽取，草稿须由智能体润色后才能用。");
  if (args.length === 0) process.exit(1);
  process.exit(0);
}

const rootArg = args[0];
let outFile = null;
const outIdx = args.indexOf("--out");
if (outIdx !== -1) {
  outFile = args[outIdx + 1];
  if (!outFile) die("--out 后面要跟一个输出文件路径，例：--out idea2launch/7-quality/UAT草稿.md");
}

const reqDir = join(rootArg, "idea2launch", "2-requirements");
const prd = parsePrd(readText(join(reqDir, "PRD.md"), "PRD.md（idea2launch/2-requirements/PRD.md）"));
const stories = parseStories(readText(join(reqDir, "用户故事.md"), "用户故事.md（idea2launch/2-requirements/用户故事.md）"));

const total = prd.steps.length + prd.quirks.length + stories.length;
if (total === 0) {
  die("两份文件里一条都没抽到——多半还没实例化（仍是模板占位符）或节标题/卡片格式被改过；先核对 idea2launch/2-requirements/ 的 PRD §四 与 用户故事卡格式。");
}

const draft = buildDraft(prd, stories, rootArg);
if (outFile) {
  try {
    writeFileSync(outFile, draft, "utf8");
  } catch {
    die(`草稿写不进去：${outFile} —— 检查目录是否存在、是否有写权限。`);
  }
  console.log(`${SELF}：草稿已写入 ${outFile}（条目骨架 ${total} 组——主流程 ${prd.steps.length} 步＋岔子 ${prd.quirks.length} 条＋故事 ${stories.length} 张）。草稿仅供润色，禁直接当正式清单。`);
} else {
  console.log(draft);
}
