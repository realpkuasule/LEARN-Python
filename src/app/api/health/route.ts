import { checkExecutionService } from "@/server/execution-client";

export const dynamic = "force-dynamic";

export const GET = async (): Promise<Response> => {
  const executionService = await checkExecutionService() ? "ready" : "unavailable";
  return Response.json({
    status: executionService === "ready" ? "ok" : "degraded",
    executionService,
  });
};
