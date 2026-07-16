import type { Metadata } from "next";
import type { ReactNode } from "react";

import { EnvironmentBackdrop } from "@/components/environment-backdrop";
import { WorldMap } from "@/components/world-map";
import { worldMapEnvironmentAsset } from "@/lib/environment-assets";

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
      <figure className="world-map-hero pixel-panel">
        <EnvironmentBackdrop
          alt="从冒险者公会通往恶龙之巢的 Python 冒险世界"
          priority
          sizes="(max-width: 1488px) calc(100vw - 48px), 1440px"
          src={worldMapEnvironmentAsset()}
        />
        <figcaption>17 个章节地点组成一条完整的 Python 学习路线。</figcaption>
      </figure>
      <WorldMap />
    </main>
  );
}
