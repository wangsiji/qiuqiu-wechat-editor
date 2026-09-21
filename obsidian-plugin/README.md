# 秋秋公众号编辑器（Obsidian 插件）

把你的 [qiuqiu-wechat-editor](https://github.com/qqhkx2027/qiuqiu-wechat-editor) 网页版打包成 **Obsidian 插件**：在 Obsidian 里左侧编辑 Markdown、右侧「秋秋同款」主题实时预览，一键复制为公众号后台可粘贴的富文本。

排版能力从网页版原封搬来，一行没改：
- `lib/render.ts` → 预览渲染（大数字章节、`1.1｜` 小节号、表格、引用、列表、GIF、代码块）
- `lib/wechat.ts` → 公众号导出渲染（全内联样式、仅用微信稳定标签，不依赖 class）

## 安装（手动，社区市场版可选）

把插件放进 vault：

```bash
# 先构建出 main.js（Node ≥ 18）
npm install && npm run build

# 目标目录：你的 Obsidian vault
mkdir -p ~/path/to/你的vault/.obsidian/plugins/qiuqiu-wechat-editor
cp main.js manifest.json styles.css ~/path/to/你的vault/.obsidian/plugins/qiuqiu-wechat-editor/
```

然后在 Obsidian：**设置 → 第三方插件 → 关闭受限模式 → 启用「秋秋公众号编辑器」**。

## 使用

- **命令面板**：`Cmd/Ctrl+P` → 输入「秋秋公众号编辑器」回车，右侧打开工作台。再次点命令会聚焦已打开的视图。
- **边栏按钮**：左侧边栏出现涂鸦笔图标，点击即打开。
- 编辑区自动保存草稿（`qiuqiu-plugin-draft-v1`）。「复制到公众号」会量好竖图比例后，把**全内联 HTML** 复制到剪贴板，直接粘贴到微信后台即可，外链图会提示你先传到素材库。

## 开发

```
npm run dev    # watch 模式，改 input.ts 自动重打包
npm test       # 构建 + 运行 lib 核心冒烟测试
```

## 打包发布

三件套：`main.js`(已构建) + `manifest.json` + `styles.css`。手动安装只需这三件；想上社区市场需打包 zip + 走 BRAT / 市场审核流程。

## 与网页版的关系

网页版（`qqhkx2027/qiuqiu-wechat-editor`，React/vite）是**独立应用**。本插件复用它全部转换核心逻辑，但用 Obsidian 的 `ItemView` + 原生 DOM 渲染编辑器界面，不含 React。往网页版加的渲染/主题改动，把它 `lib/` 目录同步过来即可（未改动任何解析逻辑）。

## LICENSE

同 `qiuqiu-wechat-editor`，MIT。