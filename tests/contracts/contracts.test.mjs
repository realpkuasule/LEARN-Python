import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const openApiPath = new URL("../../contracts/openapi.yaml", import.meta.url);
const gameStatePath = new URL("../../contracts/game-state.schema.json", import.meta.url);

test("OpenAPI contract declares the complete Phase 1 boundary", async () => {
  const contract = JSON.parse(await readFile(openApiPath, "utf8"));
  const paths = contract.paths;

  assert.equal(contract.openapi, "3.1.0");
  assert.deepEqual(Object.keys(paths).sort(), [
    "/api/chapters",
    "/api/chapters/{chapterNumber}",
    "/api/executions",
    "/api/health",
  ]);
  assert.equal(paths["/api/executions"].post.operationId, "executeExercise");
  assert.ok(paths["/api/executions"].post.responses["503"]);
});

test("execution responses expose every UI state required by the design contract", async () => {
  const contract = JSON.parse(await readFile(openApiPath, "utf8"));
  const result = contract.components.schemas.ExecutionResult;

  assert.deepEqual(result.properties.status.enum, ["passed", "failed", "error", "timeout"]);
  assert.deepEqual(result.required.sort(), ["durationMs", "message", "status", "stderr", "stdout"]);
  assert.equal(result.additionalProperties, false);
});

test("execution requests support bounded source code and standard input", async () => {
  const contract = JSON.parse(await readFile(openApiPath, "utf8"));
  const request = contract.components.schemas.ExecutionRequest;

  assert.equal(request.properties.code.maxLength, 20_000);
  assert.equal(request.properties.stdin.maxLength, 20_000);
});

test("local save contract is versioned and rejects unknown fields", async () => {
  const schema = JSON.parse(await readFile(gameStatePath, "utf8"));

  assert.equal(schema.properties.version.const, 1);
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.hero.additionalProperties, false);
  assert.equal(schema.properties.progress.properties.completedChapters.uniqueItems, true);
});
