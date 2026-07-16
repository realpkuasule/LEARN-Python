import assert from "node:assert/strict";
import test from "node:test";

import { buildDockerArgs } from "../../services/execution/runner.mjs";

test("Python runs in a disposable, networkless, resource-limited container", () => {
  const args = buildDockerArgs("print(input())");

  assert.deepEqual(args.slice(0, 2), ["run", "--rm"]);
  assert.ok(args.includes("--interactive"));
  assert.ok(args.includes("none"));
  assert.ok(args.includes("256m"));
  assert.ok(args.includes("65534:65534"));
  assert.ok(args.includes("0.5"));
  assert.ok(args.includes("ALL"));
  assert.ok(args.includes("no-new-privileges"));
  assert.ok(args.includes("nofile=64:64"));
  assert.ok(args.includes("/tmp:rw,noexec,nosuid,nodev,size=16m,mode=1777"));
  assert.deepEqual(args.slice(-5), ["python:3.12-alpine", "python", "-I", "-c", "print(input())"]);
});
