# 全局 UI 设计规范

> idea2launch 第 3 阶段（设计）全局规范，面向「新手项目＋LLM 生成原型」场景移植适配。
> 数值锚点来源：Material 3、Apple HIG、Ant Design 5、IBM Carbon、Refactoring UI、W3C Design Tokens v2025.10（2026-10-01 汇编，出处声明见 README）。与项目既有设计系统冲突时，**项目既有规范优先**。
> 结构：§1–§8 通用规范本体（移植）；§9–§10 新手适配层（本仓新增——默认 token 套装与 LLM 生成原型 checklist）。

## 1. 设计 token（三层结构）

- **primitive（原子层）**：与语义无关的原始值——`gray-50…gray-950`、`brand-50…brand-950`、`space-1…space-16`、`text-xs…text-4xl`、`radius-sm…full`、`duration-fast…slow`。
- **semantic（语义层）**：表达用途——`bg-canvas / bg-surface / bg-surface-hover`、`text-primary / text-secondary / text-disabled`、`border-subtle / border-strong`、`accent / success / warning / danger / info`（各配 `-bg / -fg / -border` 三件套）。
- **component（组件层）**：按需——`button-primary-bg` 等；组件层可缺省，前两层不可。
- **明暗主题只换 semantic 层映射**，组件代码零改动；CSS 用 `:root` + `[data-theme="dark"]` 切换。
- 落盘：原型阶段直接用 CSS 变量（§9 预设即此格式）；工程化交付时可转 W3C Design Tokens JSON（`$value`/`$type`）。

最小 token 模板（可直接抄）：

```css
:root {
  /* 中性灰阶：向品牌色相偏 5–10°（下例偏蓝灰），纯灰显脏 */
  --gray-50: #f9fafb;  --gray-100: #f3f4f6;  --gray-200: #e5e7eb;
  --gray-300: #d1d5db; --gray-400: #9ca3af;  --gray-500: #6b7280;
  --gray-600: #4b5563; --gray-700: #374151;  --gray-800: #1f2937;
  --gray-900: #111827; --gray-950: #030712;
  /* 间距：4px 基网格 */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px;
  /* 字号阶梯 */
  --text-xs: 12px; --text-sm: 14px; --text-md: 16px; --text-lg: 18px;
  --text-xl: 20px; --text-2xl: 24px; --text-3xl: 30px; --text-4xl: 36px;
  /* 圆角家族 */
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-xl: 16px;
  --radius-full: 9999px;
  /* 动效 */
  --duration-fast: 150ms; --duration-base: 250ms; --duration-slow: 400ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
}
```

## 2. 色彩

- **60-30-10**：60% 中性底色、30% 次级面、10% 强调色；CTA 一屏只留一个 primary 按钮层级。
- 语义色五件套 `success / warning / danger / info` + `accent`，各配 bg（浅底）/fg（文字）/border；fg 色单独校对比度，不能用 bg 色直接当文字色。
- 灰阶 9–11 阶起步；向品牌色相偏 5–10°（蓝灰/暖灰）。
- 对比度硬数字（WCAG AA）：正文 ≥4.5:1；大字 ≥3:1；图标/边框/焦点环等非文本 ≥3:1；占位文字按正文标准。
- **深色模式**：
  - 底色深灰非纯黑（#0D1117 一类）；纯黑生硬且阴影失效。
  - 层级靠 surface 提亮（越浮越亮），不靠阴影；阴影改 1px 边框或 40–60% 透明黑。
  - 语义色整体提亮一档（深底上 #22c55e 比 #16a34a 可读）；品牌色降饱和 10–20%。
  - 图片/插画降亮度 5–10%；大段文字用 gray-200/300 禁纯白。
  - **深浅两套都要真截图验证**——定义了不算完成，看过才算。

## 3. 字体排印

