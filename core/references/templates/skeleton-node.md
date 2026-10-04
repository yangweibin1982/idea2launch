<!--
idea2launch · 后端骨架模板·Node 路径（骨架 B/C/D 用，stage-4-tech.md §2.6 配套）
用途：阶段 6 开发起步时，把本模板各代码块按文件名复制进用户项目，先跑通「起服务＋探活＋两个测试样例」，再按 §四 替换点逐个换成真实业务。骨架 A（纯静态无后端）不进本模板。
与其他模板的分工：api-contract.md 定「后端该开出哪些窗口、出错怎么回话」，本模板给「把这些窗口装起来的毛坯房」——代码里【替换点 n】与 api-contract 节号一一挂钩。
诚实边界：本模板代码块在干净目录实抽验证过（node --check 通过、装 express 后可起服务、逐文件测试通过）；【替换点】位置之外禁加半成品假代码。Python 路径骨架本轮未实现，见 §五 占位注记。
本文为模板：代码块是可直接抽出的真实文件（围栏标记 `​```js server.mjs` 的第二个词＝文件名）；`<!-- 填法提示 -->` 注释实例化时删除。
-->

# 后端骨架 · Node 路径（Express 类极简服务器）

> 这是骨架 B/C/D 走 Node 路径时的后端毛坯房：一个文件起服务器，路由（端点）、请求体解析、统一错误处理、静态页托管、优雅退出全齐。配套前端页面放 `public/` 目录即可被托管。术语：Express＝Node 上最常用的极简服务器框架（别人搭好的毛坯房，你只装门窗）；路由＝「敲哪扇窗、由谁接待」的登记表；优雅退出＝关门（停服务）前把手头的请求办完，禁说断就断。

## 一、服务器骨架（单文件 `server.mjs`）

```js server.mjs
// server.mjs —— 极简服务器骨架（单文件起步，骨架 B/C/D · Node 路径）
// 起步三步：npm install → node server.mjs → 浏览器开 http://127.0.0.1:3000/api/health
// 被测试导入时不会自动开服务（见文件末尾「只在直接运行时开服务」一段）。
import express from 'express';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
// 端口从环境变量读（.env 里配 PORT），没配就退回 3000
const PORT = process.env.PORT || 3000;

// ── 中间件岗（对应 api-contract §二；按你项目的契约增删岗）──
// 解析 JSON 请求体：没有这一行，POST 过来的 JSON 读不到（req.body 是空的）
app.use(express.json());

// ── 纯函数：业务校验样例（【替换点 1】换成 api-contract 各端点的真实入参校验）──
// 单独导出，test/validate.test.mjs 直接测它——不碰网络、不碰数据库，跑得飞快
export function validateTaskBody(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, code: 'VALIDATION_FAILED', message: '提交的内容读不出来，请刷新页面后重试' };
  }
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title) {
    return { ok: false, code: 'VALIDATION_FAILED', message: '标题不能为空，请填一个标题再保存' };
  }
  if (title.length > 100) {
    return { ok: false, code: 'VALIDATION_FAILED', message: '标题太长（超过 100 字），请缩短后再保存' };
  }
  return { ok: true, title };
}

// ── 内存数据（【替换点 2】换成技术方案定的数据库读写：
//    骨架 B → SQLite 单文件；骨架 C/D → 按 stage-4 §2.4 定的数据库）──
const tasks = [];
let nextId = 1;

// ── 路由注册（【替换点 3】按 api-contract §一 端点表逐条换成真实端点）──
// 探活端点：阶段 7 用 `curl -sf http://127.0.0.1:3000/api/health` 探活，勿删
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, data: { status: 'up' } });
});

// 列表：拿到记过的所有条目
app.get('/api/tasks', (_req, res) => {
  res.json({ ok: true, data: tasks });
});

// 新建：交一条新条目
app.post('/api/tasks', (req, res) => {
  const check = validateTaskBody(req.body);
  if (!check.ok) {
    // 出错按统一格式回话（对应 api-contract §四）：ok/code/message 三件套
    return res.status(400).json({ ok: false, code: check.code, message: check.message });
  }
  const task = { id: nextId++, title: check.title, done: false, createdAt: new Date().toISOString() };
  tasks.push(task);
  res.status(201).json({ ok: true, data: task });
});

