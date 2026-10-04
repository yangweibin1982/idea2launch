#!/usr/bin/env node
/**
 * idea2launch · UAT 清单回填校验器（check-uat.mjs）
 *
 * 用途：实例化后的 UAT 清单（用户项目 idea2launch/7-quality/UAT清单.md）
 * 在呈现 G7 闸门前做机器校验——只管「回填完整性」，不管内容写得好不好。
 *
 * 校验语义（不锁列数、不锁列名，容忍模板升级加列）：
 *   R1 条目数 > 0——markdown 表格（表头＋分隔行之后的数据行）；
 *   R2 无占位符残留——任何单元格含 {{ 或 }} ＝模板没实例化；
 *   R3 回填类列空值＝0——表头含「结果／实测／回填」任一字样的列，每条数据行必须非空；
 *   R4 放行列——表头含「不符／备注／说明」字样的列允许留空（全部通过时本就无话可记）；
 *   R5 可跳过标注列——表头含「可跳过」字样的列（语义对齐 uat-checklist.md 模板）：
 *      正常条目一律写「—」（连字符 - 也认）；需额外设备/条件的条目以「可跳过」开头
 *      （如「可跳过，读一遍即可」）；空着或写成别的＝语义不明报错；
 *   R6 编号列（第一列）每条非空。
 *   列归类优先级：可跳过 > 回填类 > 放行列；没有回填类列的表格不当作验收表跳过。
 *
 * 用法：node check-uat.mjs <清单文件路径>
 * 依赖：仅 node 内置模块（node:fs），零第三方依赖。
 * 退出码：0＝全过；1＝有问题（逐条大白话列出）。
 */

import { readFileSync } from "node:fs";

const SELF = "check-uat.mjs";

function die(msg) {
  console.error(`${SELF}：${msg}`);
  process.exit(1);
}

function readText(path) {
  try {
    return readFileSync(path, "utf8").replace(/^\uFEFF/, "");
  } catch {
    die(`找不到清单文件：${path} —— 核对路径；正式清单通常在 idea2launch/7-quality/UAT清单.md。`);
    return ""; // 不可达
  }
}

/** 表格行拆单元格：`| a | b |` → ["a","b"]；空行返回 null */
function cellsOf(rowLine) {
  const t = rowLine.trim();
  if (!t.startsWith("|") || !t.endsWith("|")) return null;
  return t.slice(1, -1).split("|").map((c) => c.trim());
}

function isSeparator(cells) {
  return cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c));
}

/** 列归类（优先级：可跳过 > 回填类 > 放行列） */
function classifyColumn(header) {
  const h = header.trim();
  if (/可跳过/.test(h)) return "skippable";
  if (/结果|实测|回填/.test(h)) return "backfill";
  if (/不符|备注|说明/.test(h)) return "optional";
  return "plain";
}

// ---------- 入口 ----------

const path = process.argv[2];
if (!path || path === "-h" || path === "--help") {
  console.log("用法：node check-uat.mjs <清单文件路径>");
  console.log("  例：node check-uat.mjs idea2launch/7-quality/UAT清单.md");
  if (!path) process.exit(1);
  process.exit(0);
}

const lines = readText(path).split(/\r?\n/);
const problems = [];
const stats = { entries: 0, backfillEmpty: 0, skipMarked: 0, skipMust: 0 };
let uatTableCount = 0;

// 代码围栏里的表格不校验（``` 行切换状态）
let inFence = false;
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  if (/^\s*```/.test(line)) {
    inFence = !inFence;
    i++;
    continue;
  }
  if (inFence || !/^\s*\|/.test(line)) {
    i++;
    continue;
  }

  // 收一张连续表格
  const tableStart = i + 1; // 1 基行号
  const rows = [];
  while (i < lines.length && /^\s*\|/.test(lines[i])) {
    rows.push({ lineNo: i + 1, cells: cellsOf(lines[i]) });
    i++;
  }

  if (rows.length < 3 || !rows[1].cells || !isSeparator(rows[1].cells)) continue; // 表头+分隔+至少1条数据，缺任一不当作表格
  const header = rows[0].cells;
  const kinds = header.map(classifyColumn);
  if (!kinds.includes("backfill")) continue; // 没有回填类列＝不是验收表，跳过

  uatTableCount++;
  for (const row of rows.slice(2)) {
    const cells = row.cells || [];
    const no = String(cells[0] ?? "").trim() || "未编号";
    stats.entries++;

    if (cells.some((c) => c.includes("{{") || c.includes("}}"))) {
      // '{{占位符}}' 是模板族的占位符壳写法，此处为字面量展示非插值（semgrep correctness 规则按常量绕开）。
      const PLACEHOLDER_SHELL = "{{占位符}}";
      problems.push(`第 ${row.lineNo} 行（条目 ${no}）：还有 ${PLACEHOLDER_SHELL} 没替换——模板没实例化，占位符必须全部换成真内容。`);
    }
    if (!String(cells[0] ?? "").trim()) {
      problems.push(`第 ${row.lineNo} 行：编号列空着——每条验收步骤要有编号，方便用户对照着说「第几条不符」。`);
    }
    kinds.forEach((kind, col) => {
      const cell = String(cells[col] ?? "").trim();
      const colName = header[col] || `第 ${col + 1} 列`;
      if (kind === "backfill" && !cell) {
        stats.backfillEmpty++;
        problems.push(`第 ${row.lineNo} 行（条目 ${no}）：回填列「${colName}」空着——用户实测结果必须逐条回填，空着＝这条还没验。`);
      }
      if (kind === "skippable") {
        if (!cell) {
          problems.push(`第 ${row.lineNo} 行（条目 ${no}）：「${colName}」列空着——其余条目一律写「—」（需要额外设备/条件的条目才标「可跳过，读一遍即可」，见 uat-checklist.md 模板）。`);
        } else if (/^[-—]+$/.test(cell)) {
          stats.skipMust++;
        } else if (/^可跳过/.test(cell)) {
          stats.skipMarked++;
        } else {
          problems.push(`第 ${row.lineNo} 行（条目 ${no}）：「${colName}」列的值「${cell}」语义不明——只允许「—」（必做）或以「可跳过」开头（如「可跳过，读一遍即可」）。`);
        }
      }
    });
  }
}

if (uatTableCount === 0) {
  die("没找到可校验的验收表格——清单主体须是 markdown 表格（表头行下紧跟 |---| 分隔行），且表头有一列含「结果／实测／回填」字样（回填列）。");
}
if (stats.entries === 0) {
  problems.push("验收表格里一条条目都没有——清单必须有 ≥1 条验收步骤（覆盖面见 stage-7 第③步）。");
}

if (problems.length > 0) {
  console.error(`UAT 清单校验未通过，共 ${problems.length} 个问题：`);
  problems.forEach((p, idx) => console.error(`${idx + 1}. ${p}`));
  process.exit(1);
}

console.log(`UAT 清单校验通过：条目 ${stats.entries} 条；回填列空值 0；可跳过列：必做 ${stats.skipMust} 条、可跳过 ${stats.skipMarked} 条。`);
