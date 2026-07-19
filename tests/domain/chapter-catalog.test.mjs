import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
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

test("chapter two is completed on the website while local Python stays optional", async () => {
  const chapter = CHAPTERS.find(({ number }) => number === 2);
  assert.ok(chapter);
  assert.equal(chapter.title, "第一个 Python 程序");
  assert.match(chapter.exercise.instructions, /右侧.*Python 代码.*编辑器/);

  const markdown = await readFile(new URL(`../../${chapter.sourcePath}`, import.meta.url), "utf8");
  assert.match(markdown, /本章所有必做内容都在学习网站完成，无需安装 Python/);
  assert.match(markdown, /^## 可选扩展：搭建本地 Python 环境$/m);
});

test("chapter three teaches name binding without object lifetime myths", async () => {
  const chapter = CHAPTERS.find(({ number }) => number === 3);
  assert.ok(chapter);
  assert.match(chapter.exercise.instructions, /绑定.*字符串/);

  const sources = await Promise.all([
    readFile(new URL(`../../${chapter.sourcePath}`, import.meta.url), "utf8"),
    readFile(new URL("../../docs/Python-DragonQuest/讲Python-全知识点-勇者斗恶龙版.md", import.meta.url), "utf8"),
  ]);

  for (const source of sources) {
    assert.match(source, /名字.*绑定.*对象/);
    assert.doesNotMatch(source, /不管有没有标签，它都在那|创建新对象\s*\d+|不是[「\"]没有[」\"]，是[「\"]还没[」\"]|不是不存在，是还没触发/);
  }

  const courseSources = await Promise.all(CHAPTERS.map(({ sourcePath }) => (
    readFile(new URL(`../../${sourcePath}`, import.meta.url), "utf8")
  )));
  assert.ok(courseSources.every((source) => !/变量就是给数据贴标签|变量是[「\"]给数据贴标签[」\"]|`=` 是贴标签/.test(source)));

  const chapterMarkdown = sources[0];
  assert.match(chapterMarkdown, /普通赋值不会复制这个对象/);
  assert.match(chapterMarkdown, /对象.*是否仍留在内存.*实现细节/);
  assert.match(chapterMarkdown, /None.*值的缺失/);
  assert.match(chapterMarkdown, /\/\/.*向下取整/);
});

test("rewards follow the PRD chapter formulas", () => {
  for (const chapter of CHAPTERS) {
    assert.equal(chapter.rewardExp, chapter.number * 100);
    assert.equal(chapter.rewardCoins, chapter.number * 50);
  }
});

test("all ten Bosses publish three-case function contracts without private data", () => {
  const bossFunctionNames = new Map([
    [5, "battle_result"],
    [6, "turn_sequence"],
    [7, "countdown"],
    [9, "battle_result"],
    [10, "organize_inventory"],
    [11, "hero_summary"],
    [12, "clean_dialog"],
    [14, "file_suffix"],
    [15, "safe_divide"],
    [17, "battle_turn"],
  ]);

  for (const chapter of CHAPTERS) {
    assert.equal(chapter.exercise.testCount, chapter.isBoss ? 3 : 1);
    assert.equal(Object.hasOwn(chapter.exercise, "hiddenTests"), false);
    assert.equal(Object.hasOwn(chapter.exercise, "expectedOutput"), false);
    if (chapter.isBoss) assert.match(chapter.exercise.starterCode, new RegExp(`def ${bossFunctionNames.get(chapter.number)}\\(`));
  }
});
