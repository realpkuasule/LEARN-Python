import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "创建勇者" };

export default function CreateHeroLayout({ children }: Readonly<{ children: ReactNode }>): ReactNode {
  return children;
}
