// 公众号 Markdown 渲染器：与 WeChat-Theme.css.md 主题保持一致的自动编号
// - h1 -> 大数字章节；h2 -> 1.1｜/01｜ 小节前缀；检测到手写编号或 h6 后整篇进入旧模板
// - 响应网页版 GPT 评审的增强项：
//   嵌套列表保留层级（递归渲染）、表格兼容无首尾竖线、连续引用行合并为一个引用块、
//   危险 URL 协议全部降级为 #、编号模式改为全文预扫描，渲染过程不中途切换。

export const escapeHtml = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

// 仅允许 http/https、相对路径（./ ../ /）、纯锚点 #；其余（javascript: data: vbscript: 等）降级为 "#"
export const safeUrl = (url: string) => {
  const trimmed = url.trim();
  return /^(https?:|\.{0,2}\/|#)/i.test(trimmed) ? trimmed : "#";
};

export const inline = (s: string) =>
  escapeHtml(s)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt: string, src: string) => '<img src="' + safeUrl(src) + '" alt="' + alt + '"/>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(
      /(^|[\s(])\[([ xX])\](?=\s|$)/g,
      (_, prefix: string, state: string) =>
        prefix +
        '<span class="task-check ' +
        (state.toLowerCase() === "x" ? "done" : "") +
        '">[' +
        state +
        ']</span>',
    )
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/~~([^~]+)~~/g, "<del>$1</del>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label: string, href: string) => '<a href="' + safeUrl(href) + '">' + label + "</a>");

// 旧模板：h6 章节数字（### 及更低不自动编号）
const LEGACY_H6 = /^#{6}\s+(\d+)$/;
// 手写编号：1、1.1 1. 02（顿号/点、点句号/全角/冒号后允许无空格）
export const HAND_NUM = /^\s*(\d+(?:\.\d+)?)\s*[、.．)）（：]\s*(.+)$/;

const numStyle =
  "display:block;margin:20px auto 10px;color:#D9898E;" +
  "font-family:'Times New Roman',Times,'Songti SC',serif;font-size:60px;font-weight:700;" +
  "line-height:1;font-variant-numeric:lining-nums tabular-nums;" +
  "font-feature-settings:'lnum' 1,'tnum' 1;letter-spacing:-1px;text-align:center;white-space:nowrap;";

const chapterDiv = (num: number) =>
  '<div class="article-num" style="' + numStyle + '">' + num + '</div>';

const sectionPrefix = (chapter: number, section: number) =>
  '<span class="art-secnum" style="display:inline-block;font-weight:800;color:#3A8BE8;margin-right:.2em;">'
  + (chapter > 0 ? chapter + "." + section + "｜" : String(section).padStart(2, "0") + "｜")
  + '</span>';

function detectLegacy(lines: string[]): boolean {
  for (const line of lines) {
    if (LEGACY_H6.test(line)) return true;
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading && heading[1].length <= 2 && HAND_NUM.test(heading[2])) return true;
  }
  return false;
}

type ListRow = { depth: number; tag: "ul" | "ol"; text: string };

function renderListBlock(rows: ListRow[], start: number, parentDepth: number): { html: string; next: number } {
  if (start >= rows.length || rows[start].depth <= parentDepth) return { html: "", next: start };
  const first = rows[start];
  const tag = first.tag;
  let out = "<" + tag + ' style="margin:0;padding-left:1.45rem;">';
  let i = start;
  while (i < rows.length && rows[i].depth === first.depth) {
    const row = rows[i];
    i += 1;
    out += '<li style="margin:6px 0;text-align:left;">' + inline(row.text);
    if (i < rows.length && rows[i].depth > row.depth) {
      const child = renderListBlock(rows, i, row.depth);
      out += child.html;
      i = child.next;
    }
    out += "</li>";
  }
  return { html: out + "</" + tag + ">", next: i };
}

