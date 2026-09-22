import "./globals.css";

export const metadata = {
  title: "秋秋编辑器 · 公众号 Markdown 排版",
  description: "为秋秋公众号写作的 Markdown 实时排版工作台。",
  icons: { icon: "/qiuqiu-wechat-editor/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
