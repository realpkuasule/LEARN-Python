import type { Metadata } from "next";
import type { ReactNode } from "react";

import { WorldMap } from "@/components/world-map";

export const metadata: Metadata = { title: "世界地图" };

export default function MapPage(): ReactNode {
  return (
    <main className="page-container" id="main-content">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">冒险路线</p>
          <h1 className="mt-2 text-4xl">Python 世界地图</h1>
        </div>
        <p className="muted max-w-xl">完成当前章节的综合挑战即可点亮道路，逐步前往第 17 章恶龙之巢。</p>
      </div>
      <WorldMap />
    </main>
  );
}
