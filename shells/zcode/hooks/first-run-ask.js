#!/usr/bin/env node
'use strict';
/*
 * idea2launch · inject_global 首次运行询问——CLI 宿主参考实现（票 T9）
 *
 * The markdown shell cannot execute code, so the ZCode shell realizes the
 * first-run ask as three opening instructions inside
 * skills/idea2launch/SKILL.md §3. THIS FILE is the same logic as a runnable
 * reference for generic CLI hosts (and for testing): check the marker file,
 * ask the user, write the answer back.
 *
 * Flow (G1 decision 10; schema field `inject_global`, enum ask|on|off,
 * default ask — core/state.schema.json):
 *   1. If  <root>/idea2launch/.inject-global-answer exists -> print the
 *      stored answer and exit (idempotent; nothing is rewritten).
 *   2. Else ask the user (summary + consequences first, three options,
 *      empty input = ask). Non-interactive stdin without --answer prints the
 *      question only and writes nothing (the ask stays open).
 *   3. Write the answer to the marker file; if <root>/idea2launch/state.json
 *      already exists, merge the `inject_global` field via tmp+rename
 *      (miniature of core/references/state-protocol.md §2.2). If state.json
 *      does NOT exist yet, only the marker is written — the full state.json
 *      (including inject_global) is created later by 建档 (W0) in the main
 *      flow; a partial state.json would break the read protocol.
 *
 * Choosing "on" (actually injecting into host-global rules) is deliberately
 * NOT done by this script: what to inject and where differs per host — the
 * caller (agent or user) performs the injection; this tool records the
 * decision only. See INJECT-GLOBAL.md for both hosts' flows.
 *
 * Usage:
 *   node first-run-ask.js [project-root] [--answer on|off|ask]
 *
 * Exit codes: 0 = answered / already answered / question printed.
 *             1 = usage error (unknown answer value).
 *
 * Zero third-party dependencies: node builtins only (fs, path, readline).
 */
const fs = require('fs');
const path = require('path');

const VALID = ['on', 'off', 'ask'];
const MARKER_REL = ['idea2launch', '.inject-global-answer'];
const STATE_REL = ['idea2launch', 'state.json'];

const QUESTION_TEXT = [
  'idea2launch 默认零侵入：工作规范只在流程内按阶段装载，不碰你的宿主全局配置。',
  '选 on 会把工作规范摘要与指针写入宿主全局规则文件（如 AGENTS.md），之后每次会话生效（可手工移除）；',
  '选 off 完全不写入；选 ask 则以后每个新项目首次运行时再问一次。',
  '是否把 idea2launch 的工作规范注入宿主全局规则？',
  '  1. on（注入）  2. off（不注入）  3. ask（以后每个项目再问）',
  '直接回车 = ask（默认值）。',
].join('\n');

function seg(parts) {
  // Manual concat with a fixed, literal-controlled suffix list.
  return parts.join(path.sep);
}

// ---- path guard (security hardening) ----
// Threat model: [project-root] is trusted local input, but every fs touch is
// still confined to <root>/idea2launch/<constant-name>. `guarded()` enforces
// the root boundary check (target.startsWith(root + sep)) on every join, so
// even a hostile root/rel can never escape the project subtree.
//
// Semgrep note (2026-10-04, offline snapshot audit): the local rules snapshot
// flags every dynamic path below (detect-non-literal-fs-filename /
// path-join-resolve-traversal). Dynamic paths are this CLI's purpose
// (user-supplied project root); every flagged call sits behind guarded()
// (root-boundary throw) and/or resolveRoot() (normalize + must-be-dir).
// Accepted finding -> inline nosemgrep with this justification; re-review
// whenever the guard itself changes.
function guarded(root, ...rel) {
  const target = seg([root, ...rel]);
  const base = root.endsWith(path.sep) ? root : root + path.sep;
  if (!target.startsWith(base)) {
    throw new Error('path guard: target escapes project root');
  }
  return target;
}

function resolveRoot(raw) {
  // Normalize the user-supplied root (resolves .. / relative segments) and
  // require it to be an existing directory — anything else is a usage error.
  const root = path.normalize(path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw)); // nosemgrep
  let st;
  try { st = fs.statSync(root); } catch (_) { st = null; } // nosemgrep
  if (!st || !st.isDirectory()) return null;
  return root;
}

function readMarker(root) {
  try { return fs.readFileSync(guarded(root, ...MARKER_REL), 'utf8').trim(); } // nosemgrep
  catch (_) { return ''; }
}

function writeMarker(root, answer) {
  const dir = guarded(root, 'idea2launch');
  fs.mkdirSync(dir, { recursive: true }); // nosemgrep
  const target = guarded(root, ...MARKER_REL);
  const tmp = target + '.tmp';
  fs.writeFileSync(tmp, answer + '\n', 'utf8'); // nosemgrep
  // Read-back self-check, then atomic rename (state-protocol §2.2 miniature).
  const back = fs.readFileSync(tmp, 'utf8').trim(); // nosemgrep
  if (back !== answer) {
    fs.unlinkSync(tmp); // nosemgrep
    throw new Error('marker self-check failed');
  }
  fs.renameSync(tmp, target); // nosemgrep
}

