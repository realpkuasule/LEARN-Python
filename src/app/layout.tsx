import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";

import "./globals.css";
import "./course.css";
import "./game.css";

export const metadata: Metadata = {
  title: { default: "Python 勇者斗恶龙", template: "%s | Python 勇者斗恶龙" },
  description: "在 16-bit 像素冒险中学习 Python，写代码、打 Boss、升级勇者。",
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
