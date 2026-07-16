import type { Metadata } from "next";

import { HeroDashboard } from "@/components/hero-dashboard";

export const metadata: Metadata = { title: "勇者档案" };

export default function HeroPage(): React.ReactNode {
  return (
    <main className="page-container" id="main-content">
      <HeroDashboard />
    </main>
  );
}
