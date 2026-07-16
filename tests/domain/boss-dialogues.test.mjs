import assert from "node:assert/strict";
import test from "node:test";

import { CHAPTERS } from "../../src/domain/chapter-catalog.ts";
import { getBossDialogue } from "../../src/domain/boss-dialogues.ts";

test("every Boss has a distinct keyboard-choice encounter", () => {
  const bosses = CHAPTERS.filter(({ isBoss }) => isBoss);
  const openings = new Set();

  for (const boss of bosses) {
    const dialogue = getBossDialogue(boss.number);
    openings.add(dialogue.opening);
    assert.equal(dialogue.options.length, 2);
    assert.equal(dialogue.options.filter(({ correct }) => correct).length, 1);
    assert.ok(dialogue.victory.length > 8);
  }
  assert.equal(openings.size, bosses.length);
});
