/**
 * V4 编辑器壳验证脚本 — 全动作集 Playwright 实测
 * 方法沿用 .squad/idea2launch/spike-v1/verify.mjs（chrome 探测 / 下载捕获＋镜像兜底）。
 * 流程：file:// 打开 visual-editor.html → 载入 spike fixture 原型 → 逐动作实测
 *      （选中工具条/改字/双击行内编辑/上移/删除/撤销重做/换图双通道/预设/色板/
 *        圆角/密度/三视口）→ 导出双通道捕获 → 事件流 §7 schema 校验 →
 *      重置＋拖拽载入 → 零外部请求审计。
 * 运行：node test/verify-editor.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const SPIKE_DIR = path.join(REPO_ROOT, '.squad', 'idea2launch', 'spike-v1');
const OUT_DIR = path.join(__dirname, 'out');
const EDITOR_HTML = path.resolve(__dirname, '..', 'visual-editor.html');
const FIXTURE = path.join(SPIKE_DIR, 'fixture-prototype.html');

// playwright 优先直接解析，失败则回退 spike-v1 的 node_modules（票面许可）
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  const pwPath = pathToFileURL(path.join(SPIKE_DIR, 'node_modules', 'playwright', 'index.mjs')).href;
  ({ chromium } = await import(pwPath));
}

const EDITED_TEXT = '新标题：让团队数据一句话可达';
const SVG_DATA_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=';
const ACTION_ENUM = ['edit-text', 'delete', 'move-up', 'move-down', 'replace-image', 'apply-preset', 'add', 'nl-note'];
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

// ---------- 工具 ----------
function findChromeExecutable() {
  const root = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  const entries = fs.existsSync(root) ? fs.readdirSync(root) : [];
  const dirs = entries
    .filter((d) => /^chromium-\d+$/.test(d))
    .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
  for (const d of dirs) {
    for (const sub of ['chrome-win64', 'chrome-win']) {
      const p = path.join(root, d, sub, 'chrome.exe');
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

const results = [];
function record(id, name, pass, evidence) {
  results.push({ id, name, pass });
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id} ${name}`);
  if (!pass && evidence) console.log(`       └ ${String(evidence).slice(0, 600)}`);
}

async function waitEventsCount(page, n, timeout = 6000) {
  await page.waitForFunction(
    (num) => window.__api && window.__api.events.length >= num,
    n,
    { timeout }
  );
}

async function canvasFrame(page) {
  for (let i = 0; i < 60; i++) {
    const frames = page.frames().filter((f) => f !== page.mainFrame());
    for (const f of frames) {
      try {
        if (await f.$('.hero-title')) return f;
      } catch {
        /* 画布重建中的瞬态错误，忽略重试 */
      }
    }
    await page.waitForTimeout(250);
  }
  throw new Error('画布未就绪（未找到 .hero-title）');
}

async function assertCanvasWidth(page, width) {
  await page.waitForFunction(
    (w) => {
      const f = document.querySelector('.gjs-frame');
      return !!f && Math.abs(f.getBoundingClientRect().width - w) < 4;
    },
    width,
    { timeout: 8000 }
  );
}

// ---------- 主流程 ----------
fs.mkdirSync(OUT_DIR, { recursive: true });
const pngPath = path.join(OUT_DIR, 'tiny.png');
fs.writeFileSync(pngPath, PNG_1PX);
const fixtureHtml = fs.readFileSync(FIXTURE, 'utf8');

const externalRequests = [];
const consoleErrors = [];
const pageErrors = [];