// ── 静态页托管：前端页面放 public/ 目录，开 http://127.0.0.1:3000/ 直接看到（【替换点 4】）──
app.use(express.static(path.join(__dirname, 'public')));

// ── 统一错误处理岗：接住前面所有岗漏掉的错误（对应 api-contract §二错误处理岗＋§四）──
// 四个参数是 Express 认错误中间件的标志，一个都不能少
app.use((err, _req, res, _next) => {
  console.error('[未处理错误]', err); // 错误必须留进日志，禁吞（E1-6）
  res.status(500).json({
    ok: false,
    code: 'INTERNAL_ERROR',
    message: '服务器开小差了，请稍后再试；反复出现请把时间点报给开发者排查',
  });
});

// ── 启动函数（导出给测试用）──
export function start(port = PORT) {
  const server = app.listen(port, () => {
    console.log(`服务已起：http://127.0.0.1:${server.address().port}`);
  });
  return server;
}

// 只在「直接运行本文件」时才开服务；被测试导入时不开（测试自己调 start(0) 挑随机空端口）
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = start();
  // 优雅退出：Ctrl+C（SIGINT）或系统关机（SIGTERM）时，把手头请求办完再关门
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => {
      console.log('收到退出信号，正在收尾……');
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 3000).unref(); // 兜底：3 秒没关干净就强退，防卡住
    });
  }
}
```

## 二、配套静态页样例（`public/index.html`）

```html public/index.html
<!doctype html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>{{项目名}}</title></head>
<body>
  <h1>{{项目名}}</h1>
  <p>页面已通：这个静态页由服务器托管（server.mjs 的 express.static）。</p>
</body>
</html>
```

## 三、测试骨架（node:test，逐文件形式）

> 测试框架＝node:test（Node 自带，不用装）；术语：单元测试＝单独验一小块逻辑（纯函数）；API 测试＝真起一个服务，按 api-contract 端点逐条打一遍。
> **铁律：测试命令必须逐文件形式**（`node --test test/a.test.mjs test/b.test.mjs`），**禁目录形式**（`node --test test`）——Windows 会把目录误判成单测试文件、0 收集（stage-6 §3 判据 6 同源坑）。

```js test/validate.test.mjs
// validate.test.mjs —— 纯函数单元测试样例（测 server.mjs 导出的业务校验）
// 运行（逐文件形式）：node --test test/validate.test.mjs test/api.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateTaskBody } from '../server.mjs';

test('合法标题通过校验', () => {
  const r = validateTaskBody({ title: '买牛奶' });
  assert.equal(r.ok, true);
  assert.equal(r.title, '买牛奶');
});

test('空标题被拦下，按统一错误格式给大白话提示', () => {
  const r = validateTaskBody({ title: '   ' });
  assert.equal(r.ok, false);
  assert.equal(r.code, 'VALIDATION_FAILED');
  assert.ok(r.message.length > 0);
});

test('非对象入参被拦下且不抛异常', () => {
  assert.equal(validateTaskBody(null).ok, false);
  assert.equal(validateTaskBody('字符串').ok, false);
});
```

```js test/api.test.mjs
// api.test.mjs —— API 测试样例：起本地服务，对照 api-contract 端点逐条打
// 运行（逐文件形式）：node --test test/validate.test.mjs test/api.test.mjs
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { start } from '../server.mjs';

// start(0)＝让系统随机挑一个空端口，避免和正开着的服务撞车
const server = start(0);
after(() => server.close());
// 等端口真的开好再开打（防止服务还没就位测试就发请求）
if (!server.listening) {
  await new Promise((resolve) => server.once('listening', resolve));
}
const base = `http://127.0.0.1:${server.address().port}`;

test('探活端点活着（对应 api-contract 的健康检查）', async () => {
  const res = await fetch(`${base}/api/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
});

test('新建任务：合法入参返回 201', async () => {
  const res = await fetch(`${base}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '测试任务' }),
  });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.data.title, '测试任务');
});

