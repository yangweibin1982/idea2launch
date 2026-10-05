#!/usr/bin/env node
// 校验 core/references/examples/state-example.json 是否符合
// core/state.schema.json（结构层）与 core/references/state-protocol.md（协议层 v1 约定）。
// 仅用 Node 内置模块，零第三方依赖。用法：node test/validate-example.mjs → 输出 PASS/FAIL。

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const examplePath = join(root, "core", "references", "examples", "state-example.json");
const schemaPath = join(root, "core", "state.schema.json");

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
  return ok;
}

function finish() {
  const failed = results.filter((r) => !r.ok);
  for (const r of results) {
    const mark = r.ok ? "PASS" : "FAIL";
    const tail = r.ok || !r.detail ? "" : ` — ${r.detail}`;
    console.log(`[${mark}] ${r.name}${tail}`);
  }
  const verdict = failed.length === 0 ? "PASS" : "FAIL";
  console.log(`\n${verdict} (${results.length - failed.length}/${results.length} checks)`);
  process.exit(failed.length === 0 ? 0 : 1);
}

// ---------- 文件读取与解析 ----------
let example, schema;
try {
  example = JSON.parse(readFileSync(examplePath, "utf8"));
  check("示例文件可解析为 JSON", true);
} catch (e) {
  check("示例文件可解析为 JSON", false, e.message);
  finish();
}
try {
  schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  check("schema 文件可解析为 JSON", true);
} catch (e) {
  check("schema 文件可解析为 JSON", false, e.message);
  finish();
}

const isInt = (v) => Number.isInteger(v);
const isStr = (v) => typeof v === "string";
const isNonEmptyStr = (v) => isStr(v) && v.length > 0;

// ---------- 一、顶层 8 字段（对照 schema.required 手写断言） ----------
const EXPECTED_TOP = [
  "schema_version",
  "project",
  "current_stage",
  "gates",
  "l2_decisions",
  "open_gaps",
  "agent_mode",
  "inject_global",
];
check(
  "schema.required 恰为协议 8 顶层字段",
  Array.isArray(schema.required) &&
    JSON.stringify([...schema.required].sort()) === JSON.stringify([...EXPECTED_TOP].sort()),
);
for (const f of EXPECTED_TOP) {
  check(`顶层必填字段存在：${f}`, Object.prototype.hasOwnProperty.call(example, f));
}

// ---------- 二、逐字段结构校验（枚举值从 schema 读取，防两处漂移） ----------
check(
  "schema_version === 1（且等于 schema const）",
  example.schema_version === 1 && schema.properties.schema_version.const === 1,
);

const proj = example.project ?? {};
check("project 是对象", typeof proj === "object" && proj !== null && !Array.isArray(proj));
check("project.name 非空字符串", isNonEmptyStr(proj.name));
check("project.created 非空字符串（ISO 8601）", isNonEmptyStr(proj.created));
check(
  "project.tier ∈ schema 枚举(draft|production)",
  schema.properties.project.properties.tier.enum.includes(proj.tier),
);

check(
  "current_stage 为 1-9 整数（schema min/max）",
  isInt(example.current_stage) &&
    example.current_stage >= schema.properties.current_stage.minimum &&
    example.current_stage <= schema.properties.current_stage.maximum,
);

const KNOWN_GATES = [
  "G1-charter",
  "G2-requirements",
  "G3-design",
  "G4-tech",
  "G5-plan",
  "G6-build",
  "G7-quality",
  "G8-delivery",
  "G9-operate",
];
const GATE_STATUSES = schema.properties.gates.items.properties.status.enum; // signed|returned|skipped
check("schema gates.status 枚举为 signed/returned/skipped", JSON.stringify(GATE_STATUSES) === JSON.stringify(["signed", "returned", "skipped"]));
check("gates 是数组", Array.isArray(example.gates));
for (const [i, g] of (example.gates ?? []).entries()) {
  check(`gates[${i}].gate ∈ 九闸门命名表`, KNOWN_GATES.includes(g.gate), String(g.gate));
  check(`gates[${i}].status ∈ 枚举`, GATE_STATUSES.includes(g.status), String(g.status));
  if (g.at !== undefined) check(`gates[${i}].at 为非空字符串`, isNonEmptyStr(g.at));
  if (g.note !== undefined) check(`gates[${i}].note 为字符串`, isStr(g.note));
}

const L2_IDS = ["ui-direction", "tech-stack", "tickets-approval"]; // 协议 v1 固定三决策点
check("l2_decisions 是数组", Array.isArray(example.l2_decisions));
for (const [i, d] of (example.l2_decisions ?? []).entries()) {
  check(`l2_decisions[${i}].id ∈ 固定三决策点`, L2_IDS.includes(d.id), String(d.id));
  check(`l2_decisions[${i}].chosen 非空字符串`, isNonEmptyStr(d.chosen));
  if (d.auto !== undefined) check(`l2_decisions[${i}].auto 为布尔`, typeof d.auto === "boolean");
  if (d.at !== undefined) check(`l2_decisions[${i}].at 为非空字符串`, isNonEmptyStr(d.at));
  if (d.auto === true) {
    check(`l2_decisions[${i}] auto=true 必附 rationale（协议 §2.4）`, isNonEmptyStr(d.rationale));
  }
}

