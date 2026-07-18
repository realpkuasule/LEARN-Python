import assert from "node:assert/strict";
import test from "node:test";

import { createDeepSeekAiTutorProvider } from "../../src/server/deepseek-ai-tutor-provider.ts";

const context = {
  chapterNumber: 2,
  exerciseId: "chapter-02-final",
  question: "为什么这段代码报错？",
  code: "print(\"Hello, Python!\"",
  execution: { status: "error", message: "SyntaxError: 缺少右括号" },
  chapterCompleted: false,
  mode: "tutor",
  chapter: { number: 2, title: "第一个 Python 程序" },
  exercise: {
    id: "chapter-02-final",
    title: "第一行 Python",
    instructions: "使用 print 输出 Hello, Python!",
  },
};

const collect = async (chunks) => {
  let text = "";
  for await (const chunk of chunks) text += chunk;
  return text;
};

test("DeepSeek tutor streams v4 flash replies with bounded course context", async () => {
  let request;
  const provider = createDeepSeekAiTutorProvider({
    apiKey: "test-key",
    fetcher: async (url, init) => {
      request = { url, init, body: JSON.parse(init.body) };
      return new Response([
        'data: {"choices":[{"delta":{"content":"先定位"}}]}',
        "",
        'data: {"choices":[{"delta":{"content":"右括号。"}}]}',
        "",
        "data: [DONE]",
        "",
      ].join("\n"), { headers: { "content-type": "text/event-stream" } });
    },
  });

  assert.equal(await collect(provider(context)), "先定位右括号。");
  assert.equal(request.url, "https://api.deepseek.com/chat/completions");
  assert.equal(request.init.headers.authorization, "Bearer test-key");
  assert.equal(request.body.model, "deepseek-v4-flash");
  assert.equal(request.body.stream, true);
  assert.deepEqual(request.body.thinking, { type: "disabled" });
  assert.match(request.body.messages[0].content, /辅导模式/);
  assert.match(request.body.messages[1].content, /为什么这段代码报错/);
  assert.match(request.body.messages[1].content, /SyntaxError: 缺少右括号/);
});

test("DeepSeek tutor exposes provider errors without returning a fake answer", async () => {
  const provider = createDeepSeekAiTutorProvider({
    apiKey: "test-key",
    fetcher: async () => Response.json(
      { error: { message: "Insufficient Balance" } },
      { status: 402 },
    ),
  });

  await assert.rejects(collect(provider(context)), /DeepSeek API 请求失败（402）：Insufficient Balance/);
});
