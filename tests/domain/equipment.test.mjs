import assert from "node:assert/strict";
import test from "node:test";

import {
  EQUIPMENT,
  equipItem,
  getEffectiveStats,
  purchaseItem,
} from "../../src/domain/equipment.ts";
import { createGameState } from "../../src/domain/game-state.ts";

const richHero = () => {
  const state = createGameState("刘老三", 1, "2026-07-16T00:00:00.000Z", "hero-1");
  return {
    ...state,
    hero: { ...state.hero, coins: 1_000 },
    progress: { ...state.progress, currentChapter: 8 },
  };
};

test("the equipment catalog matches the PRD's 15 named items", () => {
  assert.equal(EQUIPMENT.length, 15);
  assert.ok(EQUIPMENT.some(({ id }) => id === "wood-sword"));
  assert.ok(EQUIPMENT.some(({ id }) => id === "cloth-armor"));
  assert.ok(EQUIPMENT.some(({ id }) => id === "second-run-proof"));
  assert.equal(new Set(EQUIPMENT.map(({ id }) => id)).size, EQUIPMENT.length);
});

test("purchasing equipment deducts coins and adds one inventory item", () => {
  const purchased = purchaseItem(richHero(), "for-spear");

  assert.equal(purchased.hero.coins, 700);
  assert.deepEqual(purchased.inventory.at(-1), { itemId: "for-spear", quantity: 1 });
  assert.throws(() => purchaseItem(purchased, "for-spear"), /已经拥有/);
});

test("purchases enforce chapter and coin requirements", () => {
  const state = createGameState("刘老三", 1, "2026-07-16T00:00:00.000Z", "hero-1");

  assert.throws(() => purchaseItem(state, "for-spear"), /章节/);
  const unlocked = { ...state, progress: { ...state.progress, currentChapter: 8 } };
  assert.throws(() => purchaseItem(unlocked, "for-spear"), /金币/);
});

test("owned items can be equipped and contribute to effective stats", () => {
  const purchased = purchaseItem(richHero(), "for-spear");
  const equipped = equipItem(purchased, "for-spear");

  assert.equal(equipped.hero.equipment.weapon, "for-spear");
  assert.equal(getEffectiveStats(equipped).atk, equipped.hero.baseStats.atk + 18);
  assert.throws(() => equipItem(equipped, "while-charm"), /背包/);
});
