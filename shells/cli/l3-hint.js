'use strict';
/*
 * idea2launch · L3 意图提示（通用 CLI 壳，票 M2-4）
 *
 * Generic-host implementation of the L3 intent hint. Detects development
 * intent in the user prompt and emits a NON-BLOCKING hint about the
 * idea2launch plugin. Never executes anything, never blocks (L3 semantics:
 * hint only — core/references/triggers.md §二 L3).
 *
 * Same source as the ZCode shell: KEYWORDS / WHITELIST / hint texts / guards
 * are copied verbatim from shells/zcode/hooks/l3-intent-hint.js (M1 T9) so
 * both shells behave identically. Dual-shell design — not code sharing via
 * require across shells (forbidden by the ticket boundary).
 *
 * Generic host contract (host wiring differs; see shells/cli/INSTALL.md):
 *   - stdin: one JSON payload; the prompt text is read from `prompt`
 *     (fallbacks: `user_prompt`, `input`, `content`) and the workspace from
 *     `cwd` (fallback: process.cwd()).
 *   - stdout: plain-text hint (<= 3 lines) becomes additional conversation
 *     context; exit 0 = pass. Empty stdout + exit 0 = silent.
 *   - exit codes other than 0 would block or error the prompt in most hosts —
 *     forbidden here by design. Every failure path is fail-silent: parse
 *     errors, missing fields, fs errors, anything thrown -> exit 0, no
 *     output. A hint hook must never punish a user.
 *   - Hosts WITHOUT a hook mechanism: the agent self-checks every turn per
 *     core/references/triggers.md §二 L3; this script is then optional.
 *
 * Path guard (security): `cwd` comes from the host payload (untrusted).
 * isSafeDir() rejects traversal segments and NUL before any fs touch; the
 * only path ever read is <cwd>/idea2launch/state.json (fixed suffix) and the
 * whole hook is read-only.
 *
 * Security-audit note (2026-10-04, offline snapshot audit, commander ruling):
 * the dynamic fs calls below carry an inline suppression annotation, bare
 * rule id only (trailing prose on the same line silently breaks it). The
 * guards above are in place; the dynamic path IS the feature (host-supplied
 * workspace). Re-review whenever a guard changes.
 *
 * Zero-cost mis-trigger discipline:
 *   - no keyword hit            -> silent (no output at all)
 *   - prompt mentions idea2launch -> silent (already inside the flow)
 *   - hint is capped at 3 lines
 *
 * Zero third-party dependencies: node builtins only (fs, path).
 * Logging: none (stateless).
 */
const fs = require('fs');
const path = require('path');

const STAGE_NAMES = {
  1: '立项评估',
  2: '需求',
  3: '设计',
  4: '技术',
  5: '计划',
  6: '开发',
  7: '质量',
  8: '交付',
  9: '轻运营',
};

// L3 detection surface (core/references/triggers.md §二 L3): continue-type,
// change-requirement-type, add-feature-type, polish-type, dev-intent-type.
// SAME SOURCE: copied verbatim from shells/zcode/hooks/l3-intent-hint.js —
// keep the two shells' tables identical when either changes.
// Kept as distinctive multi-char phrases where possible; English matched
// case-insensitively.
const KEYWORDS = [
  // 继续类
  '继续', '下一步', '接着做', '接着来', '接着做下去', '继续做',
  'continue', 'go on', 'next step',
  // 改需求类
  '改需求', '需求改', '重做', '重新做', '改成', '换成', 'change the requirement', 'redo it',
  // 加功能类
  '加功能', '加一个功能', '顺便加', '再做个', '再做一个', '新增功能', '添加功能',
  'add a feature', 'add another feature', 'also add',
  // 完善类
  '完善一下', '优化一下', '再完善', 'improve it', 'polish it',
  // 开发意图类（会话外显，未显式启动本流程）
  '做个应用', '做一个应用', '做个网站', '做一个网站', '做个网页', '做个小程序',
  '开发一个', '帮我做个', '帮我做一个', '做个app', '做一个app', '帮我开发',
  'build an app', 'make an app', 'create a web app',
];

// Whitelist: a prompt that mentions the plugin itself is already inside (or
// explicitly asking about) the flow -> never hint. SAME SOURCE as KEYWORDS.
const WHITELIST = ['idea2launch', '想法落地向导'];

