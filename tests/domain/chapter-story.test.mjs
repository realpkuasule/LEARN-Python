import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { CHAPTERS } from "../../src/domain/chapter-catalog.ts";
import {
  buildChapterStory,
  storyMessageText,
  storyMessageUsesTypewriter,
} from "../../src/domain/chapter-story.ts";

test("story contract turns the document title into a chapter intro kept in the feed", () => {
  const story = buildChapterStory({
    number: 2,
    title: "安装与第一个程序",
    markdown: "# 第二课：Python 安装与第一个程序\n\n## 冒险引入\n\n石门打开了。",
  });

  assert.equal(story.displayTitle, "第二章：Python 安装与第一个程序");
  assert.deepEqual(
    { kind: story.messages[0]?.kind, role: story.messages[0]?.role, markdown: story.messages[0]?.markdown },
    { kind: "intro", role: "narrator", markdown: "第二章：Python 安装与第一个程序" },
  );
  assert.equal(story.messages.filter(({ kind }) => kind === "intro").length, 1);
});

test("story contract preserves sections, lists, code, tables, callouts, and the complete recap", () => {
  const story = buildChapterStory({
    number: 1,
    title: "编程为什么重要",
    markdown: [
      "# 第一课：编程为什么重要",
      "",
      "## 学习目标",
      "",
      "1. 看懂任务",
      "2. 写出代码",
      "",
      "```python",
      "print('出发')",
      "```",
      "",
      "| 角色 | HP |",
      "| --- | --- |",
      "| 勇者 | 100 |",
      "",
      "> **Prompt 示例**：请解释这段代码。",
      "",
      "## 本章回顾",
      "",
      "- 代码是精确表达",
      "- AI 会放大表达",
    ].join("\n"),
  });

  assert.ok(story.messages.some(({ kind }) => kind === "list"));
  assert.ok(story.messages.some(({ kind }) => kind === "code"));
  assert.ok(story.messages.some(({ kind }) => kind === "table"));
  assert.ok(story.messages.some(({ kind }) => kind === "callout"));
  assert.match(story.recapMarkdown, /本章回顾/);
  assert.match(story.recapMarkdown, /AI 会放大表达/);
  assert.ok(story.messages.every(({ markdown }) => markdown.trim().length > 0));
});

test("only story voices use typewriter pacing", () => {
  const pacing = ["intro", "section", "narration", "dialogue", "list", "code", "table", "callout", "recap"]
    .map((kind) => storyMessageUsesTypewriter({ kind }));

  assert.deepEqual(pacing, [false, false, true, true, false, false, false, false, true]);
});

test("explicit speaker markers cover every requested story voice", () => {
  const story = buildChapterStory({
    number: 5,
    title: "条件判断",
    bossName: "哥布林队长",
    markdown: [
      "[旁白] 风吹过洞穴。",
      "",
      "[英雄: 刘老三] 我准备好了。",
      "",
      "[友善NPC: 公会会长] 记得检查条件。",
      "",
      "[中立NPC: 裁判] 比赛开始。",
      "",
      "[敌对NPC: 哥布林队长] 你过不去。",
      "",
      "## 本章回顾",
      "",
      "记住 if。",
    ].join("\n"),
  });

  assert.deepEqual(
    story.messages.slice(1, 6).map(({ role, speaker }) => [role, speaker]),
    [
      ["narrator", "冒险主持人"],
      ["hero", "刘老三"],
      ["friendly", "公会会长"],
      ["neutral", "裁判"],
      ["hostile", "哥布林队长"],
    ],
  );
});

test("obvious existing dialogue is assigned to its speaker without author markers", () => {
  const story = buildChapterStory({
    number: 5,
    title: "条件判断",
    bossName: "哥布林队长",
    markdown: [
      "刘老三喊道：\"我准备好了！\"",
      "",
      "你愣了一下：「可我还一行代码都不会写。」",
      "",
      "「区别在哪？」你问。",
      "",
      "公会会长对你说：\"先观察，再行动。\"",
      "",
      "哥布林队长冷笑：\"你过不去。\"",
      "",
      "## 本章回顾",
      "",
      "做出判断。",
    ].join("\n"),
  });

  assert.deepEqual(story.messages.slice(1, 6).map(({ role }) => role), ["hero", "hero", "hero", "friendly", "hostile"]);
});

test("quoted book and equipment names remain narration", () => {
  const story = buildChapterStory({
    number: 2,
    title: "安装与第一个程序",
    markdown: [
      "会长把你带到石桌前。登记簿封面烫着金字：「冒险者名册」。",
      "",
      "铁匠铺出售武器：\"TRUE 之剑\"。",
      "",
      "```python",
      "print(\"勇者刘老三\")",
      "```",
      "",
      "- `print()` 是 Python 内置的喊话指令",
      "",
      "## 本章回顾",
      "",
      "记住第一行程序。",
    ].join("\n"),
  });

  assert.deepEqual(story.messages.slice(1, 3).map(({ role }) => role), ["narrator", "narrator"]);
  assert.deepEqual(story.messages.slice(3, 5).map(({ role, kind }) => [role, kind]), [
    ["narrator", "code"],
    ["narrator", "list"],
  ]);
});

test("all published chapters satisfy the playable story contract", async () => {
  for (const chapter of CHAPTERS) {
    const markdown = await readFile(new URL(`../../${chapter.sourcePath}`, import.meta.url), "utf8");
    const story = buildChapterStory({
      number: chapter.number,
      title: chapter.title,
      bossName: chapter.bossName,
      markdown,
    });

    assert.equal(story.messages[0]?.kind, "intro", `chapter ${chapter.number} intro`);
    assert.ok(story.messages.length >= 20, `chapter ${chapter.number} has a useful message flow`);
    assert.match(story.recapMarkdown, /本章回顾/, `chapter ${chapter.number} recap`);
    assert.equal(new Set(story.messages.map(({ id }) => id)).size, story.messages.length);

    const dialogue = story.messages.filter(({ kind, section }) => kind === "dialogue" && section === "body");
    assert.ok(dialogue.length >= 3, `chapter ${chapter.number} has at least three dialogue beats`);
    assert.ok(new Set(dialogue.map(({ role }) => role)).size >= 2, `chapter ${chapter.number} uses at least two character voices`);

    const longMessage = story.messages
      .filter(storyMessageUsesTypewriter)
      .find(({ markdown: messageMarkdown }) => storyMessageText(messageMarkdown).length > 240);
    assert.equal(longMessage, undefined, `chapter ${chapter.number} keeps every typewriter message within 240 characters`);
  }
});
