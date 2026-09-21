"use client";

import "./qiuqiu.css";
import "./layout.css";
import { useEffect, useMemo, useRef, useState } from "react";

type Theme = readonly [id: string, name: string, accent: string, soft: string];
const themes: Theme[] = [["qiuqiu", "秋秋同款", "#d9898e", "#f8f1f2"]];

const sample = `![工作台示例图](https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80)

# 认识你的 AI 工作台

这是文章导语。Markdown 适合用来快速组织文章结构，再通过主题统一转换成公众号排版。

正文支持 **重点加粗**、*斜体文字*、~~删除线~~、\`行内代码\`，也支持链接：[秋秋编辑器](https://example.com)。

---

## 插入图片

![工作台示例图](https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80)

图片会自动使用主题中的蓝色描边。

---

## 数据对比

| 功能 | 使用方式 | 状态 |
| --- | --- | --- |
| Markdown 编辑 | 左侧输入内容 | 已支持 |
| 实时预览 | 中间自动更新 | 已支持 |
| 主题切换 | 右侧选择主题 | 已支持 |
| 复制公众号 | 点击右上角按钮 | 已支持 |

---

## 为什么需要工作台

一个好的工作台，应该具备：

- 清晰的内容结构
- 稳定的排版风格
- 快速的编辑体验
- 一键复制到公众号

有序列表也可以这样写：

1. 明确文章主题
2. 整理文章结构
3. 添加图片和案例
4. 检查最终排版

---

## 一段引用

> 好的工具，不是功能越多越好，
> 而是刚好适合你的工作方式。

---

## 代码示例

行内代码示例：\`npm run dev\`

\`\`\`javascript
const editor = {
  name: "秋秋公众号编辑器",
  theme: "秋秋粉蓝",
  autoSave: true,
};

console.log(editor.name);
\`\`\`

---

# 第二章节`;

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
