import assert from "node:assert/strict";
import test from "node:test";

import {
  BOSS_COIN_BONUS,
  BOSS_EXP_BONUS,
  canAccessChapter,
  completeChapter,
  createGameState,
  recordAttempt,
  updateAudioSettings,
} from "../../src/domain/game-state.ts";

test("a new hero starts with the contracted stats and chapter one unlocked", () => {
  const state = createGameState("刘老三", 3, "2026-07-16T00:00:00.000Z", "hero-1");

  assert.equal(state.version, 3);
  assert.equal(state.hero.level, 1);
  assert.equal(state.hero.totalExp, 0);
  assert.equal(state.hero.coins, 0);
  assert.deepEqual(state.hero.baseStats, { maxHp: 100, maxMp: 50, atk: 15, def: 5 });
  assert.deepEqual(state.settings, { soundEnabled: true, sfxVolume: 0.55, reducedMotion: false });
  assert.deepEqual(state.progress.hintsRevealed, {});
  assert.deepEqual(state.achievements, { unlockedTitles: [], aiRequests: 0 });
  assert.equal(canAccessChapter(state, 1), true);
  assert.equal(canAccessChapter(state, 2), false);
});

test("audio preferences update within the contracted volume range", () => {
  const state = createGameState("刘老三", 1, "2026-07-16T00:00:00.000Z", "hero-1");
  const updated = updateAudioSettings(state, { soundEnabled: false, sfxVolume: 0.25 });

  assert.deepEqual(updated.settings, { soundEnabled: false, sfxVolume: 0.25, reducedMotion: false });
  assert.throws(() => updateAudioSettings(state, { soundEnabled: true, sfxVolume: -0.1 }), /音量/);
  assert.throws(() => updateAudioSettings(state, { soundEnabled: true, sfxVolume: 1.1 }), /音量/);
});

test("completing a chapter grants formula rewards and unlocks the next chapter", () => {
  const state = createGameState("刘老三", 1, "2026-07-16T00:00:00.000Z", "hero-1");
  const completed = completeChapter(state, 1);

  assert.equal(completed.hero.totalExp, 100);
  assert.equal(completed.hero.coins, 50);
  assert.deepEqual(completed.progress.completedChapters, [1]);
  assert.equal(completed.progress.currentChapter, 2);
  assert.equal(canAccessChapter(completed, 2), true);
});

test("completion is idempotent and locked chapters cannot be skipped", () => {
  const state = createGameState("刘老三", 1, "2026-07-16T00:00:00.000Z", "hero-1");
  const once = completeChapter(state, 1);

  assert.deepEqual(completeChapter(once, 1), once);
  assert.throws(() => completeChapter(state, 2), /尚未解锁/);
});

test("boss chapters add the contracted 200 EXP and 300 coins", () => {
  let state = createGameState("刘老三", 1, "2026-07-16T00:00:00.000Z", "hero-1");
  for (let chapter = 1; chapter <= 5; chapter += 1) state = completeChapter(state, chapter);

  const baseExp = (1 + 2 + 3 + 4 + 5) * 100;
  const baseCoins = (1 + 2 + 3 + 4 + 5) * 50;
  assert.equal(BOSS_EXP_BONUS, 200);
  assert.equal(BOSS_COIN_BONUS, 300);
  assert.equal(state.hero.totalExp, baseExp + BOSS_EXP_BONUS);
  assert.equal(state.hero.coins, baseCoins + BOSS_COIN_BONUS);
});

test("Boss completion grants declared first-copy drops exactly once", () => {
  let state = createGameState("刘老三", 1, "2026-07-16T00:00:00.000Z", "hero-1");
  for (let chapter = 1; chapter <= 6; chapter += 1) state = completeChapter(state, chapter);

  assert.equal(state.inventory.find(({ itemId }) => itemId === "for-spear")?.quantity, 1);
  assert.equal(state.inventory.find(({ itemId }) => itemId === "indentation-helmet")?.quantity, 1);
  assert.deepEqual(completeChapter(state, 6), state);
});

test("one-attempt completion unlocks the speed-run title", () => {
  let state = createGameState("刘老三", 1, "2026-07-16T00:00:00.000Z", "hero-1");
  state = recordAttempt(state, "chapter-01-final");
  state = completeChapter(state, 1);

  assert.ok(state.achievements.unlockedTitles.includes("速通达人"));
});

test("completing all chapters settles all ten Boss bonuses exactly once", () => {
  let state = createGameState("刘老三", 1, "2026-07-17T00:00:00.000Z", "hero-1");
  for (let chapter = 1; chapter <= 17; chapter += 1) state = completeChapter(state, chapter);

  assert.equal(state.hero.totalExp, 17_300);
  assert.equal(state.hero.coins, 10_650);
  assert.equal(state.hero.title, "赤帝之子");
  assert.ok(state.achievements.unlockedTitles.includes("所以你问的谁"));
  assert.equal(state.inventory.find(({ itemId }) => itemId === "second-run-proof")?.quantity, 1);
  assert.equal(state.progress.completedChapters.length, 17);
  assert.equal(state.progress.currentChapter, 17);
});
