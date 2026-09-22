import test from "node:test";
import assert from "node:assert/strict";
import { render } from "../lib/render.ts";

test("自动章节编号：h1 生成章节数字，h2 生成 1.1｜小节", () => {
  const html = render("# 认识工作台\n\n## 插入图片\n\n## 数据对比\n\n# 第二部分\n");
  assert.match(html, /<div class="article-num"[^>]*>1<\/div>/);
  assert.match(html, /art-secnum[^>]*>1\.1｜<\/span>/);
  assert.match(html, /art-secnum[^>]*>1\.2｜<\/span>/);
  assert.match(html, /<div class="article-num"[^>]*>2<\/div>/);
});

test("无 h1 时 h2 使用两位小节编号 01｜", () => {
  const html = render("## 说明\n## 用法\n");
  assert.match(html, /art-secnum[^>]*>01｜</);
  assert.match(html, /art-secnum[^>]*>02｜</);
});

test("旧模板兼容：手写 1、标题后不再叠加自动编号", () => {
  const html = render("# 1、认识工作台\n## 1.1 插入图片\n# 2、第二部分\n");
  assert.doesNotMatch(html, /article-num/);
  assert.doesNotMatch(html, /art-secnum/);
  assert.match(html, /<h1>1、认识工作台<\/h1>/);
  assert.match(html, /<h2>1\.1 插入图片<\/h2>/);
});

test("h6 章节数字进入旧模板模式", () => {
  const html = render("###### 1\n# 标题\n## 小节\n");
  assert.match(html, /<div class="article-num"[^>]*>1<\/div>/);
  assert.doesNotMatch(html, /art-secnum/);
});

test("基础行内样式", () => {
  const html = render("**重点** 与 *斜体* 与 ~~删~~ 与 `code` 与 [链接](https://a.b)\n");
  assert.match(html, /<strong>重点<\/strong>/);
  assert.match(html, /<em>斜体<\/em>/);
  assert.match(html, /<del>删<\/del>/);
  assert.match(html, /<code>code<\/code>/);
  assert.match(html, /<a href="https:\/\/a\.b">链接<\/a>/);
});

test("表格渲染", () => {
  const md = "| a | b |\n| --- | --- |\n| 1 | 2 |\n";
  const html = render(md);
  assert.match(html, /<table><thead><tr><th>a<\/th><th>b<\/th><\/tr><\/thead>/);
  assert.match(html, /<td>1<\/td><td>2<\/td>/);
});

test("表格单元格内字面竖线被保留，不拆分列", () => {
  const md = "| 功能 | 写法 |\n| --- | --- |\n| 数据表格 | \\`\\| 单元格 \\|\\` |\n";
  const html = render(md);
  // 仍是 2 列
  assert.match(html, /<tr><td>数据表格<\/td><td>.*?单元格/);
  assert.doesNotMatch(html, /<td>数据表格<\/td><td><\/td>/);
});

test("代码块", () => {
  const html = render("```js\nconst a = 1;\n```\n");
  assert.match(html, /<pre><code>const a = 1;<\/code><\/pre>/);
});

test("引用与分割线", () => {
  const html = render("> 引用内容\n\n---\n");
  assert.match(html, /<blockquote><p>引用内容<\/p><\/blockquote>/);
  assert.match(html, /<hr\/>/);
});

test("连续引用行合并为一个引用块", () => {
  const html = render("> 第一行\n> 第二行\n");
  assert.match(html, /<blockquote><p>第一行<\/p><p>第二行<\/p><\/blockquote>/);
  assert.equal((html.match(/<blockquote>/g) || []).length, 1);
});

test("表格支持无首尾竖线写法", () => {
  const html = render("功能|说明\n---|---\n表格测试|第二行\n");
  assert.match(html, /<th>功能<\/th>/);
  assert.match(html, /<th>说明<\/th>/);
  assert.match(html, /<td>表格测试<\/td>/);
  assert.match(html, /<td>第二行<\/td>/);
});

test("嵌套列表保留层级结构", () => {
  const html = render("- 一级 A\n  - 二级 A1\n  - 二级 A2\n- 一级 B\n");
  assert.match(html, /<ul[^>]*><li[^>]*>一级 A<ul[^>]*><li[^>]*>二级 A1<\/li><li[^>]*>二级 A2<\/li><\/ul><\/li><li[^>]*>一级 B<\/li><\/ul>/);
});

test("危险协议链接与图片被安全净化", () => {
  const html = render("[点我](javascript:alert(1)) 和 ![图](data:text/html,<script>alert(1)</script>)\n");
  assert.doesNotMatch(html, /javascript:/i);
  assert.doesNotMatch(html, /onerror/i);
  assert.match(html, /<a href="#">点我<\/a>/);
  assert.match(html, /<img src="#" alt="图"\/>/);
});

test("整篇出现旧模板标记时不再中途切换自动编号", () => {
  const html = render("# 第一章\n## 小节\n# 2、第二章\n");
  assert.doesNotMatch(html, /article-num/);
  assert.doesNotMatch(html, /art-secnum/);
});
