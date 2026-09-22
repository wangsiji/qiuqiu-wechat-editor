import{r as e}from"./rolldown-runtime-C60lm6uB.js";import{i as t,r as n}from"./framework-BgSIrAUN.js";var r=t(),i=e(n(),1),a=e=>e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`),o=e=>{let t=e.trim();return/^(https?:|\.{0,2}\/|#)/i.test(t)?t:`#`},s=e=>a(e).replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(e,t,n)=>`<img src="`+o(n)+`" alt="`+t+`"/>`).replace(/`([^`]+)`/g,`<code>$1</code>`).replace(/(^|[\s(])\[([ xX])\](?=\s|$)/g,(e,t,n)=>t+`<span class="task-check `+(n.toLowerCase()===`x`?`done`:``)+`">[`+n+`]</span>`).replace(/\*\*([^*]+)\*\*/g,`<strong>$1</strong>`).replace(/~~([^~]+)~~/g,`<del>$1</del>`).replace(/\*([^*]+)\*/g,`<em>$1</em>`).replace(/\[([^\]]+)\]\(([^)]+)\)/g,(e,t,n)=>`<a href="`+o(n)+`">`+t+`</a>`),c=/^#{6}\s+(\d+)$/,l=/^\s*(\d+(?:\.\d+)?)\s*[、.．)）（：]\s*(.+)$/,u=`display:block;margin:20px auto 10px;color:#D9898E;font-family:'Times New Roman',Times,'Songti SC',serif;font-size:60px;font-weight:700;line-height:1;font-variant-numeric:lining-nums tabular-nums;font-feature-settings:'lnum' 1,'tnum' 1;letter-spacing:-1px;text-align:center;white-space:nowrap;`,d=e=>`<div class="article-num" style="`+u+`">`+e+`</div>`,f=(e,t)=>`<span class="art-secnum" style="display:inline-block;font-weight:800;color:#3A8BE8;margin-right:.2em;">`+(e>0?e+`.`+t+`｜`:String(t).padStart(2,`0`)+`｜`)+`</span>`;function p(e){for(let t of e){if(c.test(t))return!0;let e=t.match(/^(#{1,6})\s+(.*)$/);if(e&&e[1].length<=2&&l.test(e[2]))return!0}return!1}function m(e,t,n){if(t>=e.length||e[t].depth<=n)return{html:``,next:t};let r=e[t],i=r.tag,a=`<`+i+` style="margin:0;padding-left:1.45rem;">`,o=t;for(;o<e.length&&e[o].depth===r.depth;){let t=e[o];if(o+=1,a+=`<li style="margin:6px 0;text-align:left;">`+s(t.text),o<e.length&&e[o].depth>t.depth){let n=m(e,o,t.depth);a+=n.html,o=n.next}a+=`</li>`}return{html:a+`</`+i+`>`,next:o}}function h(e){let t=e.split(/\r?\n/),n=p(t),r=``,i=[],h=[],g=null,_=[],v=0,y=0,b=()=>{if(h.length){let{html:e}=m(h,0,-1);r+=e,h=[]}},x=()=>{i.length&&(r+=`<p>`+s(i.join(` `))+`</p>`,i=[]),_.length&&(r+=`<blockquote>`+_.map(e=>`<p>`+s(e)+`</p>`).join(``)+`</blockquote>`,_=[]),b()},S=e=>{let t=e=>e.replace(/^\s*\|?/,``).replace(/\|?\s*$/,``),n=t(e[0]).split(`|`),r=e.slice(2).map(e=>`<tr>`+t(e).split(`|`).map(e=>`<td>`+s(e.trim())+`</td>`).join(``)+`</tr>`);return`<table><thead><tr>`+n.map(e=>`<th>`+s(e.trim())+`</th>`).join(``)+`</tr></thead><tbody>`+r.join(``)+`</tbody></table>`};for(let e=0;e<t.length;e+=1){let p=t[e],m=p.match(/^\s*```(.*)$/);if(g){m?(r+=`<pre><code>`+a(g.join(`
`))+`</code></pre>`,g=null):g.push(p);continue}if(m){x(),g=[];continue}let b=p.match(c),C=p.match(/^(#{1,6})\s+(.*)$/),w=p.match(/^!\[([^\]]*)\]\(([^)]+)\)$/),T=p.match(/^(\s*)([-*+]|\d+[.)、])\s+(.*)$/),E=p.includes(`|`)&&e+1<t.length&&/^\s*\|?\s*:?-{3,}/.test(t[e+1]);if(b)x(),r+=`<div class="article-num" style="`+u+`">`+b[1]+`</div>`;else if(/^\s*(---+|___+|\*\s*\*\s*\*+)\s*$/.test(p))x(),r+=`<hr/>`;else if(E){x();let n=[p];for(e+=1;e<t.length&&t[e].includes(`|`);)n.push(t[e]),e+=1;--e,r+=S(n)}else if(w)x(),r+=`<img src="`+a(o(w[2]))+`" alt="`+a(w[1])+`"/>`;else if(C){x();let e=C[1].length,t=C[2],i=e<=2?t.match(l):null;!n&&e===1&&!i?(v+=1,y=0,r+=d(v)+`<h1>`+s(t)+`</h1>`):!n&&e===2&&!i?(y+=1,r+=`<h2>`+f(v,y)+s(t)+`</h2>`):r+=`<h`+e+`>`+s(t)+`</h`+e+`>`}else if(T){let e=Math.floor(T[1].replace(/\t/g,`  `).length/2),t=/^\d/.test(T[2])?`ol`:`ul`;h.push({depth:e,tag:t,text:T[3]})}else if(p.startsWith(`>`)){i.length&&x();let n=p.replace(/^>\s?/,``),a=n.match(/^\[!(note|tip|warning|warn|info|important|success|question|example|danger|caution|quote)\][\s:]?(.*)$/i);if(a){r+=`<blockquote class="owc-callout">`+(a[2]?`<p class="owc-callout-title">`+s(a[2])+`</p>`:``);let n=e+1;for(;n<t.length&&t[n].startsWith(`>`);)r+=`<p>`+s(t[n].replace(/^>\s?/,``))+`</p>`,n+=1;e=n-1,r+=`</blockquote>`}else _.push(n)}else p.trim()?(x(),i.push(p.trim())):x()}return g&&(r+=`<pre><code>`+a(g.join(`
`))+`</code></pre>`),x(),r}var g=e=>/^data:image/i.test(e.trim())?e.trim():o(e),_=`color:#12A98D;background:#F1FAF8;font-family:'SFMono-Regular',Consolas,Menlo,monospace;font-size:.88em;line-height:1.5;padding:1px 3px;border-radius:2px;overflow-wrap:anywhere;`,v=`color:#3A8BE8;text-decoration:line-through;`;function y(e,t){let n=`color:`+(t||`#3A8BE8`)+`;font-weight:700;`,r=`color:`+(t||`#3A8BE8`)+`;font-style:italic;`;return a(e).replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(e,t,n)=>`<img src="`+a(g(n))+`" alt="`+a(t)+`"/>`).replace(/`([^`]+)`/g,(e,t)=>`<code style="`+_+`">`+t+`</code>`).replace(/~~([^~]+)~~/g,(e,t)=>`<span style="`+v+`">`+t+`</span>`).replace(/\*\*([^*]+)\*\*/g,(e,t)=>`<strong style="`+n+`">`+t+`</strong>`).replace(/\*([^*]+)\*/g,(e,t)=>`<em style="`+r+`">`+t+`</em>`).replace(/\[([^\]]+)\]\(([^)]+)\)/g,(e,t,n)=>`<a href="`+a(o(n))+`" style="color:#16B99A;font-weight:500;text-decoration:none;">`+t+`</a>`)}var b=`margin:16px 0;padding:0;font-size:17px;line-height:31px;letter-spacing:.25px;color:#333333;text-align:justify;overflow-wrap:break-word;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','PingFang SC','Helvetica Neue',Arial,sans-serif;`,x=`margin:8px 0 20px;padding:0;font-size:17px;line-height:31px;letter-spacing:.2px;color:#333333;text-align:justify;overflow-wrap:break-word;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','PingFang SC','Helvetica Neue',Arial,sans-serif;`,S=`margin:0;padding:4px 14px 2px;font-size:15px;line-height:1.6;font-weight:700;color:#3A8BE8;text-align:left;background:#F6FAFE;border-left:3px solid #3A8BE8;`,C=`margin:0;padding:2px 14px 4px;font-size:15px;line-height:1.6;color:#333333;text-align:left;background:#F6FAFE;border-left:3px solid #3A8BE8;`,w=(e,t)=>`<p style="margin:20px auto 10px;padding:0;text-align:center;font-size:60px;line-height:66px;font-weight:700;font-family:'Times New Roman',Times,'Songti SC',serif;color:#D9898E;font-variant-numeric:lining-nums tabular-nums;letter-spacing:-1px;white-space:nowrap;">`+e+`</p><p style="margin:8px auto 24px;padding:0;text-align:center;font-size:19px;line-height:28px;font-weight:800;color:#D9898E;">`+t+`</p>`,T=(e,t)=>`<p style="margin:28px 0 12px;padding:0;font-size:17px;line-height:27px;font-weight:800;color:#3A8BE8;text-align:left;">`+e+t+`</p>`,E=(e,t,n=!1,r=!1)=>{let i=r?`75%`:`100%`;return`<img src="`+a(g(e))+`" alt="`+a(t)+`" style="display:block;box-sizing:border-box;width:`+i+`;max-width:`+i+`;height:auto;margin:18px auto 10px;`+(n?`border:none;border-radius:0;`:`border:1px solid #3A8BE8;border-radius:0;`)+`"/>`},D=`margin:6px 0;padding:0;font-size:16px;line-height:30px;letter-spacing:.2px;color:#333333;text-align:left;`,O=e=>e.map((e,t)=>{let n=e.depth,r=e.ordered?t+1+`. `:n>0?`◦ `:`• `,i=n>0?`padding-left:`+n*1.2+`em;`:``;return`<p style="`+D+i+`"><strong style="color:#3A8BE8;font-weight:700;margin-right:.4em;">`+r+`</strong>`+y(e.text)+`</p>`}).join(``),k=e=>{let t=e[0].map(e=>`<th style="color:#5C7D9B;background:#F5F0E8;font-size:14px;line-height:23px;font-weight:800;letter-spacing:.4px;padding:10px 8px 9px;border-bottom:1px solid #EAE2D7;text-align:center;">`+y(e.trim())+`</th>`).join(``),n=e.slice(1).map(e=>`<tr>`+e.map(e=>`<td style="background:#FFFCF7;padding:10px 9px 11px;color:#333333;text-align:center;vertical-align:middle;">`+y(e.trim())+`</td>`).join(``)+`</tr>`).join(``);return`<table style="width:100%;max-width:100%;border-collapse:separate;border-spacing:0;margin:8px 0 10px;font-size:13px;line-height:21px;table-layout:fixed;word-break:break-word;background:#FFFCF7;border:1px solid #EEE7DD;border-radius:10px;overflow:hidden;"><thead><tr>`+t+`</tr></thead><tbody>`+n+`</tbody></table>`},A=e=>`<pre style="color:#E8EEF5;background:#171A1F;border-radius:0;padding:13px 14px;margin:16px 0 20px;overflow-x:auto;white-space:pre-wrap;word-break:break-word;font-size:13px;line-height:21px;font-family:'SFMono-Regular',Consolas,Menlo,monospace;">`+a(e)+`</pre>`,j=`margin:0;padding:3px 12px;font-size:15px;line-height:28px;color:#333333;text-align:left;border-left:3px solid #DB7A0E;background:#FEF9EA;`,M=e=>e.map(e=>`<p style="`+j+`">`+y(e)+`</p>`).join(``);function N(e,t={}){let n=t.portrait,r=e.split(/\r?\n/),i=/^#{6}\s+(\d+)$/.test(r.join(`
`))||r.some(e=>/^#{1,2}\s+\d+[、.．)）（：]/.test(e)),a=``,o=0,s=[],c=null,l=[],u=[],d=0,f=0,p=!1,m=null,h=()=>{s.length&&(a+=`<p style="`+(p?x:b)+`">`+y(s.join(` `))+`</p>`,s=[],p=!1)},g=()=>{l.length&&(a+=M(l),l=[])},_=()=>{m&&=(a+=`<p style="`+S+`">`+y(m.title)+`</p>`+m.rows.map(e=>`<p style="`+C+`">`+y(e)+`</p>`).join(``),null)},v=()=>{u.length&&(a+=O(u),u=[])},D=()=>{h(),g(),_(),v()};for(let e=0;e<r.length;e+=1){let t=r[e],b=t.match(/^\s*```(.*)$/);if(c){b?(a+=A(c.join(`
`)),c=null):c.push(t);continue}if(b){D(),c=[];continue}let x=t.match(/^#{6}\s+(\d+)$/),S=t.match(/^(#{1,6})\s+(.*)$/),C=t.match(/^!\[([^\]]*)\]\(([^)]+)\)$/),O=t.match(/^(\s*)([-*+]|\d+[.)、])\s+(.*)$/),j=t.includes(`|`)&&e+1<r.length&&/^\s*\|?\s*:?-{3,}/.test(r[e+1]);if(x)D(),a+=`<p style="margin:20px auto 10px;text-align:center;font-size:60px;line-height:66px;font-weight:700;font-family:'Times New Roman',Times,'Songti SC',serif;color:#D9898E;">`+x[1]+`</p>`;else if(/^\s*(---+|___+|\*\s*\*\s*\*+)\s*$/.test(t))D(),a+=`<p style="margin:28px auto;padding:0;line-height:0;text-align:center;"><span style="display:inline-block;width:46px;border-top:1px solid #74AEEF;">&nbsp;</span></p>`;else if(j){D();let n=[t];for(e+=1;e<r.length&&r[e].includes(`|`);)n.push(r[e]),e+=1;--e;let i=n.map(e=>e.replace(/^\s*\|?/,``).replace(/\|?\s*$/,``).split(`|`));a+=k([i[0],...i.slice(2)])}else if(C)D(),o+=1,a+=E(C[2],C[1],o===1,n?n.has(C[2]):!1);else if(S){D();let e=S[1].length,t=y(S[2],e===1?`#D9898E`:e===2?`#3A8BE8`:void 0),n=e<=2?S[2].match(/^\s*(\d+(?:\.\d+)?)\s*[、.．)）（：]\s*(.+)$/):null;!i&&e===1&&!n?(d+=1,f=0,a+=w(d,t),p=!0):!i&&e===2&&!n?(f+=1,a+=T(d>0?d+`.`+f+`｜`:String(f).padStart(2,`0`)+`｜`,t)):a+=`<p style="`+(e===1?`margin:8px auto 24px;text-align:center;font-size:19px;line-height:28px;font-weight:800;color:#D9898E;`:e===2?`margin:28px 0 12px;font-size:17px;line-height:27px;font-weight:800;color:#3A8BE8;text-align:left;`:`margin:24px 0 10px;font-size:16px;line-height:23px;font-weight:700;color:#3A8BE8;text-align:left;`)+`">`+t+`</p>`}else if(O){s.length&&h();let e=/^\d/.test(O[2]),t=Math.floor(O[1].replace(/\t/g,`  `).length/2);u.length&&u[0].ordered!==e&&v(),u.push({ordered:e,depth:t,text:O[3]})}else if(t.startsWith(`>`)){s.length&&h();let e=t.replace(/^>\s?/,``),n=e.match(/^\[!(note|tip|warning|warn|info|important|success|question|example|danger|caution|quote)\][\s:]?(.*)$/i);n?(l.length&&g(),m||={title:``,rows:[]},m.title=n[2]):m?m.rows.push(e):l.push(e)}else t.trim()?(m&&_(),s.push(t.trim())):D()}return c&&(a+=A(c.join(`
`))),D(),a}var P=e=>e.naturalWidth>0&&e.naturalHeight>e.naturalWidth,F=e=>Array.from(e.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)).map(e=>e[1]);async function I(e){let t=await Promise.all(Array.from(new Set(e)).map(e=>new Promise(t=>{let n=new Image,r=!1,i=0,a=e=>{r||(r=!0,window.clearTimeout(i),t(e))};i=window.setTimeout(()=>a(null),5e3),n.onload=()=>a(P(n)?e:null),n.onerror=()=>a(null),n.src=e})));return new Set(t.filter(e=>!!e))}async function L(e){let t=()=>new DOMParser().parseFromString(e,`text/html`).body,n=t().textContent||``;if(typeof ClipboardItem<`u`&&(ClipboardItem.supports?.(`text/html`)??!0)&&typeof navigator.clipboard?.write==`function`){await navigator.clipboard.write([new ClipboardItem({"text/html":new Blob([e],{type:`text/html`}),"text/plain":new Blob([n],{type:`text/plain`})})]);return}let r=document.createElement(`div`);r.contentEditable=`true`,r.classList.add(`qwe-clip-holder`),r.append(...Array.from(t().childNodes)),document.body.appendChild(r);let i=window.getSelection(),a=document.createRange();a.selectNodeContents(r),i?.removeAllRanges(),i?.addRange(a);try{if(!document.execCommand(`copy`))throw Error(`copy failed`)}finally{i?.removeAllRanges(),r.remove()}}var R=[[`qiuqiu`,`秋秋同款`,`#d9898e`,`#f8f1f2`]],z=`![文章头图：公众号排版工作台](https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80)

# 公众号排版全要素示例

这是一段**导语**。紧跟 \`# \` 大标题之后的第一段会自动套用导语样式——字距收紧、段落间距更贴大标题。用它来写文章的一句话钩子，比正文主体更抓眼球。

正文段落会两端对齐，行高 1.85、字号 17px，适合手机阅读。文字可以**加粗强调**、*斜体标注*、~~删除线表示已过时~~，还能混排\`行内代码\`（青绿底）和链接：[点我看秋秋编辑器](https://wangsiji.github.io/qiuqiu-wechat-editor/)。

---

## 二、正文里的图片

图片单独成行时自动通栏并带蓝色描边，居中排布：

![示意图：排版流程](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80)

如果图片是竖图（高大于宽），会按公众号惯例缩到 75% 宽居中，避免长图在手机上过高。图片也可以嵌在段落里当行内图：![inline](https://images.unsplash.com/photo-1521931961826-fe48677230a5?w=400&q=80) 这样随文字流动。

---

## 三、数据表格

| 功能 | 写法 | 状态 |
| --- | --- | --- |
| 大章节标题 | \`# 标题\` | 自动编号 + 居中 |
| 小节标题 | \`## 标题\` | 蓝色 + 序号前缀 |
| 数据表格 | \`| 单元格 |\` | 画廊风格 |
| 引用快讯 | \`> 内容\` | 黄底金线 |
| 信息提示条 | \`> [!note]\` | 蓝底蓝线 |

---

## 四、列表

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

## 五、引用与提示条

> 这是引用块：浅黄底 + 金色左竖线，适合放「摘要」或「强调某段观点」。连续几行都写 \`>\` 会合成一整块。

> [!note] 信息提示
> Callout 用 \`> [!note] 标题\` 开头，正文写在下几行。视觉上是浅蓝底 + 蓝色左线，标题行蓝字加粗。适合放「工具提示」「重点解释」这类信息。

> [!warning] 特别注意
> warning 类型会显示不同的标题文字。可用的类型有 note / tip / warning / info / important / success / question / example / danger / caution / quote，都用同一个蓝底信息条承载。

---

## 六、代码块

行内代码、代码块都能用。代码块深色底 + 等宽字体，自动换行：

\`\`\`javascript
const editor = {
  name: "秋秋公众号排版",
  support: ["封面图", "章节编号", "表格", "引用", "Callout", "代码块"],
};
console.log(editor.support.length); // 16
\`\`\`

---

## 七、分隔线

分隔线用 \`---\`，是一段居中的细细蓝色短线，用于不设小标题时的内容分节（就像你前面看到的多次使用）。它不依赖任何容器，粘贴进公众号不会触发拆行。

# 关于这份示例

你会看到这篇全要素示例把上面 7 大类能力都过了一遍：**章节与导语**、**正文图片与竖图**、**数据表格**、**有序/无序/嵌套列表**、**引用与 Callout 提示条**、**行内代码与代码块**、**分隔线**。把这些语法组合起来，就能稳定地产出排版一致的公众号文章。`,B=`# 1、认识你的 AI 工作台`;function V(){let[e,t]=(0,i.useState)(()=>{let e=localStorage.getItem(`qiuqiu-draft-v2`);return e&&!e.includes(B)?e:z}),[n,a]=(0,i.useState)(`qiuqiu`),[o,s]=(0,i.useState)(`idle`),[c,l]=(0,i.useState)(``),u=(0,i.useRef)(null),d=(0,i.useRef)(null),f=R.find(e=>e[0]===n)||R[0],p=(0,i.useMemo)(()=>h(e),[e]);(0,i.useEffect)(()=>{let t=window.setTimeout(()=>localStorage.setItem(`qiuqiu-draft-v2`,e),300);return()=>window.clearTimeout(t)},[e]),(0,i.useEffect)(()=>{let e=document.querySelector(`.article-paper`);if(!e)return;let t=!1,n=e=>{t||!P(e)||e.classList.add(`qwe-portrait`)};for(let t of Array.from(e.querySelectorAll(`img`)))t.complete?n(t):t.addEventListener(`load`,()=>n(t),{once:!0});return()=>{t=!0}},[p]);let m=n=>{let r=u.current;if(!r)return;let i=r.selectionStart,a=r.selectionEnd;t(e.slice(0,i)+n+e.slice(a))};return(0,r.jsxs)(`main`,{className:`editor-shell`,children:[(0,r.jsxs)(`header`,{className:`topbar`,children:[(0,r.jsxs)(`div`,{className:`brand-lockup`,children:[(0,r.jsx)(`div`,{className:`brand-mark`,children:`秋`}),(0,r.jsxs)(`div`,{children:[(0,r.jsx)(`div`,{className:`brand-name`,children:`秋秋编辑器`}),(0,r.jsx)(`div`,{className:`brand-subtitle`,children:`公众号 Markdown 排版工作台`})]})]}),(0,r.jsxs)(`div`,{className:`top-actions`,children:[(0,r.jsx)(`span`,{className:`copy-notice`,style:{maxWidth:300,overflow:`hidden`,color:`#718296`,fontSize:10,textOverflow:`ellipsis`,whiteSpace:`nowrap`},"aria-live":`polite`,children:c}),(0,r.jsx)(`button`,{className:`quiet-button`,onClick:()=>t(z),"aria-label":`恢复示例 Markdown`,children:`恢复示例`}),(0,r.jsx)(`button`,{className:`quiet-button`,onClick:()=>d.current?.click(),"aria-label":`导入 Markdown 文件`,children:`导入 Markdown`}),(0,r.jsx)(`input`,{ref:d,hidden:!0,type:`file`,accept:`.md,.markdown,.txt`,"aria-label":`Markdown 文件`,onChange:async e=>{let n=e.target.files?.[0];n&&t(await n.text())}}),(0,r.jsx)(`button`,{className:`copy-button`,onClick:async()=>{let t=N(e,{portrait:await I(F(e))}),n=(t.match(/<img[^>]+src="https?:/g)||[]).length;try{await L(t),s(`copied`),l(n?`已复制；${n} 张外链图片可能需要先上传到公众号素材库`:`已复制富文本，可直接粘贴到公众号`)}catch{s(`error`),l(`复制富文本失败，请使用最新版 Chrome 或 Safari`)}window.setTimeout(()=>s(`idle`),1800)},"aria-label":`复制排版后的内容到公众号`,children:o===`copied`?`已复制 ✓`:o===`error`?`复制失败`:`复制到公众号`})]})]}),(0,r.jsxs)(`section`,{className:`workspace`,children:[(0,r.jsxs)(`aside`,{className:`editor-panel`,children:[(0,r.jsxs)(`div`,{className:`panel-heading`,children:[(0,r.jsxs)(`div`,{children:[(0,r.jsx)(`span`,{className:`eyebrow`,children:`WRITE`}),(0,r.jsx)(`h1`,{children:`Markdown 草稿`})]}),(0,r.jsx)(`span`,{className:`save-dot`,children:`已自动保存`})]}),(0,r.jsxs)(`div`,{className:`toolbar`,"aria-label":`Markdown 工具栏`,children:[(0,r.jsx)(`button`,{onClick:()=>m(`**重点文字**`),"aria-label":`插入加粗文本`,title:`加粗`,children:`B`}),(0,r.jsx)(`button`,{onClick:()=>m(`# 一级标题

`),"aria-label":`插入一级标题`,title:`一级标题`,children:`H1`}),(0,r.jsx)(`button`,{onClick:()=>m(`> 引用
`),"aria-label":`插入引用`,title:`引用`,children:`❞`}),(0,r.jsx)(`button`,{onClick:()=>m(`- 列表项
`),"aria-label":`插入无序列表`,title:`无序列表`,children:`☷`})]}),(0,r.jsx)(`textarea`,{ref:u,className:`markdown-editor`,value:e,onChange:e=>t(e.target.value),spellCheck:!1,"aria-label":`Markdown 草稿编辑区`}),(0,r.jsxs)(`div`,{className:`editor-footer`,children:[(0,r.jsxs)(`span`,{children:[e.length,` 字符`]}),(0,r.jsx)(`span`,{children:`实时预览`})]})]}),(0,r.jsxs)(`section`,{className:`preview-panel`,children:[(0,r.jsxs)(`div`,{className:`preview-heading`,children:[(0,r.jsxs)(`div`,{children:[(0,r.jsx)(`span`,{className:`eyebrow`,children:`PREVIEW`}),(0,r.jsx)(`h2`,{children:`公众号预览`})]}),(0,r.jsxs)(`span`,{className:`preview-status`,children:[(0,r.jsx)(`i`,{}),`实时同步`]})]}),(0,r.jsx)(`div`,{className:`preview-stage`,children:(0,r.jsx)(`article`,{className:`article-paper`,style:{"--accent":f[2],"--soft":f[3]},dangerouslySetInnerHTML:{__html:p}})})]}),(0,r.jsxs)(`aside`,{className:`theme-panel`,children:[(0,r.jsx)(`div`,{className:`panel-heading compact`,children:(0,r.jsxs)(`div`,{children:[(0,r.jsx)(`span`,{className:`eyebrow`,children:`THEME`}),(0,r.jsx)(`h2`,{children:`主题`})]})}),R.map(e=>(0,r.jsxs)(`button`,{className:`theme-card ${e[0]===n?`selected`:``}`,onClick:()=>a(e[0]),"aria-pressed":e[0]===n,"aria-label":`选择主题：${e[1]}`,children:[(0,r.jsx)(`span`,{className:`theme-swatch`,style:{background:e[2]}}),(0,r.jsxs)(`span`,{children:[(0,r.jsx)(`strong`,{children:e[1]}),(0,r.jsx)(`small`,{children:`当前可用主题`})]}),(0,r.jsx)(`b`,{children:e[0]===n?`✓`:``})]},e[0])),(0,r.jsxs)(`div`,{className:`theme-note`,children:[`✦ 更多主题开发中`,(0,r.jsx)(`br`,{}),(0,r.jsx)(`small`,{children:`后续可添加 AI、读书和生活方式主题。`})]})]})]})]})}export{V as default};