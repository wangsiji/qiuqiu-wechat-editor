// Smoke test: verify render()/renderWechat() core survive the plugin port.
// Run: node tests/smoke.mjs (no Obsidian needed — core is pure TS). Compile via esbuild first.
import { build } from "esbuild";
import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url)); // obsidian-plugin/tests/
const LIB = join(HERE, "../../lib"); // monorepo：共用末梢仓库根 lib/

// esbuild-compile both lib modules to CJS in memory and eval them.
const result = await build({
  entryPoints: [join(LIB, "wechat.ts")],
  bundle: true,
  format: "cjs",
  platform: "node",
  write: false,
  logLevel: "silent",
});

const both = {};
new Function("module", "exports", "require", result.outputFiles[0].text)(both, both.exports, require);

// render 从 render.ts 单独打包（wechat 不 re-export 它）
const r = await build({
  entryPoints: [join(LIB, "render.ts")],
  bundle: true,
  format: "cjs",
  platform: "node",
  write: false,
  logLevel: "silent",
});
const renderMod = {};
new Function("module", "exports", "require", r.outputFiles[0].text)(renderMod, renderMod.exports, require);
const render = renderMod.exports.render;
const renderWechat = both.exports.renderWechat;

const md = `# 章节一

导语段落 **加粗** 和 *斜体* 与 [链接](https://x.com)。

## 小节

- 列表一
- 列表二

> 引用一行

| A | B |
|---|---|
| 1 | 2 |
`;

const prev = render(md);
const wc = renderWechat(md, { portrait: new Set() });

// assertions
const check = (name, cond) => {
  if (!cond) throw new Error("FAIL: " + name);
  console.log("PASS:", name);
};
check("render 产出大数字章节", prev.includes('class="article-num"'));
check("render 产出小节前缀", prev.includes("｜</span>"));
check("render 列表", prev.includes("<ul "));
check("render 引用", prev.includes("<blockquote"));
check("render 表格", prev.includes("<table"));
check("wechat 全内联标题", wc.includes("font-size:60px") && wc.includes("#3A8BE8"));
check("wechat 强调用内联色", wc.includes("font-weight:700"));
check("wechat 无 class 依赖", !wc.includes("class="));
check("wechat 引用金黄竖线", wc.includes("#DB7A0E"));
console.log("\nALL TESTS PASSED");