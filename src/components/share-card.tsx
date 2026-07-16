"use client";
/* eslint-disable no-magic-numbers -- Fixed pixel positions define the exported 1200×630 card artwork. */

import { useState } from "react";

import type { GameState } from "@/domain/game-state";
import { shareCardDetails } from "@/domain/share-card";
import { portraitSpriteAsset } from "@/lib/game-art-assets";

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const AVATAR_SIZE = 250;
const PNG_QUALITY = 1;

const loadImage = (source: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error("角色像素图加载失败。"));
  image.src = source;
});

const canvasBlob = (canvas: HTMLCanvasElement): Promise<Blob> => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("角色卡生成失败。")), "image/png", PNG_QUALITY);
});

const drawCard = async (game: GameState): Promise<Blob> => {
  const details = shareCardDetails(game);
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("浏览器不支持角色卡绘制。");

  await document.fonts.load('32px "Fusion Pixel"');
  context.imageSmoothingEnabled = false;
  context.fillStyle = "#0b1020";
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  context.fillStyle = "#17233a";
  context.fillRect(28, 28, CARD_WIDTH - 56, CARD_HEIGHT - 56);
  context.strokeStyle = "#d6a84b";
  context.lineWidth = 8;
  context.strokeRect(40, 40, CARD_WIDTH - 80, CARD_HEIGHT - 80);

  const sprite = portraitSpriteAsset(game.hero.avatarId);
  const image = await loadImage(sprite.src);
  const cellWidth = sprite.sheetWidth / sprite.columns;
  const cellHeight = sprite.sheetHeight / sprite.rows;
  const column = sprite.index % sprite.columns;
  const row = Math.floor(sprite.index / sprite.columns);
  context.fillStyle = "#07101d";
  context.fillRect(78, 138, AVATAR_SIZE + 16, AVATAR_SIZE + 16);
  context.drawImage(
    image,
    column * cellWidth,
    row * cellHeight,
    cellWidth,
    cellHeight,
    86,
    146,
    AVATAR_SIZE,
    AVATAR_SIZE,
  );

  context.fillStyle = "#d6a84b";
  context.font = '34px "Fusion Pixel", monospace';
  context.fillText("PYTHON DRAGONQUEST · 勇者角色卡", 78, 100);
  context.fillStyle = "#f2ead3";
  context.font = '58px "Fusion Pixel", monospace';
  context.fillText(details.name, 386, 190);
  context.fillStyle = "#d6a84b";
  context.font = '30px "Fusion Pixel", monospace';
  context.fillText(`LV ${details.level} · ${details.title}`, 390, 242);
  context.fillStyle = "#aab6c8";
  context.fillText(`完成 ${details.completedChapters}/17 章 · ${details.totalExp} EXP`, 390, 292);

  const stats = [
    ["HP", details.stats.maxHp],
    ["MP", details.stats.maxMp],
    ["ATK", details.stats.atk],
    ["DEF", details.stats.def],
  ] as const;
  stats.forEach(([label, value], index) => {
    const x = 390 + (index % 2) * 300;
    const y = 344 + Math.floor(index / 2) * 104;
    context.fillStyle = "#22324d";
    context.fillRect(x, y, 270, 78);
    context.fillStyle = "#aab6c8";
    context.font = '24px "Fusion Pixel", monospace';
    context.fillText(label, x + 18, y + 31);
    context.fillStyle = "#f2ead3";
    context.font = '34px "Fusion Pixel", monospace';
    context.fillText(String(value), x + 120, y + 47);
  });
  context.fillStyle = "#aab6c8";
  context.font = '24px "Fusion Pixel", monospace';
  context.fillText("写 Python · 打 Boss · 升级勇者", 78, 520);
  return canvasBlob(canvas);
};

export const ShareCard = ({ game }: Readonly<{ game: GameState }>): React.ReactNode => {
  const [message, setMessage] = useState("");
  const [shareFile, setShareFile] = useState<File | null>(null);

  const share = async (): Promise<void> => {
    try {
      setMessage("正在绘制像素角色卡...");
      const blob = await drawCard(game);
      const file = new File([blob], "python-dragonquest-hero.png", { type: "image/png" });
      if (typeof navigator.share === "function"
        && typeof navigator.canShare === "function"
        && navigator.canShare({ files: [file] })) {
        setShareFile(file);
        setMessage("角色卡已生成；点击下方按钮即可调用系统分享。");
        return;
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.name;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage("角色卡已生成。");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setMessage("已取消分享。");
        return;
      }
      setMessage(error instanceof Error ? error.message : "角色卡生成失败。");
    }
  };

  const shareGenerated = (): void => {
    if (!shareFile || typeof navigator.share !== "function") return;
    void navigator.share({ files: [shareFile], title: `${game.hero.name}的 Python 勇者角色卡` })
      .then(() => setMessage("角色卡已分享。"))
      .catch((error: unknown) => setMessage(
        error instanceof DOMException && error.name === "AbortError" ? "已取消分享。" : "系统分享失败，请重试。",
      ));
  };

  return (
    <section className="share-card-actions pixel-panel">
      <div>
        <p className="eyebrow">角色分享卡片</p>
        <p className="muted">生成 1200×630 原创像素角色卡；不包含存档 ID、代码或其他私有数据。</p>
      </div>
      <button className="pixel-button" onClick={() => void share()} type="button">生成并分享 PNG</button>
      {shareFile && <button className="pixel-button secondary" onClick={shareGenerated} type="button">分享已生成的角色卡</button>}
      {message && <p role="status">{message}</p>}
    </section>
  );
};