- 字号阶梯（px）：12 / 13 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48；正文 14–16，辅助 12–13，页面主标题 24–30；一屏字号种类 ≤5。
- 行高：标题 1.2–1.3；西文正文 1.5–1.6；**中文正文 ≥1.7**；按钮/标签单行 1。
- 字重 ≤3 档（400/500/700）；层级优先「字号＋颜色深浅」，其次字重——处处加粗＝没有层级。
- 字长：西文 45–75 字符/行，中文 35–45 字/行；正文容器 max-width 640–720px。
- 数字场景（表格/仪表/金额）`font-variant-numeric: tabular-nums`＋右对齐。
- 字体栈：中文 `"PingFang SC", "Microsoft YaHei", "Noto Sans SC"`（完整系统栈见 §9 默认基座）；原型只用系统字体栈、禁外部字体请求；工程阶段引入品牌西文字体时做子集化＋`font-display: swap`。
- **中文纪律**：禁斜体强调（用字重/颜色/背景色）；中西文之间留半角空格；标题与正文间距遵循亲密性（标题上方间距 > 下方）。

## 4. 间距与布局

- 基网格 4px（半步）/ 8px（整步）；阶梯：4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96。
- **间距的语义是分组不是填空**：组内间距 < 组间间距（label 与输入框 4–8px，字段组之间 24–32px）。
- 容器：应用内容最大宽 1200–1440；阅读列 640–720；超宽屏两侧留白递增，不无限拉伸。
- 断点：640 / 768 / 1024 / 1280 / 1536；移动优先；**320px 可读无横向滚动**（WCAG reflow）。
- 卡片流 `repeat(auto-fill, minmax(280px, 1fr))`；表单页 12 栏。

## 5. 圆角、边框、阴影、层级

- 圆角家族：sm 4 / md 8 / lg 12 / xl 16 / full；**同组件族统一**（卡片全 lg、按钮全 md）；输入框与按钮圆角一致。
- 层级策略（Refactoring UI）：优先「背景色差＋1px 边框」建立层级；**阴影只留给真浮动元素**（dropdown/modal/toast/tooltip）；阴影 2–3 级制，y 偏移大于扩散。
- 边框色不用纯灰 #ccc：subtle 用灰阶 200/300，strong 用 400/500。
- z-index 令牌化：dropdown 1000 / sticky 1020 / drawer 1040 / modal 1060 / toast 1080 / tooltip 1100；**禁止随手 z-index: 9999**。

## 6. 动效

- 时长三档：micro（hover/按压/开关）150–200ms；standard（展开/抽屉/浮层）200–300ms；entrance（页面/大区块）300–500ms；>500ms 用户开始感知等待。
- 缓动：标准 `cubic-bezier(0.2, 0, 0, 1)`（快进缓停）；进场 decelerate、退场 accelerate；禁弹跳滥用。
- 只过渡 `transform` / `opacity`（合成层属性）；height/margin 过渡掉帧，用 transform 替代。
- `prefers-reduced-motion: reduce` 下位移/缩放动画全量降级为透明度或禁用。
- 动效只为了解释「元素从哪来、到哪去」与状态因果；无信息量的装饰动画砍掉。

## 7. 密度与触控

- 触控目标 ≥44×44px（iOS HIG）/ 48dp（Material）；桌面小图标用 padding 外扩凑足 44；WCAG 2.5.8 的 24×24 是底线不是目标。
- 表格行高 40–48px（紧凑模式 32–36）；列表项 ≥40px。
- 表单标签上置（后台）/左置（设置页）二选一全站统一。

## 8. 图标与插画

- 全站单一图标体系：线性（stroke）或填充二选一禁混用；尺寸 16/20/24，stroke 宽随尺寸 1.5/1.75/2。
- 禁 emoji 作功能图标（跨平台渲染不一致）；装饰场景可用。
- 空态/引导插画风格统一（同线宽、同配色家族）。
- 原型场景：图标一律**内联 SVG**，不引图标字体/图标库 CDN；插画可用简洁几何 SVG 占位，线宽与配色家族和图标保持一致。

## 9. 新手项目默认 token 套装（本仓新增）

新手项目没有品牌积累，从零挑色挑字体最容易翻车。本节给一套开箱即用的默认基座＋两套成品风格预设。用法：

- **整块复制**：任选一套 `:root` 块整体粘进原型 `<style>` 顶部即可，块内变量自足、无占位符。
- **同名可换**：三套块变量名完全一致（`--gray-*` / `--space-*` / `--text-*` / `--radius-*` / `--duration-*` / `--shadow-*` / 中性语义 / `--primary*` / 语义色五件套 / `--z-*`），整体替换即切换风格——可视化编辑层的 token 预设切换依赖这一同名约定。
- 替换主色或改任何颜色值后，须用对比度工具复校（正文 ≥4.5:1、大字与图形 ≥3:1）。

