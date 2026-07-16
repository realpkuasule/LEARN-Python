import assert from "node:assert/strict";
import test from "node:test";

import { getChapterViewState } from "../../src/domain/map-view.ts";
import { completeChapter, createGameState } from "../../src/domain/game-state.ts";

test("map chapter states distinguish current, completed, available, and locked", () => {
  const newGame = createGameState("验收勇者", 1, "2026-07-16T00:00:00.000Z", "hero-1");

  assert.equal(getChapterViewState(newGame, 1), "current");
  assert.equal(getChapterViewState(newGame, 2), "locked");

  const afterChapterOne = completeChapter(newGame, 1);
  assert.equal(getChapterViewState(afterChapterOne, 1), "completed");
  assert.equal(getChapterViewState(afterChapterOne, 2), "current");

  const revisitable = {
    ...afterChapterOne,
    progress: { ...afterChapterOne.progress, currentChapter: 3 },
  };
  assert.equal(getChapterViewState(revisitable, 2), "available");
  assert.equal(getChapterViewState(revisitable, 4), "locked");
});
