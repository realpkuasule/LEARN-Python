import assert from "node:assert/strict";
import test from "node:test";

import { createGameState } from "../../src/domain/game-state.ts";
import { parseGameState, serializeGameState } from "../../src/domain/save-game.ts";

const state = createGameState("刘老三", 3, "2026-07-16T00:00:00.000Z", "hero-1");

test("a contracted game state survives export and import", () => {
  assert.deepEqual(parseGameState(serializeGameState(state)), state);
});

test("legacy v1 saves migrate to the current progress and achievement contract", () => {
  const legacy = {
    version: 1,
    hero: state.hero,
    progress: {
      currentChapter: state.progress.currentChapter,
      completedChapters: state.progress.completedChapters,
      attempts: state.progress.attempts,
    },
    inventory: state.inventory,
    settings: { soundEnabled: false, reducedMotion: true },
  };

  assert.deepEqual(parseGameState(JSON.stringify(legacy)), {
    ...state,
    settings: { soundEnabled: false, sfxVolume: 0.55, reducedMotion: true },
  });
});

test("legacy v2 saves add hint and title progress without losing data", () => {
  const legacy = {
    version: 2,
    hero: state.hero,
    progress: {
      currentChapter: state.progress.currentChapter,
      completedChapters: state.progress.completedChapters,
      attempts: state.progress.attempts,
    },
    inventory: state.inventory,
    settings: state.settings,
  };

  assert.deepEqual(parseGameState(JSON.stringify(legacy)), state);
});

test("legacy v3 saves add story checkpoint progress without losing data", () => {
  const legacyProgress = {
    currentChapter: state.progress.currentChapter,
    completedChapters: state.progress.completedChapters,
    attempts: state.progress.attempts,
    hintsRevealed: state.progress.hintsRevealed,
  };
  const legacy = { ...state, version: 3, progress: legacyProgress };

  assert.deepEqual(parseGameState(JSON.stringify(legacy)), state);
});

test("imports reject unknown versions and missing required sections", () => {
  assert.throws(() => parseGameState(JSON.stringify({ ...state, version: 5 })), /版本/);
  const withoutHero = JSON.parse(JSON.stringify(state));
  Reflect.deleteProperty(withoutHero, "hero");
  assert.throws(() => parseGameState(JSON.stringify(withoutHero)), /存档/);
});

test("imports enforce the contract's no-unknown-fields rule", () => {
  assert.throws(() => parseGameState(JSON.stringify({ ...state, cheatMode: true })), /存档/);
  assert.throws(() => parseGameState(JSON.stringify({
    ...state,
    hero: { ...state.hero, secret: "dragon" },
  })), /存档/);
  assert.throws(() => parseGameState(JSON.stringify({
    ...state,
    progress: { ...state.progress, storyCheckpoints: { 1: ["exercise-1", "exercise-1"] } },
  })), /存档/);
});
