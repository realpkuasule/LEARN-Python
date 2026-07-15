import type { ExecutionResult } from "@/domain/execution";

interface ExecutionRequest {
  readonly exerciseId: string;
  readonly code: string;
  readonly stdin?: string;
}

interface Problem {
  readonly message?: string;
}

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
