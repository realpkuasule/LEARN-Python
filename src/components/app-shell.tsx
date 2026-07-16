"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { PixelAvatar } from "@/components/pixel-avatar";
import { PixelSprite } from "@/components/pixel-sprite";
import { playSound } from "@/lib/audio-assets";
import { guiSpriteAsset } from "@/lib/game-art-assets";
import { GameHydrator, useGameStore } from "@/store/game-store";

const NAVIGATION = [
  { href: "/map", label: "地图" },
  { href: "/hero", label: "角色" },
  { href: "/shop", label: "商店" },
  { href: "/leaderboard", label: "排行榜" },
] as const;

export const AppShell = ({ children }: Readonly<{ children: ReactNode }>): ReactNode => {
  const pathname = usePathname();
  const game = useGameStore(({ game }) => game);
  const updateAudioSettings = useGameStore(({ updateAudioSettings }) => updateAudioSettings);

  return (
    <div className="app-shell">
      <GameHydrator />
      <header className="topbar">
        <Link className="brand" href={game ? "/map" : "/"}>
          <PixelSprite className="brand-mark" size={32} sprite={guiSpriteAsset("python-rune")} />
          <span>Python 勇者斗恶龙</span>
        </Link>
        <nav aria-label="主导航" className="main-nav">
          {NAVIGATION.map(({ href, label }) => (
            <Link aria-current={pathname.startsWith(href) ? "page" : undefined} href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="hero-hud" aria-label="勇者状态">
          {game ? (
            <>
              <span className="hud-stat">LV <strong>{game.hero.level}</strong></span>
              <span className="hud-stat">金币 <strong>{game.hero.coins}</strong></span>
              <button
                aria-label={game.settings.soundEnabled ? "关闭音效" : "开启音效"}
                aria-pressed={game.settings.soundEnabled}
                className="audio-toggle"
                onClick={() => {
                  const settings = { ...game.settings, soundEnabled: !game.settings.soundEnabled };
                  updateAudioSettings(settings);
                  if (settings.soundEnabled) playSound("ui-confirm", settings);
                }}
                type="button"
              >
                音效 {game.settings.soundEnabled ? "开" : "关"}
              </button>
              <PixelAvatar avatarId={game.hero.avatarId} compact />
            </>
          ) : <span className="muted">尚未创建勇者</span>}
        </div>
      </header>
      {children}
    </div>
  );
};
