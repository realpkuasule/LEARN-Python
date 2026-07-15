"use client";

import Link from "next/link";

import { CHAPTERS } from "@/domain/chapter-catalog";
import { canAccessChapter } from "@/domain/game-state";
import { useGameStore } from "@/store/game-store";

const REGION_COLORS: Readonly<Record<string, string>> = {
  启程之地: "#365846",
  判断峡谷: "#6b4c3b",
  循环荒原: "#665b35",
  函数高地: "#3f536c",
  数据群岛: "#315d68",
  文本海岸: "#56507a",
  模块山脉: "#5a4c58",
  龙巢边境: "#6d3d3d",
};

export const WorldMap = (): React.ReactNode => {
  const game = useGameStore(({ game }) => game);
  const hydrated = useGameStore(({ hydrated }) => hydrated);
  if (!hydrated) return <div className="pixel-panel p-8">正在读取冒险地图...</div>;
  if (!game) {
    return (
      <div className="pixel-panel p-8 text-center">
        <p className="text-2xl">地图尚未认出你的勇者</p>
        <Link className="pixel-button mt-6" href="/create-hero">先创建勇者</Link>
      </div>
    );
  }

  const regions = [...new Set(CHAPTERS.map(({ region }) => region))];
  return (
    <div className="space-y-8">
      {regions.map((region) => (
        <section
          className="pixel-panel relative overflow-hidden p-5 md:p-7"
          key={region}
          style={{ backgroundColor: REGION_COLORS[region] ?? "var(--surface)" }}
        >
          <div aria-hidden="true" className="absolute inset-0 opacity-15" style={{ backgroundImage: "linear-gradient(90deg, #fff 2px, transparent 2px), linear-gradient(#fff 2px, transparent 2px)", backgroundSize: "32px 32px" }} />
          <h2 className="relative mb-6 text-2xl text-ink">{region}</h2>
          <ol className="relative grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {CHAPTERS.filter((chapter) => chapter.region === region).map((chapter) => {
              const completed = game.progress.completedChapters.includes(chapter.number);
              const accessible = canAccessChapter(game, chapter.number);
              const current = game.progress.currentChapter === chapter.number && !completed;
              const className = `pixel-panel min-h-32 p-4 ${completed ? "border-success" : current ? "border-accent" : !accessible ? "opacity-60 grayscale" : ""}`;
              const content = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-accent">第 {chapter.number} 章</span>
                    <span>{completed ? "已完成" : current ? "当前" : accessible ? "可进入" : "锁定"}</span>
                  </div>
                  <h3 className="mt-3 text-xl">{chapter.location}</h3>
                  <p className="muted mt-2">{chapter.title}</p>
                  {chapter.isBoss && <p className="mt-3 text-danger">Boss: {chapter.bossName}</p>}
                </>
              );
              return (
                <li key={chapter.number}>
                  {accessible ? <Link className={`${className} block`} href={`/chapter/${chapter.number}`}>{content}</Link> : <div aria-disabled="true" className={className}>{content}</div>}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
};