### 9.1 默认基座（风格中立，稳妥起点）

选值理由：

- **字体栈**：系统字体优先——零外部请求（`file://` 离线可用），中文覆盖 macOS（PingFang SC）/ Windows（Microsoft YaHei）/ Linux 与安卓（Noto Sans SC）。
- **灰阶**：11 阶蓝灰（向蓝色相偏 5–10°，纯灰显脏）；11 阶保证浅底、边框、正文、深底全场景有阶可用。
- **间距**：4px 基网格（§4 阶梯）。
- **主色**：默认蓝 #2563eb——白字对比达正文 AA 门槛，且与 success/danger/warning/info 语义色距离最远、不混淆。
- **语义色五件套**：fg 取 700 阶深色（正文级对比过 AA），bg 取 50 阶浅底，border 取 200 阶；三件成套，缺一即补齐。
- **圆角**：基座家族 4/8/12/16，按钮 md、卡片 lg（§5 同组件族统一）。

```css
:root {
  /* 字体栈：系统字体，零外部请求 */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
               "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif;
  --font-heading: var(--font-sans);

  /* 中性灰阶：11 阶蓝灰 */
  --gray-50: #f9fafb;  --gray-100: #f3f4f6;  --gray-200: #e5e7eb;
  --gray-300: #d1d5db; --gray-400: #9ca3af;  --gray-500: #6b7280;
  --gray-600: #4b5563; --gray-700: #374151;  --gray-800: #1f2937;
  --gray-900: #111827; --gray-950: #030712;

  /* 间距：4px 基网格 */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px;

  /* 字号阶梯 */
  --text-xs: 12px; --text-sm: 14px; --text-md: 16px; --text-lg: 18px;
  --text-xl: 20px; --text-2xl: 24px; --text-3xl: 30px; --text-4xl: 36px;

  /* 圆角家族：输入框/按钮 md、卡片 lg、浮层 xl */
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-xl: 16px;
  --radius-full: 9999px;

  /* 动效 */
  --duration-fast: 150ms; --duration-base: 250ms; --duration-slow: 400ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);

  /* 阴影三级（y 偏移 > 扩散；只给真浮动元素） */
  --shadow-1: 0 1px 2px rgba(17, 24, 39, 0.05);
  --shadow-2: 0 4px 12px rgba(17, 24, 39, 0.08);
  --shadow-3: 0 12px 32px rgba(17, 24, 39, 0.14);

  /* 中性语义 */
  --bg-canvas: var(--gray-50);
  --bg-surface: #ffffff;
  --bg-surface-hover: var(--gray-100);
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-600);
  --text-disabled: var(--gray-400);
  --border-subtle: var(--gray-200);
  --border-strong: var(--gray-400);

  /* 主色（白字对比达正文 AA；替换须复校） */
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --primary-active: #1e40af;
  --primary-fg: #ffffff;

  /* 语义色五件套（bg=50 阶浅底 / fg=700 阶深字 / border=200 阶） */
  --success-bg: #f0fdf4; --success-fg: #15803d; --success-border: #bbf7d0;
  --warning-bg: #fffbeb; --warning-fg: #b45309; --warning-border: #fde68a;
  --danger-bg:  #fef2f2; --danger-fg:  #b91c1c; --danger-border:  #fecaca;
  --info-bg:    #eff6ff; --info-fg:    #1d4ed8; --info-border:    #bfdbfe;
  --accent-bg:  #eff6ff; --accent-fg:  #1d4ed8; --accent-border:  #bfdbfe;

  /* 分层（§5 z-index 令牌） */
  --z-dropdown: 1000; --z-sticky: 1020; --z-drawer: 1040;
  --z-modal: 1060; --z-toast: 1080; --z-tooltip: 1100;
}
```

### 9.2 风格预设 A：「清爽工具风」

适用：效率工具、管理后台、SaaS 应用。对应 `style-anchors.md`「清爽工具」方向。

