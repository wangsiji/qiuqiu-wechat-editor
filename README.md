# 秋秋公众号编辑器 · QiuQiu WeChat Editor

把 **Markdown 一键排版成微信公众号文章**：纯内联样式，粘贴进微信后台不丢格式。同一套渲染内核 `lib/`，两种入口——**网页版**在线排版 + **Obsidian 插件**就地排版。

在线体验：<https://wangsiji.github.io/qiuqiu-wechat-editor/>

## 核心思路

**单一渲染内核**（`lib/`），网页版与插件共用。Markdown → 全内联样式的微信公众号 HTML。

- 预览与复制走**同一个渲染管线**，所见即所得
- 只用微信后台**稳定支持的标签**，样式全部写进 `style`，不依赖 class（微信会清 class）
- 本地图片导出时自动转 **base64 内联**，粘贴即显示

## 特性

- **自动编号**：一级标题 → 大数字章节号；二级标题 → `1.1｜` 小节号（检测到手写编号/旧模板时沿用原样式）
- **图片**：支持外链；Obsidian 插件支持本地图（`![[...]]`），竖图自动缩 **75%** 宽；**多图并排滑动**（轮播，默认只显示首张，横图 100% / 竖图 75%）
- **列表**：有序/无序/嵌套列表，缩进、marker 显式内联
- **表格 / 引用 / 代码块**：公众号兼容样式
- **常见防坑**：链接走 `safeUrl` 白名单防 XSS；分隔线不用 `<section>`（微信会误判为未关闭容器）

## 快速开始

```bash
git clone <repo>
npm install

npm run dev     # 网页版：本地打开 http://localhost:3000
npm test        # 渲染内核测试（Node 22+）
npm run lint    # ESLint
```

网页版：左侧写 Markdown，右侧实时预览，点「复制到公众号」→ 去微信后台粘贴。内容自动存 localStorage。

### Obsidian 插件

```bash
cd obsidian-plugin
npm install
npm run build   # 产出 main.js
```

把 `{main.js, manifest.json, styles.css}` 拷到 vault 的
`.obsidian/plugins/qiuqiu-wechat-editor/`，启用后：

- 命令面板 → **秋秋公众号编辑器**
- 当前笔记自动载入预览，随编辑实时刷新；「复制到公众号」一键导出

## 目录结构

```
lib/                    # ★ 共享渲染内核（单一来源，网页 + 插件共用）
  render.ts             # 预览 DOM 渲染（章节号、真 <ul>/<li> 列表等）
  wechat.ts             # 微信导出渲染（全内联 HTML）
  client.ts             # 浏览器端共享工具（竖图检测、富文本复制）
app/                    # 网页版（Vinext）
  page.tsx              # 编辑器交互 + 预览
  qiuqiu.css            # 公众号主题样式
  layout.css            # 编辑器界面布局
obsidian-plugin/        # Obsidian 插件（ItemView 入口，复用 lib/）
  input.ts  manifest.json  styles.css  esbuild.config.mjs
tests/                  # 渲染内核单元测试（*.test.mjs）
.github/workflows/      # CI(test) + Pages 部署 + 插件 release
worker/, vite.config.ts # 运行与部署配置
```

## 开发

- **改渲染逻辑**：改 `lib/`，改一处两边都生效。
- **新增测试**：在 `tests/` 加 `.test.mjs`，`npm test` 覆盖。
- **发布网页**：`npm run build` 后按 `.github/workflows/deploy-pages.yml` 部署到 Pages。
- **插件发版**：`obsidian-plugin` 更新版本号后走 `.github/workflows/release-obsidian-plugin.yml`。

## License

MIT（见 [`LICENSE`](LICENSE)）。