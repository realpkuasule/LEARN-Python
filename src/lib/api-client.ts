import type { AiTutorEvent, AiTutorRequest } from "@/domain/ai-tutor";
import type { ExecutionResult } from "@/domain/execution";

interface ExecutionRequest {
  readonly exerciseId: string;
  readonly code: string;
  readonly mode: "practice" | "formal";
  readonly stdin?: string;
}

interface Problem {
  readonly message?: string;
}

const SSE_DATA_PREFIX = "data: ";

export const submitExecution = async (request: ExecutionRequest): Promise<ExecutionResult> => {
  const response = await fetch("/api/executions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });
  const payload = await response.json() as ExecutionResult | Problem;
  if (!response.ok) throw new Error(payload.message ?? "无法执行代码。");
  return payload as ExecutionResult;
};

export const streamAiTutorReply = async (
  request: AiTutorRequest,
  onEvent: (event: AiTutorEvent) => void,
  signal?: AbortSignal,
): Promise<void> => {
  const response = await fetch("/api/ai/tutor", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });
  if (!response.ok) {
    const payload = await response.json() as Problem;
    throw new Error(payload.message ?? "AI 魔法书暂时无法回应。");
  }
  if (!response.body) throw new Error("浏览器无法读取 AI 魔法书的流式回应。");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";
    for (const block of blocks) {
      const data = block
        .split("\n")
        .filter((line) => line.startsWith(SSE_DATA_PREFIX))
        .map((line) => line.slice(SSE_DATA_PREFIX.length))
        .join("\n");
      if (!data) continue;
      const event = JSON.parse(data) as AiTutorEvent;
      if (!event || !["meta", "delta", "done", "error"].includes(event.type)) {
        throw new Error("AI 魔法书返回了无法识别的消息。");
      }
      onEvent(event);
      if (event.type === "error") throw new Error(event.message);
    }
    if (done) break;
  }
};