选型理由：主色取默认蓝 #2563eb——工具界面要信任感与低刺激，蓝与全部语义色距离最远；**画布与表面同用白底**，层级完全靠 1px 边框＋背景微差建立（§5 层级策略），几乎不用阴影——这是「清爽」的来源；圆角保持基座家族 4/8/12/16，操作密度高的界面用过大的圆角会软化边界、损失对齐感。

```css
:root {
  /* 字体栈：系统字体，零外部请求 */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
               "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif;
  --font-heading: var(--font-sans);

  /* 中性灰阶：11 阶蓝灰 */
  --gray-50: #f9fafb;  --gray-100: #f3f4f6;  --gray-200: #e5e7eb;
  --gray-300: #d1d5db; --gray-400: #9ca3af;  --gray-500: #6b7280;
  --gray-600: #4b5563; --gray-700: #374151;  --gray-800: #1f2937;
  --gray-900: #111827; --gray-950: #030712;

  /* 间距：4px 基网格 */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px;

  /* 字号阶梯 */
  --text-xs: 12px; --text-sm: 14px; --text-md: 16px; --text-lg: 18px;
  --text-xl: 20px; --text-2xl: 24px; --text-3xl: 30px; --text-4xl: 36px;

  /* 圆角家族：同基座，保边界感 */
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-xl: 16px;
  --radius-full: 9999px;

  /* 动效 */
  --duration-fast: 150ms; --duration-base: 250ms; --duration-slow: 400ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);

  /* 阴影：只给真浮动元素（浮层/弹窗），卡片不用 */
  --shadow-1: 0 1px 2px rgba(17, 24, 39, 0.05);
  --shadow-2: 0 4px 12px rgba(17, 24, 39, 0.08);
  --shadow-3: 0 12px 32px rgba(17, 24, 39, 0.14);

  /* 中性语义：白画布，靠边框分区 */
  --bg-canvas: #ffffff;
  --bg-surface: #ffffff;
  --bg-surface-hover: var(--gray-50);
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-600);
  --text-disabled: var(--gray-400);
  --border-subtle: var(--gray-200);
  --border-strong: var(--gray-400);

  /* 主色：信任蓝（白字对比达正文 AA；替换须复校） */
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --primary-active: #1e40af;
  --primary-fg: #ffffff;

  /* 语义色五件套（与基座一致） */
  --success-bg: #f0fdf4; --success-fg: #15803d; --success-border: #bbf7d0;
  --warning-bg: #fffbeb; --warning-fg: #b45309; --warning-border: #fde68a;
  --danger-bg:  #fef2f2; --danger-fg:  #b91c1c; --danger-border:  #fecaca;
  --info-bg:    #eff6ff; --info-fg:    #1d4ed8; --info-border:    #bfdbfe;
  --accent-bg:  #eff6ff; --accent-fg:  #1d4ed8; --accent-border:  #bfdbfe;

  /* 分层 */
  --z-dropdown: 1000; --z-sticky: 1020; --z-drawer: 1040;
  --z-modal: 1060; --z-toast: 1080; --z-tooltip: 1100;
}
```

### 9.3 风格预设 B：「温暖内容风」

适用：博客、刊物、品牌内容站、内容型官网。对应 `style-anchors.md`「编辑排版」方向。

选型理由：标题用衬线字体（`--font-heading`）建立编辑感，正文保持无衬线保证屏显可读；灰阶换**暖灰**（向黄色相偏移），画布用纸白而非冷白，长时间阅读不刺眼；主色取深橘 #c2410c——暖色低刺激、情绪亲和，700 阶深度保证按钮白字对比过正文 AA；圆角档位整体上移到 6/10/16/20（按钮 lg、卡片 xl），大圆角传达亲和、去掉工具感；卡片允许 shadow-1 软阴影＋边框并用，质感更柔。