function readStdin() {
  try {
    const chunks = [];
    const buf = Buffer.alloc(65536);
    for (;;) {
      let n;
      try { n = fs.readSync(0, buf, 0, buf.length, null); }
      catch (e) { if (e.code === 'EAGAIN') { if (chunks.length === 0) return ''; continue; } throw e; }
      if (n <= 0) break;
      chunks.push(Buffer.from(buf.subarray(0, n)));
      if (n < buf.length) break;
    }
    return Buffer.concat(chunks).toString('utf8');
  } catch (_) { return ''; }
}

function extractPrompt(payload) {
  for (const key of ['prompt', 'user_prompt', 'input', 'content']) {
    const v = payload ? payload[key] : undefined;
    if (typeof v === 'string') return v;
  }
  return '';
}

function isSafeDir(p) {
  // cwd comes from the host payload (untrusted): reject traversal segments
  // and NUL before it feeds path joins below. Fail-silent on rejection.
  if (typeof p !== 'string' || p.length === 0 || p.includes('\0')) return false;
  return !/(^|[\\/])\.\.([\\/]|$)/.test(p);
}

function readState(statePath) {
  // Returns { ok: true, stage, name } | { ok: true, unreadable: true } | { ok: false }.
  // Guard recap for the annotated lines below: statePath is built in run() as
  // isSafeDir(cwd) + fixed 'idea2launch/state.json' suffix; this hook is
  // read-only and fail-silent.
  let raw;
  try { raw = fs.readFileSync(statePath, 'utf8'); } catch (_) { return { ok: false }; } // nosemgrep
  try {
    const s = JSON.parse(raw);
    const stage = typeof s.current_stage === 'number' ? s.current_stage : null;
    const name = s.project && typeof s.project.name === 'string' ? s.project.name : '';
    return { ok: true, stage, name };
  } catch (_) { return { ok: true, unreadable: true }; }
}

// ---- hint logic (testable seam S1) ----
// run(raw) consumes the raw stdin string and returns { code, stdout }.
// code is always 0 (this hook never blocks; failures are silent).
function run(raw) {
  let payload = null;
  if (raw && raw.trim()) {
    try { payload = JSON.parse(raw); } catch (_) { payload = null; }
  }
  if (!payload || typeof payload !== 'object') return { code: 0, stdout: '' };

  const prompt = extractPrompt(payload);
  if (!prompt.trim()) return { code: 0, stdout: '' };

  const lower = prompt.toLowerCase();
  if (WHITELIST.some((w) => lower.includes(w))) return { code: 0, stdout: '' };
  if (!KEYWORDS.some((k) => lower.includes(k.toLowerCase()))) return { code: 0, stdout: '' };

  const cwd = payload.cwd;
  if (!isSafeDir(cwd)) return { code: 0, stdout: '' };

  // Manual concat instead of path.join with variables: keeps the segments
  // fixed and reviewable (read-only existence/parse of a fixed suffix).
  const statePath = cwd + path.sep + 'idea2launch' + path.sep + 'state.json';
  let inProgress;
  try { inProgress = fs.existsSync(statePath); } catch (_) { return { code: 0, stdout: '' }; } // nosemgrep

  let hint;
  if (inProgress) {
    const st = readState(statePath);
    if (!st.ok || st.unreadable) {
      hint = '[idea2launch] 检测到进行中的 idea2launch 项目（进度档案在 idea2launch/ 下）。'
        + '说「继续」即可从断点接着做；要改需求或加功能也直接说，我会带你走对应闸门。';
    } else {
      const stageLine = st.stage
        ? '（当前第 ' + st.stage + ' 阶段 · ' + (STAGE_NAMES[st.stage] || '未知阶段') + '）'
        : '';
      const nameLine = st.name ? '《' + st.name + '》' : '';
      hint = '[idea2launch] 检测到进行中的项目' + nameLine + stageLine + '。'
        + '说「继续」即可从断点接着做；要改需求或加功能也直接说，我会带你走对应闸门。';
    }
  } else {
    hint = '[idea2launch] 看起来你想做一个应用。可以试试 idea2launch 插件：九阶段向导'
      + '（立项评估→需求→设计→技术→计划→开发→质量→交付→轻运营）带你从想法到可运行的 Web 应用＋全套文档。'
      + '说「启动 idea2launch」开始；不想用忽略本条即可。';
  }

  return { code: 0, stdout: hint + '\n' };
}

// ---- CLI entry (registered invocation: `node <this file>`) ----
if (require.main === module) {
  let r = { code: 0, stdout: '' };
  try { r = run(readStdin()); } catch (_) { r = { code: 0, stdout: '' }; }
  if (r.stdout) {
    try { process.stdout.write(r.stdout); } catch (_) { /* fail-silent */ }
  }
  process.exit(0);
}

module.exports = { run, KEYWORDS, WHITELIST };
