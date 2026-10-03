#!/usr/bin/env node
'use strict';
/*
 * idea2launch ZCode 壳 · 钩子自测（票 T9，Node 内置能力，零第三方依赖）
 *
 * Run: node shells/zcode/test/test-hooks.mjs
 *
 * Covers:
 *   A. L3 intent hint hook (hooks/l3-intent-hint.js) — 11 cases fed via stdin:
 *      keyword hit with/without state.json, silent cases (no keyword,
 *      idea2launch whitelist), fail-silent cases (bad JSON, empty stdin,
 *      missing/non-string prompt), English keywords, stage-number surfacing.
 *   B. first-run-ask (hooks/first-run-ask.js) — 5 cases: fresh record,
 *      merge into existing state.json, idempotent re-run, non-interactive
 *      question-only, invalid answer value.
 *   C. Static zero-dependency check — both hook scripts may only require
 *      node builtins from a fixed allowlist.
 *
 * Exit 0 = all PASS; exit 1 = at least one FAIL. Per-case PASS/FAIL lines.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const L3 = path.join(ROOT, 'hooks', 'l3-intent-hint.js');
const ASK = path.join(ROOT, 'hooks', 'first-run-ask.js');

let passed = 0;
let failed = 0;

function check(name, cond, detail) {
  if (cond) {
    passed += 1;
    console.log('PASS  ' + name);
  } else {
    failed += 1;
    console.log('FAIL  ' + name + (detail ? '  -- ' + detail : ''));
  }
}

function feedL3(payload, opts) {
  const input = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return spawnSync(process.execPath, [L3], {
    input,
    encoding: 'utf8',
    cwd: (opts && opts.cwd) || ROOT,
  });
}

function hintLines(stdout) {
  return stdout.split('\n').filter((l) => l.trim().length > 0);
}

function stateFixture(stage, name) {
  return JSON.stringify({
    schema_version: 1,
    project: { name: name || '测试项目', created: '2026-10-04', tier: 'draft' },
    current_stage: stage,
    gates: [],
    l2_decisions: [],
    open_gaps: [],
    agent_mode: 'single',
    inject_global: 'ask',
  });
}

// ---- fixture dirs (os.tmpdir, cleaned in finally) ----
const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'idea2launch-t9-'));
const dirWithState = path.join(tmpBase, 'with-state');
const dirNoState = path.join(tmpBase, 'no-state');
fs.mkdirSync(path.join(dirWithState, 'idea2launch'), { recursive: true });
fs.mkdirSync(dirNoState, { recursive: true });
fs.writeFileSync(path.join(dirWithState, 'idea2launch', 'state.json'), stateFixture(5, '喂猫提醒'), 'utf8');
fs.writeFileSync(path.join(dirWithState, 'idea2launch', 'state-9.json'), stateFixture(9, '收尾项目'), 'utf8');

try {
  // ================= A. L3 intent hint =================
  // A1 命中关键词＋有 state.json：提示含项目名与阶段号，非阻断 exit 0，≤3 行
  let r = feedL3({ prompt: '继续', cwd: dirWithState });
  check('A1 hit-continue + state.json -> hint with stage', r.status === 0
    && r.stdout.includes('idea2launch') && r.stdout.includes('5') && r.stdout.includes('喂猫提醒'),
    'status=' + r.status + ' stdout=' + JSON.stringify(r.stdout.slice(0, 120)));
  check('A1b hint <= 3 lines', hintLines(r.stdout).length <= 3, 'lines=' + hintLines(r.stdout).length);

  // A2 命中开发意图＋无 state.json：提示可启动，不自动执行
  r = feedL3({ prompt: '帮我做一个记账的小应用', cwd: dirNoState });
  check('A2 dev-intent + no state -> suggest launch', r.status === 0
    && r.stdout.includes('启动 idea2launch'),
    'status=' + r.status + ' stdout=' + JSON.stringify(r.stdout.slice(0, 120)));
  check('A2b hint <= 3 lines', hintLines(r.stdout).length <= 3, 'lines=' + hintLines(r.stdout).length);

  // A3 不含关键词：静默 exit 0
  r = feedL3({ prompt: '今天天气怎么样？', cwd: dirNoState });
  check('A3 no keyword -> silent', r.status === 0 && r.stdout.trim() === '',
    'status=' + r.status + ' stdout=' + JSON.stringify(r.stdout.slice(0, 80)));

  // A4 含 idea2launch（白名单豁免）：静默
  r = feedL3({ prompt: '继续用 idea2launch 做我的项目', cwd: dirWithState });
  check('A4 whitelist idea2launch -> silent', r.status === 0 && r.stdout.trim() === '',
    'status=' + r.status + ' stdout=' + JSON.stringify(r.stdout.slice(0, 80)));

  // A5 坏 JSON：fail-silent exit 0
  r = feedL3('not-json{{{', { cwd: dirWithState });
  check('A5 bad JSON -> fail-silent exit 0', r.status === 0 && r.stdout.trim() === '',
    'status=' + r.status + ' stdout=' + JSON.stringify(r.stdout.slice(0, 80)));

  // A6 空输入：fail-silent exit 0
  r = feedL3('', { cwd: dirWithState });
  check('A6 empty stdin -> fail-silent exit 0', r.status === 0 && r.stdout.trim() === '',
    'status=' + r.status + ' stdout=' + JSON.stringify(r.stdout.slice(0, 80)));

  // A7 改需求类关键词命中：有项目则提示
  r = feedL3({ prompt: '改需求，把登录去掉', cwd: dirWithState });
  check('A7 change-requirement hit -> hint', r.status === 0
    && r.stdout.includes('idea2launch'),
    'status=' + r.status + ' stdout=' + JSON.stringify(r.stdout.slice(0, 120)));

  // A8 英文关键词命中
  r = feedL3({ prompt: 'please continue with the next step', cwd: dirNoState });
  check('A8 english keyword -> hint', r.status === 0
    && r.stdout.includes('idea2launch'),
    'status=' + r.status + ' stdout=' + JSON.stringify(r.stdout.slice(0, 120)));

  // A9 payload 无 prompt 字段：静默
  r = feedL3({ cwd: dirWithState });
  check('A9 missing prompt field -> silent', r.status === 0 && r.stdout.trim() === '',
    'status=' + r.status + ' stdout=' + JSON.stringify(r.stdout.slice(0, 80)));

  // A10 阶段号正确透出（阶段 9 轻运营）
  r = feedL3({ prompt: '接着做', cwd: dirWithState }, {});
  // 用辅助 state（current_stage=9）再喂一次：临时换 state 文件
  const mainState = path.join(dirWithState, 'idea2launch', 'state.json');
  const saved = fs.readFileSync(mainState, 'utf8');
  fs.writeFileSync(mainState, stateFixture(9, '收尾项目'), 'utf8');
  r = feedL3({ prompt: '接着做', cwd: dirWithState });
  check('A10 stage 9 surfaced', r.status === 0 && r.stdout.includes('9') && r.stdout.includes('轻运营'),
    'status=' + r.status + ' stdout=' + JSON.stringify(r.stdout.slice(0, 120)));
  fs.writeFileSync(mainState, saved, 'utf8'); // 还原

  // A11 prompt 非字符串：fail-silent
  r = feedL3({ prompt: 123, cwd: dirNoState });
  check('A11 non-string prompt -> silent', r.status === 0 && r.stdout.trim() === '',
    'status=' + r.status + ' stdout=' + JSON.stringify(r.stdout.slice(0, 80)));

  // ================= B. first-run-ask =================
  function runAsk(args, cwd) {
    return spawnSync(process.execPath, [ASK, ...args], {
      input: '',
      encoding: 'utf8',
      cwd,
    });
  }

  const freshRoot = path.join(tmpBase, 'fresh');
  fs.mkdirSync(freshRoot, { recursive: true });

  // B1 无标记＋--answer on：写标记；state.json 未建档则不建（防半截状态文件）
  r = runAsk(['--answer', 'on', freshRoot], tmpBase);
  const marker1 = fs.readFileSync(path.join(freshRoot, 'idea2launch', '.inject-global-answer'), 'utf8').trim();
  check('B1 fresh record on -> marker written', r.status === 0 && marker1 === 'on',
    'status=' + r.status + ' marker=' + JSON.stringify(marker1));
  check('B1b no partial state.json created', !fs.existsSync(path.join(freshRoot, 'idea2launch', 'state.json')), '');

  // B2 已有 state.json＋--answer off：合并 inject_global 字段且不破坏其他字段
  const mergeRoot = path.join(tmpBase, 'merge');
  fs.mkdirSync(path.join(mergeRoot, 'idea2launch'), { recursive: true });
  fs.writeFileSync(path.join(mergeRoot, 'idea2launch', 'state.json'), stateFixture(2, '合并项目'), 'utf8');
  r = runAsk(['--answer', 'off', mergeRoot], tmpBase);
  const merged = JSON.parse(fs.readFileSync(path.join(mergeRoot, 'idea2launch', 'state.json'), 'utf8'));
  const marker2 = fs.readFileSync(path.join(mergeRoot, 'idea2launch', '.inject-global-answer'), 'utf8').trim();
  check('B2 merge into existing state.json', r.status === 0
    && merged.inject_global === 'off' && merged.current_stage === 2
    && merged.project.name === '合并项目' && marker2 === 'off',
    'status=' + r.status + ' state=' + JSON.stringify(merged).slice(0, 120));

  // B3 已有标记：幂等——打印已有答案，不重写
  r = runAsk([mergeRoot], tmpBase);
  const markerAfter = fs.readFileSync(path.join(mergeRoot, 'idea2launch', '.inject-global-answer'), 'utf8').trim();
  check('B3 idempotent re-run -> prints existing, no rewrite', r.status === 0
    && r.stdout.includes('off') && markerAfter === 'off',
    'status=' + r.status + ' stdout=' + JSON.stringify(r.stdout.slice(0, 120)));

  // B4 无标记＋非交互＋无 --answer：只打印问题，不写任何文件
  const qRoot = path.join(tmpBase, 'question');
  fs.mkdirSync(qRoot, { recursive: true });
  r = runAsk([qRoot], tmpBase);
  check('B4 non-interactive -> question only, nothing written', r.status === 0
    && r.stdout.includes('on') && r.stdout.includes('off') && r.stdout.includes('ask')
    && !fs.existsSync(path.join(qRoot, 'idea2launch')),
    'status=' + r.status + ' stdout=' + JSON.stringify(r.stdout.slice(0, 120)));

  // B5 非法 --answer 值：报错退出非 0，不写文件
  const badRoot = path.join(tmpBase, 'bad');
  fs.mkdirSync(badRoot, { recursive: true });
  r = runAsk(['--answer', 'yes-please', badRoot], tmpBase);
  check('B5 invalid answer -> non-zero exit, nothing written', r.status !== 0
    && !fs.existsSync(path.join(badRoot, 'idea2launch')),
    'status=' + r.status);

  // ================= C. 零依赖静态检查 =================
  const ALLOW = new Set(['fs', 'path', 'readline', 'os', 'child_process', 'node:fs', 'node:path', 'node:readline', 'node:os', 'node:child_process']);
  for (const hookFile of [L3, ASK]) {
    const src = fs.readFileSync(hookFile, 'utf8');
    const requires = [...src.matchAll(/require\((['"])([^'"]+)\1\)/g)].map((m) => m[2]);
    const bad = requires.filter((spec) => !ALLOW.has(spec));
    check('C zero-dep ' + path.basename(hookFile) + ' (requires=' + JSON.stringify(requires) + ')',
      bad.length === 0, 'non-allowlist requires: ' + JSON.stringify(bad));
  }
} finally {
  fs.rmSync(tmpBase, { recursive: true, force: true });
}

console.log('\n==== T9 hook self-test: ' + passed + ' passed, ' + failed + ' failed ====');
process.exit(failed > 0 ? 1 : 0);
