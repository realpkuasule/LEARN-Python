"use client";

import Link from "next/link";
import { useState } from "react";

import { PixelAvatar } from "@/components/pixel-avatar";
import { PixelSprite } from "@/components/pixel-sprite";
import { SaveControls } from "@/components/save-controls";
import { getEffectiveStats, getEquipment, type EquipmentSlot } from "@/domain/equipment";
import { playSound } from "@/lib/audio-assets";
import { itemSpriteAsset } from "@/lib/game-art-assets";
import { useGameStore } from "@/store/game-store";

const SLOT_LABELS: Readonly<Record<EquipmentSlot, string>> = {
  weapon: "武器",
  helmet: "头盔",
  armor: "护甲",
  shield: "盾牌",
  accessory: "饰品",
  boots: "靴子",
};

const PERCENT_SCALE = 100;

export const HeroDashboard = (): React.ReactNode => {
  const game = useGameStore(({ game }) => game);
  const hydrated = useGameStore(({ hydrated }) => hydrated);
  const equipItem = useGameStore(({ equipItem }) => equipItem);
  const updateAudioSettings = useGameStore(({ updateAudioSettings }) => updateAudioSettings);
  const [message, setMessage] = useState("");

  if (!hydrated) return <div className="pixel-panel p-8">正在读取勇者档案...</div>;
  if (!game) {
    return (
      <div className="pixel-panel p-8 text-center">
        <p className="text-2xl">还没有勇者档案</p>
        <Link className="pixel-button mt-6" href="/create-hero">创建勇者</Link>
      </div>
    );
  }

  const stats = getEffectiveStats(game);
  const equip = (itemId: string): void => {
    try {
      equipItem(itemId);
      playSound("equip", game.settings);
      setMessage(`${getEquipment(itemId)?.name ?? "装备"} 已装备。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "无法装备。");
    }
  };

  return (
    <div className="space-y-6">
      <section className="hero-card pixel-panel">
        <PixelAvatar avatarId={game.hero.avatarId} />
        <div>
          <p className="eyebrow">LV {game.hero.level} · {game.hero.title || "见习勇者"}</p>
          <h1>{game.hero.name}</h1>
          <p className="muted">已完成 {game.progress.completedChapters.length}/17 章 · 总经验 {game.hero.totalExp} · 金币 {game.hero.coins}</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="pixel-panel p-6">
          <h2 className="text-2xl text-accent">能力值</h2>
          <dl className="stat-grid mt-5">
            <div><dt>HP</dt><dd>{stats.maxHp}</dd></div>
            <div><dt>MP</dt><dd>{stats.maxMp}</dd></div>
            <div><dt>攻击</dt><dd>{stats.atk}</dd></div>
            <div><dt>防御</dt><dd>{stats.def}</dd></div>
          </dl>
        </div>
        <div className="pixel-panel p-6">
          <h2 className="text-2xl text-accent">当前装备</h2>
          <dl className="equipment-slots mt-5">
            {Object.entries(game.hero.equipment).map(([slot, itemId]) => (
              <div key={slot}>
                <dt>{SLOT_LABELS[slot as EquipmentSlot]}</dt>
                <dd>{itemId ? getEquipment(itemId)?.name : "未装备"}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="audio-settings pixel-panel p-6">
        <div>
          <p className="eyebrow">声音设置</p>
          <h2 className="mt-2 text-2xl">克制的冒险反馈</h2>
          <p className="muted mt-2">只在打开任务、运行代码、交易和装备时播放短音效；学习页面不会自动播放音乐。</p>
        </div>
        <button
          aria-pressed={game.settings.soundEnabled}
          className="pixel-button secondary"
          onClick={() => {
            const settings = { ...game.settings, soundEnabled: !game.settings.soundEnabled };
            updateAudioSettings(settings);
            if (settings.soundEnabled) playSound("ui-confirm", settings);
          }}
          type="button"
        >
          {game.settings.soundEnabled ? "关闭音效" : "开启音效"}
        </button>
        <label className="audio-volume" htmlFor="sfx-volume">
          <span>音效音量 <output>{Math.round(game.settings.sfxVolume * PERCENT_SCALE)}%</output></span>
          <input
            disabled={!game.settings.soundEnabled}
            id="sfx-volume"
            max={PERCENT_SCALE}
            min="0"
            onInput={(event) => updateAudioSettings({
              soundEnabled: game.settings.soundEnabled,
              sfxVolume: Number(event.currentTarget.value) / PERCENT_SCALE,
            })}
            step="5"
            type="range"
            value={game.settings.sfxVolume * PERCENT_SCALE}
          />
        </label>
      </section>

      <section className="pixel-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">背包</p>
            <h2 className="text-2xl">收集到的装备</h2>
          </div>
          <Link className="pixel-button secondary" href="/shop">前往商店</Link>
        </div>
        <ul className="item-grid mt-6">
          {game.inventory.map(({ itemId }) => {
            const item = getEquipment(itemId);
            if (!item) return null;
            const equipped = game.hero.equipment[item.slot] === item.id;
            return (
              <li className="item-card" key={item.id}>
                <span aria-hidden="true" className="item-icon">
                  <PixelSprite size={52} sprite={itemSpriteAsset(item.id)} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3>{item.name}</h3>
                  <p className="muted">{item.description}</p>
                </div>
                <button className="pixel-button" disabled={equipped} onClick={() => equip(item.id)} type="button">
                  {equipped ? "装备中" : "装备"}
                </button>
              </li>
            );
          })}
        </ul>
        {message && <p className="mt-5 text-accent" role="status">{message}</p>}
      </section>
      <SaveControls />
    </div>
  );
};