check("open_gaps 是数组", Array.isArray(example.open_gaps));
for (const [i, gap] of (example.open_gaps ?? []).entries()) {
  check(`open_gaps[${i}].id 形如 gap-三位序号`, isStr(gap.id) && /^gap-\d{3}$/.test(gap.id), String(gap.id));
  check(`open_gaps[${i}].desc 非空字符串`, isNonEmptyStr(gap.desc));
  check(`open_gaps[${i}].stage 为 1-9 整数`, isInt(gap.stage) && gap.stage >= 1 && gap.stage <= 9);
  check(`open_gaps[${i}].at 非空字符串`, isNonEmptyStr(gap.at));
  check(`open_gaps[${i}].status ∈ open|closed`, ["open", "closed"].includes(gap.status));
  if (gap.status === "closed") {
    check(`open_gaps[${i}] closed 必附 note（协议 §5）`, isNonEmptyStr(gap.note));
  }
}

check(
  "agent_mode ∈ schema 枚举(single|multi)",
  schema.properties.agent_mode.enum.includes(example.agent_mode),
);
check(
  "inject_global ∈ schema 枚举(ask|on|off)",
  schema.properties.inject_global.enum.includes(example.inject_global),
);

// ---------- 三、协议一致性：阶段推进须有闸门 signed 依据（协议 §2.3） ----------
const latestStatus = {};
for (const g of example.gates ?? []) latestStatus[g.gate] = g.status; // 追加序，后者覆盖
const STAGE_GATE = Object.fromEntries(KNOWN_GATES.slice(0, 8).map((name, idx) => [idx + 1, name]));
for (let s = 1; s < example.current_stage && s <= 8; s++) {
  const gate = STAGE_GATE[s];
  check(
    `阶段推进一致性：${gate} 最新状态为 signed（current_stage=${example.current_stage}）`,
    latestStatus[gate] === "signed",
    `实际=${latestStatus[gate] ?? "无记录"}`,
  );
}

// ---------- 四、票面场景设定（示例须 depict：2 signed＋1 returned＋1 auto＋1 open gap） ----------
const signedCount = (example.gates ?? []).filter((g) => g.status === "signed").length;
const returnedCount = (example.gates ?? []).filter((g) => g.status === "returned").length;
const autoCount = (example.l2_decisions ?? []).filter((d) => d.auto === true).length;
const openGapCount = (example.open_gaps ?? []).filter((x) => x.status === "open").length;
check("场景：gates 恰 2 条 signed", signedCount === 2, `实际=${signedCount}`);
check("场景：gates 恰 1 条 returned", returnedCount === 1, `实际=${returnedCount}`);
check("场景：l2_decisions 恰 1 条 auto=true", autoCount === 1, `实际=${autoCount}`);
check("场景：open_gaps 恰 1 条 open", openGapCount === 1, `实际=${openGapCount}`);

// ---------- 五、双写内容对账（协议 §4.3，F-13 修订：时间戳一致＋内容逐字核对，漂移以 log 为准） ----------
let logLines = [];
try {
  const logPath = join(root, "core", "references", "examples", "decisions-example.jsonl");
  logLines = readFileSync(logPath, "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l));
  check(
    "双写：decisions-example.log 逐行可解析且七字段齐全（§4.1）",
    logLines.every((row) =>
      ["ts", "id", "question", "chosen", "alternatives", "auto", "rationale"].every((f) => f in row) &&
      isStr(row.ts) && isStr(row.id) && isStr(row.chosen) &&
      Array.isArray(row.alternatives) && typeof row.auto === "boolean" && isStr(row.rationale),
    ),
  );
} catch (e) {
  check("双写：decisions-example.log 逐行可解析且七字段齐全（§4.1）", false, e.message);
}
const latestLog = {};
for (const row of logLines) if (L2_IDS.includes(row.id)) latestLog[row.id] = row; // 追加序，后者覆盖
const latestL2 = {};
for (const d of example.l2_decisions ?? []) latestL2[d.id] = d;
for (const id of L2_IDS) {
  if (latestL2[id] === undefined) continue; // 场景未涉该决策点
  const row = latestLog[id];
  if (!check(`双写覆盖：${id} 在 log 有对应行`, row !== undefined)) continue;
  check(`双写时间戳一致：${id} log.ts === state.at`, row.ts === latestL2[id].at, `log=${row.ts} state=${latestL2[id].at}`);
  check(`双写内容逐字：${id}.chosen 一致`, row.chosen === latestL2[id].chosen, `"${row.chosen}" vs "${latestL2[id].chosen}"`);
  check(`双写内容逐字：${id}.rationale 一致`, (row.rationale || "") === (latestL2[id].rationale || ""), `"${row.rationale || ""}" vs "${latestL2[id].rationale || ""}"`);
}

finish();
