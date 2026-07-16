import assert from "node:assert/strict";
import test from "node:test";

import { createGameState } from "../../src/domain/game-state.ts";
import { parseGameState, serializeGameState } from "../../src/domain/save-game.ts";

const state = createGameState("刘老三", 3, "2026-07-16T00:00:00.000Z", "hero-1");

test("a contracted game state survives export and import", () => {
  assert.deepEqual(parseGameState(serializeGameState(state)), state);
});

test("legacy v1 saves migrate to the current audio preferences contract", () => {
  const legacy = {
    ...state,
    version: 1,
    settings: { soundEnabled: false, reducedMotion: true },
  };

  assert.deepEqual(parseGameState(JSON.stringify(legacy)), {
    ...state,
    settings: { soundEnabled: false, sfxVolume: 0.55, reducedMotion: true },
  });
});

test("imports reject unknown versions and missing required sections", () => {
  assert.throws(() => parseGameState(JSON.stringify({ ...state, version: 3 })), /版本/);
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
});
