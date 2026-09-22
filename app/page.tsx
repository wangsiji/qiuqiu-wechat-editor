"use client";

import "./qiuqiu.css";
import "./layout.css";
import { useEffect, useMemo, useRef, useState } from "react";

type Theme = readonly [id: string, name: string, accent: string, soft: string];
const themes: Theme[] = [["qiuqiu", "秋秋同款", "#d9898e", "#f8f1f2"]];

const sample = `![文章头图：公众号排版工作台](https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80)

# 公众号排版全要素示例

这是一段**导语**。紧跟 \`# \` 大标题之后的第一段会自动套用导语样式——字距收紧、段落间距更贴大标题。用它来写文章的一句话钩子，比正文主体更抓眼球。

正文段落会两端对齐，行高 1.85、字号 17px，适合手机阅读。文字可以**加粗强调**、*斜体标注*、~~删除线表示已过时~~，还能混排\`行内代码\`（青绿底）和链接：[点我看秋秋编辑器](https://wangsiji.github.io/qiuqiu-wechat-editor/)。

---

## 正文里的图片

图片单独成行时自动通栏并带蓝色描边，居中排布：

![示意图：排版流程](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80)

如果图片是竖图（高大于宽），会按公众号惯例缩到 75% 宽居中，避免长图在手机上过高。图片也可以嵌在段落里当行内图：![inline](https://images.unsplash.com/photo-1521931961826-fe48677230a5?w=400&q=80) 这样随文字流动。

---

## 数据表格

| 功能 | 写法 | 状态 |
| --- | --- | --- |
| 大章节标题 | \`# 标题\` | 自动编号 + 居中 |
| 小节标题 | \`## 标题\` | 蓝色 + 序号前缀 |
| 数据表格 | \`\\| 单元格 \\|\` | 画廊风格 |
| 引用快讯 | \`> 内容\` | 黄底金线 |
| 信息提示条 | \`> [!note]\` | 蓝底蓝线 |

---

## 列表

无序列表和有序列表都支持，还能多级缩进：

- 三级标题 \`### 小节\` 是更细的结构层级
- 列表项里的**强调**、*斜体*、\`代码\`、[链接](https://example.com) 都能内联渲染
- 嵌套用两空格缩进：
  - 外层：两级子项
    - 内层：三级子项
- 每项一个段落，微信后台粘贴不出乱码

有序列表换个图标：

1. 先明确文章要传达的关键信息
2. 再用 \`# / ## / ###\` 勾出结构骨架
3. 最后补图片、表格、引用和代码
4. 点击右上角「复制到公众号」一键完成

---

## 引用与提示条

> 这是引用块：浅黄底 + 金色左竖线，适合放「摘要」或「强调某段观点」。连续几行都写 \`>\` 会合成一整块。

> [!note] 信息提示
> Callout 用 \`> [!note] 标题\` 开头，正文写在下几行。视觉上是浅蓝底 + 蓝色左线，标题行蓝字加粗。适合放「工具提示」「重点解释」这类信息。

> [!warning] 特别注意
> warning 类型会显示不同的标题文字。可用的类型有 note / tip / warning / info / important / success / question / example / danger / caution / quote，都用同一个蓝底信息条承载。

---

## 代码块

行内代码、代码块都能用。代码块深色底 + 等宽字体，自动换行：

\`\`\`javascript
const editor = {
  name: "秋秋公众号排版",
  support: ["封面图", "章节编号", "表格", "引用", "Callout", "代码块"],
};
console.log(editor.support.length); // 16
\`\`\`

---

## 分隔线

分隔线用 \`---\`，是一段居中的细细蓝色短线，用于不设小标题时的内容分节。它不依赖任何容器，粘贴进公众号不会触发拆行。

---

# 排版参数速查

上面演示了每种写法长什么样，下面这张表把每种元素的**字号、字重、颜色、行高**列清楚——它不是示例文案，而是当前这套排版内核实际用的数值（完整定义见代码里 \`lib/wechat.ts\` 的常量）。

| 元素 | 写法 | 字号 | 字重 | 颜色 | 行高 |
| --- | --- | --- | --- | --- | --- |
| 正文段落 | 直接写 | 17px | 默认 | #333333 | 31px |
| 导语（紧跟 \`#\` 标题） | 第一段 | 17px | 默认 | #333333 | 31px |
| 章节数字 | \`# 标题\` | 60px | 700 | #D9898E 粉 | 66px |
| 章节标题 | \`# 标题\` | 19px | 800 | #D9898E 粉 | 28px |
| 小节标题 | \`## 标题\` | 17px | 800 | #3A8BE8 蓝 | 27px |
| 三级小节 | \`### 标题\` | 16px | 700 | #3A8BE8 蓝 | 23px |
| 列表项 | \`- /\`\`1.\` | 16px | 默认 | #333333 | 30px |
| 表格表头 | 表首行 | 14px | 800 | #5C7D9B 灰蓝 | 23px |
| 表格正文 | 表 | 13px | 400 | #333333 | 21px |
| 引用快讯 | \`> 内容\` | 15px | 默认 | #333333 | 28px |
| 提示条 | \`> [!type]\` | 15px | 标题700 | #3A8BE8 蓝 | 1.6 |
| 行内代码 | \`代码\` | 0.88em | 默认 | #12A98D 青 | 1.5 |
| 代码块 | \`\`\` 代码 \`\`\` | 13px | 400 | #E8EEF5 浅字/深底 | 21px |
| 链接 | [文字](网址) | 随段 | 500 | #16B99A 绿 | — |
| 删除线 | \`~~文字~~\` | 随段 | 默认 | #3A8BE8 蓝 | — |

**配色速记**：正文字灰 #333、一二三级标题为粉 #D9898E → 蓝 #3A8BE8 递进；强调与链接用青绿 #16B99A；行内代码青底 #12A98D / 浅青底 #F1FAF8；代码块深色 #171A1F；引用金黄 #DB7A0E + 浅黄底 #FEF9EA；提示条蓝 #3A8BE8 + 浅蓝底 #F6FAFE；表格表头灰蓝 #5C7D9B + 米白底。

---

# 关于这份示例

上面把 7 大类能力 + \`排版参数速查\` 都过了一遍：**章节与导语、正文图片与竖图、数据表格、有序/无序/嵌套列表、引用与 Callout 提示条、行内代码与代码块、分隔线**。想改字号或颜色，直接编辑 \`lib/wechat.ts\` 里对应的常量（正文 \`BODY\`、章节 \`chapter()\`、小节 \`section()\`、列表 \`LIST_LI\`、表格 \`tableHtml()\`、代码 \`codeHtml()\`、引用 \`QUOTE_LINE\`、提示条 \`CALLOUT_*\`、链接 \`LINK_STYLE\` 等），保存后预览与复制到公众号都会同步生效。`;

