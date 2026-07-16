import Link from "next/link";
import type { ReactNode } from "react";

import { AdventurePreview } from "@/components/adventure-preview";
import { HomeGate } from "@/components/home-gate";

export default function HomePage(): ReactNode {
  return (
    <main className="page-container" id="main-content">
      <section className="grid min-h-[calc(100dvh-120px)] items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <p className="eyebrow">17 章 Python 像素冒险</p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight text-ink md:text-5xl">
            写 Python，升级勇者，击败恶龙
          </h1>
          <p className="muted mt-6 max-w-2xl text-lg leading-8">
            从第一行 print 开始，在浏览器中学习、练习和运行 Python。每个知识点都会变成你的冒险能力。
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <HomeGate />
            <Link className="pixel-button secondary" href="/map">预览世界地图</Link>
          </div>
        </div>
        <AdventurePreview />
      </section>
    </main>
  );
}
