import assert from "node:assert/strict";
import test from "node:test";

import { createAiTutorSession } from "../../src/server/ai-tutor-service.ts";

const collect = async (chunks) => {
  let text = "";
  for await (const chunk of chunks) text += chunk;
  return text;
};

test("AI tutor derives tutor mode and forwards bounded learning context", async () => {
  let received;
  const session = createAiTutorSession({
    chapterNumber: 2,
    exerciseId: "chapter-02-final",
    question: "为什么这段代码报错？",
    code: "print(\"Hello, Python!\"",
    execution: { status: "error", message: "SyntaxError: 缺少右括号" },
    chapterCompleted: false,
  }, async function* provider(context) {
    received = context;
    yield "先定位错误，";
    yield "再自己补齐。";
  });

  assert.equal(session.mode, "tutor");
  assert.equal(await collect(session.chunks), "先定位错误，再自己补齐。");
  assert.equal(received.mode, "tutor");
  assert.equal(received.chapter.number, 2);
  assert.equal(received.code, "print(\"Hello, Python!\"");
  assert.equal(received.execution.message, "SyntaxError: 缺少右括号");
});

test("completed chapters enter collaboration mode with an explicit fake provider", async () => {
  const fakeProvider = async function* (context) {
    yield `协作模式：${context.question}`;
  };
  const session = createAiTutorSession({
    chapterNumber: 2,
    exerciseId: "chapter-02-final",
    question: "帮我扩展成带名字的欢迎语",
    code: "print(\"Hello, Python!\")",
    chapterCompleted: true,
  }, fakeProvider);

  assert.equal(session.mode, "collaborate");
  assert.match(await collect(session.chunks), /协作模式/);
});

test("AI tutor rejects invalid or mismatched learning context", () => {
  const valid = {
    chapterNumber: 2,
    exerciseId: "chapter-02-final",
    question: "给我一个提示",
    code: "print('hi')",
    chapterCompleted: false,
  };

  assert.throws(() => createAiTutorSession({ ...valid, question: "" }), /问题/);
  assert.throws(() => createAiTutorSession({ ...valid, exerciseId: "chapter-03-final" }), /章节不匹配/);
  assert.throws(() => createAiTutorSession({ ...valid, code: "x".repeat(20_001) }), /20,000/);
  assert.throws(() => createAiTutorSession({ ...valid, extra: true }), /未知字段/);
});
