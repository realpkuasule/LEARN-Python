import { getExercise } from "../domain/chapter-catalog.ts";
import { evaluateExecution, evaluatePracticeExecution, type ExecutionResult, type RunnerResult } from "../domain/execution.ts";
import { getExerciseAssessment } from "./exercise-assessments.ts";

const MAX_CODE_LENGTH = 20_000;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_PAYLOAD_TOO_LARGE = 413;

export interface ExecutionInput {
  readonly exerciseId: string;
  readonly code: string;
  readonly mode?: "practice" | "formal";
  readonly stdin?: string;
}

export type PythonRunner = (code: string, stdin?: string) => Promise<RunnerResult>;

const aggregateHiddenTests = (results: readonly ExecutionResult[]): ExecutionResult => {
  const testsPassed = results.filter(({ status }) => status === "passed").length;
  const status = results.some((result) => result.status === "timeout")
    ? "timeout"
    : results.some((result) => result.status === "error")
      ? "error"
      : testsPassed === results.length ? "passed" : "failed";
  const messages: Readonly<Record<ExecutionResult["status"], string>> = {
    passed: `${testsPassed}/${results.length} 组隐藏测试通过，Boss 已被击败，奖励已结算。`,
    failed: `${testsPassed}/${results.length} 组隐藏测试通过，继续检查条件边界。`,
    error: `${testsPassed}/${results.length} 组隐藏测试通过；Python 在其余测试中报错。`,
    timeout: `${testsPassed}/${results.length} 组隐藏测试通过；其余测试运行超时。`,
  };

  return {
    status,
    stdout: "",
    stderr: "",
    durationMs: Math.max(...results.map(({ durationMs }) => durationMs)),
    message: messages[status],
    testsPassed,
    testsTotal: results.length,
  };
};

export class ExerciseServiceError extends Error {
  public readonly status: number;
  public readonly code: string;

  public constructor(
    message: string,
    status: number,
    code: string,
  ) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const executeExercise = async (
  input: ExecutionInput,
  runPython: PythonRunner,
): Promise<ExecutionResult> => {
  const exercise = getExercise(input.exerciseId);
  if (!exercise) throw new ExerciseServiceError("练习不存在。", HTTP_NOT_FOUND, "EXERCISE_NOT_FOUND");
  const assessments = getExerciseAssessment(input.exerciseId);
  if (!assessments) throw new Error("练习缺少服务端评测契约。");
  if (!input.code.trim()) throw new ExerciseServiceError("代码不能为空。", HTTP_BAD_REQUEST, "EMPTY_CODE");
  if (input.code.length > MAX_CODE_LENGTH) {
    throw new ExerciseServiceError("代码不能超过 20,000 个字符。", HTTP_PAYLOAD_TOO_LARGE, "CODE_TOO_LARGE");
  }
  if ((input.stdin?.length ?? 0) > MAX_CODE_LENGTH) {
    throw new ExerciseServiceError("标准输入不能超过 20,000 个字符。", HTTP_PAYLOAD_TOO_LARGE, "STDIN_TOO_LARGE");
  }

  if (input.mode === "practice") return evaluatePracticeExecution(await runPython(input.code, input.stdin));

  if (assessments.length === 1) {
    return evaluateExecution(await runPython(input.code, input.stdin), assessments[0].expectedOutput);
  }

  const results = await Promise.all(assessments.map(async (assessment) => evaluateExecution(
    await runPython(`${input.code}\n\n${assessment.codeSuffix ?? ""}`, input.stdin),
    assessment.expectedOutput,
  )));
  return aggregateHiddenTests(results);
};
