# 组件细节清单

> 每个可交互组件的必备细节。实现与自检逐条对照。通用状态矩阵适用一切组件。

## 通用状态矩阵（五态＋数据面三态）

| 状态 | 必备细节 |
|---|---|
| default | 基线外观 |
| hover | 背景/亮度变化 2–8%；有 hover 必有 cursor 变化 |
| active | 比 hover 深一档（按压 0.96–0.98 scale 或再加深） |
| focus-visible | 2px 焦点环＋2px offset，颜色 ≥3:1；Tab 能走完全部可交互元素 |
| disabled | 透明度降至 40–50%＋`cursor: not-allowed`；保留 aria/title 说明原因 |
| loading | 按钮内联 spinner＋文案变化（「保存中…」）；禁用全页遮罩替代按钮态 |
| empty（数据面） | 图标/插画＋一句话＋主行动按钮；禁裸空白 |
| error（数据面） | 错误说明＋重试按钮；**区分「无数据」与「加载失败」两种空态** |

## 按钮

- 层级四级：primary（一屏一个）/ secondary / ghost / danger；同级场景样式统一。
- 高度 32/36/40（sm/md/lg），左右 padding ≥16px；危险操作红色但不用 primary 形态。
- 点击后立即禁用或进 loading 防双击；异步提交必有 loading 态与失败恢复路径。
- 图标按钮必配 `aria-label`；图标＋文字按钮图标在文字左侧。

## 表单

- label 常显，**禁 placeholder 代替 label**；必填标记全站统一（`*` 或反向「（选填）」）。
- 校验时机：blur 后或提交时，禁每键触发；错误信息紧贴字段下方＋`aria-describedby`，红色 ≥4.5:1 且配图标（色盲可用）。
- 约束前置：maxlength＋计数、格式掩码（电话/卡号）、`autocomplete` 属性正确（email/name/tel…）。
- 密码框配可见性切换；上传框显示格式/大小限制与进度。
- 提交失败**保留用户全部输入**（零容忍清空）。

## 表格 / 数据列表

- 表头 sticky；数字列右对齐 tabular-nums；状态用色点/badge 不用长文字。
- 截断显式：单行 ellipsis＋tooltip、多行 line-clamp；列宽 minmax 防挤压。
- loading（骨架行数≈真实数据）/ empty / error 三态齐全；行 hover 高亮；可点行整行可点。
- 批量操作条选中后浮现；排序箭头指示当前方向。

## 浮层（modal / drawer / popover / dropdown）

- modal：焦点陷阱、Esc 关闭、关闭后焦点归还、标题与关闭按钮常显；表单类慎用遮罩点击关闭（防误丢输入）。
- drawer：从操作来源方向滑出；焦点纪律同 modal。
- dropdown：上下键＋Enter 导航、typeahead 即搜、选中项打勾。
- tooltip：hover 延迟 300–500ms 出现、即离即隐；**tooltip 内不放关键操作**（不可点击）。

## 反馈（toast / notification / 进度）

- toast：顶部居中或右上堆叠，3–5s 自动消失＋手动关闭；success/error/info 分色；`aria-live=polite`（error 用 assertive）。
- 低风险操作反馈优先「原地变化＋可撤销 toast」而非确认弹窗；危险操作用「输入名称确认」或二次确认弹窗，**禁原生 alert/confirm**。
- 长任务：确定性进度条 > 不确定 spinner；>10s 给剩余时间或可后台化。

## 导航与骨架

- tabs：当前项下划线/背景明确，左右键可切换；面包屑层级可回跳。
- 分页附总数（「共 128 条」）；骨架屏结构与真实内容同构（头图块/文本行/按钮位），微光动画克制。
- 空状态文案给「下一步」而非道歉；错误页给重试＋回首页双出口。
