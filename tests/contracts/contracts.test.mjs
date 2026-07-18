import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const openApiPath = new URL("../../contracts/openapi.yaml", import.meta.url);
const gameStatePath = new URL("../../contracts/game-state.schema.json", import.meta.url);

test("OpenAPI contract declares the published API boundary", async () => {
  const contract = JSON.parse(await readFile(openApiPath, "utf8"));
  const paths = contract.paths;

  assert.equal(contract.openapi, "3.1.0");
  assert.deepEqual(Object.keys(paths).sort(), [
    "/api/ai/tutor",
    "/api/chapters",
    "/api/chapters/{chapterNumber}",
    "/api/executions",
    "/api/health",
  ]);
  assert.equal(paths["/api/executions"].post.operationId, "executeExercise");
  assert.ok(paths["/api/executions"].post.responses["503"]);
});

test("AI tutor contract streams bounded chapter context without choosing a provider", async () => {
  const contract = JSON.parse(await readFile(openApiPath, "utf8"));
  const operation = contract.paths["/api/ai/tutor"].post;
  const request = contract.components.schemas.AiTutorRequest;
  const event = contract.components.schemas.AiTutorEvent;
  const eventReferences = event.oneOf.map((item) => item.$ref);

  assert.equal(operation.operationId, "streamAiTutorReply");
  assert.ok(operation.responses["200"].content["text/event-stream"]);
  assert.deepEqual(request.required.sort(), ["chapterCompleted", "chapterNumber", "code", "exerciseId", "question"]);
  assert.equal(request.properties.question.maxLength, 2_000);
  assert.equal(request.properties.code.maxLength, 20_000);
  assert.equal(request.additionalProperties, false);
  assert.deepEqual(eventReferences, [
    "#/components/schemas/AiTutorMetaEvent",
    "#/components/schemas/AiTutorDeltaEvent",
    "#/components/schemas/AiTutorDoneEvent",
    "#/components/schemas/AiTutorErrorEvent",
  ]);
  assert.deepEqual(contract.components.schemas.AiTutorMetaEvent.properties.mode.enum, ["tutor", "collaborate"]);
  assert.equal(contract.components.schemas.AiTutorDeltaEvent.properties.type.const, "delta");
});

test("execution responses expose every UI state required by the design contract", async () => {
  const contract = JSON.parse(await readFile(openApiPath, "utf8"));
  const result = contract.components.schemas.ExecutionResult;

  assert.deepEqual(result.properties.status.enum, ["passed", "failed", "error", "timeout"]);
  assert.deepEqual(result.required.sort(), [
    "durationMs",
    "message",
    "status",
    "stderr",
    "stdout",
    "testsPassed",
    "testsTotal",
  ]);
  assert.equal(result.properties.testsPassed.minimum, 0);
  assert.equal(result.properties.testsTotal.minimum, 1);
  assert.equal(result.additionalProperties, false);
});

test("chapter exercises publish only the number of assessment cases", async () => {
  const contract = JSON.parse(await readFile(openApiPath, "utf8"));
  const exercise = contract.components.schemas.Exercise;
  const chapter = contract.components.schemas.ChapterSummary;

  assert.ok(exercise.required.includes("testCount"));
  assert.equal(exercise.properties.testCount.minimum, 1);
  assert.equal(Object.hasOwn(exercise.properties, "hiddenTests"), false);
  assert.equal(Object.hasOwn(exercise.properties, "expectedOutput"), false);
  assert.equal(chapter.properties.dropItemIds.type, "array");
  assert.equal(chapter.properties.dropItemIds.uniqueItems, true);
});

test("execution requests support bounded source code and standard input", async () => {
  const contract = JSON.parse(await readFile(openApiPath, "utf8"));
  const request = contract.components.schemas.ExecutionRequest;

  assert.deepEqual(request.required.sort(), ["code", "exerciseId", "mode"]);
  assert.deepEqual(request.properties.mode.enum, ["practice", "formal"]);
  assert.equal(request.properties.code.maxLength, 20_000);
  assert.equal(request.properties.stdin.maxLength, 20_000);
});

test("local save contract is versioned and rejects unknown fields", async () => {
  const schema = JSON.parse(await readFile(gameStatePath, "utf8"));

  assert.equal(schema.properties.version.const, 4);
  assert.equal(schema.additionalProperties, false);
  assert.ok(schema.required.includes("achievements"));
  assert.equal(schema.properties.hero.additionalProperties, false);
  assert.equal(schema.properties.hero.properties.title.enum.length, 17);
  assert.ok(schema.properties.hero.properties.title.enum.includes(""));
  assert.equal(schema.properties.progress.properties.completedChapters.uniqueItems, true);
  assert.ok(schema.properties.progress.required.includes("hintsRevealed"));
  assert.ok(schema.properties.progress.required.includes("storyCheckpoints"));
  assert.equal(schema.properties.inventory.maxItems, 20);
  assert.equal(schema.properties.achievements.properties.unlockedTitles.items.enum.length, 16);
  assert.ok(schema.properties.achievements.properties.unlockedTitles.items.enum.includes("人工智能"));
  assert.deepEqual(schema.properties.settings.required, ["soundEnabled", "sfxVolume", "reducedMotion"]);
  assert.equal(schema.properties.settings.properties.sfxVolume.minimum, 0);
  assert.equal(schema.properties.settings.properties.sfxVolume.maximum, 1);
});
