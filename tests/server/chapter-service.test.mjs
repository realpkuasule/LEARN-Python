import assert from "node:assert/strict";
import test from "node:test";

import { readChapterDetail } from "../../src/server/chapter-service.ts";

test("chapter detail is assembled from the catalog and its Markdown source", async () => {
  const detail = await readChapterDetail(1);

  assert.equal(detail?.number, 1);
  assert.match(detail?.contentMarkdown ?? "", /Python/);
  assert.equal(detail?.exercise.id, "chapter-01-final");
});

test("chapter API data exposes test counts without leaking private assessments", async () => {
  const detail = await readChapterDetail(5);

  assert.equal(Object.hasOwn(detail?.exercise ?? {}, "expectedOutput"), false);
  assert.equal(Object.hasOwn(detail?.exercise ?? {}, "hiddenTests"), false);
  assert.equal(detail?.exercise.testCount, 3);
  assert.equal(detail?.bossName, "条件判断哥布林队长");
  assert.equal(detail?.titleReward, "条件判断克星");
});

test("unknown chapters do not trigger filesystem reads", async () => {
  assert.equal(await readChapterDetail(99), undefined);
});
