# 秋秋公众号编辑器 · Obsidian 插件

把 **Markdown 一键排版成微信公众号文章**，直接在 Obsidian 里完成。当前笔记自动载入预览，随编辑实时刷新，「复制到公众号」一键导出纯内联 HTML。

排版内核与网页版**共享同一套 `lib/`**（单一来源）：`render.ts` 预览渲染、`wechat.ts` 公众号导出、`client.ts` 竖图检测 / 富文本复制。预览与复制走同一 `renderWechat` 管线，所见即所得。

## 特性

- 自动章节号（一级 → 大数字、二级 → `1.1｜`）、表格、引用、代码块
- **图片**：本地图（`![[...]]` / 相对路径）导出自动转 **base64 内联**，公众号直接显示；竖图自动缩 75% 宽
- **多图并排滑动**：连续多张图自动合成滚动画廊，默认只显示首张（横图 100% / 竖图 75%）
- **列表**：嵌套有序 / 无序列表，缩进与 marker 显式内联
- 全内联样式，不依赖 class，微信后台稳定粘贴

## 安装

手动安装到 vault（插件尚未上社区市场）：

```bash
cd obsidian-plugin
npm install && npm run build         # 产出 main.js（Node ≥ 22）

# 拷到你自己的 vault 目录
mkdir -p ~/你的vault/.obsidian/plugins/qiuqiu-wechat-editor
cp main.js manifest.json styles.css ~/你的vault/.obsidian/plugins/qiuqiu-wechat-editor/
```

然后 Obsidian：**设置 → 第三方插件 → 关闭受限模式 → 启用「秋秋公众号编辑器」**。

> `.gitignore` 已排除 `main.js` / `node_modules`（同 vault 规则，三件套不上传），需要时按上面命令构建。

## 使用

- **打开**：`Cmd/Ctrl+P` → 输入「秋秋公众号编辑器」；或点左侧边栏画笔图标
- 打开后**自动载入当前笔记**，编辑保存实时刷新预览
- **滚动联动**：滚动笔记时预览按比例同步
- **复制到公众号**：点按钮 → 全内联 HTML 进剪贴板 → 去微信后台粘贴。外链图提示先传素材库，本地图自动 base64 内联

## 开发

```bash
cd obsidian-plugin
npm install
npm run build   # 打包 main.js
npm run dev     # watch 模式，改 input.ts 自动重打包
npm test        # lib 渲染内核冒烟测试
```

## 与网页版的关系

`obsidian-plugin/` 与 `app/` 同属一个 monorepo，共用根 `lib/` 渲染内核。改 `lib/` 一处，网页版与插件同时生效。插件用 Obsidian `ItemView` + 原生 DOM 渲染界面，不含 React。

## LICENSE

同 `qiuqiu-wechat-editor`，MIT。