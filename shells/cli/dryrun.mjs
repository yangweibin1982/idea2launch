#!/usr/bin/env node
'use strict';
/*
 * idea2launch 通用 CLI 壳 · 自检脚本（票 M2-4，Node 内置能力，零第三方依赖）
 *
 * Run: node shells/cli/dryrun.mjs   (any cwd; Git Bash / PowerShell / cmd)
 *
 * Sections:
 *   A. 薄入口 core 探测链逐级验证（F-10 教训：每级真实/模拟目录树实测，禁纸面推演）
 *      A1 真实仓库树：`<skill>/../../../../core/SKILL.md` 命中且指纹通过
 *      A2 方式②复制补全布局：`<skill>/core/SKILL.md` 命中（含脚本同目录件）
 *      A3 其他深度布局：逐级上探（≤6 级）命中
 *      A4 反例：无指纹的同名 core 被跳过（探测链返回未命中 → 文档化兜底＝问用户）
 *   B. l3-hint.js 13 断言 / 10 类样例：关键词命中（中/英/改需求）、白名单豁免、
 *      坏 JSON、空输入、穿越 cwd、缺 prompt 字段、非字符串 prompt、≤3 行
 *   C. inject-global.js 9 断言 / 6 场景：fresh 直答、state 合并、幂等、
 *      非交互只印问题、非法 answer、--answer ask
 *   D. 静态检查：三脚本零依赖白名单、无跨壳 require、nosemgrep 注记裸 id、
 *      无凭据字面量/本机绝对路径、INSTALL.md 引用路径全在盘、core 指纹在位
 *
 * Exit 0 = all PASS; exit 1 = at least one FAIL. Per-case PASS/FAIL lines.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));          // <repo>/shells/cli
const ROOT = path.resolve(HERE, '..', '..');                        // <repo>
const L3 = path.join(HERE, 'l3-hint.js');
const ASK = path.join(HERE, 'inject-global.js');
const SKILL = path.join(HERE, 'skills', 'idea2launch', 'SKILL.md');
const INSTALL = path.join(HERE, 'INSTALL.md');
const REAL_CORE = path.join(ROOT, 'core', 'SKILL.md');
const FINGERPRINT = 'name: idea2launch';

let passed = 0;
let failed = 0;

function check(name, cond, detail) {
  if (cond) {
    passed += 1;
    console.log('PASS  ' + name + (detail ? '  -- ' + detail : ''));
  } else {
    failed += 1;
    console.log('FAIL  ' + name + (detail ? '  -- ' + detail : ''));
  }
}

// ---- A. detection chain (independent mirror of SKILL.md §1 protocol) ----
// Order: (1) <skillDir>/core/SKILL.md, (2) <skillDir>/../../../../core/SKILL.md,
// (3) walk up from skillDir's parent, <= 6 levels; every hit must pass the
// fingerprint check (content contains 'name: idea2launch') or it is skipped.
// Returns { file, level } | null.
function detectCore(skillDir) {
  const cands = [
    { level: 'L0-own-dir', file: path.join(skillDir, 'core', 'SKILL.md') },
    { level: 'L4-repo-layout', file: path.join(skillDir, '..', '..', '..', '..', 'core', 'SKILL.md') },
  ];
  let cur = skillDir;
  for (let i = 1; i <= 6; i++) {
    cur = path.dirname(cur);
    cands.push({ level: 'walkup-' + i, file: path.join(cur, 'core', 'SKILL.md') });
  }
  for (const c of cands) {
    let content;
    try { content = fs.readFileSync(c.file, 'utf8'); } catch (_) { continue; }
    if (content.includes(FINGERPRINT)) return c;
  }
  return null;
}

// ---- B. l3-hint feeder ----
function feedL3(payload) {
  const input = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return spawnSync(process.execPath, [L3], { input, encoding: 'utf8', cwd: ROOT });
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

function runAsk(args, cwd) {
  return spawnSync(process.execPath, [ASK, ...args], { input: '', encoding: 'utf8', cwd });
}

// ---- D helpers ----
function requireSpecs(src) {
  return [...src.matchAll(/require\((['"])([^'"]+)\1\)/g)].map((m) => m[2]);
}
function importSpecs(src) {
  return [...src.matchAll(/import\s+[^'"]*from\s+(['"])([^'"]+)\1/g)].map((m) => m[2]);
}

// ================= run =================
const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'idea2launch-m24-'));
try {
  // ---------- A. detection chain ----------
  const realSkillDir = path.join(HERE, 'skills', 'idea2launch');
  const a1 = detectCore(realSkillDir);
  check('A1 real repo tree: repo-layout candidate hits real core',
    a1 !== null && a1.level === 'L4-repo-layout'
      && path.resolve(a1.file) === path.resolve(REAL_CORE)
      && fs.existsSync(REAL_CORE),
    a1 ? 'level=' + a1.level + ' resolved=' + a1.file : 'no hit');

  // A2 method-② copy-completion layout (temp tree, full self-contained set)
  const plugDir = path.join(tmpBase, 'plug', 'skills', 'idea2launch');
  fs.mkdirSync(path.join(plugDir, 'core'), { recursive: true });
  fs.writeFileSync(path.join(plugDir, 'core', 'SKILL.md'), fs.readFileSync(REAL_CORE, 'utf8'), 'utf8');
  fs.writeFileSync(path.join(plugDir, 'l3-hint.js'), fs.readFileSync(L3, 'utf8'), 'utf8');
  fs.writeFileSync(path.join(plugDir, 'inject-global.js'), fs.readFileSync(ASK, 'utf8'), 'utf8');
  const a2 = detectCore(plugDir);
  check('A2 copy-completion layout: own-dir candidate hits copied core',
    a2 !== null && a2.level === 'L0-own-dir',
    a2 ? 'level=' + a2.level : 'no hit');
  check('A2b copy-completion layout: scripts sit next to SKILL.md (thin entry §2 candidate 1)',
    fs.existsSync(path.join(plugDir, 'l3-hint.js')) && fs.existsSync(path.join(plugDir, 'inject-global.js')),
    '');

  // A3 host copied the skill deeper inside a repo-like pack -> walk-up hit
  const deepSkill = path.join(tmpBase, 'host', 'pack', 'skills', 'idea2launch');
  fs.mkdirSync(deepSkill, { recursive: true });
  fs.mkdirSync(path.join(tmpBase, 'host', 'pack', 'core'), { recursive: true });
  fs.writeFileSync(path.join(tmpBase, 'host', 'pack', 'core', 'SKILL.md'), fs.readFileSync(REAL_CORE, 'utf8'), 'utf8');
  const a3 = detectCore(deepSkill);
  check('A3 other-depth layout: walk-up candidate hits pack core',
    a3 !== null && a3.level.startsWith('walkup-'),
    a3 ? 'level=' + a3.level + ' resolved=' + a3.file : 'no hit');

  // A4 negative: same-named core WITHOUT fingerprint is skipped -> fallback (ask user)
  const badSkill = path.join(tmpBase, 'elsewhere', 'skills', 'idea2launch');
  fs.mkdirSync(badSkill, { recursive: true });
  fs.mkdirSync(path.join(tmpBase, 'elsewhere', 'core'), { recursive: true });
  fs.writeFileSync(path.join(tmpBase, 'elsewhere', 'core', 'SKILL.md'),
    '# some other project core\nname: not-ours\n', 'utf8');
  const a4 = detectCore(badSkill);
  check('A4 unrelated same-named core: fingerprint gate rejects it -> chain returns no-hit',
    a4 === null, a4 ? 'wrongly hit at ' + a4.file : 'no hit (documented fallback: ask user)');

  const skillSrc = fs.readFileSync(SKILL, 'utf8');
  check('A5 thin entry documents the chain candidates it was tested against',
    skillSrc.includes('../../../../core/SKILL.md') && skillSrc.includes('`<本文件所在目录>/core/SKILL.md`')
      && skillSrc.includes(FINGERPRINT),
    '');

  // ---------- B. l3-hint ----------
  const dirWithState = path.join(tmpBase, 'with-state');
  const dirNoState = path.join(tmpBase, 'no-state');
  fs.mkdirSync(path.join(dirWithState, 'idea2launch'), { recursive: true });
  fs.mkdirSync(dirNoState, { recursive: true });
  fs.writeFileSync(path.join(dirWithState, 'idea2launch', 'state.json'), stateFixture(5, '喂猫提醒'), 'utf8');

  let r = feedL3({ prompt: '继续', cwd: dirWithState });
  check('B1 hit-continue + state.json -> hint with stage and name, exit 0', r.status === 0
    && r.stdout.includes('idea2launch') && r.stdout.includes('5') && r.stdout.includes('喂猫提醒'),
    'status=' + r.status + ' stdout=' + JSON.stringify(r.stdout.slice(0, 100)));
  check('B1b hint <= 3 lines', hintLines(r.stdout).length <= 3, 'lines=' + hintLines(r.stdout).length);

  r = feedL3({ prompt: '帮我做一个记账的小应用', cwd: dirNoState });
  check('B2 dev-intent + no state -> suggest launch, no auto-start', r.status === 0
    && r.stdout.includes('启动 idea2launch'),
    'status=' + r.status);
  check('B2b hint <= 3 lines', hintLines(r.stdout).length <= 3, 'lines=' + hintLines(r.stdout).length);

  r = feedL3({ prompt: '改需求，把登录去掉', cwd: dirWithState });
  check('B3 change-requirement keyword -> hint', r.status === 0 && r.stdout.includes('idea2launch'),
    'status=' + r.status);

  r = feedL3({ prompt: 'please continue with the next step', cwd: dirNoState });
  check('B4 english keyword -> hint', r.status === 0 && r.stdout.includes('idea2launch'),
    'status=' + r.status);

  r = feedL3({ prompt: '继续用 idea2launch 做我的项目', cwd: dirWithState });
  check('B5 whitelist idea2launch -> silent', r.status === 0 && r.stdout.trim() === '',
    'status=' + r.status);

  r = feedL3({ prompt: '今天天气怎么样？', cwd: dirNoState });
  check('B6 no keyword -> silent', r.status === 0 && r.stdout.trim() === '',
    'status=' + r.status);

  r = feedL3('not-json{{{');
  check('B7 bad JSON -> fail-silent exit 0', r.status === 0 && r.stdout.trim() === '',
    'status=' + r.status);

  r = feedL3('');
  check('B8 empty stdin -> fail-silent exit 0', r.status === 0 && r.stdout.trim() === '',
    'status=' + r.status);

  r = feedL3({ prompt: '继续', cwd: dirWithState + path.sep + '..' }); // raw '..' segment, unnormalized
  check('B9 traversal cwd -> path guard rejects, silent exit 0', r.status === 0 && r.stdout.trim() === '',
    'status=' + r.status);

  r = feedL3({ cwd: dirWithState });
  check('B10 missing prompt field -> silent', r.status === 0 && r.stdout.trim() === '',
    'status=' + r.status);

  r = feedL3({ prompt: 123, cwd: dirNoState });
  check('B11 non-string prompt -> silent', r.status === 0 && r.stdout.trim() === '',
    'status=' + r.status);

  // ---------- C. inject-global ----------
  const freshRoot = path.join(tmpBase, 'fresh');
  fs.mkdirSync(freshRoot, { recursive: true });
  r = runAsk(['--answer', 'on', freshRoot], tmpBase);
  let marker = '';
  try { marker = fs.readFileSync(path.join(freshRoot, 'idea2launch', '.inject-global-answer'), 'utf8').trim(); } catch (_) { /* absent */ }
  check('C1 fresh record on -> marker written', r.status === 0 && marker === 'on',
    'status=' + r.status + ' marker=' + JSON.stringify(marker));
  check('C1b no partial state.json created (restraint rule)', !fs.existsSync(path.join(freshRoot, 'idea2launch', 'state.json')), '');

  const mergeRoot = path.join(tmpBase, 'merge');
  fs.mkdirSync(path.join(mergeRoot, 'idea2launch'), { recursive: true });
  fs.writeFileSync(path.join(mergeRoot, 'idea2launch', 'state.json'), stateFixture(2, '合并项目'), 'utf8');
  r = runAsk(['--answer', 'off', mergeRoot], tmpBase);
  let merged = null;
  try { merged = JSON.parse(fs.readFileSync(path.join(mergeRoot, 'idea2launch', 'state.json'), 'utf8')); } catch (_) { /* absent */ }
  marker = '';
  try { marker = fs.readFileSync(path.join(mergeRoot, 'idea2launch', '.inject-global-answer'), 'utf8').trim(); } catch (_) { /* absent */ }
  check('C2 merge into existing state.json, other fields intact', r.status === 0 && merged !== null
    && merged.inject_global === 'off' && merged.current_stage === 2 && merged.project.name === '合并项目'
    && marker === 'off',
    'status=' + r.status + ' state=' + (merged ? JSON.stringify(merged).slice(0, 100) : 'absent'));

  r = runAsk([mergeRoot], tmpBase);
  marker = '';
  try { marker = fs.readFileSync(path.join(mergeRoot, 'idea2launch', '.inject-global-answer'), 'utf8').trim(); } catch (_) { /* absent */ }
  check('C3 idempotent re-run -> prints existing, no rewrite', r.status === 0
    && r.stdout.includes('off') && marker === 'off',
    'status=' + r.status);

  const qRoot = path.join(tmpBase, 'question');
  fs.mkdirSync(qRoot, { recursive: true });
  r = runAsk([qRoot], tmpBase);
  check('C4 non-interactive no --answer -> question only, nothing written', r.status === 0
    && r.stdout.includes('on') && r.stdout.includes('off') && r.stdout.includes('ask')
    && r.stdout.includes('未写入任何文件')
    && !fs.existsSync(path.join(qRoot, 'idea2launch')),
    'status=' + r.status);

  const badRoot = path.join(tmpBase, 'bad');
  fs.mkdirSync(badRoot, { recursive: true });
  r = runAsk(['--answer', 'yes-please', badRoot], tmpBase);
  check('C5 invalid answer -> non-zero exit, nothing written', r.status !== 0
    && !fs.existsSync(path.join(badRoot, 'idea2launch')),
    'status=' + r.status);

  const askRoot = path.join(tmpBase, 'askcase');
  fs.mkdirSync(askRoot, { recursive: true });
  r = runAsk(['--answer', 'ask', askRoot], tmpBase);
  marker = '';
  try { marker = fs.readFileSync(path.join(askRoot, 'idea2launch', '.inject-global-answer'), 'utf8').trim(); } catch (_) { /* absent */ }
  check('C6 --answer ask -> marker ask, no partial state.json', r.status === 0 && marker === 'ask'
    && !fs.existsSync(path.join(askRoot, 'idea2launch', 'state.json')),
    'status=' + r.status);

  // ---------- D. static checks ----------
  const l3Src = fs.readFileSync(L3, 'utf8');
  const askSrc = fs.readFileSync(ASK, 'utf8');
  const drySrc = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');

  const ALLOW = new Set(['fs', 'path', 'readline', 'os', 'child_process',
    'node:fs', 'node:path', 'node:readline', 'node:os', 'node:child_process', 'node:url']);
  const l3Req = requireSpecs(l3Src);
  const askReq = requireSpecs(askSrc);
  const dryImp = importSpecs(drySrc);
  check('D1 zero-dep l3-hint.js (requires=' + JSON.stringify(l3Req) + ')',
    l3Req.every((s) => ALLOW.has(s)), '');
  check('D2 zero-dep inject-global.js (requires=' + JSON.stringify(askReq) + ')',
    askReq.every((s) => ALLOW.has(s)), '');
  check('D3 zero-dep dryrun.mjs (imports=' + JSON.stringify(dryImp) + ')',
    dryImp.every((s) => ALLOW.has(s)), '');

  check('D4 no cross-shell require (no zcode path in any require spec)',
    [...l3Req, ...askReq].every((s) => !s.includes('zcode')), '');

  const NOSEG = 'nosemgrep:javascript.lang.security.audit.detect-non-literal-fs-filename';
  const bareAnnotated = (src) => {
    const lines = src.split(/\r?\n/).filter((l) => l.includes('nosemgrep:'));
    return lines.length > 0 && lines.every((l) => /nosemgrep:[A-Za-z0-9.\-]+\s*$/.test(l));
  };
  check('D5a l3-hint.js carries bare nosemgrep annotations (no trailing prose)',
    l3Src.includes(NOSEG) && bareAnnotated(l3Src),
    'lines=' + l3Src.split(/\r?\n/).filter((l) => l.includes('nosemgrep:')).length);
  check('D5b inject-global.js carries bare nosemgrep annotations (no trailing prose)',
    askSrc.includes(NOSEG) && bareAnnotated(askSrc)
      && askSrc.includes('nosemgrep:javascript.lang.security.audit.path-traversal.path-join-resolve-traversal'),
    '');

  const scanFiles = [L3, ASK, SKILL, INSTALL, fileURLToPath(import.meta.url)];
  // 本扫描器连自己也一起扫，所以签名不允许以字面量出现在本文件任何位置
  //（实测教训：正则字面量里的一个普通英文词会被自己另一条分支命中）。
  // 全部签名用字符码拼装，注释只留中文描述：
  //   凭据签名＝若干凭据词（词表见拼装码）后跟冒号或等号；
  //   机器路径签名＝盘符冒号斜杠 / 两处 MSYS 风格目录 / 机器用户名词。
  const cc = (...codes) => String.fromCharCode(...codes);
  const credWords = [
    cc(112, 97, 115, 115, 119, 111, 114, 100),
    cc(112, 97, 115, 115, 119, 100),
    cc(115, 101, 99, 114, 101, 116),
    cc(97, 112, 105) + '[_-]?' + cc(107, 101, 121),
    cc(97, 99, 99, 101, 115, 115) + '[_-]?' + cc(116, 111, 107, 101, 110),
    cc(112, 114, 105, 118, 97, 116, 101) + '[_-]?' + cc(107, 101, 121),
  ].join('|');
  const credRe = new RegExp('(' + credWords + ')\\s*[:=]', 'i');
  const machineRe = new RegExp(
    '[' + cc(67) + '-' + cc(69) + ']:[\\\\/]'
    + '|' + cc(47) + 'c' + cc(47) + 'users'
    + '|' + cc(47) + 'e' + cc(47) + 'opens'
    + '|' + cc(97, 100, 109, 105, 110, 105, 115, 116, 114, 97, 116, 111, 114),
    'i');
  let credHits = [];
  for (const f of scanFiles) {
    const src = fs.readFileSync(f, 'utf8');
    if (credRe.test(src)) credHits.push(path.basename(f) + ':credential-pattern');
    if (machineRe.test(src)) credHits.push(path.basename(f) + ':machine-path');
  }
  check('D6 no credential literals / machine-absolute paths in all 5 shell files',
    credHits.length === 0, credHits.join(', '));

  const installSrc = fs.readFileSync(INSTALL, 'utf8');
  const docRefs = [
    ['shells/cli/skills/idea2launch/SKILL.md', 'skills/idea2launch/SKILL.md'],
    ['shells/cli/l3-hint.js', 'l3-hint.js'],
    ['shells/cli/inject-global.js', 'inject-global.js'],
    ['shells/cli/dryrun.mjs', 'dryrun.mjs'],
    ['core/SKILL.md', 'core/SKILL.md'],
    ['core/references/triggers.md', 'core/references/triggers.md'],
    ['shells/zcode/hooks/l3-intent-hint.js', 'hooks/l3-intent-hint.js'],
    ['shells/zcode/hooks/first-run-ask.js', 'first-run-ask.js'],
    ['shells/zcode/INJECT-GLOBAL.md', 'INJECT-GLOBAL.md'],
  ];
  const missing = docRefs.filter(([disk, inDoc]) => !fs.existsSync(path.join(ROOT, disk)) || !installSrc.includes(inDoc));
  check('D7 INSTALL.md referenced paths all exist on disk and appear in the doc',
    missing.length === 0, missing.map(([d]) => d).join(', '));

  check('D8 core/SKILL.md carries the fingerprint the chain gates on',
    fs.readFileSync(REAL_CORE, 'utf8').includes(FINGERPRINT), '');

  for (const f of [L3, ASK]) {
    const c = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
    check('D9 node --check ' + path.basename(f), c.status === 0,
      c.stderr ? c.stderr.slice(0, 120) : '');
  }
} finally {
  fs.rmSync(tmpBase, { recursive: true, force: true });
}

console.log('\n==== M2-4 CLI shell dry-run: ' + passed + ' passed, ' + failed + ' failed ====');
process.exit(failed > 0 ? 1 : 0);
