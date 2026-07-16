import { runPythonRemotely } from "@/server/execution-client";
import { executeExercise, ExerciseServiceError } from "@/server/exercise-service";

const HTTP_BAD_REQUEST = 400;
const HTTP_SERVICE_UNAVAILABLE = 503;

const problem = (status: number, code: string, message: string): Response => Response.json(
  { status, code, message },
  { status, headers: { "content-type": "application/problem+json" } },
);

export const POST = async (request: Request): Promise<Response> => {
  try {
    const body = await request.json() as { exerciseId?: unknown; code?: unknown; stdin?: unknown };
    if (typeof body.exerciseId !== "string"
      || typeof body.code !== "string"
      || (body.stdin !== undefined && typeof body.stdin !== "string")) {
      return problem(HTTP_BAD_REQUEST, "INVALID_REQUEST", "exerciseId、code 和可选的 stdin 必须是字符串。");
    }
    return Response.json(await executeExercise(
      { exerciseId: body.exerciseId, code: body.code, stdin: body.stdin },
      runPythonRemotely,
    ));
  } catch (error) {
    if (error instanceof ExerciseServiceError) {
      return problem(error.status, error.code, error.message);
    }
    if (error instanceof SyntaxError) return problem(HTTP_BAD_REQUEST, "INVALID_JSON", "请求体不是有效 JSON。");
    return problem(HTTP_SERVICE_UNAVAILABLE, "EXECUTION_UNAVAILABLE", error instanceof Error ? error.message : "代码执行服务不可用。");
  }
};
