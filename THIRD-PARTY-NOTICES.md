# 第三方素材声明（Third-party notices）

本仓库自有内容以 MIT 许可发布（见 [`LICENSE`](LICENSE)）。下列素材**不在本项目著作权范围内**，按各自上游许可随包分发；此处保留其署名、条件清单与免责声明原文。

## GrapesJS —— 第 3 阶段可视化编辑器的内核

| 项 | 值 |
|---|---|
| 上游 | GrapesJS · https://github.com/GrapesJS/grapesjs |
| 版本 | 0.23.6 |
| 许可 | **BSD-3-Clause**（`Copyright (c) 2017-current, Artur Arseniev`） |
| 许可原文 | [`modules/ui-spec/visual-editor/lib/LICENSE-grapesjs.txt`](modules/ui-spec/visual-editor/lib/LICENSE-grapesjs.txt) |
| 随包文件 | `lib/grapes.min.js`（1,151,347 B，首行 `/*! grapesjs - 0.23.6 */`）、`lib/grapes.min.css`（61,053 B） |
| 取物出处 | `https://registry.npmjs.org/grapesjs/-/grapesjs-0.23.6.tgz` — 上游 `dist.shasum` = `29c0deb14faa73366c9f507a1c14edc1a8bf55ec`，本侧 2026-10-15 下载后 `sha1sum` 逐字对上 |
| 原文取法 | 许可正文**逐字节复制**自该发布物内 `package/LICENSE`（sha1 `e8ce1017bd7f00df69b08367f9626f40075b47d3`，两份一致），非人工转写 |

### 该发布物声明的运行时依赖

`grapes.min.js` / `grapes.min.css` 是上游自己的打包产物，内含下列依赖的编译结果。许可标识一律取各包 npm `license` 字段（2026-10-15 实测读数），未凭记忆填写：

| 依赖 | 版本 | 许可 | 上游 |
|---|---|---|---|
| backbone | 1.4.1 | MIT | https://github.com/jashkenas/backbone |
| underscore | 1.13.8 | MIT | https://github.com/jashkenas/underscore |
| backbone-undo | 0.2.6 | MIT | https://github.com/osartun/Backbone.Undo.js |
| codemirror | 5.63.0 | MIT | https://github.com/codemirror/CodeMirror |
| codemirror-formatting | 1.0.0 | MIT | https://github.com/artf/codemirror-formatting |
| html-entities | 1.4.0 | MIT | https://github.com/mdevils/node-html-entities |
| promise-polyfill | 8.3.0 | MIT | https://github.com/taylorhakes/promise-polyfill |

> 内含性取证（同仓文件内 grep 计数，2026-10-15）：`CodeMirror`/`codemirror` 在 `grapes.min.js` 命中 64 次、在 `grapes.min.css` 为该文件首个选择器；`Backbone`/`backbone` 命中 4 次。`underscore`／`html-entities`／`promise-polyfill` 的字样被压缩掉、grep 取不到，按其属于该发布物声明的运行时依赖一并列出（backbone 1.4.1 本身依赖 underscore）。`@types/backbone@1.4.15` 为 TypeScript 类型声明，不进浏览器包，故不在此列。

## 其它随包内容

- `docs/img/*.png` 三张截图、`modules/ui-spec/visual-editor/test/out/tiny.png`（70 B 测试夹具）、以及 `core/`／`modules/`／`shells/` 全部 markdown 与脚本，均为本项目自有内容，不含第三方素材。
- 本仓库**不**随包分发任何字体文件。
- 插件最终用户的项目里若引入了第三方素材，声明责任在该项目自身——工序上的对应要求见 [`core/references/stages/stage-8-delivery.md`](core/references/stages/stage-8-delivery.md) 与 [`core/references/disciplines/engineering.md`](core/references/disciplines/engineering.md)。
