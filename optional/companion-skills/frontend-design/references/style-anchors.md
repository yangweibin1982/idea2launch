# 风格锚点与参考

> 开工第 2 步「风格方向候选」从这里取材；实现栈选择也在这里。

## 设计体系（数值与规范锚点）

| 体系 | 适用场景 | 入口 |
|---|---|---|
| Material 3 | 通用 Web/安卓；色彩角色与动效 token 最全 | m3.material.io |
| Apple HIG | 触控目标、平台惯例、排印 | developer.apple.com/design |
| Fluent 2 | 微软系、桌面生产力 | fluent2.microsoft.design |
| IBM Carbon | 企业数据密集型；token 治理范本 | carbondesignsystem.com |
| Atlassian DFS | B 端协作工具 | atlassian.design |
| Shopify Polaris | 电商后台 | polaris.shopify.com |
| Ant Design 5 | 中文企业后台事实标准 | ant.design |
| Arco / TDesign | 字节系/腾讯系中文后台 | arco.design · tdesign.tencent.com |

## 参考产品（「像被设计过」的界面）

- **Linear** — 信息密度、克制动效、细边框层级的标杆
- **Stripe Dashboard** — 数据呈现、渐变运用、信任感
- **Vercel Dashboard** — 极简深色、发光边框
- **Notion** — 内容型排版、中性底
- **shadcn/ui 官方示例** — 现代 Web 组件基准
- **Ant Design Pro** — 中文后台布局范式（侧栏+顶栏+卡片流）

## 实现栈默认

- 新项目 Web：**Tailwind CSS + shadcn/ui**（或 Radix primitives）＋ CSS variables token。
- 已有项目：**项目既有组件库优先**（唯一事实），不引入第二套并行体系；在既有 token 上增量扩展。
- 图标：lucide / Tabler（线性）；中后台图表：ECharts / AntV。

## 风格方向库（摊候选时取 2–3）

| 方向 | 关键词 | 字体 | 色彩 | 形状 |
|---|---|---|---|---|
| 极简中性（Linear 式） | 克制、密度、细边框 | Inter/Geist＋系统中文 | 中性灰＋单强调色 | 小圆角 6–8、无阴影 |
| 生动渐变（Stripe 式） | 渐变、光感、信任 | Söhne/Inter | 深底＋多色渐变点缀 | 中圆角 8–12 |
| 密度企业（Ant Pro 式） | 高效、表格、秩序 | 系统栈 | 白底＋品牌蓝 | 圆角 4–6、明确边框 |
| 编辑排版（内容型） | 大标题、衬线、留白 | 衬线标题＋无衬线正文 | 纸白＋墨黑＋单点缀 | 锐角或大圆角、无阴影 |
| 深色优先（Vercel 式） | 深灰、发光边、高对比 | Geist/Inter | #0a0a0a 底＋高亮白 | 圆角 8–12、1px 边框 |
| 圆润亲和（C 端工具） | 柔和、大目标、插画 | Manrope/圆体 | 柔和多彩 | 大圆角 16+、软阴影 |

**选向纪律**：一次任务锁定一个方向不混搭；连续两次任务不重复同一方向；用户已有品牌时从品牌推导，不从库里挑。
