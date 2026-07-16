export interface RunnerResult {
  readonly stdout: string;
  readonly stderr: string;
  readonly durationMs: number;
  readonly timedOut?: boolean;
}

export interface ExecutionResult {
  readonly status: "passed" | "failed" | "error" | "timeout";
  readonly stdout: string;
  readonly stderr: string;
  readonly durationMs: number;
  readonly message: string;
  readonly testsPassed: number;
  readonly testsTotal: number;
}

export const normalizeOutput = (output: string): string => (
  output
    .replaceAll("\r\n", "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trimEnd()
);

export const evaluateExecution = (run: RunnerResult, expectedOutput: string): ExecutionResult => {
  if (run.timedOut) {
    return { ...run, status: "timeout", message: "代码运行超时，检查循环是否有出口。", testsPassed: 0, testsTotal: 1 };
  }
  if (run.stderr) {
    return { ...run, status: "error", message: "Python 报错了，根据错误类型和行号继续排查。", testsPassed: 0, testsTotal: 1 };
  }
  if (normalizeOutput(run.stdout) !== normalizeOutput(expectedOutput)) {
    return { ...run, status: "failed", message: "代码已运行，但输出还没有符合任务契约。", testsPassed: 0, testsTotal: 1 };
  }
  return { ...run, status: "passed", message: "挑战通过，奖励已结算。", testsPassed: 1, testsTotal: 1 };
};
