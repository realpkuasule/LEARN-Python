import assert from "node:assert/strict";
import test from "node:test";

import {
  buildChapterStory,
  storyCheckpointSatisfied,
  storyMessageUsesTypewriter,
  storyPracticeResultMessage,
  storyProgressLimit,
  storyRunMode,
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

test("authored practice checkpoints gate reveal-all in document order", () => {
  const story = buildChapterStory({
    number: 2,
    title: "第一个 Python 程序",
    markdown: [
      "## 核心讲解",
      "",
      "先观察。",
      "",
      "[实践检查点: first-run/success]",
      "运行第一行代码。",
      "",
      "继续讲解。",
      "",
      "[实践检查点: multi-line-output/output]",
      "观察多行输出。",
      "",
      "继续讲解。",
      "",
      "[实践检查点: comma-output/output]",
      "观察逗号分隔的输出。",
      "",
      "继续讲解。",
      "",
      "[实践检查点: syntax-error/error]",
      "观察一次语法错误。",
      "",
      "## 本章回顾",
      "",
      "再总结。",
    ].join("\n"),
  });
  const checkpoints = story.messages.filter(({ checkpoint }) => checkpoint);

  assert.deepEqual(checkpoints.map(({ checkpoint, markdown }) => [checkpoint, markdown]), [
    [{ id: "first-run", requirement: "success", instruction: "运行第一行代码。" }, "运行第一行代码。"],
    [{ id: "multi-line-output", requirement: "output", instruction: "观察多行输出。" }, "观察多行输出。"],
    [{ id: "comma-output", requirement: "output", instruction: "观察逗号分隔的输出。" }, "观察逗号分隔的输出。"],
    [{ id: "syntax-error", requirement: "error", instruction: "观察一次语法错误。" }, "观察一次语法错误。"],
  ]);
  assert.equal(storyProgressLimit(story.messages, [], false), story.messages.indexOf(checkpoints[0]));
  assert.equal(storyProgressLimit(story.messages, ["first-run"], false), story.messages.indexOf(checkpoints[1]));
  assert.equal(storyProgressLimit(story.messages, ["first-run", "multi-line-output"], false), story.messages.indexOf(checkpoints[2]));
  assert.equal(storyProgressLimit(story.messages, ["first-run", "multi-line-output", "comma-output"], false), story.messages.indexOf(checkpoints[3]));
  assert.equal(storyProgressLimit(story.messages, ["first-run", "multi-line-output", "comma-output", "syntax-error"], false), story.messages.length);
});

test("manual checkpoints gate non-code learning activities without unlocking the runner", () => {
  const story = buildChapterStory({
    number: 1,
    title: "编程为什么重要",
    markdown: "练习。\n\n[实践检查点: prompt-comparison/confirm]\n完成两版 Prompt 对比后确认。",
  });
  const checkpoint = story.messages[2]?.checkpoint;

  assert.deepEqual(checkpoint, {
    id: "prompt-comparison",
    requirement: "confirm",
    instruction: "完成两版 Prompt 对比后确认。",
  });
  assert.equal(storyRunMode(true, checkpoint), "locked");
});

test("chapters without authored checkpoints still require one run before recap", () => {
  const story = buildChapterStory({
    number: 1,
    title: "编程为什么重要",
    markdown: "## 核心讲解\n\n先观察。\n\n## 本章回顾\n\n再总结。",
  });
  const recapIndex = story.messages.findIndex(({ section }) => section === "recap");

  assert.equal(storyProgressLimit(story.messages, [], false), recapIndex);
  assert.equal(storyProgressLimit(story.messages, [], true), story.messages.length);
});

test("checkpoint requirements distinguish attempts, output, Python errors, and final passes", () => {
  const result = (status, stdout = "") => ({ status, stdout });

  assert.equal(storyCheckpointSatisfied("run", result("failed")), true);
  assert.equal(storyCheckpointSatisfied("success", result("failed")), false);
  assert.equal(storyCheckpointSatisfied("success", result("passed", "Hello, Python!\n")), true);
  assert.equal(storyCheckpointSatisfied("output", result("error")), false);
  assert.equal(storyCheckpointSatisfied("output", result("failed")), false);
  assert.equal(storyCheckpointSatisfied("output", result("failed", "第一行\n第二行\n")), true);
  assert.equal(storyCheckpointSatisfied("error", result("failed")), false);
  assert.equal(storyCheckpointSatisfied("error", result("passed")), false);
  assert.equal(storyCheckpointSatisfied("error", result("error")), true);
  assert.equal(storyCheckpointSatisfied("pass", result("error")), false);
  assert.equal(storyCheckpointSatisfied("pass", result("passed")), true);
});

test("guided runs stay locked until the story reaches a checkpoint", () => {
  assert.equal(storyRunMode(false), "formal");
  assert.equal(storyRunMode(true), "locked");
  assert.equal(storyRunMode(true, { id: "first-run", requirement: "success", instruction: "运行" }), "practice");
  assert.equal(storyRunMode(true, { id: "multi-line-output", requirement: "output", instruction: "观察输出" }), "practice");
  assert.equal(storyRunMode(true, { id: "syntax-error", requirement: "error", instruction: "报错" }), "practice");
  assert.equal(storyRunMode(true, { id: "final-challenge", requirement: "pass", instruction: "通关" }), "formal");
  assert.equal(storyRunMode(true, undefined, true), "formal");
});

test("practice feedback never claims an unmet checkpoint was completed", () => {
  const passed = { status: "passed", message: "挑战通过，奖励已结算。" };

  assert.equal(storyPracticeResultMessage(passed, false, false), "代码运行成功，但尚未满足当前实践要求。");
  assert.equal(storyPracticeResultMessage(passed, true, false), "本次练习符合要求，实践检查点已完成。");
  assert.equal(storyPracticeResultMessage(passed, true, true), passed.message);
});

test("only story voices use typewriter pacing", () => {
  const pacing = ["intro", "section", "narration", "dialogue", "list", "code", "table", "callout", "checkpoint", "recap"]
    .map((kind) => storyMessageUsesTypewriter({ kind }));

  assert.deepEqual(pacing, [false, false, true, true, false, false, false, false, false, true]);
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

test("explicit hero markers keep the current player's identity", () => {
  const story = buildChapterStory({
    number: 2,
    title: "安装与第一个程序",
    heroName: "视觉验收勇者",
    markdown: "[英雄: 刘老三] 我准备好了。",
  });

  assert.equal(story.messages[1]?.speaker, "视觉验收勇者");
});

test("story prose uses the current hero name without rewriting code examples", () => {
  const story = buildChapterStory({
    number: 2,
    title: "安装与第一个程序",
    heroName: "视觉验收勇者",
    markdown: [
      "[友善NPC: 会长] 「准备好了吗，刘老三？」",
      "",
      "勇者刘老三打开角色卡，刘老三看到代码是 `name = \"刘老三\"`。",
      "",
      "```python",
      "print(\"刘老三\")",
      "```",
      "",
      "## 本章回顾",
      "",
      "刘老三继续前进。",
    ].join("\n"),
  });

  assert.equal(story.messages[1]?.markdown, "「准备好了吗，视觉验收勇者？」");
  assert.equal(story.messages[2]?.markdown, "视觉验收勇者打开角色卡，视觉验收勇者看到代码是 `name = \"刘老三\"`。");
  assert.match(story.recapMarkdown, /视觉验收勇者继续前进/);
  assert.equal(story.messages.find(({ kind }) => kind === "code")?.markdown, "```python\nprint(\"刘老三\")\n```");
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
