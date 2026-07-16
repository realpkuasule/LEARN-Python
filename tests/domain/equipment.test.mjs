import assert from "node:assert/strict";
import test from "node:test";

import {
  EQUIPMENT,
  HINT_POTION_ID,
  equipItem,
  getEffectiveStats,
  purchaseHintPotion,
  purchaseItem,
  useHintPotion,
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

test("purchasing equipment deducts coins and stacks repeated copies", () => {
  const purchased = purchaseItem(richHero(), "for-spear");
  const repeated = purchaseItem(purchased, "for-spear");

  assert.equal(purchased.hero.coins, 700);
  assert.deepEqual(purchased.inventory.at(-1), { itemId: "for-spear", quantity: 1 });
  assert.equal(repeated.hero.coins, 400);
  assert.deepEqual(repeated.inventory.at(-1), { itemId: "for-spear", quantity: 2 });
});

test("hint potions cost one coin and reveal at most three hints per exercise", () => {
  const purchased = purchaseHintPotion(richHero());
  const used = useHintPotion(purchased, "chapter-06-final");

  assert.equal(purchased.hero.coins, 999);
  assert.deepEqual(purchased.inventory.at(-1), { itemId: HINT_POTION_ID, quantity: 1 });
  assert.equal(used.inventory.some(({ itemId }) => itemId === HINT_POTION_ID), false);
  assert.equal(used.progress.hintsRevealed["chapter-06-final"], 1);
  assert.throws(() => useHintPotion(used, "chapter-06-final"), /提示药水/);
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
