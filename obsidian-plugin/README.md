<p align="center">

# 秋秋公众号编辑器 · Obsidian 插件

**把 Obsidian 笔记一键排版成公众号文章，随写随渲、所见即所得。**

自动章节号 · 本地图自动内联 · 多图滑动相册 · 嵌套列表 —— 全内联样式，粘贴微信后台不丢格式。

Monorepo 共享单一渲染内核：`obsidian-plugin/` 与 web 工作台同源。

</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%E2%89%A522-339933?logo=nodedotjs&logoColor=white" alt="node"/>
  <img src="https://img.shields.io/badge/monorepo-lib%20%E5%8D%95%E4%B8%80%E6%BA%90-tomato" alt="monorepo"/>
</p>

---

**为什么需要它？** 公众号后台排版费时、字体颜色全靠手工，粘贴还丢样式。本插件把你的 Obsidian 笔记**原地渲染**成一套排版好的公众号稿子，本地图自动转 base64、竖图自动 75%、列表缩进、章节编号全自动，点一下**复制**就是一份能直接发的公众号排版。样样直描进 `style`，微信后台带不走。

---

## 核心能力

- **自动章节号**：一级标题 → 大数字章节 + 居中；二级标题 → 蓝色小节 + `1.1｜` 编号；识别到手写编号沿用原样式。
- **图片自适应**：单图通栏；**竖图自动缩 75% 宽**；连续多行图自动并成**可滑动的相册条**（默认首张，横 100% / 竖 75%）。
- **图片导出**：本地图（`![[...]]` / 相对路径）自动转 **base64 内联**，公众号后台直接显示、不裂图；外链图提示手动传素材库。
- **所见即所得**：预览与「复制到公众号」共用同一个 `renderWechat` —— 你看见什么，微信就长什么样。
- **稳定兼容**：只用微信稳定标签，样式写进 `style` 不依赖 class；链接 URL 白名单防 XSS；分隔线不用 `<section>`（微信会误判容器）。

## 安装

手动安装（尚未来社区市场）：

```bash
cd obsidian-plugin
npm install && npm run build         # 产出 main.js（Node ≥ 22）

# 拷到你自己的 vault
mkdir -p ~/你的vault/.obsidian/plugins/qiuqiu-wechat-editor
cp main.js manifest.json styles.css ~/你的vault/.obsidian/plugins/qiuqiu-wechat-editor/
```

然后 Obsidian：**设置 → 第三方插件 → 关闭受限模式 → 启用「秋秋公众号编辑器」**。

> `.gitignore` 已排除 `obsidian-plugin/main.js`、`node_modules`（同 vault 规则，三件套不上传），需要时按上面命令自行构建。

---

## 使用

- **打开**：`Cmd/Ctrl+P` → **「秋秋编辑器」**，或点左侧栏**画笔图标**。
- 打开后**自动载入当前笔记**，编辑保存实时刷新预览。
- **滚动联动**：滚动 Obsidian 笔记时，预览按同比例同步滚动。
- **复制到公众号**：点按钮 → 全内联 HTML 进剪贴板 → 回公众号后台粘贴。外链图提示先传素材库；本地图已自动 base64 内嵌。

---

## 架构

插件复用 monorepo 根 `lib/` 渲染内核（与 web 版完全同源，改动一端同时生效）：

```
lib/                  ← 唯一渲染内核（网页 + 插件共用）
  render.ts           预览 DOM 渲染（真 <ul>/<ol>、章节、表格、轮播）
  wechat.ts           公众号导出（全内联 HTML，只依赖微信稳定标签）
  client.ts          浏览器侧工具（竖图检测、富文本复制）
      │
      └── obsidian-plugin/input.ts ← ItemView 入口，复用同一个 lib/
            预览 + 复制 = 同一条 renderWechat 管线（所见即所得）
```

插件用 Obsidian `ItemView` + 原生 DOM 渲染界面，**不含 React**，轻量且不与 Obsidian 冲突。

---

## 开发

```bash
cd obsidian-plugin
npm install
npm run build        # 打包 main.js 到 obsidian-plugin/
npm run dev          # watch 模式，改 input.ts 自动重打包
npm test             # lib 渲染内核冒烟
```

改 `lib/` 一处，网页版与插件同时更新；改动需要新 `tests/` 测试。

---

## License

同 `qiuqiu-wechat-editor`，MIT。