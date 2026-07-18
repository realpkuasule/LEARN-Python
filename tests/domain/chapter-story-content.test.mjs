import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { CHAPTERS } from "../../src/domain/chapter-catalog.ts";
import {
  buildChapterStory,
  storyCheckpointSatisfied,
  storyMessageText,
  storyMessageUsesTypewriter,
  storyProgressLimit,
  storyRunMode,
} from "../../src/domain/chapter-story.ts";

const SATISFYING_RESULTS = {
  run: { status: "failed", stdout: "" },
  success: { status: "passed", stdout: "" },
  output: { status: "failed", stdout: "练习输出\n" },
  error: { status: "error", stdout: "" },
  pass: { status: "passed", stdout: "" },
};

test("practice checkpoints reuse only code authored in their own exercise section", () => {
  const story = buildChapterStory({
    number: 6,
    title: "for 循环",
    markdown: [
      "### 练习一：修正 range",
      "",
      "```python",
      "for turn in range(1, 9):",
      "    print(turn)",
      "```",
      "",
      "[实践检查点: exercise-1/output]",
      "修正后运行。",
      "",
      "**练习 2（进阶）**：自行编写循环。",
      "",
      "[实践检查点: exercise-2/output]",
      "运行新循环。",
      "",
      "### Boss 终局挑战",
      "",
      "[实践检查点: final-challenge/pass]",
      "通过正式评测。",
    ].join("\n"),
  });

  assert.deepEqual(story.messages.flatMap(({ checkpoint }) => checkpoint ? [checkpoint.starterCode] : []), [
    "for turn in range(1, 9):\n    print(turn)\n",
    undefined,
    undefined,
  ]);
});

test("all published chapters satisfy the playable story contract", async () => {
  const requirementCounts = {};
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
    const explicitDialogueCount = [...markdown.matchAll(/^(?:\[|【)(?:英雄|友善NPC|中立NPC|敌对NPC)(?:(?:\s*[:：]\s*)[^\]】]+)?(?:\]|】)\s*/gm)].length;
    assert.equal(dialogue.length, explicitDialogueCount, `chapter ${chapter.number} explicitly authors every dialogue beat`);
    assert.ok(dialogue.length >= 3, `chapter ${chapter.number} has at least three dialogue beats`);
    assert.ok(new Set(dialogue.map(({ role }) => role)).size >= 2, `chapter ${chapter.number} uses at least two character voices`);
    assert.ok(dialogue.some(({ role }) => role === "hero"), `chapter ${chapter.number} gives the hero a voice`);
    assert.ok(dialogue.some(({ role }) => role !== "hero"), `chapter ${chapter.number} gives another character a voice`);

    const longMessage = story.messages
      .filter(storyMessageUsesTypewriter)
      .find(({ markdown: messageMarkdown }) => storyMessageText(messageMarkdown).length > 240);
    assert.equal(longMessage, undefined, `chapter ${chapter.number} keeps every typewriter message within 240 characters`);

    const checkpoints = story.messages.flatMap(({ checkpoint, section }) => checkpoint ? [{ ...checkpoint, section }] : []);
    for (const { requirement } of checkpoints) requirementCounts[requirement] = (requirementCounts[requirement] ?? 0) + 1;
    assert.equal(new Set(checkpoints.map(({ id }) => id)).size, checkpoints.length, `chapter ${chapter.number} checkpoint ids are unique`);
    assert.ok(checkpoints.every(({ section }) => section === "body"), `chapter ${chapter.number} keeps checkpoints before recap`);
    assert.deepEqual(
      checkpoints.map(({ id }) => id),
      chapter.number === 2
        ? ["first-run", "multi-line-output", "comma-output", "syntax-error", "final-challenge"]
        : ["exercise-1", "exercise-2", "exercise-3", "final-challenge"],
      `chapter ${chapter.number} gates every authored exercise in order`,
    );
    assert.deepEqual(checkpoints.at(-1), {
      id: "final-challenge",
      requirement: "pass",
      instruction: checkpoints.at(-1)?.instruction,
      section: "body",
    }, `chapter ${chapter.number} ends with a formal challenge`);

    if (chapter.number === 2) {
      assert.deepEqual(story.messages.flatMap(({ checkpoint }) => checkpoint ? [[checkpoint.id, checkpoint.requirement]] : []), [
        ["first-run", "success"],
        ["multi-line-output", "output"],
        ["comma-output", "output"],
        ["syntax-error", "error"],
        ["final-challenge", "pass"],
      ]);
    }
  }

  assert.deepEqual(requirementCounts, { confirm: 3, pass: 17, success: 6, output: 41, error: 2 });
});

test("every chapter can advance through each gate to its recap", async () => {
  for (const chapter of CHAPTERS) {
    const markdown = await readFile(new URL(`../../${chapter.sourcePath}`, import.meta.url), "utf8");
    const story = buildChapterStory({ ...chapter, markdown });
    const completed = [];
    const checkpointMessages = story.messages.filter(({ checkpoint }) => checkpoint);

    for (const message of checkpointMessages) {
      const checkpoint = message.checkpoint;
      assert.equal(storyProgressLimit(story.messages, completed, false), story.messages.indexOf(message), `chapter ${chapter.number} stops at ${checkpoint.id}`);
      assert.equal(storyRunMode(true, checkpoint), checkpoint.requirement === "confirm" ? "locked" : checkpoint.requirement === "pass" ? "formal" : "practice");
      if (checkpoint.requirement !== "confirm") {
        assert.equal(storyCheckpointSatisfied(checkpoint.requirement, SATISFYING_RESULTS[checkpoint.requirement]), true, `chapter ${chapter.number} can satisfy ${checkpoint.id}`);
      }
      completed.push(checkpoint.id);
    }

    assert.equal(storyProgressLimit(story.messages, completed, false), story.messages.length, `chapter ${chapter.number} reaches recap`);
  }
});
