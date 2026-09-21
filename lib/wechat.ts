// 微信专用导出渲染器（响应网页版 GPT 评审）：
// 复制到公众号时不再“抄预览 DOM 的 getComputedStyle”，而是直接从 Markdown
// 重新生成一套全内联样式、微信后台兼容度最高的 HTML。
// 关键设计：
// - 只用微信稳定支持的标签：p / span / strong / em / ul / li / img / table / pre
// - 视觉参数全部显式写进 style（正文 #333/17px/1.85，章节 #D9898E 60px，小节 #3A8BE8…）
// - 章节数字、小节序号在导出时直接生成文本，不依赖 CSS ::before/::after
// - 不依赖任何 class（微信后台会清 class），也不依赖 getComputedStyle（预览与导出解耦）

import { escapeHtml, safeUrl } from "./render.ts";

const INLINE_CODE =
  "color:#12A98D;background:#F1FAF8;font-family:'SFMono-Regular',Consolas,Menlo,monospace;" +
  "font-size:.88em;line-height:1.5;padding:1px 3px;border-radius:2px;overflow-wrap:anywhere;";
const LINK_STYLE = "color:#16B99A;font-weight:500;text-decoration:none;";
const STRIKE_STYLE = "color:#3A8BE8;text-decoration:line-through;";

