"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  completeChapter as applyChapterCompletion,
  createGameState,
  type GameState,
  recordAttempt as applyAttempt,
} from "@/domain/game-state";
import { equipItem as applyEquipItem, purchaseItem as applyPurchaseItem } from "@/domain/equipment";
import { parseGameState } from "@/domain/save-game";

interface GameStore {
  readonly game: GameState | null;
  readonly hydrated: boolean;
  readonly createHero: (name: string, avatarId: number) => void;
  readonly completeChapter: (chapterNumber: number) => void;
  readonly recordAttempt: (exerciseId: string) => void;
  readonly purchaseItem: (itemId: string) => void;
  readonly equipItem: (itemId: string) => void;
  readonly loadGame: (game: GameState) => void;
  readonly reset: () => void;
  readonly setHydrated: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      game: null,
      hydrated: false,
      createHero: (name, avatarId) => set({ game: createGameState(name, avatarId) }),
      completeChapter: (chapterNumber) => set(({ game }) => ({
        game: game ? applyChapterCompletion(game, chapterNumber) : null,
      })),
      recordAttempt: (exerciseId) => set(({ game }) => ({
        game: game ? applyAttempt(game, exerciseId) : null,
      })),
      purchaseItem: (itemId) => set(({ game }) => ({
        game: game ? applyPurchaseItem(game, itemId) : null,
      })),
      equipItem: (itemId) => set(({ game }) => ({
        game: game ? applyEquipItem(game, itemId) : null,
      })),
      loadGame: (game) => set({ game }),
      reset: () => set({ game: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "python-dragonquest-save-v1",
      partialize: ({ game }) => ({ game }),
      skipHydration: true,
      merge: (persisted, current) => {
        const saved = persisted as { readonly game?: unknown };
        if (!saved.game) return current;
        try {
          return { ...current, game: parseGameState(JSON.stringify(saved.game)) };
        } catch {
          return current;
        }
      },
    },
  ),
);

export const GameHydrator = (): null => {
  const setHydrated = useGameStore(({ setHydrated }) => setHydrated);
  useEffect(() => {
    void Promise.resolve(useGameStore.persist.rehydrate()).finally(setHydrated);
  }, [setHydrated]);
  return null;
};
