import { Plugin, WorkspaceLeaf, ItemView } from "obsidian";
import { renderWechat } from "../lib/wechat";

export const VIEW_TYPE = "qiuqiu-wechat-editor-view";

const isPortrait = (img: HTMLImageElement) =>
  img.naturalWidth > 0 && img.naturalHeight > img.naturalWidth;

// ArrayBuffer → base64（分块，避免大图超栈）
function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + CHUNK))
    );
  }
  return btoa(bin);
}

const imageSrcs = (text: string) =>
  Array.from(text.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)).map((m) => m[1]);

async function detectPortrait(srcs: string[]): Promise<Set<string>> {
  const measured = await Promise.all(
    Array.from(new Set(srcs)).map(
      (src) =>
        new Promise<string | null>((resolve) => {
          const img = new Image();
          let settled = false;
          let timer = 0;
          const finish = (v: string | null) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timer);
            resolve(v);
          };
          timer = window.setTimeout(() => finish(null), 5000);
          img.onload = () => finish(isPortrait(img) ? src : null);
          img.onerror = () => finish(null);
          img.src = src;
        })
    )
  );
  return new Set(measured.filter((s): s is string => !!s));
}

async function copyRich(html: string): Promise<void> {
  const plain = document.createElement("div");
  plain.innerHTML = html;
  const Item = typeof ClipboardItem === "undefined" ? null : ClipboardItem;
  if (
    Item &&
    typeof navigator.clipboard?.write === "function" &&
    (typeof Item.supports !== "function" || Item.supports("text/html"))
  ) {
    await navigator.clipboard.write([
      new Item({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plain.textContent || ""], { type: "text/plain" }),
      }),
    ]);
    return;
  }
  const holder = document.createElement("div");
  holder.contentEditable = "true";
  holder.innerHTML = html;
  holder.style.cssText =
    "position:fixed;left:-100000px;top:0;opacity:0;pointer-events:none;";
  document.body.appendChild(holder);
  const sel = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(holder);
  sel?.removeAllRanges();
  sel?.addRange(range);
  try {
    if (!document.execCommand("copy")) throw new Error("copy failed");
  } finally {
    sel?.removeAllRanges();
    holder.remove();
  }
}

class QiuqiuView extends ItemView {
  private md = "";
  private paper!: HTMLElement;
  private linked: import("obsidian").TFile | null = null;
  private styles: Array<{ id: string; label: string }> = [
    { id: "qiuqiu", label: "秋秋风格" },
  ];

  constructor(leaf: WorkspaceLeaf, private plugin: QiuqiuEditorPlugin) {
    super(leaf);
  }

  // 预览时用：剥掉 YAML frontmatter，避免笔记属性显示在排版预览首段。
  private stripFrontmatter(md: string): string {
    if (md.startsWith("---\n")) {
      const end = md.indexOf("\n---", 4);
      if (end !== -1) return md.slice(end + 4);
    }
    return md;
  }

