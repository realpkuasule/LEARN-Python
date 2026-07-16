import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";

import { CHAPTERS } from "../../src/domain/chapter-catalog.ts";

const BOSS_CHAPTERS = [5, 6, 7, 9, 10, 11, 12, 14, 15, 17];

test("catalog contains exactly 17 sequential chapters and 10 declared bosses", () => {
  assert.equal(CHAPTERS.length, 17);
  assert.deepEqual(CHAPTERS.map(({ number }) => number), Array.from({ length: 17 }, (_, index) => index + 1));
  assert.deepEqual(CHAPTERS.filter(({ isBoss }) => isBoss).map(({ number }) => number), BOSS_CHAPTERS);
});

test("every chapter has one unique assessed exercise and an existing Markdown source", async () => {
  const ids = CHAPTERS.map(({ exercise }) => exercise.id);
  assert.equal(new Set(ids).size, 17);

  await Promise.all(CHAPTERS.map(async ({ sourcePath, exercise }) => {
    assert.match(exercise.id, /^chapter-\d{2}-final$/);
    assert.ok(exercise.starterCode.trim());
    await access(new URL(`../../${sourcePath}`, import.meta.url));
  }));
});

test("rewards follow the PRD chapter formulas", () => {
  for (const chapter of CHAPTERS) {
    assert.equal(chapter.rewardExp, chapter.number * 100);
    assert.equal(chapter.rewardCoins, chapter.number * 50);
  }
});
