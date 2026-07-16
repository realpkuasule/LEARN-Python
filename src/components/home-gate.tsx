"use client";

import Link from "next/link";

import { useGameStore } from "@/store/game-store";

export const HomeGate = (): React.ReactNode => {
  const game = useGameStore(({ game }) => game);
  const hydrated = useGameStore(({ hydrated }) => hydrated);
  const href = game ? "/map" : "/create-hero";
  const label = game ? "继续冒险" : "创建勇者";

  return (
    <Link aria-disabled={!hydrated} className="pixel-button" href={hydrated ? href : "#"}>
      {hydrated ? label : "读取存档中"}
    </Link>
  );
};
