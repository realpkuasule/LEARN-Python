import assert from "node:assert/strict";
import test from "node:test";

import { evaluateExecution, normalizeOutput } from "../../src/domain/execution.ts";

test("output normalization ignores platform newlines and trailing whitespace", () => {
  assert.equal(normalizeOutput("勇者\r\n胜利  \r\n"), "勇者\n胜利");
});

test("evaluation distinguishes pass, mismatch, runtime error, and timeout", () => {
  assert.equal(evaluateExecution({ stdout: "42\n", stderr: "", durationMs: 12 }, "42").status, "passed");
  assert.equal(evaluateExecution({ stdout: "41", stderr: "", durationMs: 12 }, "42").status, "failed");
  assert.equal(evaluateExecution({ stdout: "", stderr: "NameError", durationMs: 12 }, "42").status, "error");
  assert.equal(evaluateExecution({ stdout: "", stderr: "", durationMs: 10_000, timedOut: true }, "42").status, "timeout");
});
