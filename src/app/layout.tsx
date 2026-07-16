import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { SITE_URL } from "@/lib/site-url";

import "./globals.css";
import "./course.css";
import "./game.css";

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: { default: "Python 勇者斗恶龙", template: "%s | Python 勇者斗恶龙" },
  description: "在 16-bit 像素冒险中学习 Python，写代码、打 Boss、升级勇者。",
  keywords: ["Python 教程", "编程学习", "像素 RPG", "在线 Python 练习"],
  applicationName: "Python 勇者斗恶龙",
  category: "education",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "Python 勇者斗恶龙",
    title: "Python 勇者斗恶龙",
    description: "17 章 Python 像素冒险：写代码、打 Boss、升级勇者。",
  },
  twitter: {
    card: "summary",
    title: "Python 勇者斗恶龙",
    description: "17 章 Python 像素冒险：写代码、打 Boss、升级勇者。",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>): ReactNode {
  return (
    <html lang="zh-CN">
      <body>
        <a className="skip-link" href="#main-content">跳到主要内容</a>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
