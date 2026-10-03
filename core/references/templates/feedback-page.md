<!--
idea2launch · 反馈页模板（阶段 9 产出）
用途：阶段 9 第①步由智能体按本模板生成，落用户项目根 `反馈页.html`（双击即开）。轻量反馈收集入口——用户填完点「生成反馈文本」，把出现的文字复制、粘回会话即完成登记（如何登记见 `idea2launch/9-operate/反馈.md`）。
技术约束（与原型同规）：单文件 HTML＋内联 CSS＋内联脚本；样式 token 沿用 `modules/ui-spec/ui-spec.md` §9.1 默认基座变量名（整块复制不调值）；**零外部依赖**——无 CDN、无网络字体、无联网表单；`file://` 双击可开；**本页不收集不上传任何数据**——填的内容只留在用户机器上（数据去向用户自主，C4 矩阵第 8 行同源）。data-pid 非必须。
填充规则：替换 {{项目名}}；token 块整块保留不删；零外部依赖是硬要求（文件内禁出现任何外部资源引用）；可达性底线：对比度 ≥4.5:1（token 基座已保证）、焦点可见、触控目标 ≥44px、行高 ≥1.7。
本文为模板：代码块整体复制到目标文件后，替换占位符、删去本注释头。
-->

# {{项目名}} · 反馈页模板

> 双击可开的静态意见簿：不联网、不上传，填完生成一段文字，复制给智能体就算登记。

## 实例化产物（`反馈页.html` 全文）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{项目名}} · 反馈</title>
<style>
  /* ui-spec §9.1 默认基座（整块复制，变量名不改动） */
  :root {
    --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                 "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif;
    --gray-50: #f9fafb;  --gray-100: #f3f4f6;  --gray-200: #e5e7eb;
    --gray-300: #d1d5db; --gray-400: #9ca3af;  --gray-500: #6b7280;
    --gray-600: #4b5563; --gray-700: #374151;  --gray-900: #111827;
    --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
    --space-6: 24px; --space-8: 32px;
    --text-sm: 14px; --text-md: 16px; --text-lg: 18px; --text-2xl: 24px;
    --radius-md: 8px; --radius-lg: 12px;
    --bg-canvas: var(--gray-50);
    --bg-surface: #ffffff;
    --text-primary: var(--gray-900);
    --text-secondary: var(--gray-600);
    --border-subtle: var(--gray-200);
    --primary: #2563eb;
    --primary-hover: #1d4ed8;
    --primary-fg: #ffffff;
    --danger-fg: #b91c1c;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: var(--space-8) var(--space-4);
    background: var(--bg-canvas); color: var(--text-primary);
    font-family: var(--font-sans); font-size: var(--text-md); line-height: 1.7;
  }
  main { max-width: 640px; margin: 0 auto; }
  .card {
    background: var(--bg-surface); border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg); padding: var(--space-6); margin-bottom: var(--space-4);
  }
  h1 { font-size: var(--text-2xl); margin: 0 0 var(--space-2); }
  h2 { font-size: var(--text-lg); margin: 0 0 var(--space-2); }
  .hint { color: var(--text-secondary); font-size: var(--text-sm); margin: 0 0 var(--space-4); }
  label { display: block; margin-bottom: var(--space-4); font-weight: 600; }
  select, textarea, input {
    display: block; width: 100%; margin-top: var(--space-1);
    padding: var(--space-2) var(--space-3); font: inherit; line-height: 1.7;
    border: 1px solid var(--border-subtle); border-radius: var(--radius-md);
    background: var(--bg-surface); color: var(--text-primary);
  }
  button {
    min-height: 44px; padding: var(--space-2) var(--space-6); font: inherit; font-weight: 600;
    border: none; border-radius: var(--radius-md); cursor: pointer;
    background: var(--primary); color: var(--primary-fg);
  }
  button:hover { background: var(--primary-hover); }
  :focus-visible { outline: 3px solid var(--primary); outline-offset: 2px; }
  .error { color: var(--danger-fg); font-size: var(--text-sm); }
  [hidden] { display: none; }
</style>
</head>
<body>
<main>
  <section class="card">
    <h1>{{项目名}} · 说说你的想法</h1>
    <p class="hint">这一页不联网：你填的内容只留在你自己的电脑里。点「生成反馈文本」，把出现的文字复制、粘给智能体（或项目主人）就行。</p>
    <label>想说什么类型的事
      <select id="f-type">
        <option>用着有问题（坏了/报错）</option>
        <option>想改一个功能</option>
        <option>想加一个功能</option>
        <option>别的问题</option>
      </select>
    </label>
    <label>哪一步出的事（哪个页面、点了什么）
      <textarea id="f-where" rows="2" placeholder="例如：记账页面，点「保存」之后"></textarea>
    </label>
    <label>你看到了什么／想要什么
      <textarea id="f-what" rows="4" placeholder="把看到的原样说清楚，越具体越好"></textarea>
    </label>
    <p class="error" id="f-error" hidden>「你看到了什么／想要什么」还没填——这是最要紧的一栏。</p>
    <label>怎么找到你（可不填）
      <input id="f-contact" type="text" placeholder="联系方式，选填">
    </label>
    <button type="button" id="f-submit">生成反馈文本</button>
  </section>
  <section class="card" id="f-result" hidden>
    <h2>把下面这段复制给智能体</h2>
    <textarea id="f-output" rows="8" readonly></textarea>
    <button type="button" id="f-copy">一键复制</button>
    <p class="hint" id="f-copy-hint" hidden>自动复制没成功——请在上面文本框手动全选、复制。</p>
  </section>
</main>
<script>
  // 零依赖：只做拼文本与复制，不联网、不存储
  (function () {
    function get(id) { return (document.getElementById(id).value || '').trim(); }
    document.getElementById('f-submit').addEventListener('click', function () {
      var what = get('f-what');
      var err = document.getElementById('f-error');
      if (!what) { err.hidden = false; return; }
      err.hidden = true;
      var now = new Date();
      var today = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
      var lines = [
        '【{{项目名}} 反馈】',
        '日期：' + today,
        '类型：' + get('f-type'),
        '哪一步：' + get('f-where'),
        '看到了什么/想要什么：' + what
      ];
      var contact = get('f-contact');
      if (contact) { lines.push('联系方式：' + contact); }
      document.getElementById('f-output').value = lines.join('\n');
      document.getElementById('f-result').hidden = false;
      document.getElementById('f-result').scrollIntoView();
    });
    document.getElementById('f-copy').addEventListener('click', function () {
      var out = document.getElementById('f-output');
      var hint = document.getElementById('f-copy-hint');
      out.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      hint.hidden = ok; // 复制失败才提示手动全选（不吞错误，给出路）
    });
  })();
</script>
</body>
</html>
```

## 填法提示（执行智能体读，生成时删除本节）

1. **只换 {{项目名}}**（两处：标题、生成文本首行），其余原样输出——token 与脚本改动越多，零依赖与可达性越容易破。
2. **零外部依赖硬要求**：生成后自检 `grep -cE "https?://" 反馈页.html` 必须为 0；禁加任何统计脚本、外链字体、图标库。
3. **登记闭环**：把本页路径写进 `idea2launch/9-operate/反馈.md` 的「怎么提」节；用户粘回的文本按路由表登记（append-only）。
4. 用户不用页面、只在会话里说反馈同样合法（M1 从简，角色卡职责 1）——页面是可选项，登记入口不是。
