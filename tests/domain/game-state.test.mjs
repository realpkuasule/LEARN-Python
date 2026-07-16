import assert from "node:assert/strict";
import test from "node:test";

import {
  canAccessChapter,
  completeChapter,
  createGameState,
  updateAudioSettings,
} from "../../src/domain/game-state.ts";

test("a new hero starts with the contracted stats and chapter one unlocked", () => {
  const state = createGameState("刘老三", 3, "2026-07-16T00:00:00.000Z", "hero-1");

  assert.equal(state.version, 2);
  assert.equal(state.hero.level, 1);
  assert.equal(state.hero.totalExp, 0);
  assert.equal(state.hero.coins, 0);
  assert.deepEqual(state.hero.baseStats, { maxHp: 100, maxMp: 50, atk: 15, def: 5 });
  assert.deepEqual(state.settings, { soundEnabled: true, sfxVolume: 0.55, reducedMotion: false });
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
  assert.equal(state.hero.totalExp, baseExp + 200);
  assert.equal(state.hero.coins, baseCoins + 300);
});