export function render(md: string): string {
  const lines = md.split(/\r?\n/);
  const legacy = detectLegacy(lines);

  let html = "";
  let paragraph: string[] = [];
  let listRows: ListRow[] = [];
  let codeBlock: string[] | null = null;
  let quote: string[] = [];
  let chapter = 0;
  let section = 0;

  const buildList = () => {
    if (listRows.length) {
      const { html: h } = renderListBlock(listRows, 0, -1);
      html += h;
      listRows = [];
    }
  };
  const flush = () => {
    if (paragraph.length) {
      html += "<p>" + inline(paragraph.join(" ")) + "</p>";
      paragraph = [];
    }
    if (quote.length) {
      html += "<blockquote>" + quote.map((q) => "<p>" + inline(q) + "</p>").join("") + "</blockquote>";
      quote = [];
    }
    buildList();
  };
  const renderTable = (rows: string[]) => {
    const clean = (row: string) => row.replace(/^\s*\|?/, "").replace(/\|?\s*$/, "");
    const cellsOf = (row: string) =>
      clean(row).split(/(?<!\\)\|/).map((c) => c.replace(/\\\|/g, "|")); // ponytail: 仅按未转义 | 分列; `\|` 保留字面竖线
    const head = cellsOf(rows[0]);
    const body = rows.slice(2).map((row) => {
      const cells = cellsOf(row).map((cell) => "<td>" + inline(cell.trim()) + "</td>").join("");
      return "<tr>" + cells + "</tr>";
    });
    return ("<table><thead><tr>" +
      head.map((cell) => "<th>" + inline(cell.trim()) + "</th>").join("") +
      "</tr></thead><tbody>" + body.join("") + "</tbody></table>");
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const fence = line.match(/^\s*```(.*)$/);
    if (codeBlock) {
      if (fence) {
        html += "<pre><code>" + escapeHtml(codeBlock.join("\n")) + "</code></pre>";
        codeBlock = null;
      } else codeBlock.push(line);
      continue;
    }
    if (fence) {
      flush();
      codeBlock = [];
      continue;
    }
    const legacyNum = line.match(LEGACY_H6);
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    const item = line.match(/^(\s*)([-*+]|\d+[.)、])\s+(.*)$/);
    const isTable =
      line.includes("|") &&
      i + 1 < lines.length &&
      /^\s*\|?\s*:?-{3,}/.test(lines[i + 1]);

    if (legacyNum) {
      flush();
      html += '<div class="article-num" style="' + numStyle + '">' + legacyNum[1] + '</div>';
    } else if (/^\s*(---+|___+|\*\s*\*\s*\*+)\s*$/.test(line)) {
      flush();
      html += "<hr/>";
    } else if (isTable) {
      flush();
      const rows = [line];
      i += 1;
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i]);
        i += 1;
      }
      i -= 1;
      html += renderTable(rows);
    } else if (image) {
      flush();
      html += '<img src="' + escapeHtml(safeUrl(image[2])) + '" alt="' + escapeHtml(image[1]) + '"/>';
    } else if (heading) {
      flush();
      const level = heading[1].length;
      const text = heading[2];
      const handNum = level <= 2 ? text.match(HAND_NUM) : null;
      if (!legacy && level === 1 && !handNum) {
        chapter += 1;
        section = 0;
        html += chapterDiv(chapter) + "<h1>" + inline(text) + "</h1>";
      } else if (!legacy && level === 2 && !handNum) {
        section += 1;
        html += "<h2>" + sectionPrefix(chapter, section) + inline(text) + "</h2>";
      } else {
        html += "<h" + level + ">" + inline(text) + "</h" + level + ">";
      }
    } else if (item) {
      const depth = Math.floor(item[1].replace(/\t/g, "  ").length / 2);
      const tag: "ul" | "ol" = /^\d/.test(item[2]) ? "ol" : "ul";
      listRows.push({ depth, tag, text: item[3] });
    } else if (line.startsWith(">")) {
      if (paragraph.length) flush();
      const content = line.replace(/^>\s?/, "");
      const calloutStart = content.match(/^\[!(note|tip|warning|warn|info|important|success|question|example|danger|caution|quote)\][\s:]?(.*)$/i);
      if (calloutStart) {
        html += "<blockquote class=\"owc-callout\">" + (calloutStart[2] ? "<p class=\"owc-callout-title\">" + inline(calloutStart[2]) + "</p>" : "");
        let j = i + 1;
        while (j < lines.length && lines[j].startsWith(">")) {
          html += "<p>" + inline(lines[j].replace(/^>\s?/, "")) + "</p>";
          j += 1;
        }
        i = j - 1;
        html += "</blockquote>";
      } else {
        quote.push(content);
      }
    } else if (!line.trim()) {
      flush();
    } else {
      flush();
      paragraph.push(line.trim());
    }
  }
  if (codeBlock) html += "<pre><code>" + escapeHtml(codeBlock.join("\n")) + "</code></pre>";
  flush();
  return html;
}
