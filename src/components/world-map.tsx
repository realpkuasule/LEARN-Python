"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { PixelIcon } from "@/components/pixel-icon";
import { CHAPTERS, type Chapter } from "@/domain/chapter-catalog";
import { getChapterViewState, type ChapterViewState } from "@/domain/map-view";
import { chapterNodeAsset, guiAsset } from "@/lib/gui-assets";
import { useGameStore } from "@/store/game-store";

const MAP_NODE_ICON_SIZE = 64;
const DIALOG_ICON_SIZE = 40;

const STATE_LABELS: Readonly<Record<ChapterViewState, string>> = {
  completed: "已完成",
  current: "当前任务",
  available: "可进入",
  locked: "锁定",
};

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
  const dialogReference = useRef<HTMLDialogElement>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  useEffect(() => {
    if (!selectedChapter || dialogReference.current?.open) return;
    dialogReference.current?.showModal();
  }, [selectedChapter]);

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
              const state = getChapterViewState(game, chapter.number);
              const accessible = state !== "locked";
              const className = `map-node-card pixel-panel ${state}`;
              const content = (
                <>
                  <div className="map-node-summary">
                    <PixelIcon size={MAP_NODE_ICON_SIZE} src={chapterNodeAsset(state)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-accent">第 {chapter.number} 章</span>
                        <span>{STATE_LABELS[state]}</span>
                      </div>
                      <h3 className="mt-2 text-xl">{chapter.location}</h3>
                      <p className="muted mt-1">{chapter.title}</p>
                    </div>
                  </div>
                  {chapter.isBoss && <p className="mt-3 text-danger">Boss: {chapter.bossName}</p>}
                </>
              );
              return (
                <li key={chapter.number}>
                  {accessible ? (
                    <button
                      aria-haspopup="dialog"
                      className={className}
                      onClick={() => setSelectedChapter(chapter)}
                      type="button"
                    >
                      {content}
                    </button>
                  ) : <div aria-disabled="true" className={className}>{content}</div>}
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      <dialog
        aria-labelledby="quest-dialog-title"
        className="quest-dialog"
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          event.preventDefault();
          event.currentTarget.close();
        }}
        onClose={() => setSelectedChapter(null)}
        ref={dialogReference}
      >
        {selectedChapter && (
          <article className="quest-dialog-card pixel-panel">
            <header className="quest-dialog-heading">
              <PixelIcon
                size={DIALOG_ICON_SIZE}
                src={guiAsset(selectedChapter.isBoss ? "icon-dragon" : "icon-quest")}
              />
              <div>
                <p className="eyebrow">第 {selectedChapter.number} 章 · {selectedChapter.region}</p>
                <h2 id="quest-dialog-title">{selectedChapter.location}</h2>
              </div>
            </header>
            <p className="muted mt-5">学习目标：{selectedChapter.title}</p>
            <p className="mt-3">挑战：{selectedChapter.exercise.instructions}</p>
            {selectedChapter.isBoss && <p className="status-error mt-3">Boss：{selectedChapter.bossName}</p>}
            <div className="quest-rewards mt-5">
              <PixelIcon size={DIALOG_ICON_SIZE} src={guiAsset("icon-coin")} />
              <span>基础奖励：{selectedChapter.rewardExp} EXP · {selectedChapter.rewardCoins} 金币</span>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <form method="dialog">
                <button className="pixel-button secondary" type="submit">关闭任务卡</button>
              </form>
              <Link className="pixel-button" href={`/chapter/${selectedChapter.number}`}>开始任务</Link>
            </div>
          </article>
        )}
      </dialog>
    </div>
  );
};