// 微信行内渲染：不依赖预览 CSS class，直接产出可粘贴的标签与样式。
// accent 用于给标题内的强调继承标题色（章节粉红、小节蓝），普通正文强调统一蓝。
function wechatInline(s: string, accent?: string): string {
  const strong = "color:" + (accent || "#3A8BE8") + ";font-weight:700;";
  const em = "color:" + (accent || "#3A8BE8") + ";font-style:italic;";
  return escapeHtml(s)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m: string, alt: string, src: string) => '<img src="' + escapeHtml(safeUrl(src)) + '" alt="' + escapeHtml(alt) + '"/>')
    .replace(/`([^`]+)`/g, (_m: string, c: string) => '<code style="' + INLINE_CODE + '">' + c + '</code>')
    .replace(/~~([^~]+)~~/g, (_m: string, t: string) => '<span style="' + STRIKE_STYLE + '">' + t + '</span>')
    .replace(/\*\*([^*]+)\*\*/g, (_m: string, t: string) => '<strong style="' + strong + '">' + t + '</strong>')
    .replace(/\*([^*]+)\*/g, (_m: string, t: string) => '<em style="' + em + '">' + t + '</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m: string, label: string, href: string) => '<a href="' + escapeHtml(safeUrl(href)) + '" style="' + LINK_STYLE + '">' + label + '</a>');
}

const BODY =
  "margin:16px 0;padding:0;font-size:17px;line-height:1.85;letter-spacing:.25px;color:#333333;" +
  "text-align:justify;overflow-wrap:break-word;" +
  "font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','PingFang SC','Helvetica Neue',Arial,sans-serif;";

// 章节数字（60px 粉红 Times）+ 章节标题（19px 粉红，居中）
const chapter = (num: number, titleHtml: string) =>
  '<p style="margin:20px auto 10px;padding:0;text-align:center;font-size:60px;line-height:1;' +
  "font-weight:700;font-family:'Times New Roman',Times,'Songti SC',serif;color:#D9898E;" +
  'font-variant-numeric:lining-nums tabular-nums;letter-spacing:-1px;white-space:nowrap;">' +
  num +
  '</p><p style="margin:8px auto 24px;padding:0;text-align:center;font-size:19px;line-height:1.45;' +
  'font-weight:800;color:#D9898E;">' +
  titleHtml +
  "</p>";

// 小节：蓝色加粗，带「1.1｜」或「01｜」前缀。
// 前缀不单独包 <span>：微信后台常把 span 单独转成一个块导致“编号与标题断行”。
// 整个 <p> 已是蓝色，前缀直接作为普通文本拼在标题前。
const section = (prefix: string, titleHtml: string) =>
  '<p style="margin:28px 0 12px;padding:0;font-size:17px;line-height:1.6;font-weight:800;color:#3A8BE8;' +
  'text-align:left;">' +
  prefix +
  titleHtml +
  "</p>";

// 图片：默认通栏。首图（文章第一张）按主题无描边，正文图带蓝色细描边。
// 竖图（高 > 宽）默认 75% 宽居中，避免长图在手机里过高。
// 图片实际比例只有浏览器知道，故由调用方量好后通过 portrait 传入。
const imageHtml = (src: string, alt: string, isCover = false, isPortrait = false) => {
  const width = isPortrait ? "75%" : "100%";
  return (
    '<img src="' +
    escapeHtml(safeUrl(src)) +
    '" alt="' +
    escapeHtml(alt) +
    '" style="display:block;box-sizing:border-box;width:' +
    width +
    ";max-width:" +
    width +
    ";height:auto;margin:18px auto 10px;" +
    (isCover ? "border:none;border-radius:0;" : "border:1px solid #3A8BE8;border-radius:0;") +
    '"/>'
  );
};

// 列表：微信对 list-style 支持不稳定，且 <ul>/<li> 粘贴后微信会把首段格式化
// 元素当成项目符号单独成行。这里全部用 <p> 平铺：每个列表项一个段落，
// marker 作为行内蓝色加粗文本（<strong>），与正文段落完全同构，粘贴最稳。
type ListRow = { ordered: boolean; depth: number; text: string };
const LIST_LI =
  "margin:6px 0;padding:0;font-size:17px;line-height:1.85;letter-spacing:.2px;" +
  "color:#333333;text-align:left;";

// 平铺渲染：按行输出 <p>，缩进层级用 padding-left 表示。
const listHtml = (rows: ListRow[]) =>
  rows
    .map((row, index) => {
      const depth = row.depth;
      const marker = row.ordered ? index + 1 + ". " : depth > 0 ? "◦ " : "• ";
      const markerStyle =
        "color:#3A8BE8;font-weight:700;margin-right:.4em;";
      const pad = depth > 0 ? "padding-left:" + depth * 1.2 + "em;" : "";
      return (
        '<p style="' +
        LIST_LI +
        pad +
        '">' +
        '<strong style="' +
        markerStyle +
        '">' +
        marker +
        "</strong>" +
        wechatInline(row.text) +
        "</p>"
      );
    })
    .join("");

// 表格：画廊风格，全内联
const tableHtml = (raw: string[][]) => {
  const head = raw[0]
    .map(
      (c) =>
        '<th style="color:#5C7D9B;background:#F5F0E8;font-size:14px;font-weight:800;' +
        "letter-spacing:.4px;padding:10px 8px 9px;border-bottom:1px solid #EAE2D7;text-align:center;\">" +
        wechatInline(c.trim()) +
        "</th>"
    )
    .join("");
  const body = raw
    .slice(1)
    .map(
      (row) =>
        "<tr>" +
        row
          .map(
            (c) =>
              '<td style="background:#FFFCF7;padding:10px 9px 11px;color:#333333;text-align:center;' +
              'vertical-align:middle;">' +
              wechatInline(c.trim()) +
              "</td>"
          )
          .join("") +
        "</tr>"
    )
    .join("");
  return (
    '<table style="width:100%;max-width:100%;border-collapse:separate;border-spacing:0;margin:8px 0 10px;' +
    'font-size:13px;line-height:1.65;table-layout:fixed;word-break:break-word;background:#FFFCF7;' +
    'border:1px solid #EEE7DD;border-radius:10px;overflow:hidden;">' +
    "<thead><tr>" +
    head +
    "</tr></thead><tbody>" +
    body +
    "</tbody></table>"
  );
};

const codeHtml = (text: string) =>
  '<pre style="color:#E8EEF5;background:#171A1F;border-radius:0;padding:13px 14px;margin:16px 0 20px;' +
  "overflow-x:auto;white-space:pre-wrap;word-break:break-word;font-size:13px;line-height:1.65;" +
  "font-family:'SFMono-Regular',Consolas,Menlo,monospace;\">" +
  escapeHtml(text) +
  "</pre>";

// 引用：不用 <section> 容器（微信后台会把 section 当作独立容器引发窄排/拆行），
// 改为连续多行 <p> + 左侧金黄竖线、浅黄底。
const QUOTE_LINE =
  "margin:0;padding:3px 12px;font-size:15px;line-height:1.85;color:#333333;" +
  "text-align:left;border-left:3px solid #DB7A0E;background:#FEF9EA;";
const quoteHtml = (rows: string[]) =>
  rows
    .map((q) => '<p style="' + QUOTE_LINE + '">' + wechatInline(q) + "</p>")
    .join("");

// 逐行块级解析（预览渲染器同一套逻辑，但输出微信专用 HTML）
export function renderWechat(
  md: string,
  options: { portrait?: ReadonlySet<string> } = {}
): string {
  const portraitSrcs = options.portrait;
  const lines = md.split(/\r?\n/);
  const legacy = /^#{6}\s+(\d+)$/.test(lines.join("\n")) ||
    lines.some((l) => /^#{1,2}\s+\d+[、.．)）（：]/.test(l));

  let out = "";
  let imageCount = 0;
  let paragraph: string[] = [];
  let codeBlock: string[] | null = null;
  let quoteSection: string[] = [];
  let listRows: Array<{ ordered: boolean; depth: number; text: string }> = [];
  let chapterNo = 0;
  let sectionNo = 0;

  const flushParagraph = () => {
    if (paragraph.length) {
      out += '<p style="' + BODY + '">' + wechatInline(paragraph.join(" ")) + "</p>";
      paragraph = [];
    }
  };
  const flushQuote = () => {
    if (quoteSection.length) {
      out += quoteHtml(quoteSection);
      quoteSection = [];
    }
  };
  const flushList = () => {
    if (listRows.length) {
      out += listHtml(listRows);
      listRows = [];
    }
  };
  const flush = () => {
    flushParagraph();
    flushQuote();
    flushList();
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const fence = line.match(/^\s*```(.*)$/);
    if (codeBlock) {
      if (fence) {
        out += codeHtml(codeBlock.join("\n"));
        codeBlock = null;
      } else codeBlock.push(line);
      continue;
    }
    if (fence) {
      flush();
      codeBlock = [];
      continue;
    }

    const legacyNum = line.match(/^#{6}\s+(\d+)$/);
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    const item = line.match(/^(\s*)([-*+]|\d+[.)、])\s+(.*)$/);
    const isTable =
      line.includes("|") &&
      i + 1 < lines.length &&
      /^\s*\|?\s*:?-{3,}/.test(lines[i + 1]);

    if (legacyNum) {
      flush();
      out += '<p style="margin:20px auto 10px;text-align:center;font-size:60px;line-height:1;' +
        "font-weight:700;font-family:'Times New Roman',Times,'Songti SC',serif;color:#D9898E;\">" +
        legacyNum[1] +
        "</p>";
    } else if (/^\s*(---+|___+|\*\s*\*\s*\*+)\s*$/.test(line)) {
      flush();
      // 分隔线：不用 <section>（微信会把自闭合 section 当成未关闭容器，把后续
      // 内容包进窄容器导致每两字一行的竖排），改为 p + 内层 span 装饰线。
      out +=
        '<p style="margin:28px auto;padding:0;line-height:0;text-align:center;">' +
        '<span style="display:inline-block;width:46px;border-top:1px solid #74AEEF;">' +
        "&nbsp;</span></p>";
    } else if (isTable) {
      flush();
      const rows: string[] = [line];
      i += 1;
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i]);
        i += 1;
      }
      i -= 1;
      const cleaned = rows.map((r) =>
        r.replace(/^\s*\|?/, "").replace(/\|?\s*$/, "").split("|")
      );
      out += tableHtml([cleaned[0], ...cleaned.slice(2)]);
    } else if (image) {
      flush();
      imageCount += 1;
      out += imageHtml(image[2], image[1], imageCount === 1, portraitSrcs ? portraitSrcs.has(image[2]) : false);
    } else if (heading) {
      flush();
      const level = heading[1].length;
      const text = wechatInline(heading[2], level === 1 ? "#D9898E" : level === 2 ? "#3A8BE8" : undefined);
      const handNum = level <= 2 ? heading[2].match(/^\s*(\d+(?:\.\d+)?)\s*[、.．)）（：]\s*(.+)$/) : null;
      if (!legacy && level === 1 && !handNum) {
        chapterNo += 1;
        sectionNo = 0;
        out += chapter(chapterNo, text);
      } else if (!legacy && level === 2 && !handNum) {
        sectionNo += 1;
        out += section(chapterNo > 0 ? chapterNo + "." + sectionNo + "｜" : String(sectionNo).padStart(2, "0") + "｜", text);
      } else {
        out += '<p style="' + (level === 1
          ? "margin:8px auto 24px;text-align:center;font-size:19px;line-height:1.45;font-weight:800;color:#D9898E;"
          : level === 2
            ? "margin:28px 0 12px;font-size:17px;line-height:1.6;font-weight:800;color:#3A8BE8;text-align:left;"
            : "margin:24px 0 10px;font-size:16px;line-height:1.45;font-weight:700;color:#3A8BE8;text-align:left;") + '">' + text + "</p>";
      }
    } else if (item) {
      if (paragraph.length) flushParagraph();
      const ordered = /^\d/.test(item[2]);
      const depth = Math.floor(item[1].replace(/\t/g, "  ").length / 2);
      if (listRows.length && listRows[0].ordered !== ordered) flushList();
      listRows.push({ ordered, depth, text: item[3] });
    } else if (line.startsWith(">")) {
      if (paragraph.length) flushParagraph();
      quoteSection.push(line.replace(/^>\s?/, ""));
    } else if (!line.trim()) {
      flush();
    } else {
      paragraph.push(line.trim());
    }
  }
  if (codeBlock) out += codeHtml(codeBlock.join("\n"));
  flush();
  return out;
}
