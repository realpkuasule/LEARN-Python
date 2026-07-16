import type { RunnerResult } from "../domain/execution.ts";
import { env } from "../lib/env.ts";

const REQUEST_TIMEOUT_MS = 12_000;
const HEALTH_TIMEOUT_MS = 1_500;

export const checkExecutionService = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${env.executionServiceUrl}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const runPythonRemotely = async (code: string, stdin?: string): Promise<RunnerResult> => {
  let response: Response;
  try {
    response = await fetch(`${env.executionServiceUrl}/execute`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, stdin }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new Error("代码执行服务不可用。请先运行 npm run execution:start。", { cause: error });
  }
  if (!response.ok) throw new Error("代码执行服务拒绝了本次请求。");
  return response.json() as Promise<RunnerResult>;
};
