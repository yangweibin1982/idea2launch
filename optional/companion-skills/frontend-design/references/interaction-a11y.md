# 交互细节与可达性（硬指标）

> 蒸馏自 Vercel Web Interface Guidelines（2026-10 实查一手原文）与 WCAG 2.2。判据：每条可机械判定。可达性是合格线，不是加分项。

## 键盘与焦点

- 全站键盘可达：Tab 顺序＝DOM 顺序＝视觉顺序；禁 `tabindex` 正数。
- `focus-visible` 焦点环：2px＋offset 2px，颜色 ≥3:1；**禁 `outline: none` 无替代**；自定义控件必有可见焦点态。
- modal 焦点陷阱＋关闭归还焦点；SPA 路由切换后焦点移入主内容区；后台类提供「跳到主内容」链接。
- 不劫持浏览器快捷键（Ctrl/Cmd+F 等）；自定义快捷键在 tooltip 中标注。

## 链接与按钮语义

- 跳转用 `a href`、动作用 `button`，**禁 div onClick**；链接有 hover/focus 下划线 affordance。
- 外部链接新标签打开时告知（图标或文案）；下载链接标文件类型与大小。
- icon-only 按钮必配 `aria-label`；纯装饰图标 `aria-hidden`。

## 文本与内容

- 中文 `word-break: break-word`，禁两头对齐（justify 在中文拉出空洞）；长 URL/串 `overflow-wrap: anywhere`。
- 截断策略显式（ellipsis/line-clamp＋tooltip 全文）；时间相对＋悬浮绝对（「3 小时前」→ hover「2026-10-01 14:32」）。
- `<html lang>` 正确（中文页 `zh-CN`）；中文语境标点用全角；数字与单位间加空格（「10 MB」）。
- 表单错误、状态变化、toast 进 `aria-live` 区域。

## 感知性能

- 首屏 LCP 元素优先（图片 `fetchpriority=high`、字体子集化）；图片必带宽高或 `aspect-ratio` 防 CLS。
- 骨架屏先于数据出现且同构；搜索输入 debounce 300ms。
- 乐观更新仅限低风险操作（点赞/标记）；资金/删除类必须等服务端确认。
- 无限滚动提供「回到底部」＋位置记忆；路由切换 prefetch＋骨架兜底（<100ms 感知）。

## WCAG 硬指标速查

| 项 | 数字 |
|---|---|
| 对比度·正文 | ≥4.5:1 |
| 对比度·大字（≥24px 或 ≥18.66px bold）/图形 | ≥3:1 |
| 触控目标 | ≥24×24（WCAG 2.5.8 底线）；44×44 体验目标 |
| 重排（reflow） | 320px 宽无横向滚动 |
| 动效 | `prefers-reduced-motion` 降级 |
| 错误识别 | 文字说明，不仅靠颜色 |
| 焦点可见 | 全部可交互元素 focus-visible |
