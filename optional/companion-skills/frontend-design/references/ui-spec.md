# 全局 UI 设计细节规范（core）

> frontend-design 技能包核心规范。数值锚点：Material 3、Apple HIG、Ant Design 5、IBM Carbon、Refactoring UI、W3C Design Tokens v2025.10。与项目既有设计系统冲突时，**项目既有规范优先**（唯一事实）。

## 1. 设计 token（三层结构）

- **primitive（原子层）**：与语义无关的原始值——`gray-50…gray-950`、`brand-50…brand-950`、`space-1…space-16`、`text-xs…text-4xl`、`radius-sm…full`、`duration-fast…slow`。
- **semantic（语义层）**：表达用途——`bg-canvas / bg-surface / bg-surface-hover`、`text-primary / text-secondary / text-disabled`、`border-subtle / border-strong`、`accent / success / warning / danger / info`（各配 `-bg / -fg / -border` 三件套）。
- **component（组件层）**：按需——`button-primary-bg` 等；组件层可缺省，前两层不可。
- **明暗主题只换 semantic 层映射**，组件代码零改动；CSS 用 `:root` + `[data-theme="dark"]` 切换。
- 落盘建议 W3C Design Tokens JSON（`$value`/`$type`），工程侧转 CSS variables / Tailwind theme。

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
- 字体栈：中文 `"PingFang SC", "Microsoft YaHei", "Noto Sans SC"`；品牌西文字体＋系统栈兜底；`font-display: swap`。
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
