"use client";

import Link from "next/link";
import { useState } from "react";

import { EQUIPMENT } from "@/domain/equipment";
import { useGameStore } from "@/store/game-store";

const describeStats = (stats: Readonly<Record<string, number | undefined>>): string => (
  Object.entries(stats).map(([name, value]) => `${name.toUpperCase()} +${value}`).join(" · ")
);

export const EquipmentShop = (): React.ReactNode => {
  const game = useGameStore(({ game }) => game);
  const hydrated = useGameStore(({ hydrated }) => hydrated);
  const purchaseItem = useGameStore(({ purchaseItem }) => purchaseItem);
  const [message, setMessage] = useState("");

  if (!hydrated) return <div className="pixel-panel p-8">商人正在清点货架...</div>;
  if (!game) {
    return (
      <div className="pixel-panel p-8 text-center">
        <p className="text-2xl">商人只接待登记过的勇者</p>
        <Link className="pixel-button mt-6" href="/create-hero">创建勇者</Link>
      </div>
    );
  }

  const buy = (itemId: string): void => {
    try {
      purchaseItem(itemId);
      setMessage("交易完成！装备已放入背包。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "交易失败。");
    }
  };

  return (
    <div>
      <header className="shop-heading pixel-panel">
        <div>
          <p className="eyebrow">冒险者商店</p>
          <h1>像素装备铺</h1>
          <p className="muted">课程越深入，商店会解锁越强的原创装备。</p>
        </div>
        <div className="coin-purse">金币 <strong>{game.hero.coins}</strong></div>
      </header>
      {message && <p className="pixel-panel mt-5 p-4 text-accent" role="status">{message}</p>}
      <ul className="shop-grid mt-6">
        {EQUIPMENT.filter(({ price }) => price > 0).map((item) => {
          const owned = game.inventory.some(({ itemId }) => itemId === item.id);
          const locked = game.progress.currentChapter < item.unlockChapter;
          const affordable = game.hero.coins >= item.price;
          return (
            <li className={`shop-item pixel-panel ${locked ? "locked" : ""}`} key={item.id}>
              <span aria-hidden="true" className="shop-sprite">{item.slot.slice(0, 1).toUpperCase()}</span>
              <p className="eyebrow">{item.slot} · 第 {item.unlockChapter} 章</p>
              <h2>{item.name}</h2>
              <p className="muted min-h-12">{item.description}</p>
              <p className="mt-4 text-accent">{describeStats(item.stats)}</p>
              <button className="pixel-button mt-5 w-full" disabled={owned || locked || !affordable} onClick={() => buy(item.id)} type="button">
                {owned ? "已拥有" : locked ? `第 ${item.unlockChapter} 章解锁` : !affordable ? `金币不足 · ${item.price}` : `购买 · ${item.price}`}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