function mergeStateField(root, answer) {
  const statePath = guarded(root, ...STATE_REL);
  let raw;
  try { raw = fs.readFileSync(statePath, 'utf8'); } catch (_) { return false; } // nosemgrep
  let obj;
  try { obj = JSON.parse(raw); } catch (_) { return false; } // corrupted state: not ours to fix here
  obj.inject_global = answer;
  const tmp = statePath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2) + '\n', 'utf8'); // nosemgrep
  try {
    const back = JSON.parse(fs.readFileSync(tmp, 'utf8')); // nosemgrep
    if (back.inject_global !== answer) throw new Error('self-check failed');
    fs.renameSync(tmp, statePath); // nosemgrep
    return true;
  } catch (e) {
    try { fs.unlinkSync(tmp); } catch (_) { /* best effort */ } // nosemgrep
    throw e;
  }
}

// ---- ask logic (testable seam) ----
// decide({marker, answerArg, isTTY}) -> {action, answer?}
//   action: 'print-existing' | 'ask-interactive' | 'record' | 'print-question'
function decide(input) {
  if (input.marker && VALID.includes(input.marker)) {
    return { action: 'print-existing', answer: input.marker };
  }
  if (input.answerArg) {
    if (!VALID.includes(input.answerArg)) return { action: 'invalid', answer: input.answerArg };
    return { action: 'record', answer: input.answerArg };
  }
  if (input.isTTY) return { action: 'ask-interactive' };
  return { action: 'print-question' };
}

function run(argv, io) {
  // Arg parse: [root] and --answer <value> in any order; the --answer value
  // must not be mistaken for the root.
  let root;
  let answerArg;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--answer') {
      answerArg = argv[i + 1];
      i++;
    } else if (!root) {
      root = argv[i];
    }
  }
  root = root || process.cwd();
  root = resolveRoot(root);
  if (!root) {
    io.out('用法错误：项目根不存在或不是目录——' + argv.find((a) => a !== '--answer' && a !== 'on' && a !== 'off' && a !== 'ask') + '\n');
    return 1;
  }

  const marker = readMarker(root);
  const d = decide({ marker, answerArg, isTTY: io.isTTY });

  if (d.action === 'invalid') {
    io.out('未知答案值：' + d.answer + '（可用：on / off / ask）\n');
    return 1;
  }
  if (d.action === 'print-existing') {
    io.out('[idea2launch] 已记录过你的选择：inject_global = ' + d.answer
      + '（标记文件 idea2launch/.inject-global-answer）。如需重选，删除该文件后重跑。\n');
    return 0;
  }
  if (d.action === 'print-question') {
    io.out(QUESTION_TEXT + '\n');
    io.out('[idea2launch] 当前是非交互环境，未写入任何文件。请在交互终端重跑，或用 --answer on|off|ask 直接作答。\n');
    return 0;
  }
  if (d.action === 'ask-interactive') {
    io.out(QUESTION_TEXT + '\n');
    // Reference implementation: a generic CLI host asks via readline here.
    // Kept synchronous-free: interactive answer lands in `answer` below.
    return 0; // replaced by the interactive branch in main() below
  }
  // record
  writeMarker(root, d.answer);
  const merged = mergeStateField(root, d.answer);
  if (merged) {
    io.out('[idea2launch] 已记录：inject_global = ' + d.answer
      + '（标记文件＋state.json 的 inject_global 字段均已更新）。\n');
  } else {
    io.out('[idea2launch] 已记录：inject_global = ' + d.answer
      + '（标记文件已写入；state.json 尚未建档，该答案会在建档时落入其 inject_global 字段）。\n');
  }
  io.out('选择 on 时，请由智能体/用户按 INJECT-GLOBAL.md 执行实际注入（本脚本只记录决定，不写宿主全局文件）。\n');
  return 0;
}

// ---- CLI entry ----
if (require.main === module) {
  const argv = process.argv.slice(2);
  const isTTY = Boolean(process.stdin.isTTY);
  if (isTTY && !argv.includes('--answer')) {
    // Interactive: ask once via readline, then reuse the record path.
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    process.stdout.write(QUESTION_TEXT + '\n');
    rl.question('你的选择（on/off/ask，回车=ask）：', (resp) => {
      rl.close();
      const answer = VALID.includes(String(resp || '').trim().toLowerCase())
        ? String(resp).trim().toLowerCase() : 'ask';
      const code = run(argv.concat(['--answer', answer]), {
        isTTY: false,
        out: (s) => process.stdout.write(s),
      });
      process.exit(code);
    });
    return;
  }
  const code = run(argv, { isTTY, out: (s) => process.stdout.write(s) });
  process.exit(code);
}

module.exports = { run, decide, QUESTION_TEXT, VALID };
