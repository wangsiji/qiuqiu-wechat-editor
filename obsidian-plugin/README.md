# 秋秋公众号编辑器 · Obsidian 插件

把 [qiuqiu-wechat-editor](https://github.com/wangsiji/qiuqiu-wechat-editor)（monorepo）网页版的公众号排版内核打包成 **Obsidian 插件**：打开插件，当前笔记自动载入并实时渲染「秋秋风格」预览，一键复制为公众号后台可粘贴的富文本。

排版能力与网页版**共享同一套 `lib/` 渲染内核**（单一来源）：

- `lib/render.ts` → 预览 DOM 渲染（大数字章节、`1.1｜` 小节号、表格、引用、列表、代码块）
- `lib/wechat.ts` → 公众号导出渲染（全内联样式、仅用微信稳定标签，不依赖 class）
- `lib/client.ts` → 浏览器端共享工具（竖图检测、富文本复制）

## 安装

本插件目前通过**手动安装**到 vault：

```bash
# 先构建出 main.js（Node ≥ 18）
cd obsidian-plugin
npm install && npm run build

# 目标目录：你的 Obsidian vault
mkdir -p ~/path/to/你的vault/.obsidian/plugins/qiuqiu-wechat-editor
cp main.js manifest.json styles.css ~/path/to/你的vault/.obsidian/plugins/qiuqiu-wechat-editor/
```

然后在 Obsidian：**设置 → 第三方插件 → 关闭受限模式 → 启用「秋秋公众号编辑器」**。

> 注意：本仓库将 `obsidian-plugin/main.js`、`node_modules` 加入了 `.gitignore`（同 vault 规则），三件套不上传，按需构建。

## 使用

- **命令面板**：`Cmd/Ctrl+P` → 输入「秋秋公众号编辑器」回车。
- **边栏按钮**：左侧边栏出现画笔图标，点击即打开。
- 打开视图后**自动载入当前笔记**，随编辑实时同步（`modify` 事件触发重渲染）。
- **滚动联动**：滚动 Obsidian 笔记时，预览按比例同步滚动。
- 点「复制到公众号」：量好竖图比例后，把**全内联 HTML** 复制到剪贴板；外链图会提示先传素材库，本地图（`![[…]]`/相对路径）自动转 base64 内联。

## 开发

```bash
cd obsidian-plugin
npm install
npm run build   # 打包 main.js
npm run dev     # watch 模式，改 input.ts 自动重打包
npm test        # lib 内核冒烟测试
```

## 与网页版的关系

同属一个 monorepo，`obsidian-plugin/` 与 `app/` 共用根 `lib/` 渲染内核，修改任何一处都会同步影响两者（单一来源）。插件用 Obsidian 的 `ItemView` + 原生 DOM 渲染编辑器界面，不含 React —— 预览与复制都走同一 `renderWechat` 管线，保证所见即所得。

## LICENSE

同 `qiuqiu-wechat-editor`，MIT。