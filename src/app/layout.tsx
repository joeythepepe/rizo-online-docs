import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "../design-tokens/fonts.css";
import "../design-tokens/ui.css";
import "../design-tokens/print.css";

export const metadata: Metadata = {
  title: "睿卓教育在线文档",
  description: "睿卓升学一站通 · 课程培训 · A4 服务说明",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