```css
:root {
  /* 字体栈：正文无衬线，标题衬线（均系统字体，零外部请求） */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
               "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif;
  --font-heading: Georgia, "Noto Serif SC", "Songti SC", "SimSun", serif;

  /* 中性灰阶：11 阶暖灰 */
  --gray-50: #fafaf9;  --gray-100: #f5f5f4;  --gray-200: #e7e5e4;
  --gray-300: #d6d3d1; --gray-400: #a8a29e;  --gray-500: #78716c;
  --gray-600: #57534e; --gray-700: #44403c;  --gray-800: #292524;
  --gray-900: #1c1917; --gray-950: #0c0a09;

  /* 间距：4px 基网格 */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px;

  /* 字号阶梯（标题档可比基座再取 §3 的 48px 大标题） */
  --text-xs: 12px; --text-sm: 14px; --text-md: 16px; --text-lg: 18px;
  --text-xl: 20px; --text-2xl: 24px; --text-3xl: 30px; --text-4xl: 36px;

  /* 圆角家族：整体上移一档，亲和无工具感 */
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px; --radius-xl: 20px;
  --radius-full: 9999px;

  /* 动效 */
  --duration-fast: 150ms; --duration-base: 250ms; --duration-slow: 400ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);

  /* 阴影：偏暖黑；卡片可用 shadow-1 软阴影＋边框并用 */
  --shadow-1: 0 1px 3px rgba(28, 25, 23, 0.06);
  --shadow-2: 0 6px 16px rgba(28, 25, 23, 0.08);
  --shadow-3: 0 16px 40px rgba(28, 25, 23, 0.12);

  /* 中性语义：纸白画布 */
  --bg-canvas: var(--gray-50);
  --bg-surface: #ffffff;
  --bg-surface-hover: var(--gray-100);
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-600);
  --text-disabled: var(--gray-400);
  --border-subtle: var(--gray-200);
  --border-strong: var(--gray-400);

  /* 主色：暖橘（700 阶保证白字对比过正文 AA；替换须复校） */
  --primary: #c2410c;
  --primary-hover: #9a3412;
  --primary-active: #7c2d12;
  --primary-fg: #ffffff;

  /* 语义色五件套（通用值，与基座一致） */
  --success-bg: #f0fdf4; --success-fg: #15803d; --success-border: #bbf7d0;
  --warning-bg: #fffbeb; --warning-fg: #b45309; --warning-border: #fde68a;
  --danger-bg:  #fef2f2; --danger-fg:  #b91c1c; --danger-border:  #fecaca;
  --info-bg:    #eff6ff; --info-fg:    #1d4ed8; --info-border:    #bfdbfe;
  --accent-bg:  #fef3ec; --accent-fg:  #9a3412; --accent-border:  #fdd7b8;

  /* 分层 */
  --z-dropdown: 1000; --z-sticky: 1020; --z-drawer: 1040;
  --z-modal: 1060; --z-toast: 1080; --z-tooltip: 1100;
}
```

## 10. LLM 生成原型 checklist（本仓新增）

适用：LLM 直接产出**单文件 HTML 原型**的场景。生成时逐条自检，全部必过；交付前再跑完整版 `review-checklist.md`（本节是生成速查，不替代交付清单）。

1. **token 不裸值**：颜色/间距/字号/圆角/阴影/时长全部引用 §9 变量，禁 magic number。
2. **零外部依赖**：单文件、内联 CSS，禁框架/字体/图标 CDN 与任何网络请求——`file://` 双击可开。
3. **五态齐全**：可交互元素 default/hover/active/focus-visible/disabled；数据面另给 loading/empty/error 示范。
4. **对比度**：正文 ≥4.5:1、大字与图形 ≥3:1、占位文字按正文标准。
5. **中文纪律**：`<html lang="zh-CN">`、正文行高 ≥1.7、禁斜体强调、中西文间留半角空格、标点用全角。
6. **反 AI slop**：禁默认蓝紫渐变、禁 emoji 当功能图标、禁原生 alert/confirm、禁 lorem ipsum——文案用 PRD 里的真实业务语言。
7. **动效克制**：只动 transform/opacity，150–500ms，`prefers-reduced-motion` 全量降级。
8. **data-pid 逐区块标注**：每个可编辑区块标 `data-pid="<page>-<block>-<seq>"`（如 `home-hero-01`、`settings-form-03`），无遗漏、无重复。
9. **三视口不破**：1440 / 768 / 375 无溢出、无重叠、无挤压；320px 无横向滚动。
10. **空态给行动**：空状态文案给「下一步做什么」而非道歉；错误态带重试出口。
