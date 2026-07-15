import Link from "next/link";
import type { ReactNode } from "react";

import { HomeGate } from "@/components/home-gate";

const ACCENT_TILE_INTERVAL = 7;

export default function HomePage(): ReactNode {
  return (
    <main className="page-container" id="main-content">
      <section className="grid min-h-[calc(100dvh-120px)] items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <p className="eyebrow">17 章 Python 像素冒险</p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight text-ink md:text-6xl">
            写代码，升级勇者，击败恶龙
          </h1>
          <p className="muted mt-6 max-w-2xl text-lg leading-8">
            从第一行 print 开始，在浏览器中学习、练习和运行 Python。每个知识点都会变成你的冒险能力。
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <HomeGate />
            <Link className="pixel-button secondary" href="/map">预览世界地图</Link>
          </div>
        </div>
        <div className="pixel-panel relative min-h-[420px] overflow-hidden p-6" aria-label="像素世界预览">
          <div className="absolute inset-6 grid grid-cols-6 grid-rows-6 gap-2 opacity-80" aria-hidden="true">
            {Array.from({ length: 36 }, (_, index) => (
              <span className={index % ACCENT_TILE_INTERVAL === 0 ? "bg-accent" : index % 3 === 0 ? "bg-success" : "bg-raised"} key={index} />
            ))}
          </div>
          <div className="pixel-panel absolute bottom-12 left-10 right-10 p-5">
            <p className="text-accent">当前任务</p>
            <p className="mt-2 text-2xl">前往冒险者公会</p>
            <p className="muted mt-3">学习为什么编程，并写下第一句冒险宣言。</p>
          </div>
        </div>
      </section>
    </main>
  );
}
