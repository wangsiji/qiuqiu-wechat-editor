// 浏览器端共享工具（网页版 + Obsidian 插件共用，单一真相）。
// 仅放纯浏览器逻辑，无 React / Obsidian 依赖，两个入口都可直接 import。

/** 竖图判定：高 > 宽。naturalWidth 为 0 表示还没量到，按横图处理。 */
export const isPortrait = (img: HTMLImageElement) =>
  img.naturalWidth > 0 && img.naturalHeight > img.naturalWidth;

/** 从 Markdown 取出图片地址（量图和导出共用）。 */
export const imageSrcs = (text: string) =>
  Array.from(text.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)).map((m) => m[1]);

/**
 * 逐张量出竖图地址；加载失败或超 5 秒的按横图处理，避免卡住复制。
 * 图片比例只有浏览器知道，故拷贝/导出前量一次。
 */
export async function detectPortrait(srcs: string[]): Promise<Set<string>> {
  const measured = await Promise.all(
    Array.from(new Set(srcs)).map(
      (src) =>
        new Promise<string | null>((resolve) => {
          const probe = new Image();
          let settled = false;
          let timer = 0;
          const finish = (v: string | null) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timer);
            resolve(v);
          };
          timer = window.setTimeout(() => finish(null), 5000);
          probe.onload = () => finish(isPortrait(probe) ? src : null);
          probe.onerror = () => finish(null);
          probe.src = src;
        })
    )
  );
  return new Set(measured.filter((s): s is string => !!s));
}

/**
 * 复制富文本 HTML 到剪贴板（同时写 text/html 与纯文本版本）。
 * 用标准 ClipboardItem（全部现代引擎及 WebKit 13.1+ 均支持 text/html）。
 */
export async function copyRichText(html: string): Promise<void> {
  // 解析富文本时不写 innerHTML（Obsidian 审核禁 no-inner-html），用标准 DOMParser。
  const parsedBody = () =>
    new DOMParser().parseFromString(html, "text/html").body;
  const plainText = parsedBody().textContent || "";
  await navigator.clipboard.write([
    new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([plainText], { type: "text/plain" }),
    }),
  ]);
}