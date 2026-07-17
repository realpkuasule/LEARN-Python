"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  completeChapter as applyChapterCompletion,
  createGameState,
  recordAiRequest as applyAiRequest,
  updateAudioSettings as applyAudioSettings,
  updateReducedMotion as applyReducedMotion,
  type AudioSettings,
  type GameState,
  recordAttempt as applyAttempt,
} from "@/domain/game-state";
import {
  equipItem as applyEquipItem,
  purchaseHintPotion as applyPurchaseHintPotion,
  purchaseItem as applyPurchaseItem,
  useHintPotion as applyUseHintPotion,
} from "@/domain/equipment";
import { parseGameState } from "@/domain/save-game";
import { selectTitle as applyTitleSelection } from "@/domain/titles";

interface GameStore {
  readonly game: GameState | null;
  readonly hydrated: boolean;
  readonly createHero: (name: string, avatarId: number) => void;
  readonly completeChapter: (chapterNumber: number) => void;
  readonly recordAttempt: (exerciseId: string) => void;
  readonly recordAiRequest: () => void;
  readonly purchaseItem: (itemId: string) => void;
  readonly purchaseHintPotion: () => void;
  readonly consumeHintPotion: (exerciseId: string) => void;
  readonly equipItem: (itemId: string) => void;
  readonly selectTitle: (title: string) => void;
  readonly updateAudioSettings: (settings: AudioSettings) => void;
  readonly updateReducedMotion: (reducedMotion: boolean) => void;
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
      recordAiRequest: () => set(({ game }) => ({
        game: game ? applyAiRequest(game) : null,
      })),
      purchaseItem: (itemId) => set(({ game }) => ({
        game: game ? applyPurchaseItem(game, itemId) : null,
      })),
      purchaseHintPotion: () => set(({ game }) => ({
        game: game ? applyPurchaseHintPotion(game) : null,
      })),
      consumeHintPotion: (exerciseId) => set(({ game }) => ({
        game: game ? applyUseHintPotion(game, exerciseId) : null,
      })),
      equipItem: (itemId) => set(({ game }) => ({
        game: game ? applyEquipItem(game, itemId) : null,
      })),
      selectTitle: (title) => set(({ game }) => ({
        game: game ? applyTitleSelection(game, title) : null,
      })),
      updateAudioSettings: (settings) => set(({ game }) => ({
        game: game ? applyAudioSettings(game, settings) : null,
      })),
      updateReducedMotion: (reducedMotion) => set(({ game }) => ({
        game: game ? applyReducedMotion(game, reducedMotion) : null,
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
