# 秋秋公众号编辑器 · QiuQiu WeChat Editor

**QiuQiu WeChat Editor** turns Markdown into nicely formatted rich text for WeChat Official Account articles, with a live preview and one-click copy to the WeChat editor. It works both as a web app and as an Obsidian plugin, sharing a single render engine (a monorepo: `lib/` is the single source of truth).

Key features: auto chapter numbering, WYSIWYG preview, image inline embedding (base64) for local images, XSS-safe links, and inline `style` attributes so styling survives WeChat's editor sanitizer.

为微信公众号写作打造的 **Markdown → 公众号富文本排版** 工具。同一套渲染内核，两种入口：网页版在线排版 + Obsidian 插件就地排版。

- 网页版：编辑 Markdown，右侧实时预览「秋秋风格」排版，一键复制为公众号兼容 HTML。
- Obsidian 插件：在 Obsidian 里打开 `/obsidian-plugin/` 子目录，当前笔记自动载入预览、随编辑实时刷新，也可复制到公众号。

在线体验：<https://wangsiji.github.io/qiuqiu-wechat-editor/>

## 特性

- **自动编号排版**：一级标题自动生成大数字章节号，二级标题生成「1.1｜」小节号；检测到手写编号或旧模板（h6 大数字）时沿用旧样式。
- **所见即所得**：预览与复制共用同一个 `renderWechat` 渲染管线，编号、图片、样式在预览和粘贴后完全一致。
- **图片支持**：网页版支持外链图片；Obsidian 插件支持本地图（wikilink/相对路径），导出时自动读成 base64 data URI 内联，粘贴到公众号直接显示。
- **微信公众号兼容**：只用微信稳定支持的标签，全部样式显式写进 `style`，不依赖任何 class（微信后台会清 class），竖图自动缩 75% 宽。
- **防 XSS**：链接 URL 一律走 `safeUrl` 白名单，`javascript:`/`data:`（非 image）降级为 `#`。

## 使用

### 网页版

1. `git clone` 本仓库，`npm install && npm run dev`，打开 <http://localhost:3000>。
2. 在左侧粘贴或编写 Markdown，右侧实时预览。
3. 点击「复制到公众号」，再到公众号后台粘贴。

内容自动保存在浏览器 localStorage。

### Obsidian 插件

插件源码在 `obsidian-plugin/`，与网页版共享根 `lib/` 渲染内核（单一来源）。

开发构建：

```bash
cd obsidian-plugin
npm install
npm run build        # 产出 main.js
```

把 `{main.js, manifest.json, styles.css}` 拷到 vault 的 `.obsidian/plugins/qiuqiu-wechat-editor/`，启用插件后通过 ribbon 图标（画笔）或命令「打开秋秋公众号编辑器」进入。

支持本地图片（`![[...]]` / 相对路径），导出时自动内联为 base64，公众号直接显示。

## 支持的 Markdown

- 标题（一级自动章节号、二级自动小节号）
- 段落、加粗、斜体、删除线、行内代码、链接
- 无序/有序列表、任务清单
- 引用、分割线、图片（含竖图 75% 宽）
- 图片画廊式表格、fenced 代码块

## 开发

需要 Node.js 22+。

```bash
npm install
npm run dev      # 网页版
npm test         # 网页版渲染测试
npm run lint     # ESLint
```

Obsidian 插件测试：

```bash
cd obsidian-plugin && npm test
```

## 目录结构

```
lib/                  # 共享渲染内核（网页版 + 插件共用，单一来源）
  render.ts           # 预览 DOM 渲染器
  wechat.ts           # 微信导出渲染器（全内联 HTML）
  client.ts           # 浏览器端共享工具（竖图检测、富文本复制）
app/                   # 网页版（Vinext/Site，Next.js App Router）
  page.tsx             # 编辑器交互 + 预览
  qiuqiu.css           # 公众号主题样式
  layout.css            # 编辑器界面布局
obsidian-plugin/        # Obsidian 插件
  input.ts             # ItemView 入口，复用 lib/ 渲染内核
  manifest.json styles.css esbuild.config.mjs package.json
tests/                 # 渲染内核单元测试（含 .test.mjs）
.github/workflows/     # CI（test）+ Pages 部署
worker/ vite.config.ts next.config.ts  # Vinext/Sites 运行与部署配置
```

## 技术要点

网页版与 Obsidian 插件共享同一套纯 TypeScript 渲染内核（`lib/`），不引入 React 到插件侧：插件直接从 Markdown 生成全内联 HTML，避免依赖浏览器 getComputedStyle 或 Obsidian 的 MarkdownRenderer，保证预览与导出一致、微信后台稳定粘贴。

## License

MIT（见 [`LICENSE`](LICENSE)）。