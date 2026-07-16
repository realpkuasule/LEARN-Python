import assert from "node:assert/strict";
import test from "node:test";

import { CHAPTERS } from "../../src/domain/chapter-catalog.ts";
import { getChapterHints } from "../../src/domain/chapter-hints.ts";

test("every chapter exposes three prewritten hints without publishing answers", () => {
  for (const chapter of CHAPTERS) {
    const hints = getChapterHints(chapter.number);
    assert.equal(hints.length, 3);
    assert.ok(hints.every((hint) => hint.length >= 8));
  }
});
