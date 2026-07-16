import assert from "node:assert/strict";
import test from "node:test";

import { executeExercise } from "../../src/server/exercise-service.ts";

test("exercise evaluation uses the private expected output", async () => {
  const result = await executeExercise(
    { exerciseId: "chapter-01-final", code: "print(input())", stdin: "我准备好了\n" },
    async (_code, stdin) => {
      assert.equal(stdin, "我准备好了\n");
      return { stdout: "我准备好了\n", stderr: "", durationMs: 12 };
    },
  );

  assert.equal(result.status, "passed");
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
