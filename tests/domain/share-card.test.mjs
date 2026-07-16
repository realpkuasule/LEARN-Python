import assert from "node:assert/strict";
import test from "node:test";

import { createGameState } from "../../src/domain/game-state.ts";
import { shareCardDetails } from "../../src/domain/share-card.ts";

test("share card details expose only the public local hero summary", () => {
  const state = createGameState("刘老三", 3, "2026-07-17T00:00:00.000Z", "private-hero-id");
  const details = shareCardDetails(state);

  assert.deepEqual(details, {
    name: "刘老三",
    level: 1,
    title: "见习勇者",
    completedChapters: 0,
    totalExp: 0,
    stats: { maxHp: 100, maxMp: 50, atk: 16, def: 6 },
  });
  assert.equal(JSON.stringify(details).includes("private-hero-id"), false);
});