const browser = await chromium.launch({
  headless: true,
  executablePath: findChromeExecutable(),
});
try {
  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1500, height: 920 },
  });
  const page = await context.newPage();
  page.on('request', (r) => {
    const u = r.url();
    if (/^https?:\/\//i.test(u)) externalRequests.push(u);
  });
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  // 1. file:// 打开编辑器壳
  await page.goto(pathToFileURL(EDITOR_HTML).href, { waitUntil: 'load' });
  const gjsLoaded = await page.evaluate(() => typeof window.grapesjs !== 'undefined' && !!window.__editorReady);
  record('O1', 'file:// 打开编辑器壳，GrapesJS 本地加载（零 CDN）', gjsLoaded,
    gjsLoaded ? '' : 'grapesjs 或 __editorReady 不存在');

  // 2. 选择文件通道载入 fixture
  await page.setInputFiles('#file-input', FIXTURE);
  await page.waitForSelector('#btn-export:not([disabled])', { timeout: 20000 });
  const guideShown = await page.$eval('#guide', (el) => !el.hidden);
  const inputDisabled = await page.$eval('#file-input', (el) => el.disabled);
  record('L1', '载入原型：文件通道就绪＋三步引导条出现＋载入后文件入口禁用',
    guideShown && inputDisabled,
    `guideShown=${guideShown} inputDisabled=${inputDisabled}`);

  const frame = await canvasFrame(page);

  // 3. 单击选中 → 浮出工具条
  await frame.click('.hero-title');
  const tbSel = page.waitForSelector('.gjs-toolbar [title="改字"]', { state: 'visible', timeout: 6000 });
  const selInfo = await page.evaluate(() => window.__api.selectedInfo());
  const tbVisible = !!(await tbSel);
  record('S1', '单击选中：选中高亮（内核选中）＋浮出工具条（含改字）',
    tbVisible && selInfo && selInfo.pid === 'home-hero-01',
    `toolbarVisible=${tbVisible} selected=${JSON.stringify(selInfo)}`);

  // 4. 改字（工具条弹窗通道）
  await page.click('.gjs-toolbar [title="改字"]');
  await page.waitForSelector('#m-text', { timeout: 5000 });
  await page.fill('#m-text', EDITED_TEXT);
  await page.click('#modal-foot button.primary');
  await page.waitForFunction(
    (t) => document.querySelector('.hero-title') && document.querySelector('.hero-title').textContent === t,
    EDITED_TEXT,
    { timeout: 6000 }
  ).catch(() => {});
  const heroText = await frame.evaluate(() => (document.querySelector('.hero-title') || {}).textContent || '');
  await waitEventsCount(page, 1);
  const ev1 = await page.evaluate(() => window.__api.events[0]);
  record('A1', '改字：画布文字更新＋事件流记录 edit-text（before/after 正确）',
    heroText === EDITED_TEXT && ev1.action === 'edit-text' &&
      ev1.pid === 'home-hero-01' && ev1.before === '让团队数据一句话可达' && ev1.after === EDITED_TEXT,
    `heroText="${heroText}" ev=${JSON.stringify(ev1)}`);

  // 5. 双击文字 → 行内编辑（RTE）
  await frame.dblclick('.hero-title');
  await page.waitForTimeout(400);
  const editable = await frame.evaluate(() => {
    const el = document.querySelector('.hero-title');
    if (!el) return '';
    return el.getAttribute('contenteditable') || '';
  });
  record('S2', '双击文字：进入行内编辑（元素获得 contenteditable）', editable === 'true',
    `contenteditable="${editable}"`);
  await page.keyboard.press('Escape');
  await frame.click('.hero-sub').catch(() => {});

  // 6. 选中卡片 → 上移
  await frame.click('[data-pid="home-cards-03"]', { position: { x: 12, y: 10 } });
  await page.waitForSelector('.gjs-toolbar [title="上移"]', { state: 'visible', timeout: 6000 });
  await page.click('.gjs-toolbar [title="上移"]');
  await page.waitForFunction(() => {
    const grid = document.querySelector('.card-grid');
    if (!grid) return false;
    const pids = [...grid.children].map((c) => c.getAttribute('data-pid'));
    return pids[0] === 'home-cards-03';
  }, null, { timeout: 6000 }).catch(() => {});
  const cardOrder = await frame.evaluate(() =>
    [...document.querySelectorAll('.card-grid > *')].map((c) => c.getAttribute('data-pid'))
  );
  await waitEventsCount(page, 2);
  const ev2 = (await page.evaluate(() => window.__api.events))[1];
  record('A2', '上移：DOM 顺序变化＋事件流记录 move-up（2→1）',
    cardOrder[0] === 'home-cards-03' && ev2.action === 'move-up' &&
      ev2.pid === 'home-cards-03' && ev2.before === '2' && ev2.after === '1',
    `order=${JSON.stringify(cardOrder)} ev=${JSON.stringify(ev2)}`);

  // 7. 删除（工具条）
  await page.click('.gjs-toolbar [title="删除"]');
  await frame.waitForSelector('[data-pid="home-cards-03"]', { state: 'detached', timeout: 6000 });
  await waitEventsCount(page, 3);
  const ev3 = (await page.evaluate(() => window.__api.events))[2];
  record('A3', '删除：元素移除＋事件流记录 delete（单条，无级联噪声）',
    ev3.action === 'delete' && ev3.pid === 'home-cards-03',
    `ev=${JSON.stringify(ev3)}`);

  // 8. 撤销 / 重做
  await page.click('#btn-undo');
  await frame.waitForSelector('[data-pid="home-cards-03"]', { state: 'attached', timeout: 6000 });
  await waitEventsCount(page, 4);
  await page.click('#btn-redo');
  await frame.waitForSelector('[data-pid="home-cards-03"]', { state: 'detached', timeout: 6000 });
  await waitEventsCount(page, 5);
  const ev45 = (await page.evaluate(() => window.__api.events)).slice(3, 5);
  const undoRedoOk = ev45[0].action === 'nl-note' && ev45[0].pid === '__global__' &&
    ev45[1].action === 'nl-note' && ev45[1].pid === '__global__';
  record('A4', '撤销恢复/重做：删除可撤销可重做，撤销重做留 nl-note 审计事件', undoRedoOk,
    `ev=${JSON.stringify(ev45)}`);

  // 9. 双击图片：不露 GrapesJS asset manager，弹自建换图窗
  await frame.dblclick('.hero-art');
  await page.waitForSelector('#modal:not([hidden])', { timeout: 6000 });
  await page.waitForTimeout(300);
  const amLeak = await page.evaluate(() => ({
    mdl: !!(document.querySelector('.gjs-mdl-dialog') && document.querySelector('.gjs-mdl-dialog').offsetParent !== null),
    amAssets: !!document.querySelector('.gjs-am-assets')
  }));
  const modalTitle = await page.$eval('#modal-title', (el) => el.textContent);
  record('S3', '双击图片：不出现 asset manager 全貌，弹自建换图窗',
    !amLeak.mdl && !amLeak.amAssets && modalTitle.includes('更换图片'),
    `leak=${JSON.stringify(amLeak)} title="${modalTitle}"`);
  await page.click('#modal-foot button:first-child'); // 取消

  // 10. 换图通道一：粘贴 data URL
  await page.waitForSelector('.gjs-toolbar [title="换图"]', { state: 'visible', timeout: 6000 });
  await page.click('.gjs-toolbar [title="换图"]');
  await page.waitForSelector('#m-imgurl', { timeout: 5000 });
  await page.fill('#m-imgurl', SVG_DATA_URL);
  await page.click('#modal-foot button.primary');
  await page.waitForFunction(
    (u) => (document.querySelector('.hero-art') || {}).getAttribute && document.querySelector('.hero-art').getAttribute('src') === u,
    SVG_DATA_URL,
    { timeout: 6000 }
  ).catch(() => {});
  const src1 = await frame.evaluate(() => (document.querySelector('.hero-art') || { getAttribute: () => '' }).getAttribute('src'));
  await waitEventsCount(page, 6);
  const ev6 = (await page.evaluate(() => window.__api.events))[5];
  record('A5', '换图（网址/dataURL 通道）：img src 更新＋事件流记录 replace-image',
    src1 === SVG_DATA_URL && ev6.action === 'replace-image' && ev6.pid === 'home-hero-01',
    `src="${String(src1).slice(0, 60)}…" ev=${JSON.stringify(ev6)}`);

  // 11. 换图通道二：本地文件转 dataURL 内嵌
  await page.click('.gjs-toolbar [title="换图"]');
  await page.waitForSelector('#m-imgfile', { timeout: 5000 });
  await page.setInputFiles('#m-imgfile', pngPath);
  await page.waitForFunction(() => (document.getElementById('m-imgname') || {}).textContent &&
    document.getElementById('m-imgname').textContent.includes('已就绪'), null, { timeout: 6000 });
  await page.click('#modal-foot button.primary');
  await page.waitForFunction(() => {
    const el = document.querySelector('.hero-art');
    return el && (el.getAttribute('src') || '').startsWith('data:image/png');
  }, null, { timeout: 6000 }).catch(() => {});
  const src2 = await frame.evaluate(() => (document.querySelector('.hero-art') || { getAttribute: () => '' }).getAttribute('src') || '');
  await waitEventsCount(page, 7);
  const ev7 = (await page.evaluate(() => window.__api.events))[6];
  record('A6', '换图（本地文件通道）：转 dataURL 内嵌＋事件流记录 replace-image',
    src2.startsWith('data:image/png') && ev7.action === 'replace-image' && ev7.note.includes('内嵌'),
    `src="${String(src2).slice(0, 40)}…" ev=${JSON.stringify(ev7)}`);

  // 12. token 预设：温暖内容风
  await page.selectOption('#sel-preset', 'warm');
  await page.waitForTimeout(150);
  const warmP = await page.evaluate(() => window.__api.canvasVar('--primary'));
  const warmGray = await page.evaluate(() => window.__api.canvasVar('--gray-900'));
  const warmFont = await page.evaluate(() => window.__api.canvasVar('--font-heading'));
  await waitEventsCount(page, 8);
  record('T1', '主题预设（温暖内容风）：:root 变量值整体变化（主色/暖灰/衬线标题）',
    warmP === '#c2410c' && warmGray === '#1c1917' && warmFont.includes('Georgia'),
    `--primary=${warmP} --gray-900=${warmGray} --font-heading=${warmFont}`);

  // 13. token 预设：清爽工具风
  await page.selectOption('#sel-preset', 'fresh');
  await page.waitForTimeout(150);
  const freshGray = await page.evaluate(() => window.__api.canvasVar('--gray-900'));
  const freshRadius = await page.evaluate(() => window.__api.canvasVar('--radius-lg'));
  await waitEventsCount(page, 9);
  record('T2', '主题预设（清爽工具风）：变量切换回冷灰体系（--gray-900/--radius-lg）',
    freshGray === '#111827' && freshRadius === '12px',
    `--gray-900=${freshGray} --radius-lg=${freshRadius}`);

  // 14. 圆角三档
  await page.click('#seg-radius [data-value="large"]');
  await page.waitForTimeout(150);
  const radiusLg = await page.evaluate(() => window.__api.canvasVar('--radius-lg'));
  await waitEventsCount(page, 10);
  record('T3', '圆角档位（大圆角）：--radius-lg 12px → 16px', radiusLg === '16px', `--radius-lg=${radiusLg}`);

  // 15. 密度两档
  await page.click('#seg-density [data-value="compact"]');
  await page.waitForTimeout(150);
  const space4 = await page.evaluate(() => window.__api.canvasVar('--space-4'));
  await waitEventsCount(page, 11);
  record('T4', '密度档位（紧凑）：--space-4 16px → 12px', space4 === '12px', `--space-4=${space4}`);

  // 16. 主题色快捷换（命中原型自有 --brand-500 别名组＋预设 --primary）
  await page.click('.swatch[data-color="#047857"]');
  await page.waitForTimeout(150);
  const brand500 = await page.evaluate(() => window.__api.canvasVar('--brand-500'));
  const primaryNow = await page.evaluate(() => window.__api.canvasVar('--primary'));
  await waitEventsCount(page, 12);
  record('T5', '主题色快捷换（翠绿）：--brand-500 与 --primary 同时替换',
    brand500 === '#047857' && primaryNow === '#047857',
    `--brand-500=${brand500} --primary=${primaryNow}`);

  // 17. 三视口切换
  let deviceOk = true;
  let deviceEvidence = '';
  try {
    await page.click('#seg-device [data-device="mobile"]');
    await assertCanvasWidth(page, 375);
    await page.click('#seg-device [data-device="tablet"]');
    await assertCanvasWidth(page, 768);
    await page.click('#seg-device [data-device="desktop"]');
    await assertCanvasWidth(page, 1440);
  } catch (e) {
    deviceOk = false;
    deviceEvidence = e.message;
  }
  record('D1', '三视口切换：画布宽度 375 / 768 / 1440 变化', deviceOk, deviceEvidence);

  // 18. 导出双通道：通道 A（两文件下载）
  const dl1P = page.waitForEvent('download', { timeout: 10000 });
  const dl2P = page.waitForEvent('download', { timeout: 15000 });
  await page.click('#btn-export');
  let editedSaved = false, jsonSaved = false, jsonText = '', editedHtml = '';
  try {
    const d1 = await dl1P;
    if (d1.suggestedFilename() === 'edited.html') { await d1.saveAs(path.join(OUT_DIR, 'edited.html')); editedSaved = true; }
    const d2 = await dl2P;
    if (d2.suggestedFilename() === 'edits.json') { await d2.saveAs(path.join(OUT_DIR, 'edits.json')); jsonSaved = true; }
  } catch {
    // 兜底：第二次下载被浏览器策略拦截时取页面镜像
  }
  if (!editedSaved) {
    const mirror = await page.evaluate(() => window.__api.exports.html);
    if (mirror) { fs.writeFileSync(path.join(OUT_DIR, 'edited.html'), mirror, 'utf8'); editedSaved = true; }
  }
  if (!jsonSaved) {
    const mirror = await page.evaluate(() => window.__api.exports.json);
    if (mirror) { fs.writeFileSync(path.join(OUT_DIR, 'edits.json'), mirror, 'utf8'); jsonSaved = true; }
  }
  editedHtml = fs.readFileSync(path.join(OUT_DIR, 'edited.html'), 'utf8');
  jsonText = fs.readFileSync(path.join(OUT_DIR, 'edits.json'), 'utf8');
  record('X1', '通道 A「导出修改包」：下载 edited.html ＋ edits.json 两文件',
    editedSaved && jsonSaved, `editedSaved=${editedSaved} jsonSaved=${jsonSaved}`);

  // 19. 事件流 §7 schema 校验
  const eventsJson = JSON.parse(jsonText);
  const edits = eventsJson.edits || [];
  const seqOk = edits.every((e, i) => e.seq === i + 1);
  const fieldsOk = edits.every((e) =>
    typeof e.seq === 'number' && typeof e.ts === 'string' && !Number.isNaN(Date.parse(e.ts)) &&
    typeof e.pid === 'string' && e.pid.length > 0 &&
    ACTION_ENUM.includes(e.action) &&
    typeof e.before === 'string' && typeof e.after === 'string' && typeof e.note === 'string'
  );
  const expectedActions = ['edit-text', 'move-up', 'delete', 'nl-note', 'nl-note',
    'replace-image', 'replace-image', 'apply-preset', 'apply-preset', 'apply-preset', 'apply-preset', 'apply-preset'];
  const actionsOk = JSON.stringify(edits.map((e) => e.action)) === JSON.stringify(expectedActions);
  const wrapOk = eventsJson.schema_version === 1 && eventsJson.prototype_file === 'fixture-prototype.html';
  record('X2', `事件流合 §7 schema：12 条、seq 连续、pid 非空、action 在枚举内、动作序列正确`,
    edits.length === 12 && seqOk && fieldsOk && actionsOk && wrapOk,
    `count=${edits.length} seqOk=${seqOk} fieldsOk=${fieldsOk} actionsOk=${actionsOk} wrapOk=${wrapOk}\n actual=${JSON.stringify(edits.map((e) => ({ seq: e.seq, pid: e.pid, action: e.action })))}`);

  // 20. 导出 HTML 内容
  const htmlOk = editedHtml.includes(EDITED_TEXT) &&
    !editedHtml.includes('data-pid="home-cards-03"') &&
    editedHtml.includes('data-pid="home-hero-01"') &&
    editedHtml.includes('#047857') &&
    editedHtml.includes('@media (max-width: 768px)') &&
    editedHtml.includes(':root');
  record('X3', 'edited.html：新文字入导出、被删 pid 移除、换色生效、@media 与 :root 保留',
    htmlOk, `新文字=${editedHtml.includes(EDITED_TEXT)} 被删pid在=${editedHtml.includes('data-pid="home-cards-03"')} 换色=${editedHtml.includes('#047857')}`);

  // 21. 通道 B：复制修改说明（大白话清单）
  await page.click('#btn-copy-plain');
  await page.waitForSelector('#m-plain', { timeout: 5000 });
  const plain = await page.evaluate(() => window.__api.plainText);
  const plainOk = plain.startsWith('原型修改说明（共 12 处修改）') &&
    plain.includes('从「让团队数据一句话可达」改为「' + EDITED_TEXT + '」') &&
    plain.includes('删除了「') &&
    plain.includes('切换主题预设：') &&
    plain.includes('把圆角档位调为「大圆角」');
  await page.click('#modal-foot button:first-child');
  record('C1', '通道 B「复制修改说明」：事件流转大白话清单（含改字/删除/预设/圆角）', plainOk,
    `plain="${String(plain).slice(0, 260)}…"`);

  // 22. 重置 + 拖拽通道载入
  await page.click('#btn-reset');
  await page.waitForSelector('#modal:not([hidden])', { timeout: 5000 });
  await page.click('#modal-foot button.primary'); // 确认重置
  await page.waitForSelector('#landing', { state: 'visible', timeout: 6000 });
  const inputEnabled = await page.$eval('#file-input', (el) => !el.disabled);
  await page.evaluate((html) => {
    const dt = new DataTransfer();
    dt.items.add(new File([html], 'dropped-prototype.html', { type: 'text/html' }));
    document.getElementById('dropzone')
      .dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
  }, fixtureHtml);
  await page.waitForSelector('#btn-export:not([disabled])', { timeout: 20000 });
  const droppedName = await page.evaluate(() => window.__api.loadedFile());
  const eventsReset = await page.evaluate(() => window.__api.events.length);
  record('R1', '重置回打开界面＋拖拽通道载入（事件流归零、文件入口重新可用）',
    inputEnabled && droppedName === 'dropped-prototype.html' && eventsReset === 0,
    `inputEnabled=${inputEnabled} loaded="${droppedName}" events=${eventsReset}`);

  // 23. 零外部请求审计（断网语义）
  record('N1', '零外部请求：全程无任何 http(s) 网络请求（file:// 离线可用）',
    externalRequests.length === 0,
    externalRequests.length ? externalRequests.slice(0, 5).join(' | ') : '');

  // 24. 编辑器源码无 http(s) 引用
  const editorSource = fs.readFileSync(EDITOR_HTML, 'utf8');
  const httpMatches = editorSource.match(/https?:\/\//g) || [];
  record('N2', '编辑器源码零 http(s) 资源引用（grep）', httpMatches.length === 0,
    httpMatches.length ? '命中 ' + httpMatches.length + ' 处' : '');

  // 25. 页面无未捕获异常
  record('E9', '全程无未捕获页面异常（pageerror=0）', pageErrors.length === 0,
    pageErrors.slice(0, 3).join(' | '));

  // ---------- 汇总 ----------
  if (consoleErrors.length) {
    console.log('\n[浏览器 console.error]（' + consoleErrors.length + ' 条，仅记录不判失败）');
    consoleErrors.slice(0, 10).forEach((e) => console.log('  - ' + e.slice(0, 300)));
  }
  const allPass = results.every((r) => r.pass);
  console.log('\n================ V4 EDITOR RESULT: ' + (allPass ? 'PASS' : 'FAIL') +
    '（' + results.filter((r) => r.pass).length + '/' + results.length + ' 项通过） ================');
  process.exitCode = allPass ? 0 : 1;
} finally {
  await browser.close();
}
