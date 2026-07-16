import assert from "node:assert/strict";
import test from "node:test";

import { CHAPTERS } from "../../src/domain/chapter-catalog.ts";
import { completeChapter, createGameState, recordAttempt } from "../../src/domain/game-state.ts";
import { TITLES, selectTitle } from "../../src/domain/titles.ts";

test("the title catalog contains the sixteen unique PRD titles", () => {
  assert.equal(TITLES.length, 16);
  assert.equal(new Set(TITLES.map(({ name }) => name)).size, 16);
  assert.ok(TITLES.some(({ name }) => name === "人工智能"));
});

test("all first-attempt Boss victories unlock the contracted challenge title", () => {
  let state = createGameState("刘老三", 1, "2026-07-17T00:00:00.000Z", "hero-1");
  for (const chapter of CHAPTERS) {
    if (chapter.isBoss) state = recordAttempt(state, chapter.exercise.id);
    state = completeChapter(state, chapter.number);
  }

  assert.ok(state.achievements.unlockedTitles.includes("这个称号有点难度"));
});

test("only unlocked titles can be selected", () => {
  const state = completeChapter(createGameState("刘老三", 1, "2026-07-17T00:00:00.000Z", "hero-1"), 1);

  assert.equal(selectTitle(state, "初出茅庐").hero.title, "初出茅庐");
  assert.throws(() => selectTitle(state, "赤帝之子"), /尚未解锁/);
});
