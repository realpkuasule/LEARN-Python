"use client";

import { useState } from "react";

import { parseGameState, serializeGameState } from "@/domain/save-game";
import { useGameStore } from "@/store/game-store";

export const SaveControls = (): React.ReactNode => {
  const game = useGameStore(({ game }) => game);
  const loadGame = useGameStore(({ loadGame }) => loadGame);
  const [message, setMessage] = useState("");

  const download = (): void => {
    if (!game) return;
    const url = URL.createObjectURL(new Blob([serializeGameState(game)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "python-dragonquest-save.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("存档已导出。");
  };

  const upload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      loadGame(parseGameState(await file.text()));
      setMessage("存档已导入并保存到本机。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "无法导入存档。");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <section className="save-controls pixel-panel">
      <div>
        <p className="eyebrow">本地存档</p>
        <p className="muted">导出 JSON 可备份进度；导入时会严格校验版本和字段。</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button className="pixel-button secondary" onClick={download} type="button">导出存档</button>
        <label className="pixel-button" htmlFor="save-upload">导入存档</label>
        <input accept="application/json,.json" className="sr-only" id="save-upload" onChange={(event) => void upload(event)} type="file" />
      </div>
      {message && <p className="text-accent" role="status">{message}</p>}
    </section>
  );
};
