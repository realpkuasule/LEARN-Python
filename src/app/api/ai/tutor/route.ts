import type { AiTutorEvent } from "@/domain/ai-tutor";
import { AiTutorServiceError, createAiTutorSession } from "@/server/ai-tutor-service";

const HTTP_BAD_REQUEST = 400;
const HTTP_SERVICE_UNAVAILABLE = 503;

const problem = (status: number, code: string, message: string): Response => Response.json(
  { status, code, message },
  { status, headers: { "content-type": "application/problem+json" } },
);

const encodeEvent = (event: AiTutorEvent): Uint8Array => new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);

export const POST = async (request: Request): Promise<Response> => {
  try {
    const session = createAiTutorSession(await request.json());
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(encodeEvent({ type: "meta", mode: session.mode }));
        try {
          for await (const content of session.chunks) controller.enqueue(encodeEvent({ type: "delta", content }));
          controller.enqueue(encodeEvent({ type: "done" }));
        } catch (error) {
          controller.enqueue(encodeEvent({
            type: "error",
            message: error instanceof Error ? error.message : "AI 魔法书暂时无法回应。",
          }));
        } finally {
          controller.close();
        }
      },
    });
    return new Response(stream, {
      headers: {
        "cache-control": "no-cache",
        "content-type": "text/event-stream; charset=utf-8",
      },
    });
  } catch (error) {
    if (error instanceof AiTutorServiceError) return problem(error.status, error.code, error.message);
    if (error instanceof SyntaxError) return problem(HTTP_BAD_REQUEST, "INVALID_JSON", "请求体不是有效 JSON。");
    return problem(
      HTTP_SERVICE_UNAVAILABLE,
      "AI_TUTOR_UNAVAILABLE",
      error instanceof Error ? error.message : "AI 魔法书暂时不可用。",
    );
  }
};