import { render } from "../lib/render";
import { renderWechat } from "../lib/wechat";
import { copyRichText, detectPortrait, imageSrcs, isPortrait } from "../lib/client";

// 旧默认示例内容特征：带手写编号“# 1、”。检测到这类历史草稿时重置为新示例，
// 避免用户看到旧模板排版；用户自己写的正文（不含该特征）不受影响。
const OLD_SAMPLE_MARKER = "# 1、认识你的 AI 工作台";

export default function Home() {
  const [md, setMd] = useState(() => {
    if (typeof window === "undefined") return sample;
    const draft = localStorage.getItem("qiuqiu-draft-v2");
    if (draft && !draft.includes(OLD_SAMPLE_MARKER)) return draft;
    return sample;
  });
  const [tid, setTid] = useState("qiuqiu");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [notice, setNotice] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const theme = themes.find((item) => item[0] === tid) || themes[0];
  const html = useMemo(() => render(md), [md]);

  useEffect(() => {
    const timer = window.setTimeout(() => localStorage.setItem("qiuqiu-draft-v2", md), 300);
    return () => window.clearTimeout(timer);
  }, [md]);

  // 竖图（高 > 宽）在预览里也按 75% 宽显示，与复制到公众号的效果保持一致。
  useEffect(() => {
    const paper = document.querySelector<HTMLElement>(".article-paper");
    if (!paper) return;
    let cancelled = false;
    const apply = (img: HTMLImageElement) => {
      if (cancelled || !isPortrait(img)) return;
      // 竖图按公众号规范缩 75% 宽：走 CSS 类（Obsidian 审核禁内联 style）
      img.classList.add("qwe-portrait");
    };
    for (const img of Array.from(paper.querySelectorAll<HTMLImageElement>("img"))) {
      if (img.complete) apply(img);
      else img.addEventListener("load", () => apply(img), { once: true });
    }
    return () => {
      cancelled = true;
    };
  }, [html]);

  const add = (text: string) => {
    const editor = ref.current;
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    setMd(md.slice(0, start) + text + md.slice(end));
  };
  const copy = async () => {
    // 微信导出：直接从 Markdown 生成全内联 HTML（不用 getComputedStyle 抄预览样式，
    // 避免微信后台清洗预览 DOM 导致样式漂移，见网页版 GPT 评审）
    // 竖图比例只有浏览器知道，复制前先量一次；图片多已在预览里缓存，很快。
    const portrait = await detectPortrait(imageSrcs(md));
    const copyHtml = renderWechat(md, { portrait });
    // 外链图片计数直接解析导出 HTML，避免预览与导出两个 DOM 不一致
    const externalImages = (copyHtml.match(/<img[^>]+src="https?:/g) || []).length;
    try {
      await copyRichText(copyHtml);
      setCopyStatus("copied");
      setNotice(externalImages ? `已复制；${externalImages} 张外链图片可能需要先上传到公众号素材库` : "已复制富文本，可直接粘贴到公众号");
    } catch {
      setCopyStatus("error");
      setNotice("复制富文本失败，请使用最新版 Chrome 或 Safari");
    }
    window.setTimeout(() => setCopyStatus("idle"), 1800);
  };

  return <main className="editor-shell">
    <header className="topbar">
      <div className="brand-lockup"><div className="brand-mark">秋</div><div><div className="brand-name">秋秋编辑器</div><div className="brand-subtitle">公众号 Markdown 排版工作台</div></div></div>
      <div className="top-actions"><span className="copy-notice" style={{ maxWidth: 300, overflow: "hidden", color: "#718296", fontSize: 10, textOverflow: "ellipsis", whiteSpace: "nowrap" }} aria-live="polite">{notice}</span><button className="quiet-button" onClick={() => setMd(sample)} aria-label="恢复示例 Markdown">恢复示例</button><button className="quiet-button" onClick={() => file.current?.click()} aria-label="导入 Markdown 文件">导入 Markdown</button><input ref={file} hidden type="file" accept=".md,.markdown,.txt" aria-label="Markdown 文件" onChange={async (event) => { const selected = event.target.files?.[0]; if (selected) setMd(await selected.text()); }} /><button className="copy-button" onClick={copy} aria-label="复制排版后的内容到公众号">{copyStatus === "copied" ? "已复制 ✓" : copyStatus === "error" ? "复制失败" : "复制到公众号"}</button></div>
    </header>
    <section className="workspace">
      <aside className="editor-panel"><div className="panel-heading"><div><span className="eyebrow">WRITE</span><h1>Markdown 草稿</h1></div><span className="save-dot">已自动保存</span></div><div className="toolbar" aria-label="Markdown 工具栏"><button onClick={() => add("**重点文字**")} aria-label="插入加粗文本" title="加粗">B</button><button onClick={() => add("# 一级标题\n\n")} aria-label="插入一级标题" title="一级标题">H1</button><button onClick={() => add("> 引用\n")} aria-label="插入引用" title="引用">❞</button><button onClick={() => add("- 列表项\n")} aria-label="插入无序列表" title="无序列表">☷</button></div><textarea ref={ref} className="markdown-editor" value={md} onChange={(event) => setMd(event.target.value)} spellCheck={false} aria-label="Markdown 草稿编辑区" /><div className="editor-footer"><span>{md.length} 字符</span><span>实时预览</span></div></aside>
      <section className="preview-panel"><div className="preview-heading"><div><span className="eyebrow">PREVIEW</span><h2>公众号预览</h2></div><span className="preview-status"><i />实时同步</span></div><div className="preview-stage"><article className="article-paper" style={{ "--accent": theme[2], "--soft": theme[3] } as React.CSSProperties} dangerouslySetInnerHTML={{ __html: html }} /></div></section>
      <aside className="theme-panel"><div className="panel-heading compact"><div><span className="eyebrow">THEME</span><h2>主题</h2></div></div>{themes.map((item) => <button key={item[0]} className={`theme-card ${item[0] === tid ? "selected" : ""}`} onClick={() => setTid(item[0])} aria-pressed={item[0] === tid} aria-label={`选择主题：${item[1]}`}><span className="theme-swatch" style={{ background: item[2] }} /><span><strong>{item[1]}</strong><small>当前可用主题</small></span><b>{item[0] === tid ? "✓" : ""}</b></button>)}<div className="theme-note">✦ 更多主题开发中<br /><small>后续可添加 AI、读书和生活方式主题。</small></div></aside>
    </section>
  </main>;
}
