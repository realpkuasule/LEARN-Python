import { createServer } from "node:http";

import { env } from "../../src/lib/env.ts";
import { runPython } from "./runner.mjs";

const HOST = env.executionHost;
const PORT = env.executionPort;
const MAX_BODY_BYTES = 128_000;
const MAX_INPUT_LENGTH = 20_000;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_PAYLOAD_TOO_LARGE = 413;
const HTTP_INTERNAL_ERROR = 500;

const sendJson = (response, status, payload) => {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
};

const readJson = async (request) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error("REQUEST_TOO_LARGE");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

const server = createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, { status: "ready" });
    return;
  }
  if (request.method !== "POST" || request.url !== "/execute") {
    sendJson(response, HTTP_NOT_FOUND, { message: "Not found" });
    return;
  }

  try {
    const payload = await readJson(request);
    if (typeof payload.code !== "string"
      || !payload.code.trim()
      || (payload.stdin !== undefined && typeof payload.stdin !== "string")) {
      sendJson(response, HTTP_BAD_REQUEST, { message: "code must be a non-empty string" });
      return;
    }
    if (payload.code.length > MAX_INPUT_LENGTH || (payload.stdin?.length ?? 0) > MAX_INPUT_LENGTH) {
      sendJson(response, HTTP_PAYLOAD_TOO_LARGE, { message: "code and stdin are limited to 20,000 characters" });
      return;
    }
    sendJson(response, 200, await runPython(payload.code, { stdin: payload.stdin }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Execution service error";
    sendJson(response, message === "REQUEST_TOO_LARGE" ? HTTP_PAYLOAD_TOO_LARGE : HTTP_INTERNAL_ERROR, { message });
  }
});

server.listen(PORT, HOST, () => {
  process.stdout.write(`Execution service ready at http://${HOST}:${PORT}\n`);
});