test('新建任务：空标题按统一错误格式返回 400', async () => {
  const res = await fetch(`${base}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '' }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.equal(body.code, 'VALIDATION_FAILED');
});
```

## 四、配置样例（`package.json` ＋ `.env.example`）

```json package.json
{
  "name": "{{项目名小写连字符}}",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node server.mjs",
    "test": "node --test test/validate.test.mjs test/api.test.mjs"
  },
  "dependencies": {
    "express": "^4.19.0"
  }
}
```

```ini .env.example
# .env.example —— 环境变量样例（复制一份改名 .env 再填真实值；.env 禁提交进 git，.gitignore 已含）
# 铁律（E4）：本文件只放键名和占位符；真实值只进 .env；任何密钥禁写死进代码或文档
# 带配置运行：node --env-file=.env server.mjs（Node 20.6+；不带 .env 直接 node server.mjs 也跑得起来）

# 服务端口（浏览器地址里冒号后的数字）
PORT=3000

# 会话/令牌签名密钥（登录态防伪造；骨架 D 必配）——填一串随机长字符，禁用占位文字当真值上线
SESSION_SECRET=替换成一串随机长字符

# 数据库连接串（【替换点 6】骨架 B 默认 SQLite 单文件不用这行；上 PostgreSQL 后去掉行首 # 并填真实值）
# DATABASE_URL=postgresql://用户名:密码@127.0.0.1:5432/数据库名
```

## 五、怎么用（复制后按替换点改）

1. **复制**：把上面六个代码块按文件名复制进用户项目（`server.mjs` 与 `package.json` 在项目根；`test/` 两个测试文件进 `test/`；`index.html` 进 `public/`；`.env.example` 在项目根）——与 tech-plan.md §二 目录树一致。
2. **装依赖**：项目根执行 `npm install`（装 express——为验证选型而装依赖属「建议后做」，先向用户说明再装）。
3. **跑通毛坯**：`node server.mjs`，另开一个终端 `curl -sf http://127.0.0.1:3000/api/health`——返回 `{"ok":true,...}` 即毛坯通了。
4. **跑通测试**：`node --test test/validate.test.mjs test/api.test.mjs`（逐文件；禁目录形式）。
5. **逐个替换点改真**：

| 替换点 | 样例里是什么 | 换成什么（依据） |
|---|---|---|
| 1 纯函数校验 | `validateTaskBody`（示例任务标题校验） | api-contract 各端点的真实入参校验，错误码对齐其 §四 错误码表 |
| 2 数据存取 | 内存数组 `tasks`（重启即丢） | 技术方案定的数据库读写（骨架 B→SQLite；C/D→按 stage-4 §2.4） |
| 3 路由 | `/api/tasks` 两条＋`/api/health` | api-contract §一 端点表逐条（`/api/health` 探活端点勿删） |
| 4 静态页 | `public/index.html` 三行样例 | 阶段 3 定稿的前端页面（token 体系按 tech-plan §五 迁移） |
| 5 错误回话 | 400/500 两条统一格式 | api-contract §四 错误码表全量 |
| 6 环境变量 | `PORT`/`SESSION_SECRET`/`DATABASE_URL` 键名 | tech-plan §四 凭据策略定的键名（禁真实凭据字面量，E4） |

6. **每完成一张票**：测试同步跟着改（先写失败测试再实现，E2-1）；构建日志里的测试命令保持逐文件形式。

<!-- 填法提示：本模板是「毛坯房」——只换【替换点】，禁删探活端点、统一错误处理岗、优雅退出三件基础设施（阶段 7 探活与 E1-6 依赖它们）；骨架 C/D 要加登录时，鉴权岗中间件按 api-contract §三 的凭证形态补，样例不含鉴权（骨架 B 用不上，避免新手背多余复杂度）。 -->

## 六、Python 路径骨架模板（占位注记——本轮未实现）

Python 路径（FastAPI 类）的服务器骨架模板**下一迭代补**，本轮不提供半成品代码。当前骨架为 Python 方向时：先按调研漏斗实查选型（[../stages/stage-4-tech.md](../stages/stage-4-tech.md) §2.6），再按所选框架官方新手教程起项目——宁缺毋滥，诚实标注比假完整值钱。