  // 复制到公众号前的导出预处理：
  // 1) 剥掉 YAML frontmatter，避免笔记属性出现在文章首段；
  // 2) 把 Obsidian 图片语法(![[...]] 或 ![](相对路径))解析为 vault 本地文件，
  //    读成 base64 data URI 内联，微信粘贴时图片才能直接显示。
  // ponytail: 顺序逐个替换（不用 async 直接塞进 String.replace，那会产出 "[object Promise]"）。
  private async exportMarkdown(): Promise<string> {
    let md = this.stripFrontmatter(this.md);
    const note = this.linked || this.plugin.getActiveNote();
    const srcPath = note?.path || "";
    const dataUri = async (target: string): Promise<string | null> => {
      const tf = this.app.metadataCache.getFirstLinkpathDest(target, srcPath);
      if (!tf) return null;
      try {
        const buf = await this.app.vault.readBinary(tf);
        const ext = tf.extension.toLowerCase();
        const mime =
          ext === "png" ? "image/png" :
          ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
          ext === "gif" ? "image/gif" :
          ext === "svg" ? "image/svg+xml" :
          ext === "webp" ? "image/webp" : "application/octet-stream";
        const b64 = arrayBufferToBase64(buf);
        return "data:" + mime + ";base64," + b64;
      } catch {
        return null;
      }
    };
    // 匹配 Obsidian 内嵌图片：![...](...) 与 ![[文件|别名]]。逐处串行替换。
    const re = /(!\[[^\]]*\])\(([^)]+)\)|!\[\[([^\]|#]+?)(?:[|#][^\]]*)?\]\]/g;
    const out: string[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(md)) !== null) {
      out.push(md.slice(last, m.index));
      const target = m[2] ? m[2].trim() : (m[3] || "").trim();
      // 外链(markdown http(s)) 或用不到 data URI 的保留原样
      let replacement: string;
      if (/^https?:\/\//.test(target)) {
        replacement = m[0];
      } else {
        const uri = await dataUri(target);
        replacement = uri ? "![](" + uri + ")" : "";
      }
      out.push(replacement);
      last = m.index + m[0].length;
    }
    out.push(md.slice(last));
    return out.join("");
  }

  getViewType() {
    return VIEW_TYPE;
  }
  getDisplayText() {
    return "秋秋公众号编辑器";
  }
  getIcon() {
    return "paintbrush";
  }

  async onOpen() {
    const root = this.contentEl.createDiv({ cls: "qwe-root" });
    const topbar = root.createDiv({ cls: "qwe-topbar" });
    topbar.createDiv({ cls: "qwe-brand", text: "秋秋公众号排版工作台" });
    const actions = topbar.createDiv({ cls: "qwe-actions" });
    const notice = actions.createSpan({ cls: "qwe-notice" });
    // 风格勾选：默认秋秋风格；以后加新风格只需往 this.styles 里加一项。
    const styleBox = actions.createDiv({ cls: "qwe-styles" });
    this.styles.forEach((s) => {
      const label = styleBox.createEl("label", { cls: "qwe-style" });
      const cb = label.createEl("input", { type: "checkbox" });
      cb.checked = true;
      cb.addEventListener("change", () => {
        notice.textContent = cb.checked ? "已选：" + s.label : "未选任何风格";
        cb.checked = true; // 至少要有一个风格，暂时不允许全关
        notice.textContent = "已选：" + s.label;
      });
      label.appendText(s.label);
    });
    const btnCopy = actions.createEl("button", { cls: "qwe-btn qwe-copy", text: "复制到公众号" });

    const body = root.createDiv({ cls: "qwe-body" });
    this.paper = body.createDiv({ cls: "qwe-stage" }).createDiv({ cls: "article-paper" });

    const refresh = async () => {
      // 预览与复制用同一 renderWechat HTML，所见即所得：编号/图片/内外链全一致。
      this.paper.innerHTML = await previewHtml();
    };

    // 生成「导出/预览」统一的富文本 HTML：剥 frontmatter → 本地图转 data URI → renderWechat
    const previewHtml = async () => {
      const md = await this.exportMarkdown();
      const portrait = await detectPortrait(imageSrcs(md));
      return renderWechat(md, { portrait });
    };

    // 默认载入当前已打开的笔记，改动时实时跟随（编辑在 Obsidian 原生编辑器里做）。
    const loadActive = async () => {
      const actFile = this.plugin.getActiveNote();
      if (actFile) {
        this.md = await this.app.vault.read(actFile); // read 强制读最新，避开缓存
        this.linked = actFile;
      }
      await refresh();
    };
    await loadActive();
    // 当前笔记内容变化（用户编辑保存）→ 重读并刷新预览
    this.registerEvent(
      this.app.vault.on("modify", async (f) => {
        if (f === this.linked) {
          this.md = await this.app.vault.read(f);
          await refresh();
        }
      })
    );
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", async (_leaf) => {
        const active = this.plugin.getActiveNote();
        if (active && active !== this.linked) await loadActive();
      })
    );

    btnCopy.addEventListener("click", async () => {
      const html = await this.previewHtml();
      const external = (html.match(/<img[^>]+src="https?:/g) || []).length;
      try {
        await copyRich(html);
        notice.textContent = external
          ? "已复制；" + external + " 张外链图需先传公众号素材库"
          : "已复制富文本，可直接粘贴到公众号";
      } catch {
        notice.textContent = "复制失败，请用 Obsidian 桌面端";
      }
    });
  }

  async onClose() {}
}

export default class QiuqiuEditorPlugin extends Plugin {
  // 跨视图记住最近打开的 Markdown 笔记（参考 wechat-converter 的 lastActiveFile）
  private lastActiveFile: import("obsidian").TFile | null = null;

  async onload() {
    this.registerView(VIEW_TYPE, (leaf: WorkspaceLeaf) => new QiuqiuView(leaf, this));
    this.addRibbonIcon("paintbrush", "打开秋秋公众号编辑器", () => this.openView());
    this.addCommand({
      id: "open-editor",
      name: "打开秋秋公众号编辑器",
      callback: () => this.openView(),
    });

    // 跟踪活动文件：active-leaf-change 事件在当前笔记切换时更新缓存，
    // 避免编辑器视图聚焦/侧栏激活时 getActiveFile() 拿到预览自身。
    this.registerEvent(
      this.app.workspace.on(
        "active-leaf-change",
        (leaf) => {
          const view = leaf?.view as { file?: import("obsidian").TFile } | undefined;
          const file = view?.file;
          if (file && file.extension === "md") this.lastActiveFile = file;
        }
      )
    );
  }

  getActiveNote(): import("obsidian").TFile | null {
    return this.lastActiveFile;
  }

  private async openView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      if (leaf) await leaf.setViewState({ type: VIEW_TYPE, active: true });
    }
    if (leaf) workspace.revealLeaf(leaf);
  }
}