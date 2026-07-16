import assert from "node:assert/strict";
import test from "node:test";

import { CHAPTERS } from "../../src/domain/chapter-catalog.ts";
import { getExerciseAssessment } from "../../src/server/exercise-assessments.ts";
import { executeExercise } from "../../src/server/exercise-service.ts";

test("every published exercise count matches a private server assessment", () => {
  for (const chapter of CHAPTERS) {
    assert.equal(getExerciseAssessment(chapter.exercise.id)?.length, chapter.exercise.testCount);
  }
});

test("exercise evaluation uses the private expected output", async () => {
  const result = await executeExercise(
    { exerciseId: "chapter-01-final", code: "print(input())", stdin: "我准备好了\n" },
    async (_code, stdin) => {
      assert.equal(stdin, "我准备好了\n");
      return { stdout: "我准备好了\n", stderr: "", durationMs: 12 };
    },
  );

  assert.equal(result.status, "passed");
  assert.equal(result.testsPassed, 1);
  assert.equal(result.testsTotal, 1);
});

test("Boss exercises aggregate private cases without leaking their data", async () => {
  const calls = [];
  const outputs = ["继续\n", "错误\n", "胜利\n"];
  const result = await executeExercise(
    { exerciseId: "chapter-05-final", code: "def battle_result(boss_hp):\n    return '胜利'" },
    async (code) => {
      calls.push(code);
      return { stdout: outputs[calls.length - 1], stderr: "", durationMs: 10 + calls.length };
    },
  );

  assert.equal(calls.length, 3);
  assert.equal(result.status, "failed");
  assert.equal(result.testsPassed, 2);
  assert.equal(result.testsTotal, 3);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");
  assert.match(result.message, /2\/3/);
  assert.equal(Object.hasOwn(result, "expectedOutput"), false);
  assert.equal(Object.hasOwn(result, "hiddenTests"), false);
});

test("unknown exercise ids are rejected before code is run", async () => {
  let called = false;

  await assert.rejects(
    executeExercise(
      { exerciseId: "chapter-99-final", code: "print('no')" },
      async () => {
        called = true;
        return { stdout: "", stderr: "", durationMs: 0 };
      },
    ),
    /练习不存在/,
  );
  assert.equal(called, false);
});

test("empty and oversized code are rejected", async () => {
  const runner = async () => ({ stdout: "", stderr: "", durationMs: 0 });

  await assert.rejects(executeExercise({ exerciseId: "chapter-01-final", code: "" }, runner), /不能为空/);
  await assert.rejects(executeExercise({ exerciseId: "chapter-01-final", code: "x".repeat(20_001) }, runner), /20,000/);
});
