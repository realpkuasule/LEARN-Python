import assert from "node:assert/strict";
import test from "node:test";

import { readChapterDetail } from "../../src/server/chapter-service.ts";

test("chapter detail is assembled from the catalog and its Markdown source", async () => {
  const detail = await readChapterDetail(1);

  assert.equal(detail?.number, 1);
  assert.match(detail?.contentMarkdown ?? "", /Python/);
  assert.equal(detail?.exercise.id, "chapter-01-final");
});

test("chapter API data never leaks the expected output", async () => {
  const detail = await readChapterDetail(1);

  assert.equal(Object.hasOwn(detail?.exercise ?? {}, "expectedOutput"), false);
});

test("unknown chapters do not trigger filesystem reads", async () => {
  assert.equal(await readChapterDetail(99), undefined);
});
